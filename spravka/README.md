# Сводные справки

Веб-приложение и Android APK для заполнения форм «вопрос — ответ», учёта учреждений и выгрузки итоговых документов (DOCX / XLSX).

## Возможности

- **Главная** — выбор учреждения, фильтр справок по датам, скачивание документов
- **Заполнение** — форма вопросов/ответов, офлайн-сохранение и выгрузка на сервер при появлении сети
- **Справочник** — учреждения и перечень вопросов
- **Аналитика** — сводные показатели и графики
- **Настройки** (админ) — CRUD вопросов и вариантов ответов, пользователей (логин/пароль), учреждений
- **Android APK** — Capacitor-оболочка того же интерфейса с быстрым заполнением и синхронизацией

## Быстрый старт (веб)

```bash
# Backend
cd spravka/server
python3 -m pip install -r requirements.txt
python3 run.py

# Frontend (другое окно)
cd spravka/web
npm install
npm run dev
```

Откройте http://localhost:5173

### Учётные записи по умолчанию

| Логин | Пароль | Роль |
|-------|--------|------|
| `admin` | `admin123` | Администратор |
| `operator` | `operator123` | Пользователь |

## Production-сборка (один сервер)

```bash
cd spravka/web && npm install && npm run build
cd ../server && python3 -m pip install -r requirements.txt
SPRAVKA_SECRET_KEY=change-me uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Статика из `web/dist` отдаётся самим FastAPI.

## Android APK

```bash
cd spravka/web && npm install && npm run build
cd ../mobile
npm install
node scripts/copy-web.js
npx cap add android   # один раз
npx cap sync android
```

Далее в Android Studio:

```bash
npx cap open android
```

Соберите APK: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.

Либо из командной строки (нужен Android SDK):

```bash
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

На экране входа укажите **адрес сервера** (например `http://192.168.1.10:8000` — IP машины с API в той же Wi‑Fi сети). Для эмулятора Android используйте `http://10.0.2.2:8000`.

## API

- `POST /api/auth/login-json` — вход
- `GET/POST /api/institutions` — учреждения
- `GET/POST /api/questions` — вопросы и варианты ответов
- `GET/POST /api/reports` — справки
- `POST /api/reports/sync` — выгрузка офлайн-форм с мобильного
- `GET /api/reports/{id}/download?format=docx|xlsx` — итоговый документ
- `GET /api/analytics/summary` — аналитика

## Структура

```
spravka/
  server/   FastAPI + SQLite
  web/      React (Vite)
  mobile/   Capacitor Android
```
