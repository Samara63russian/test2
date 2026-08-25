"use client";

import {
  Activity,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  ExternalLink,
  Filter,
  Globe2,
  Link2,
  Lock,
  Mail,
  MoreHorizontal,
  Palette,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  activityItems,
  completionData,
  people,
  priorityData,
  projects,
} from "@/lib/demo-data";
import { formatDate, projectStateLabels } from "@/lib/locale";
import type { Task, ViewId } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarStack,
  Progress,
  SectionHeading,
  StateBadge,
} from "./ui-elements";

export function ProjectsView({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Портфель организации</span>
          <h1>Проекты</h1>
          <p>Следите за прогрессом, сроками и состоянием ключевых инициатив.</p>
        </div>
        <button className="primary-button" onClick={onCreate}>
          <Plus size={17} /> Создать проект
        </button>
      </div>

      <div className="portfolio-summary">
        <div><span>Активные проекты</span><strong>5</strong><small>в работе</small></div>
        <div><span>Общий прогресс</span><strong>56%</strong><small>+4% за месяц</small></div>
        <div><span>Задач открыто</span><strong>73</strong><small>из 111 задач</small></div>
        <div><span>Требуют внимания</span><strong className="text-warning">2</strong><small>есть риск</small></div>
      </div>

      <div className="content-toolbar">
        <label className="inline-search wide-search">
          <Search size={15} />
          <input placeholder="Найти проект..." aria-label="Найти проект" />
        </label>
        <button className="secondary-button"><Filter size={15} /> Все состояния <ChevronDown size={14} /></button>
        <button className="secondary-button"><SlidersHorizontal size={15} /> Сортировка</button>
      </div>

      <div className="project-grid">
        {projects.map((project) => (
          <article className="project-card" key={project.id}>
            <div className="project-card-top">
              <span className="large-project-logo" style={{ background: `${project.color}16`, color: project.color }}>
                {project.name.charAt(0)}
              </span>
              <span className={cn("project-state", `project-state-${project.state.toLowerCase()}`)}>
                {projectStateLabels[project.state]}
              </span>
              <button className="quiet-icon" aria-label={`Действия: ${project.name}`}><MoreHorizontal size={17} /></button>
            </div>
            <div className="project-card-copy">
              <h2>{project.name}</h2>
              <p>{project.description}</p>
            </div>
            <div className="project-card-owner">
              <Avatar person={project.owner} size="small" />
              <span><small>Руководитель</small><strong>{project.owner.name}</strong></span>
            </div>
            <div className="project-card-progress">
              <span><small>Прогресс</small><strong>{project.progress}%</strong></span>
              <Progress value={project.progress} compact tone={project.state === "RISK" ? "warning" : "accent"} />
            </div>
            <div className="project-card-stats">
              <span><strong>{project.tasks}</strong><small>задач</small></span>
              <span><strong className={project.overdue ? "danger-text" : ""}>{project.overdue}</strong><small>просрочено</small></span>
              <span><strong>{formatDate(project.dueDate)}</strong><small>срок</small></span>
            </div>
            <footer>
              <AvatarStack people={project.members} />
              <button>Открыть проект <ArrowRight size={14} /></button>
            </footer>
          </article>
        ))}
        <button className="new-project-card" onClick={onCreate}>
          <span><Plus size={20} /></span>
          <strong>Создать новый проект</strong>
          <small>Объедините задачи и участников общей целью</small>
        </button>
      </div>
    </div>
  );
}

export function TeamView() {
  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Север Групп</span>
          <h1>Команда</h1>
          <p>Загрузка, эффективность и текущие приоритеты сотрудников.</p>
        </div>
        <button className="primary-button"><Plus size={17} /> Пригласить сотрудника</button>
      </div>
      <div className="portfolio-summary team-summary">
        <div><span>Участники</span><strong>26</strong><small>3 команды</small></div>
        <div><span>Оптимальная загрузка</span><strong>18</strong><small>69% команды</small></div>
        <div><span>Высокая загрузка</span><strong className="text-warning">5</strong><small>нужно внимание</small></div>
        <div><span>Выполнено за месяц</span><strong>96</strong><small>+14% к июлю</small></div>
      </div>
      <div className="content-toolbar">
        <label className="inline-search wide-search">
          <Search size={15} /><input placeholder="Найти сотрудника..." aria-label="Найти сотрудника" />
        </label>
        <button className="secondary-button"><Filter size={15} /> Все команды</button>
      </div>
      <div className="team-grid">
        {people.map((person) => {
          const workloadLabel =
            person.workload > 90 ? "Перегружен" :
            person.workload > 80 ? "Высокая" :
            person.workload > 55 ? "Оптимальная" : "Низкая";
          return (
            <article className="member-card" key={person.id}>
              <div className="member-heading">
                <Avatar person={person} size="large" />
                <button className="quiet-icon" aria-label={`Действия: ${person.name}`}><MoreHorizontal size={17} /></button>
              </div>
              <h2>{person.name}</h2>
              <p>{person.position}</p>
              <span className="role-badge">{person.id === "user-alexander" ? "Владелец" : "Сотрудник"}</span>
              <div className="member-stats">
                <span><strong>{person.activeTasks}</strong><small>активных</small></span>
                <span><strong className={person.overdueTasks ? "danger-text" : ""}>{person.overdueTasks}</strong><small>просрочено</small></span>
                <span><strong>{person.completedMonth}</strong><small>выполнено</small></span>
              </div>
              <div className="member-workload">
                <span><small>Загрузка</small><b className={person.workload > 88 ? "text-warning" : ""}>{workloadLabel}</b></span>
                <Progress compact value={person.workload} tone={person.workload > 88 ? "warning" : "accent"} />
                <span className="workload-percent">{person.workload}%</span>
              </div>
              <button className="member-open">Открыть профиль <ArrowRight size={14} /></button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function CalendarView({ tasks, onOpenTask }: { tasks: Task[]; onOpenTask: (task: Task) => void }) {
  const days = Array.from({ length: 35 }, (_, index) => {
    const day = index - 1;
    return day <= 0 ? 31 + day : day;
  });
  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Планирование сроков</span>
          <h1>Календарь</h1>
          <p>Все сроки команды на одной временной шкале.</p>
        </div>
        <div className="view-switcher"><button className="active">Месяц</button><button>Неделя</button></div>
      </div>
      <section className="full-calendar dashboard-card">
        <div className="calendar-toolbar">
          <button className="secondary-button">Сегодня</button>
          <div><button aria-label="Предыдущий месяц">‹</button><h2>Август 2026</h2><button aria-label="Следующий месяц">›</button></div>
          <button className="secondary-button"><Filter size={15} /> Фильтры</button>
        </div>
        <div className="calendar-weekdays">
          {["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"].map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="calendar-days-grid large-calendar-grid">
          {days.map((day, index) => {
            const dayTasks = tasks.filter((task) => task.dueDate && new Date(task.dueDate).getDate() === day);
            const muted = index < 2;
            return (
              <div key={`${day}-${index}`} className={cn(muted && "outside-month", day === 25 && !muted && "today-cell")}>
                <span className={day === 25 && !muted ? "today-number" : ""}>{day}</span>
                {dayTasks.slice(0, 3).map((task) => (
                  <button key={task.id} onClick={() => onOpenTask(task)} style={{ borderLeftColor: task.projectColor, background: `${task.projectColor}12` }}>
                    <b>{task.title}</b><small>{task.assignee.name.split(" ")[0]}</small>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function AnalyticsView() {
  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Данные организации</span>
          <h1>Аналитика</h1>
          <p>Оценивайте темп, качество планирования и загрузку команды.</p>
        </div>
        <div className="period-control"><button>7 дней</button><button className="active">30 дней</button><button>90 дней</button><button>Свой период</button></div>
      </div>
      <div className="analytics-kpis">
        <div><span>Выполнено задач</span><strong>96</strong><small className="positive">↗ 14% за месяц</small></div>
        <div><span>Процент выполнения</span><strong>72%</strong><small className="positive">↗ 6% за месяц</small></div>
        <div><span>Просрочено</span><strong>5</strong><small className="positive">↓ 3 за месяц</small></div>
        <div><span>Среднее время выполнения</span><strong>3,8 дня</strong><small className="positive">↓ 0,4 дня</small></div>
      </div>
      <div className="analytics-grid">
        <section className="dashboard-card analytics-main-chart">
          <SectionHeading title="Создано и выполнено" description="Динамика за последние 7 дней" />
          <div className="large-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={completionData} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#315ae8" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#315ae8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 3" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10 }} formatter={(value, name) => [value, name === "created" ? "Создано" : "Выполнено"]} />
                <Area type="monotone" dataKey="created" stroke="#a3aec5" fill="transparent" strokeWidth={2} />
                <Area type="monotone" dataKey="completed" stroke="#315ae8" fill="url(#analyticsGradient)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="dashboard-card priority-chart">
          <SectionHeading title="Задачи по приоритету" description="Распределение активных задач" />
          <div className="pie-wrap">
            <div className="pie-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={priorityData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={76} paddingAngle={3}>
                    {priorityData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10 }} />
                </PieChart>
              </ResponsiveContainer>
              <span><strong>42</strong><small>задачи</small></span>
            </div>
            <div className="pie-legend">
              {priorityData.map((item) => <span key={item.name}><i style={{ background: item.color }} />{item.name}<strong>{item.value}</strong></span>)}
            </div>
          </div>
        </section>
        <section className="dashboard-card team-efficiency">
          <SectionHeading title="Эффективность команды" description="Выполнено задач за месяц" />
          <div className="bar-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={people.slice(1).map((person) => ({ name: person.name.split(" ")[0], value: person.completedMonth }))}>
                <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 3" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10 }} formatter={(value) => [value, "Выполнено"]} />
                <Bar dataKey="value" fill="#315ae8" radius={[6, 6, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="dashboard-card project-health">
          <SectionHeading title="Состояние проектов" description="По срокам и темпу выполнения" />
          <div className="project-health-list">
            {projects.map((project) => <div key={project.id}><span><i style={{ background: project.color }} />{project.name}</span><Progress compact value={project.progress} tone={project.state === "RISK" ? "warning" : "accent"} /><strong>{project.progress}%</strong></div>)}
          </div>
        </section>
      </div>
    </div>
  );
}

export function ActivityView() {
  return (
    <div className="page">
      <div className="page-intro">
        <div><span className="eyebrow">История изменений</span><h1>Активность</h1><p>Все события в задачах, проектах и команде.</p></div>
      </div>
      <div className="activity-layout">
        <section className="dashboard-card activity-feed-card">
          <div className="content-toolbar activity-filters">
            <button className="secondary-button"><Users size={15} /> Сотрудник <ChevronDown size={14} /></button>
            <button className="secondary-button"><Filter size={15} /> Тип действия <ChevronDown size={14} /></button>
            <button className="secondary-button"><CalendarDays size={15} /> 30 дней</button>
          </div>
          <div className="activity-date"><span>Сегодня, 25 августа</span></div>
          <div className="activity-feed">
            {[...activityItems, ...activityItems.slice(1, 4)].map((item, index) => (
              <div className="activity-feed-item" key={`${item.id}-${index}`}>
                <Avatar person={item.person} size="medium" />
                <span className="activity-line" />
                <span className={cn("activity-type-icon", `activity-${item.type}`)}>
                  {item.type === "done" ? <Check size={13} /> : item.type === "priority" ? <Sparkles size={13} /> : <Activity size={13} />}
                </span>
                <div>
                  <p><strong>{item.person.name}</strong> {item.text} <b>«{item.target}»</b></p>
                  <small><Clock3 size={12} /> {item.time}</small>
                </div>
              </div>
            ))}
          </div>
          <button className="load-more">Показать более ранние события</button>
        </section>
        <aside className="activity-aside">
          <div className="dashboard-card">
            <h3>Сегодня</h3>
            <div className="aside-stat"><span>Изменений</span><strong>18</strong></div>
            <div className="aside-stat"><span>Завершено задач</span><strong>6</strong></div>
            <div className="aside-stat"><span>Комментариев</span><strong>11</strong></div>
          </div>
          <div className="dashboard-card">
            <h3>Самые активные</h3>
            {people.slice(1, 4).map((person, index) => <div className="active-person" key={person.id}><Avatar person={person} size="small" /><span><strong>{person.name}</strong><small>{15 - index * 3} действий</small></span></div>)}
          </div>
        </aside>
      </div>
    </div>
  );
}

const settingsSections = [
  { id: "general", label: "Общие", icon: Settings },
  { id: "organization", label: "Организация", icon: Globe2 },
  { id: "members", label: "Участники", icon: Users },
  { id: "notifications", label: "Уведомления", icon: Bell },
  { id: "appearance", label: "Внешний вид", icon: Palette },
  { id: "security", label: "Безопасность", icon: Lock },
  { id: "integrations", label: "Интеграции", icon: Link2 },
];

export function SettingsView() {
  return (
    <div className="page">
      <div className="page-intro">
        <div><span className="eyebrow">Рабочее пространство</span><h1>Настройки</h1><p>Управляйте организацией, участниками и предпочтениями.</p></div>
      </div>
      <div className="settings-layout">
        <aside className="settings-nav">
          {settingsSections.map((item, index) => <button key={item.id} className={index === 0 ? "active" : ""}><item.icon size={16} />{item.label}</button>)}
        </aside>
        <section className="settings-panel dashboard-card">
          <SectionHeading title="Общие настройки" description="Основная информация о вашем рабочем пространстве" />
          <div className="settings-form">
            <label><span>Название организации</span><input defaultValue="Север Групп" /></label>
            <label><span>Адрес рабочего пространства</span><div className="input-prefix"><span>sever.ru/</span><input defaultValue="sever-group" /></div></label>
            <label><span>Часовой пояс</span><select defaultValue="moscow"><option value="moscow">Москва (UTC+3)</option></select></label>
            <label><span>Язык интерфейса</span><select defaultValue="ru"><option value="ru">Русский</option></select></label>
            <div className="settings-divider" />
            <div className="setting-toggle-row">
              <span><strong>Еженедельная сводка</strong><small>Получать обзор по понедельникам</small></span>
              <button className="toggle active" aria-label="Еженедельная сводка включена"><i /></button>
            </div>
            <div className="setting-toggle-row">
              <span><strong>Уведомления о сроках</strong><small>Напоминать за два дня до дедлайна</small></span>
              <button className="toggle active" aria-label="Уведомления о сроках включены"><i /></button>
            </div>
          </div>
          <footer className="settings-actions"><button className="secondary-button">Отмена</button><button className="primary-button">Сохранить изменения</button></footer>
        </section>
      </div>
    </div>
  );
}

export function PlaceholderView({ view, onNavigate }: { view: "favorites" | "help"; onNavigate: (view: ViewId) => void }) {
  const favorite = view === "favorites";
  return (
    <div className="page centered-page">
      <div className="large-empty-state">
        <span>{favorite ? <Star size={28} /> : <ShieldCheck size={28} />}</span>
        <h1>{favorite ? "Избранное" : "Центр помощи"}</h1>
        <p>{favorite ? "Сохраняйте важные задачи и проекты, чтобы быстро находить их здесь." : "Ответы на вопросы, рекомендации и поддержка вашей команды."}</p>
        <button className="primary-button" onClick={() => onNavigate("overview")}>{favorite ? "Перейти к задачам" : "Вернуться к обзору"} <ArrowRight size={15} /></button>
        {!favorite && <button className="secondary-button"><Mail size={15} /> Написать в поддержку <ExternalLink size={13} /></button>}
      </div>
    </div>
  );
}
