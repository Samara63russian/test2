from __future__ import annotations

import email
import imaplib
import ssl
from email.header import decode_header
from typing import Any


def _decode(value: str | bytes | None) -> str:
    if value is None:
        return ""
    if isinstance(value, bytes):
        return value.decode("utf-8", errors="replace")
    return str(value)


def fetch_imap(
    host: str,
    username: str,
    password: str,
    folder: str = "INBOX",
    port: int = 993,
    limit: int = 30,
    unseen_only: bool = True,
) -> list[bytes]:
    if not host or not username or not password:
        raise ValueError("Укажите IMAP-сервер, логин и пароль")

    ctx = ssl.create_default_context()
    raw_messages: list[bytes] = []
    with imaplib.IMAP4_SSL(host, port, ssl_context=ctx) as imap:
        imap.login(username, password)
        imap.select(folder or "INBOX", readonly=True)
        criteria = "UNSEEN" if unseen_only else "ALL"
        status, data = imap.search(None, criteria)
        if status != "OK":
            raise RuntimeError("Не удалось прочитать папку IMAP")
        ids = data[0].split() if data and data[0] else []
        ids = ids[-limit:]
        for msg_id in reversed(ids):
            status, fetched = imap.fetch(msg_id, "(RFC822)")
            if status != "OK" or not fetched:
                continue
            for item in fetched:
                if isinstance(item, tuple) and len(item) >= 2 and isinstance(item[1], (bytes, bytearray)):
                    raw_messages.append(bytes(item[1]))
                    break
    return raw_messages


def peek_subjects(raw_messages: list[bytes]) -> list[dict[str, Any]]:
    out = []
    for raw in raw_messages:
        msg = email.message_from_bytes(raw)
        subj = msg.get("Subject") or ""
        try:
            subj = str(decode_header(subj)[0][0])
        except Exception:
            subj = _decode(subj)
        out.append({"subject": subj, "from": msg.get("From")})
    return out
