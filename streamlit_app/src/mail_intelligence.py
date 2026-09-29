"""Local-first analysis helpers for incoming business emails.

The module intentionally has no paid API dependency.  It can analyse messages
with deterministic extraction rules out of the box and optionally use a local
Ollama model for richer summaries.
"""

from __future__ import annotations

import json
import re
import urllib.error
import urllib.request
from dataclasses import dataclass, asdict
from typing import Any


CATEGORY_RULES = {
    "Запрос КП": (
        "коммерческ",
        "кп",
        "стоимост",
        "цен",
        "рассчитать",
        "смет",
        "предложени",
    ),
    "Запрос перечня": (
        "перечень",
        "список",
        "каталог",
        "ассортимент",
        "номенклатур",
        "спецификац",
    ),
}

URGENT_MARKERS = (
    "срочно",
    "как можно скорее",
    "сегодня",
    "до конца дня",
    "в течение дня",
    "asap",
)

DEADLINE_PATTERNS = (
    r"(?:до|не позднее)\s+(\d{1,2}[./]\d{1,2}(?:[./]\d{2,4})?)",
    r"(?:до|не позднее)\s+(\d{1,2}\s+[а-яё]+\s+\d{4})",
    r"(сегодня|завтра|до конца дня|в течение дня)",
)

BUDGET_PATTERN = re.compile(
    r"(?:бюджет|до|около)\s*[:—-]?\s*(\d[\d\s]*(?:[.,]\d+)?)\s*"
    r"(руб(?:лей|ля|\.|)|₽|тыс(?:яч)?|млн)",
    re.IGNORECASE,
)


@dataclass(frozen=True)
class MailAnalysis:
    category: str
    priority: str
    summary: str
    intent: str
    items: list[str]
    deadline: str
    budget: str
    next_action: str
    confidence: int
    engine: str = "Локальный анализ"

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def _clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def _first_sentences(text: str, limit: int = 190) -> str:
    cleaned = _clean_text(text)
    if not cleaned:
        return "В письме нет текста для краткого резюме."

    signature_markers = ("с уважением", "--", "отправлено с")
    lowered = cleaned.lower()
    for marker in signature_markers:
        marker_position = lowered.find(marker)
        if marker_position > 20:
            cleaned = cleaned[:marker_position].strip(" ,.;")
            break

    parts = re.split(r"(?<=[.!?])\s+", cleaned)
    summary = " ".join(parts[:2])
    if len(summary) > limit:
        summary = f"{summary[: limit - 1].rstrip(' ,.;')}…"
    return summary


def _extract_items(body: str) -> list[str]:
    items: list[str] = []
    for raw_line in (body or "").splitlines():
        line = raw_line.strip()
        match = re.match(r"^(?:[-–—•*]|\d+[.)])\s*(.+)$", line)
        if not match:
            continue
        item = _clean_text(match.group(1)).strip(" .;")
        if 2 < len(item) <= 120 and item not in items:
            items.append(item)
    return items[:5]


def _extract_deadline(text: str) -> str:
    for pattern in DEADLINE_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).capitalize()
    return "Не указан"


def _extract_budget(text: str) -> str:
    match = BUDGET_PATTERN.search(text)
    if not match:
        return "Не указан"
    amount = _clean_text(match.group(1))
    currency = _clean_text(match.group(2))
    return f"{amount} {currency}".replace("руб.", "₽")


def _detect_category(text: str) -> tuple[str, int]:
    scores = {
        category: sum(marker in text for marker in markers)
        for category, markers in CATEGORY_RULES.items()
    }
    category = max(scores, key=scores.get)
    score = scores[category]
    if score == 0:
        return "Общий запрос", 82
    return category, min(97, 86 + score * 3)


def _detect_priority(text: str, deadline: str) -> str:
    if any(marker in text for marker in URGENT_MARKERS):
        return "Высокий"
    if deadline != "Не указан":
        return "Средний"
    return "Обычный"


def _intent_for(category: str, items: list[str]) -> str:
    if category == "Запрос КП":
        suffix = f" по {len(items)} поз." if items else ""
        return f"Получить стоимость и условия поставки{suffix}"
    if category == "Запрос перечня":
        return "Получить актуальный перечень продукции и условия"
    return "Получить ответ на вопрос и согласовать следующий шаг"


def _next_action(category: str, deadline: str) -> str:
    timing = "" if deadline == "Не указан" else f" до срока «{deadline}»"
    if category == "Запрос КП":
        return f"Уточнить наличие и подготовить коммерческое предложение{timing}"
    if category == "Запрос перечня":
        return f"Отправить актуальный каталог и уточнить объём{timing}"
    return f"Назначить ответственного и подготовить ответ{timing}"


def analyse_message(subject: str, body: str) -> dict[str, Any]:
    """Analyse one email without network access or paid services."""

    combined = _clean_text(f"{subject}. {body}")
    lowered = combined.lower()
    category, confidence = _detect_category(lowered)
    items = _extract_items(body)
    deadline = _extract_deadline(combined)
    budget = _extract_budget(combined)

    result = MailAnalysis(
        category=category,
        priority=_detect_priority(lowered, deadline),
        summary=_first_sentences(body),
        intent=_intent_for(category, items),
        items=items,
        deadline=deadline,
        budget=budget,
        next_action=_next_action(category, deadline),
        confidence=confidence,
    )
    return result.to_dict()


def _normalise_ollama_result(payload: dict[str, Any]) -> dict[str, Any]:
    allowed_categories = {"Запрос КП", "Запрос перечня", "Общий запрос"}
    allowed_priorities = {"Высокий", "Средний", "Обычный"}

    category = payload.get("category", "Общий запрос")
    priority = payload.get("priority", "Обычный")
    if category not in allowed_categories:
        category = "Общий запрос"
    if priority not in allowed_priorities:
        priority = "Обычный"

    items = payload.get("items", [])
    if not isinstance(items, list):
        items = []

    return MailAnalysis(
        category=category,
        priority=priority,
        summary=_clean_text(str(payload.get("summary", "")))[:320],
        intent=_clean_text(str(payload.get("intent", "")))[:220],
        items=[_clean_text(str(item))[:120] for item in items[:5]],
        deadline=_clean_text(str(payload.get("deadline", "Не указан")))[:80],
        budget=_clean_text(str(payload.get("budget", "Не указан")))[:80],
        next_action=_clean_text(str(payload.get("next_action", "")))[:240],
        confidence=95,
        engine="Ollama · локальная модель",
    ).to_dict()


def analyse_with_ollama(
    subject: str,
    body: str,
    *,
    endpoint: str = "http://localhost:11434",
    model: str = "llama3.2:3b",
    timeout: int = 25,
) -> dict[str, Any]:
    """Use a free local Ollama model and return a normalised analysis."""

    prompt = f"""
Ты помощник отдела продаж. Проанализируй входящее письмо и верни только JSON.
Допустимые category: "Запрос КП", "Запрос перечня", "Общий запрос".
Допустимые priority: "Высокий", "Средний", "Обычный".
Поля: category, priority, summary (1–2 коротких предложения), intent,
items (массив до 5 позиций), deadline, budget, next_action.
Не выдумывай отсутствующие факты, используй "Не указан".

Тема: {subject}
Письмо:
{body}
""".strip()

    request_body = json.dumps(
        {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "format": "json",
        }
    ).encode("utf-8")
    request = urllib.request.Request(
        f"{endpoint.rstrip('/')}/api/generate",
        data=request_body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            raw_response = json.loads(response.read().decode("utf-8"))
        model_payload = json.loads(raw_response["response"])
    except (urllib.error.URLError, TimeoutError, KeyError, json.JSONDecodeError) as exc:
        raise RuntimeError(
            "Локальная модель Ollama недоступна или вернула некорректный ответ."
        ) from exc

    return _normalise_ollama_result(model_payload)


def generate_reply_draft(message: dict[str, Any]) -> str:
    """Create a short editable reply draft from the extracted fields."""

    sender_name = message.get("sender_name", "").split()[0] or "коллеги"
    analysis = message.get("analysis", {})
    category = analysis.get("category", "Общий запрос")
    deadline = analysis.get("deadline", "Не указан")

    if category == "Запрос КП":
        action = (
            "Приняли запрос в работу. Проверим наличие, рассчитаем стоимость "
            "и направим коммерческое предложение"
        )
    elif category == "Запрос перечня":
        action = (
            "Подготовим актуальный перечень продукции и условия поставки"
        )
    else:
        action = "Приняли ваш запрос и готовим подробный ответ"

    timing = f" с учётом срока «{deadline}»" if deadline != "Не указан" else ""
    return (
        f"Здравствуйте, {sender_name}!\n\n"
        f"Спасибо за обращение. {action}{timing}.\n"
        "Если потребуется уточнение, свяжемся с вами ответным письмом.\n\n"
        "С уважением,\nОтдел продаж"
    )
