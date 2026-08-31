from __future__ import annotations

import hashlib
import hmac
import json
import os
import secrets
import sqlite3
from contextlib import contextmanager
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any, Iterator


DEFAULT_DB_PATH = Path(__file__).resolve().parent.parent / "data" / "reporting.db"
DB_PATH = Path(os.getenv("REPORTING_DB_PATH", DEFAULT_DB_PATH))
PBKDF2_ITERATIONS = 310_000


def utc_now() -> str:
    return datetime.now(UTC).isoformat()


def connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH, timeout=30)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    connection.execute("PRAGMA journal_mode = WAL")
    return connection


@contextmanager
def db() -> Iterator[sqlite3.Connection]:
    connection = connect()
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def row_to_dict(row: sqlite3.Row | None) -> dict[str, Any] | None:
    return dict(row) if row is not None else None


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS
    )
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        algorithm, iterations, salt_hex, digest_hex = stored.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        candidate = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            bytes.fromhex(salt_hex),
            int(iterations),
        )
        return hmac.compare_digest(candidate.hex(), digest_hex)
    except (TypeError, ValueError):
        return False


def create_session(connection: sqlite3.Connection, user_id: int) -> str:
    token = secrets.token_urlsafe(48)
    expires_at = (datetime.now(UTC) + timedelta(days=30)).isoformat()
    connection.execute(
        "DELETE FROM sessions WHERE expires_at < ?", (utc_now(),)
    )
    connection.execute(
        "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
        (token, user_id, expires_at),
    )
    return token


SCHEMA = """
CREATE TABLE IF NOT EXISTS institutions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    contact_name TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL COLLATE NOCASE UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'operator', 'viewer')),
    institution_id INTEGER REFERENCES institutions(id),
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    help_text TEXT NOT NULL DEFAULT '',
    answer_type TEXT NOT NULL CHECK (
        answer_type IN ('text', 'textarea', 'number', 'yes_no', 'select', 'date')
    ),
    options TEXT NOT NULL DEFAULT '[]',
    required INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_uid TEXT UNIQUE,
    institution_id INTEGER NOT NULL REFERENCES institutions(id),
    report_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted'
        CHECK (status IN ('draft', 'submitted')),
    notes TEXT NOT NULL DEFAULT '',
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id),
    value TEXT NOT NULL DEFAULT '',
    UNIQUE(report_id, question_id)
);

CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(report_date);
CREATE INDEX IF NOT EXISTS idx_reports_institution ON reports(institution_id);
CREATE INDEX IF NOT EXISTS idx_answers_report ON answers(report_id);
"""


DEFAULT_QUESTIONS = [
    (
        "Количество обслуженных граждан за день",
        "Укажите общее количество обращений",
        "number",
        [],
        1,
        10,
    ),
    (
        "Есть ли нештатные ситуации?",
        "При ответе «Да» опишите ситуацию в примечании",
        "yes_no",
        [],
        1,
        20,
    ),
    (
        "Краткие итоги работы",
        "Основные результаты и важные события",
        "textarea",
        [],
        1,
        30,
    ),
    (
        "Потребность в дополнительной поддержке",
        "",
        "select",
        ["Нет", "Кадровая", "Техническая", "Методическая", "Другая"],
        0,
        40,
    ),
]


def init_db() -> None:
    with db() as connection:
        connection.executescript(SCHEMA)

        institution_count = connection.execute(
            "SELECT COUNT(*) FROM institutions"
        ).fetchone()[0]
        if institution_count == 0:
            connection.execute(
                """
                INSERT INTO institutions
                    (name, short_name, address, contact_name, phone, email, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    "Демонстрационное учреждение",
                    "Демо",
                    "г. Самара",
                    "Ответственный сотрудник",
                    "+7 (000) 000-00-00",
                    "demo@example.ru",
                    utc_now(),
                ),
            )

        user_count = connection.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        if user_count == 0:
            initial_password = os.getenv("INITIAL_ADMIN_PASSWORD", "Admin123!")
            connection.execute(
                """
                INSERT INTO users
                    (username, password_hash, full_name, role, active, created_at)
                VALUES (?, ?, ?, 'admin', 1, ?)
                """,
                (
                    os.getenv("INITIAL_ADMIN_USERNAME", "admin"),
                    hash_password(initial_password),
                    "Администратор системы",
                    utc_now(),
                ),
            )

        question_count = connection.execute(
            "SELECT COUNT(*) FROM questions"
        ).fetchone()[0]
        if question_count == 0:
            connection.executemany(
                """
                INSERT INTO questions
                    (text, help_text, answer_type, options, required, sort_order, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    (
                        text,
                        help_text,
                        answer_type,
                        json.dumps(options, ensure_ascii=False),
                        required,
                        sort_order,
                        utc_now(),
                    )
                    for (
                        text,
                        help_text,
                        answer_type,
                        options,
                        required,
                        sort_order,
                    ) in DEFAULT_QUESTIONS
                ],
            )
