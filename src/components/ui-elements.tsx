"use client";

import { CalendarDays, CheckCircle2, Clock3, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  priorityLabels,
  stateLabels,
  statusLabels,
} from "@/lib/locale";
import type {
  Person,
  TaskPriority,
  TaskState,
  TaskStatus,
} from "@/lib/types";

export function Avatar({
  person,
  size = "medium",
}: {
  person: Person;
  size?: "small" | "medium" | "large";
}) {
  return (
    <span
      className={cn("avatar", `avatar-${size}`)}
      style={{ background: person.color }}
      title={person.name}
      aria-label={person.name}
    >
      {person.initials}
    </span>
  );
}

export function AvatarStack({ people }: { people: Person[] }) {
  return (
    <span className="avatar-stack" aria-label="Участники проекта">
      {people.slice(0, 3).map((person) => (
        <Avatar key={person.id} person={person} size="small" />
      ))}
      {people.length > 3 && (
        <span className="avatar avatar-small avatar-more">
          +{people.length - 3}
        </span>
      )}
    </span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={cn("status-badge", `status-${status.toLowerCase()}`)}>
      <span className="status-dot" />
      {statusLabels[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={cn("priority-badge", `priority-${priority.toLowerCase()}`)}>
      <span className="priority-mark" />
      {priorityLabels[priority]}
    </span>
  );
}

const stateIcons: Record<TaskState, typeof Clock3> = {
  ON_TRACK: CheckCircle2,
  ATTENTION: ShieldAlert,
  DUE_SOON: Clock3,
  OVERDUE: CalendarDays,
  BLOCKED: ShieldAlert,
  DONE: CheckCircle2,
};

export function StateBadge({ state }: { state: TaskState }) {
  const Icon = stateIcons[state];
  return (
    <span className={cn("state-badge", `state-${state.toLowerCase()}`)}>
      <Icon size={13} strokeWidth={2} />
      {stateLabels[state]}
    </span>
  );
}

export function Progress({
  value,
  tone = "accent",
  compact = false,
}: {
  value: number;
  tone?: "accent" | "success" | "warning";
  compact?: boolean;
}) {
  return (
    <span className={cn("progress-wrap", compact && "progress-compact")}>
      <span className="progress-track">
        <span
          className={cn("progress-fill", `progress-${tone}`)}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </span>
      {!compact && <span className="progress-value">{value}%</span>}
    </span>
  );
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
