import sys
import tempfile
import unittest
from pathlib import Path


APP_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(APP_DIR))

from src.request_store import (  # noqa: E402
    count_requests,
    get_request,
    init_store,
    list_requests,
    save_request,
    update_status,
)


class RequestStoreTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.db_path = Path(self.temp_dir.name) / "requests.db"
        init_store(self.db_path)
        self.record = {
            "id": "request-1",
            "sender_name": "Анна",
            "sender_email": "anna@example.ru",
            "company": "Пример",
            "subject": "Запрос КП",
            "body": "Рассчитайте стоимость поставки.",
            "summary": "Клиент просит рассчитать поставку.",
            "request_type": "Коммерческое предложение",
            "status": "Новый",
            "priority": "Обычный",
            "deadline": None,
            "items": ["Стол — 2 шт."],
            "received_at": "2026-09-29T10:00:00",
            "confidence": 88,
            "engine": "Локальный анализ",
            "source": "manual",
        }

    def tearDown(self) -> None:
        self.temp_dir.cleanup()

    def test_saves_and_reads_request(self) -> None:
        save_request(self.record, self.db_path)

        stored = get_request("request-1", self.db_path)
        self.assertEqual(count_requests(self.db_path), 1)
        self.assertIsNotNone(stored)
        self.assertEqual(stored["items"], ["Стол — 2 шт."])

    def test_filters_and_updates_status(self) -> None:
        save_request(self.record, self.db_path)
        update_status("request-1", "В работе", self.db_path)

        self.assertEqual(len(list_requests(self.db_path, status="Новый")), 0)
        self.assertEqual(len(list_requests(self.db_path, status="В работе")), 1)
        self.assertEqual(len(list_requests(self.db_path, search="пример")), 1)

    def test_rejects_unknown_status(self) -> None:
        save_request(self.record, self.db_path)

        with self.assertRaises(ValueError):
            update_status("request-1", "Удалён", self.db_path)


if __name__ == "__main__":
    unittest.main()
