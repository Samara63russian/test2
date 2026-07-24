from datetime import UTC, datetime, timedelta

import pytest

from medication_bot.database import Database
from medication_bot.models import ConfirmationStatus
from medication_bot.service import ReminderService, statistics_start


class FakeSender:
    def __init__(self) -> None:
        self.messages: list[tuple[int, str, object]] = []

    async def send_message(
        self, chat_id: int, text: str, *, reply_markup: object
    ) -> object:
        self.messages.append((chat_id, text, reply_markup))
        return object()


@pytest.fixture
async def database(tmp_path):
    instance = Database(tmp_path / "test.db")
    await instance.connect()
    await instance.register_user(
        chat_id=42,
        username="patient",
        first_name="Анна",
        timezone="Europe/Moscow",
        repeat_minutes=15,
        schedule_times=("09:00", "14:00", "21:00"),
    )
    yield instance
    await instance.close()


async def test_creates_doses_when_local_schedule_is_due(database: Database) -> None:
    service = ReminderService(database)

    created = await service.create_due_doses(
        datetime(2026, 7, 24, 17, 59, tzinfo=UTC)
    )
    assert created == 2

    created = await service.create_due_doses(
        datetime(2026, 7, 24, 18, 0, tzinfo=UTC)
    )
    assert created == 1
    assert len(await database.list_pending_doses()) == 3


async def test_repeats_until_dose_is_confirmed(database: Database) -> None:
    service = ReminderService(database)
    sender = FakeSender()
    first_due = datetime(2026, 7, 24, 6, 0, tzinfo=UTC)

    assert await service.run_cycle(sender, first_due) == 1
    assert await service.run_cycle(sender, first_due + timedelta(minutes=14)) == 0
    assert await service.run_cycle(sender, first_due + timedelta(minutes=15)) == 1
    assert len(sender.messages) == 2

    dose = (await database.list_pending_doses())[0]
    result = await database.confirm_dose(
        dose.id, dose.chat_id, first_due + timedelta(minutes=16)
    )
    assert result is ConfirmationStatus.CONFIRMED
    assert await service.run_cycle(sender, first_due + timedelta(minutes=30)) == 0
    assert len(sender.messages) == 2


def test_statistics_start_uses_users_local_midnight() -> None:
    now = datetime(2026, 7, 24, 18, 30, tzinfo=UTC)

    assert statistics_start(now, "Europe/Moscow", 1) == datetime(
        2026, 7, 23, 21, 0, tzinfo=UTC
    )
    assert statistics_start(now, "Europe/Moscow", 7) == datetime(
        2026, 7, 17, 21, 0, tzinfo=UTC
    )
