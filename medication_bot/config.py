from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import cast
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

DEFAULT_SCHEDULE = ("09:00", "14:00", "21:00")


@dataclass(frozen=True, slots=True)
class Settings:
    bot_token: str
    database_path: Path
    target_user_id: int | None
    default_timezone: str
    default_times: tuple[str, str, str]
    default_repeat_minutes: int
    scheduler_interval_seconds: int

    @classmethod
    def from_env(cls) -> Settings:
        token = os.getenv("BOT_TOKEN", "").strip()
        if not token:
            raise ValueError("Переменная окружения BOT_TOKEN обязательна")

        timezone_name = os.getenv("DEFAULT_TIMEZONE", "Europe/Moscow").strip()
        validate_timezone(timezone_name)

        raw_times = os.getenv("DEFAULT_TIMES", ",".join(DEFAULT_SCHEDULE))
        parsed_times = tuple(item.strip() for item in raw_times.split(","))
        if len(parsed_times) != 3:
            raise ValueError("DEFAULT_TIMES должен содержать ровно три времени")
        for value in parsed_times:
            validate_hhmm(value)
        if len(set(parsed_times)) != 3:
            raise ValueError("Времена в DEFAULT_TIMES не должны повторяться")

        target_user_id = _optional_int("TARGET_TELEGRAM_USER_ID")
        repeat_minutes = _bounded_int(
            "DEFAULT_REPEAT_MINUTES", default=15, minimum=1, maximum=1440
        )
        scheduler_interval = _bounded_int(
            "SCHEDULER_INTERVAL_SECONDS", default=30, minimum=5, maximum=300
        )

        return cls(
            bot_token=token,
            database_path=Path(
                os.getenv("DATABASE_PATH", "./data/medication_bot.db")
            ).expanduser(),
            target_user_id=target_user_id,
            default_timezone=timezone_name,
            default_times=cast(tuple[str, str, str], parsed_times),
            default_repeat_minutes=repeat_minutes,
            scheduler_interval_seconds=scheduler_interval,
        )


def validate_hhmm(value: str) -> str:
    parts = value.split(":")
    if (
        len(parts) != 2
        or not all(part.isdigit() for part in parts)
        or len(parts[0]) not in (1, 2)
        or len(parts[1]) != 2
    ):
        raise ValueError("Введите время в формате ЧЧ:ММ, например 09:00")
    hours, minutes = map(int, parts)
    if not 0 <= hours <= 23 or not 0 <= minutes <= 59:
        raise ValueError("Часы должны быть от 00 до 23, минуты — от 00 до 59")
    return f"{hours:02d}:{minutes:02d}"


def validate_timezone(value: str) -> str:
    try:
        ZoneInfo(value)
    except (ZoneInfoNotFoundError, ValueError) as exc:
        raise ValueError(
            "Неизвестный часовой пояс. Пример корректного значения: Europe/Moscow"
        ) from exc
    return value


def _optional_int(name: str) -> int | None:
    value = os.getenv(name, "").strip()
    if not value:
        return None
    try:
        parsed = int(value)
    except ValueError as exc:
        raise ValueError(f"{name} должен быть целым числом") from exc
    if parsed <= 0:
        raise ValueError(f"{name} должен быть положительным")
    return parsed


def _bounded_int(name: str, *, default: int, minimum: int, maximum: int) -> int:
    value = os.getenv(name, str(default)).strip()
    try:
        parsed = int(value)
    except ValueError as exc:
        raise ValueError(f"{name} должен быть целым числом") from exc
    if not minimum <= parsed <= maximum:
        raise ValueError(f"{name} должен быть в диапазоне {minimum}–{maximum}")
    return parsed
