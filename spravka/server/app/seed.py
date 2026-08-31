from sqlalchemy.orm import Session

from .auth import hash_password
from .models import AnswerOption, Institution, Question, User


def seed_if_empty(db: Session) -> None:
    if db.query(User).count() > 0:
        return

    admin = User(
        username="admin",
        password_hash=hash_password("admin123"),
        full_name="Администратор системы",
        role="admin",
    )
    operator = User(
        username="operator",
        password_hash=hash_password("operator123"),
        full_name="Оператор заполнения",
        role="user",
    )
    db.add_all([admin, operator])

    institutions = [
        Institution(
            name="ГБУЗ «Городская поликлиника №1»",
            code="GP-001",
            address="г. Самара, ул. Ленина, 10",
            description="Основное лечебно-профилактическое учреждение",
        ),
        Institution(
            name="МБОУ СОШ №42",
            code="SCH-042",
            address="г. Самара, пр. Кирова, 25",
            description="Общеобразовательная школа",
        ),
        Institution(
            name="ГБУ СО «Центр социального обслуживания»",
            code="CSO-003",
            address="г. Самара, ул. Молодогвардейская, 5",
            description="Социальное обслуживание населения",
        ),
    ]
    db.add_all(institutions)

    questions_data = [
        {
            "text": "Количество обслуживаемых граждан за период",
            "question_type": "number",
            "sort_order": 1,
            "help_text": "Укажите целое число",
            "options": [],
        },
        {
            "text": "Форма оказания услуги",
            "question_type": "single",
            "sort_order": 2,
            "help_text": "",
            "options": ["Стационарно", "Амбулаторно", "На дому", "Дистанционно"],
        },
        {
            "text": "Категории получателей",
            "question_type": "multi",
            "sort_order": 3,
            "help_text": "Можно выбрать несколько",
            "options": [
                "Дети",
                "Пенсионеры",
                "Инвалиды",
                "Многодетные семьи",
                "Иные категории",
            ],
        },
        {
            "text": "Имеются ли замечания по качеству",
            "question_type": "yesno",
            "sort_order": 4,
            "options": ["Да", "Нет"],
        },
        {
            "text": "Краткое описание проведённых мероприятий",
            "question_type": "text",
            "sort_order": 5,
            "required": True,
            "options": [],
        },
        {
            "text": "Дата следующего контрольного мероприятия",
            "question_type": "date",
            "sort_order": 6,
            "required": False,
            "options": [],
        },
    ]

    for item in questions_data:
        q = Question(
            text=item["text"],
            question_type=item["question_type"],
            sort_order=item["sort_order"],
            required=item.get("required", True),
            help_text=item.get("help_text", ""),
        )
        for idx, opt in enumerate(item["options"]):
            q.options.append(AnswerOption(text=opt, sort_order=idx))
        db.add(q)

    db.commit()
