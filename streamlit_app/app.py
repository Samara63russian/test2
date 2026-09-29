from __future__ import annotations

import csv
import html
import io
import uuid
from datetime import datetime
from typing import Any

import streamlit as st

from src.demo_data import demo_messages
from src.mail_intelligence import (
    analyse_message,
    analyse_with_ollama,
    generate_reply_draft,
)
from src.mailbox_client import fetch_unseen_messages


st.set_page_config(
    page_title="Инбокс.АИ — умная обработка запросов",
    page_icon="✦",
    layout="wide",
    initial_sidebar_state="expanded",
)


APP_CSS = """
<style>
    :root {
        --ink: #17202a;
        --muted: #6f7782;
        --line: #e7e8e3;
        --surface: #ffffff;
        --canvas: #f5f6f2;
        --navy: #17283b;
        --green: #39765a;
    }
    .stApp {
        background:
            radial-gradient(circle at 80% 0%, rgba(217, 249, 157, .18), transparent 24rem),
            var(--canvas);
        color: var(--ink);
    }
    [data-testid="stHeader"] { background: transparent; }
    [data-testid="stToolbar"] { display: none; }
    .block-container {
        max-width: 1500px;
        padding: 2.1rem 2.6rem 3.5rem;
    }
    [data-testid="stSidebar"] {
        background: var(--navy);
        border-right: 0;
        min-width: 250px;
    }
    [data-testid="stSidebar"] .block-container { padding: 1.8rem 1.15rem; }
    [data-testid="stSidebar"] * { color: #eaf0f5; }
    [data-testid="stSidebar"] div[role="radiogroup"] label {
        background: transparent;
        border: 1px solid transparent;
        border-radius: 10px;
        padding: .64rem .72rem;
        margin: .1rem 0;
        transition: 120ms ease;
    }
    [data-testid="stSidebar"] div[role="radiogroup"] label:hover {
        background: rgba(255,255,255,.06);
    }
    [data-testid="stSidebar"] div[role="radiogroup"] label:has(input:checked) {
        background: rgba(217,249,157,.12);
        border-color: rgba(217,249,157,.2);
    }
    [data-testid="stSidebar"] div[role="radiogroup"] label:has(input:checked) p {
        color: #d9f99d !important;
        font-weight: 700;
    }
    [data-testid="stSidebar"] div[role="radiogroup"] label > div:first-child {
        display: none;
    }
    .brand {
        display: flex;
        align-items: center;
        gap: .72rem;
        margin: .2rem .35rem 2.2rem;
    }
    .brand-mark {
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        border-radius: 10px;
        color: #17283b !important;
        background: #d9f99d;
        font-weight: 900;
        font-size: 1.1rem;
    }
    .brand-name { font-size: 1.08rem; font-weight: 800; letter-spacing: -.02em; }
    .brand-sub { color: #91a0ae !important; font-size: .7rem; margin-top: .08rem; }
    .connection-card {
        margin: 1.6rem .2rem .5rem;
        padding: .9rem;
        border: 1px solid rgba(255,255,255,.1);
        background: rgba(255,255,255,.045);
        border-radius: 12px;
    }
    .connection-title { font-size: .78rem; font-weight: 700; }
    .connection-copy { color: #91a0ae !important; font-size: .7rem; margin-top: .18rem; line-height: 1.45; }
    .status-dot {
        width: 8px;
        height: 8px;
        display: inline-block;
        border-radius: 50%;
        background: #a3e635;
        box-shadow: 0 0 0 3px rgba(163,230,53,.12);
        margin-right: .45rem;
    }
    h1, h2, h3 { color: var(--ink); letter-spacing: -.035em; }
    h1 { font-size: 2rem !important; }
    .eyebrow {
        color: #77806f;
        font-size: .7rem;
        font-weight: 800;
        letter-spacing: .13em;
        text-transform: uppercase;
        margin-bottom: .32rem;
    }
    .page-title { font-size: 2rem; line-height: 1.12; font-weight: 780; letter-spacing: -.04em; }
    .page-copy { color: var(--muted); font-size: .9rem; margin-top: .35rem; }
    .sync-label {
        color: var(--muted);
        text-align: right;
        font-size: .72rem;
        padding-top: .3rem;
    }
    .metric-card {
        min-height: 104px;
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 1rem 1.05rem;
        box-shadow: 0 5px 18px rgba(23,32,42,.025);
    }
    .metric-label { color: var(--muted); font-size: .75rem; font-weight: 650; }
    .metric-row { display: flex; align-items: end; justify-content: space-between; margin-top: .6rem; }
    .metric-value { font-size: 1.55rem; font-weight: 780; letter-spacing: -.04em; }
    .metric-trend { color: var(--green); background: #edf7f0; border-radius: 6px; font-size: .68rem; padding: .23rem .38rem; }
    .section-label { color: var(--muted); font-size: .74rem; font-weight: 750; margin: .2rem 0 .45rem; }
    .panel {
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 16px;
        padding: 1.2rem 1.25rem;
    }
    .detail-head {
        display: flex;
        align-items: center;
        gap: .8rem;
        padding-bottom: .95rem;
        border-bottom: 1px solid var(--line);
        margin-bottom: 1rem;
    }
    .avatar {
        width: 42px;
        height: 42px;
        display: grid;
        place-items: center;
        border-radius: 12px;
        color: #274238;
        background: #e8f4da;
        font-weight: 800;
        flex: 0 0 auto;
    }
    .sender-name { font-size: .93rem; font-weight: 760; }
    .sender-meta { color: var(--muted); font-size: .72rem; margin-top: .1rem; }
    .subject { font-size: 1.36rem; font-weight: 760; letter-spacing: -.025em; margin: .25rem 0 .75rem; }
    .pill {
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        padding: .28rem .52rem;
        font-size: .66rem;
        font-weight: 760;
        margin-right: .3rem;
        border: 1px solid transparent;
    }
    .pill-quote { color: #965122; background: #fff4e8; border-color: #fae3cc; }
    .pill-list { color: #45632a; background: #f0f8e7; border-color: #dceec7; }
    .pill-general { color: #44627b; background: #edf4f9; border-color: #d8e7f1; }
    .pill-high { color: #a23f35; background: #fff0ed; border-color: #f5d5cf; }
    .pill-status { color: #59616a; background: #f4f4f2; border-color: #e5e5e0; }
    .ai-card {
        background: linear-gradient(135deg, #f1f9e7 0%, #f7fbf1 100%);
        border: 1px solid #dcebc9;
        border-radius: 14px;
        padding: 1rem 1.05rem;
        margin: .95rem 0;
    }
    .ai-title { color: #4e6c36; font-size: .7rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
    .ai-copy { color: #31402e; font-size: .88rem; line-height: 1.55; margin-top: .42rem; }
    .ai-meta { color: #738467; font-size: .65rem; margin-top: .55rem; }
    .fact {
        min-height: 88px;
        background: #fafaf8;
        border: 1px solid #ecece7;
        border-radius: 11px;
        padding: .82rem .88rem;
    }
    .fact-label { color: var(--muted); font-size: .66rem; font-weight: 730; text-transform: uppercase; letter-spacing: .06em; }
    .fact-value { color: var(--ink); font-size: .8rem; line-height: 1.4; margin-top: .35rem; }
    .next-action {
        border-left: 3px solid #8fbd51;
        padding: .75rem .85rem;
        background: #fbfcf8;
        color: #3e4938;
        font-size: .8rem;
        margin: .85rem 0;
    }
    .empty {
        padding: 4rem 2rem;
        text-align: center;
        color: var(--muted);
        border: 1px dashed #d9dbd4;
        border-radius: 14px;
        background: rgba(255,255,255,.55);
    }
    div[data-testid="stRadio"] > div[role="radiogroup"] > label {
        background: #fff;
        border: 1px solid var(--line);
        border-radius: 12px;
        padding: .72rem .8rem;
        margin: .22rem 0;
        min-height: 54px;
        transition: 120ms ease;
    }
    div[data-testid="stRadio"] > div[role="radiogroup"] > label:hover {
        border-color: #cbd5bf;
        transform: translateY(-1px);
    }
    div[data-testid="stRadio"] > div[role="radiogroup"] > label:has(input:checked) {
        border-color: #9db77c;
        box-shadow: 0 0 0 2px rgba(157,183,124,.12);
        background: #fbfdf8;
    }
    div[data-testid="stRadio"] > div[role="radiogroup"] > label p {
        font-size: .78rem;
        line-height: 1.35;
    }
    .stButton > button, .stDownloadButton > button {
        border-radius: 9px;
        border: 1px solid #dfe1dc;
        box-shadow: none;
        font-weight: 680;
        min-height: 40px;
    }
    .stButton > button[kind="primary"] {
        color: white;
        background: var(--navy);
        border-color: var(--navy);
    }
    .stButton > button:hover, .stDownloadButton > button:hover {
        border-color: #95aa7d;
        color: #344827;
    }
    [data-baseweb="input"] > div, [data-baseweb="select"] > div,
    [data-baseweb="textarea"] > div {
        border-color: #dfe1dc !important;
        background: white;
        border-radius: 9px !important;
    }
    .progress-track { height: 8px; border-radius: 999px; background: #e9ebe5; overflow: hidden; margin-top: .45rem; }
    .progress-fill { height: 100%; border-radius: inherit; background: #8db65c; }
    .bar-row { margin: .95rem 0; }
    .bar-meta { display: flex; justify-content: space-between; color: #59616a; font-size: .76rem; }
    .record-card {
        background: white;
        border: 1px solid var(--line);
        border-radius: 13px;
        padding: 1rem;
        margin-bottom: .65rem;
    }
    .record-id { color: #728064; font-size: .67rem; font-weight: 800; letter-spacing: .08em; }
    .record-title { font-size: .92rem; font-weight: 760; margin: .32rem 0; }
    .record-meta { color: var(--muted); font-size: .72rem; }
    hr { border-color: var(--line) !important; }
    @media (max-width: 900px) {
        .block-container { padding: 1.5rem 1rem 3rem; }
        .page-title { font-size: 1.6rem; }
    }
</style>
"""

st.markdown(APP_CSS, unsafe_allow_html=True)


def initialise_state() -> None:
    defaults: dict[str, Any] = {
        "messages": demo_messages(),
        "records": [],
        "selected_message": "mail-1006",
        "last_sync": datetime.now().isoformat(),
        "show_reply": None,
        "imap": {
            "enabled": False,
            "host": "",
            "port": 993,
            "username": "",
            "password": "",
            "folder": "INBOX",
            "use_ssl": True,
        },
        "ai": {
            "provider": "Локальный анализ",
            "endpoint": "http://localhost:11434",
            "model": "llama3.2:3b",
        },
    }
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value


def safe(value: Any) -> str:
    return html.escape(str(value or ""))


def relative_time(value: str) -> str:
    try:
        received = datetime.fromisoformat(value)
        if received.tzinfo:
            received = received.astimezone().replace(tzinfo=None)
        delta = datetime.now() - received
        minutes = max(0, int(delta.total_seconds() // 60))
        if minutes < 1:
            return "только что"
        if minutes < 60:
            return f"{minutes} мин"
        if minutes < 24 * 60:
            return f"{minutes // 60} ч"
        return received.strftime("%d.%m")
    except (TypeError, ValueError):
        return safe(value) or "недавно"


def analyse(subject: str, body: str) -> dict[str, Any]:
    ai_settings = st.session_state.ai
    if ai_settings["provider"] == "Ollama (бесплатно, локально)":
        try:
            return analyse_with_ollama(
                subject,
                body,
                endpoint=ai_settings["endpoint"],
                model=ai_settings["model"],
            )
        except RuntimeError:
            result = analyse_message(subject, body)
            result["engine"] = "Резервный локальный анализ"
            return result
    return analyse_message(subject, body)


def sync_mailbox() -> tuple[int, str]:
    settings = st.session_state.imap
    if not settings["enabled"] or not settings["host"] or not settings["username"]:
        st.session_state.last_sync = datetime.now().isoformat()
        return 0, "Демо-почта синхронизирована"

    try:
        incoming = fetch_unseen_messages(
            host=settings["host"],
            port=int(settings["port"]),
            username=settings["username"],
            password=settings["password"],
            folder=settings["folder"],
            use_ssl=settings["use_ssl"],
        )
    except Exception as exc:
        return 0, f"Не удалось подключиться к почте: {exc}"

    existing_ids = {item["id"] for item in st.session_state.messages}
    fresh = []
    for message in incoming:
        if message["id"] in existing_ids:
            continue
        message["analysis"] = analyse(message["subject"], message["body"])
        message["company"] = message["sender_email"].split("@")[-1] or "Не определена"
        fresh.append(message)

    st.session_state.messages = fresh + st.session_state.messages
    st.session_state.last_sync = datetime.now().isoformat()
    return len(fresh), f"Новых писем: {len(fresh)}"


def metric_card(label: str, value: str, trend: str) -> None:
    st.markdown(
        f"""
        <div class="metric-card">
            <div class="metric-label">{safe(label)}</div>
            <div class="metric-row">
                <div class="metric-value">{safe(value)}</div>
                <div class="metric-trend">{safe(trend)}</div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def page_header(eyebrow: str, title: str, copy: str) -> None:
    st.markdown(
        f"""
        <div class="eyebrow">{safe(eyebrow)}</div>
        <div class="page-title">{safe(title)}</div>
        <div class="page-copy">{safe(copy)}</div>
        """,
        unsafe_allow_html=True,
    )


def category_pill_class(category: str) -> str:
    return {
        "Запрос КП": "pill-quote",
        "Запрос перечня": "pill-list",
    }.get(category, "pill-general")


def add_record(message: dict[str, Any]) -> bool:
    if any(record["message_id"] == message["id"] for record in st.session_state.records):
        return False
    record_number = len(st.session_state.records) + 1
    analysis = message["analysis"]
    record = {
        "id": f"REQ-{datetime.now():%Y}-{record_number:03d}",
        "message_id": message["id"],
        "created_at": datetime.now().isoformat(),
        "company": message.get("company", "Не определена"),
        "contact": message["sender_name"],
        "subject": message["subject"],
        "category": analysis["category"],
        "priority": analysis["priority"],
        "deadline": analysis["deadline"],
        "next_action": analysis["next_action"],
        "status": "Новая",
    }
    st.session_state.records.insert(0, record)
    message["status"] = "В работе"
    return True


def render_message_detail(message: dict[str, Any]) -> None:
    analysis = message["analysis"]
    initial = (message.get("sender_name") or "?")[:1].upper()
    priority_pill = (
        '<span class="pill pill-high">● Высокий приоритет</span>'
        if analysis["priority"] == "Высокий"
        else f'<span class="pill pill-status">{safe(analysis["priority"])} приоритет</span>'
    )
    st.markdown(
        f"""
        <div class="panel">
            <div class="detail-head">
                <div class="avatar">{safe(initial)}</div>
                <div>
                    <div class="sender-name">{safe(message["sender_name"])}</div>
                    <div class="sender-meta">{safe(message.get("company"))} ·
                    {safe(message.get("sender_email"))} · {relative_time(message["received_at"])}</div>
                </div>
            </div>
            <span class="pill {category_pill_class(analysis["category"])}">{safe(analysis["category"])}</span>
            {priority_pill}
            <span class="pill pill-status">{safe(message["status"])}</span>
            <div class="subject">{safe(message["subject"])}</div>
            <div class="ai-card">
                <div class="ai-title">✦ Кратко от ИИ</div>
                <div class="ai-copy">{safe(analysis["summary"])}</div>
                <div class="ai-meta">{safe(analysis["engine"])} · уверенность {analysis["confidence"]}%</div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    facts = [
        ("Цель запроса", analysis["intent"]),
        ("Срок", analysis["deadline"]),
        ("Бюджет", analysis["budget"]),
    ]
    fact_columns = st.columns(3)
    for column, (label, value) in zip(fact_columns, facts):
        with column:
            st.markdown(
                f"""
                <div class="fact">
                    <div class="fact-label">{safe(label)}</div>
                    <div class="fact-value">{safe(value)}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

    if analysis["items"]:
        items = " · ".join(analysis["items"])
        st.caption(f"Распознано в запросе: {items}")

    st.markdown(
        f'<div class="next-action"><b>Следующий шаг:</b> {safe(analysis["next_action"])}</div>',
        unsafe_allow_html=True,
    )

    primary, secondary, status_column = st.columns([1.15, 1, 1])
    with primary:
        if st.button(
            "Создать запись",
            type="primary",
            use_container_width=True,
            key=f"create-{message['id']}",
        ):
            if add_record(message):
                st.success("Запись создана и добавлена в журнал заявок.")
            else:
                st.info("Для этого письма запись уже создана.")
    with secondary:
        if st.button(
            "Подготовить ответ",
            use_container_width=True,
            key=f"reply-{message['id']}",
        ):
            st.session_state.show_reply = message["id"]
    with status_column:
        statuses = ["Новое", "В работе", "Обработано"]
        selected_status = st.selectbox(
            "Статус",
            statuses,
            index=statuses.index(message["status"]),
            key=f"status-{message['id']}",
            label_visibility="collapsed",
        )
        message["status"] = selected_status

    if st.session_state.show_reply == message["id"]:
        st.text_area(
            "Черновик ответа",
            generate_reply_draft(message),
            height=190,
            key=f"draft-{message['id']}",
            help="Проверьте факты перед отправкой. Приложение не отправляет письма автоматически.",
        )

    with st.expander("Оригинал письма"):
        st.text(message["body"])


def manual_email_form() -> None:
    with st.expander("＋ Добавить письмо вручную"):
        with st.form("manual-email", clear_on_submit=True):
            left, right = st.columns(2)
            with left:
                sender_name = st.text_input("Имя отправителя", placeholder="Алексей Петров")
                sender_email = st.text_input("Email", placeholder="a.petrov@company.ru")
            with right:
                company = st.text_input("Компания", placeholder="Компания")
                subject = st.text_input("Тема", placeholder="Запрос коммерческого предложения")
            body = st.text_area("Текст письма", height=160)
            submitted = st.form_submit_button("Проанализировать и добавить", type="primary")
            if submitted:
                if not subject or not body:
                    st.error("Добавьте тему и текст письма.")
                    return
                new_id = f"manual-{uuid.uuid4().hex[:10]}"
                message = {
                    "id": new_id,
                    "sender_name": sender_name or sender_email or "Новый контакт",
                    "sender_email": sender_email,
                    "company": company or (sender_email.split("@")[-1] if "@" in sender_email else "Не определена"),
                    "subject": subject,
                    "body": body,
                    "received_at": datetime.now().isoformat(),
                    "status": "Новое",
                    "source": "Вручную",
                    "analysis": analyse(subject, body),
                }
                st.session_state.messages.insert(0, message)
                st.session_state.selected_message = new_id
                st.success("Письмо добавлено и проанализировано.")


def inbox_view() -> None:
    header, refresh = st.columns([4, 1])
    with header:
        page_header(
            "Единый центр запросов",
            "Входящие запросы",
            "ИИ выделяет суть, приоритет и следующий шаг — вам остаётся принять решение.",
        )
    with refresh:
        st.markdown('<div class="sync-label">Синхронизация почты</div>', unsafe_allow_html=True)
        if st.button("↻ Обновить", use_container_width=True):
            count, message = sync_mailbox()
            if "Не удалось" in message:
                st.error(message)
            elif count:
                st.success(message)
            else:
                st.toast(message)

    st.write("")
    messages = st.session_state.messages
    new_count = sum(message["status"] == "Новое" for message in messages)
    urgent_count = sum(message["analysis"]["priority"] == "Высокий" for message in messages)
    in_progress_count = sum(message["status"] == "В работе" for message in messages)
    metric_columns = st.columns(4)
    metric_values = [
        ("Новые письма", str(new_count), "+2 сегодня"),
        ("Требуют ответа", str(new_count + in_progress_count), "в фокусе"),
        ("Срочные", str(urgent_count), "контроль SLA"),
        ("Обработано ИИ", f"{len(messages)}", "100%"),
    ]
    for column, values in zip(metric_columns, metric_values):
        with column:
            metric_card(*values)

    st.write("")
    search_column, category_column, status_filter_column = st.columns([2.2, 1, 1])
    with search_column:
        search = st.text_input(
            "Поиск",
            placeholder="Поиск по компании, отправителю или теме…",
            label_visibility="collapsed",
        )
    with category_column:
        category_filter = st.selectbox(
            "Категория",
            ["Все категории", "Запрос КП", "Запрос перечня", "Общий запрос"],
            label_visibility="collapsed",
        )
    with status_filter_column:
        status_filter = st.selectbox(
            "Статус",
            ["Все статусы", "Новое", "В работе", "Обработано"],
            label_visibility="collapsed",
        )

    query = search.lower().strip()
    filtered = [
        message
        for message in messages
        if (
            not query
            or query in message["subject"].lower()
            or query in message["sender_name"].lower()
            or query in message.get("company", "").lower()
        )
        and (
            category_filter == "Все категории"
            or message["analysis"]["category"] == category_filter
        )
        and (status_filter == "Все статусы" or message["status"] == status_filter)
    ]

    list_column, detail_column = st.columns([0.9, 1.35], gap="large")
    with list_column:
        st.markdown(
            f'<div class="section-label">ПИСЬМА · {len(filtered)}</div>',
            unsafe_allow_html=True,
        )
        if not filtered:
            st.markdown(
                '<div class="empty">По заданным фильтрам писем нет.</div>',
                unsafe_allow_html=True,
            )
        else:
            options = [message["id"] for message in filtered]
            if st.session_state.selected_message not in options:
                st.session_state.selected_message = options[0]
            index = options.index(st.session_state.selected_message)
            labels = {
                message["id"]: (
                    f"{'●' if message['status'] == 'Новое' else '○'}  "
                    f"{message['subject']}\n"
                    f"{message.get('company', message['sender_name'])} · "
                    f"{relative_time(message['received_at'])}"
                )
                for message in filtered
            }
            selected = st.radio(
                "Письма",
                options,
                index=index,
                format_func=lambda message_id: labels[message_id],
                label_visibility="collapsed",
                key="inbox-radio",
            )
            st.session_state.selected_message = selected

    with detail_column:
        st.markdown('<div class="section-label">РАЗБОР ПИСЬМА</div>', unsafe_allow_html=True)
        selected_message = next(
            (
                message
                for message in messages
                if message["id"] == st.session_state.selected_message
            ),
            None,
        )
        if selected_message:
            render_message_detail(selected_message)

    st.write("")
    manual_email_form()


def records_to_csv() -> bytes:
    if not st.session_state.records:
        return b""
    output = io.StringIO()
    fields = [
        "id",
        "created_at",
        "company",
        "contact",
        "subject",
        "category",
        "priority",
        "deadline",
        "next_action",
        "status",
    ]
    writer = csv.DictWriter(output, fieldnames=fields, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(st.session_state.records)
    return output.getvalue().encode("utf-8-sig")


def records_view() -> None:
    header, export = st.columns([4, 1])
    with header:
        page_header(
            "Журнал обработки",
            "Созданные заявки",
            "Структурированные записи из входящих писем без ручного копирования.",
        )
    with export:
        st.write("")
        st.download_button(
            "↓ Экспорт CSV",
            data=records_to_csv(),
            file_name=f"requests-{datetime.now():%Y-%m-%d}.csv",
            mime="text/csv",
            use_container_width=True,
            disabled=not st.session_state.records,
        )

    st.write("")
    if not st.session_state.records:
        st.markdown(
            """
            <div class="empty">
                <b>Журнал пока пуст</b><br>
                Откройте письмо во «Входящих» и нажмите «Создать запись».
            </div>
            """,
            unsafe_allow_html=True,
        )
        return

    for record in st.session_state.records:
        st.markdown(
            f"""
            <div class="record-card">
                <div class="record-id">{safe(record["id"])} · {safe(record["category"])}</div>
                <div class="record-title">{safe(record["subject"])}</div>
                <div class="record-meta">
                    {safe(record["company"])} · {safe(record["contact"])} ·
                    срок: {safe(record["deadline"])} · статус: {safe(record["status"])}
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )


def analytics_view() -> None:
    page_header(
        "Контроль потока",
        "Аналитика",
        "Сводка по типам входящих запросов и скорости обработки.",
    )
    st.write("")
    messages = st.session_state.messages
    total = max(1, len(messages))
    categories = ["Запрос КП", "Запрос перечня", "Общий запрос"]
    colors = ["#8db65c", "#5e8ea8", "#d39755"]

    left, right = st.columns([1.2, 1], gap="large")
    with left:
        st.markdown('<div class="panel"><div class="section-label">СТРУКТУРА ЗАПРОСОВ</div>', unsafe_allow_html=True)
        for category, color in zip(categories, colors):
            count = sum(message["analysis"]["category"] == category for message in messages)
            width = round(count / total * 100)
            st.markdown(
                f"""
                <div class="bar-row">
                    <div class="bar-meta"><span>{safe(category)}</span><b>{count} · {width}%</b></div>
                    <div class="progress-track"><div class="progress-fill"
                    style="width:{width}%;background:{color};"></div></div>
                </div>
                """,
                unsafe_allow_html=True,
            )
        st.markdown("</div>", unsafe_allow_html=True)
    with right:
        processed = sum(message["status"] == "Обработано" for message in messages)
        in_work = sum(message["status"] == "В работе" for message in messages)
        st.markdown(
            f"""
            <div class="panel">
                <div class="section-label">ЭФФЕКТИВНОСТЬ</div>
                <div class="metric-row"><span class="metric-label">Распознано автоматически</span>
                <span class="metric-value">100%</span></div>
                <hr>
                <div class="metric-row"><span class="metric-label">Передано в работу</span>
                <span class="metric-value">{in_work}</span></div>
                <hr>
                <div class="metric-row"><span class="metric-label">Обработано</span>
                <span class="metric-value">{processed}</span></div>
            </div>
            """,
            unsafe_allow_html=True,
        )


def settings_view() -> None:
    page_header(
        "Интеграции",
        "Настройки",
        "Подключите IMAP-почту и, при желании, бесплатную локальную модель Ollama.",
    )
    st.write("")
    mail_column, ai_column = st.columns(2, gap="large")

    with mail_column:
        st.subheader("Почтовый ящик")
        st.caption("Пароль хранится только в текущей сессии приложения.")
        current = st.session_state.imap
        with st.form("imap-settings"):
            enabled = st.checkbox("Получать непрочитанные письма по IMAP", value=current["enabled"])
            host = st.text_input("IMAP-сервер", value=current["host"], placeholder="imap.yandex.ru")
            port = st.number_input("Порт", 1, 65535, value=int(current["port"]))
            username = st.text_input("Логин", value=current["username"])
            password = st.text_input("Пароль приложения", value=current["password"], type="password")
            folder = st.text_input("Папка", value=current["folder"])
            use_ssl = st.checkbox("Защищённое соединение SSL", value=current["use_ssl"])
            save_mail = st.form_submit_button("Сохранить подключение", type="primary")
            if save_mail:
                st.session_state.imap = {
                    "enabled": enabled,
                    "host": host.strip(),
                    "port": int(port),
                    "username": username.strip(),
                    "password": password,
                    "folder": folder.strip() or "INBOX",
                    "use_ssl": use_ssl,
                }
                st.success("Настройки почты сохранены для текущей сессии.")

        if st.button("Проверить и получить письма", use_container_width=True):
            with st.spinner("Подключаемся к почте…"):
                _, message = sync_mailbox()
            if "Не удалось" in message:
                st.error(message)
            else:
                st.success(message)

    with ai_column:
        st.subheader("ИИ-анализ")
        st.caption("Оба режима бесплатны. Ollama обрабатывает данные на вашем сервере.")
        current_ai = st.session_state.ai
        with st.form("ai-settings"):
            providers = ["Локальный анализ", "Ollama (бесплатно, локально)"]
            provider = st.selectbox(
                "Режим",
                providers,
                index=providers.index(current_ai["provider"]),
            )
            endpoint = st.text_input(
                "Адрес Ollama",
                value=current_ai["endpoint"],
                disabled=provider == "Локальный анализ",
            )
            model = st.text_input(
                "Модель",
                value=current_ai["model"],
                disabled=provider == "Локальный анализ",
                help="Например, llama3.2:3b или qwen2.5:3b.",
            )
            save_ai = st.form_submit_button("Сохранить режим", type="primary")
            if save_ai:
                st.session_state.ai = {
                    "provider": provider,
                    "endpoint": endpoint.strip() or "http://localhost:11434",
                    "model": model.strip() or "llama3.2:3b",
                }
                st.success("Режим анализа сохранён.")

        st.info(
            "Автоотправка ответов намеренно отключена: сотрудник всегда проверяет "
            "черновик и факты перед отправкой."
        )


def sidebar() -> str:
    st.sidebar.markdown(
        """
        <div class="brand">
            <div class="brand-mark">✦</div>
            <div>
                <div class="brand-name">Инбокс.АИ</div>
                <div class="brand-sub">Умный разбор запросов</div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )
    navigation = st.sidebar.radio(
        "Навигация",
        ["▤  Входящие", "◫  Заявки", "↗  Аналитика", "⚙  Настройки"],
        label_visibility="collapsed",
    )
    connection = st.session_state.imap
    status_title = "Почта подключена" if connection["enabled"] else "Демо-режим"
    status_copy = (
        connection["username"]
        if connection["enabled"]
        else "Подключите IMAP в настройках"
    )
    st.sidebar.markdown(
        f"""
        <div class="connection-card">
            <div class="connection-title"><span class="status-dot"></span>{safe(status_title)}</div>
            <div class="connection-copy">{safe(status_copy)}<br>
            ИИ: {safe(st.session_state.ai["provider"])}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )
    st.sidebar.caption("Данные демо-сессии не покидают приложение.")
    return navigation


def main() -> None:
    initialise_state()
    selected_page = sidebar()
    if "Входящие" in selected_page:
        inbox_view()
    elif "Заявки" in selected_page:
        records_view()
    elif "Аналитика" in selected_page:
        analytics_view()
    else:
        settings_view()


if __name__ == "__main__":
    main()
