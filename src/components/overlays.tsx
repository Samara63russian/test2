"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Command,
  FolderKanban,
  Link2,
  Paperclip,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { people, projects } from "@/lib/demo-data";
import {
  formatLongDate,
  priorityLabels,
  statusLabels,
} from "@/lib/locale";
import type { Task, TaskStatus, ViewId } from "@/lib/types";
import {
  Avatar,
  PriorityBadge,
  Progress,
  StateBadge,
  StatusBadge,
} from "./ui-elements";

const taskSchema = z
  .object({
    title: z.string().min(2, "Введите название задачи"),
    description: z.string().optional(),
    project: z.string(),
    assignee: z.string(),
    status: z.enum([
      "BACKLOG",
      "TODO",
      "IN_PROGRESS",
      "REVIEW",
      "BLOCKED",
      "DONE",
    ]),
    priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
    startDate: z.string().optional(),
    dueDate: z.string().optional(),
    category: z.string().optional(),
    nextStep: z.string().optional(),
  })
  .refine(
    (data) =>
      !data.startDate ||
      !data.dueDate ||
      new Date(data.dueDate) >= new Date(data.startDate),
    {
      message: "Дедлайн не может быть раньше даты начала",
      path: ["dueDate"],
    },
  );

type TaskForm = z.infer<typeof taskSchema>;

export function CreateTaskDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (values: TaskForm) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      project: projects[0].name,
      assignee: people[1].id,
      status: "TODO",
      priority: "MEDIUM",
      startDate: "2026-08-25",
      dueDate: "",
      category: "",
      nextStep: "",
    },
  });

  const submit = (values: TaskForm) => {
    onCreate(values);
    reset();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            className="modal task-modal"
            initial={{ opacity: 0, y: 16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.985 }}
            transition={{ duration: 0.18 }}
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-task-title"
          >
            <header className="modal-header">
              <div>
                <span className="modal-icon"><Plus size={19} /></span>
                <div>
                  <h2 id="create-task-title">Создать задачу</h2>
                  <p>Добавьте работу и назначьте ответственного</p>
                </div>
              </div>
              <button className="icon-button" onClick={onClose} aria-label="Закрыть">
                <X size={18} />
              </button>
            </header>
            <form onSubmit={handleSubmit(submit)}>
              <div className="modal-body">
                <label className="form-field title-field">
                  <span>Название задачи <b>*</b></span>
                  <input
                    autoFocus
                    placeholder="Например: Подготовить презентацию для клиента"
                    {...register("title")}
                  />
                  {errors.title && <small className="field-error">{errors.title.message}</small>}
                </label>
                <label className="form-field">
                  <span>Описание</span>
                  <textarea
                    rows={3}
                    placeholder="Добавьте детали, контекст и ожидаемый результат..."
                    {...register("description")}
                  />
                </label>
                <div className="form-grid">
                  <label className="form-field">
                    <span>Проект</span>
                    <span className="select-wrap">
                      <select {...register("project")}>
                        {projects.map((project) => (
                          <option key={project.id}>{project.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} />
                    </span>
                  </label>
                  <label className="form-field">
                    <span>Ответственный</span>
                    <span className="select-wrap">
                      <select {...register("assignee")}>
                        {people.map((person) => (
                          <option key={person.id} value={person.id}>{person.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} />
                    </span>
                  </label>
                  <label className="form-field">
                    <span>Статус</span>
                    <span className="select-wrap">
                      <select {...register("status")}>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} />
                    </span>
                  </label>
                  <label className="form-field">
                    <span>Приоритет</span>
                    <span className="select-wrap">
                      <select {...register("priority")}>
                        {Object.entries(priorityLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} />
                    </span>
                  </label>
                  <label className="form-field">
                    <span>Дата начала</span>
                    <input type="date" {...register("startDate")} />
                  </label>
                  <label className="form-field">
                    <span>Дедлайн</span>
                    <input type="date" {...register("dueDate")} />
                    {errors.dueDate && <small className="field-error">{errors.dueDate.message}</small>}
                  </label>
                  <label className="form-field">
                    <span>Категория</span>
                    <input placeholder="Например: Дизайн" {...register("category")} />
                  </label>
                  <label className="form-field">
                    <span>Следующий шаг</span>
                    <input placeholder="Что нужно сделать дальше?" {...register("nextStep")} />
                  </label>
                </div>
                <button className="add-dependency" type="button">
                  <Link2 size={15} /> Добавить зависимость
                </button>
              </div>
              <footer className="modal-footer">
                <span><kbd>⌘</kbd><kbd>↵</kbd> для создания</span>
                <div>
                  <button type="button" className="secondary-button" onClick={onClose}>Отмена</button>
                  <button type="submit" className="primary-button" disabled={isSubmitting}>
                    <Plus size={16} /> Создать задачу
                  </button>
                </div>
              </footer>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function TaskDetailSheet({
  task,
  onClose,
  onStatusChange,
}: {
  task: Task | null;
  onClose: () => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}) {
  const [comment, setComment] = useState("");

  return (
    <AnimatePresence>
      {task && (
        <>
          <motion.button
            className="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Закрыть карточку задачи"
          />
          <motion.aside
            className="task-sheet"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            aria-label={`Задача: ${task.title}`}
          >
            <header className="sheet-header">
              <span className="sheet-breadcrumb">
                <i style={{ background: task.projectColor }} />
                {task.project} <span>/</span> {task.id}
              </span>
              <div>
                <button className="icon-button" aria-label="Удалить задачу"><Trash2 size={17} /></button>
                <button className="icon-button" onClick={onClose} aria-label="Закрыть"><X size={19} /></button>
              </div>
            </header>
            <div className="sheet-content">
              <div className="sheet-title-row">
                <button className="task-complete" aria-label="Отметить выполненной"><Check size={16} /></button>
                <h2>{task.title}</h2>
              </div>
              <p className="sheet-description">{task.description || "Описание пока не добавлено."}</p>

              <div className="sheet-properties">
                <div>
                  <span>Статус</span>
                  <select
                    value={task.status}
                    onChange={(event) => onStatusChange(task.id, event.target.value as TaskStatus)}
                  >
                    {Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                  </select>
                </div>
                <div><span>Ответственный</span><b><Avatar person={task.assignee} size="small" /> {task.assignee.name}</b></div>
                <div><span>Приоритет</span><PriorityBadge priority={task.priority} /></div>
                <div><span>Состояние</span><StateBadge state={task.state} /></div>
                <div><span>Дата начала</span><b><CalendarDays size={14} /> {formatLongDate(task.startDate)}</b></div>
                <div><span>Дедлайн</span><b className={task.state === "OVERDUE" ? "due-overdue" : ""}><CalendarDays size={14} /> {task.dueDate ? formatLongDate(task.dueDate) : "Без срока"}</b></div>
              </div>

              <div className="sheet-section">
                <div className="sheet-section-title"><h3>Прогресс</h3><strong>{task.progress}%</strong></div>
                <Progress value={task.progress} compact />
              </div>
              <div className="sheet-section">
                <div className="sheet-section-title"><h3>Следующий шаг</h3></div>
                <div className="next-step-box"><Sparkles size={16} /><span>{task.nextStep || "Не указан"}</span></div>
              </div>
              <div className="sheet-section">
                <div className="sheet-section-title">
                  <h3>Комментарии <span>{task.comments}</span></h3>
                  <button><Paperclip size={14} /> Прикрепить</button>
                </div>
                <div className="comment">
                  <Avatar person={people[1]} size="small" />
                  <div>
                    <span><strong>Мария Соколова</strong><time>сегодня, 13:42</time></span>
                    <p>Пожалуйста, проверьте последние изменения. После согласования сможем передать задачу дальше.</p>
                  </div>
                </div>
                <div className="comment-input">
                  <Avatar person={people[0]} size="small" />
                  <div>
                    <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Добавить комментарий..." rows={2} />
                    <button aria-label="Отправить комментарий" disabled={!comment.trim()} onClick={() => setComment("")}><Send size={15} /></button>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

const quickActions: { label: string; view?: ViewId }[] = [
  { label: "Создать задачу" },
  { label: "Открыть мои задачи", view: "my-tasks" },
  { label: "Показать просроченные", view: "tasks" },
  { label: "Открыть аналитику", view: "analytics" },
];

export function CommandPalette({
  open,
  tasks,
  onClose,
  onOpenTask,
  onNavigate,
  onCreateTask,
}: {
  open: boolean;
  tasks: Task[];
  onClose: () => void;
  onOpenTask: (task: Task) => void;
  onNavigate: (view: ViewId) => void;
  onCreateTask: () => void;
}) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const value = query.toLocaleLowerCase("ru-RU");
    return tasks.filter((task) => !value || task.title.toLocaleLowerCase("ru-RU").includes(value) || task.project.toLocaleLowerCase("ru-RU").includes(value)).slice(0, 5);
  }, [query, tasks]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="command-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div className="command-palette" initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} onMouseDown={(event) => event.stopPropagation()}>
            <label className="command-search">
              <Search size={19} />
              <input autoFocus placeholder="Найти задачу, проект или сотрудника..." value={query} onChange={(event) => setQuery(event.target.value)} />
              <kbd>Esc</kbd>
            </label>
            <div className="command-results">
              {query ? (
                <section>
                  <h3>Задачи</h3>
                  {results.map((task) => (
                    <button key={task.id} onClick={() => { onOpenTask(task); onClose(); }}>
                      <span className="command-icon" style={{ color: task.projectColor, background: `${task.projectColor}14` }}><Check size={15} /></span>
                      <span><strong>{task.title}</strong><small>{task.project} · {task.id}</small></span>
                      <ArrowRight size={14} />
                    </button>
                  ))}
                  {results.length === 0 && <div className="command-empty"><Search size={21} /><strong>Ничего не найдено</strong><small>Попробуйте изменить запрос.</small></div>}
                </section>
              ) : (
                <>
                  <section>
                    <h3>Быстрые действия</h3>
                    {quickActions.map((action, index) => (
                      <button key={action.label} onClick={() => { if (index === 0) onCreateTask(); else if (action.view) onNavigate(action.view); onClose(); }}>
                        <span className="command-icon">{index === 0 ? <Plus size={15} /> : index === 1 ? <UserRound size={15} /> : index === 2 ? <CalendarDays size={15} /> : <Sparkles size={15} />}</span>
                        <span><strong>{action.label}</strong></span>
                        <ArrowRight size={14} />
                      </button>
                    ))}
                  </section>
                  <section>
                    <h3>Недавние задачи</h3>
                    {tasks.slice(0, 3).map((task) => (
                      <button key={task.id} onClick={() => { onOpenTask(task); onClose(); }}>
                        <span className="command-icon" style={{ color: task.projectColor }}><FolderKanban size={15} /></span>
                        <span><strong>{task.title}</strong><small>{task.project}</small></span>
                        <StatusBadge status={task.status} />
                      </button>
                    ))}
                  </section>
                </>
              )}
            </div>
            <footer className="command-footer"><span><kbd>↑</kbd><kbd>↓</kbd> перемещение</span><span><kbd>↵</kbd> открыть</span><span><Command size={12} /> K поиск</span></footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CreateProjectDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
        <motion.div className="modal project-modal" initial={{ opacity: 0, scale: 0.98, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} onMouseDown={(event) => event.stopPropagation()}>
          <header className="modal-header"><div><span className="modal-icon"><FolderKanban size={19} /></span><div><h2>Создать проект</h2><p>Соберите задачи и команду вокруг общей цели</p></div></div><button className="icon-button" onClick={onClose}><X size={18} /></button></header>
          <div className="modal-body">
            <label className="form-field"><span>Название проекта <b>*</b></span><input autoFocus placeholder="Например: Запуск нового продукта" /></label>
            <label className="form-field"><span>Описание</span><textarea rows={3} placeholder="Цель и ожидаемый результат проекта..." /></label>
            <div className="form-grid"><label className="form-field"><span>Руководитель</span><select><option>Мария Соколова</option></select></label><label className="form-field"><span>Дедлайн</span><input type="date" /></label></div>
          </div>
          <footer className="modal-footer"><span /><div><button className="secondary-button" onClick={onClose}>Отмена</button><button className="primary-button" onClick={onClose}><Plus size={16} /> Создать проект</button></div></footer>
        </motion.div>
      </motion.div>}
    </AnimatePresence>
  );
}
