from __future__ import annotations

import json
import os
import re
from typing import Any

import httpx

from .parser import find_emails, find_phones


SYSTEM_PROMPT = """Ты секретарь отдела продаж российской B2B-компании.
По входящему письму верни ТОЛЬКО JSON без markdown:

{
  "kind": "kp" | "catalog" | "inquiry" | "other",
  "title": "короткий заголовок до 90 символов",
  "summary": "конспект на 3-5 предложений: кто, что нужно, условия, сроки",
  "action": "один следующий шаг для менеджера",
  "company": "компания или пусто",
  "contact_name": "имя отправителя или пусто",
  "phone": "телефон или пусто",
  "products": ["позиции"],
  "quantity": "объём/количество или пусто",
  "deadline": "срок если есть, иначе пусто",
  "urgency": "low" | "normal" | "high"
}

Правила kind:
- kp — просят коммерческое предложение, котировку, цену на конкретную поставку, RFQ/RFP, счёт-оферту.
- catalog — просят перечень, прайс, каталог, номенклатуру, наличие без конкретной сделки.
- inquiry — уточнение, статус заказа, сроки, документы, простой вопрос.
- other — рассылка, спам, не про продажи.

Пиши summary и action по-русски, деловым языком, без воды."""


KP_WORDS = (
    "коммерческ",
    "запрос кп",
    "кп на",
    "котировк",
    "quotation",
    "quote request",
    "rfq",
    "rfp",
    "прошу цену",
    "запрос цен",
    "предложен",
    "оферт",
    "спецификац",
    "стоимость постав",
    "расчёт стоимости",
)
CATALOG_WORDS = (
    "перечень",
    "прайс",
    "каталог",
    "номенклатур",
    "price list",
    "наличие на склад",
    "актуальн",
    "ассортимент",
    "вышлите список",
    "направьте список",
)
INQUIRY_WORDS = (
    "подскажите",
    "уточн",
    "вопрос",
    "срок отгруз",
    "когда будет",
    "статус заказ",
    "оплачен",
    "закрывающие",
    "акт сверк",
    "счет на оплату уже",
)
OTHER_WORDS = (
    "увеличьте продаж",
    "суперскидк",
    "холодных звонков",
    "unsubscribe",
    "вы выиграли",
    "только сегодня супер",
)
HIGH_WORDS = (
    "срочно",
    "asap",
    "сегодня",
    "до конца дня",
    "критичн",
    "hot",
    "неотложн",
)


def _blob(*parts: str) -> str:
    return "\n".join(p for p in parts if p).lower()


def classify_kind(subject: str, body: str) -> str:
    text = _blob(subject, body)
    kp_hits = sum(1 for w in KP_WORDS if w in text)
    cat_hits = sum(1 for w in CATALOG_WORDS if w in text)
    inq_hits = sum(1 for w in INQUIRY_WORDS if w in text)

    # Strong KP phrases win even if "перечень" is mentioned as a line-item list.
    if "коммерческ" in text or "rfq" in text or "запрос кп" in text or "кп на" in text:
        return "kp"
    if any(w in text for w in OTHER_WORDS) and kp_hits == 0 and cat_hits == 0:
        return "other"
    if cat_hits and cat_hits >= kp_hits and "коммерческ" not in text:
        return "catalog"
    if kp_hits > cat_hits and kp_hits > 0:
        return "kp"
    if cat_hits > 0:
        return "catalog"
    if inq_hits > 0:
        return "inquiry"
    return "other"


def classify_urgency(subject: str, body: str) -> str:
    text = _blob(subject, body)
    if any(w in text for w in HIGH_WORDS):
        return "high"
    if any(w in text for w in ("когда удобно", "без спешки", "планово")):
        return "low"
    return "normal"


def _first_sentences(text: str, n: int = 3) -> str:
    clean = re.sub(r"\s+", " ", (text or "").strip())
    if not clean:
        return "Текст письма пустой — конспект не из чего собрать."
    parts = re.split(r"(?<=[.!?])\s+", clean)
    return " ".join(parts[:n])[:700]


def _guess_company(from_name: str, from_email: str, body: str) -> str:
    legal = r"(?:ООО|АО|ПАО|ЗАО|ОАО|ИП|ТОО)"
    quoted = re.search(legal + r"\s*[«\"][^»\"]+[»\"]", body or "")
    if quoted:
        return quoted.group(0).strip()
    plain = re.search(legal + r"\s+[А-ЯЁA-Z][\w\-. ]{1,50}", body or "")
    if plain:
        return plain.group(0).strip()
    domain = from_email.split("@")[-1] if from_email and "@" in from_email else ""
    if domain and domain not in {"gmail.com", "mail.ru", "yandex.ru", "ya.ru", "outlook.com", "hotmail.com"}:
        stem = domain.split(".")[0]
        return stem.replace("-", " ").title()
    return from_name


def _guess_products(body: str) -> list[str]:
    products: list[str] = []
    skip_start = re.compile(r"^(добрый|здравствуйте|прошу|коллеги|здравствуй)", re.I)
    for line in (body or "").splitlines():
        s = line.strip(" -•\t")
        if not s or skip_start.match(s):
            continue
        if re.search(r"\d+\s*(шт|комплект|т|кг|м|м2|поз)", s, re.I) and 8 < len(s) < 140:
            products.append(s)
            continue
        if re.search(r"(гост|ту\s|арт\.|модель|марки)\s", s, re.I) and 8 < len(s) < 140:
            products.append(s)
    if not products:
        for match in re.finditer(
            r"[—\-–]\s*\d[\d\s]*\s*(?:шт|комплект|м|т|кг)",
            body or "",
            re.I,
        ):
            left = (body or "")[max(0, match.start() - 48) : match.start()]
            left = re.split(r"[\n.;:]", left)[-1]
            left = re.sub(r"^(?:на|прошу|нужно|просит)\s+", "", left.strip(), flags=re.I)
            left = re.sub(r"^.*\bна\s+", "", left)
            chunk = re.sub(r"\s+", " ", f"{left} {match.group(0)}").strip(" .")
            if chunk and not skip_start.match(chunk) and 6 < len(chunk) < 140:
                products.append(chunk)
    return products[:8]


def _guess_deadline(text: str) -> str:
    patterns = (
        r"до\s+\d{1,2}[\./]\d{1,2}(?:[\./]\d{2,4})?",
        r"до\s+\d{1,2}\s+[а-яё]+(?:\s+\d{4})?",
        r"в течение\s+\d+\s+[а-яё]+",
        r"срок поставки\s*[—\-:]*\s*[^\n.]{0,40}",
    )
    blob = text or ""
    for pattern in patterns:
        m = re.search(pattern, blob, re.I)
        if m:
            return m.group(0).strip(" .")
    return ""


def heuristic_analyze(parsed: dict[str, Any]) -> dict[str, Any]:
    subject = parsed.get("subject") or ""
    body = parsed.get("body_text") or ""
    kind = classify_kind(subject, body)
    urgency = classify_urgency(subject, body)
    phones = find_phones(body) or find_phones(parsed.get("from_raw") or "")
    emails = find_emails(body)
    products = _guess_products(body)
    company = _guess_company(parsed.get("from_name") or "", parsed.get("from_email") or "", body)
    contact = parsed.get("from_name") or ""
    deadline = _guess_deadline(subject + "\n" + body)
    title = subject.strip() or {
        "kp": "Запрос коммерческого предложения",
        "catalog": "Запрос перечня / прайса",
        "inquiry": "Входящий запрос",
        "other": "Письмо",
    }[kind]

    summary_bits = [_first_sentences(body, 3)]
    if company:
        summary_bits.insert(0, f"Отправитель: {company}.")
    if products:
        summary_bits.append("Позиции: " + "; ".join(products[:4]) + ".")
    if deadline:
        summary_bits.append(f"Срок: {deadline}.")

    actions = {
        "kp": "Подготовить коммерческое предложение и уточнить остатки/срок производства.",
        "catalog": "Выслать актуальный перечень (прайс) и отметить наличие.",
        "inquiry": "Ответить по существу и зафиксировать договорённость в карточке.",
        "other": "Проверить, относится ли письмо к продажам; иначе закрыть.",
    }

    return {
        "kind": kind,
        "title": title[:180],
        "summary": " ".join(summary_bits).strip(),
        "action": actions[kind],
        "company": company,
        "contact_name": contact,
        "phone": phones[0] if phones else "",
        "products": products,
        "quantity": ", ".join(re.findall(r"\d+\s*(?:шт|комплект|т|кг)", body, re.I)[:4]),
        "deadline": deadline,
        "urgency": urgency,
        "extra_emails": emails,
        "provider": "heuristic",
    }


def _extract_json(text: str) -> dict[str, Any] | None:
    if not text:
        return None
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.I | re.S).strip()
    try:
        data = json.loads(text)
        return data if isinstance(data, dict) else None
    except Exception:
        m = re.search(r"\{.*\}", text, re.S)
        if not m:
            return None
        try:
            data = json.loads(m.group(0))
            return data if isinstance(data, dict) else None
        except Exception:
            return None


def _merge_ai(base: dict[str, Any], ai: dict[str, Any], provider: str) -> dict[str, Any]:
    out = dict(base)
    kind = str(ai.get("kind") or out["kind"]).lower()
    if kind not in {"kp", "catalog", "inquiry", "other"}:
        kind = out["kind"]
    urgency = str(ai.get("urgency") or out["urgency"]).lower()
    if urgency not in {"low", "normal", "high"}:
        urgency = out["urgency"]
    products = ai.get("products") or out.get("products") or []
    if isinstance(products, str):
        products = [p.strip() for p in re.split(r"[;\n,]", products) if p.strip()]
    out.update(
        {
            "kind": kind,
            "title": str(ai.get("title") or out["title"])[:180],
            "summary": str(ai.get("summary") or out["summary"]).strip(),
            "action": str(ai.get("action") or out["action"]).strip(),
            "company": str(ai.get("company") or out["company"]).strip(),
            "contact_name": str(ai.get("contact_name") or out["contact_name"]).strip(),
            "phone": str(ai.get("phone") or out["phone"]).strip(),
            "products": products,
            "quantity": str(ai.get("quantity") or out["quantity"]).strip(),
            "deadline": str(ai.get("deadline") or out["deadline"]).strip(),
            "urgency": urgency,
            "provider": provider,
        }
    )
    return out


def _user_payload(parsed: dict[str, Any]) -> str:
    return json.dumps(
        {
            "from": parsed.get("from_raw") or f"{parsed.get('from_name')} <{parsed.get('from_email')}>",
            "subject": parsed.get("subject"),
            "date": str(parsed.get("received_at")),
            "body": (parsed.get("body_text") or "")[:8000],
        },
        ensure_ascii=False,
    )


async def _groq(parsed: dict[str, Any], api_key: str, model: str) -> dict[str, Any] | None:
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "model": model or "llama-3.1-8b-instant",
        "temperature": 0.1,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": _user_payload(parsed)},
        ],
    }
    async with httpx.AsyncClient(timeout=40) as client:
        r = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
        )
        r.raise_for_status()
        content = r.json()["choices"][0]["message"]["content"]
        return _extract_json(content)


async def _openai_compatible(
    parsed: dict[str, Any], base_url: str, api_key: str, model: str
) -> dict[str, Any] | None:
    url = base_url.rstrip("/") + "/chat/completions"
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    payload = {
        "model": model or "llama3.1",
        "temperature": 0.1,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": _user_payload(parsed)},
        ],
    }
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(url, headers=headers, json=payload)
        r.raise_for_status()
        content = r.json()["choices"][0]["message"]["content"]
        return _extract_json(content)


async def _gemini(parsed: dict[str, Any], api_key: str, model: str) -> dict[str, Any] | None:
    model = model or "gemini-2.0-flash"
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        f"?key={api_key}"
    )
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": SYSTEM_PROMPT + "\n\nПисьмо:\n" + _user_payload(parsed)}],
            }
        ],
        "generationConfig": {"temperature": 0.1, "responseMimeType": "application/json"},
    }
    async with httpx.AsyncClient(timeout=40) as client:
        r = await client.post(url, json=payload)
        r.raise_for_status()
        text = r.json()["candidates"][0]["content"]["parts"][0]["text"]
        return _extract_json(text)


def settings_from_env(store: dict[str, str]) -> dict[str, str]:
    merged = dict(store)
    env_map = {
        "groq_api_key": "GROQ_API_KEY",
        "gemini_api_key": "GEMINI_API_KEY",
        "openai_api_key": "OPENAI_API_KEY",
        "openai_base_url": "OPENAI_BASE_URL",
        "ai_model": "AI_MODEL",
        "imap_host": "IMAP_HOST",
        "imap_user": "IMAP_USER",
        "imap_password": "IMAP_PASSWORD",
        "imap_folder": "IMAP_FOLDER",
    }
    for key, env in env_map.items():
        if not merged.get(key) and os.getenv(env):
            merged[key] = os.getenv(env, "")
    return merged


async def analyze_email(parsed: dict[str, Any], settings: dict[str, str]) -> dict[str, Any]:
    base = heuristic_analyze(parsed)
    settings = settings_from_env(settings)
    errors: list[str] = []

    groq_key = (settings.get("groq_api_key") or "").strip()
    gemini_key = (settings.get("gemini_api_key") or "").strip()
    openai_key = (settings.get("openai_api_key") or "").strip()
    openai_url = (settings.get("openai_base_url") or "").strip()
    model = (settings.get("ai_model") or "").strip()

    try:
        if groq_key:
            ai = await _groq(parsed, groq_key, model or "llama-3.1-8b-instant")
            if ai:
                return _merge_ai(base, ai, "groq")
        if gemini_key:
            ai = await _gemini(parsed, gemini_key, model or "gemini-2.0-flash")
            if ai:
                return _merge_ai(base, ai, "gemini")
        if openai_url:
            ai = await _openai_compatible(parsed, openai_url, openai_key, model)
            if ai:
                return _merge_ai(base, ai, "openai-compatible")
    except Exception as exc:
        errors.append(str(exc))
        base["ai_error"] = errors[-1][:400]

    base["provider"] = "heuristic"
    return base
