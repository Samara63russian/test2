"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireActor } from "@/lib/auth";
import { getDb } from "@/lib/db";

async function assertTaskInTenant(taskId: string, organizationId: string) {
  const task = await getDb().task.findFirst({
    where: { id: taskId, organizationId },
    select: { id: true },
  });
  if (!task) throw new Error("Задача не найдена");
}

export async function createComment(input: unknown) {
  const actor = await requireActor();
  const values = z
    .object({
      taskId: z.string().cuid(),
      content: z.string().trim().min(1).max(10_000),
    })
    .parse(input);
  await assertTaskInTenant(values.taskId, actor.organizationId);
  const comment = await getDb().comment.create({
    data: { ...values, authorId: actor.userId },
  });
  revalidatePath("/");
  return comment;
}

export async function updateComment(input: unknown) {
  const actor = await requireActor();
  const values = z
    .object({
      id: z.string().cuid(),
      content: z.string().trim().min(1).max(10_000),
    })
    .parse(input);
  const comment = await getDb().comment.findFirst({
    where: {
      id: values.id,
      authorId: actor.userId,
      task: { organizationId: actor.organizationId },
    },
    select: { id: true },
  });
  if (!comment) throw new Error("Комментарий не найден");
  const updated = await getDb().comment.update({
    where: { id: values.id },
    data: { content: values.content },
  });
  revalidatePath("/");
  return updated;
}

export async function deleteComment(id: string) {
  const actor = await requireActor();
  const commentId = z.string().cuid().parse(id);
  const comment = await getDb().comment.findFirst({
    where: {
      id: commentId,
      task: { organizationId: actor.organizationId },
    },
    select: { id: true, authorId: true },
  });
  if (!comment) throw new Error("Комментарий не найден");
  if (
    comment.authorId !== actor.userId &&
    !["OWNER", "ADMIN"].includes(actor.role)
  ) {
    throw new Error("Недостаточно прав для удаления комментария");
  }
  await getDb().comment.delete({ where: { id: commentId } });
  revalidatePath("/");
  return { success: true };
}

export async function markNotificationRead(id: string) {
  const actor = await requireActor();
  const notificationId = z.string().cuid().parse(id);
  const notification = await getDb().notification.findFirst({
    where: { id: notificationId, userId: actor.userId },
    select: { id: true },
  });
  if (!notification) throw new Error("Уведомление не найдено");
  return getDb().notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}
