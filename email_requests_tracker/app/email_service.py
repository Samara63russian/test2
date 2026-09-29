import email
import imaplib
import re
from dataclasses import dataclass
from email.header import decode_header
from email.utils import parseaddr

from app.config import settings


@dataclass
class ParsedEmail:
    subject: str
    sender: str
    body: str
    message_id: str | None


def _decode_header_value(value: str | None) -> str:
    if not value:
        return ""
    parts = decode_header(value)
    decoded: list[str] = []
    for content, charset in parts:
        if isinstance(content, bytes):
            decoded.append(content.decode(charset or "utf-8", errors="replace"))
        else:
            decoded.append(content)
    return "".join(decoded)


def _extract_body(msg: email.message.Message) -> str:
    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            disposition = str(part.get("Content-Disposition", ""))
            if content_type == "text/plain" and "attachment" not in disposition:
                payload = part.get_payload(decode=True)
                if payload:
                    charset = part.get_content_charset() or "utf-8"
                    return payload.decode(charset, errors="replace")
        for part in msg.walk():
            content_type = part.get_content_type()
            if content_type == "text/html":
                payload = part.get_payload(decode=True)
                if payload:
                    charset = part.get_content_charset() or "utf-8"
                    text = payload.decode(charset, errors="replace")
                    return re.sub(r"<[^>]+>", " ", text)
        return ""
    payload = msg.get_payload(decode=True)
    if not payload:
        return ""
    charset = msg.get_content_charset() or "utf-8"
    return payload.decode(charset, errors="replace")


def parse_raw_email(raw_bytes: bytes) -> ParsedEmail:
    msg = email.message_from_bytes(raw_bytes)
    subject = _decode_header_value(msg.get("Subject"))
    _, sender = parseaddr(msg.get("From", ""))
    body = _extract_body(msg).strip()
    message_id = msg.get("Message-ID")
    return ParsedEmail(subject=subject, sender=sender, body=body, message_id=message_id)


def fetch_imap_messages(limit: int = 20) -> list[ParsedEmail]:
    if not settings.imap_host or not settings.imap_username or not settings.imap_password:
        raise ValueError("IMAP не настроен. Укажите IMAP_HOST, IMAP_USERNAME и IMAP_PASSWORD.")

    connection = imaplib.IMAP4_SSL(settings.imap_host, settings.imap_port)
    try:
        connection.login(settings.imap_username, settings.imap_password)
        connection.select(settings.imap_folder)
        status, data = connection.search(None, "UNSEEN")
        if status != "OK":
            return []

        ids = data[0].split()
        selected_ids = ids[-limit:] if limit else ids
        messages: list[ParsedEmail] = []

        for msg_id in reversed(selected_ids):
            status, msg_data = connection.fetch(msg_id, "(RFC822)")
            if status != "OK" or not msg_data or not msg_data[0]:
                continue
            raw = msg_data[0][1]
            if not isinstance(raw, bytes):
                continue
            parsed = parse_raw_email(raw)
            if parsed.body.strip():
                messages.append(parsed)
        return messages
    finally:
        try:
            connection.logout()
        except imaplib.IMAP4.error:
            pass
