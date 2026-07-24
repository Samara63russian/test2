from datetime import UTC, datetime, timedelta

import pytest

from medication_bot.database import Database
from medication_bot.models import ConfirmationStatus


@pytest.fixture
async def database(tmp_path):
    instance = Database(tmp_path / "test.db")
    await instance.connect()
    yield instance
    await instance.close()


async def register_default_user(database: Database, chat_id: int = 42) -> None:
    await database.register_user(
        chat_id=chat_id,
        username="patient",
        first_name="Анна",
        timezone="Europe/Moscow",
        repeat_minutes=15,
        schedule_times=("09:00", "14:00", "21:00"),
        now=datetime(2026, 7, 24, tzinfo=UTC),
    )


async def test_register_user_preserves_changed_settings(database: Database) -> None:
    await register_default_user(database)
    await database.update_schedule_time(42, 1, "08:30")
    await database.update_repeat_minutes(42, 30)

    await database.register_user(
        chat_id=42,
        username="new_username",
        first_name="Анна",
        timezone="UTC",
        repeat_minutes=5,
        schedule_times=("01:00", "02:00", "03:00"),
    )

    user = await database.get_user_settings(42)
    assert user is not None
    assert user.username == "new_username"
    assert user.timezone == "Europe/Moscow"
    assert user.repeat_minutes == 30
    assert user.schedule_times == ("08:30", "14:00", "21:00")


async def test_confirm_dose_is_idempotent_and_updates_statistics(
    database: Database,
) -> None:
    await register_default_user(database)
    scheduled_at = datetime(2026, 7, 24, 6, 0, tzinfo=UTC)
    assert await database.create_dose(42, scheduled_at)
    assert not await database.create_dose(42, scheduled_at)

    doses = await database.list_pending_doses()
    assert len(doses) == 1
    dose_id = doses[0].id
    confirmed_at = scheduled_at + timedelta(minutes=7)

    assert (
        await database.confirm_dose(dose_id, 42, confirmed_at)
        is ConfirmationStatus.CONFIRMED
    )
    assert (
        await database.confirm_dose(dose_id, 42, confirmed_at)
        is ConfirmationStatus.ALREADY_CONFIRMED
    )
    assert (
        await database.confirm_dose(dose_id, 999, confirmed_at)
        is ConfirmationStatus.NOT_FOUND
    )

    stats = await database.get_statistics(
        42,
        scheduled_at - timedelta(hours=1),
        scheduled_at + timedelta(hours=1),
    )
    assert stats.total == 1
    assert stats.taken == 1
    assert stats.pending == 0
    assert stats.adherence_percent == 100
    assert stats.average_delay_minutes == 7
