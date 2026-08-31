# Сводные справки — формы вопросов/ответов, аналитика, Android APK

Основное приложение находится в каталоге [`spravka/`](./spravka/).

## Запуск

```bash
# API
cd spravka/server && python3 -m pip install -r requirements.txt && python3 run.py

# Web UI
cd spravka/web && npm install && npm run dev
```

Откройте http://localhost:5173  
Логин: `admin` / `admin123`

## Android

Готовый debug APK: [`spravka/releases/spravka-debug.apk`](./spravka/releases/spravka-debug.apk)

Сборка заново описана в [`spravka/README.md`](./spravka/README.md).

Прежний экспериментальный проект сохранён в `streamlit_app` и `swgoh_comlink_fetcher`.
