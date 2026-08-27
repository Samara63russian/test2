"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireActor, requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";

const projectFieldsSchema = z.object({
    name: z.string().trim().min(2).max(180),
    description: z.string().trim().max(4_000).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#315AE8"),
    status: z
      .enum(["PLANNED", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"])
      .default("PLANNED"),
    ownerId: z.string().cuid(),
    startDate: z.coerce.date().nullable().optional(),
    dueDate: z.coerce.date().nullable().optional(),
    progress: z.number().int().min(0).max(100).default(0),
  });

const projectSchema = projectFieldsSchema
  .refine(
    ({ startDate, dueDate }) =>
      !startDate || !dueDate || dueDate >= startDate,
    { path: ["dueDate"], message: "Некорректный срок проекта" },
  );

async function assertOwnerInTenant(ownerId: string, organizationId: string) {
  const owner = await getDb().user.findFirst({
    where: { id: ownerId, organizationId },
    select: { id: true },
  });
  if (!owner) throw new Error("Руководитель проекта не найден");
}

export async function createProject(input: unknown) {
  const actor = await requireActor();
  requireRole(actor, ["OWNER", "ADMIN", "MANAGER"]);
  const values = projectSchema.parse(input);
  await assertOwnerInTenant(values.ownerId, actor.organizationId);
  const project = await getDb().project.create({
    data: { ...values, organizationId: actor.organizationId },
  });
  revalidatePath("/");
  return project;
}

export async function updateProject(input: unknown) {
  const actor = await requireActor();
  requireRole(actor, ["OWNER", "ADMIN", "MANAGER"]);
  const values = projectFieldsSchema
    .partial()
    .extend({ id: z.string().cuid() })
    .refine(
      ({ startDate, dueDate }) =>
        !startDate || !dueDate || dueDate >= startDate,
      { path: ["dueDate"], message: "Некорректный срок проекта" },
    )
    .parse(input);
  const project = await getDb().project.findFirst({
    where: { id: values.id, organizationId: actor.organizationId },
    select: { id: true },
  });
  if (!project) throw new Error("Проект не найден");
  if (values.ownerId) {
    await assertOwnerInTenant(values.ownerId, actor.organizationId);
  }
  const { id, ...data } = values;
  const updated = await getDb().project.update({ where: { id }, data });
  revalidatePath("/");
  return updated;
}

export async function deleteProject(id: string) {
  const actor = await requireActor();
  requireRole(actor, ["OWNER", "ADMIN"]);
  const projectId = z.string().cuid().parse(id);
  const project = await getDb().project.findFirst({
    where: { id: projectId, organizationId: actor.organizationId },
    select: { id: true },
  });
  if (!project) throw new Error("Проект не найден");
  await getDb().project.delete({ where: { id: projectId } });
  revalidatePath("/");
  return { success: true };
}
