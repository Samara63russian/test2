from __future__ import annotations

import asyncio
from datetime import UTC, datetime
from pathlib import Path

import aiosqlite

from medication_bot.models import (
    ConfirmationStatus,
    Dose,
    Statistics,
    UserSettings,
)


SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    chat_id INTEGER PRIMARY KEY,
    username TEXT,
    first_name TEXT NOT NULL,
    timezone TEXT NOT NULL,
    repeat_minutes INTEGER NOT NULL CHECK (repeat_minutes BETWEEN 1 AND 1440),
    enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS schedule_times (
    chat_id INTEGER NOT NULL REFERENCES users(chat_id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 3),
    time TEXT NOT NULL,
    PRIMARY KEY (chat_id, position)
);

CREATE TABLE IF NOT EXISTS doses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER NOT NULL REFERENCES users(chat_id) ON DELETE CASCADE,
    scheduled_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'taken')),
    first_sent_at TEXT,
    last_sent_at TEXT,
    confirmed_at TEXT,
    sent_count INTEGER NOT NULL DEFAULT 0,
    UNIQUE (chat_id, scheduled_at)
);

CREATE INDEX IF NOT EXISTS idx_doses_pending
    ON doses (status, chat_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_doses_statistics
    ON doses (chat_id, scheduled_at);
"""


class Database:
    def __init__(self, path: Path | str) -> None:
        self.path = path
        self._connection: aiosqlite.Connection | None = None
        self._lock = asyncio.Lock()

    async def connect(self) -> None:
        if self._connection is not None:
            return
        self._connection = await aiosqlite.connect(self.path)
        self._connection.row_factory = aiosqlite.Row
        await self._connection.execute("PRAGMA foreign_keys = ON")
        await self._connection.execute("PRAGMA journal_mode = WAL")
        await self._connection.executescript(SCHEMA)
        await self._connection.commit()

    async def close(self) -> None:
        if self._connection is None:
            return
        await self._connection.close()
        self._connection = None

    async def register_user(
        self,
        *,
        chat_id: int,
        username: str | None,
        first_name: str,
        timezone: str,
        repeat_minutes: int,
        schedule_times: tuple[str, str, str],
        now: datetime | None = None,
    ) -> None:
        connection = self._require_connection()
        timestamp = _to_db(now or datetime.now(UTC))
        async with self._lock:
            await connection.execute(
                """
                INSERT INTO users (
                    chat_id, username, first_name, timezone, repeat_minutes,
                    enabled, created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, 1, ?, ?)
                ON CONFLICT(chat_id) DO UPDATE SET
                    username = excluded.username,
                    first_name = excluded.first_name,
                    updated_at = excluded.updated_at
                """,
                (
                    chat_id,
                    username,
                    first_name,
                    timezone,
                    repeat_minutes,
                    timestamp,
                    timestamp,
                ),
            )
            await connection.executemany(
                """
                INSERT OR IGNORE INTO schedule_times (chat_id, position, time)
                VALUES (?, ?, ?)
                """,
                [
                    (chat_id, position, value)
                    for position, value in enumerate(schedule_times, start=1)
                ],
            )
            await connection.commit()

    async def get_user_settings(self, chat_id: int) -> UserSettings | None:
        connection = self._require_connection()
        async with self._lock:
            cursor = await connection.execute(
                "SELECT * FROM users WHERE chat_id = ?", (chat_id,)
            )
            user = await cursor.fetchone()
            if user is None:
                return None
            cursor = await connection.execute(
                """
                SELECT time FROM schedule_times
                WHERE chat_id = ?
                ORDER BY position
                """,
                (chat_id,),
            )
            times = tuple(row["time"] for row in await cursor.fetchall())
        return _user_from_row(user, times)

    async def list_enabled_users(self) -> list[UserSettings]:
        connection = self._require_connection()
        async with self._lock:
            cursor = await connection.execute(
                "SELECT * FROM users WHERE enabled = 1 ORDER BY chat_id"
            )
            users = await cursor.fetchall()
            result: list[UserSettings] = []
            for user in users:
                cursor = await connection.execute(
                    """
                    SELECT time FROM schedule_times
                    WHERE chat_id = ?
                    ORDER BY position
                    """,
                    (user["chat_id"],),
                )
                times = tuple(row["time"] for row in await cursor.fetchall())
                result.append(_user_from_row(user, times))
        return result

    async def update_schedule_time(
        self, chat_id: int, position: int, value: str
    ) -> bool:
        connection = self._require_connection()
        async with self._lock:
            cursor = await connection.execute(
                """
                UPDATE schedule_times SET time = ?
                WHERE chat_id = ? AND position = ?
                """,
                (value, chat_id, position),
            )
            await self._touch_user(connection, chat_id)
            await connection.commit()
            return cursor.rowcount == 1

    async def update_timezone(self, chat_id: int, timezone: str) -> bool:
        return await self._update_user_value(chat_id, "timezone", timezone)

    async def update_repeat_minutes(self, chat_id: int, minutes: int) -> bool:
        return await self._update_user_value(chat_id, "repeat_minutes", minutes)

    async def set_enabled(self, chat_id: int, enabled: bool) -> bool:
        return await self._update_user_value(chat_id, "enabled", int(enabled))

    async def create_dose(self, chat_id: int, scheduled_at: datetime) -> bool:
        connection = self._require_connection()
        async with self._lock:
            cursor = await connection.execute(
                """
                INSERT OR IGNORE INTO doses (chat_id, scheduled_at)
                VALUES (?, ?)
                """,
                (chat_id, _to_db(scheduled_at)),
            )
            await connection.commit()
            return cursor.rowcount == 1

    async def list_pending_doses(self) -> list[Dose]:
        connection = self._require_connection()
        async with self._lock:
            cursor = await connection.execute(
                """
                SELECT d.*, u.timezone, u.repeat_minutes
                FROM doses AS d
                JOIN users AS u ON u.chat_id = d.chat_id
                WHERE d.status = 'pending' AND u.enabled = 1
                ORDER BY d.scheduled_at, d.id
                """
            )
            rows = await cursor.fetchall()
        return [_dose_from_row(row) for row in rows]

    async def mark_dose_sent(self, dose_id: int, sent_at: datetime) -> None:
        connection = self._require_connection()
        timestamp = _to_db(sent_at)
        async with self._lock:
            await connection.execute(
                """
                UPDATE doses
                SET first_sent_at = COALESCE(first_sent_at, ?),
                    last_sent_at = ?,
                    sent_count = sent_count + 1
                WHERE id = ? AND status = 'pending'
                """,
                (timestamp, timestamp, dose_id),
            )
            await connection.commit()

    async def confirm_dose(
        self, dose_id: int, chat_id: int, confirmed_at: datetime
    ) -> ConfirmationStatus:
        connection = self._require_connection()
        async with self._lock:
            cursor = await connection.execute(
                "SELECT status FROM doses WHERE id = ? AND chat_id = ?",
                (dose_id, chat_id),
            )
            row = await cursor.fetchone()
            if row is None:
                return ConfirmationStatus.NOT_FOUND
            if row["status"] == "taken":
                return ConfirmationStatus.ALREADY_CONFIRMED
            await connection.execute(
                """
                UPDATE doses
                SET status = 'taken', confirmed_at = ?
                WHERE id = ? AND chat_id = ? AND status = 'pending'
                """,
                (_to_db(confirmed_at), dose_id, chat_id),
            )
            await connection.commit()
            return ConfirmationStatus.CONFIRMED

    async def get_statistics(
        self, chat_id: int, since: datetime, until: datetime
    ) -> Statistics:
        connection = self._require_connection()
        async with self._lock:
            cursor = await connection.execute(
                """
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN status = 'taken' THEN 1 ELSE 0 END) AS taken,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
                    AVG(
                        CASE WHEN confirmed_at IS NOT NULL
                        THEN (julianday(confirmed_at) - julianday(scheduled_at))
                             * 1440
                        END
                    ) AS average_delay
                FROM doses
                WHERE chat_id = ?
                  AND scheduled_at >= ?
                  AND scheduled_at < ?
                """,
                (chat_id, _to_db(since), _to_db(until)),
            )
            row = await cursor.fetchone()
        average = row["average_delay"]
        return Statistics(
            total=row["total"] or 0,
            taken=row["taken"] or 0,
            pending=row["pending"] or 0,
            average_delay_minutes=round(average) if average is not None else None,
        )

    async def _update_user_value(
        self, chat_id: int, column: str, value: object
    ) -> bool:
        if column not in {"timezone", "repeat_minutes", "enabled"}:
            raise ValueError("Unsupported users column")
        connection = self._require_connection()
        async with self._lock:
            cursor = await connection.execute(
                f"UPDATE users SET {column} = ?, updated_at = ? WHERE chat_id = ?",
                (value, _to_db(datetime.now(UTC)), chat_id),
            )
            await connection.commit()
            return cursor.rowcount == 1

    async def _touch_user(
        self, connection: aiosqlite.Connection, chat_id: int
    ) -> None:
        await connection.execute(
            "UPDATE users SET updated_at = ? WHERE chat_id = ?",
            (_to_db(datetime.now(UTC)), chat_id),
        )

    def _require_connection(self) -> aiosqlite.Connection:
        if self._connection is None:
            raise RuntimeError("Database.connect() must be called first")
        return self._connection


def _to_db(value: datetime) -> str:
    if value.tzinfo is None:
        raise ValueError("Datetime must be timezone-aware")
    return value.astimezone(UTC).isoformat(timespec="seconds")


def _from_db(value: str | None) -> datetime | None:
    return datetime.fromisoformat(value) if value is not None else None


def _user_from_row(
    row: aiosqlite.Row, times: tuple[str, ...]
) -> UserSettings:
    if len(times) != 3:
        raise RuntimeError(f"User {row['chat_id']} does not have three schedule times")
    return UserSettings(
        chat_id=row["chat_id"],
        username=row["username"],
        first_name=row["first_name"],
        timezone=row["timezone"],
        repeat_minutes=row["repeat_minutes"],
        enabled=bool(row["enabled"]),
        schedule_times=(times[0], times[1], times[2]),
    )


def _dose_from_row(row: aiosqlite.Row) -> Dose:
    scheduled_at = _from_db(row["scheduled_at"])
    if scheduled_at is None:
        raise RuntimeError("Dose has no scheduled_at")
    return Dose(
        id=row["id"],
        chat_id=row["chat_id"],
        scheduled_at=scheduled_at,
        status=row["status"],
        first_sent_at=_from_db(row["first_sent_at"]),
        last_sent_at=_from_db(row["last_sent_at"]),
        confirmed_at=_from_db(row["confirmed_at"]),
        sent_count=row["sent_count"],
        timezone=row["timezone"],
        repeat_minutes=row["repeat_minutes"],
    )
