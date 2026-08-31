"""Справка+ — MVP приложения для сбора сводных справок."""

from datetime import date, timedelta
from html import escape

import pandas as pd
import streamlit as st


st.set_page_config(
    page_title="Справка+",
    page_icon="✦",
    layout="wide",
    initial_sidebar_state="expanded",
)


def seed_state() -> None:
    """Seed demo data; production repositories can be swapped for API calls."""
    if "institutions" not in st.session_state:
        st.session_state.institutions = [
            {"id": "01", "name": "Городская клиническая больница № 1", "short": "ГКБ № 1", "region": "Центральный район", "status": "Активно"},
            {"id": "02", "name": "Детская поликлиника № 4", "short": "Детская поликлиника № 4", "region": "Северный район", "status": "Активно"},
            {"id": "03", "name": "Центр социального обслуживания", "short": "ЦСО", "region": "Западный район", "status": "Активно"},
            {"id": "04", "name": "Молодёжный центр «Вектор»", "short": "МЦ «Вектор»", "region": "Восточный район", "status": "Архив"},
        ]
    if "questions" not in st.session_state:
        st.session_state.questions = [
            {"section": "Общие сведения", "title": "Количество посетителей за отчётный период", "type": "Число", "required": True},
            {"section": "Общие сведения", "title": "Ответственный сотрудник на дату заполнения", "type": "Короткий текст", "required": True},
            {"section": "Кадровый состав", "title": "Укомплектованность штатными единицами", "type": "Процент", "required": True},
            {"section": "Кадровый состав", "title": "Есть ли открытые вакансии?", "type": "Да / Нет", "required": True},
            {"section": "Материальная база", "title": "Требуется ли срочный ремонт помещений?", "type": "Да / Нет", "required": True},
            {"section": "Материальная база", "title": "Комментарий к состоянию объекта", "type": "Развёрнутый текст", "required": False},
        ]
    if "reports" not in st.session_state:
        today = date.today()
        st.session_state.reports = [
            {"id": "SPR-2026-081", "institution": "ГКБ № 1", "date": today - timedelta(days=1), "author": "Елена Морозова", "status": "Подписана", "score": 94},
            {"id": "SPR-2026-080", "institution": "Детская поликлиника № 4", "date": today - timedelta(days=2), "author": "Илья Власов", "status": "На проверке", "score": 82},
            {"id": "SPR-2026-079", "institution": "ЦСО", "date": today - timedelta(days=4), "author": "Мария Ким", "status": "Подписана", "score": 96},
            {"id": "SPR-2026-078", "institution": "ГКБ № 1", "date": today - timedelta(days=8), "author": "Елена Морозова", "status": "Черновик", "score": 67},
            {"id": "SPR-2026-077", "institution": "МЦ «Вектор»", "date": today - timedelta(days=11), "author": "Антон Лебедев", "status": "Подписана", "score": 89},
            {"id": "SPR-2026-076", "institution": "ЦСО", "date": today - timedelta(days=16), "author": "Мария Ким", "status": "Подписана", "score": 91},
        ]
    if "users" not in st.session_state:
        st.session_state.users = [
            {"name": "Елена Морозова", "login": "e.morozova", "role": "Администратор", "last": "Сегодня, 08:42", "status": "Активен"},
            {"name": "Илья Власов", "login": "i.vlasov", "role": "Оператор", "last": "Вчера, 16:18", "status": "Активен"},
            {"name": "Мария Ким", "login": "m.kim", "role": "Оператор", "last": "29 авг, 11:07", "status": "Активен"},
            {"name": "Антон Лебедев", "login": "a.lebedev", "role": "Только просмотр", "last": "25 авг, 09:20", "status": "Заблокирован"},
        ]
    st.session_state.setdefault("offline_queue", [])
    st.session_state.setdefault("page", "Главная")
    st.session_state.setdefault("last_report", None)


def inject_styles() -> None:
    st.markdown(
        """
        <style>
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&display=swap');
        :root { --ink:#172338; --muted:#6d7890; --line:#e5eaf1; --navy:#17283f; --blue:#2d5bdb; --yellow:#f4bd4e; --bg:#f7f9fc; }
        html, body, [class*="css"] { font-family:'DM Sans', sans-serif; color:var(--ink); }
        .stApp { background:var(--bg); }
        [data-testid="stSidebar"] { background:#fff; border-right:1px solid var(--line); }
        [data-testid="stSidebar"] > div:first-child { padding: 2.1rem 1.15rem; }
        [data-testid="stSidebar"] .stRadio > div { gap:.35rem; }
        [data-testid="stSidebar"] label { border-radius:10px; padding:.62rem .75rem; font-size:.92rem; color:#59657a; }
        [data-testid="stSidebar"] label:hover { background:#f3f6fb; }
        h1,h2,h3,h4 { font-family:'Manrope',sans-serif; color:var(--ink); letter-spacing:-.025em; }
        h1 { font-size:2rem !important; margin-bottom:.25rem !important; }
        h2 { font-size:1.35rem !important; }
        .brand { display:flex; align-items:center; gap:10px; margin-bottom:2.1rem; }
        .brand-mark { width:35px; height:35px; border-radius:10px; background:var(--navy); display:grid; place-items:center; color:#f8c34f; font-size:21px; font-weight:800; }
        .brand-name { font:800 1.1rem 'Manrope'; color:var(--ink); } .brand-name span { color:var(--blue); }
        .eyebrow { text-transform:uppercase; letter-spacing:.14em; font:700 .68rem 'DM Sans'; color:#8b96a9; margin-bottom:.4rem; }
        .subtle { color:var(--muted); font-size:.91rem; }
        .topbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.7rem; }
        .user-chip { display:flex; align-items:center; gap:10px; font-size:.84rem; color:#58657a; }
        .avatar { width:33px; height:33px; border-radius:50%; display:grid; place-items:center; background:#e9efff; color:var(--blue); font-weight:700; }
        .status-pill { display:inline-block; border-radius:99px; padding:4px 10px; font-size:.73rem; font-weight:700; white-space:nowrap; }
        .status-pill.green { color:#18734a; background:#e5f6ed; } .status-pill.yellow { color:#9b6705; background:#fff4d7; } .status-pill.gray { color:#6c7689; background:#edf0f4; }
        .metric { background:#fff; border:1px solid var(--line); border-radius:14px; padding:17px 18px; min-height:115px; }
        .metric-label { font-size:.79rem; color:#778298; margin-bottom:13px; } .metric-value { font:800 1.75rem 'Manrope'; color:var(--ink); }
        .metric-note { font-size:.75rem; margin-top:7px; color:#229264; } .metric-note.warn { color:#d18b14; }
        .panel { background:#fff; border:1px solid var(--line); border-radius:15px; padding:20px; }
        .panel-title { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.1rem; }
        .panel-title h3 { margin:0; font-size:1rem; } .panel-title span { color:#929caf; font-size:.78rem; }
        .table-head { color:#8994a6; text-transform:uppercase; letter-spacing:.1em; font-size:.67rem; font-weight:700; padding:0 0 9px; border-bottom:1px solid var(--line); }
        .table-row { display:grid; grid-template-columns:1.1fr 1.25fr .9fr .72fr .7fr; align-items:center; gap:8px; padding:14px 0; border-bottom:1px solid #eef1f5; font-size:.81rem; }
        .table-row:last-child { border-bottom:0; } .table-row strong { font-weight:600; } .table-row small { display:block; color:#9aa3b2; margin-top:3px; font-size:.72rem; }
        .section-label { font:700 .75rem 'Manrope'; color:#536178; text-transform:uppercase; letter-spacing:.09em; border-bottom:1px solid var(--line); padding-bottom:9px; margin:1.4rem 0 1rem; }
        .progress { height:7px; border-radius:5px; background:#edf0f4; overflow:hidden; margin-top:8px; } .progress > div { height:100%; background:var(--blue); border-radius:5px; }
        .notice { display:flex; gap:12px; align-items:flex-start; background:#f0f5ff; border:1px solid #dce7ff; border-radius:12px; padding:13px 15px; color:#4d5d7a; font-size:.83rem; }
        .notice b { color:var(--blue); } .offline { background:#fff8e8; border-color:#f6e4b3; }
        div[data-testid="stMetric"] { background:#fff; border:1px solid var(--line); padding:14px; border-radius:14px; }
        div[data-testid="stButton"] > button, div[data-testid="stFormSubmitButton"] > button { border-radius:9px; border:1px solid #d9e0eb; font-weight:600; min-height:2.35rem; }
        div[data-testid="stButton"] > button[kind="primary"], div[data-testid="stFormSubmitButton"] > button[kind="primary"] { background:var(--blue); border-color:var(--blue); }
        .stTextInput input, .stTextArea textarea, .stSelectbox div[data-baseweb="select"], .stDateInput input { border-radius:8px; }
        .footer { color:#a0a9b8; font-size:.72rem; margin-top:3rem; padding-top:1rem; border-top:1px solid var(--line); }
        @media (max-width: 800px) { .table-row { grid-template-columns:1fr 1fr; gap:6px; } .table-head { display:none; } h1 { font-size:1.6rem !important; } }
        </style>
        """,
        unsafe_allow_html=True,
    )


def pill(status: str) -> str:
    color = "green" if status in ("Подписана", "Активен", "Синхронизировано") else "yellow" if status in ("На проверке", "Черновик") else "gray"
    return f'<span class="status-pill {color}">{escape(status)}</span>'


def page_header(kicker: str, title: str, subtitle: str = "") -> None:
    st.markdown(f'<div class="eyebrow">{kicker}</div><h1>{title}</h1><div class="subtle">{subtitle}</div>', unsafe_allow_html=True)


def sidebar() -> None:
    with st.sidebar:
        st.markdown('<div class="brand"><div class="brand-mark">✦</div><div class="brand-name">Справка<span>+</span></div></div>', unsafe_allow_html=True)
        st.markdown('<div class="eyebrow">Рабочее пространство</div>', unsafe_allow_html=True)
        pages = ["⌂  Главная", "＋  Новая справка", "▦  Справочник", "◔  Аналитика", "⚙  Настройки"]
        current_index = next((i for i, page in enumerate(pages) if st.session_state.page in page), 0)
        selected = st.radio("Навигация", pages, label_visibility="collapsed", index=current_index)
        st.session_state.page = selected.split("  ", 1)[1]
        st.markdown("<br>", unsafe_allow_html=True)
        if st.session_state.offline_queue:
            st.markdown(f'<div class="notice offline">◌ <div><b>Офлайн-режим</b><br>{len(st.session_state.offline_queue)} справки ждут отправки</div></div>', unsafe_allow_html=True)
        st.markdown('<div class="footer">Справка+ v1.0 · защищённое соединение<br>Последняя синхронизация: сегодня, 08:42</div>', unsafe_allow_html=True)


def topbar() -> None:
    st.markdown('<div class="topbar"><div></div><div class="user-chip"><span>Елена Морозова<br><small>Администратор</small></span><span class="avatar">ЕМ</span></div></div>', unsafe_allow_html=True)


def home_page() -> None:
    page_header("Обзор", "Доброе утро, Елена", "Соберите сводку по учреждениям за несколько минут.")
    st.markdown("<br>", unsafe_allow_html=True)
    c1, c2, c3, c4 = st.columns(4)
    for col, label, value, note, extra in [
        (c1, "Справки за месяц", "128", "↑ 12% к прошлому месяцу", ""),
        (c2, "На проверке", "7", "требуют вашего внимания", "warn"),
        (c3, "Учреждения", "24", "3 новых за этот квартал", ""),
        (c4, "Средняя полнота", "91%", "↑ 4% за 30 дней", ""),
    ]:
        with col:
            st.markdown(f'<div class="metric"><div class="metric-label">{label}</div><div class="metric-value">{value}</div><div class="metric-note {extra}">{note}</div></div>', unsafe_allow_html=True)
    st.markdown("<br>", unsafe_allow_html=True)
    left, right = st.columns([1.6, 1])
    with left:
        st.markdown('<div class="panel"><div class="panel-title"><h3>Последние справки</h3><span>Обновлено только что</span></div><div class="table-head" style="display:grid;grid-template-columns:1.1fr 1.25fr .9fr .72fr .7fr;gap:8px"><span>Номер</span><span>Учреждение</span><span>Дата</span><span>Автор</span><span>Статус</span></div>', unsafe_allow_html=True)
        for report in st.session_state.reports[:5]:
            st.markdown(f'<div class="table-row"><strong>{report["id"]}<small>Ежемесячная</small></strong><span>{report["institution"]}</span><span>{report["date"].strftime("%d.%m.%Y")}</span><span>{report["author"].split()[0]}</span><span>{pill(report["status"])}</span></div>', unsafe_allow_html=True)
        st.markdown("</div>", unsafe_allow_html=True)
    with right:
        st.markdown('<div class="panel"><div class="panel-title"><h3>Заполненность по учреждениям</h3><span>август</span></div>', unsafe_allow_html=True)
        for name, percent in [("ГКБ № 1", 96), ("Детская поликлиника № 4", 89), ("ЦСО", 92), ("МЦ «Вектор»", 71)]:
            st.markdown(f'<div style="display:flex;justify-content:space-between;font-size:.8rem;margin:14px 0 0"><span>{name}</span><b>{percent}%</b></div><div class="progress"><div style="width:{percent}%"></div></div>', unsafe_allow_html=True)
        st.markdown("<br>", unsafe_allow_html=True)
        st.markdown('<div class="notice">✦ <div><b>План на сегодня</b><br>3 справки ожидают проверки руководителя.</div></div></div>', unsafe_allow_html=True)
    st.markdown("<br>", unsafe_allow_html=True)
    a, b = st.columns([1, 1])
    with a:
        if st.button("＋  Заполнить новую справку", type="primary", use_container_width=True):
            st.session_state.page = "Новая справка"
            st.rerun()
    with b:
        if st.button("Открыть все справки", use_container_width=True):
            st.session_state.page = "Справочник"
            st.rerun()


def questionnaire_page() -> None:
    page_header("Работа со справками", "Новая справка", "Заполните обязательные поля — черновик сохранится автоматически.")
    st.markdown("<br>", unsafe_allow_html=True)
    if st.session_state.offline_queue:
        st.markdown(f'<div class="notice offline">◌ <div><b>Нет подключения к серверу</b><br>Справка сохранится на устройстве и будет отправлена автоматически после восстановления сети. В очереди: {len(st.session_state.offline_queue)}</div></div><br>', unsafe_allow_html=True)
    with st.form("questionnaire"):
        m1, m2, m3 = st.columns([1.3, 1, 1])
        with m1:
            institution = st.selectbox("Учреждение *", [x["short"] for x in st.session_state.institutions if x["status"] == "Активно"])
        with m2:
            report_date = st.date_input("Отчётная дата *", date.today())
        with m3:
            form_kind = st.selectbox("Тип справки", ["Ежемесячная", "Внеплановая", "Квартальная"])
        answers = {}
        current_section = None
        for index, question in enumerate(st.session_state.questions):
            if question["section"] != current_section:
                current_section = question["section"]
                st.markdown(f'<div class="section-label">{current_section}</div>', unsafe_allow_html=True)
            key = f"q_{index}"
            label = question["title"] + (" *" if question["required"] else "")
            if question["type"] == "Да / Нет":
                answers[question["title"]] = st.radio(label, ["Да", "Нет"], horizontal=True, key=key)
            elif question["type"] == "Число":
                answers[question["title"]] = st.number_input(label, min_value=0, step=1, key=key)
            elif question["type"] == "Процент":
                answers[question["title"]] = st.slider(label, 0, 100, 75, key=key)
            elif question["type"] == "Развёрнутый текст":
                answers[question["title"]] = st.text_area(label, key=key, height=90)
            else:
                answers[question["title"]] = st.text_input(label, key=key)
        st.markdown("<br>", unsafe_allow_html=True)
        submit, draft = st.columns([1, 1])
        with submit:
            submitted = st.form_submit_button("✓  Отправить на проверку", type="primary", use_container_width=True)
        with draft:
            saved_draft = st.form_submit_button("Сохранить на устройстве", use_container_width=True)
    if submitted or saved_draft:
        report_id = f"SPR-{date.today().year}-{len(st.session_state.reports) + len(st.session_state.offline_queue) + 82:03d}"
        new_report = {"id": report_id, "institution": institution, "date": report_date, "author": "Елена Морозова", "status": "На проверке" if submitted else "Черновик", "score": 100, "answers": answers, "kind": form_kind}
        if saved_draft:
            st.session_state.offline_queue.append(new_report)
            st.session_state.last_report = new_report
            st.success("Черновик сохранён на устройстве. Он будет выгружен автоматически.")
        else:
            st.session_state.reports.insert(0, new_report)
            st.session_state.last_report = new_report
            st.success(f"Справка {report_id} отправлена на проверку.")
    if st.session_state.last_report:
        report = st.session_state.last_report
        st.download_button("↓  Скачать итоговый документ", data=render_document(report), file_name=f'{report["id"]}.doc', mime="application/msword", use_container_width=True)


def render_document(report: dict) -> str:
    items = "".join(f"<tr><td>{escape(str(key))}</td><td>{escape(str(value))}</td></tr>" for key, value in report.get("answers", {}).items())
    return f"""<html><head><meta charset="utf-8"><style>body{{font-family:Arial;color:#172338}}table{{border-collapse:collapse;width:100%}}td{{border:1px solid #ddd;padding:8px}}td:first-child{{font-weight:bold;width:45%}}</style></head><body><h1>Итоговая справка {escape(report['id'])}</h1><p><b>Учреждение:</b> {escape(report['institution'])}<br><b>Дата:</b> {report['date'].strftime('%d.%m.%Y')}<br><b>Автор:</b> {escape(report['author'])}</p><table>{items}</table></body></html>"""


def directory_page() -> None:
    page_header("Данные", "Справочник учреждений", "Управляйте списком объектов, по которым формируются справки.")
    st.markdown("<br>", unsafe_allow_html=True)
    active = [x for x in st.session_state.institutions if x["status"] == "Активно"]
    c1, c2, c3 = st.columns(3)
    c1.metric("Всего учреждений", len(st.session_state.institutions))
    c2.metric("Активных", len(active))
    c3.metric("В архиве", len(st.session_state.institutions) - len(active))
    st.markdown("<br>", unsafe_allow_html=True)
    with st.expander("＋  Добавить учреждение"):
        with st.form("new_institution"):
            name, short, region = st.columns([1.5, 1, 1])
            with name:
                new_name = st.text_input("Полное название *")
            with short:
                new_short = st.text_input("Короткое название *")
            with region:
                new_region = st.text_input("Район")
            if st.form_submit_button("Добавить", type="primary"):
                if new_name and new_short:
                    st.session_state.institutions.append({"id": str(len(st.session_state.institutions) + 1).zfill(2), "name": new_name, "short": new_short, "region": new_region or "Не указан", "status": "Активно"})
                    st.success("Учреждение добавлено.")
                    st.rerun()
    st.markdown("<br>", unsafe_allow_html=True)
    for institution in st.session_state.institutions:
        left, mid, actions = st.columns([1.4, 1.1, .75])
        with left:
            st.markdown(f'<b>{institution["short"]}</b><br><span class="subtle">{institution["name"]}</span>', unsafe_allow_html=True)
        with mid:
            st.markdown(f'<span class="subtle">{institution["region"]}</span><br>{pill(institution["status"])}', unsafe_allow_html=True)
        with actions:
            button_label = "В архив" if institution["status"] == "Активно" else "Восстановить"
            if st.button(button_label, key=f"status_{institution['id']}"):
                institution["status"] = "Архив" if institution["status"] == "Активно" else "Активно"
                st.rerun()
        st.divider()


def analytics_page() -> None:
    page_header("Контроль качества", "Аналитика", "Следите за динамикой заполнения и полнотой данных.")
    st.markdown("<br>", unsafe_allow_html=True)
    f1, f2 = st.columns([1, 1])
    with f1:
        selected_institution = st.selectbox("Учреждение", ["Все учреждения"] + [x["short"] for x in st.session_state.institutions])
    with f2:
        st.selectbox("Период", ["Последние 30 дней", "Последние 90 дней", "Текущий год"])
    reports = pd.DataFrame(st.session_state.reports)
    if selected_institution != "Все учреждения":
        reports = reports[reports.institution == selected_institution]
    c1, c2, c3 = st.columns(3)
    c1.metric("Сформировано справок", len(reports), "за выбранный период")
    c2.metric("Средняя полнота", f'{reports.score.mean():.0f}%' if len(reports) else "—", "по всем ответам")
    c3.metric("Просрочено", "2", "нужно проверить", delta_color="inverse")
    st.markdown("<br>", unsafe_allow_html=True)
    chart, distribution = st.columns([1.55, 1])
    with chart:
        st.markdown('<div class="panel"><div class="panel-title"><h3>Динамика заполнения</h3><span>справки по дням</span></div>', unsafe_allow_html=True)
        chart_data = pd.DataFrame({"Дата": pd.date_range(date.today() - timedelta(days=29), date.today()), "Справки": [2, 3, 1, 4, 3, 5, 2, 4, 6, 3, 2, 5, 4, 6, 3, 5, 7, 4, 6, 5, 7, 6, 8, 5, 6, 8, 7, 9, 7, 8]})
        st.line_chart(chart_data.set_index("Дата"), height=245)
        st.markdown("</div>", unsafe_allow_html=True)
    with distribution:
        st.markdown('<div class="panel"><div class="panel-title"><h3>Статусы справок</h3><span>всего 128</span></div>', unsafe_allow_html=True)
        for label, count, color in [("Подписаны", 96, "#2d5bdb"), ("На проверке", 21, "#f4bd4e"), ("Черновики", 11, "#cbd2dd")]:
            st.markdown(f'<div style="display:flex;justify-content:space-between;font-size:.82rem;margin:13px 0 5px"><span><i style="display:inline-block;background:{color};width:8px;height:8px;border-radius:50%;margin-right:7px"></i>{label}</span><b>{count}</b></div><div class="progress"><div style="width:{round(count/128*100)}%;background:{color}"></div></div>', unsafe_allow_html=True)
        st.markdown("<br><br><div class='notice'>↗ <div><b>+12%</b> справок создано<br>по сравнению с июлем</div></div></div>", unsafe_allow_html=True)


def settings_page() -> None:
    page_header("Администрирование", "Настройки", "Вопросы, пользователи и параметры рабочего пространства.")
    st.markdown("<br>", unsafe_allow_html=True)
    tab_questions, tab_users, tab_system = st.tabs(["Вопросы формы", "Пользователи", "Система"])
    with tab_questions:
        st.markdown("<br><div class='subtle'>Изменения применяются к новым справкам. Всего вопросов: <b>" + str(len(st.session_state.questions)) + "</b></div>", unsafe_allow_html=True)
        edited = st.data_editor(pd.DataFrame(st.session_state.questions), use_container_width=True, hide_index=True, num_rows="dynamic", column_config={"section": "Раздел", "title": "Формулировка вопроса", "type": "Тип ответа", "required": "Обязательный"})
        if st.button("Сохранить вопросы", type="primary"):
            st.session_state.questions = edited.fillna("").to_dict("records")
            st.success("Настройки формы сохранены.")
    with tab_users:
        st.markdown("<br>", unsafe_allow_html=True)
        if st.button("＋  Пригласить пользователя", type="primary"):
            st.info("Ссылка для приглашения будет создана после подключения серверного API.")
        st.markdown("<br>", unsafe_allow_html=True)
        for user in st.session_state.users:
            c1, c2, c3, c4 = st.columns([1.2, 1.05, .9, .65])
            with c1:
                st.markdown(f'<b>{user["name"]}</b><br><span class="subtle">{user["login"]}</span>', unsafe_allow_html=True)
            with c2:
                st.markdown(f'<span class="subtle">{user["role"]}</span><br>{pill(user["status"])}', unsafe_allow_html=True)
            with c3:
                st.markdown(f'<span class="subtle">Последний вход</span><br><small>{user["last"]}</small>', unsafe_allow_html=True)
            with c4:
                if st.button("Изменить", key=f"edit_{user['login']}"):
                    st.info(f'Редактирование пользователя {user["name"]}')
            st.divider()
    with tab_system:
        st.markdown("<br>", unsafe_allow_html=True)
        st.toggle("Автоматическая синхронизация", value=True)
        st.toggle("Уведомлять о новых справках", value=True)
        st.selectbox("Часовой пояс", ["Москва (UTC+3)", "Калининград (UTC+2)", "Екатеринбург (UTC+5)"])
        st.markdown('<br><div class="notice">🔒 Данные передаются по защищённому соединению. Резервная копия создаётся ежедневно.</div>', unsafe_allow_html=True)


def main() -> None:
    seed_state()
    inject_styles()
    sidebar()
    topbar()
    page = st.session_state.page
    if page == "Главная":
        home_page()
    elif page == "Новая справка":
        questionnaire_page()
    elif page == "Справочник":
        directory_page()
    elif page == "Аналитика":
        analytics_page()
    else:
        settings_page()


if __name__ == "__main__":
    main()
