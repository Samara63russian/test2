import os
import sys
import unittest
from pathlib import Path


APP_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(APP_DIR))

from src.email_ai import REQUEST_TYPES, analyze_email, analyze_locally  # noqa: E402


class EmailAnalysisTests(unittest.TestCase):
    def setUp(self) -> None:
        os.environ.pop("OLLAMA_BASE_URL", None)
        os.environ.pop("ALLOW_REMOTE_OLLAMA", None)

    def test_extracts_quote_items_deadline_and_priority(self) -> None:
        result = analyze_locally(
            "Срочный запрос КП",
            """Просим рассчитать стоимость:
            - Стол переговорный — 2 шт.
            - Кресло офисное — 8 шт.
            Коммерческое предложение нужно до 5 октября.""",
        )

        self.assertTrue(result.relevant)
        self.assertEqual(result.request_type, REQUEST_TYPES["quote"])
        self.assertEqual(result.deadline, "5 октября")
        self.assertEqual(result.priority, "Высокий")
        self.assertEqual(len(result.items), 2)
        self.assertGreaterEqual(result.confidence, 80)

    def test_classifies_price_list_request(self) -> None:
        result = analyze_locally(
            "Прайс-лист",
            "Добрый день. Пришлите актуальный перечень товаров и условия для дилеров.",
        )

        self.assertTrue(result.relevant)
        self.assertEqual(result.request_type, REQUEST_TYPES["price_list"])

    def test_ignores_non_request_message(self) -> None:
        result = analyze_locally(
            "Новости компании",
            "В этом месяце наша команда открыла новый офис. Спасибо, что вы с нами.",
        )

        self.assertFalse(result.relevant)
        self.assertEqual(result.confidence, 35)

    def test_remote_ollama_requires_explicit_secure_opt_in(self) -> None:
        os.environ["OLLAMA_BASE_URL"] = "http://untrusted.example.com"

        result = analyze_email(
            "Запрос КП",
            "Просим рассчитать стоимость поставки десяти кресел.",
        )

        self.assertEqual(result.engine, "Локальный анализ")
        self.assertTrue(result.relevant)


if __name__ == "__main__":
    unittest.main()
