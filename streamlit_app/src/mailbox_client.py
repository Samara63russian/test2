"""Read-only IMAP synchronization for incoming email."""

from __future__ import annotations

import email
import hashlib
import imaplib
import os
import re
from dataclasses import dataclass
from email.header import decode_header, make_header
from email.message import Message
from email.utils import parseaddr, parsedate_to_datetime
from html import unescape


@dataclass(frozen=True)
class IncomingEmail:
    id: str
    sender_name: str
    sender_email: str
    subject: str
    body: str
    received_at: str


def is_configured() -> bool:
    return all(
        os.getenv(name)
        for name in ("IMAP_HOST", "IMAP_USER", "IMAP_PASSWORD")
    )


def _decode(value: str | None) -> str:
    if not value:
        return ""
    try:
        return str(make_header(decode_header(value)))
    except (LookupError, UnicodeDecodeError):
        return value


def _html_to_text(value: str) -> str:
    value = re.sub(r"<style.*?</style>|<script.*?</script>", " ", value, flags=re.I | re.S)
    value = re.sub(r"<br\s*/?>|</p>|</div>", "\n", value, flags=re.I)
    value = re.sub(r"<[^>]+>", " ", value)
    value = unescape(value)
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def _part_text(part: Message) -> str:
    payload = part.get_payload(decode=True)
    if payload is None:
        return ""
    charset = part.get_content_charset() or "utf-8"
    try:
        return payload.decode(charset, errors="replace")
    except LookupError:
        return payload.decode("utf-8", errors="replace")


def _message_body(message: Message) -> str:
    plain_parts: list[str] = []
    html_parts: list[str] = []
    parts = message.walk() if message.is_multipart() else [message]
    for part in parts:
        content_type = part.get_content_type()
        disposition = str(part.get("Content-Disposition", "")).lower()
        if "attachment" in disposition:
            continue
        if content_type == "text/plain":
            plain_parts.append(_part_text(part))
        elif content_type == "text/html":
            html_parts.append(_part_text(part))
    if plain_parts:
        return "\n".join(plain_parts).strip()
    return _html_to_text("\n".join(html_parts))


def fetch_unread(limit: int = 30) -> list[IncomingEmail]:
    """Fetch unread messages without changing their read status."""

    if not is_configured():
        raise RuntimeError("IMAP connection is not configured")

    host = os.environ["IMAP_HOST"]
    port = int(os.getenv("IMAP_PORT", "993"))
    folder = os.getenv("IMAP_FOLDER", "INBOX")
    client = imaplib.IMAP4_SSL(host, port)
    try:
        client.login(os.environ["IMAP_USER"], os.environ["IMAP_PASSWORD"])
        status, _ = client.select(folder, readonly=True)
        if status != "OK":
            raise RuntimeError(f"Cannot open IMAP folder: {folder}")
        status, data = client.search(None, "UNSEEN")
        if status != "OK":
            raise RuntimeError("Cannot search the IMAP inbox")

        messages: list[IncomingEmail] = []
        for message_number in data[0].split()[-limit:]:
            status, raw_data = client.fetch(message_number, "(BODY.PEEK[])")
            if status != "OK" or not raw_data or not isinstance(raw_data[0], tuple):
                continue
            message = email.message_from_bytes(raw_data[0][1])
            sender_name, sender_email = parseaddr(_decode(message.get("From")))
            subject = _decode(message.get("Subject")) or "Без темы"
            message_id = message.get("Message-ID", "").strip()
            stable_source = message_id or f"{sender_email}:{subject}:{message.get('Date', '')}"
            request_id = hashlib.sha256(stable_source.encode("utf-8")).hexdigest()[:16]
            try:
                received_at = parsedate_to_datetime(message.get("Date")).isoformat()
            except (TypeError, ValueError, OverflowError):
                received_at = ""
            messages.append(
                IncomingEmail(
                    id=request_id,
                    sender_name=sender_name or sender_email.split("@")[0],
                    sender_email=sender_email,
                    subject=subject,
                    body=_message_body(message),
                    received_at=received_at,
                )
            )
        return messages
    finally:
        try:
            client.logout()
        except imaplib.IMAP4.error:
            pass
