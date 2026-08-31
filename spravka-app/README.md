# Сводные справки

Веб-приложение и Android APK для заполнения форм вопросов/ответов и формирования сводных справок.

## Возможности

- **Главная** — выбор учреждения, просмотр справок по датам, скачивание DOCX/XLSX
- **Заполнить** — быстрая форма вопросов и ответов (с офлайн-очередью)
- **Справочник** — учреждения, вопросы и варианты ответов
- **Аналитика** — сводка по учреждениям, датам и ответам
- **Настройки** (admin) — CRUD вопросов/ответов, пользователей (логин/пароль), учреждений
- **Android APK** — то же веб-приложение в Capacitor: офлайн-заполнение и выгрузка при появлении сети

## Быстрый старт (веб)

```bash
cd spravka-app
chmod +x run.sh
./run.sh
```

Откройте http://127.0.0.1:8000

Демо-учётки:

| Логин | Пароль | Роль |
|-------|--------|------|
| admin | admin123 | администратор |
| operator | operator123 | оператор |

## Разработка

```bash
# backend
source .venv/bin/activate
pip install -r backend/requirements.txt
PYTHONPATH=backend uvicorn app.main:app --reload --port 8000 --app-dir backend

# frontend (проксирует /api на :8000)
cd frontend && npm install && npm run dev
```

## Android APK

Проект Capacitor лежит в `android-app/`.

```bash
cd spravka-app
./scripts/build-android.sh
```

APK появится в `android-app/android/app/build/outputs/apk/debug/app-debug.apk`.

В настройках приложения (или через `capacitor.config`) укажите URL сервера API, если он не localhost.

Офлайн-режим: формы сохраняются в локальную очередь и синхронизируются через `POST /api/reports/sync` при появлении интернета.

## API

- `POST /api/auth/login` — вход
- `GET/POST /api/institutions` — учреждения
- `GET/POST /api/users` — пользователи
- `GET/POST /api/questions` — вопросы и ответы
- `GET/POST /api/reports` — справки
- `POST /api/reports/sync` — выгрузка офлайн-пакета
- `GET /api/reports/{id}/download?format=docx|xlsx` — итоговый документ
- `GET /api/analytics/summary` — аналитика
