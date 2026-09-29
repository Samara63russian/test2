"""Small, session-only IMAP client used by the Streamlit application."""

from __future__ import annotations

import hashlib
import html
import imaplib
import re
from email import message_from_bytes, policy
from email.header import decode_header, make_header
from email.message import Message
from email.utils import parsedate_to_datetime, parseaddr
from typing import Any


def _decode_header(value: str | None) -> str:
    if not value:
        return ""
    try:
        return str(make_header(decode_header(value)))
    except (LookupError, UnicodeDecodeError):
        return value


def _html_to_text(value: str) -> str:
    without_blocks = re.sub(
        r"<(?:script|style)[^>]*>.*?</(?:script|style)>",
        " ",
        value,
        flags=re.IGNORECASE | re.DOTALL,
    )
    with_lines = re.sub(r"<(?:br|/p|/div|/li)\s*>", "\n", without_blocks, flags=re.I)
    return re.sub(r"\n{3,}", "\n\n", html.unescape(re.sub(r"<[^>]+>", " ", with_lines))).strip()


def _message_body(message: Message) -> str:
    plain_parts: list[str] = []
    html_parts: list[str] = []

    for part in message.walk() if message.is_multipart() else [message]:
        if part.get_content_disposition() == "attachment":
            continue
        content_type = part.get_content_type()
        if content_type not in {"text/plain", "text/html"}:
            continue
        try:
            content = part.get_content()
        except (LookupError, UnicodeDecodeError):
            payload = part.get_payload(decode=True) or b""
            content = payload.decode(part.get_content_charset() or "utf-8", errors="replace")
        if content_type == "text/plain":
            plain_parts.append(str(content))
        else:
            html_parts.append(_html_to_text(str(content)))

    return "\n".join(plain_parts or html_parts).strip()


def parse_message(raw_message: bytes, fallback_id: str = "") -> dict[str, Any]:
    """Parse RFC822 bytes into the app's serialisable email shape."""

    message = message_from_bytes(raw_message, policy=policy.default)
    sender_name, sender_email = parseaddr(_decode_header(message.get("From")))
    message_id = message.get("Message-ID") or fallback_id or raw_message[:80].hex()
    stable_id = hashlib.sha1(message_id.encode("utf-8", errors="ignore")).hexdigest()[:12]

    received_at = ""
    if message.get("Date"):
        try:
            received_at = parsedate_to_datetime(message.get("Date")).isoformat()
        except (TypeError, ValueError):
            received_at = _decode_header(message.get("Date"))

    return {
        "id": stable_id,
        "sender_name": _decode_header(sender_name) or sender_email or "Неизвестный отправитель",
        "sender_email": sender_email,
        "subject": _decode_header(message.get("Subject")) or "Без темы",
        "body": _message_body(message),
        "received_at": received_at,
        "status": "Новое",
        "source": "IMAP",
    }


def fetch_unseen_messages(
    *,
    host: str,
    port: int,
    username: str,
    password: str,
    folder: str = "INBOX",
    limit: int = 20,
    use_ssl: bool = True,
) -> list[dict[str, Any]]:
    """Fetch unseen emails without marking them as read."""

    client_class = imaplib.IMAP4_SSL if use_ssl else imaplib.IMAP4
    client = client_class(host, port, timeout=20)
    try:
        client.login(username, password)
        status, _ = client.select(folder, readonly=True)
        if status != "OK":
            raise ConnectionError(f"Не удалось открыть папку {folder}.")

        status, data = client.search(None, "UNSEEN")
        if status != "OK":
            raise ConnectionError("Не удалось получить список непрочитанных писем.")

        message_ids = data[0].split()[-limit:]
        messages: list[dict[str, Any]] = []
        for message_id in reversed(message_ids):
            status, parts = client.fetch(message_id, "(BODY.PEEK[])")
            if status != "OK":
                continue
            raw = next(
                (item[1] for item in parts if isinstance(item, tuple) and len(item) > 1),
                None,
            )
            if raw:
                messages.append(parse_message(raw, fallback_id=message_id.decode()))
        return messages
    finally:
        try:
            client.logout()
        except (imaplib.IMAP4.error, OSError):
            pass
