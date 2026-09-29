"""Realistic sample inbox shown before a mailbox is connected."""

from __future__ import annotations

from datetime import datetime, timedelta

from .mail_intelligence import analyse_message


def _message(
    *,
    message_id: str,
    sender_name: str,
    sender_email: str,
    company: str,
    subject: str,
    body: str,
    minutes_ago: int,
    status: str = "Новое",
) -> dict:
    return {
        "id": message_id,
        "sender_name": sender_name,
        "sender_email": sender_email,
        "company": company,
        "subject": subject,
        "body": body,
        "received_at": (datetime.now() - timedelta(minutes=minutes_ago)).isoformat(),
        "status": status,
        "source": "Демо",
        "analysis": analyse_message(subject, body),
    }


def demo_messages() -> list[dict]:
    return [
        _message(
            message_id="mail-1006",
            sender_name="Анна Воронова",
            sender_email="a.voronova@stroyline.ru",
            company="СтройЛайн",
            subject="Срочно: КП на комплект вентиляции",
            body="""Добрый день!

Просим подготовить коммерческое предложение на поставку:
- Приточная установка Breezart 2700 Aqua — 2 шт.
- Воздуховод оцинкованный 200 мм — 48 м.
- Решётка вентиляционная 600×300 — 12 шт.

Объект запускаем в октябре. Предложение нужно сегодня до конца дня.
Бюджет — до 1 200 000 рублей. Укажите сроки поставки и условия оплаты.

С уважением,
Анна Воронова
ООО «СтройЛайн»""",
            minutes_ago=12,
        ),
        _message(
            message_id="mail-1005",
            sender_name="Михаил Седов",
            sender_email="m.sedov@northlog.ru",
            company="НордЛогистик",
            subject="Актуальный перечень складского оборудования",
            body="""Здравствуйте.

Направьте, пожалуйста, актуальный перечень складского оборудования:
1. Электрические штабелёры
2. Гидравлические тележки
3. Стеллажные системы

Также интересуют минимальная партия и доставка в Архангельск.

Михаил, НордЛогистик""",
            minutes_ago=34,
        ),
        _message(
            message_id="mail-1004",
            sender_name="Елена Самойлова",
            sender_email="samoylova@medprofi.ru",
            company="МедПрофи",
            subject="Запрос стоимости расходных материалов",
            body="""Коллеги, добрый день!

Рассчитайте, пожалуйста, стоимость ежемесячной поставки расходных
материалов для трёх клиник. Спецификацию приложили к письму.
Ответ ожидаем не позднее 03.10.2026.

С уважением, Елена Самойлова""",
            minutes_ago=58,
        ),
        _message(
            message_id="mail-1003",
            sender_name="Игорь Киреев",
            sender_email="i.kireev@volta.energy",
            company="Volta Energy",
            subject="Вопрос по гарантийному обслуживанию",
            body="""Добрый день.

Подскажите, распространяется ли гарантия на контроллеры, установленные
вашим партнёром? Один из блоков показывает ошибку E-14. Серийный номер
готовы прислать ответным письмом.

Спасибо, Игорь""",
            minutes_ago=92,
            status="В работе",
        ),
        _message(
            message_id="mail-1002",
            sender_name="Ольга Мельник",
            sender_email="purchase@grandhotel.ru",
            company="Grand Hotel",
            subject="Коммерческое предложение для отеля",
            body="""Здравствуйте!

Нам требуется коммерческое предложение на текстиль для 120 номеров:
- Комплект постельного белья, сатин — 240 шт.
- Полотенце банное белое — 360 шт.
- Халат махровый — 120 шт.

Просьба указать возможность брендирования и образцы.

Ольга Мельник, отдел закупок""",
            minutes_ago=146,
        ),
        _message(
            message_id="mail-1001",
            sender_name="Павел Левин",
            sender_email="levin@agroregion.ru",
            company="АгроРегион",
            subject="Каталог запчастей на 2026 год",
            body="""Добрый день!

Можно получить новый каталог запчастей и прайс-лист на 2026 год?
Отдельно интересуют позиции для тракторов серии К-7.

Павел Левин""",
            minutes_ago=205,
            status="Обработано",
        ),
    ]
