# Сводка

Веб- и Android-приложение для сбора ежедневных сведений от учреждений,
просмотра справок по датам и формирования сводной аналитики.

## Возможности

- форма вопросов и ответов с обязательными полями и автосохранением;
- главная страница с фильтрами по учреждению и датам;
- просмотр и скачивание итоговой справки в формате Microsoft Word;
- аналитика поступления форм, охвата, загрузки и нештатных ситуаций;
- справочник инструкций;
- настройка вопросов, пользователей, ролей и учреждений;
- роли «Администратор», «Оператор» и «Наблюдатель»;
- офлайн-очередь с автоматической отправкой после восстановления интернета;
- устанавливаемое PWA и нативная Android-оболочка на Capacitor.

## Быстрый запуск

Требуются Python 3.12+ и Node.js 22+.

```bash
python3 -m pip install -r backend/requirements.txt
npm ci --prefix frontend
python3 -m uvicorn backend.main:app --reload
```

Во втором терминале:

```bash
npm run dev --prefix frontend
```

Откройте `http://localhost:5173`.

Демонстрационные учётные записи:

| Роль | Логин | Пароль |
|---|---|---|
| Администратор | `admin` | `admin123` |
| Оператор ГКБ № 1 | `operator` | `operator123` |

При первом запуске SQLite-база и демонстрационные данные создаются автоматически
в `backend/data/reports.db`. Перед промышленным размещением смените пароли.

## Запуск в Docker

```bash
docker build -t svodka .
docker run --rm -p 8000:8000 -v svodka-data:/data svodka
```

Приложение будет доступно по адресу `http://localhost:8000`.

## Android APK

Android-клиент использует тот же интерфейс, локально хранит черновик и очередь
неотправленных форм. При первом входе пользователь указывает выданный
администратором публичный HTTPS-адрес сервера. Его также можно зафиксировать
для всех пользователей конкретной сборки:

```bash
cd frontend
cp .env.example .env
# Отредактируйте VITE_API_URL в .env
npx cap add android        # выполняется один раз
npm run android:build
```

Готовый debug APK:

`frontend/android/app/build/outputs/apk/debug/app-debug.apk`

Для публикации необходимо создать ключ подписи и выполнить release-сборку
стандартными средствами Android Studio/Gradle.

## Проверка

```bash
python3 -m pip install -r backend/requirements-dev.txt
python3 -m pytest backend/tests
npm run lint --prefix frontend
npm run build --prefix frontend
```

OpenAPI-документация сервера доступна по адресу `/docs`.
