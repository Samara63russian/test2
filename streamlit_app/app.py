import re
from datetime import datetime

import streamlit as st


st.set_page_config(
    page_title="Briefly — входящие запросы",
    page_icon="✦",
    layout="wide",
    initial_sidebar_state="expanded",
)


COLORS = {
    "navy": "#101A2C",
    "muted": "#748198",
    "green": "#16A877",
    "green_light": "#E7F7F1",
    "orange": "#E9964A",
    "orange_light": "#FFF2E6",
    "purple": "#6F62D8",
    "purple_light": "#EFEDFF",
    "border": "#E5E9F0",
    "surface": "#FFFFFF",
}


def inject_styles() -> None:
    st.markdown(
        """
        <style>
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap');
        :root { --navy: #101A2C; --muted: #748198; --green: #16A877; --border: #E5E9F0; }
        html, body, [class*="css"] { font-family: 'DM Sans', sans-serif; }
        .stApp { background: #F7F8FA; color: var(--navy); }
        [data-testid="stSidebar"] { background: #FFFFFF; border-right: 1px solid var(--border); }
        [data-testid="stSidebar"] > div:first-child { padding: 30px 22px; }
        .block-container { max-width: 1480px; padding: 32px 48px 60px; }
        h1, h2, h3 { font-family: 'Manrope', sans-serif; color: var(--navy); letter-spacing: -0.03em; }
        h1 { font-size: 31px !important; margin-bottom: 2px !important; }
        h2 { font-size: 22px !important; }
        p { color: var(--muted); }
        .brand { display: flex; align-items: center; gap: 10px; margin: 0 0 45px 4px; }
        .brand-mark { width: 31px; height: 31px; border-radius: 10px; background: #101A2C; color: #fff;
                      display:flex; align-items:center; justify-content:center; font-size:18px; }
        .brand-name { font-family:'Manrope', sans-serif; font-weight:800; font-size:20px; color:#101A2C; }
        .brand-name span { color: #16A877; }
        .eyebrow { color:#16A877; text-transform:uppercase; font-size:11px; font-weight:700; letter-spacing:.14em; margin-bottom:9px; }
        .page-subtitle { color:#748198; font-size:14px; margin:0 0 27px; }
        .sidebar-label { color:#A0A9B8; text-transform:uppercase; letter-spacing:.13em; font-size:10px; font-weight:700; margin:0 4px 10px; }
        .sidebar-foot { border-top:1px solid #EDF0F4; padding-top:20px; margin-top:35px; }
        .connected { display:flex; gap:9px; align-items:center; color:#526075; font-size:12px; }
        .dot { width:8px; height:8px; background:#16A877; border-radius:50%; display:inline-block; box-shadow:0 0 0 4px #E7F7F1; }
        .ai-card { background:#F2F8F6; border:1px solid #D9EFE7; border-radius:12px; padding:13px; margin-top:12px; }
        .ai-card-title { color:#167B5B; font-size:12px; font-weight:700; margin-bottom:5px; }
        .ai-card-text { color:#6C847D; font-size:11px; line-height:1.45; }
        .kpi { background:#fff; border:1px solid var(--border); border-radius:13px; padding:18px 20px; min-height:99px; }
        .kpi-label { color:#8B96A8; font-size:12px; margin-bottom:8px; }
        .kpi-value { color:#101A2C; font-family:'Manrope',sans-serif; font-size:25px; font-weight:800; line-height:1; }
        .kpi-meta { color:#16A877; font-size:11px; margin-top:9px; }
        .kpi-meta.neutral { color:#8B96A8; }
        .section-head { display:flex; align-items:center; justify-content:space-between; margin:29px 0 14px; }
        .section-head h2 { margin:0; }
        .section-count { color:#9AA4B3; font-size:12px; font-weight:500; }
        .mail-card { background:#fff; border:1px solid var(--border); border-radius:13px; padding:17px 19px 15px;
                     margin-bottom:10px; transition: border .15s ease; }
        .mail-card.unread { border-left:3px solid #16A877; padding-left:17px; }
        .mail-top { display:flex; align-items:center; gap:11px; margin-bottom:10px; }
        .avatar { height:33px; width:33px; background:#EEF1F7; border-radius:10px; display:flex; align-items:center;
                  justify-content:center; color:#65728A; font-weight:700; font-size:12px; flex:none; }
        .sender { font-size:13px; font-weight:700; color:#19243A; }
        .company { color:#95A0B0; font-size:11px; margin-top:2px; }
        .mail-time { color:#98A2B1; font-size:11px; margin-left:auto; align-self:flex-start; }
        .mail-subject { color:#17233A; font-size:13px; font-weight:600; margin-bottom:6px; }
        .mail-summary { color:#7B8799; font-size:12px; line-height:1.45; margin-bottom:12px; }
        .pill { display:inline-block; border-radius:5px; padding:4px 7px; font-size:10px; font-weight:700; margin-right:6px; }
        .pill.green { color:#147D5B; background:#E7F7F1; }
        .pill.orange { color:#BB6D25; background:#FFF2E6; }
        .pill.purple { color:#5E55B6; background:#EFEDFF; }
        .pill.gray { color:#748198; background:#F1F3F6; }
        .confidence { color:#A3ACB9; font-size:10px; }
        .detail-card { background:#fff; border:1px solid var(--border); border-radius:15px; padding:23px; position:sticky; top:22px; }
        .detail-title { font-family:'Manrope',sans-serif; color:#17233A; font-weight:800; font-size:18px; line-height:1.3; margin:13px 0 17px; }
        .detail-label { color:#A0A9B8; text-transform:uppercase; letter-spacing:.1em; font-size:9px; font-weight:700; margin-top:19px; margin-bottom:7px; }
        .detail-text { color:#56647A; font-size:12px; line-height:1.55; }
        .fact { display:flex; gap:10px; padding:10px 0; border-bottom:1px solid #F0F2F5; }
        .fact:last-child { border-bottom:0; }
        .fact-icon { width:23px; color:#16A877; font-size:14px; }
        .fact-key { color:#929DAE; font-size:11px; flex:1; }
        .fact-value { color:#34435A; font-size:11px; font-weight:600; text-align:right; max-width:58%; }
        .empty-state { background:#fff; border:1px dashed #D6DCE5; border-radius:13px; padding:42px 20px; text-align:center; color:#8A96A8; }
        .empty-icon { font-size:28px; margin-bottom:8px; }
        .notice { background:#F1F8FF; color:#5D7691; border-radius:9px; border:1px solid #DCECF9; padding:10px 13px; font-size:12px; }
        [data-testid="stMetric"] { background:#fff; border:1px solid var(--border); border-radius:13px; padding:17px 19px; }
        [data-testid="stMetricLabel"] { color:#8B96A8; }
        [data-testid="stMetricValue"] { color:#101A2C; font-family:'Manrope',sans-serif; }
        div[data-testid="stButton"] > button { border-radius:8px; font-size:12px; font-weight:600; border-color:#E1E6ED; color:#42516A; }
        div[data-testid="stButton"] > button[kind="primary"] { background:#101A2C; border-color:#101A2C; color:#fff; }
        .stTextInput input, .stTextArea textarea, .stSelectbox div[data-baseweb="select"] { border-radius:8px; }
        .stTabs [data-baseweb="tab-list"] { gap: 18px; border-bottom: 1px solid var(--border); }
        .stTabs [data-baseweb="tab"] { color:#8893A4; font-size:12px; padding: 0 2px 12px; }
        .stTabs [aria-selected="true"] { color:#101A2C; font-weight:700; }
        </style>
        """,
        unsafe_allow_html=True,
    )


def demo_emails() -> list[dict]:
    return [
        {
            "id": "mail-1",
            "sender": "Иван Петров",
            "email": "i.petrov@stroytech.ru",
            "company": "ООО «СтройТех»",
            "subject": "Запрос КП на поставку кабеля ВВГнг",
            "body": "Добрый день! Просим направить коммерческое предложение на кабель ВВГнг-LS 3х2,5 — 2 400 м и ВВГнг-LS 5х6 — 800 м. Важно указать цену, срок поставки и условия оплаты. Ждём ответ до 15 октября.",
            "summary": "Нужны цены и сроки поставки двух видов кабеля. Клиент ждёт ответ до 15 октября.",
            "category": "КП",
            "priority": "Высокий",
            "confidence": 98,
            "status": "Новое",
            "received": "Сегодня, 09:42",
            "initials": "ИП",
            "deadline": "15 октября",
            "items": "Кабель ВВГнг-LS 3×2,5 и 5×6",
            "quantity": "3 200 м",
            "note": "",
        },
        {
            "id": "mail-2",
            "sender": "Анна Смирнова",
            "email": "a.smirnova@electrosnab.ru",
            "company": "«ЭлектроСнаб»",
            "subject": "Перечень необходимых позиций на ноябрь",
            "body": "Коллеги, направляю предварительный перечень материалов на ноябрь. Нужны автоматические выключатели ABB S201 и контакторы Schneider LC1D. Подскажите, пожалуйста, что есть на складе и какие актуальные цены.",
            "summary": "Запрос наличия и актуальных цен на автоматы ABB и контакторы Schneider для поставки в ноябре.",
            "category": "Перечень",
            "priority": "Средний",
            "confidence": 94,
            "status": "Новое",
            "received": "Сегодня, 08:16",
            "initials": "АС",
            "deadline": "Ноябрь",
            "items": "ABB S201, Schneider LC1D",
            "quantity": "Не указано",
            "note": "",
        },
        {
            "id": "mail-3",
            "sender": "Михаил Орлов",
            "email": "m.orlov@proekt-plus.ru",
            "company": "«Проект Плюс»",
            "subject": "Вопрос по возможной поставке",
            "body": "Здравствуйте! Подскажите, можете ли вы поставить насосы Grundfos для нового объекта? Интересует доступность модели CR 32-4 и ориентировочная стоимость. Пока собираем информацию для проекта.",
            "summary": "Клиент уточняет возможность поставки насоса Grundfos CR 32-4 и его ориентировочную стоимость.",
            "category": "Запрос",
            "priority": "Средний",
            "confidence": 91,
            "status": "Новое",
            "received": "Вчера, 17:34",
            "initials": "МО",
            "deadline": "Не указан",
            "items": "Насос Grundfos CR 32-4",
            "quantity": "Не указано",
            "note": "",
        },
        {
            "id": "mail-4",
            "sender": "Елена Власова",
            "email": "e.vlasova@regionstroy.ru",
            "company": "«РегионСтрой»",
            "subject": "КП на металлопрокат для объекта",
            "body": "Добрый день. Пришлите, пожалуйста, предложение на арматуру А500С: 12 мм — 4 тонны, 16 мм — 7 тонн. Нужна доставка до нашего склада в Туле.",
            "summary": "Запрос коммерческого предложения на 11 тонн арматуры А500С с доставкой в Тулу.",
            "category": "КП",
            "priority": "Высокий",
            "confidence": 97,
            "status": "В работе",
            "received": "Вчера, 14:10",
            "initials": "ЕВ",
            "deadline": "Не указан",
            "items": "Арматура А500С 12 мм и 16 мм",
            "quantity": "11 т",
            "note": "Уточнить адрес доставки и форму оплаты.",
        },
        {
            "id": "mail-5",
            "sender": "Дмитрий Волков",
            "email": "d.volkov@marketline.ru",
            "company": "«МаркетЛайн»",
            "subject": "Нужна информация по светильникам",
            "body": "Коллеги, подскажите срок поставки и минимальную партию для светильника L-Office 36W. Планируем закупку в декабре.",
            "summary": "Запрос срока поставки и минимальной партии светильников L-Office 36W.",
            "category": "Запрос",
            "priority": "Низкий",
            "confidence": 89,
            "status": "Новое",
            "received": "Пн, 11:28",
            "initials": "ДВ",
            "deadline": "Декабрь",
            "items": "Светильник L-Office 36W",
            "quantity": "Не указано",
            "note": "",
        },
    ]


def analyze_email(sender: str, email: str, subject: str, body: str) -> dict:
    """Rule-based local analysis: free, private, and useful without an API key."""
    text = f"{subject} {body}".lower()
    if any(word in text for word in ("коммерческ", "запрос кп", "предложен", "цена", "стоимость")):
        category, confidence = "КП", 96
    elif any(word in text for word in ("перечень", "список", "позици", "ассортимент")):
        category, confidence = "Перечень", 94
    else:
        category, confidence = "Запрос", 88

    priority = "Высокий" if any(word in text for word in ("срочно", "до ", "тендер", "срок")) else "Средний"
    if category == "Запрос" and "ориентиров" not in text and "стоим" not in text:
        priority = "Низкий"
    sentences = [part.strip() for part in re.split(r"[.!?]\s+", body) if part.strip()]
    summary = " ".join(sentences[:2])
    deadline_match = re.search(r"до\s+([^.,;!\n]+)", body, flags=re.IGNORECASE)
    deadline = deadline_match.group(1).strip() if deadline_match else "Не указан"
    known_items = [
        "ВВГнг-LS", "ABB S201", "Schneider LC1D", "Grundfos CR 32-4",
        "арматур", "светильник",
    ]
    items = ", ".join(item for item in known_items if item.lower() in text) or "Нужно уточнить"
    initials = "".join(part[0] for part in sender.split()[:2]).upper()
    return {
        "id": f"mail-{datetime.now().timestamp()}",
        "sender": sender or "Неизвестный отправитель",
        "email": email or "Не указан",
        "company": email.split("@")[-1] if "@" in email else "Новая компания",
        "subject": subject or "Без темы",
        "body": body,
        "summary": summary or "Не удалось выделить краткое содержание.",
        "category": category,
        "priority": priority,
        "confidence": confidence,
        "status": "Новое",
        "received": "Только что",
        "initials": initials or "??",
        "deadline": deadline,
        "items": items,
        "quantity": "Не указано",
        "note": "",
    }


def category_class(category: str) -> str:
    return {"КП": "green", "Перечень": "orange", "Запрос": "purple"}.get(category, "gray")


def priority_class(priority: str) -> str:
    return {"Высокий": "orange", "Средний": "purple", "Низкий": "gray"}.get(priority, "gray")


def render_mail_card(mail: dict) -> None:
    unread_class = " unread" if mail["status"] == "Новое" else ""
    st.markdown(
        f"""
        <div class="mail-card{unread_class}">
          <div class="mail-top">
            <div class="avatar">{mail['initials']}</div>
            <div><div class="sender">{mail['sender']}</div><div class="company">{mail['company']} · {mail['email']}</div></div>
            <div class="mail-time">{mail['received']}</div>
          </div>
          <div class="mail-subject">{mail['subject']}</div>
          <div class="mail-summary">{mail['summary']}</div>
          <span class="pill {category_class(mail['category'])}">{mail['category']}</span>
          <span class="pill {priority_class(mail['priority'])}">{mail['priority']} приоритет</span>
          <span class="confidence">AI точность {mail['confidence']}%</span>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_sidebar() -> str:
    with st.sidebar:
        st.markdown(
            '<div class="brand"><div class="brand-mark">✦</div><div class="brand-name">briefly<span>.</span></div></div>',
            unsafe_allow_html=True,
        )
        st.markdown('<div class="sidebar-label">Рабочее пространство</div>', unsafe_allow_html=True)
        section = st.radio(
            "Раздел",
            ["Входящие", "Записи", "Настройки"],
            label_visibility="collapsed",
            key="section",
        )
        st.markdown('<div class="sidebar-foot">', unsafe_allow_html=True)
        st.markdown('<div class="sidebar-label">Источник писем</div>', unsafe_allow_html=True)
        st.markdown(
            '<div class="connected"><span class="dot"></span><span>Демо-входящие подключены</span></div>',
            unsafe_allow_html=True,
        )
        st.caption("Письма обновляются вручную. Подключение IMAP можно добавить в настройках.")
        st.markdown(
            '<div class="ai-card"><div class="ai-card-title">✦ AI-анализ включён</div>'
            '<div class="ai-card-text">Локальные правила выделяют тип запроса, сроки, товары и приоритет — без платного API и передачи текста наружу.</div></div>',
            unsafe_allow_html=True,
        )
        st.markdown("</div>", unsafe_allow_html=True)
    return section


def add_email_form() -> None:
    with st.expander("Добавить письмо для анализа", expanded=True):
        st.markdown("Вставьте текст письма — Briefly автоматически создаст запись и определит тип запроса.")
        with st.form("new_email_form", clear_on_submit=True):
            left, right = st.columns(2)
            with left:
                sender = st.text_input("Отправитель", placeholder="Имя Фамилия")
                email = st.text_input("Email", placeholder="name@company.ru")
                subject = st.text_input("Тема письма", placeholder="Например, запрос КП на поставку")
            with right:
                body = st.text_area("Текст письма", height=124, placeholder="Вставьте содержание входящего письма...")
            submitted = st.form_submit_button("✦ Проанализировать письмо", type="primary")
        if submitted:
            if not body.strip() and not subject.strip():
                st.error("Добавьте хотя бы тему или текст письма.")
            else:
                new_mail = analyze_email(sender, email, subject, body)
                st.session_state.emails.insert(0, new_mail)
                st.session_state.selected_id = new_mail["id"]
                st.session_state.flash = "Письмо проанализировано и добавлено в записи."
                st.rerun()


def update_mail(mail_id: str, **updates) -> None:
    for mail in st.session_state.emails:
        if mail["id"] == mail_id:
            mail.update(updates)
            break


def render_detail(mail: dict) -> None:
    if not mail:
        st.markdown(
            '<div class="empty-state"><div class="empty-icon">✉</div><div>Выберите письмо,<br>чтобы открыть запись</div></div>',
            unsafe_allow_html=True,
        )
        return
    st.markdown('<div class="detail-card">', unsafe_allow_html=True)
    st.markdown(
        f'<span class="pill {category_class(mail["category"])}">{mail["category"]}</span>'
        f'<span class="pill {priority_class(mail["priority"])}">{mail["priority"]}</span>',
        unsafe_allow_html=True,
    )
    st.markdown(f'<div class="detail-title">{mail["subject"]}</div>', unsafe_allow_html=True)
    st.markdown(
        f'<div class="detail-text"><b>{mail["sender"]}</b><br>{mail["email"]}<br><span style="color:#A0A9B8">{mail["company"]} · {mail["received"]}</span></div>',
        unsafe_allow_html=True,
    )
    st.markdown('<div class="detail-label">Краткий конспект</div>', unsafe_allow_html=True)
    st.markdown(f'<div class="notice">✦ &nbsp;{mail["summary"]}</div>', unsafe_allow_html=True)
    st.markdown('<div class="detail-label">Что извлёк AI</div>', unsafe_allow_html=True)
    st.markdown(
        f"""
        <div class="fact"><div class="fact-icon">⌁</div><div class="fact-key">Товары / услуги</div><div class="fact-value">{mail['items']}</div></div>
        <div class="fact"><div class="fact-icon">◷</div><div class="fact-key">Срок</div><div class="fact-value">{mail['deadline']}</div></div>
        <div class="fact"><div class="fact-icon">▤</div><div class="fact-key">Количество</div><div class="fact-value">{mail['quantity']}</div></div>
        """,
        unsafe_allow_html=True,
    )
    st.markdown('<div class="detail-label">Оригинал письма</div>', unsafe_allow_html=True)
    with st.expander("Показать текст письма"):
        st.caption(mail["body"])
    st.markdown('<div class="detail-label">Внутренняя заметка</div>', unsafe_allow_html=True)
    note = st.text_area(
        "Внутренняя заметка",
        value=mail.get("note", ""),
        placeholder="Например: запросить наличие у поставщика...",
        label_visibility="collapsed",
        key=f"note-{mail['id']}",
    )
    if st.button("Сохранить заметку", key=f"save-note-{mail['id']}"):
        update_mail(mail["id"], note=note)
        st.toast("Заметка сохранена")
    st.markdown("</div>", unsafe_allow_html=True)


def render_inbox() -> None:
    if "emails" not in st.session_state:
        st.session_state.emails = demo_emails()
    if "selected_id" not in st.session_state:
        st.session_state.selected_id = "mail-1"
    if "section" not in st.session_state:
        st.session_state.section = "Входящие"

    section = render_sidebar()
    if section == "Настройки":
        render_settings()
        return
    if section == "Записи":
        render_records()
        return

    st.markdown('<div class="eyebrow">Рабочая очередь · сегодня</div>', unsafe_allow_html=True)
    st.title("Входящие запросы")
    st.markdown(
        '<p class="page-subtitle">Все письма с потенциальными заказами — в одном месте, уже разобраны и готовы к ответу.</p>',
        unsafe_allow_html=True,
    )
    if st.session_state.get("flash"):
        st.success(st.session_state.pop("flash"))

    action_left, action_right = st.columns([7, 1.45])
    with action_right:
        if st.button("＋  Добавить письмо", type="primary", use_container_width=True):
            st.session_state.add_open = True
    if st.session_state.get("add_open"):
        add_email_form()

    total = len(st.session_state.emails)
    new_count = len([m for m in st.session_state.emails if m["status"] == "Новое"])
    quote_count = len([m for m in st.session_state.emails if m["category"] == "КП"])
    high_count = len([m for m in st.session_state.emails if m["priority"] == "Высокий"])
    kpi_cols = st.columns(4)
    kpis = [
        ("Всего писем", total, "за всё время", False),
        ("Новые", new_count, "требуют внимания", False),
        ("Запросы на КП", quote_count, "готовы к обработке", False),
        ("Высокий приоритет", high_count, "нужно ответить сегодня", True),
    ]
    for column, (label, value, meta, neutral) in zip(kpi_cols, kpis):
        with column:
            st.markdown(
                f'<div class="kpi"><div class="kpi-label">{label}</div><div class="kpi-value">{value}</div>'
                f'<div class="kpi-meta {"neutral" if neutral else ""}">{meta}</div></div>',
                unsafe_allow_html=True,
            )

    st.markdown(
        '<div class="section-head"><h2>Почта</h2><span class="section-count">Последняя проверка: только что</span></div>',
        unsafe_allow_html=True,
    )
    tabs = st.tabs(["Все", f"Новые  ·  {new_count}", f"КП  ·  {quote_count}", "Перечни", "Запросы"])
    tab_filters = [None, "Новое", "КП", "Перечень", "Запрос"]
    for tab, tab_filter in zip(tabs, tab_filters):
        with tab:
            visible = [
                mail for mail in st.session_state.emails
                if tab_filter is None
                or (mail["status"] == tab_filter if tab_filter == "Новое" else mail["category"] == tab_filter)
            ]
            visible = sorted(visible, key=lambda mail: (mail["status"] != "Новое", mail["id"]))
            if not visible:
                st.markdown('<div class="empty-state">В этом разделе пока нет писем.</div>', unsafe_allow_html=True)
                continue
            list_col, detail_col = st.columns([1.07, 0.93], gap="large")
            with list_col:
                for mail in visible:
                    render_mail_card(mail)
                    if st.button(
                        "Открыть запись  →",
                        key=f"open-{tab_filter}-{mail['id']}",
                        use_container_width=True,
                    ):
                        st.session_state.selected_id = mail["id"]
                        update_mail(mail["id"], status="В работе")
                        st.rerun()
            with detail_col:
                selected = next(
                    (mail for mail in st.session_state.emails if mail["id"] == st.session_state.selected_id),
                    visible[0],
                )
                render_detail(selected)


def render_records() -> None:
    st.markdown('<div class="eyebrow">База обращений</div>', unsafe_allow_html=True)
    st.title("Записи")
    st.markdown('<p class="page-subtitle">Сводка всех обращений, которые уже прошли первичный AI-анализ.</p>', unsafe_allow_html=True)
    for mail in st.session_state.emails:
        with st.container():
            col1, col2, col3, col4 = st.columns([2.4, 1.1, 1.5, 1])
            with col1:
                st.markdown(f"**{mail['subject']}**  \n{mail['company']} · {mail['summary']}")
            with col2:
                st.markdown(f'<span class="pill {category_class(mail["category"])}">{mail["category"]}</span>', unsafe_allow_html=True)
            with col3:
                st.caption(f"Срок: {mail['deadline']}")
            with col4:
                st.caption(mail["status"])
            st.divider()


def render_settings() -> None:
    st.markdown('<div class="eyebrow">Конфигурация</div>', unsafe_allow_html=True)
    st.title("Настройки")
    st.markdown('<p class="page-subtitle">Управляйте источником писем и способом анализа.</p>', unsafe_allow_html=True)
    st.subheader("Источник писем")
    st.info("Сейчас активен демонстрационный почтовый ящик. Для рабочего подключения добавьте IMAP/OAuth-провайдер и сохраните секреты в переменных окружения.")
    left, right = st.columns(2)
    with left:
        st.text_input("Email рабочего ящика", value="inbox@ваша-компания.ru")
        st.selectbox("Проверять новые письма", ["Вручную", "Каждые 5 минут", "Каждые 15 минут"])
    with right:
        st.selectbox("Язык конспекта", ["Русский", "English"])
        st.selectbox("Модель анализа", ["Локальные правила · бесплатно", "Ollama · локальная модель"])
    st.subheader("Приватность")
    st.checkbox("Не сохранять полный текст письма в записи", value=False)
    st.caption("В текущем MVP анализ выполняется локально на сервере приложения: платный AI API не нужен.")


if __name__ == "__main__":
    inject_styles()
    render_inbox()