from sqlalchemy.orm import Session

from app.auth import get_password_hash
from app.models import Institution, Question, QuestionOption, ReferenceItem, User


def seed_database(db: Session) -> None:
    if db.query(User).first():
        return

    admin = User(
        username="admin",
        password_hash=get_password_hash("admin123"),
        full_name="Администратор",
        role="admin",
    )
    user = User(
        username="user",
        password_hash=get_password_hash("user123"),
        full_name="Пользователь",
        role="user",
    )
    db.add_all([admin, user])

    institutions = [
        Institution(name="ГБУЗ Городская больница №1", address="ул. Ленина, 10", contact="+7 (495) 111-22-33"),
        Institution(name="МБОУ Средняя школа №5", address="ул. Школьная, 3", contact="+7 (495) 222-33-44"),
        Institution(name="Детский сад «Солнышко»", address="ул. Садовая, 7", contact="+7 (495) 333-44-55"),
    ]
    db.add_all(institutions)

    questions_data = [
        ("Общие", "Укажите дату проведения проверки", "date", 1),
        ("Общие", "Количество посетителей/пациентов", "number", 2),
        ("Общие", "Общая оценка состояния", "select", 3),
        ("Безопасность", "Соблюдаются ли требования пожарной безопасности?", "select", 4),
        ("Безопасность", "Опишите выявленные нарушения", "textarea", 5),
        ("Персонал", "Достаточность штата", "select", 6),
        ("Персонал", "Комментарии по персоналу", "textarea", 7),
        ("Инфраструктура", "Состояние здания и помещений", "select", 8),
        ("Инфраструктура", "Необходимые ремонтные работы", "textarea", 9),
        ("Итог", "Рекомендации и предложения", "textarea", 10),
    ]

    select_options = {
        3: ["Отлично", "Хорошо", "Удовлетворительно", "Неудовлетворительно"],
        4: ["Да", "Нет", "Частично"],
        6: ["Достаточно", "Недостаточно", "Избыточно"],
        8: ["Хорошее", "Удовлетворительное", "Требует ремонта", "Аварийное"],
    }

    for category, text, qtype, order in questions_data:
        q = Question(
            text=text,
            question_type=qtype,
            category=category,
            sort_order=order,
        )
        db.add(q)
        db.flush()
        for i, opt_text in enumerate(select_options.get(order, [])):
            db.add(QuestionOption(question_id=q.id, text=opt_text, sort_order=i))

    references = [
        ("Нормативы", "СанПиН 2.4.3648-20", "Санитарно-эпидемиологические требования к организациям воспитания и обучения."),
        ("Нормативы", "Приказ Минздрава № 541н", "Требования к медицинским организациям."),
        ("Шаблоны", "Формулировка нарушения", "При проверке выявлено несоответствие требованиям..."),
        ("Шаблоны", "Формулировка рекомендации", "Рекомендуется в срок до ... устранить..."),
    ]
    for i, (cat, title, content) in enumerate(references):
        db.add(ReferenceItem(category=cat, title=title, content=content, sort_order=i))

    db.commit()
