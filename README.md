# MailBrief

Веб‑приложение для отдела продаж: читает новые письма, находит запросы клиентов,
делает короткую сводку и создаёт карточки для дальнейшей работы.

## Возможности

- read-only синхронизация непрочитанных писем по IMAP;
- определение запросов на КП, прайс-лист и общих обращений;
- извлечение позиций, количества, срока и приоритета;
- бесплатный локальный анализ без передачи писем во внешние сервисы;
- опциональная работа с локальной LLM через Ollama;
- статусы запроса и kanban-представление;
- ручная вставка письма для быстрой проверки;
- локальное хранение карточек в SQLite.

При первом запуске приложение показывает демонстрационные письма. Реальные письма
появятся после настройки IMAP.

## Быстрый запуск

```bash
cd streamlit_app
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
```

Интерфейс будет доступен на `http://localhost:8501`.

## Подключение почты

Перед запуском задайте переменные окружения:

```bash
export IMAP_HOST=imap.example.ru
export IMAP_PORT=993
export IMAP_USER=sales@example.ru
export IMAP_PASSWORD=пароль-приложения
export IMAP_FOLDER=INBOX
```

Для Gmail, Яндекс 360 и Mail.ru нужен отдельный пароль приложения. Клиент
открывает папку в read-only режиме и использует `BODY.PEEK[]`, поэтому письма не
помечаются прочитанными.

## Бесплатная локальная модель

Без дополнительной настройки используется встроенный офлайн-анализ. Для более
свободного понимания текста можно подключить бесплатную локальную модель Ollama:

```bash
ollama pull qwen2.5:3b
export OLLAMA_BASE_URL=http://localhost:11434
export OLLAMA_MODEL=qwen2.5:3b
streamlit run streamlit_app/app.py
```

Если Ollama недоступна или возвращает ошибку, приложение автоматически продолжит
работу на встроенном анализаторе.

## Docker

```bash
docker build -t mailbrief .
docker run --rm -p 8501:8501 --env-file .env mailbrief
```

Для постоянного хранения базы укажите `MAILBRIEF_DB_PATH` и подключите volume.

## Проверка

```bash
python -m unittest discover -s streamlit_app/tests
```
