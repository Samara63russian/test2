import { getDb } from "./db";
import type { Person, Project, Task, TaskState } from "./types";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase("ru-RU"))
    .join("");
}

function colorFromId(id: string) {
  const colors = ["#315ae8", "#8b5cf6", "#0f9f82", "#e4663a", "#cc8b14", "#3276a8"];
  const code = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[code % colors.length];
}

function taskState(
  status: Task["status"],
  dueDate: Date | null,
  progress: number,
): TaskState {
  if (status === "DONE") return "DONE";
  if (status === "BLOCKED") return "BLOCKED";
  if (dueDate) {
    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    if (dueDate < endOfToday) return "OVERDUE";
    if (dueDate.getTime() - now.getTime() <= 2 * 24 * 60 * 60 * 1000) {
      return "DUE_SOON";
    }
  }
  if (progress < 25 && status === "IN_PROGRESS") return "ATTENTION";
  return "ON_TRACK";
}

export interface WorkspaceData {
  organizationName: string;
  currentDateLabel: string;
  currentUser: Person;
  people: Person[];
  projects: Project[];
  tasks: Task[];
}

export async function loadWorkspaceData(
  organizationId: string,
  userId: string,
): Promise<WorkspaceData> {
  const db = getDb();
  const [organization, users, dbProjects, dbTasks] = await Promise.all([
    db.organization.findUniqueOrThrow({
      where: { id: organizationId },
      select: { name: true },
    }),
    db.user.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        position: true,
        role: true,
      },
    }),
    db.project.findMany({
      where: { organizationId },
      orderBy: { updatedAt: "desc" },
      include: {
        owner: {
          select: { id: true, name: true, position: true, role: true },
        },
        _count: { select: { tasks: true } },
      },
    }),
    db.task.findMany({
      where: { organizationId },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      include: {
        project: { select: { id: true, name: true, color: true } },
        assignee: {
          select: { id: true, name: true, position: true, role: true },
        },
        _count: { select: { comments: true, dependencies: true } },
      },
    }),
  ]);

  const statsByUser = new Map<
    string,
    { active: number; overdue: number; completed: number }
  >();
  for (const task of dbTasks) {
    if (!task.assigneeId) continue;
    const stats = statsByUser.get(task.assigneeId) ?? {
      active: 0,
      overdue: 0,
      completed: 0,
    };
    if (task.status === "DONE") stats.completed += 1;
    else stats.active += 1;
    if (
      task.status !== "DONE" &&
      task.dueDate &&
      task.dueDate.getTime() < Date.now()
    ) {
      stats.overdue += 1;
    }
    statsByUser.set(task.assigneeId, stats);
  }

  const people = users.map<Person>((user) => {
    const stats = statsByUser.get(user.id) ?? {
      active: 0,
      overdue: 0,
      completed: 0,
    };
    return {
      id: user.id,
      name: user.name,
      initials: initials(user.name),
      position:
        user.position ??
        (user.role === "OWNER" ? "Владелец организации" : "Сотрудник"),
      color: colorFromId(user.id),
      activeTasks: stats.active,
      overdueTasks: stats.overdue,
      completedMonth: stats.completed,
      workload: Math.min(100, stats.active * 12),
    };
  });
  const personById = new Map(people.map((person) => [person.id, person]));
  const unassigned: Person = {
    id: "unassigned",
    name: "Не назначен",
    initials: "—",
    position: "Ответственный не выбран",
    color: "#7a8699",
    activeTasks: 0,
    overdueTasks: 0,
    completedMonth: 0,
    workload: 0,
  };

  const tasks = dbTasks.map<Task>((task) => ({
    id: task.id,
    title: task.title,
    description: task.description ?? undefined,
    project: task.project?.name ?? "Без проекта",
    projectColor: task.project?.color ?? "#7a8699",
    assignee:
      (task.assigneeId && personById.get(task.assigneeId)) || unassigned,
    status: task.status,
    priority: task.priority,
    state: taskState(task.status, task.dueDate, task.progress),
    progress: task.progress,
    startDate: (task.startDate ?? task.createdAt).toISOString(),
    dueDate: task.dueDate?.toISOString() ?? null,
    updatedAt: new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "short",
    }).format(task.updatedAt),
    category: task.category ?? "Без категории",
    comments: task._count.comments,
    hasDependency: task._count.dependencies > 0,
    nextStep: task.nextStep ?? undefined,
  }));

  const projects = dbProjects.map<Project>((project) => {
    const projectTasks = dbTasks.filter((task) => task.projectId === project.id);
    const overdue = projectTasks.filter(
      (task) =>
        task.status !== "DONE" &&
        task.dueDate &&
        task.dueDate.getTime() < Date.now(),
    ).length;
    const owner = personById.get(project.ownerId) ?? unassigned;
    return {
      id: project.id,
      name: project.name,
      description: project.description ?? "Описание пока не добавлено",
      color: project.color,
      owner,
      members: [owner],
      progress: project.progress,
      tasks: project._count.tasks,
      overdue,
      dueDate:
        project.dueDate?.toISOString() ??
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      state: overdue > 0 ? "ATTENTION" : "ON_TRACK",
    };
  });

  const currentUser = personById.get(userId);
  if (!currentUser) throw new Error("Пользователь не найден");

  return {
    organizationName: organization.name,
    currentDateLabel: new Intl.DateTimeFormat("ru-RU", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date()),
    currentUser,
    people,
    projects,
    tasks,
  };
}
