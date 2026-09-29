"""MailBrief — AI-assisted incoming request tracker."""

from __future__ import annotations

import hashlib
import os
import re
from datetime import datetime, timedelta
from html import escape
from typing import Any

import streamlit as st

from src.email_ai import AnalysisResult, analyze_email
from src.mailbox_client import fetch_unread, is_configured
from src.request_store import (
    count_requests,
    init_store,
    list_requests,
    save_request,
    seed_requests,
    update_status,
)


st.set_page_config(
    page_title="MailBrief — запросы из почты",
    page_icon="✦",
    layout="wide",
    initial_sidebar_state="expanded",
)


APP_STYLES = """
<style>
    :root {
        --ink: #17211b;
        --muted: #6f7c74;
        --line: #e5ebe7;
        --paper: #ffffff;
        --canvas: #f5f7f5;
        --green: #1c6b4b;
        --green-soft: #e6f2eb;
        --lime: #c9f06b;
        --amber: #a76012;
    }
    .stApp {
        background: var(--canvas);
        color: var(--ink);
    }
    .main .block-container {
        max-width: 1440px;
        padding: 2rem 2.25rem 4rem;
    }
    [data-testid="stSidebar"] {
        background: #123e2e;
        border-right: 0;
    }
    [data-testid="stSidebar"] > div:first-child {
        padding-top: 1.35rem;
    }
    [data-testid="stSidebar"] * {
        color: #f5fff9;
    }
    [data-testid="stSidebar"] [data-baseweb="radio"] > div {
        gap: .3rem;
    }
    [data-testid="stSidebar"] [role="radiogroup"] label {
        padding: .72rem .85rem;
        border-radius: 10px;
        transition: background .15s ease;
    }
    [data-testid="stSidebar"] [role="radiogroup"] label:hover {
        background: rgba(255,255,255,.09);
    }
    [data-testid="stSidebar"] [role="radiogroup"] label:has(input:checked) {
        background: rgba(201,240,107,.16);
    }
    [data-testid="stSidebar"] [role="radiogroup"] label > div:first-child {
        display: none;
    }
    .brand {
        display: flex;
        align-items: center;
        gap: .7rem;
        padding: .2rem .5rem 1.6rem;
    }
    .brand-mark {
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        background: var(--lime);
        color: #123e2e;
        border-radius: 11px;
        font-size: 20px;
        font-weight: 800;
    }
    .brand-name { font-size: 1.08rem; font-weight: 750; letter-spacing: -.02em; }
    .brand-caption { opacity: .62; font-size: .72rem; margin-top: -2px; }
    .sidebar-spacer { height: 10rem; }
    .ai-chip {
        margin: .5rem .35rem;
        padding: .85rem;
        border: 1px solid rgba(255,255,255,.11);
        border-radius: 12px;
        background: rgba(255,255,255,.06);
        font-size: .77rem;
        line-height: 1.45;
    }
    .ai-dot {
        display: inline-block;
        width: 7px;
        height: 7px;
        margin-right: .4rem;
        background: var(--lime);
        border-radius: 50%;
        box-shadow: 0 0 0 4px rgba(201,240,107,.12);
    }
    h1, h2, h3 { color: var(--ink); letter-spacing: -.035em; }
    h1 { font-size: 2rem !important; font-weight: 720 !important; }
    h2 { font-size: 1.28rem !important; }
    .eyebrow {
        color: var(--green);
        font-size: .72rem;
        font-weight: 750;
        letter-spacing: .09em;
        text-transform: uppercase;
        margin-bottom: .35rem;
    }
    .page-title {
        color: var(--ink);
        font-size: 2rem;
        font-weight: 730;
        letter-spacing: -.045em;
        line-height: 1.1;
    }
    .page-subtitle { color: var(--muted); font-size: .9rem; margin-top: .42rem; }
    .metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: .8rem; margin: 1.35rem 0 1.5rem; }
    .metric-card {
        background: var(--paper);
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 1rem 1.05rem;
        box-shadow: 0 2px 10px rgba(24,52,38,.025);
    }
    .metric-label { color: var(--muted); font-size: .76rem; margin-bottom: .45rem; }
    .metric-value { color: var(--ink); font-size: 1.55rem; font-weight: 720; letter-spacing: -.04em; }
    .metric-note { color: #718078; font-size: .7rem; margin-top: .25rem; }
    .metric-note.good { color: var(--green); }
    .section-label {
        color: var(--ink);
        font-size: .88rem;
        font-weight: 700;
        margin: .25rem 0 .4rem;
    }
    div[data-testid="stTextInput"] input,
    div[data-testid="stTextArea"] textarea,
    div[data-baseweb="select"] > div {
        border-color: var(--line);
        background: var(--paper);
        border-radius: 10px;
    }
    .stButton > button, .stFormSubmitButton > button {
        border-radius: 9px;
        border: 1px solid var(--line);
        font-weight: 650;
        min-height: 2.65rem;
    }
    .stButton > button:hover, .stFormSubmitButton > button:hover {
        border-color: var(--green);
        color: var(--green);
    }
    button[kind="primary"] {
        background: var(--green) !important;
        color: white !important;
        border-color: var(--green) !important;
    }
    .inbox-count { color: var(--muted); font-size: .78rem; margin-bottom: .65rem; }
    .detail-card {
        background: var(--paper);
        border: 1px solid var(--line);
        border-radius: 16px;
        padding: 1.45rem 1.5rem 1.2rem;
        box-shadow: 0 5px 20px rgba(24,52,38,.035);
    }
    .sender-row { display: flex; align-items: center; gap: .75rem; margin-bottom: 1.15rem; }
    .avatar {
        width: 42px;
        height: 42px;
        display: grid;
        place-items: center;
        background: #edf3ef;
        color: var(--green);
        border-radius: 50%;
        font-weight: 760;
    }
    .sender-name { color: var(--ink); font-size: .9rem; font-weight: 700; }
    .sender-meta { color: var(--muted); font-size: .72rem; }
    .subject { color: var(--ink); font-size: 1.35rem; font-weight: 720; letter-spacing: -.025em; margin-bottom: .9rem; }
    .badge {
        display: inline-block;
        padding: .28rem .55rem;
        border-radius: 999px;
        background: #edf3ef;
        color: #43524a;
        font-size: .68rem;
        font-weight: 700;
        margin: 0 .3rem .75rem 0;
    }
    .badge.high { background: #fff0df; color: #9a5005; }
    .badge.new { background: var(--green-soft); color: var(--green); }
    .summary-box {
        margin: 1.05rem 0;
        padding: 1rem 1.05rem;
        background: #f0f7f3;
        border-left: 3px solid var(--green);
        border-radius: 4px 11px 11px 4px;
    }
    .summary-title { color: var(--green); font-size: .68rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
    .summary-copy { color: #2f4137; font-size: .86rem; line-height: 1.55; margin-top: .4rem; }
    .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: .65rem; margin: .9rem 0; }
    .meta-item { border: 1px solid var(--line); border-radius: 10px; padding: .7rem .8rem; }
    .meta-label { color: var(--muted); font-size: .66rem; text-transform: uppercase; letter-spacing: .06em; }
    .meta-value { color: var(--ink); font-size: .82rem; font-weight: 650; margin-top: .2rem; }
    .item-row {
        display: flex;
        gap: .55rem;
        align-items: flex-start;
        border-top: 1px solid #edf1ee;
        padding: .58rem 0;
        color: #39473f;
        font-size: .8rem;
    }
    .item-check { color: var(--green); font-weight: 800; }
    .mail-body {
        color: #526159;
        font-size: .78rem;
        line-height: 1.65;
        white-space: pre-line;
        max-height: 230px;
        overflow-y: auto;
        padding-right: .5rem;
    }
    .kanban-title { color: var(--muted); font-size: .72rem; font-weight: 750; text-transform: uppercase; letter-spacing: .06em; margin-bottom: .65rem; }
    .kanban-card {
        min-height: 132px;
        background: var(--paper);
        border: 1px solid var(--line);
        border-radius: 12px;
        padding: .85rem;
        margin-bottom: .7rem;
    }
    .kanban-subject { color: var(--ink); font-size: .8rem; font-weight: 700; line-height: 1.35; }
    .kanban-company { color: var(--muted); font-size: .7rem; margin-top: .4rem; }
    .kanban-footer { color: var(--green); font-size: .67rem; margin-top: .8rem; font-weight: 650; }
    .settings-card {
        background: var(--paper);
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 1.1rem 1.2rem;
        min-height: 145px;
    }
    .empty-state { text-align: center; color: var(--muted); padding: 5rem 1rem; }
    hr { border-color: var(--line) !important; }
    @media (max-width: 900px) {
        .metric-grid { grid-template-columns: repeat(2, 1fr); }
        .main .block-container { padding: 1.2rem 1rem 3rem; }
    }
</style>
"""


DEMO_EMAILS = [
    {
        "sender_name": "Анна Волкова",
        "sender_email": "a.volkova@sever-office.ru",
        "company": "Север Офис",
        "subject": "Запрос КП на офисную мебель",
        "body": """Добрый день!

Просим подготовить коммерческое предложение на следующие позиции:
- Рабочий стол Loft 1400 — 12 шт.
- Кресло Ergo Pro — 12 шт.
- Тумба мобильная — 8 шт.

Укажите стоимость доставки в Казань и срок поставки. Предложение нужно до 3 октября.

С уважением,
Анна Волкова
ООО «Север Офис»""",
        "received_at": (datetime.now() - timedelta(minutes=18)).isoformat(),
        "status": "Новый",
    },
    {
        "sender_name": "Михаил Орлов",
        "sender_email": "m.orlov@alpha-trade.ru",
        "company": "Альфа Трейд",
        "subject": "Актуальный прайс-лист на сентябрь",
        "body": """Здравствуйте! Пришлите, пожалуйста, актуальный прайс-лист и перечень
доступных складских позиций. Интересуют условия для дилеров и минимальная партия.""",
        "received_at": (datetime.now() - timedelta(hours=1, minutes=22)).isoformat(),
        "status": "Новый",
    },
    {
        "sender_name": "Екатерина Лебедева",
        "sender_email": "e.lebedeva@volga-build.ru",
        "company": "Волга Строй",
        "subject": "Уточнение условий поставки",
        "body": """Коллеги, добрый день. Интересует поставка партии светильников L-40,
50 шт. Подскажите срок производства, условия оплаты и есть ли доставка до Самары?""",
        "received_at": (datetime.now() - timedelta(hours=3, minutes=7)).isoformat(),
        "status": "В работе",
    },
    {
        "sender_name": "Денис Тихонов",
        "sender_email": "tikhonov@vector.pro",
        "company": "Вектор",
        "subject": "Срочный расчёт оборудования для объекта",
        "body": """Добрый день. Срочно нужен расчёт стоимости:
1. Контроллер AX-12 — 4 шт.
2. Блок питания PS-8 — 8 шт.
3. Монтажный комплект — 4 шт.
Нужно получить КП сегодня до конца дня.""",
        "received_at": (datetime.now() - timedelta(days=1, minutes=45)).isoformat(),
        "status": "Ждём ответ",
    },
    {
        "sender_name": "Ольга Новикова",
        "sender_email": "o.novikova@line-market.ru",
        "company": "Лайн Маркет",
        "subject": "Запрос образцов и каталога",
        "body": """Здравствуйте. Хотим запросить каталог новой коллекции и уточнить,
можете ли вы отправить три образца материалов в наш офис. Подскажите условия.""",
        "received_at": (datetime.now() - timedelta(days=2, hours=2)).isoformat(),
        "status": "Завершён",
    },
]


def company_from_email(sender_email: str) -> str:
    domain = sender_email.rsplit("@", 1)[-1].split(".")[0] if "@" in sender_email else ""
    return domain.replace("-", " ").title() or "Без компании"


def make_record(
    *,
    request_id: str,
    sender_name: str,
    sender_email: str,
    company: str,
    subject: str,
    body: str,
    received_at: str,
    analysis: AnalysisResult,
    status: str = "Новый",
    source: str = "email",
) -> dict[str, Any]:
    return {
        "id": request_id,
        "sender_name": sender_name or sender_email.split("@")[0],
        "sender_email": sender_email,
        "company": company or company_from_email(sender_email),
        "subject": subject or "Без темы",
        "body": body,
        "summary": analysis.summary,
        "request_type": analysis.request_type,
        "status": status,
        "priority": analysis.priority,
        "deadline": analysis.deadline,
        "items": analysis.items,
        "received_at": received_at or datetime.now().isoformat(),
        "confidence": analysis.confidence,
        "engine": analysis.engine,
        "source": source,
    }


def initialize_app() -> None:
    init_store()
    demo_records = []
    for index, message in enumerate(DEMO_EMAILS, start=1):
        analysis = analyze_email(message["subject"], message["body"])
        demo_records.append(
            make_record(
                request_id=f"demo-{index}",
                sender_name=message["sender_name"],
                sender_email=message["sender_email"],
                company=message["company"],
                subject=message["subject"],
                body=message["body"],
                received_at=message["received_at"],
                analysis=analysis,
                status=message["status"],
                source="demo",
            )
        )
    seed_requests(demo_records)
    st.session_state.setdefault("selected_request", "demo-1")
    st.session_state.setdefault("sync_message", "")


def format_received(value: str) -> str:
    try:
        date = datetime.fromisoformat(value.replace("Z", "+00:00")).replace(tzinfo=None)
    except (TypeError, ValueError):
        return "Недавно"
    now = datetime.now()
    if date.date() == now.date():
        return f"Сегодня, {date:%H:%M}"
    if date.date() == (now - timedelta(days=1)).date():
        return f"Вчера, {date:%H:%M}"
    return date.strftime("%d.%m, %H:%M")


def initials(name: str) -> str:
    parts = [part for part in name.split() if part]
    return "".join(part[0] for part in parts[:2]).upper() or "?"


def sync_mailbox() -> tuple[int, int]:
    fetched = fetch_unread()
    created = 0
    skipped = 0
    for message in fetched:
        analysis = analyze_email(message.subject, message.body)
        if not analysis.relevant:
            skipped += 1
            continue
        save_request(
            make_record(
                request_id=message.id,
                sender_name=message.sender_name,
                sender_email=message.sender_email,
                company=company_from_email(message.sender_email),
                subject=message.subject,
                body=message.body,
                received_at=message.received_at,
                analysis=analysis,
            )
        )
        created += 1
    return created, skipped


def render_sidebar() -> str:
    with st.sidebar:
        st.markdown(
            """
            <div class="brand">
                <div class="brand-mark">✦</div>
                <div>
                    <div class="brand-name">MailBrief</div>
                    <div class="brand-caption">умная входящая почта</div>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )
        page = st.radio(
            "Навигация",
            ("▣  Входящие", "◫  Запросы", "⚙  Настройки"),
            label_visibility="collapsed",
        )
        st.markdown('<div class="sidebar-spacer"></div>', unsafe_allow_html=True)
        engine = (
            f"Ollama · {escape(os.getenv('OLLAMA_MODEL', 'локальная модель'))}"
            if os.getenv("OLLAMA_BASE_URL")
            else "Локальный анализ"
        )
        st.markdown(
            f"""
            <div class="ai-chip">
                <span class="ai-dot"></span><b>ИИ работает</b><br>
                <span style="opacity:.68">{engine}<br>Без платных API</span>
            </div>
            """,
            unsafe_allow_html=True,
        )
    return page


def render_page_header(title: str, subtitle: str, show_sync: bool = False) -> None:
    title_col, action_col = st.columns([5, 1.25])
    with title_col:
        st.markdown(
            f"""
            <div class="eyebrow">Почтовый ассистент</div>
            <div class="page-title">{escape(title)}</div>
            <div class="page-subtitle">{escape(subtitle)}</div>
            """,
            unsafe_allow_html=True,
        )
    with action_col:
        if show_sync:
            st.write("")
            if st.button(
                "↻  Проверить почту",
                use_container_width=True,
                type="primary",
                disabled=not is_configured(),
            ):
                try:
                    with st.spinner("Проверяю новые письма…"):
                        created, skipped = sync_mailbox()
                    st.session_state.sync_message = (
                        f"Создано записей: {created}. Не относятся к запросам: {skipped}."
                    )
                    st.experimental_rerun()
                except Exception as error:
                    st.error(f"Не удалось проверить почту: {error}")


def render_metrics(records: list[dict[str, Any]]) -> None:
    new_count = sum(item["status"] == "Новый" for item in records)
    active_count = sum(item["status"] in {"В работе", "Ждём ответ"} for item in records)
    urgent_count = sum(
        item["priority"] == "Высокий" and item["status"] != "Завершён"
        for item in records
    )
    confidence = (
        round(sum(item["confidence"] for item in records) / len(records))
        if records
        else 0
    )
    st.markdown(
        f"""
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-label">Новые запросы</div>
                <div class="metric-value">{new_count}</div>
                <div class="metric-note good">готовы к обработке</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">В работе</div>
                <div class="metric-value">{active_count}</div>
                <div class="metric-note">требуют внимания</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Срочные</div>
                <div class="metric-value">{urgent_count}</div>
                <div class="metric-note">со сроком или высоким приоритетом</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Точность разбора</div>
                <div class="metric-value">{confidence}%</div>
                <div class="metric-note good">по уверенности анализатора</div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_request_detail(record: dict[str, Any]) -> None:
    status_class = "new" if record["status"] == "Новый" else ""
    priority_class = "high" if record["priority"] == "Высокий" else ""
    items = "".join(
        f'<div class="item-row"><span class="item-check">✓</span>'
        f"<span>{escape(item)}</span></div>"
        for item in record["items"]
    )
    if not items:
        items = (
            '<div class="item-row"><span class="item-check">·</span>'
            "<span>Конкретные позиции в письме не указаны</span></div>"
        )
    deadline = record["deadline"] or "Не указан"
    st.markdown(
        f"""
        <div class="detail-card">
            <div class="sender-row">
                <div class="avatar">{escape(initials(record["sender_name"]))}</div>
                <div>
                    <div class="sender-name">{escape(record["sender_name"])}</div>
                    <div class="sender-meta">{escape(record["company"])} ·
                    {escape(record["sender_email"])} · {escape(format_received(record["received_at"]))}</div>
                </div>
            </div>
            <div class="subject">{escape(record["subject"])}</div>
            <span class="badge {status_class}">{escape(record["status"])}</span>
            <span class="badge">{escape(record["request_type"])}</span>
            <span class="badge {priority_class}">Приоритет: {escape(record["priority"])}</span>
            <div class="summary-box">
                <div class="summary-title">✦ Кратко от ИИ · {record["confidence"]}%</div>
                <div class="summary-copy">{escape(record["summary"])}</div>
            </div>
            <div class="meta-grid">
                <div class="meta-item">
                    <div class="meta-label">Срок ответа</div>
                    <div class="meta-value">{escape(deadline)}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Источник</div>
                    <div class="meta-value">{escape(record["engine"])}</div>
                </div>
            </div>
            <div class="section-label">Что запрашивает клиент</div>
            {items}
        </div>
        """,
        unsafe_allow_html=True,
    )
    status_col, reply_col = st.columns([1.15, 1])
    with status_col:
        statuses = ["Новый", "В работе", "Ждём ответ", "Завершён"]
        selected = st.selectbox(
            "Статус запроса",
            statuses,
            index=statuses.index(record["status"]),
            key=f"status-{record['id']}",
        )
        if selected != record["status"]:
            update_status(record["id"], selected)
            st.experimental_rerun()
    with reply_col:
        st.write("")
        st.write("")
        mailto_subject = re.sub(r"\s+", "%20", f"Re: {record['subject']}")
        st.markdown(
            f'<a href="mailto:{escape(record["sender_email"])}?subject={escape(mailto_subject)}" '
            'style="display:block;text-align:center;padding:.68rem;border-radius:9px;'
            'background:#1c6b4b;color:white;text-decoration:none;font-weight:650;">'
            "Ответить клиенту ↗</a>",
            unsafe_allow_html=True,
        )
    with st.expander("Показать исходное письмо"):
        st.markdown(
            f'<div class="mail-body">{escape(record["body"])}</div>',
            unsafe_allow_html=True,
        )


def render_manual_import() -> None:
    with st.expander("＋  Добавить письмо вручную", expanded=False):
        with st.form("manual-email"):
            sender_col, email_col = st.columns(2)
            sender_name = sender_col.text_input("Имя отправителя", placeholder="Анна Смирнова")
            sender_email = email_col.text_input(
                "Email", placeholder="anna@company.ru"
            )
            subject = st.text_input("Тема письма", placeholder="Запрос коммерческого предложения")
            body = st.text_area(
                "Текст письма",
                placeholder="Вставьте сюда полученное письмо…",
                height=180,
            )
            submitted = st.form_submit_button(
                "Проанализировать и создать запись", type="primary"
            )
        if submitted:
            if not subject.strip() or not body.strip():
                st.warning("Добавьте тему и текст письма.")
                return
            analysis = analyze_email(subject, body)
            if not analysis.relevant:
                st.warning(
                    "Письмо не похоже на клиентский запрос, поэтому запись не создана."
                )
                return
            digest = hashlib.sha256(
                f"{sender_email}:{subject}:{body}".encode("utf-8")
            ).hexdigest()[:16]
            save_request(
                make_record(
                    request_id=digest,
                    sender_name=sender_name,
                    sender_email=sender_email or "unknown@example.com",
                    company=company_from_email(sender_email),
                    subject=subject,
                    body=body,
                    received_at=datetime.now().isoformat(),
                    analysis=analysis,
                    source="manual",
                )
            )
            st.session_state.selected_request = digest
            st.success("Запрос распознан, краткая сводка и карточка созданы.")
            st.experimental_rerun()


def render_inbox() -> None:
    render_page_header(
        "Запросы из почты",
        "ИИ находит обращения, делает краткую сводку и создаёт карточку.",
        show_sync=True,
    )
    if st.session_state.sync_message:
        st.success(st.session_state.sync_message)
        st.session_state.sync_message = ""

    all_records = list_requests()
    render_metrics(all_records)
    render_manual_import()
    st.write("")

    search_col, filter_col = st.columns([3.2, 1.35])
    with search_col:
        search = st.text_input(
            "Поиск",
            placeholder="⌕  Компания, отправитель или тема",
            label_visibility="collapsed",
        )
    with filter_col:
        status = st.selectbox(
            "Фильтр",
            ("Все", "Новый", "В работе", "Ждём ответ", "Завершён"),
            label_visibility="collapsed",
        )
    records = list_requests(status=status, search=search)

    list_col, detail_col = st.columns([.78, 1.32], gap="large")
    with list_col:
        st.markdown(
            f'<div class="inbox-count">{len(records)} '
            f'{"запись" if len(records) == 1 else "записей"} в списке</div>',
            unsafe_allow_html=True,
        )
        if not records:
            st.markdown(
                '<div class="empty-state">По этому фильтру ничего не найдено.</div>',
                unsafe_allow_html=True,
            )
        for record in records:
            prefix = "●" if record["status"] == "Новый" else "○"
            urgent = "  ·  СРОЧНО" if record["priority"] == "Высокий" else ""
            label = (
                f"{prefix}  {record['subject']}\n"
                f"{record['sender_name']} · {format_received(record['received_at'])}{urgent}"
            )
            if st.button(
                label,
                key=f"open-{record['id']}",
                use_container_width=True,
                type=(
                    "primary"
                    if st.session_state.selected_request == record["id"]
                    else "secondary"
                ),
            ):
                st.session_state.selected_request = record["id"]
                st.experimental_rerun()

    with detail_col:
        selected = next(
            (
                item
                for item in records
                if item["id"] == st.session_state.selected_request
            ),
            records[0] if records else None,
        )
        if selected:
            render_request_detail(selected)
        else:
            st.markdown(
                '<div class="empty-state">Выберите запрос, чтобы увидеть детали.</div>',
                unsafe_allow_html=True,
            )


def render_kanban() -> None:
    render_page_header(
        "Все запросы",
        "Следите за движением обращения от нового письма до закрытия.",
    )
    st.write("")
    records = list_requests()
    statuses = ["Новый", "В работе", "Ждём ответ", "Завершён"]
    columns = st.columns(4)
    for status, column in zip(statuses, columns):
        with column:
            status_records = [item for item in records if item["status"] == status]
            st.markdown(
                f'<div class="kanban-title">{escape(status)} · {len(status_records)}</div>',
                unsafe_allow_html=True,
            )
            for record in status_records:
                deadline = f"Срок: {record['deadline']}" if record["deadline"] else "Без срока"
                st.markdown(
                    f"""
                    <div class="kanban-card">
                        <div class="kanban-subject">{escape(record["subject"])}</div>
                        <div class="kanban-company">{escape(record["company"])} ·
                        {escape(record["sender_name"])}</div>
                        <div class="kanban-footer">{escape(deadline)}</div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )
                if st.button(
                    "Открыть",
                    key=f"kanban-{record['id']}",
                    use_container_width=True,
                ):
                    st.session_state.selected_request = record["id"]
                    st.session_state.page_override = "▣  Входящие"
                    st.experimental_rerun()


def render_settings() -> None:
    render_page_header(
        "Подключения",
        "Почта и локальная модель настраиваются через переменные окружения.",
    )
    st.write("")
    mail_status = "Подключена" if is_configured() else "Не настроена"
    ai_status = (
        f"Ollama · {os.getenv('OLLAMA_MODEL', 'qwen2.5:3b')}"
        if os.getenv("OLLAMA_BASE_URL")
        else "Встроенный локальный анализ"
    )
    first, second = st.columns(2)
    with first:
        st.markdown(
            f"""
            <div class="settings-card">
                <div class="eyebrow">Входящая почта</div>
                <h3 style="margin:.25rem 0 .55rem">IMAP · {mail_status}</h3>
                <div class="page-subtitle">Письма читаются в режиме read-only:
                приложение не меняет статус и не удаляет сообщения.</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with second:
        st.markdown(
            f"""
            <div class="settings-card">
                <div class="eyebrow">Обработка писем</div>
                <h3 style="margin:.25rem 0 .55rem">{escape(ai_status)}</h3>
                <div class="page-subtitle">Работает бесплатно и локально.
                При недоступности Ollama включается быстрый офлайн-анализ.</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    st.subheader("Переменные для подключения")
    st.code(
        """IMAP_HOST=imap.example.ru
IMAP_PORT=993
IMAP_USER=sales@example.ru
IMAP_PASSWORD=пароль-приложения
IMAP_FOLDER=INBOX

# Необязательно: бесплатная локальная LLM
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:3b""",
        language="bash",
    )
    st.info(
        "Для Gmail, Яндекс 360 и Mail.ru используйте пароль приложения, "
        "а не основной пароль от почты."
    )
    st.caption(f"Записей в локальной базе: {count_requests()}")


def main() -> None:
    st.markdown(APP_STYLES, unsafe_allow_html=True)
    initialize_app()
    page = render_sidebar()
    if st.session_state.pop("page_override", None):
        page = "▣  Входящие"
    if "Входящие" in page:
        render_inbox()
    elif "Запросы" in page:
        render_kanban()
    else:
        render_settings()


if __name__ == "__main__":
    main()