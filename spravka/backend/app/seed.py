from datetime import date, datetime, timedelta

from sqlalchemy.orm import Session

from .models import (
    Answer,
    AppSetting,
    DictionaryItem,
    Institution,
    Question,
    QuestionCategory,
    Report,
    User,
)
from .security import hash_password


def seed_if_empty(db: Session) -> None:
    if db.query(User).count() > 0:
        return

    settings = {
        "org_name": "Департамент образования городского округа",
        "org_header": "МУНИЦИПАЛЬНОЕ КАЗЁННОЕ УЧРЕЖДЕНИЕ\n«ИНФОРМАЦИОННО-МЕТОДИЧЕСКИЙ ЦЕНТР»",
        "org_city": "г. Самара",
        "footer_text": "Документ сформирован автоматически в системе сводных справок.",
        "document_title": "СВОДНАЯ СПРАВКА",
    }
    for key, value in settings.items():
        db.add(AppSetting(key=key, value=value))

    dict_rows = [
        ("institution_type", "Общеобразовательная школа", "school", 1),
        ("institution_type", "Гимназия", "gymnasium", 2),
        ("institution_type", "Лицей", "lyceum", 3),
        ("institution_type", "Детский сад", "kindergarten", 4),
        ("institution_type", "Учреждение дополнительного образования", "extra", 5),
        ("institution_type", "Колледж", "college", 6),
        ("district", "Железнодорожный район", "zh", 1),
        ("district", "Кировский район", "kir", 2),
        ("district", "Октябрьский район", "okt", 3),
        ("district", "Советский район", "sov", 4),
        ("district", "Промышленный район", "prom", 5),
        ("position", "Директор", "director", 1),
        ("position", "Заместитель директора", "deputy", 2),
        ("position", "Секретарь", "secretary", 3),
        ("position", "Оператор", "operator", 4),
    ]
    for group, name, code, order in dict_rows:
        db.add(DictionaryItem(group_code=group, name=name, code=code, sort_order=order))

    institutions = [
        Institution(
            name="МБОУ СОШ № 12",
            code="012",
            type_code="school",
            district="Кировский район",
            address="ул. Гагарина, д. 15",
            phone="+7 (846) 111-12-12",
            email="school12@edu.local",
            head_name="Иванова М.П.",
        ),
        Institution(
            name="МБОУ Гимназия № 1",
            code="001",
            type_code="gymnasium",
            district="Октябрьский район",
            address="пр. Ленина, д. 40",
            phone="+7 (846) 222-01-01",
            email="gym1@edu.local",
            head_name="Петров А.С.",
        ),
        Institution(
            name="МБДОУ Детский сад № 45",
            code="045",
            type_code="kindergarten",
            district="Советский район",
            address="ул. Победы, д. 8",
            phone="+7 (846) 333-45-45",
            email="ds45@edu.local",
            head_name="Сидорова Е.В.",
        ),
        Institution(
            name="МБОУ Лицей № 3",
            code="003",
            type_code="lyceum",
            district="Промышленный район",
            address="ул. Мира, д. 21",
            phone="+7 (846) 444-03-03",
            email="lyceum3@edu.local",
            head_name="Кузнецов Д.И.",
        ),
    ]
    db.add_all(institutions)
    db.flush()

    admin = User(
        username="admin",
        password_hash=hash_password("admin123"),
        full_name="Администратор системы",
        role="admin",
    )
    operator = User(
        username="operator",
        password_hash=hash_password("operator123"),
        full_name="Оператор сводки",
        role="operator",
        institution_id=institutions[0].id,
    )
    db.add_all([admin, operator])
    db.flush()

    categories = [
        QuestionCategory(name="Общие сведения", sort_order=1),
        QuestionCategory(name="Кадровое обеспечение", sort_order=2),
        QuestionCategory(name="Контингент и результаты", sort_order=3),
        QuestionCategory(name="Материально-техническая база", sort_order=4),
        QuestionCategory(name="Безопасность и питание", sort_order=5),
    ]
    db.add_all(categories)
    db.flush()

    questions = [
        Question(category_id=categories[0].id, text="Дата составления справки (факт)", answer_type="date", sort_order=1, required=False),
        Question(category_id=categories[0].id, text="ФИО ответственного лица", answer_type="text", hint="Кто заполнил справку", sort_order=2),
        Question(category_id=categories[0].id, text="Должность ответственного лица", answer_type="select", options="Директор\nЗаместитель директора\nСекретарь\nОператор", sort_order=3),
        Question(category_id=categories[0].id, text="Режим работы учреждения", answer_type="select", options="5-дневная неделя\n6-дневная неделя\nСмешанный", sort_order=4),
        Question(category_id=categories[1].id, text="Численность педагогических работников", answer_type="number", sort_order=1),
        Question(category_id=categories[1].id, text="Количество вакансий", answer_type="number", sort_order=2),
        Question(category_id=categories[1].id, text="Прошли повышение квалификации за период", answer_type="number", sort_order=3),
        Question(category_id=categories[1].id, text="Комментарий по кадрам", answer_type="textarea", required=False, sort_order=4),
        Question(category_id=categories[2].id, text="Численность обучающихся / воспитанников", answer_type="number", sort_order=1),
        Question(category_id=categories[2].id, text="Средняя наполняемость групп / классов", answer_type="number", sort_order=2),
        Question(category_id=categories[2].id, text="Есть ли отстающие / нуждающиеся в доп. поддержке", answer_type="yesno", sort_order=3),
        Question(category_id=categories[2].id, text="Краткое описание результатов работы", answer_type="textarea", sort_order=4),
        Question(category_id=categories[3].id, text="Требуется ли текущий ремонт", answer_type="yesno", sort_order=1),
        Question(category_id=categories[3].id, text="Обеспеченность компьютерами, %", answer_type="number", sort_order=2),
        Question(category_id=categories[3].id, text="Замечания по МТБ", answer_type="textarea", required=False, sort_order=3),
        Question(category_id=categories[4].id, text="Охват горячим питанием, %", answer_type="number", sort_order=1),
        Question(category_id=categories[4].id, text="Были ли происшествия за период", answer_type="yesno", sort_order=2),
        Question(category_id=categories[4].id, text="Описание происшествий / мер", answer_type="textarea", required=False, sort_order=3),
    ]
    db.add_all(questions)
    db.flush()

    today = date.today()
    sample_answers = [
        {
            "date_fact": today.isoformat(),
            "fio": "Иванова М.П.",
            "pos": "Директор",
            "mode": "5-дневная неделя",
            "staff": "42",
            "vac": "2",
            "train": "18",
            "staff_c": "Вакансии учителя физики и английского языка.",
            "kids": "612",
            "avg": "26",
            "need": "Да",
            "res": "Проведены ВПР, олимпиады школьного этапа. Успеваемость 98%.",
            "repair": "Да",
            "pc": "86",
            "mtb": "Требуется косметический ремонт актового зала.",
            "food": "94",
            "inc": "Нет",
            "inc_d": "",
        },
        {
            "date_fact": (today - timedelta(days=7)).isoformat(),
            "fio": "Петров А.С.",
            "pos": "Директор",
            "mode": "6-дневная неделя",
            "staff": "55",
            "vac": "0",
            "train": "22",
            "staff_c": "",
            "kids": "780",
            "avg": "28",
            "need": "Да",
            "res": "Лицей подтвердил высокие результаты ГИА. Открыт новый профиль.",
            "repair": "Нет",
            "pc": "100",
            "mtb": "",
            "food": "97",
            "inc": "Нет",
            "inc_d": "",
        },
        {
            "date_fact": (today - timedelta(days=3)).isoformat(),
            "fio": "Сидорова Е.В.",
            "pos": "Директор",
            "mode": "5-дневная неделя",
            "staff": "28",
            "vac": "1",
            "train": "9",
            "staff_c": "Вакансия младшего воспитателя.",
            "kids": "164",
            "avg": "21",
            "need": "Нет",
            "res": "Реализуется программа адаптации младших групп. Заболеваемость снижена.",
            "repair": "Да",
            "pc": "70",
            "mtb": "Требуется замена покрытия на игровой площадке.",
            "food": "100",
            "inc": "Нет",
            "inc_d": "",
        },
    ]

    samples = [
        (institutions[0], operator, today, "submitted", sample_answers[0]),
        (institutions[1], admin, today - timedelta(days=7), "submitted", sample_answers[1]),
        (institutions[2], admin, today - timedelta(days=3), "submitted", sample_answers[2]),
        (institutions[0], operator, today - timedelta(days=30), "draft", sample_answers[0]),
    ]
    key_order = [
        "date_fact", "fio", "pos", "mode", "staff", "vac", "train", "staff_c",
        "kids", "avg", "need", "res", "repair", "pc", "mtb", "food", "inc", "inc_d",
    ]
    for inst, user, rdate, status, payload in samples:
        report = Report(
            institution_id=inst.id,
            user_id=user.id,
            report_date=rdate,
            status=status,
            submitted_at=datetime.utcnow() if status == "submitted" else None,
        )
        db.add(report)
        db.flush()
        for q, key in zip(questions, key_order):
            db.add(Answer(report_id=report.id, question_id=q.id, value=payload.get(key, "")))

    db.commit()
