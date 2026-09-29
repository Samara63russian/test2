import json
import re
from dataclasses import dataclass

import httpx

from app.config import settings
from app.models import RequestCategory

CATEGORY_LABELS = {
    RequestCategory.COMMERCIAL_PROPOSAL: "Запрос на коммерческое предложение (КП)",
    RequestCategory.CATALOG: "Запрос перечня / прайс-листа / каталога",
    RequestCategory.GENERAL: "Общий запрос / вопрос",
}

COMMERCIAL_KEYWORDS = (
    "коммерческ",
    "кп",
    "предложени",
    "цена",
    "стоимость",
    "расценк",
    "смет",
    "quote",
    "quotation",
    "commercial",
    "pricing",
    "proposal",
)
CATALOG_KEYWORDS = (
    "перечень",
    "прайс",
    "каталог",
    "ассортимент",
    "номенклатур",
    "список",
    "price list",
    "catalog",
    "catalogue",
)


@dataclass
class AnalysisResult:
    category: RequestCategory
    summary: str
    provider: str


def _extract_json(text: str) -> dict | None:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                return None
    return None


def _normalize_category(value: str) -> RequestCategory:
    normalized = value.lower().strip()
    mapping = {
        "commercial_proposal": RequestCategory.COMMERCIAL_PROPOSAL,
        "commercial": RequestCategory.COMMERCIAL_PROPOSAL,
        "kp": RequestCategory.COMMERCIAL_PROPOSAL,
        "catalog": RequestCategory.CATALOG,
        "list": RequestCategory.CATALOG,
        "general": RequestCategory.GENERAL,
        "request": RequestCategory.GENERAL,
    }
    for key, category in mapping.items():
        if key in normalized:
            return category
    return RequestCategory.GENERAL


def _local_classify(subject: str, body: str) -> RequestCategory:
    text = f"{subject} {body}".lower()
    commercial_score = sum(1 for word in COMMERCIAL_KEYWORDS if word in text)
    catalog_score = sum(1 for word in CATALOG_KEYWORDS if word in text)
    if commercial_score > catalog_score and commercial_score > 0:
        return RequestCategory.COMMERCIAL_PROPOSAL
    if catalog_score > 0:
        return RequestCategory.CATALOG
    return RequestCategory.GENERAL


def _local_summarize(subject: str, body: str, category: RequestCategory) -> str:
    clean_body = re.sub(r"\s+", " ", body.strip())
    snippet = clean_body[:280] + ("..." if len(clean_body) > 280 else "")
    sender_hint = ""
    if "@" in subject:
        sender_hint = subject
    category_label = CATEGORY_LABELS[category]
    parts = [f"Тип: {category_label}."]
    if subject.strip():
        parts.append(f"Тема: {subject.strip()}.")
    parts.append(f"Суть: {snippet}")
    return " ".join(parts)


async def _analyze_with_groq(subject: str, body: str) -> AnalysisResult | None:
    if not settings.groq_api_key:
        return None

    prompt = f"""Ты помощник менеджера по продажам. Проанализируй входящее письмо и верни ТОЛЬКО JSON без markdown:
{{
  "category": "commercial_proposal" | "catalog" | "general",
  "summary": "краткий конспект на русском, 2-4 предложения: кто пишет, что нужно, сроки/объём если есть"
}}

Категории:
- commercial_proposal — запрос коммерческого предложения, цены, сметы
- catalog — запрос перечня, прайса, каталога, номенклатуры
- general — любой другой запрос или вопрос

Тема: {subject}
Текст письма:
{body[:4000]}"""

    headers = {
        "Authorization": f"Bearer {settings.groq_api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.groq_model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
        "max_tokens": 400,
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            parsed = _extract_json(content)
            if not parsed:
                return None
            category = _normalize_category(str(parsed.get("category", "general")))
            summary = str(parsed.get("summary", "")).strip()
            if not summary:
                return None
            return AnalysisResult(category=category, summary=summary, provider="groq")
    except (httpx.HTTPError, KeyError, IndexError, TypeError):
        return None


async def analyze_email(subject: str, body: str) -> AnalysisResult:
    ai_result = await _analyze_with_groq(subject, body)
    if ai_result:
        return ai_result

    category = _local_classify(subject, body)
    summary = _local_summarize(subject, body, category)
    return AnalysisResult(category=category, summary=summary, provider="local")
