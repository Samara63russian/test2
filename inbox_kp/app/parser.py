from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from email import message_from_bytes, policy
from email.header import decode_header, make_header
from email.message import EmailMessage, Message
from email.utils import parseaddr, parsedate_to_datetime
from html.parser import HTMLParser
from typing import Any


KIND_LABELS = {
    "kp": "Запрос КП",
    "catalog": "Перечень / прайс",
    "inquiry": "Запрос",
    "other": "Другое",
}


class _HTMLText(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []
        self._skip = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in {"script", "style"}:
            self._skip = True
        if tag in {"br", "p", "div", "tr", "li", "h1", "h2", "h3"}:
            self.parts.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style"}:
            self._skip = False
        if tag in {"p", "div", "tr", "li"}:
            self.parts.append("\n")

    def handle_data(self, data: str) -> None:
        if not self._skip:
            self.parts.append(data)


def html_to_text(html: str) -> str:
    parser = _HTMLText()
    try:
        parser.feed(html)
    except Exception:
        return re.sub(r"<[^>]+>", " ", html)
    text = "".join(parser.parts)
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def decode_mime(value: str | None) -> str:
    if not value:
        return ""
    try:
        return str(make_header(decode_header(value))).strip()
    except Exception:
        try:
            return decode_header(value)[0][0].decode("utf-8", "replace")  # type: ignore[union-attr]
        except Exception:
            return value


def _decode_bytes(payload: bytes, charset: str | None) -> str:
    encodings = [charset, "utf-8", "cp1251", "koi8-r", "latin-1"]
    for enc in encodings:
        if not enc:
            continue
        try:
            return payload.decode(enc, errors="strict")
        except Exception:
            continue
    return payload.decode("utf-8", errors="replace")


def extract_body(msg: Message) -> tuple[str, list[str]]:
    attachments: list[str] = []
    text_parts: list[str] = []
    html_parts: list[str] = []

    if msg.is_multipart():
        for part in msg.walk():
            ctype = part.get_content_type()
            disp = str(part.get_content_disposition() or "")
            filename = decode_mime(part.get_filename() or "")
            if filename or disp == "attachment":
                attachments.append(filename or ctype)
                continue
            payload = part.get_payload(decode=True)
            if not isinstance(payload, (bytes, bytearray)):
                continue
            charset = part.get_content_charset()
            decoded = _decode_bytes(bytes(payload), charset)
            if ctype == "text/plain":
                text_parts.append(decoded)
            elif ctype == "text/html":
                html_parts.append(decoded)
    else:
        payload = msg.get_payload(decode=True)
        if isinstance(payload, (bytes, bytearray)):
            decoded = _decode_bytes(bytes(payload), msg.get_content_charset())
            if msg.get_content_type() == "text/html":
                html_parts.append(decoded)
            else:
                text_parts.append(decoded)
        elif isinstance(payload, str):
            text_parts.append(payload)

    body = "\n\n".join(p.strip() for p in text_parts if p.strip())
    if not body and html_parts:
        body = html_to_text("\n".join(html_parts))
    return body.strip(), attachments


_RU_HEADERS = {
    "от": "From",
    "от кого": "From",
    "кому": "To",
    "тема": "Subject",
    "дата": "Date",
    "копия": "Cc",
}


def normalize_raw(raw: str) -> str:
    """Turn Outlook/Gmail copy-paste (including Russian labels) into RFC822-ish text."""
    text = raw.replace("\r\n", "\n").replace("\r", "\n").strip()
    if not text:
        return ""

    if re.search(r"(?im)^(from|subject|date|to|message-id)\s*:", text):
        return text

    lines = text.split("\n")
    headers: list[str] = []
    body_start = 0
    for i, line in enumerate(lines[:12]):
        m = re.match(r"^([^:]{2,24})\s*:\s*(.+)$", line.strip())
        if not m:
            if line.strip() == "":
                body_start = i + 1
                break
            if headers:
                body_start = i
                break
            continue
        key = m.group(1).strip().lower()
        mapped = _RU_HEADERS.get(key, m.group(1).strip().title())
        headers.append(f"{mapped}: {m.group(2).strip()}")
        body_start = i + 1

    if headers:
        rest = "\n".join(lines[body_start:]).lstrip("\n")
        return "\n".join(headers) + "\n\n" + rest

    first = lines[0].strip()
    subject = first[:180] if first else "Письмо без темы"
    return f"Subject: {subject}\nFrom: unknown@local\n\n{text}"


def parse_email(raw: str | bytes) -> dict[str, Any]:
    if isinstance(raw, str):
        raw = normalize_raw(raw)
        data = raw.encode("utf-8", errors="replace")
    else:
        data = raw

    msg = message_from_bytes(data, policy=policy.default)
    if not isinstance(msg, Message):
        msg = EmailMessage()

    subject = decode_mime(msg.get("Subject"))
    from_raw = decode_mime(msg.get("From"))
    name, addr = parseaddr(from_raw)
    to_raw = decode_mime(msg.get("To"))
    date_raw = msg.get("Date")
    received_at = datetime.now(timezone.utc)
    if date_raw:
        try:
            dt = parsedate_to_datetime(date_raw)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            received_at = dt
        except Exception:
            pass

    body, attachments = extract_body(msg)
    message_id = decode_mime(msg.get("Message-ID") or msg.get("Message-Id") or "")

    return {
        "subject": subject,
        "from_name": name.strip(),
        "from_email": addr.strip().lower(),
        "from_raw": from_raw,
        "to": to_raw,
        "body_text": body,
        "attachments": attachments,
        "message_id": message_id.strip("<> "),
        "received_at": received_at,
        "raw_headers": {k: decode_mime(v) for k, v in msg.items()},
    }


PHONE_RE = re.compile(
    r"(?:\+7|8)[\s\-(]?\d{3}[\s\-)]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}"
)
EMAIL_RE = re.compile(r"[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}", re.I)


def find_phones(text: str) -> list[str]:
    return list(dict.fromkeys(PHONE_RE.findall(text or "")))


def find_emails(text: str) -> list[str]:
    return [m.lower() for m in dict.fromkeys(EMAIL_RE.findall(text or ""))]


def to_json_list(value: Any) -> str:
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
            if isinstance(parsed, list):
                return json.dumps(parsed, ensure_ascii=False)
        except Exception:
            if value.strip():
                return json.dumps([value.strip()], ensure_ascii=False)
        return "[]"
    if isinstance(value, list):
        clean = [str(v).strip() for v in value if str(v).strip()]
        return json.dumps(clean, ensure_ascii=False)
    return "[]"
