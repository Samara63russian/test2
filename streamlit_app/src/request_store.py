"""SQLite persistence for email request cards."""

from __future__ import annotations

import json
import os
import sqlite3
from contextlib import closing
from pathlib import Path
from typing import Any, Iterable


DEFAULT_DB_PATH = Path(
    os.getenv("MAILBRIEF_DB_PATH", Path(__file__).resolve().parents[1] / ".mailbrief.db")
)


def _connect(db_path: str | Path = DEFAULT_DB_PATH) -> sqlite3.Connection:
    connection = sqlite3.connect(str(db_path))
    connection.row_factory = sqlite3.Row
    return connection


def init_store(db_path: str | Path = DEFAULT_DB_PATH) -> None:
    with closing(_connect(db_path)) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS requests (
                id TEXT PRIMARY KEY,
                sender_name TEXT NOT NULL,
                sender_email TEXT NOT NULL,
                company TEXT NOT NULL DEFAULT '',
                subject TEXT NOT NULL,
                body TEXT NOT NULL,
                summary TEXT NOT NULL,
                request_type TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Новый',
                priority TEXT NOT NULL DEFAULT 'Обычный',
                deadline TEXT,
                items TEXT NOT NULL DEFAULT '[]',
                received_at TEXT NOT NULL,
                confidence INTEGER NOT NULL DEFAULT 0,
                engine TEXT NOT NULL DEFAULT 'Локальный анализ',
                source TEXT NOT NULL DEFAULT 'email'
            )
            """
        )
        connection.commit()


def count_requests(db_path: str | Path = DEFAULT_DB_PATH) -> int:
    with closing(_connect(db_path)) as connection:
        row = connection.execute("SELECT COUNT(*) AS total FROM requests").fetchone()
        return int(row["total"])


def save_request(record: dict[str, Any], db_path: str | Path = DEFAULT_DB_PATH) -> None:
    values = dict(record)
    values["items"] = json.dumps(values.get("items", []), ensure_ascii=False)
    columns = (
        "id",
        "sender_name",
        "sender_email",
        "company",
        "subject",
        "body",
        "summary",
        "request_type",
        "status",
        "priority",
        "deadline",
        "items",
        "received_at",
        "confidence",
        "engine",
        "source",
    )
    placeholders = ", ".join(f":{column}" for column in columns)
    updates = ", ".join(
        f"{column} = excluded.{column}" for column in columns if column != "id"
    )
    with closing(_connect(db_path)) as connection:
        connection.execute(
            f"""
            INSERT INTO requests ({", ".join(columns)})
            VALUES ({placeholders})
            ON CONFLICT(id) DO UPDATE SET {updates}
            """,
            {column: values.get(column, "") for column in columns},
        )
        connection.commit()


def seed_requests(
    records: Iterable[dict[str, Any]], db_path: str | Path = DEFAULT_DB_PATH
) -> None:
    if count_requests(db_path) > 0:
        return
    for record in records:
        save_request(record, db_path)


def list_requests(
    db_path: str | Path = DEFAULT_DB_PATH,
    *,
    status: str | None = None,
    search: str = "",
) -> list[dict[str, Any]]:
    clauses: list[str] = []
    parameters: list[Any] = []
    if status and status != "Все":
        clauses.append("status = ?")
        parameters.append(status)
    if search.strip():
        clauses.append(
            "(LOWER(subject) LIKE ? OR LOWER(sender_name) LIKE ? "
            "OR LOWER(company) LIKE ? OR LOWER(summary) LIKE ?)"
        )
        query = f"%{search.strip().lower()}%"
        parameters.extend([query] * 4)
    where = f"WHERE {' AND '.join(clauses)}" if clauses else ""

    with closing(_connect(db_path)) as connection:
        rows = connection.execute(
            f"SELECT * FROM requests {where} ORDER BY received_at DESC", parameters
        ).fetchall()
        return [_deserialize(row) for row in rows]


def get_request(
    request_id: str, db_path: str | Path = DEFAULT_DB_PATH
) -> dict[str, Any] | None:
    with closing(_connect(db_path)) as connection:
        row = connection.execute(
            "SELECT * FROM requests WHERE id = ?", (request_id,)
        ).fetchone()
        return _deserialize(row) if row else None


def update_status(
    request_id: str, status: str, db_path: str | Path = DEFAULT_DB_PATH
) -> None:
    allowed = {"Новый", "В работе", "Ждём ответ", "Завершён"}
    if status not in allowed:
        raise ValueError(f"Unsupported request status: {status}")
    with closing(_connect(db_path)) as connection:
        connection.execute(
            "UPDATE requests SET status = ? WHERE id = ?", (status, request_id)
        )
        connection.commit()


def _deserialize(row: sqlite3.Row) -> dict[str, Any]:
    record = dict(row)
    try:
        record["items"] = json.loads(record["items"])
    except (TypeError, json.JSONDecodeError):
        record["items"] = []
    return record
