# Форма Сводки

Веб- и Android-приложение для сбора, просмотра и анализа сводных справок учреждений.

## Возможности

- форма вопросов и ответов с обязательными полями, разделами и черновиками;
- главная страница с фильтрами по учреждению и диапазону дат;
- карточка справки и экспорт итогового документа в DOCX;
- справочник учреждений, актуальных вопросов и инструкция для сотрудников;
- аналитика по активности учреждений, периодам и общей оценке ситуации;
- роли администратора, специалиста и наблюдателя;
- настройки вопросов, вариантов ответов, пользователей и учреждений;
- PWA и Android-приложение с локальной очередью: форма работает без сети и автоматически отправляется при восстановлении подключения.

## Локальный запуск

Требуются Node.js 22+ и npm.

```bash
npm install
npm run dev
```

Веб-интерфейс откроется на `http://localhost:5173`, API — на `http://localhost:3001`.

Демонстрационные пользователи:

| Роль | Логин | Пароль |
|---|---|---|
| Администратор | `admin` | `admin123` |
| Специалист | `specialist` | `demo123` |
| Наблюдатель | `observer` | `demo123` |

Перед рабочим развёртыванием смените демонстрационные пароли, задайте длинный случайный `JWT_SECRET` и отключите тестовые записи через `SEED_DEMO=false`.

## Развёртывание

Скопируйте `.env.example` в `.env`, задайте параметры и выполните:

```bash
docker compose up --build -d
```

SQLite-база хранится в Docker volume `reports-data`. Для резервного копирования достаточно сохранить файл `reports.db`.

## Android APK

1. Укажите публичный HTTPS-адрес API в `VITE_API_URL`. Android-сборка не может обращаться к серверу через относительный `/api`.
2. Установите Android SDK и задайте `ANDROID_HOME`.
3. Синхронизируйте веб-сборку:

   ```bash
   npm run android:sync
   ```

4. Соберите APK:

   ```bash
   cd android
   ./gradlew assembleDebug
   ```

Готовый файл: `android/app/build/outputs/apk/debug/app-debug.apk`.

Для публикации используйте release-подпись Android. Офлайн-очередь хранится в защищённом хранилище приложения WebView и разделена по пользователям.

## Основные переменные окружения

| Переменная | Назначение |
|---|---|
| `VITE_API_URL` | Публичный URL API для production/Android |
| `PORT` | Порт сервера, по умолчанию `3001` |
| `JWT_SECRET` | Ключ подписи токенов |
| `DATABASE_PATH` | Путь к SQLite |
| `CORS_ORIGIN` | Разрешённые источники через запятую |
| `SEED_DEMO` | `false`, чтобы не создавать демонстрационные справки |
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
