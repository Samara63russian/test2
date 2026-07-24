import pytest

from medication_bot.config import validate_hhmm, validate_timezone
from medication_bot.handlers import format_statistics
from medication_bot.models import Statistics


@pytest.mark.parametrize(
    ("raw", "normalized"),
    (("9:05", "09:05"), ("00:00", "00:00"), ("23:59", "23:59")),
)
def test_validate_hhmm_normalizes_valid_time(raw: str, normalized: str) -> None:
    assert validate_hhmm(raw) == normalized


@pytest.mark.parametrize("raw", ("9:5", "24:00", "12:60", "noon", ""))
def test_validate_hhmm_rejects_invalid_time(raw: str) -> None:
    with pytest.raises(ValueError):
        validate_hhmm(raw)


def test_validate_timezone() -> None:
    assert validate_timezone("Europe/Samara") == "Europe/Samara"
    with pytest.raises(ValueError):
        validate_timezone("Mars/Olympus")


def test_statistics_text_contains_adherence() -> None:
    text = format_statistics(
        Statistics(total=4, taken=3, pending=1, average_delay_minutes=6),
        days=7,
    )
    assert "Выполнение: 75%" in text
    assert "Средняя задержка: 6 мин." in text
