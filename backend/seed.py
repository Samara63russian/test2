from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
from auth import get_password_hash

def seed_database(db: Session):
    # 1. Users
    if db.query(models.User).count() == 0:
        admin = models.User(
            username="admin",
            hashed_password=get_password_hash("admin123"),
            full_name="Иванов Алексей Петрович",
            role=models.UserRole.ADMIN,
            position="Главный государственный инспектор",
            is_active=True
        )
        inspector = models.User(
            username="inspector",
            hashed_password=get_password_hash("inspector123"),
            full_name="Смирнова Елена Сергеевна",
            role=models.UserRole.INSPECTOR,
            position="Ведущий специалист контроля",
            is_active=True
        )
        viewer = models.User(
            username="viewer",
            hashed_password=get_password_hash("viewer123"),
            full_name="Ковалев Дмитрий Андреевич",
            role=models.UserRole.VIEWER,
            position="Аналитик сводного отдела",
            is_active=True
        )
        db.add_all([admin, inspector, viewer])
        db.commit()

    # 2. Institutions
    if db.query(models.Institution).count() == 0:
        institutions = [
            models.Institution(
                name="Городская клиническая больница № 1 им. Н.И. Пирогова",
                category="Здравоохранение",
                code="ГКБ-1",
                address="г. Москва, Ленинский проспект, д. 8",
                head_name="Шабунин Алексей Васильевич",
                phone="+7 (495) 536-91-10",
                email="gkb1@zdrav.gov.ru",
                is_active=True
            ),
            models.Institution(
                name="Гимназия № 1514 с углубленным изучением математики",
                category="Образование",
                code="ГИМН-1514",
                address="г. Москва, ул. Крупской, д. 12",
                head_name="Белова Анна Михайловна",
                phone="+7 (499) 131-80-38",
                email="sch1514@edu.gov.ru",
                is_active=True
            ),
            models.Institution(
                name="Центр социального обслуживания населения «Южное Бутово»",
                category="Социальная защита",
                code="ЦСО-ЮБ",
                address="г. Москва, ул. Венёвская, д. 1",
                head_name="Григорьев Сергей Николаевич",
                phone="+7 (495) 716-41-29",
                email="tcso-butovo@soc.gov.ru",
                is_active=True
            ),
            models.Institution(
                name="Дворец культуры «Салют»",
                category="Культура и спорт",
                code="ДК-САЛЮТ",
                address="г. Москва, ул. Свободы, д. 37",
                head_name="Кузнецова Ольга Павловна",
                phone="+7 (495) 491-06-86",
                email="dk-salut@culture.gov.ru",
                is_active=True
            ),
            models.Institution(
                name="Многофункциональный центр государственных услуг «Мои Документы»",
                category="Государственные услуги",
                code="МФЦ-ЦАО",
                address="г. Москва, Пресненская наб., д. 2",
                head_name="Тимофеев Роман Викторович",
                phone="+7 (495) 777-77-77",
                email="mfc-cao@md.mos.ru",
                is_active=True
            ),
            models.Institution(
                name="Детская поликлиника № 118",
                category="Здравоохранение",
                code="ДГП-118",
                address="г. Москва, ул. Куликовская, д. 1Б",
                head_name="Волкова Наталья Ивановна",
                phone="+7 (495) 713-75-01",
                email="dgp118@zdrav.gov.ru",
                is_active=True
            )
        ]
        db.add_all(institutions)
        db.commit()

    # 3. Question Categories & Questions
    if db.query(models.QuestionCategory).count() == 0:
        cat_fire = models.QuestionCategory(name="Пожарная безопасность и охрана труда", code="FIRE_SAFETY", order=1)
        cat_san = models.QuestionCategory(name="Санитарно-эпидемиологический режим", code="SAN_NORM", order=2)
        cat_access = models.QuestionCategory(name="Доступная среда и условия для МГН", code="ACCESSIBILITY", order=3)
        cat_doc = models.QuestionCategory(name="Документационное обеспечение и регламенты", code="DOCS_REG", order=4)
        cat_infra = models.QuestionCategory(name="Материально-техническое состояние и оснащение", code="INFRASTRUCTURE", order=5)
        
        db.add_all([cat_fire, cat_san, cat_access, cat_doc, cat_infra])
        db.commit()

        questions = [
            # Пожарная безопасность
            models.Question(
                category_id=cat_fire.id,
                code="ПБ-01",
                text="Наличие и исправность автоматической пожарной сигнализации и системы оповещения",
                description="Проверяется наличие договора на обслуживание, журнал ТО и фактическая работоспособность датчиков",
                question_type=models.QuestionType.BOOLEAN,
                weight=1.5,
                is_required=True,
                order=1
            ),
            models.Question(
                category_id=cat_fire.id,
                code="ПБ-02",
                text="Обеспеченность первичными средствами пожаротушения (огнетушители, пожарные краны)",
                description="Сроки поверки и пломбировки огнетушителей, доступность пожарных шкафов",
                question_type=models.QuestionType.CHOICE,
                options=["Полное соответствие (100%)", "Частичное (требуется дозаправка)", "Неудовлетворительно"],
                weight=1.2,
                is_required=True,
                order=2
            ),
            models.Question(
                category_id=cat_fire.id,
                code="ПБ-03",
                text="Свободны ли пути эвакуации и эвакуационные выходы от посторонних предметов?",
                description="Ширина проходов, отсутствие замков на путях эвакуации в рабочее время",
                question_type=models.QuestionType.BOOLEAN,
                weight=1.5,
                is_required=True,
                order=3
            ),
            # Санитарные нормы
            models.Question(
                category_id=cat_san.id,
                code="САН-01",
                text="Соблюдение графика дезинфекции, влажной уборки и проветривания помещений",
                description="Наличие журналов кварцевания, уборки и сертифицированных дезинфицирующих средств",
                question_type=models.QuestionType.BOOLEAN,
                weight=1.0,
                is_required=True,
                order=4
            ),
            models.Question(
                category_id=cat_san.id,
                code="САН-02",
                text="Оценка микроклимата и освещенности рабочих и общественных зон (баллы 1-5)",
                description="1 - неудовлетворительно, 5 - отлично",
                question_type=models.QuestionType.SCALE,
                options=["1", "2", "3", "4", "5"],
                weight=1.0,
                is_required=True,
                order=5
            ),
            models.Question(
                category_id=cat_san.id,
                code="САН-03",
                text="Наличие актуальных медицинских книжек у персонала учреждения",
                description="Проверка своевременности прохождения периодических медосмотров",
                question_type=models.QuestionType.CHOICE,
                options=["У всех сотрудников", "Имеются единичные просрочки", "Отсутствуют у большинства"],
                weight=1.2,
                is_required=True,
                order=6
            ),
            # Доступная среда
            models.Question(
                category_id=cat_access.id,
                code="ДС-01",
                text="Оснащение входной группы пандусом / подъемным устройством для инвалидов",
                description="Нормативный уклон, нескользящее покрытие, поручни",
                question_type=models.QuestionType.BOOLEAN,
                weight=1.3,
                is_required=True,
                order=7
            ),
            models.Question(
                category_id=cat_access.id,
                code="ДС-02",
                text="Наличие тактильной плитки, мнемосхем и дублирования информации шрифтом Брайля",
                description="Навигация для слабовидящих и незрячих посетителей",
                question_type=models.QuestionType.BOOLEAN,
                weight=1.0,
                is_required=False,
                order=8
            ),
            models.Question(
                category_id=cat_access.id,
                code="ДС-03",
                text="Оборудован ли специализированный санузел для маломобильных граждан?",
                description="Широкий дверной проем, поручни, кнопка вызова экстренной помощи",
                question_type=models.QuestionType.BOOLEAN,
                weight=1.2,
                is_required=True,
                order=9
            ),
            # Документация
            models.Question(
                category_id=cat_doc.id,
                code="ДОК-01",
                text="Наличие актуальных локальных нормативных актов и должностных инструкций",
                description="Приказы по охране труда, пожарной безопасности, антитеррористической защищенности",
                question_type=models.QuestionType.BOOLEAN,
                weight=1.0,
                is_required=True,
                order=10
            ),
            models.Question(
                category_id=cat_doc.id,
                code="ДОК-02",
                text="Укомплектованность штатного расписания учреждения (%)",
                description="Указать фактический процент укомплектованности профильными кадрами",
                question_type=models.QuestionType.NUMBER,
                weight=1.0,
                is_required=False,
                order=11
            ),
            # Инфраструктура
            models.Question(
                category_id=cat_infra.id,
                code="МТО-01",
                text="Общая оценка технического состояния инженерных коммуникаций и здания (1-5)",
                description="Отопление, вентиляция, водоснабжение, целостность кровли и фасада",
                question_type=models.QuestionType.SCALE,
                options=["1", "2", "3", "4", "5"],
                weight=1.2,
                is_required=True,
                order=12
            ),
            models.Question(
                category_id=cat_infra.id,
                code="МТО-02",
                text="Оснащенность современным цифровым оборудованием и доступом в Интернет",
                description="Оценка степени информатизации и удовлетворенности сервисами",
                question_type=models.QuestionType.CHOICE,
                options=["Высокий уровень", "Средний уровень", "Устаревшее оборудование"],
                weight=1.0,
                is_required=False,
                order=13
            )
        ]
        db.add_all(questions)
        db.commit()

    # 4. Inspection Reports Sample Data for Initial View
    if db.query(models.InspectionReport).count() == 0:
        insts = db.query(models.Institution).all()
        admin_user = db.query(models.User).filter(models.User.username == "admin").first()
        inspector_user = db.query(models.User).filter(models.User.username == "inspector").first()
        qs = db.query(models.Question).all()

        if insts and qs:
            # Report 1: GKB 1 - completed last week
            rep1 = models.InspectionReport(
                institution_id=insts[0].id,
                inspector_id=admin_user.id if admin_user else None,
                inspection_date=datetime.utcnow() - timedelta(days=7),
                title=f"Плановая комплексная проверка: {insts[0].name}",
                status="completed",
                summary_text="Учреждение в целом готово к штатной эксплуатации. Пожарная сигнализация и средства первичного пожаротушения в идеальном состоянии. Требуется усилить контроль за ведением журнала дезинфекции и обновить указатели доступной среды.",
                recommendations="1. Произвести замену тактильных пиктограмм в корпусе Б до 25 числа.\n2. Провести внеплановый инструктаж ответственных лиц по ведению журнала дезинфекции.\n3. Доукомплектовать отделение реабилитации поручнями.",
                score=92.5
            )
            db.add(rep1)
            db.commit()

            # Answers for Rep1
            for q in qs:
                is_comp = True
                val = "Да"
                comm = "Замечаний нет"
                if q.code == "ДС-02":
                    is_comp = False
                    val = "Нет"
                    comm = "Отсутствует дублирование Брайлем на 2 этаже"
                elif q.code == "САН-02":
                    val = "5"
                    comm = "Вентиляция работает эффективно"
                elif q.code == "ПБ-02":
                    val = "Полное соответствие (100%)"
                elif q.code == "ДОК-02":
                    val = "96"
                elif q.code == "МТО-01":
                    val = "5"
                elif q.code == "МТО-02":
                    val = "Высокий уровень"
                
                ans = models.Answer(
                    report_id=rep1.id,
                    question_id=q.id,
                    value=val,
                    is_compliant=is_comp,
                    comment=comm
                )
                db.add(ans)

            # Report 2: School 1514 - completed 3 days ago
            rep2 = models.InspectionReport(
                institution_id=insts[1].id,
                inspector_id=inspector_user.id if inspector_user else None,
                inspection_date=datetime.utcnow() - timedelta(days=3),
                title=f"Мониторинг готовности к учебному процессу: {insts[1].name}",
                status="completed",
                summary_text="Все санитарные и противопожарные нормы строго соблюдены. Персонал имеет действующие медицинские книжки. Инженерные сети в отличном состоянии.",
                recommendations="Поддерживать установленный уровень материально-технического обеспечения.",
                score=98.0
            )
            db.add(rep2)
            db.commit()

            for q in qs:
                val = "Да"
                if q.question_type == models.QuestionType.SCALE:
                    val = "5"
                elif q.code == "ПБ-02":
                    val = "Полное соответствие (100%)"
                elif q.code == "МТО-02":
                    val = "Высокий уровень"
                elif q.code == "САН-03":
                    val = "У всех сотрудников"
                elif q.code == "ДОК-02":
                    val = "100"

                ans = models.Answer(
                    report_id=rep2.id,
                    question_id=q.id,
                    value=val,
                    is_compliant=True,
                    comment="Соответствует нормативам"
                )
                db.add(ans)

            # Report 3: DCSO - yesterday
            rep3 = models.InspectionReport(
                institution_id=insts[2].id,
                inspector_id=admin_user.id if admin_user else None,
                inspection_date=datetime.utcnow() - timedelta(days=1),
                title=f"Внеплановое обследование доступной среды: {insts[2].name}",
                status="completed",
                summary_text="Выявлены замечания по путям эвакуации и пандусу центрального входа. Требуется косметический ремонт входной группы.",
                recommendations="1. Освободить запасной выход от складских коробок.\n2. Установить противоскользящее резиновое покрытие на пандус.",
                score=78.5
            )
            db.add(rep3)
            db.commit()

            for q in qs:
                is_comp = True
                val = "Да"
                comm = "Норма"
                if q.code == "ПБ-03":
                    is_comp = False
                    val = "Нет"
                    comm = "В тамбуре обнаружено временное складирование мебели"
                elif q.code == "ДС-01":
                    is_comp = False
                    val = "Нет"
                    comm = "Покрытие пандуса скользкое при осадках"
                elif q.code == "МТО-01":
                    val = "3"
                    comm = "Требуется ремонт козырька"
                elif q.code == "ПБ-02":
                    val = "Частичное (требуется дозаправка)"
                    is_comp = False
                elif q.code == "САН-03":
                    val = "У всех сотрудников"
                elif q.code == "МТО-02":
                    val = "Средний уровень"
                elif q.code == "ДОК-02":
                    val = "89"
                elif q.code == "САН-02":
                    val = "4"

                ans = models.Answer(
                    report_id=rep3.id,
                    question_id=q.id,
                    value=val,
                    is_compliant=is_comp,
                    comment=comm
                )
                db.add(ans)

            db.commit()
