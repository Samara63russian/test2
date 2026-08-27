export type TaskStatus =
  | "BACKLOG"
  | "TODO"
  | "IN_PROGRESS"
  | "REVIEW"
  | "BLOCKED"
  | "DONE";

export type TaskPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type TaskState =
  | "ON_TRACK"
  | "ATTENTION"
  | "DUE_SOON"
  | "OVERDUE"
  | "BLOCKED"
  | "DONE";

export type ProjectState = "ON_TRACK" | "ATTENTION" | "RISK";

export interface Person {
  id: string;
  name: string;
  initials: string;
  position: string;
  color: string;
  role?: "OWNER" | "ADMIN" | "MANAGER" | "MEMBER";
  activeTasks: number;
  overdueTasks: number;
  completedMonth: number;
  workload: number;
}

export interface Task {
  id: string;
  title: string;
  project: string;
  projectColor: string;
  assignee: Person;
  status: TaskStatus;
  priority: TaskPriority;
  state: TaskState;
  progress: number;
  startDate: string;
  dueDate: string | null;
  updatedAt: string;
  category: string;
  comments: number;
  hasDependency?: boolean;
  description?: string;
  nextStep?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  owner: Person;
  members: Person[];
  progress: number;
  tasks: number;
  overdue: number;
  dueDate: string;
  state: ProjectState;
}

export type ViewId =
  | "overview"
  | "my-tasks"
  | "tasks"
  | "projects"
  | "team"
  | "calendar"
  | "analytics"
  | "activity"
  | "favorites"
  | "settings"
  | "help";
