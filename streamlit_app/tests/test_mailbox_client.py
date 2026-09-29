import unittest

from src.mailbox_client import parse_message


class MailboxClientTests(unittest.TestCase):
    def test_parses_utf8_message(self) -> None:
        raw_message = """From: =?utf-8?b?0JDQvdC90LAg0J/RgNC+0LLQsA==?= <anna@example.ru>
To: sales@example.com
Subject: =?utf-8?b?0JfQsNC/0YDQvtGBINCf0J8=?=
Date: Tue, 29 Sep 2026 12:00:00 +0300
Message-ID: <request-1@example.ru>
Content-Type: text/plain; charset=utf-8
Content-Transfer-Encoding: 8bit

Добрый день! Пришлите коммерческое предложение.
""".encode("utf-8")

        result = parse_message(raw_message)

        self.assertEqual(result["sender_name"], "Анна Прова")
        self.assertEqual(result["sender_email"], "anna@example.ru")
        self.assertEqual(result["subject"], "Запрос ПП")
        self.assertIn("коммерческое предложение", result["body"])
        self.assertEqual(result["status"], "Новое")

    def test_prefers_plain_text_over_html(self) -> None:
        raw_message = b"""From: user@example.com
Subject: Multipart
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary=part

--part
Content-Type: text/plain; charset=utf-8

Plain version
--part
Content-Type: text/html; charset=utf-8

<p>HTML version</p>
--part--
"""

        result = parse_message(raw_message)

        self.assertEqual(result["body"], "Plain version")


if __name__ == "__main__":
    unittest.main()
