from __future__ import annotations

from datetime import UTC, datetime

from aiogram import F, Router
from aiogram.filters import Command, CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    Message,
    ReplyKeyboardMarkup,
)

from medication_bot.config import Settings, validate_hhmm, validate_timezone
from medication_bot.database import Database
from medication_bot.models import ConfirmationStatus, Statistics, UserSettings
from medication_bot.service import statistics_start

router = Router(name=__name__)

TIMEZONE_PRESETS = (
    ("Москва", "Europe/Moscow"),
    ("Калининград", "Europe/Kaliningrad"),
    ("Екатеринбург", "Asia/Yekaterinburg"),
    ("Новосибирск", "Asia/Novosibirsk"),
    ("Владивосток", "Asia/Vladivostok"),
    ("UTC", "UTC"),
)


class SettingsForm(StatesGroup):
    waiting_for_time = State()
    waiting_for_timezone = State()


@router.message(CommandStart())
async def command_start(
    message: Message, database: Database, app_settings: Settings
) -> None:
    if not await _allow_message(message, app_settings):
        return
    await database.register_user(
        chat_id=message.from_user.id,
        username=message.from_user.username,
        first_name=message.from_user.first_name,
        timezone=app_settings.default_timezone,
        repeat_minutes=app_settings.default_repeat_minutes,
        schedule_times=app_settings.default_times,
    )
    user = await database.get_user_settings(message.from_user.id)
    await message.answer(
        "Здравствуйте! Я буду напоминать о таблетках три раза в день и "
        "повторять сообщение до нажатия кнопки «Я выпила».\n\n"
        "Проверьте время и часовой пояс в настройках.",
        reply_markup=main_menu_keyboard(),
    )
    if user is not None:
        await message.answer(
            settings_text(user),
            reply_markup=settings_keyboard(user),
        )


@router.message(Command("help"))
async def command_help(message: Message, app_settings: Settings) -> None:
    if not await _allow_message(message, app_settings):
        return
    await message.answer(
        "Команды:\n"
        "/start — запустить бота\n"
        "/settings — расписание и повторы\n"
        "/stats — статистика приёма\n"
        "/cancel — отменить ввод настройки\n\n"
        "Бот может написать только после того, как получатель запустил его."
    )


@router.message(Command("cancel"))
async def command_cancel(
    message: Message, state: FSMContext, app_settings: Settings
) -> None:
    if not await _allow_message(message, app_settings):
        return
    await state.clear()
    await message.answer("Ввод отменён.", reply_markup=main_menu_keyboard())


@router.message(Command("settings"))
@router.message(F.text == "⚙️ Настройки")
async def show_settings(
    message: Message, database: Database, app_settings: Settings
) -> None:
    if not await _allow_message(message, app_settings):
        return
    user = await _registered_user(message.from_user.id, database, message)
    if user is None:
        return
    await message.answer(settings_text(user), reply_markup=settings_keyboard(user))


@router.callback_query(F.data == "settings:open")
async def open_settings_callback(
    callback: CallbackQuery, database: Database, app_settings: Settings
) -> None:
    if not await _allow_callback(callback, app_settings):
        return
    user = await database.get_user_settings(callback.from_user.id)
    if user is None:
        await callback.answer("Сначала отправьте /start", show_alert=True)
        return
    if callback.message is not None:
        await callback.message.edit_text(
            settings_text(user), reply_markup=settings_keyboard(user)
        )
    await callback.answer()


@router.callback_query(F.data.startswith("settings:time:"))
async def request_schedule_time(
    callback: CallbackQuery, state: FSMContext, app_settings: Settings
) -> None:
    if not await _allow_callback(callback, app_settings):
        return
    try:
        position = int((callback.data or "").rsplit(":", maxsplit=1)[1])
    except (ValueError, IndexError):
        await callback.answer("Некорректная настройка", show_alert=True)
        return
    if position not in (1, 2, 3):
        await callback.answer("Некорректная настройка", show_alert=True)
        return
    await state.set_state(SettingsForm.waiting_for_time)
    await state.update_data(position=position)
    if callback.message is not None:
        await callback.message.answer(
            f"Введите время для напоминания №{position} в формате ЧЧ:ММ.\n"
            "Например: 09:30\n\nДля отмены: /cancel"
        )
    await callback.answer()


@router.message(SettingsForm.waiting_for_time)
async def save_schedule_time(
    message: Message,
    state: FSMContext,
    database: Database,
    app_settings: Settings,
) -> None:
    if not await _allow_message(message, app_settings):
        return
    try:
        value = validate_hhmm((message.text or "").strip())
    except ValueError as exc:
        await message.answer(f"{exc}\nПопробуйте ещё раз или отправьте /cancel.")
        return
    state_data = await state.get_data()
    position = state_data.get("position")
    if position not in (1, 2, 3):
        await state.clear()
        await message.answer("Настройка устарела. Откройте меню ещё раз.")
        return
    user = await database.get_user_settings(message.from_user.id)
    if user is None:
        await state.clear()
        await message.answer("Сначала отправьте /start")
        return
    if any(
        current == value and index != position
        for index, current in enumerate(user.schedule_times, start=1)
    ):
        await message.answer(
            "Такое время уже используется. Укажите другое время или /cancel."
        )
        return
    await database.update_schedule_time(message.from_user.id, position, value)
    await state.clear()
    updated = await database.get_user_settings(message.from_user.id)
    await message.answer(f"✅ Время №{position} изменено на {value}.")
    if updated is not None:
        await message.answer(
            settings_text(updated), reply_markup=settings_keyboard(updated)
        )


@router.callback_query(F.data == "settings:timezone")
async def choose_timezone(callback: CallbackQuery, app_settings: Settings) -> None:
    if not await _allow_callback(callback, app_settings):
        return
    rows = [
        [
            InlineKeyboardButton(
                text=label,
                callback_data=f"settings:timezone:set:{timezone_name}",
            )
        ]
        for label, timezone_name in TIMEZONE_PRESETS
    ]
    rows.append(
        [
            InlineKeyboardButton(
                text="✍️ Другой часовой пояс",
                callback_data="settings:timezone:custom",
            )
        ]
    )
    rows.append([InlineKeyboardButton(text="⬅️ Назад", callback_data="settings:open")])
    if callback.message is not None:
        await callback.message.edit_text(
            "Выберите свой часовой пояс:",
            reply_markup=InlineKeyboardMarkup(inline_keyboard=rows),
        )
    await callback.answer()


@router.callback_query(F.data.startswith("settings:timezone:set:"))
async def set_timezone(
    callback: CallbackQuery, database: Database, app_settings: Settings
) -> None:
    if not await _allow_callback(callback, app_settings):
        return
    timezone_name = (callback.data or "").removeprefix("settings:timezone:set:")
    try:
        validate_timezone(timezone_name)
    except ValueError:
        await callback.answer("Неизвестный часовой пояс", show_alert=True)
        return
    await database.update_timezone(callback.from_user.id, timezone_name)
    user = await database.get_user_settings(callback.from_user.id)
    if callback.message is not None and user is not None:
        await callback.message.edit_text(
            settings_text(user), reply_markup=settings_keyboard(user)
        )
    await callback.answer("Часовой пояс сохранён")


@router.callback_query(F.data == "settings:timezone:custom")
async def request_custom_timezone(
    callback: CallbackQuery, state: FSMContext, app_settings: Settings
) -> None:
    if not await _allow_callback(callback, app_settings):
        return
    await state.set_state(SettingsForm.waiting_for_timezone)
    if callback.message is not None:
        await callback.message.answer(
            "Введите часовой пояс в формате IANA.\n"
            "Например: Europe/Samara или Asia/Irkutsk\n\n"
            "Для отмены: /cancel"
        )
    await callback.answer()


@router.message(SettingsForm.waiting_for_timezone)
async def save_custom_timezone(
    message: Message,
    state: FSMContext,
    database: Database,
    app_settings: Settings,
) -> None:
    if not await _allow_message(message, app_settings):
        return
    timezone_name = (message.text or "").strip()
    try:
        validate_timezone(timezone_name)
    except ValueError as exc:
        await message.answer(f"{exc}\nПопробуйте ещё раз или отправьте /cancel.")
        return
    updated = await database.update_timezone(message.from_user.id, timezone_name)
    await state.clear()
    if not updated:
        await message.answer("Сначала отправьте /start")
        return
    user = await database.get_user_settings(message.from_user.id)
    await message.answer(f"✅ Часовой пояс изменён на {timezone_name}.")
    if user is not None:
        await message.answer(settings_text(user), reply_markup=settings_keyboard(user))


@router.callback_query(F.data == "settings:repeat")
async def choose_repeat_interval(
    callback: CallbackQuery, app_settings: Settings
) -> None:
    if not await _allow_callback(callback, app_settings):
        return
    rows = [
        [
            InlineKeyboardButton(
                text=f"{minutes} мин.",
                callback_data=f"settings:repeat:set:{minutes}",
            )
            for minutes in pair
        ]
        for pair in ((5, 10, 15), (30, 60, 120))
    ]
    rows.append([InlineKeyboardButton(text="⬅️ Назад", callback_data="settings:open")])
    if callback.message is not None:
        await callback.message.edit_text(
            "Как часто повторять неподтверждённое напоминание?",
            reply_markup=InlineKeyboardMarkup(inline_keyboard=rows),
        )
    await callback.answer()


@router.callback_query(F.data.startswith("settings:repeat:set:"))
async def set_repeat_interval(
    callback: CallbackQuery, database: Database, app_settings: Settings
) -> None:
    if not await _allow_callback(callback, app_settings):
        return
    try:
        minutes = int((callback.data or "").rsplit(":", maxsplit=1)[1])
    except (ValueError, IndexError):
        await callback.answer("Некорректный интервал", show_alert=True)
        return
    if minutes not in {5, 10, 15, 30, 60, 120}:
        await callback.answer("Некорректный интервал", show_alert=True)
        return
    await database.update_repeat_minutes(callback.from_user.id, minutes)
    user = await database.get_user_settings(callback.from_user.id)
    if callback.message is not None and user is not None:
        await callback.message.edit_text(
            settings_text(user), reply_markup=settings_keyboard(user)
        )
    await callback.answer("Интервал сохранён")


@router.callback_query(F.data == "settings:toggle")
async def toggle_reminders(
    callback: CallbackQuery, database: Database, app_settings: Settings
) -> None:
    if not await _allow_callback(callback, app_settings):
        return
    user = await database.get_user_settings(callback.from_user.id)
    if user is None:
        await callback.answer("Сначала отправьте /start", show_alert=True)
        return
    await database.set_enabled(callback.from_user.id, not user.enabled)
    updated = await database.get_user_settings(callback.from_user.id)
    if callback.message is not None and updated is not None:
        await callback.message.edit_text(
            settings_text(updated), reply_markup=settings_keyboard(updated)
        )
    await callback.answer("Настройка сохранена")


@router.message(Command("stats"))
@router.message(F.text == "📊 Статистика")
async def show_statistics_menu(
    message: Message, database: Database, app_settings: Settings
) -> None:
    if not await _allow_message(message, app_settings):
        return
    user = await _registered_user(message.from_user.id, database, message)
    if user is None:
        return
    await message.answer(
        "За какой период показать статистику?",
        reply_markup=statistics_keyboard(),
    )


@router.callback_query(F.data.startswith("stats:"))
async def show_statistics(
    callback: CallbackQuery, database: Database, app_settings: Settings
) -> None:
    if not await _allow_callback(callback, app_settings):
        return
    try:
        days = int((callback.data or "").split(":", maxsplit=1)[1])
    except (ValueError, IndexError):
        await callback.answer("Некорректный период", show_alert=True)
        return
    if days not in (1, 7, 30):
        await callback.answer("Некорректный период", show_alert=True)
        return
    user = await database.get_user_settings(callback.from_user.id)
    if user is None:
        await callback.answer("Сначала отправьте /start", show_alert=True)
        return
    now = datetime.now(UTC)
    since = statistics_start(now, user.timezone, days)
    stats = await database.get_statistics(callback.from_user.id, since, now)
    if callback.message is not None:
        await callback.message.edit_text(
            format_statistics(stats, days),
            reply_markup=statistics_keyboard(),
        )
    await callback.answer()


@router.callback_query(F.data.startswith("dose:taken:"))
async def confirm_dose(
    callback: CallbackQuery, database: Database, app_settings: Settings
) -> None:
    if not await _allow_callback(callback, app_settings):
        return
    try:
        dose_id = int((callback.data or "").rsplit(":", maxsplit=1)[1])
    except (ValueError, IndexError):
        await callback.answer("Некорректное напоминание", show_alert=True)
        return
    now = datetime.now(UTC)
    result = await database.confirm_dose(dose_id, callback.from_user.id, now)
    if result is ConfirmationStatus.NOT_FOUND:
        await callback.answer("Напоминание не найдено", show_alert=True)
        return
    if result is ConfirmationStatus.ALREADY_CONFIRMED:
        await callback.answer("Этот приём уже отмечен ✅", show_alert=True)
        return
    if callback.message is not None:
        original_text = callback.message.text or "💊 Приём таблеток"
        await callback.message.edit_text(
            f"{original_text}\n\n✅ Приём подтверждён.",
            reply_markup=None,
        )
    await callback.answer("Записано в статистику ✅")


def main_menu_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [
                KeyboardButton(text="⚙️ Настройки"),
                KeyboardButton(text="📊 Статистика"),
            ]
        ],
        resize_keyboard=True,
        input_field_placeholder="Выберите действие",
    )


def settings_text(user: UserSettings) -> str:
    status = "включены ✅" if user.enabled else "приостановлены ⏸"
    schedule = " · ".join(user.schedule_times)
    return (
        "⚙️ Настройки напоминаний\n\n"
        f"Время: {schedule}\n"
        f"Часовой пояс: {user.timezone}\n"
        f"Повтор: каждые {user.repeat_minutes} мин.\n"
        f"Напоминания: {status}"
    )


def settings_keyboard(user: UserSettings) -> InlineKeyboardMarkup:
    toggle_text = "⏸ Приостановить" if user.enabled else "▶️ Возобновить"
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text=f"1 · {user.schedule_times[0]}",
                    callback_data="settings:time:1",
                ),
                InlineKeyboardButton(
                    text=f"2 · {user.schedule_times[1]}",
                    callback_data="settings:time:2",
                ),
                InlineKeyboardButton(
                    text=f"3 · {user.schedule_times[2]}",
                    callback_data="settings:time:3",
                ),
            ],
            [
                InlineKeyboardButton(
                    text="🌍 Часовой пояс",
                    callback_data="settings:timezone",
                )
            ],
            [
                InlineKeyboardButton(
                    text="🔁 Интервал повтора",
                    callback_data="settings:repeat",
                )
            ],
            [
                InlineKeyboardButton(
                    text=toggle_text,
                    callback_data="settings:toggle",
                )
            ],
        ]
    )


def statistics_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="Сегодня", callback_data="stats:1"),
                InlineKeyboardButton(text="7 дней", callback_data="stats:7"),
                InlineKeyboardButton(text="30 дней", callback_data="stats:30"),
            ],
            [InlineKeyboardButton(text="⚙️ Настройки", callback_data="settings:open")],
        ]
    )


def format_statistics(stats: Statistics, days: int) -> str:
    period = {1: "сегодня", 7: "за 7 дней", 30: "за 30 дней"}[days]
    delay = (
        f"{stats.average_delay_minutes} мин."
        if stats.average_delay_minutes is not None
        else "нет данных"
    )
    return (
        f"📊 Статистика {period}\n\n"
        f"Наступивших приёмов: {stats.total}\n"
        f"Подтверждено: {stats.taken} ✅\n"
        f"Ожидают подтверждения: {stats.pending} ⏳\n"
        f"Выполнение: {stats.adherence_percent}%\n"
        f"Средняя задержка: {delay}"
    )


async def _registered_user(
    user_id: int, database: Database, message: Message
) -> UserSettings | None:
    user = await database.get_user_settings(user_id)
    if user is None:
        await message.answer("Сначала отправьте /start, чтобы запустить напоминания.")
    return user


async def _allow_message(message: Message, settings: Settings) -> bool:
    if message.from_user is None:
        return False
    if message.chat.type != "private":
        await message.answer("Настройка доступна только в личном чате с ботом.")
        return False
    if (
        settings.target_user_id is not None
        and message.from_user.id != settings.target_user_id
    ):
        await message.answer("Этот бот настроен для другого пользователя.")
        return False
    return True


async def _allow_callback(callback: CallbackQuery, settings: Settings) -> bool:
    if (
        settings.target_user_id is not None
        and callback.from_user.id != settings.target_user_id
    ):
        await callback.answer(
            "Этот бот настроен для другого пользователя.", show_alert=True
        )
        return False
    return True
