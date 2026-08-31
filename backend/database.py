from __future__ import annotations

import hashlib
import json
import os
import secrets
import sqlite3
from contextlib import contextmanager
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Iterator


BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = Path(os.getenv("DATABASE_PATH", BASE_DIR / "data" / "reports.db"))


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


@contextmanager
def connection() -> Iterator[sqlite3.Connection]:
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(DATABASE_PATH)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys = ON")
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def row_to_dict(row: sqlite3.Row | None) -> dict[str, Any] | None:
    return dict(row) if row else None


def hash_password(password: str, salt: str | None = None) -> tuple[str, str]:
    password_salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        bytes.fromhex(password_salt),
        310_000,
    ).hex()
    return digest, password_salt


def verify_password(password: str, expected_hash: str, salt: str) -> bool:
    actual_hash, _ = hash_password(password, salt)
    return secrets.compare_digest(actual_hash, expected_hash)


SCHEMA = """
CREATE TABLE IF NOT EXISTS institutions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    address TEXT NOT NULL DEFAULT '',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'operator', 'viewer')),
    institution_id INTEGER REFERENCES institutions(id) ON DELETE SET NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    answer_type TEXT NOT NULL CHECK(answer_type IN ('text', 'textarea', 'number', 'select', 'boolean')),
    options_json TEXT NOT NULL DEFAULT '[]',
    is_required INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    institution_id INTEGER NOT NULL REFERENCES institutions(id),
    report_date TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('draft', 'submitted')),
    author_id INTEGER NOT NULL REFERENCES users(id),
    comment TEXT NOT NULL DEFAULT '',
    client_id TEXT UNIQUE,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id),
    value_json TEXT NOT NULL,
    UNIQUE(report_id, question_id)
);

CREATE TABLE IF NOT EXISTS knowledge_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS reports_institution_date_idx
ON reports(institution_id, report_date DESC);
"""


INSTITUTIONS = [
    ("Городская клиническая больница № 1", "ГКБ № 1", "г. Москва, ул. Ленина, 12"),
    ("Центральная районная больница", "ЦРБ", "Московская область, г. Видное, ул. Школьная, 4"),
    ("Детская городская поликлиника № 7", "ДГП № 7", "г. Москва, пр-т Мира, 95"),
    ("Диагностический центр «Здоровье»", "ДЦ «Здоровье»", "г. Москва, ул. Садовая, 18"),
]


QUESTIONS = [
    (
        "Количество обращений за сутки",
        "Укажите общее число зарегистрированных обращений.",
        "number",
        [],
        1,
    ),
    (
        "Количество госпитализированных",
        "Число пациентов, госпитализированных за отчётные сутки.",
        "number",
        [],
        1,
    ),
    (
        "Свободные койки",
        "Текущее количество доступных коек.",
        "number",
        [],
        1,
    ),
    (
        "Есть ли дефицит лекарственных средств?",
        "При положительном ответе укажите подробности в комментарии.",
        "boolean",
        [],
        1,
    ),
    (
        "Уровень загрузки учреждения",
        "",
        "select",
        ["Низкий", "Средний", "Высокий", "Критический"],
        1,
    ),
    (
        "Ответственный дежурный",
        "Фамилия, имя и должность сотрудника.",
        "text",
        [],
        1,
    ),
    (
        "Происшествия и нештатные ситуации",
        "Опишите событие и принятые меры. Если событий нет — оставьте поле пустым.",
        "textarea",
        [],
        0,
    ),
    (
        "Дополнительная информация",
        "Любые сведения, которые необходимо включить в итоговую справку.",
        "textarea",
        [],
        0,
    ),
]


ARTICLES = [
    (
        "Как заполнить ежедневную справку",
        "Работа со справками",
        "Выберите учреждение и дату, заполните обязательные поля и нажмите «Отправить справку». "
        "Черновик сохраняется на устройстве автоматически.",
    ),
    (
        "Офлайн-режим и синхронизация",
        "Мобильное приложение",
        "Без интернета отправленная форма попадает в очередь. После восстановления связи откройте "
        "приложение — данные будут синхронизированы автоматически.",
    ),
    (
        "Как скачать итоговый документ",
        "Документы",
        "На главной странице откройте нужную справку и нажмите «Скачать документ». Файл можно открыть "
        "в Microsoft Word, LibreOffice или отправить по электронной почте.",
    ),
    (
        "Роли пользователей",
        "Администрирование",
        "Администратор управляет настройками. Оператор заполняет формы своего учреждения. "
        "Пользователь с ролью «Наблюдатель» может просматривать справки и аналитику.",
    ),
]


def initialize_database() -> None:
    with connection() as db:
        db.executescript(SCHEMA)
        if db.execute("SELECT COUNT(*) FROM institutions").fetchone()[0] == 0:
            db.executemany(
                """
                INSERT INTO institutions(name, short_name, address, created_at)
                VALUES (?, ?, ?, ?)
                """,
                [(*institution, utc_now()) for institution in INSTITUTIONS],
            )

        if db.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 0:
            admin_hash, admin_salt = hash_password("admin123")
            operator_hash, operator_salt = hash_password("operator123")
            db.executemany(
                """
                INSERT INTO users(
                    username, full_name, password_hash, password_salt,
                    role, institution_id, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    (
                        "admin",
                        "Системный администратор",
                        admin_hash,
                        admin_salt,
                        "admin",
                        None,
                        utc_now(),
                    ),
                    (
                        "operator",
                        "Анна Смирнова",
                        operator_hash,
                        operator_salt,
                        "operator",
                        1,
                        utc_now(),
                    ),
                ],
            )

        if db.execute("SELECT COUNT(*) FROM questions").fetchone()[0] == 0:
            db.executemany(
                """
                INSERT INTO questions(
                    text, description, answer_type, options_json,
                    is_required, order_index, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    (
                        text,
                        description,
                        answer_type,
                        json.dumps(options, ensure_ascii=False),
                        is_required,
                        index,
                        utc_now(),
                    )
                    for index, (text, description, answer_type, options, is_required)
                    in enumerate(QUESTIONS, start=1)
                ],
            )

        if db.execute("SELECT COUNT(*) FROM knowledge_articles").fetchone()[0] == 0:
            db.executemany(
                """
                INSERT INTO knowledge_articles(title, category, content, updated_at)
                VALUES (?, ?, ?, ?)
                """,
                [(*article, utc_now()) for article in ARTICLES],
            )

        if db.execute("SELECT COUNT(*) FROM reports").fetchone()[0] == 0:
            seed_demo_reports(db)


def seed_demo_reports(db: sqlite3.Connection) -> None:
    question_ids = [
        row["id"]
        for row in db.execute(
            "SELECT id FROM questions ORDER BY order_index"
        ).fetchall()
    ]
    samples = [
        (1, 0, [148, 36, 12, False, "Средний", "Иванов И. П.", "", "Работа в штатном режиме"]),
        (2, 0, [92, 21, 8, True, "Высокий", "Петрова А. Н.", "", "Ожидается поставка антибиотиков"]),
        (3, 1, [214, 14, 5, False, "Высокий", "Соколова М. В.", "", ""]),
        (1, 2, [131, 30, 17, False, "Средний", "Иванов И. П.", "", ""]),
        (4, 3, [76, 4, 3, False, "Низкий", "Орлов Д. С.", "", ""]),
        (2, 4, [105, 26, 6, False, "Средний", "Петрова А. Н.", "", ""]),
    ]
    author_id = db.execute("SELECT id FROM users WHERE username = 'admin'").fetchone()["id"]
    for institution_id, days_ago, values in samples:
        report_date = (date.today() - timedelta(days=days_ago)).isoformat()
        timestamp = utc_now()
        cursor = db.execute(
            """
            INSERT INTO reports(
                institution_id, report_date, status, author_id,
                comment, created_at, updated_at
            ) VALUES (?, ?, 'submitted', ?, '', ?, ?)
            """,
            (institution_id, report_date, author_id, timestamp, timestamp),
        )
        db.executemany(
            "INSERT INTO answers(report_id, question_id, value_json) VALUES (?, ?, ?)",
            [
                (cursor.lastrowid, question_id, json.dumps(value, ensure_ascii=False))
                for question_id, value in zip(question_ids, values, strict=False)
            ],
        )
