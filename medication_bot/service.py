from __future__ import annotations

import asyncio
import logging
from datetime import UTC, datetime, time, timedelta
from typing import Protocol
from zoneinfo import ZoneInfo

from aiogram.exceptions import TelegramForbiddenError, TelegramRetryAfter
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup

from medication_bot.database import Database
from medication_bot.models import Dose


logger = logging.getLogger(__name__)


class MessageSender(Protocol):
    async def send_message(
        self,
        chat_id: int,
        text: str,
        *,
        reply_markup: InlineKeyboardMarkup,
    ) -> object: ...


class ReminderService:
    def __init__(self, database: Database) -> None:
        self.database = database

    async def run_cycle(
        self, sender: MessageSender, now: datetime | None = None
    ) -> int:
        current = _aware_utc(now or datetime.now(UTC))
        await self.create_due_doses(current)
        sent_count = 0
        for dose in await self.database.list_pending_doses():
            if not _needs_reminder(dose, current):
                continue
            try:
                await sender.send_message(
                    dose.chat_id,
                    reminder_text(dose),
                    reply_markup=confirmation_keyboard(dose.id),
                )
            except TelegramForbiddenError:
                logger.warning(
                    "User %s blocked the bot; reminders were paused", dose.chat_id
                )
                await self.database.set_enabled(dose.chat_id, False)
            except TelegramRetryAfter as exc:
                logger.warning(
                    "Telegram rate limit while messaging %s; retry after %s seconds",
                    dose.chat_id,
                    exc.retry_after,
                )
            except Exception:
                logger.exception("Could not send reminder for dose %s", dose.id)
            else:
                await self.database.mark_dose_sent(dose.id, current)
                sent_count += 1
        return sent_count

    async def create_due_doses(self, now: datetime) -> int:
        current = _aware_utc(now)
        created = 0
        for user in await self.database.list_enabled_users():
            timezone = ZoneInfo(user.timezone)
            local_now = current.astimezone(timezone)
            for value in user.schedule_times:
                hours, minutes = map(int, value.split(":"))
                scheduled_local = datetime.combine(
                    local_now.date(),
                    time(hour=hours, minute=minutes),
                    tzinfo=timezone,
                )
                scheduled_at = scheduled_local.astimezone(UTC)
                if scheduled_at <= current and await self.database.create_dose(
                    user.chat_id, scheduled_at
                ):
                    created += 1
        return created


async def scheduler_loop(
    service: ReminderService,
    sender: MessageSender,
    interval_seconds: int,
) -> None:
    while True:
        try:
            await service.run_cycle(sender)
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("Unexpected reminder scheduler error")
        await asyncio.sleep(interval_seconds)


def reminder_text(dose: Dose) -> str:
    local_time = dose.scheduled_at.astimezone(ZoneInfo(dose.timezone))
    return (
        "💊 Пора выпить таблетки!\n\n"
        f"Запланированное время: {local_time:%H:%M}.\n"
        "Напоминание будет повторяться, пока вы не подтвердите приём."
    )


def confirmation_keyboard(dose_id: int) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="✅ Я выпила",
                    callback_data=f"dose:taken:{dose_id}",
                )
            ]
        ]
    )


def statistics_start(now: datetime, timezone_name: str, days: int) -> datetime:
    current = _aware_utc(now)
    timezone = ZoneInfo(timezone_name)
    local_now = current.astimezone(timezone)
    local_start = datetime.combine(
        local_now.date() - timedelta(days=days - 1),
        time.min,
        tzinfo=timezone,
    )
    return local_start.astimezone(UTC)


def _needs_reminder(dose: Dose, now: datetime) -> bool:
    if dose.last_sent_at is None:
        return True
    return dose.last_sent_at + timedelta(minutes=dose.repeat_minutes) <= now


def _aware_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        raise ValueError("Datetime must be timezone-aware")
    return value.astimezone(UTC)
