from pathlib import Path

from .auth import hash_password
from .database import SessionLocal, engine, Base
from .models import AnswerOption, Institution, Question, User, UserInstitution


SEED_QUESTIONS = [
    {
        "text": "Численность персонала на отчётную дату",
        "category": "Кадры",
        "answer_type": "number",
        "sort_order": 1,
        "answers": [],
    },
    {
        "text": "Наличие аварийных ситуаций за период",
        "category": "Безопасность",
        "answer_type": "choice",
        "sort_order": 2,
        "answers": [
            {"text": "Нет", "value": "no", "sort_order": 1},
            {"text": "Да, устранены", "value": "yes_fixed", "sort_order": 2},
            {"text": "Да, требуют внимания", "value": "yes_open", "sort_order": 3},
        ],
    },
    {
        "text": "Состояние материально-технической базы",
        "category": "Материалы",
        "answer_type": "choice",
        "sort_order": 3,
        "answers": [
            {"text": "Удовлетворительное", "value": "ok", "sort_order": 1},
            {"text": "Требует ремонта", "value": "repair", "sort_order": 2},
            {"text": "Критическое", "value": "critical", "sort_order": 3},
        ],
    },
    {
        "text": "Выполнение плановых мероприятий (%)",
        "category": "План",
        "answer_type": "number",
        "sort_order": 4,
        "answers": [],
    },
    {
        "text": "Комментарий руководителя",
        "category": "Общие",
        "answer_type": "text",
        "sort_order": 5,
        "is_required": False,
        "answers": [],
    },
]

SEED_INSTITUTIONS = [
    {"name": "ГБУЗ Поликлиника №1", "code": "P01", "address": "ул. Центральная, 1"},
    {"name": "ГБУЗ Поликлиника №2", "code": "P02", "address": "ул. Садовая, 15"},
    {"name": "ЦРБ Северный район", "code": "CRB-N", "address": "п. Северный, ул. Мира, 3"},
]


def seed_database() -> None:
    db_path = engine.url.database
    if db_path:
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.username == "admin").first():
            admin = User(
                username="admin",
                password_hash=hash_password("admin123"),
                full_name="Администратор",
                role="admin",
            )
            db.add(admin)
            db.flush()

            operator = User(
                username="operator",
                password_hash=hash_password("operator123"),
                full_name="Оператор заполнения",
                role="user",
            )
            db.add(operator)
            db.flush()

            institutions = []
            for item in SEED_INSTITUTIONS:
                inst = Institution(**item)
                db.add(inst)
                institutions.append(inst)
            db.flush()

            for inst in institutions:
                db.add(UserInstitution(user_id=operator.id, institution_id=inst.id))

            for item in SEED_QUESTIONS:
                answers = item.pop("answers", [])
                is_required = item.pop("is_required", True)
                q = Question(**item, is_required=is_required)
                db.add(q)
                db.flush()
                for ans in answers:
                    db.add(AnswerOption(question_id=q.id, **ans))

            db.commit()
    finally:
        db.close()
