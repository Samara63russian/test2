import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  NotificationType,
  PrismaClient,
  ProjectStatus,
  TaskPriority,
  TaskStatus,
  UserRole,
} from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const names = [
  ["Александр Волков", "alexander@sever-group.ru", "Генеральный директор", UserRole.OWNER],
  ["Мария Соколова", "maria@sever-group.ru", "Руководитель проектов", UserRole.MANAGER],
  ["Иван Кузнецов", "ivan@sever-group.ru", "Ведущий разработчик", UserRole.MEMBER],
  ["Анна Морозова", "anna@sever-group.ru", "Продуктовый дизайнер", UserRole.MEMBER],
  ["Дмитрий Лебедев", "dmitry@sever-group.ru", "Маркетолог", UserRole.MEMBER],
  ["Екатерина Новикова", "ekaterina@sever-group.ru", "Бизнес-аналитик", UserRole.MEMBER],
] as const;

const projectSeeds = [
  ["Редизайн корпоративного сайта", "Новый визуальный язык и развитие ключевых страниц сайта", "#315AE8"],
  ["Запуск мобильного приложения", "Подготовка первой версии приложения к публичному запуску", "#0F9F82"],
  ["Автоматизация отдела продаж", "Единый цифровой процесс от лида до закрытия сделки", "#8B5CF6"],
  ["Маркетинговая кампания", "Комплексный запуск новой продуктовой коммуникации", "#EF8B2C"],
  ["Клиентский портал", "Упрощение обслуживания и рост цифрового самообслуживания", "#DE5C78"],
] as const;

const taskTitles = [
  "Подготовить прототип главной страницы",
  "Согласовать дизайн с руководством",
  "Настроить CRM-интеграцию",
  "Подготовить рекламные материалы",
  "Провести тестирование мобильного приложения",
  "Собрать обратную связь от клиентов",
  "Подготовить отчёт за август",
  "Обновить коммерческое предложение",
  "Сформировать карту пути клиента",
  "Провести нагрузочное тестирование API",
  "Подготовить структуру каталога",
  "Настроить события продуктовой аналитики",
] as const;

async function main() {
  const organization = await prisma.organization.upsert({
    where: { slug: "sever-group" },
    update: {},
    create: { name: "Север Групп", slug: "sever-group" },
  });

  const users = await Promise.all(
    names.map(([name, email, position, role]) =>
      prisma.user.upsert({
        where: {
          organizationId_email: {
            organizationId: organization.id,
            email,
          },
        },
        update: { name, position, role },
        create: {
          name,
          email,
          position,
          role,
          organizationId: organization.id,
        },
      }),
    ),
  );

  await prisma.notification.deleteMany({
    where: { user: { organizationId: organization.id } },
  });
  await prisma.activityLog.deleteMany({
    where: { organizationId: organization.id },
  });
  await prisma.comment.deleteMany({
    where: { task: { organizationId: organization.id } },
  });
  await prisma.taskDependency.deleteMany({
    where: { task: { organizationId: organization.id } },
  });
  await prisma.task.deleteMany({
    where: { organizationId: organization.id },
  });
  await prisma.project.deleteMany({
    where: { organizationId: organization.id },
  });

  const projects = await Promise.all(
    projectSeeds.map(([name, description, color], index) =>
      prisma.project.create({
        data: {
          name,
          description,
          color,
          status: ProjectStatus.ACTIVE,
          ownerId: users[(index + 1) % users.length].id,
          organizationId: organization.id,
          startDate: new Date(2026, 7, 1 + index),
          dueDate: new Date(2026, 8 + Math.floor(index / 3), 5 + index * 7),
          progress: [78, 64, 42, 56, 35][index],
        },
      }),
    ),
  );

  const statuses = [
    TaskStatus.DONE,
    TaskStatus.IN_PROGRESS,
    TaskStatus.REVIEW,
    TaskStatus.BLOCKED,
    TaskStatus.TODO,
    TaskStatus.BACKLOG,
  ];
  const priorities = [
    TaskPriority.CRITICAL,
    TaskPriority.HIGH,
    TaskPriority.MEDIUM,
    TaskPriority.LOW,
  ];

  const tasks = await Promise.all(
    Array.from({ length: 48 }, (_, index) => {
      const status = statuses[index % statuses.length];
      const dueDate =
        index % 11 === 0
          ? null
          : new Date(2026, 7, 19 + (index % 22));
      return prisma.task.create({
        data: {
          title: `${taskTitles[index % taskTitles.length]}${index >= taskTitles.length ? ` — этап ${Math.floor(index / taskTitles.length) + 1}` : ""}`,
          description:
            "Реалистичная рабочая задача с контекстом, ожидаемым результатом и понятным следующим шагом.",
          projectId: projects[index % projects.length].id,
          assigneeId: users[(index + 1) % users.length].id,
          creatorId: users[0].id,
          organizationId: organization.id,
          status,
          priority: priorities[index % priorities.length],
          startDate: new Date(2026, 7, 1 + (index % 20)),
          dueDate,
          progress:
            status === TaskStatus.DONE
              ? 100
              : status === TaskStatus.BACKLOG
                ? 0
                : 15 + ((index * 13) % 75),
          category: ["Дизайн", "Разработка", "Маркетинг", "Аналитика"][
            index % 4
          ],
          nextStep: "Согласовать результат с ответственными участниками",
          completedAt:
            status === TaskStatus.DONE
              ? new Date(2026, 7, 18 + (index % 7))
              : null,
        },
      });
    }),
  );

  await prisma.comment.createMany({
    data: tasks.slice(0, 10).map((task, index) => ({
      taskId: task.id,
      authorId: users[(index + 1) % users.length].id,
      content: [
        "Добавила последние изменения, можно посмотреть.",
        "Нужно уточнить финальные требования перед передачей дальше.",
        "Результат проверен, замечания оставил в описании.",
        "Срок актуален, успеваем завершить по плану.",
      ][index % 4],
    })),
  });

  await prisma.activityLog.createMany({
    data: tasks.slice(0, 12).map((task, index) => ({
      organizationId: organization.id,
      userId: users[index % users.length].id,
      entityType: "Task",
      entityId: task.id,
      action: ["CREATED", "STATUS_CHANGED", "COMMENT_ADDED", "UPDATED"][
        index % 4
      ],
      metadata: { taskTitle: task.title },
    })),
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: users[0].id,
        type: NotificationType.TASK_DUE_SOON,
        entityId: tasks[1].id,
      },
      {
        userId: users[0].id,
        type: NotificationType.TASK_BLOCKED,
        entityId: tasks[3].id,
      },
      {
        userId: users[0].id,
        type: NotificationType.COMMENT_MENTION,
        entityId: tasks[5].id,
      },
    ],
  });

  console.log(
    `Создано: ${users.length} пользователей, ${projects.length} проектов, ${tasks.length} задач.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
