import unittest

from src.mail_intelligence import analyse_message, generate_reply_draft


class MailIntelligenceTests(unittest.TestCase):
    def test_detects_quote_request_and_extracts_details(self) -> None:
        body = """Добрый день!
Просим срочно подготовить коммерческое предложение:
- Насос циркуляционный — 4 шт.
- Шкаф управления — 1 шт.
Ответ нужен до 12.10.2026. Бюджет до 500 000 рублей.
"""

        result = analyse_message("Запрос стоимости", body)

        self.assertEqual(result["category"], "Запрос КП")
        self.assertEqual(result["priority"], "Высокий")
        self.assertEqual(result["deadline"], "12.10.2026")
        self.assertEqual(result["budget"], "500 000 рублей")
        self.assertEqual(len(result["items"]), 2)

    def test_detects_catalog_request(self) -> None:
        result = analyse_message(
            "Новый каталог",
            "Пришлите актуальный перечень оборудования и условия доставки.",
        )

        self.assertEqual(result["category"], "Запрос перечня")
        self.assertEqual(result["priority"], "Обычный")

    def test_defaults_to_general_request(self) -> None:
        result = analyse_message(
            "Гарантийное обслуживание",
            "Подскажите, действует ли гарантия после замены детали?",
        )

        self.assertEqual(result["category"], "Общий запрос")
        self.assertEqual(result["deadline"], "Не указан")
        self.assertEqual(result["budget"], "Не указан")

    def test_reply_draft_uses_contact_and_deadline(self) -> None:
        message = {
            "sender_name": "Анна Воронова",
            "analysis": {
                "category": "Запрос КП",
                "deadline": "12.10.2026",
            },
        }

        draft = generate_reply_draft(message)

        self.assertIn("Здравствуйте, Анна!", draft)
        self.assertIn("коммерческое предложение", draft)
        self.assertIn("12.10.2026", draft)


if __name__ == "__main__":
    unittest.main()
