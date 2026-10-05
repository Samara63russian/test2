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

COUNTRY_TO_GEO = {
    "CH": "ch",
    "LI": "ch",
    "NL": "nl",
    "BE": "be",
}

EXE_FILES = {
    ("ch", "de"): "leitfaden-de.exe",
    ("ch", "fr"): "guide-fr.exe",
    ("ch", "it"): "guida-it.exe",
    ("nl", "nl"): "gids-nl.exe",
    ("be", "nl"): "gids-be-nl.exe",
    ("be", "fr"): "guide-be-fr.exe",
}

GEO_LABELS = {
    "ch": "🇨🇭 Schweiz",
    "nl": "🇳🇱 Nederland",
    "be": "🇧🇪 België",
}

app = Flask(__name__)
app.secret_key = os.environ.get("ADMIN_SECRET_KEY", secrets.token_hex(32))
app.config["MAX_CONTENT_LENGTH"] = 100 * 1024 * 1024


def ensure_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(DB_PATH)
    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS visits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            ip TEXT,
            user_agent TEXT,
            lang TEXT,
            geo TEXT,
            referrer TEXT,
            event_type TEXT NOT NULL DEFAULT 'pageview',
            path TEXT
        );
        """
    )
    try:
        db.execute("ALTER TABLE visits ADD COLUMN geo TEXT")
    except sqlite3.OperationalError:
        pass
    db.commit()
    db.close()


def get_db():
    ensure_db()
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(_exc):
    db = g.pop("db", None)
    if db is not None:
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


def log_visit(event_type="pageview", lang=None, geo=None, path=None):
    db = get_db()
    db.execute(
        """
        INSERT INTO visits (created_at, ip, user_agent, lang, geo, referrer, event_type, path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            datetime.now(timezone.utc).isoformat(),
            client_ip(),
            request.headers.get("User-Agent", "")[:500],
            lang,
            geo,
            request.headers.get("Referer", "")[:500],
            event_type,
            path,
        ),
    )
    db.commit()


@app.route("/api/geo")
def geo_api():
    country = (request.headers.get("CF-IPCountry") or "").upper()
    geo = COUNTRY_TO_GEO.get(country, "ch")
    return jsonify({"country": country or None, "geo": geo})


@app.route("/api/track", methods=["POST"])
def track():
    data = request.get_json(silent=True) or {}
    event_type = data.get("event", "pageview")
    if event_type not in {"pageview", "download"}:
        event_type = "pageview"
    lang = data.get("lang")
    geo = data.get("geo")
    path = data.get("path")
    log_visit(event_type=event_type, lang=lang, geo=geo, path=path)
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
        SELECT id, created_at, ip, user_agent, lang, geo, referrer, event_type, path
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

    file_info = {}
    for key, filename in EXE_FILES.items():
        geo, lang = key
        path = DOWNLOADS_DIR / filename
        file_info[key] = {
            "geo": geo,
            "lang": lang,
            "label": GEO_LABELS.get(geo, geo),
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
        file_info=file_info,
        page=page,
        pages=pages,
        total=total,
    )


@app.route("/admin/upload", methods=["POST"])
@login_required
def admin_upload():
    geo = request.form.get("geo", "ch")
    lang = request.form.get("lang", "de")
    key = (geo, lang)
    if key not in EXE_FILES:
        flash("Неверная страна или язык", "error")
        return redirect(url_for("admin_dashboard"))

    file = request.files.get("exe")
    if not file or not file.filename:
        flash("Файл не выбран", "error")
        return redirect(url_for("admin_dashboard"))

    if not file.filename.lower().endswith(".exe"):
        flash("Только EXE файлы", "error")
        return redirect(url_for("admin_dashboard"))

    DOWNLOADS_DIR.mkdir(parents=True, exist_ok=True)
    dest = DOWNLOADS_DIR / EXE_FILES[key]
    file.save(dest)
    flash(
        f"EXE для {GEO_LABELS.get(geo, geo)} / {lang.upper()} загружен: {EXE_FILES[key]}",
        "success",
    )
    return redirect(url_for("admin_dashboard"))


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    app.run(host="127.0.0.1", port=port, debug=False)
