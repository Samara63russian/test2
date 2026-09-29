import hashlib
import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch


APP_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(APP_DIR))

from src.mailbox_client import fetch_unread  # noqa: E402


class FakeImap:
    def __init__(self, host: str, port: int, timeout: int) -> None:
        self.host = host
        self.port = port
        self.timeout = timeout

    def login(self, user: str, password: str):
        return "OK", []

    def select(self, folder: str, readonly: bool):
        return "OK", []

    def uid(self, command: str, uid, query: str):
        if command == "search":
            return "OK", [b"10 11 12"]
        if query == "(RFC822.SIZE)":
            return "OK", [f"1 (UID {uid.decode()} RFC822.SIZE 256)".encode()]
        payload = (
            b"From: Customer <customer@example.ru>\r\n"
            b"Subject: Request\r\n"
            b"Date: Tue, 29 Sep 2026 12:00:00 +0000\r\n"
            b"Message-ID: <mail-" + uid + b"@example.ru>\r\n"
            b"Content-Type: text/plain; charset=utf-8\r\n\r\n"
            b"Please send a quote."
        )
        return "OK", [(b"1 (BODY[] {256})", payload)]

    def logout(self):
        return "BYE", []


class MailboxClientTests(unittest.TestCase):
    @patch("src.mailbox_client.imaplib.IMAP4_SSL", FakeImap)
    def test_skips_processed_uids_and_takes_oldest_remaining(self) -> None:
        environment = {
            "IMAP_HOST": "imap.example.ru",
            "IMAP_PORT": "993",
            "IMAP_USER": "sales@example.ru",
            "IMAP_PASSWORD": "secret",
            "IMAP_FOLDER": "INBOX",
        }
        processed_source = "imap.example.ru|sales@example.ru|INBOX|10"
        processed_id = hashlib.sha256(processed_source.encode()).hexdigest()[:24]

        with patch.dict(os.environ, environment, clear=False):
            messages = fetch_unread(limit=1, skip_ids={processed_id})

        self.assertEqual(len(messages), 1)
        self.assertEqual(messages[0].subject, "Request")
        expected_source = "imap.example.ru|sales@example.ru|INBOX|11"
        expected_id = hashlib.sha256(expected_source.encode()).hexdigest()[:24]
        self.assertEqual(messages[0].sync_id, expected_id)


if __name__ == "__main__":
    unittest.main()
