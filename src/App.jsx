import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  Bot,
  BrainCircuit,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Database,
  FileText,
  Inbox,
  Mail,
  Menu,
  MoreHorizontal,
  Paperclip,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wifi,
  X,
  Zap,
} from "lucide-react";

const filters = [
  { id: "Все", label: "Все" },
  { id: "Новый", label: "Новые" },
  { id: "В работе", label: "В работе" },
  { id: "Высокий", label: "Важные" },
];

const companyColors = [
  ["#dff4e9", "#177451"],
  ["#fff0d9", "#ae5e00"],
  ["#e6e9ff", "#5865c9"],
  ["#f8e5ed", "#a83b68"],
  ["#e1f3f6", "#197080"],
];

function initials(name = "") {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function colorFor(value = "") {
  const sum = [...value].reduce((total, char) => total + char.charCodeAt(0), 0);
  return companyColors[sum % companyColors.length];
}

function relativeTime(date) {
  const minutes = Math.max(
    1,
    Math.round((Date.now() - new Date(date).getTime()) / 60_000),
  );
  if (minutes < 60) return `${minutes} мин`;
  if (minutes < 24 * 60) return `${Math.round(minutes / 60)} ч`;
  if (minutes < 48 * 60) return "Вчера";
  return new Intl.DateTimeFormat("ru", {
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

function longDate(date) {
  return new Intl.DateTimeFormat("ru", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

async function api(path, options) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Ошибка сервера");
  return payload;
}

function Logo() {
  return (
    <div className="logo">
      <div className="logo-mark">
        <span />
        <span />
        <span />
      </div>
      <div>
        <strong>КП Радар</strong>
        <small>AI для входящих</small>
      </div>
    </div>
  );
}

function Sidebar({ view, setView, requests, openCompose, mobileOpen, close }) {
  const newCount = requests.filter((item) => item.status === "Новый").length;
  const navItems = [
    { id: "inbox", label: "Входящие", icon: Inbox, count: newCount },
    { id: "analytics", label: "Аналитика", icon: BarChart3 },
  ];

  return (
    <>
      {mobileOpen && <button className="scrim" onClick={close} aria-label="Закрыть меню" />}
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <Logo />
          <button className="mobile-close" onClick={close} aria-label="Закрыть">
            <X size={20} />
          </button>
        </div>

        <button className="new-request-button" onClick={openCompose}>
          <Plus size={18} strokeWidth={2.4} />
          Добавить запрос
        </button>

        <nav className="main-nav" aria-label="Основная навигация">
          <p className="nav-label">Рабочее пространство</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? "active" : ""}
              onClick={() => {
                setView(item.id);
                close();
              }}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.count > 0 && <b>{item.count}</b>}
            </button>
          ))}
          <button
            className={view === "archive" ? "active" : ""}
            onClick={() => {
              setView("archive");
              close();
            }}
          >
            <Archive size={18} />
            <span>Архив</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="ai-status">
            <div className="ai-status-icon">
              <Sparkles size={17} />
            </div>
            <div>
              <strong>AI включён</strong>
              <span>Работает бесплатно</span>
            </div>
            <i />
          </div>
          <button
            className={`settings-link ${view === "settings" ? "active" : ""}`}
            onClick={() => {
              setView("settings");
              close();
            }}
          >
            <Settings size={18} />
            Настройки
          </button>
          <div className="profile">
            <div className="avatar user-avatar">АК</div>
            <div>
              <strong>Алексей Ковалёв</strong>
              <span>Руководитель продаж</span>
            </div>
            <MoreHorizontal size={17} />
          </div>
        </div>
      </aside>
    </>
  );
}

function Header({ query, setQuery, openMenu }) {
  return (
    <header className="topbar">
      <button className="menu-button" onClick={openMenu} aria-label="Открыть меню">
        <Menu size={21} />
      </button>
      <label className="search-box">
        <Search size={18} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск по письмам и компаниям"
        />
        <kbd>⌘ K</kbd>
      </label>
      <div className="topbar-actions">
        <span className="today">
          {new Intl.DateTimeFormat("ru", {
            day: "numeric",
            month: "long",
          }).format(new Date())}
        </span>
        <button className="icon-button notification" aria-label="Уведомления">
          <Bell size={19} />
          <i />
        </button>
        <div className="avatar header-avatar">АК</div>
      </div>
    </header>
  );
}

function StatCard({ label, value, note, tone, icon: Icon }) {
  return (
    <article className={`stat-card ${tone}`}>
      <div className="stat-icon">
        <Icon size={20} />
      </div>
      <div className="stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <small>{note}</small>
    </article>
  );
}

function RequestRow({ item, selected, onSelect }) {
  const [background, color] = colorFor(item.company);
  return (
    <button
      className={`request-row ${selected ? "selected" : ""} ${item.unread ? "unread" : ""}`}
      onClick={() => onSelect(item)}
    >
      <div className="unread-dot" />
      <div className="avatar company-avatar" style={{ background, color }}>
        {initials(item.company)}
      </div>
      <div className="request-main">
        <div className="request-sender">
          <strong>{item.company}</strong>
          <span>{item.senderName}</span>
        </div>
        <h3>{item.subject}</h3>
        <p>{item.summary}</p>
        <div className="request-tags mobile-tags">
          <span className={`type-chip ${item.type === "Тендер" ? "tender" : ""}`}>
            {item.type}
          </span>
        </div>
      </div>
      <div className="request-tags desktop-tags">
        <span className={`type-chip ${item.type === "Тендер" ? "tender" : ""}`}>
          {item.type}
        </span>
        {item.priority === "Высокий" && (
          <span className="priority-chip">
            <AlertTriangle size={12} />
            Важно
          </span>
        )}
      </div>
      <div className="request-meta">
        <time>{relativeTime(item.receivedAt)}</time>
        <div>
          {item.attachments?.length > 0 && (
            <span className="attachment-count">
              <Paperclip size={14} />
              {item.attachments.length}
            </span>
          )}
          <ChevronRight size={17} />
        </div>
      </div>
    </button>
  );
}

function EmptyState({ search, openCompose }) {
  return (
    <div className="empty-state">
      <div><Mail size={27} /></div>
      <h3>{search ? "Ничего не найдено" : "Здесь пока пусто"}</h3>
      <p>
        {search
          ? "Попробуйте изменить поисковый запрос."
          : "Добавьте письмо, и AI создаст краткую карточку запроса."}
      </p>
      {!search && <button onClick={openCompose}>Добавить запрос</button>}
    </div>
  );
}

function DetailPanel({ item, updateItem, close }) {
  const [saving, setSaving] = useState(false);
  if (!item) {
    return (
      <aside className="detail-panel detail-empty">
        <div className="detail-orbit">
          <Sparkles size={25} />
        </div>
        <h3>Выберите письмо</h3>
        <p>Здесь появятся AI-резюме, дедлайн и следующий шаг.</p>
      </aside>
    );
  }

  const setStatus = async (status) => {
    setSaving(true);
    try {
      await updateItem(item.id, { status });
    } finally {
      setSaving(false);
    }
  };

  const [background, color] = colorFor(item.company);
  return (
    <aside className="detail-panel">
      <div className="detail-header">
        <div className="detail-heading">
          <button className="detail-back" onClick={close} aria-label="Назад">
            <ArrowLeft size={19} />
          </button>
          <span>Карточка запроса</span>
          <button className="icon-button" aria-label="Другие действия">
            <MoreHorizontal size={19} />
          </button>
        </div>
        <div className="detail-company">
          <div className="avatar company-avatar" style={{ background, color }}>
            {initials(item.company)}
          </div>
          <div>
            <strong>{item.company}</strong>
            <span>{item.senderName}</span>
          </div>
        </div>
        <h2>{item.subject}</h2>
        <div className="detail-tags">
          <span className="type-chip">{item.type}</span>
          <span className={`status-chip status-${item.status.toLowerCase().replace(" ", "-")}`}>
            {item.status}
          </span>
        </div>
      </div>

      <div className="ai-summary-card">
        <div className="summary-title">
          <span><Sparkles size={16} /> AI-резюме</span>
          <small>{item.confidence}% точно</small>
        </div>
        <p>{item.summary}</p>
        <div className="next-action">
          <div><Zap size={15} /></div>
          <div>
            <span>Следующий шаг</span>
            <strong>{item.nextAction}</strong>
          </div>
        </div>
      </div>

      <div className="details-grid">
        <div>
          <span><AlertCircle size={15} /> Приоритет</span>
          <strong className={`priority-${item.priority.toLowerCase()}`}>
            {item.priority}
          </strong>
        </div>
        <div>
          <span><CalendarDays size={15} /> Срок ответа</span>
          <strong>{item.deadline || "Не указан"}</strong>
        </div>
        <div>
          <span><CircleDollarSign size={15} /> Сумма</span>
          <strong>{item.amount || "Не указана"}</strong>
        </div>
        <div>
          <span><UserRound size={15} /> Ответственный</span>
          <strong>{item.assignee}</strong>
        </div>
      </div>

      {item.attachments?.length > 0 && (
        <section className="attachments">
          <h4>Вложения <span>{item.attachments.length}</span></h4>
          {item.attachments.map((attachment) => (
            <button key={attachment}>
              <div><FileText size={17} /></div>
              <span>{attachment}</span>
              <ArrowUpRight size={15} />
            </button>
          ))}
        </section>
      )}

      <section className="original-message">
        <div>
          <h4>Исходное письмо</h4>
          <span>{longDate(item.receivedAt)}</span>
        </div>
        <p>{item.body}</p>
      </section>

      <div className="detail-actions">
        {item.status !== "В работе" && item.status !== "Обработан" && (
          <button
            className="primary-action"
            onClick={() => setStatus("В работе")}
            disabled={saving}
          >
            <CheckCircle2 size={17} />
            Взять в работу
          </button>
        )}
        {item.status === "В работе" && (
          <button
            className="primary-action"
            onClick={() => setStatus("Обработан")}
            disabled={saving}
          >
            <Check size={17} />
            Завершить
          </button>
        )}
        <button className="reply-action">
          <Send size={17} />
          Ответить
        </button>
      </div>
    </aside>
  );
}

function InboxView({
  requests,
  selected,
  setSelected,
  filter,
  setFilter,
  query,
  openCompose,
  syncMailbox,
  syncing,
  updateItem,
}) {
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("ru");
    return requests.filter((item) => {
      const filterMatch =
        filter === "Все" ||
        (filter === "Высокий"
          ? item.priority === "Высокий"
          : item.status === filter);
      const searchMatch =
        !needle ||
        [item.subject, item.summary, item.company, item.senderName]
          .join(" ")
          .toLocaleLowerCase("ru")
          .includes(needle);
      return filterMatch && searchMatch;
    });
  }, [requests, filter, query]);

  const stats = {
    new: requests.filter((item) => item.status === "Новый").length,
    work: requests.filter((item) => item.status === "В работе").length,
    urgent: requests.filter((item) => item.priority === "Высокий").length,
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Центр входящих запросов</p>
          <h1>Добрый день, Алексей</h1>
          <span>AI уже разобрал письма и выделил главное.</span>
        </div>
        <button className="sync-button" onClick={syncMailbox} disabled={syncing}>
          <RefreshCw size={17} className={syncing ? "spin" : ""} />
          {syncing ? "Проверяем…" : "Проверить почту"}
        </button>
      </div>

      <section className="stats-grid">
        <StatCard
          label="Новые запросы"
          value={stats.new}
          note="+18% за неделю"
          tone="mint"
          icon={Mail}
        />
        <StatCard
          label="В работе"
          value={stats.work}
          note="2 ответа сегодня"
          tone="blue"
          icon={Clock3}
        />
        <StatCard
          label="Требуют внимания"
          value={stats.urgent}
          note="Проверьте сроки"
          tone="coral"
          icon={AlertTriangle}
        />
        <StatCard
          label="Обработано AI"
          value="100%"
          note="Без платного API"
          tone="violet"
          icon={BrainCircuit}
        />
      </section>

      <section className="inbox-shell">
        <div className="requests-panel">
          <div className="requests-toolbar">
            <div>
              <h2>Входящие</h2>
              <span>{filtered.length} запросов</span>
            </div>
            <div className="filter-tabs">
              {filters.map((item) => {
                const count =
                  item.id === "Все"
                    ? requests.length
                    : item.id === "Высокий"
                      ? requests.filter((request) => request.priority === "Высокий").length
                      : requests.filter((request) => request.status === item.id).length;
                return (
                  <button
                    key={item.id}
                    className={filter === item.id ? "active" : ""}
                    onClick={() => setFilter(item.id)}
                  >
                    {item.label}
                    {item.id !== "Все" && <span>{count}</span>}
                  </button>
                );
              })}
            </div>
            <button className="mobile-add" onClick={openCompose} aria-label="Добавить запрос">
              <Plus size={18} />
            </button>
          </div>

          <div className="request-list">
            {filtered.length ? (
              filtered.map((item) => (
                <RequestRow
                  key={item.id}
                  item={item}
                  selected={selected?.id === item.id}
                  onSelect={setSelected}
                />
              ))
            ) : (
              <EmptyState search={query} openCompose={openCompose} />
            )}
          </div>
        </div>
        <DetailPanel
          item={selected}
          updateItem={updateItem}
          close={() => setSelected(null)}
        />
      </section>
    </>
  );
}

function AnalyticsView({ requests }) {
  const types = ["Запрос КП", "Запрос цен", "Тендер", "Документы", "Общий запрос"];
  const totals = types.map((type) => ({
    type,
    count: requests.filter((request) => request.type === type).length,
  }));
  const max = Math.max(...totals.map((item) => item.count), 1);

  return (
    <div className="secondary-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Эффективность команды</p>
          <h1>Аналитика запросов</h1>
          <span>Что спрашивают клиенты и как быстро отвечает отдел.</span>
        </div>
        <button className="period-button">Последние 30 дней <ChevronDown size={16} /></button>
      </div>
      <section className="analytics-stats">
        <article>
          <span>Всего запросов</span>
          <strong>128</strong>
          <small><ArrowUpRight size={14} /> 12% к прошлому периоду</small>
        </article>
        <article>
          <span>Среднее время ответа</span>
          <strong>1 ч 42 мин</strong>
          <small className="good"><ArrowUpRight size={14} /> Быстрее на 24 мин</small>
        </article>
        <article>
          <span>Конверсия в сделку</span>
          <strong>34%</strong>
          <small><ArrowUpRight size={14} /> 4,8% за месяц</small>
        </article>
      </section>
      <section className="analytics-grid">
        <article className="chart-card">
          <div className="card-title">
            <div><h2>Типы обращений</h2><span>Распределение текущей выборки</span></div>
            <MoreHorizontal size={18} />
          </div>
          <div className="bars">
            {totals.map((item) => (
              <div className="bar-row" key={item.type}>
                <span>{item.type}</span>
                <div><i style={{ width: `${Math.max(8, (item.count / max) * 100)}%` }} /></div>
                <b>{item.count}</b>
              </div>
            ))}
          </div>
        </article>
        <article className="chart-card insight-card">
          <div className="insight-icon"><Sparkles size={21} /></div>
          <p className="eyebrow">AI-наблюдение</p>
          <h2>Запросов цен стало больше</h2>
          <p>
            За последние 7 дней клиенты на 23% чаще спрашивают стоимость.
            Обновите общий прайс, чтобы отвечать быстрее.
          </p>
          <button>Посмотреть запросы <ArrowUpRight size={16} /></button>
        </article>
      </section>
    </div>
  );
}

function SettingsView({ health }) {
  return (
    <div className="secondary-page settings-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Интеграции</p>
          <h1>Настройки</h1>
          <span>Подключите рабочую почту и выберите способ анализа.</span>
        </div>
      </div>
      <section className="settings-stack">
        <article className="settings-card">
          <div className="settings-icon mail-setting"><Mail size={21} /></div>
          <div className="settings-copy">
            <div className="settings-title">
              <div><h2>Рабочая почта</h2><span>Получение новых писем по IMAP</span></div>
              <span className={`connection-badge ${health.mailboxConfigured ? "connected" : ""}`}>
                <i /> {health.mailboxConfigured ? "Подключено" : "Не подключено"}
              </span>
            </div>
            <p>
              Данные для входа хранятся только на сервере и никогда не
              передаются в браузер.
            </p>
            <div className="env-list">
              <code>IMAP_HOST</code>
              <code>IMAP_USER</code>
              <code>IMAP_PASSWORD</code>
            </div>
          </div>
        </article>
        <article className="settings-card">
          <div className="settings-icon ai-setting"><Bot size={21} /></div>
          <div className="settings-copy">
            <div className="settings-title">
              <div><h2>AI-анализ</h2><span>Классификация и краткое резюме</span></div>
              <span className="connection-badge connected"><i /> Работает</span>
            </div>
            <p>
              Сейчас используется {health.aiEngine || "Локальный AI"} — бесплатно
              и без передачи писем сторонним сервисам. Для более глубоких резюме
              можно подключить локальную Ollama.
            </p>
            <div className="setting-benefits">
              <span><ShieldCheck size={16} /> Приватно</span>
              <span><Zap size={16} /> Без лимитов</span>
              <span><Database size={16} /> Локально</span>
            </div>
          </div>
        </article>
        <article className="settings-card">
          <div className="settings-icon sync-setting"><Wifi size={21} /></div>
          <div className="settings-copy">
            <div className="settings-title">
              <div><h2>Автосинхронизация</h2><span>Проверка новых сообщений</span></div>
              <label className="switch"><input type="checkbox" defaultChecked /><span /></label>
            </div>
            <p>Проверять папку «Входящие» каждые 5 минут и сразу создавать карточки запросов.</p>
          </div>
        </article>
      </section>
    </div>
  );
}

function ArchiveView({ requests, selectItem }) {
  const archived = requests.filter((request) => request.status === "Обработан");
  return (
    <div className="secondary-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">История</p>
          <h1>Архив запросов</h1>
          <span>Обработанные обращения остаются доступны для поиска.</span>
        </div>
      </div>
      <section className="archive-card">
        {archived.length ? archived.map((item) => (
          <RequestRow key={item.id} item={item} onSelect={selectItem} />
        )) : <EmptyState />}
      </section>
    </div>
  );
}

function ComposeModal({ close, onCreated }) {
  const [form, setForm] = useState({
    senderName: "",
    senderEmail: "",
    company: "",
    subject: "",
    body: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const change = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const created = await api("/api/requests", {
        method: "POST",
        body: JSON.stringify(form),
      });
      onCreated(created);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <section className="compose-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-ai-icon"><Sparkles size={19} /></div>
            <div>
              <h2>Разобрать новое письмо</h2>
              <p>AI сам определит тип, приоритет и следующий шаг.</p>
            </div>
          </div>
          <button onClick={close} aria-label="Закрыть"><X size={20} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="form-row">
            <label>
              Отправитель
              <input
                value={form.senderName}
                onChange={change("senderName")}
                placeholder="Имя и фамилия"
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.senderEmail}
                onChange={change("senderEmail")}
                placeholder="client@company.ru"
              />
            </label>
          </div>
          <label>
            Компания
            <input
              value={form.company}
              onChange={change("company")}
              placeholder="Определим по email, если оставить пустым"
            />
          </label>
          <label>
            Тема письма
            <input
              required
              value={form.subject}
              onChange={change("subject")}
              placeholder="Например: Запрос КП на поставку"
            />
          </label>
          <label>
            Текст письма
            <textarea
              required
              value={form.body}
              onChange={change("body")}
              placeholder="Вставьте сюда текст входящего письма…"
              rows={7}
            />
          </label>
          {error && <p className="form-error"><AlertCircle size={15} /> {error}</p>}
          <div className="modal-footer">
            <span><ShieldCheck size={15} /> Текст останется на вашем сервере</span>
            <div>
              <button type="button" className="cancel-button" onClick={close}>Отмена</button>
              <button type="submit" className="analyze-button" disabled={submitting}>
                {submitting ? <RefreshCw size={17} className="spin" /> : <Sparkles size={17} />}
                {submitting ? "Анализируем…" : "Создать карточку"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <Logo />
      <RefreshCw size={21} className="spin" />
    </div>
  );
}

export default function App() {
  const [requests, setRequests] = useState([]);
  const [health, setHealth] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("inbox");
  const [filter, setFilter] = useState("Все");
  const [query, setQuery] = useState("");
  const [selected, setSelectedState] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    Promise.all([api("/api/requests"), api("/api/health")])
      .then(([requestData, healthData]) => {
        setRequests(requestData);
        setHealth(healthData);
        setSelectedState(requestData[0] || null);
      })
      .catch((error) => setToast({ type: "error", message: error.message }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const setSelected = async (item) => {
    setSelectedState(item);
    if (item.unread) {
      try {
        await updateItem(item.id, { unread: false }, false);
      } catch {
        // Reading the card should still work when marking as read fails.
      }
    }
  };

  const updateItem = async (id, changes, notify = true) => {
    const updated = await api(`/api/requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    });
    setRequests((current) =>
      current.map((item) => (item.id === id ? updated : item)),
    );
    setSelectedState((current) => (current?.id === id ? updated : current));
    if (notify) setToast({ type: "success", message: "Карточка обновлена" });
    return updated;
  };

  const syncMailbox = async () => {
    setSyncing(true);
    try {
      const result = await api("/api/sync", { method: "POST" });
      if (result.requests.length) {
        setRequests((current) => [...result.requests, ...current]);
        setSelectedState(result.requests[0]);
      }
      setToast({ type: "success", message: result.message });
    } catch (error) {
      setToast({ type: "error", message: error.message });
    } finally {
      setSyncing(false);
    }
  };

  const handleCreated = (created) => {
    setRequests((current) => [created, ...current]);
    setSelectedState(created);
    setView("inbox");
    setFilter("Все");
    setComposeOpen(false);
    setToast({ type: "success", message: "AI разобрал письмо и создал карточку" });
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="app-shell">
      <Sidebar
        view={view}
        setView={setView}
        requests={requests}
        openCompose={() => setComposeOpen(true)}
        mobileOpen={mobileMenu}
        close={() => setMobileMenu(false)}
      />
      <div className="workspace">
        <Header
          query={query}
          setQuery={setQuery}
          openMenu={() => setMobileMenu(true)}
        />
        <main>
          {view === "inbox" && (
            <InboxView
              requests={requests}
              selected={selected}
              setSelected={setSelected}
              filter={filter}
              setFilter={setFilter}
              query={query}
              openCompose={() => setComposeOpen(true)}
              syncMailbox={syncMailbox}
              syncing={syncing}
              updateItem={updateItem}
            />
          )}
          {view === "analytics" && <AnalyticsView requests={requests} />}
          {view === "settings" && <SettingsView health={health} />}
          {view === "archive" && (
            <ArchiveView
              requests={requests}
              selectItem={(item) => {
                setSelected(item);
                setView("inbox");
              }}
            />
          )}
        </main>
      </div>

      {composeOpen && (
        <ComposeModal close={() => setComposeOpen(false)} onCreated={handleCreated} />
      )}

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)}><X size={16} /></button>
        </div>
      )}
    </div>
  );
}
