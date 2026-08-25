"use client";

import {
  CalendarDays,
  Check,
  ChevronDown,
  Columns3,
  Download,
  Filter,
  GripVertical,
  LayoutGrid,
  List,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import { formatDate, statusLabels } from "@/lib/locale";
import type { Task, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Avatar,
  PriorityBadge,
  Progress,
  StateBadge,
  StatusBadge,
} from "./ui-elements";

type TaskPresentation = "table" | "board" | "calendar";

const quickFilters = [
  "Просроченные",
  "На сегодня",
  "На этой неделе",
  "Критические",
  "Заблокированные",
  "Назначенные мне",
];

interface TasksViewProps {
  tasks: Task[];
  mode?: "all" | "mine";
  onOpenTask: (task: Task) => void;
  onCreateTask: () => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

export function TasksView({
  tasks,
  mode = "all",
  onOpenTask,
  onCreateTask,
  onStatusChange,
}: TasksViewProps) {
  const [presentation, setPresentation] = useState<TaskPresentation>("table");
  const [query, setQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");

  const shownTasks = useMemo(() => {
    let result =
      mode === "mine"
        ? tasks.filter((task) => task.assignee.id === "user-alexander")
        : tasks;
    const normalized = query.toLocaleLowerCase("ru-RU");
    if (normalized) {
      result = result.filter(
        (task) =>
          task.title.toLocaleLowerCase("ru-RU").includes(normalized) ||
          task.project.toLocaleLowerCase("ru-RU").includes(normalized) ||
          task.assignee.name.toLocaleLowerCase("ru-RU").includes(normalized),
      );
    }
    if (statusFilter !== "ALL") {
      result = result.filter((task) => task.status === statusFilter);
    }
    if (quickFilter === "Просроченные") {
      result = result.filter((task) => task.state === "OVERDUE");
    }
    if (quickFilter === "Критические") {
      result = result.filter((task) => task.priority === "CRITICAL");
    }
    if (quickFilter === "Заблокированные") {
      result = result.filter((task) => task.status === "BLOCKED");
    }
    if (quickFilter === "Назначенные мне") {
      result = result.filter((task) => task.assignee.id === "user-alexander");
    }
    return result;
  }, [mode, query, quickFilter, statusFilter, tasks]);

  const toggleSelected = (id: string) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  return (
    <div className="page tasks-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">
            {mode === "mine" ? "Личное пространство" : "Рабочее пространство"}
          </span>
          <h1>{mode === "mine" ? "Мои задачи" : "Все задачи"}</h1>
          <p>
            {mode === "mine"
              ? "Сосредоточьтесь на том, что важно сделать сегодня."
              : "Управляйте работой организации в едином пространстве."}
          </p>
        </div>
        <button className="primary-button" onClick={onCreateTask}>
          <Plus size={17} /> Создать задачу
        </button>
      </div>

      {mode === "mine" && <MyTaskSummary tasks={shownTasks} />}

      <section className="task-workspace">
        <div className="task-toolbar">
          <div className="view-switcher" aria-label="Режим отображения">
            <button
              className={presentation === "table" ? "active" : ""}
              onClick={() => setPresentation("table")}
            >
              <List size={15} /> Таблица
            </button>
            <button
              className={presentation === "board" ? "active" : ""}
              onClick={() => setPresentation("board")}
            >
              <Columns3 size={15} /> Доска
            </button>
            <button
              className={presentation === "calendar" ? "active" : ""}
              onClick={() => setPresentation("calendar")}
            >
              <CalendarDays size={15} /> Календарь
            </button>
          </div>
          <div className="task-toolbar-actions">
            <label className="inline-search">
              <Search size={15} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Поиск задач..."
                aria-label="Поиск задач"
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="Очистить поиск">
                  <X size={14} />
                </button>
              )}
            </label>
            <button className="secondary-button">
              <Filter size={15} /> Фильтры
            </button>
            <button className="icon-button bordered" aria-label="Настроить колонки">
              <SlidersHorizontal size={17} />
            </button>
            <button className="icon-button bordered" aria-label="Выгрузить задачи">
              <Download size={17} />
            </button>
          </div>
        </div>

        <div className="filters-row">
          <label className="select-filter">
            <span>Статус:</span>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as TaskStatus | "ALL")
              }
            >
              <option value="ALL">Все</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown size={13} />
          </label>
          {quickFilters.map((filter) => (
            <button
              key={filter}
              className={cn("quick-filter", quickFilter === filter && "active")}
              onClick={() =>
                setQuickFilter((current) => (current === filter ? null : filter))
              }
            >
              {quickFilter === filter && <Check size={12} />}
              {filter}
            </button>
          ))}
          {(quickFilter || statusFilter !== "ALL") && (
            <button
              className="reset-filter"
              onClick={() => {
                setQuickFilter(null);
                setStatusFilter("ALL");
              }}
            >
              Сбросить фильтры
            </button>
          )}
        </div>

        <div className="task-results-info">
          <span>
            Найдено: <strong>{shownTasks.length}</strong>
          </span>
          <span>Обновлено несколько секунд назад</span>
        </div>

        {presentation === "table" && (
          <TaskTable
            tasks={shownTasks}
            selected={selected}
            onSelect={toggleSelected}
            onOpen={onOpenTask}
          />
        )}
        {presentation === "board" && (
          <TaskBoard
            tasks={shownTasks}
            onOpen={onOpenTask}
            onStatusChange={onStatusChange}
          />
        )}
        {presentation === "calendar" && (
          <TaskCalendar tasks={shownTasks} onOpen={onOpenTask} />
        )}
      </section>

      {selected.length > 0 && (
        <div className="bulk-toolbar">
          <span>Выбрано: {selected.length}</span>
          <button>Изменить статус</button>
          <button>Назначить</button>
          <button>Изменить приоритет</button>
          <button className="danger-text">Удалить</button>
          <button
            className="bulk-close"
            onClick={() => setSelected([])}
            aria-label="Снять выделение"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function MyTaskSummary({ tasks }: { tasks: Task[] }) {
  const items = [
    {
      label: "Просрочено",
      value: tasks.filter((task) => task.state === "OVERDUE").length,
      tone: "red",
    },
    {
      label: "На сегодня",
      value: tasks.filter((task) => task.dueDate === "2026-08-25").length,
      tone: "orange",
    },
    {
      label: "В работе",
      value: tasks.filter((task) => task.status === "IN_PROGRESS").length,
      tone: "blue",
    },
    {
      label: "Выполнено за неделю",
      value: 6,
      tone: "green",
    },
  ];
  return (
    <div className="my-task-summary">
      {items.map((item) => (
        <div key={item.label}>
          <span className={`summary-dot dot-${item.tone}`} />
          <span>
            <strong>{item.value}</strong>
            <small>{item.label}</small>
          </span>
        </div>
      ))}
    </div>
  );
}

function TaskTable({
  tasks,
  selected,
  onSelect,
  onOpen,
}: {
  tasks: Task[];
  selected: string[];
  onSelect: (id: string) => void;
  onOpen: (task: Task) => void;
}) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th className="checkbox-column">
              <span className="fake-checkbox" aria-hidden="true" />
            </th>
            <th>Задача</th>
            <th>Проект</th>
            <th>Ответственный</th>
            <th>Статус</th>
            <th>Приоритет</th>
            <th>Состояние</th>
            <th>Прогресс</th>
            <th>Дедлайн</th>
            <th aria-label="Действия" />
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className={selected.includes(task.id) ? "row-selected" : ""}
            >
              <td>
                <button
                  className={cn(
                    "fake-checkbox",
                    selected.includes(task.id) && "checked",
                  )}
                  onClick={() => onSelect(task.id)}
                  aria-label={
                    selected.includes(task.id)
                      ? `Снять выбор: ${task.title}`
                      : `Выбрать: ${task.title}`
                  }
                >
                  {selected.includes(task.id) && <Check size={12} />}
                </button>
              </td>
              <td>
                <button className="task-name-cell" onClick={() => onOpen(task)}>
                  <strong>{task.title}</strong>
                  <small>{task.id} · {task.category}</small>
                </button>
              </td>
              <td>
                <span className="project-cell">
                  <i style={{ background: task.projectColor }} />
                  {task.project}
                </span>
              </td>
              <td>
                <span className="table-assignee">
                  <Avatar person={task.assignee} size="small" />
                  {task.assignee.name.split(" ")[0]}
                </span>
              </td>
              <td><StatusBadge status={task.status} /></td>
              <td><PriorityBadge priority={task.priority} /></td>
              <td><StateBadge state={task.state} /></td>
              <td><Progress value={task.progress} /></td>
              <td>
                <span className={task.state === "OVERDUE" ? "due-overdue" : ""}>
                  {task.dueDate ? formatDate(task.dueDate) : "Без срока"}
                </span>
              </td>
              <td>
                <button className="quiet-icon" aria-label={`Действия: ${task.title}`}>
                  <MoreHorizontal size={17} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {tasks.length === 0 && (
        <div className="empty-state">
          <Search size={26} />
          <h3>Ничего не найдено</h3>
          <p>Попробуйте изменить запрос или сбросить фильтры.</p>
        </div>
      )}
      {tasks.length > 0 && (
        <div className="table-footer">
          <span>Показано {tasks.length} из {tasks.length}</span>
          <div>
            <button disabled>Назад</button>
            <button className="page-current">1</button>
            <button>Далее</button>
          </div>
        </div>
      )}
    </div>
  );
}

const boardColumns: { status: TaskStatus; label: string; color: string }[] = [
  { status: "BACKLOG", label: "Бэклог", color: "#94a3b8" },
  { status: "TODO", label: "К выполнению", color: "#7c8aa5" },
  { status: "IN_PROGRESS", label: "В работе", color: "#315ae8" },
  { status: "REVIEW", label: "На проверке", color: "#8b5cf6" },
  { status: "BLOCKED", label: "Заблокировано", color: "#e5484d" },
  { status: "DONE", label: "Выполнено", color: "#10a37f" },
];

function TaskBoard({
  tasks,
  onOpen,
  onStatusChange,
}: {
  tasks: Task[];
  onOpen: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over) onStatusChange(String(active.id), over.id as TaskStatus);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="kanban-board">
        {boardColumns.map((column) => (
          <BoardColumn
            key={column.status}
            {...column}
            tasks={tasks.filter((task) => task.status === column.status)}
            onOpen={onOpen}
          />
        ))}
      </div>
    </DndContext>
  );
}

function BoardColumn({
  status,
  label,
  color,
  tasks,
  onOpen,
}: {
  status: TaskStatus;
  label: string;
  color: string;
  tasks: Task[];
  onOpen: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <section
      ref={setNodeRef}
      className={cn("kanban-column", isOver && "kanban-column-over")}
    >
      <header>
        <span><i style={{ background: color }} /> {label}</span>
        <b>{tasks.length}</b>
        <button aria-label={`Добавить в «${label}»`}><Plus size={15} /></button>
      </header>
      <div className="kanban-list">
        {tasks.map((task) => (
          <BoardCard key={task.id} task={task} onOpen={onOpen} />
        ))}
        {tasks.length === 0 && <div className="kanban-empty">Перетащите задачу сюда</div>}
      </div>
    </section>
  );
}

function BoardCard({ task, onOpen }: { task: Task; onOpen: (task: Task) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.id });
  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn("kanban-card", isDragging && "kanban-dragging")}
    >
      <button
        className="drag-handle"
        aria-label={`Переместить: ${task.title}`}
        {...listeners}
        {...attributes}
      >
        <GripVertical size={15} />
      </button>
      <button className="kanban-card-content" onClick={() => onOpen(task)}>
        <span className="kanban-project">
          <i style={{ background: task.projectColor }} /> {task.project}
        </span>
        <strong>{task.title}</strong>
        <Progress value={task.progress} />
        <span className="kanban-meta">
          <Avatar person={task.assignee} size="small" />
          <span className={task.state === "OVERDUE" ? "due-overdue" : ""}>
            <CalendarDays size={13} />
            {task.dueDate ? formatDate(task.dueDate) : "Без срока"}
          </span>
          <span><MessageSquare size={13} /> {task.comments}</span>
        </span>
      </button>
    </article>
  );
}

function TaskCalendar({
  tasks,
  onOpen,
}: {
  tasks: Task[];
  onOpen: (task: Task) => void;
}) {
  const days = Array.from({ length: 35 }, (_, index) => {
    const day = index - 1;
    return day <= 0 ? 31 + day : day;
  });
  return (
    <div className="mini-task-calendar">
      <div className="calendar-weekdays">
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="calendar-days-grid">
        {days.map((day, index) => {
          const dayTasks = tasks.filter(
            (task) => task.dueDate && new Date(task.dueDate).getDate() === day,
          );
          const muted = index < 2;
          return (
            <div key={`${day}-${index}`} className={cn(muted && "outside-month")}>
              <span className={day === 25 && !muted ? "today-number" : ""}>{day}</span>
              {dayTasks.slice(0, 3).map((task) => (
                <button
                  key={task.id}
                  style={{ borderLeftColor: task.projectColor }}
                  onClick={() => onOpen(task)}
                >
                  {task.title}
                </button>
              ))}
              {dayTasks.length > 3 && <small>ещё {dayTasks.length - 3}</small>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
