from __future__ import annotations

import asyncio
import contextlib
import logging

from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types import BotCommand

from medication_bot.config import Settings
from medication_bot.database import Database
from medication_bot.handlers import router
from medication_bot.service import ReminderService, scheduler_loop

logger = logging.getLogger(__name__)


async def main() -> None:
    settings = Settings.from_env()
    if str(settings.database_path) != ":memory:":
        settings.database_path.parent.mkdir(parents=True, exist_ok=True)

    database = Database(settings.database_path)
    await database.connect()

    bot = Bot(token=settings.bot_token)
    dispatcher = Dispatcher(storage=MemoryStorage())
    dispatcher.include_router(router)
    await bot.set_my_commands(
        [
            BotCommand(command="start", description="Запустить бота"),
            BotCommand(command="settings", description="Настроить напоминания"),
            BotCommand(command="stats", description="Посмотреть статистику"),
            BotCommand(command="help", description="Помощь"),
            BotCommand(command="cancel", description="Отменить ввод"),
        ]
    )

    service = ReminderService(database)
    scheduler_task = asyncio.create_task(
        scheduler_loop(
            service,
            bot,
            settings.scheduler_interval_seconds,
        ),
        name="medication-reminder-scheduler",
    )
    logger.info("Medication reminder bot started")
    try:
        await dispatcher.start_polling(
            bot,
            database=database,
            app_settings=settings,
            allowed_updates=dispatcher.resolve_used_update_types(),
        )
    finally:
        scheduler_task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await scheduler_task
        await database.close()
        await bot.session.close()


def run() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Bot stopped")


if __name__ == "__main__":
    run()
