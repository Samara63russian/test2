# Север — рабочее пространство

Русскоязычный операционный центр для управления задачами, проектами и
командой. Интерфейс построен на Next.js, React и TypeScript; серверный слой
использует PostgreSQL и Prisma.

## Запуск

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

После запуска приложение доступно на `http://localhost:3000`.

## Проверки

```bash
npm run typecheck
npm run lint
npm run build
```

## Архитектура

- `src/app` — App Router, серверные действия и глобальные стили;
- `src/components` — оболочка приложения, представления и интерактивные панели;
- `src/lib` — типы, локализация, доступ к данным и проверка сессии;
- `prisma/schema.prisma` — multi-tenant модель данных и индексы;
- `prisma/seed.ts` — демонстрационная организация, 6 сотрудников, 5 проектов
  и 48 реалистичных задач.

Все серверные изменения проверяют `organizationId`; операции управления
защищены ролями «Владелец», «Администратор», «Руководитель» и «Сотрудник».

Прежний экспериментальный Python-проект сохранён в каталогах
`streamlit_app` и `swgoh_comlink_fetcher`.
