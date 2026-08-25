"use client";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  CircleGauge,
  Clock3,
  Flame,
  MoreHorizontal,
  Plus,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  activityItems,
  completionData,
  initialTasks,
  people,
  projects,
} from "@/lib/demo-data";
import { formatDate, projectStateLabels } from "@/lib/locale";
import type { Task, ViewId } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarStack,
  PriorityBadge,
  Progress,
  StateBadge,
} from "./ui-elements";

const kpis = [
  {
    label: "Активные задачи",
    value: "38",
    change: "+12%",
    direction: "up",
    icon: CircleGauge,
    tone: "blue",
    detail: "за неделю",
  },
  {
    label: "Выполнено",
    value: "24",
    change: "+8%",
    direction: "up",
    icon: CheckCircle2,
    tone: "green",
    detail: "за неделю",
  },
  {
    label: "Просрочено",
    value: "5",
    change: "−2",
    direction: "down",
    icon: AlertTriangle,
    tone: "red",
    detail: "с прошлой недели",
  },
  {
    label: "Критические",
    value: "3",
    change: "1 новая",
    direction: "neutral",
    icon: Flame,
    tone: "orange",
    detail: "требуют внимания",
  },
  {
    label: "Срок на этой неделе",
    value: "11",
    change: "4 сегодня",
    direction: "neutral",
    icon: CalendarClock,
    tone: "purple",
    detail: "ближайшие сроки",
  },
  {
    label: "Процент выполнения",
    value: "68%",
    change: "+6%",
    direction: "up",
    icon: TrendingUp,
    tone: "cyan",
    detail: "за месяц",
  },
];

interface OverviewProps {
  onOpenTask: (task: Task) => void;
  onNavigate: (view: ViewId) => void;
  onCreateTask: () => void;
}

export function OverviewView({
  onOpenTask,
  onNavigate,
  onCreateTask,
}: OverviewProps) {
  const attentionTasks = initialTasks.filter((task) =>
    ["OVERDUE", "BLOCKED", "DUE_SOON", "ATTENTION"].includes(task.state),
  );
  const upcomingTasks = initialTasks
    .filter((task) => task.dueDate && task.state !== "DONE")
    .slice(0, 4);

  return (
    <div className="page overview-page">
      <div className="page-intro overview-intro">
        <div>
          <span className="eyebrow">Вторник, 25 августа</span>
          <h1>Добрый день, Александр</h1>
          <p>Вот что происходит в вашей организации сегодня.</p>
        </div>
        <button className="primary-button page-create" onClick={onCreateTask}>
          <Plus size={17} />
          Создать задачу
        </button>
      </div>

      <section className="kpi-grid" aria-label="Ключевые показатели">
        {kpis.map((kpi, index) => (
          <motion.article
            className="kpi-card"
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.035 }}
          >
            <div className="kpi-top">
              <span className={cn("kpi-icon", `kpi-${kpi.tone}`)}>
                <kpi.icon size={18} />
              </span>
              <button className="quiet-icon" aria-label={`Действия: ${kpi.label}`}>
                <MoreHorizontal size={17} />
              </button>
            </div>
            <span className="kpi-label">{kpi.label}</span>
            <div className="kpi-value-row">
              <strong>{kpi.value}</strong>
              <span
                className={cn(
                  "kpi-change",
                  kpi.direction === "up" && "positive",
                  kpi.direction === "down" && "positive",
                )}
              >
                {kpi.direction === "up" && <ArrowUpRight size={13} />}
                {kpi.direction === "down" && <ArrowDownRight size={13} />}
                {kpi.change}
              </span>
            </div>
            <small>{kpi.detail}</small>
          </motion.article>
        ))}
      </section>

      <section className="dashboard-card attention-card">
        <div className="card-heading">
          <div>
            <span className="heading-icon heading-icon-warning">
              <AlertTriangle size={17} />
            </span>
            <div>
              <h2>Требуют внимания</h2>
              <p>Задачи с риском срыва или приближающимся сроком</p>
            </div>
          </div>
          <button className="text-button" onClick={() => onNavigate("tasks")}>
            Показать все <ArrowRight size={15} />
          </button>
        </div>
        <div className="attention-table" role="table" aria-label="Задачи, требующие внимания">
          <div className="attention-head" role="row">
            <span>Задача</span>
            <span>Ответственный</span>
            <span>Приоритет</span>
            <span>Состояние</span>
            <span>Срок</span>
            <span aria-hidden="true" />
          </div>
          {attentionTasks.slice(0, 5).map((task) => (
            <button
              key={task.id}
              className="attention-row"
              role="row"
              onClick={() => onOpenTask(task)}
            >
              <span className="attention-task">
                <span
                  className="project-color-line"
                  style={{ background: task.projectColor }}
                />
                <span>
                  <strong>{task.title}</strong>
                  <small>
                    {task.id} · {task.project}
                  </small>
                </span>
              </span>
              <span className="assignee-cell">
                <Avatar person={task.assignee} size="small" />
                <span>{task.assignee.name.split(" ")[0]}</span>
              </span>
              <PriorityBadge priority={task.priority} />
              <StateBadge state={task.state} />
              <span
                className={cn(
                  "due-cell",
                  task.state === "OVERDUE" && "due-overdue",
                )}
              >
                {task.dueDate ? formatDate(task.dueDate) : "Без срока"}
              </span>
              <span className="row-arrow">
                <ArrowRight size={15} />
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="dashboard-two-columns">
        <section className="dashboard-card projects-progress-card">
          <div className="card-heading compact-heading">
            <div>
              <div>
                <h2>Прогресс проектов</h2>
                <p>Активные направления работы</p>
              </div>
            </div>
            <button className="text-button" onClick={() => onNavigate("projects")}>
              Все проекты <ArrowRight size={15} />
            </button>
          </div>
          <div className="project-progress-list">
            {projects.slice(0, 4).map((project) => (
              <button
                className="project-progress-row"
                key={project.id}
                onClick={() => onNavigate("projects")}
              >
                <span
                  className="project-logo"
                  style={{ background: `${project.color}15`, color: project.color }}
                >
                  {project.name.charAt(0)}
                </span>
                <span className="project-progress-main">
                  <span className="project-title-line">
                    <strong>{project.name}</strong>
                    <span
                      className={cn(
                        "project-state",
                        `project-state-${project.state.toLowerCase()}`,
                      )}
                    >
                      {projectStateLabels[project.state]}
                    </span>
                  </span>
                  <span className="project-progress-meta">
                    <Progress
                      value={project.progress}
                      compact
                      tone={project.state === "RISK" ? "warning" : "accent"}
                    />
                    <b>{project.progress}%</b>
                  </span>
                  <span className="project-detail-line">
                    <span>{project.tasks} задач</span>
                    <AvatarStack people={project.members} />
                    <span>до {formatDate(project.dueDate)}</span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="dashboard-card upcoming-card">
          <div className="card-heading compact-heading">
            <div>
              <div>
                <h2>Ближайшие сроки</h2>
                <p>Что важно завершить в первую очередь</p>
              </div>
            </div>
            <button className="text-button" onClick={() => onNavigate("calendar")}>
              Календарь <ArrowRight size={15} />
            </button>
          </div>
          <div className="upcoming-list">
            {upcomingTasks.map((task, index) => (
              <button
                className="upcoming-row"
                key={task.id}
                onClick={() => onOpenTask(task)}
              >
                <span
                  className={cn(
                    "date-tile",
                    index === 0 && "date-tile-urgent",
                  )}
                >
                  <strong>
                    {task.dueDate ? new Date(task.dueDate).getDate() : "—"}
                  </strong>
                  <small>авг</small>
                </span>
                <span className="upcoming-copy">
                  <strong>{task.title}</strong>
                  <small>{task.project}</small>
                </span>
                <Avatar person={task.assignee} size="small" />
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="dashboard-chart-grid">
        <section className="dashboard-card chart-card">
          <div className="card-heading compact-heading">
            <div>
              <div>
                <h2>Динамика выполнения</h2>
                <p>Создано и выполнено задач за 7 дней</p>
              </div>
            </div>
            <div className="chart-legend">
              <span><i className="legend-completed" /> Выполнено</span>
              <span><i className="legend-created" /> Создано</span>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={completionData} margin={{ top: 10, right: 4, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#315ae8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#315ae8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    border: "1px solid var(--line)",
                    borderRadius: 10,
                    background: "var(--surface)",
                    boxShadow: "var(--shadow-md)",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--text)", fontWeight: 600 }}
                  formatter={(value, name) => [
                    value,
                    name === "completed" ? "Выполнено" : "Создано",
                  ]}
                />
                <Area type="monotone" dataKey="created" stroke="#a5b4d4" fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
                <Area type="monotone" dataKey="completed" stroke="#315ae8" fill="url(#completedGradient)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="dashboard-card workload-card">
          <div className="card-heading compact-heading">
            <div>
              <div>
                <h2>Загрузка команды</h2>
                <p>Распределение активной работы</p>
              </div>
            </div>
            <button className="text-button" onClick={() => onNavigate("team")}>
              Команда <ArrowRight size={15} />
            </button>
          </div>
          <div className="workload-list">
            {people.slice(1, 6).map((person) => (
              <button key={person.id} onClick={() => onNavigate("team")}>
                <Avatar person={person} size="small" />
                <span className="workload-copy">
                  <span>
                    <strong>{person.name}</strong>
                    <small>{person.activeTasks} задач</small>
                  </span>
                  <span className="workload-progress">
                    <Progress
                      compact
                      value={person.workload}
                      tone={person.workload > 88 ? "warning" : "accent"}
                    />
                    <b>{person.workload}%</b>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="dashboard-card activity-preview">
        <div className="card-heading compact-heading">
          <div>
            <div>
              <h2>Последняя активность</h2>
              <p>Изменения в рабочем пространстве</p>
            </div>
          </div>
          <button className="text-button" onClick={() => onNavigate("activity")}>
            Вся активность <ArrowRight size={15} />
          </button>
        </div>
        <div className="activity-preview-grid">
          {activityItems.slice(0, 4).map((item) => (
            <div key={item.id} className="activity-preview-item">
              <Avatar person={item.person} size="small" />
              <span>
                <p>
                  <strong>{item.person.name.split(" ")[0]}</strong> {item.text}{" "}
                  <b>«{item.target}»</b>
                </p>
                <small><Clock3 size={12} /> {item.time}</small>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
