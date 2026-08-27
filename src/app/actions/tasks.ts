"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { requireActor, requireRole } from "@/lib/auth";

const statusSchema = z.enum([
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "BLOCKED",
  "DONE",
]);
const prioritySchema = z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);

const taskFieldsSchema = z.object({
    title: z.string().trim().min(2).max(240),
    description: z.string().trim().max(10_000).optional(),
    projectId: z.string().cuid().nullable().optional(),
    assigneeId: z.string().cuid().nullable().optional(),
    status: statusSchema.default("TODO"),
    priority: prioritySchema.default("MEDIUM"),
    startDate: z.coerce.date().nullable().optional(),
    dueDate: z.coerce.date().nullable().optional(),
    progress: z.number().int().min(0).max(100).default(0),
    category: z.string().trim().max(100).optional(),
    nextStep: z.string().trim().max(500).optional(),
  });

const createTaskSchema = taskFieldsSchema
  .refine(
    ({ startDate, dueDate }) =>
      !startDate || !dueDate || dueDate >= startDate,
    { path: ["dueDate"], message: "Некорректный дедлайн" },
  );

const updateTaskSchema = taskFieldsSchema
  .partial()
  .extend({
    id: z.string().cuid(),
  })
  .refine(
    ({ startDate, dueDate }) =>
      !startDate || !dueDate || dueDate >= startDate,
    { path: ["dueDate"], message: "Некорректный дедлайн" },
  );

async function assertTaskAccess(
  id: string,
  organizationId: string,
  userId: string,
  isManager: boolean,
) {
  const task = await getDb().task.findFirst({
    where: { id, organizationId },
    select: { id: true, assigneeId: true },
  });
  if (!task) throw new Error("Задача не найдена");
  if (!isManager && task.assigneeId !== userId) {
    throw new Error("Недостаточно прав для изменения этой задачи");
  }
  return task;
}

export async function createTask(input: unknown) {
  const actor = await requireActor();
  const values = createTaskSchema.parse(input);
  const db = getDb();

  if (values.projectId) {
    const project = await db.project.findFirst({
      where: { id: values.projectId, organizationId: actor.organizationId },
      select: { id: true },
    });
    if (!project) throw new Error("Проект не найден");
  }
  if (values.assigneeId) {
    const assignee = await db.user.findFirst({
      where: { id: values.assigneeId, organizationId: actor.organizationId },
      select: { id: true },
    });
    if (!assignee) throw new Error("Ответственный не найден");
  }

  const task = await db.task.create({
    data: {
      ...values,
      creatorId: actor.userId,
      organizationId: actor.organizationId,
      completedAt: values.status === "DONE" ? new Date() : null,
    },
  });
  await db.activityLog.create({
    data: {
      organizationId: actor.organizationId,
      userId: actor.userId,
      entityType: "Task",
      entityId: task.id,
      action: "CREATED",
      metadata: { title: task.title },
    },
  });
  revalidatePath("/");
  return task;
}

export async function updateTask(input: unknown) {
  const actor = await requireActor();
  const values = updateTaskSchema.parse(input);
  const isManager = ["OWNER", "ADMIN", "MANAGER"].includes(actor.role);
  await assertTaskAccess(
    values.id,
    actor.organizationId,
    actor.userId,
    isManager,
  );
  const { id, ...data } = values;
  const task = await getDb().task.update({ where: { id }, data });
  revalidatePath("/");
  return task;
}

export async function deleteTask(id: string) {
  const actor = await requireActor();
  requireRole(actor, ["OWNER", "ADMIN", "MANAGER"]);
  const taskId = z.string().cuid().parse(id);
  await assertTaskAccess(
    taskId,
    actor.organizationId,
    actor.userId,
    true,
  );
  await getDb().task.delete({ where: { id: taskId } });
  revalidatePath("/");
  return { success: true };
}

export async function completeTask(id: string) {
  return updateTaskStatus({ id, status: "DONE" });
}

export async function assignTask(input: unknown) {
  const actor = await requireActor();
  requireRole(actor, ["OWNER", "ADMIN", "MANAGER"]);
  const values = z
    .object({ id: z.string().cuid(), assigneeId: z.string().cuid().nullable() })
    .parse(input);
  await assertTaskAccess(
    values.id,
    actor.organizationId,
    actor.userId,
    true,
  );
  if (values.assigneeId) {
    const user = await getDb().user.findFirst({
      where: {
        id: values.assigneeId,
        organizationId: actor.organizationId,
      },
      select: { id: true },
    });
    if (!user) throw new Error("Ответственный не найден");
  }
  const task = await getDb().task.update({
    where: { id: values.id },
    data: { assigneeId: values.assigneeId },
  });
  revalidatePath("/");
  return task;
}

export async function updateTaskStatus(input: unknown) {
  const actor = await requireActor();
  const values = z
    .object({ id: z.string().cuid(), status: statusSchema })
    .parse(input);
  const isManager = ["OWNER", "ADMIN", "MANAGER"].includes(actor.role);
  await assertTaskAccess(
    values.id,
    actor.organizationId,
    actor.userId,
    isManager,
  );
  const task = await getDb().task.update({
    where: { id: values.id },
    data: {
      status: values.status,
      progress: values.status === "DONE" ? 100 : undefined,
      completedAt: values.status === "DONE" ? new Date() : null,
    },
  });
  revalidatePath("/");
  return task;
}

export async function bulkUpdateTasks(input: unknown) {
  const actor = await requireActor();
  requireRole(actor, ["OWNER", "ADMIN", "MANAGER"]);
  const values = z
    .object({
      ids: z.array(z.string().cuid()).min(1).max(100),
      status: statusSchema.optional(),
      priority: prioritySchema.optional(),
      assigneeId: z.string().cuid().nullable().optional(),
      projectId: z.string().cuid().nullable().optional(),
    })
    .refine(
      ({ status, priority, assigneeId, projectId }) =>
        status !== undefined ||
        priority !== undefined ||
        assigneeId !== undefined ||
        projectId !== undefined,
      "Нет изменений",
    )
    .parse(input);

  const count = await getDb().task.count({
    where: { id: { in: values.ids }, organizationId: actor.organizationId },
  });
  if (count !== values.ids.length) throw new Error("Часть задач не найдена");

  const { ids, ...data } = values;
  const result = await getDb().task.updateMany({
    where: { id: { in: ids }, organizationId: actor.organizationId },
    data,
  });
  revalidatePath("/");
  return result;
}
