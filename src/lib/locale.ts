import type { ProjectState, TaskPriority, TaskState, TaskStatus } from "./types";

export const statusLabels: Record<TaskStatus, string> = {
  BACKLOG: "Бэклог",
  TODO: "К выполнению",
  IN_PROGRESS: "В работе",
  REVIEW: "На проверке",
  BLOCKED: "Заблокировано",
  DONE: "Выполнено",
};

export const priorityLabels: Record<TaskPriority, string> = {
  CRITICAL: "Критический",
  HIGH: "Высокий",
  MEDIUM: "Средний",
  LOW: "Низкий",
};

export const stateLabels: Record<TaskState, string> = {
  ON_TRACK: "По плану",
  ATTENTION: "Требует внимания",
  DUE_SOON: "Скоро срок",
  OVERDUE: "Просрочено",
  BLOCKED: "Заблокировано",
  DONE: "Выполнено",
};

export const projectStateLabels: Record<ProjectState, string> = {
  ON_TRACK: "По плану",
  ATTENTION: "Требует внимания",
  RISK: "Есть риск",
};

export const formatDate = (date: string | Date, includeYear = false) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    ...(includeYear ? { year: "numeric" } : {}),
  })
    .format(new Date(date))
    .replace(".", "");

export const formatLongDate = (date: string | Date) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
