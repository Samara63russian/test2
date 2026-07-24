from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum


@dataclass(frozen=True, slots=True)
class UserSettings:
    chat_id: int
    username: str | None
    first_name: str
    created_at: datetime
    timezone: str
    repeat_minutes: int
    enabled: bool
    schedule_times: tuple[str, str, str]


@dataclass(frozen=True, slots=True)
class Dose:
    id: int
    chat_id: int
    scheduled_at: datetime
    status: str
    first_sent_at: datetime | None
    last_sent_at: datetime | None
    confirmed_at: datetime | None
    sent_count: int
    timezone: str
    repeat_minutes: int


class ConfirmationStatus(StrEnum):
    CONFIRMED = "confirmed"
    ALREADY_CONFIRMED = "already_confirmed"
    NOT_FOUND = "not_found"


@dataclass(frozen=True, slots=True)
class Statistics:
    total: int
    taken: int
    pending: int
    average_delay_minutes: int | None

    @property
    def adherence_percent(self) -> int:
        if self.total == 0:
            return 0
        return round(self.taken / self.total * 100)
