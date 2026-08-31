# Сводные справки — QA Reports

Веб-приложение и Android-клиент для заполнения форм вопросов/ответов и формирования сводных справок по учреждениям.

## Возможности

### Веб-приложение
- **Главная** — выбор учреждения, фильтрация справок по датам, скачивание DOCX
- **Форма справки** — заполнение вопросов по категориям
- **Справочник** — нормативы, шаблоны формулировок
- **Аналитика** — статистика по учреждениям, месяцам, статусам
- **Настройки** (админ) — управление вопросами, пользователями, учреждениями, справочником

### Android APK
- Быстрое заполнение формы на мобильном устройстве
- Офлайн-режим с локальным сохранением
- Синхронизация с сервером при подключении к интернету
- Скачивание итогового документа DOCX

## Быстрый старт

### Docker

```bash
cd qa_reports
docker compose up --build
```

Откройте http://localhost:8000

### Локальный запуск

```bash
chmod +x start.sh
./start.sh
```

### Учётные данные по умолчанию

| Логин | Пароль   | Роль          |
|-------|----------|---------------|
| admin | admin123 | Администратор |
| user  | user123  | Пользователь  |

## Сборка Android APK

1. Запустите сервер и узнайте его IP-адрес в локальной сети
2. Выполните:

```bash
chmod +x build-android.sh
./build-android.sh http://192.168.1.100:8000
```

3. Соберите APK:

```bash
cd frontend/android
./gradlew assembleDebug
```

APK: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

Для production-сборки используйте Android Studio (`npx cap open android`).

## Архитектура

```
qa_reports/
├── backend/          # FastAPI + SQLite
│   └── app/
│       ├── routers/  # API endpoints
│       ├── models.py # Модели БД
│       └── document.py # Генерация DOCX
├── frontend/         # React + Vite + Capacitor
│   └── src/
│       ├── pages/    # Страницы приложения
│       ├── api.ts    # HTTP клиент
│       └── offline.ts # Офлайн-хранилище
└── docker-compose.yml
```

## API

- `POST /api/auth/login-json` — авторизация
- `GET /api/institutions/` — список учреждений
- `GET /api/questions/` — вопросы формы
- `GET/POST /api/reports/` — справки
- `POST /api/reports/sync` — синхронизация с мобильного
- `GET /api/reports/{id}/export` — скачать DOCX
- `GET /api/analytics/summary` — аналитика
- `GET /api/reference/` — справочник

## Переменные окружения

| Переменная   | Описание              | По умолчанию        |
|-------------|------------------------|---------------------|
| SECRET_KEY  | JWT секрет             | qa-reports-secret... |
| DATABASE_URL| URL базы данных        | sqlite:///./qa_reports.db |
| CORS_ORIGINS| Разрешённые origins    | *                   |
