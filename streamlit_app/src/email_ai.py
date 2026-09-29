"""Local email analysis with an optional free Ollama model."""

from __future__ import annotations

import json
import os
import re
from dataclasses import asdict, dataclass
from html import unescape
from typing import Any


REQUEST_TYPES = {
    "quote": "Коммерческое предложение",
    "price_list": "Прайс-лист",
    "general": "Общий запрос",
}

_QUOTE_KEYWORDS = (
    "коммерческ",
    "кп ",
    "кп,",
    "кп.",
    "предложени",
    "стоимост",
    "рассчита",
    "смет",
)
_PRICE_KEYWORDS = ("прайс", "переч", "каталог", "ассортимент", "номенклатур")
_GENERAL_KEYWORDS = (
    "запрос",
    "подскажите",
    "уточните",
    "интересует",
    "закуп",
    "поставк",
    "условия",
)
_URGENT_KEYWORDS = ("срочно", "как можно скорее", "сегодня", "до конца дня", "asap")
_MONTHS = (
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
)


@dataclass(frozen=True)
class AnalysisResult:
    """Normalized result consumed by the UI and storage layer."""

    relevant: bool
    request_type: str
    summary: str
    items: list[str]
    deadline: str | None
    priority: str
    confidence: int
    engine: str = "Локальный анализ"

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def _plain_text(value: str) -> str:
    value = re.sub(r"<style.*?</style>|<script.*?</script>", " ", value, flags=re.I | re.S)
    value = re.sub(r"<[^>]+>", " ", value)
    value = unescape(value)
    value = re.sub(r"\r\n?", "\n", value)
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def _strip_reply(text: str) -> str:
    separators = (
        "\nС уважением",
        "\n-- ",
        "\nFrom:",
        "\nОт:",
        "\n> ",
        "\n________________________________",
    )
    positions = [text.find(marker) for marker in separators if text.find(marker) > 80]
    return text[: min(positions)].strip() if positions else text.strip()


def _extract_deadline(text: str) -> str | None:
    month_names = "|".join(_MONTHS)
    patterns = (
        rf"\bдо\s+(\d{{1,2}}\s+(?:{month_names})(?:\s+\d{{4}})?(?:\s+года)?)",
        r"\bдо\s+(\d{1,2}[./-]\d{1,2}(?:[./-]\d{2,4})?)",
        r"\b(сегодня|завтра|до конца дня|до конца недели)\b",
    )
    for pattern in patterns:
        match = re.search(pattern, text, flags=re.I)
        if match:
            return match.group(1).strip().capitalize()
    return None


def _extract_items(text: str) -> list[str]:
    items: list[str] = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if re.match(r"^(?:[-–—•*]|\d+[.)])\s+", line):
            item = re.sub(r"^(?:[-–—•*]|\d+[.)])\s+", "", line).strip(" ;")
            if 3 < len(item) < 140:
                items.append(item)

    if not items:
        quantity_pattern = re.compile(
            r"([^.!?\n]{3,80}?\b\d+(?:[.,]\d+)?\s*(?:шт|ед|компл|упак|кг|м|л)\.?)",
            flags=re.I,
        )
        items = [match.strip(" ,-") for match in quantity_pattern.findall(text)]

    # Preserve order while removing duplicates.
    return list(dict.fromkeys(items))[:8]


def _make_summary(subject: str, text: str, request_type: str, items: list[str]) -> str:
    clean = _strip_reply(_plain_text(text))
    sentences = [
        sentence.strip(" \n-–—•")
        for sentence in re.split(r"(?<=[.!?])\s+|\n+", clean)
        if len(sentence.strip()) > 18
    ]
    useful = [
        sentence
        for sentence in sentences
        if not re.match(r"^(добрый|здравств|коллеги|уважаем)", sentence, flags=re.I)
    ]
    summary = " ".join((useful or sentences)[:2])
    if not summary:
        summary = f"Получено письмо: «{subject.strip() or request_type}»."
    if items and items[0].lower() not in summary.lower():
        summary = f"{summary} Позиций в запросе: {len(items)}."
    return summary[:237].rstrip(" ,;:-") + ("…" if len(summary) > 237 else "")


def analyze_locally(subject: str, body: str) -> AnalysisResult:
    """Classify and summarize a message without network calls or paid APIs."""

    text = _plain_text(f"{subject}\n{body}")
    lowered = f" {text.lower()} "

    quote_score = sum(keyword in lowered for keyword in _QUOTE_KEYWORDS)
    price_score = sum(keyword in lowered for keyword in _PRICE_KEYWORDS)
    general_score = sum(keyword in lowered for keyword in _GENERAL_KEYWORDS)
    total_score = quote_score + price_score + general_score

    if price_score > quote_score and price_score >= general_score:
        request_type = REQUEST_TYPES["price_list"]
    elif quote_score:
        request_type = REQUEST_TYPES["quote"]
    else:
        request_type = REQUEST_TYPES["general"]

    items = _extract_items(_strip_reply(_plain_text(body)))
    deadline = _extract_deadline(text)
    urgent = any(keyword in lowered for keyword in _URGENT_KEYWORDS)
    priority = "Высокий" if urgent or deadline else "Обычный"
    confidence = min(98, 58 + total_score * 9 + bool(items) * 7 + bool(deadline) * 5)

    return AnalysisResult(
        relevant=total_score > 0,
        request_type=request_type,
        summary=_make_summary(subject, body, request_type, items),
        items=items,
        deadline=deadline,
        priority=priority,
        confidence=int(confidence if total_score else 35),
    )


def _analyze_with_ollama(subject: str, body: str) -> AnalysisResult | None:
    base_url = os.getenv("OLLAMA_BASE_URL", "").rstrip("/")
    if not base_url:
        return None

    try:
        import requests

        prompt = f"""
Ты помощник отдела продаж. Проанализируй письмо и верни только JSON:
{{
  "relevant": true,
  "request_type": "Коммерческое предложение|Прайс-лист|Общий запрос",
  "summary": "краткая сводка на русском до 240 символов",
  "items": ["позиция и количество"],
  "deadline": "срок или null",
  "priority": "Высокий|Обычный",
  "confidence": 0
}}

Тема: {subject[:300]}
Письмо:
{_plain_text(body)[:6000]}
""".strip()
        response = requests.post(
            f"{base_url}/api/generate",
            json={
                "model": os.getenv("OLLAMA_MODEL", "qwen2.5:3b"),
                "prompt": prompt,
                "stream": False,
                "format": "json",
            },
            timeout=45,
        )
        response.raise_for_status()
        payload = json.loads(response.json()["response"])
        if payload.get("request_type") not in REQUEST_TYPES.values():
            return None
        return AnalysisResult(
            relevant=bool(payload.get("relevant", True)),
            request_type=payload["request_type"],
            summary=str(payload.get("summary", ""))[:240],
            items=[str(item)[:140] for item in payload.get("items", [])][:8],
            deadline=payload.get("deadline") or None,
            priority="Высокий" if payload.get("priority") == "Высокий" else "Обычный",
            confidence=max(0, min(100, int(payload.get("confidence", 85)))),
            engine=f"Ollama · {os.getenv('OLLAMA_MODEL', 'qwen2.5:3b')}",
        )
    except (KeyError, TypeError, ValueError, json.JSONDecodeError, requests.RequestException):
        return None


def analyze_email(subject: str, body: str) -> AnalysisResult:
    """Use a configured local LLM, falling back to deterministic local analysis."""

    return _analyze_with_ollama(subject, body) or analyze_locally(subject, body)
