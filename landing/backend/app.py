import os
import secrets
import sqlite3
from datetime import datetime, timezone
from functools import wraps
from pathlib import Path

from flask import (
    Flask,
    flash,
    g,
    jsonify,
    redirect,
    render_template,
    request,
    session,
    url_for,
)
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

BASE_DIR = Path(__file__).resolve().parent
LANDING_DIR = BASE_DIR.parent
DOWNLOADS_DIR = LANDING_DIR / "downloads"
DB_PATH = BASE_DIR / "data" / "analytics.db"

PDF_FILES = {
    "de": "leitfaden-de.pdf",
    "fr": "guide-fr.pdf",
    "it": "guida-it.pdf",
}

app = Flask(__name__)
app.secret_key = os.environ.get("ADMIN_SECRET_KEY", secrets.token_hex(32))
app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024


def get_db():
    if "db" not in g:
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(_exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    db = sqlite3.connect(DB_PATH)
    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS visits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            ip TEXT,
            user_agent TEXT,
            lang TEXT,
            referrer TEXT,
            event_type TEXT NOT NULL DEFAULT 'pageview',
            path TEXT
        );
        """
    )
    db.commit()
    db.close()


_cached_password_hash = None


def admin_password_hash():
    global _cached_password_hash
    stored = os.environ.get("ADMIN_PASSWORD_HASH")
    if stored:
        return stored
    if _cached_password_hash is None:
        plain = os.environ.get("ADMIN_PASSWORD", "admin123")
        _cached_password_hash = generate_password_hash(plain)
    return _cached_password_hash


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("admin_logged_in"):
            return redirect(url_for("admin_login"))
        return view(*args, **kwargs)

    return wrapped


def client_ip():
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.remote_addr or ""


def log_visit(event_type="pageview", lang=None, path=None):
    db = get_db()
    db.execute(
        """
        INSERT INTO visits (created_at, ip, user_agent, lang, referrer, event_type, path)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            datetime.now(timezone.utc).isoformat(),
            client_ip(),
            request.headers.get("User-Agent", "")[:500],
            lang,
            request.headers.get("Referer", "")[:500],
            event_type,
            path,
        ),
    )
    db.commit()


@app.route("/api/track", methods=["POST"])
def track():
    data = request.get_json(silent=True) or {}
    event_type = data.get("event", "pageview")
    if event_type not in {"pageview", "download"}:
        event_type = "pageview"
    lang = data.get("lang")
    path = data.get("path")
    log_visit(event_type=event_type, lang=lang, path=path)
    return jsonify({"ok": True})


@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if session.get("admin_logged_in"):
        return redirect(url_for("admin_dashboard"))

    if request.method == "POST":
        password = request.form.get("password", "")
        if check_password_hash(admin_password_hash(), password):
            session["admin_logged_in"] = True
            session.permanent = True
            return redirect(url_for("admin_dashboard"))
        flash("Неверный пароль", "error")

    return render_template("admin/login.html")


@app.route("/admin/logout")
def admin_logout():
    session.clear()
    return redirect(url_for("admin_login"))


@app.route("/admin")
@login_required
def admin_dashboard():
    db = get_db()
    page = max(int(request.args.get("page", 1)), 1)
    per_page = 50
    offset = (page - 1) * per_page

    total = db.execute("SELECT COUNT(*) AS c FROM visits").fetchone()["c"]
    visits = db.execute(
        """
        SELECT id, created_at, ip, user_agent, lang, referrer, event_type, path
        FROM visits
        ORDER BY id DESC
        LIMIT ? OFFSET ?
        """,
        (per_page, offset),
    ).fetchall()

    stats = db.execute(
        """
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN event_type = 'pageview' THEN 1 ELSE 0 END) AS pageviews,
            SUM(CASE WHEN event_type = 'download' THEN 1 ELSE 0 END) AS downloads
        FROM visits
        """
    ).fetchone()

    pdf_info = {}
    for lang, filename in PDF_FILES.items():
        path = DOWNLOADS_DIR / filename
        pdf_info[lang] = {
            "filename": filename,
            "exists": path.exists(),
            "size_kb": round(path.stat().st_size / 1024, 1) if path.exists() else 0,
            "modified": datetime.fromtimestamp(path.stat().st_mtime).strftime("%d.%m.%Y %H:%M")
            if path.exists()
            else "—",
        }

    pages = max((total + per_page - 1) // per_page, 1)

    return render_template(
        "admin/dashboard.html",
        visits=visits,
        stats=stats,
        pdf_info=pdf_info,
        page=page,
        pages=pages,
        total=total,
    )


@app.route("/admin/upload", methods=["POST"])
@login_required
def admin_upload():
    lang = request.form.get("lang")
    if lang not in PDF_FILES:
        flash("Неверный язык", "error")
        return redirect(url_for("admin_dashboard"))

    file = request.files.get("pdf")
    if not file or not file.filename:
        flash("Файл не выбран", "error")
        return redirect(url_for("admin_dashboard"))

    if not file.filename.lower().endswith(".pdf"):
        flash("Только PDF файлы", "error")
        return redirect(url_for("admin_dashboard"))

    DOWNLOADS_DIR.mkdir(parents=True, exist_ok=True)
    dest = DOWNLOADS_DIR / PDF_FILES[lang]
    file.save(dest)
    flash(f"PDF для {lang.upper()} загружен: {PDF_FILES[lang]}", "success")
    return redirect(url_for("admin_dashboard"))


init_db()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    app.run(host="127.0.0.1", port=port, debug=False)
