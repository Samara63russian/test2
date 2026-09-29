"use client";

import { useEffect, useMemo, useState } from "react";
import type { AnalyzeResult, RequestRecord, RequestType, RecordStatus } from "@/lib/types";
import { STATUS_LABELS, TYPE_LABELS } from "@/lib/types";
import {
  emailToRecord,
  loadRecords,
  loadSettings,
  saveRecords,
  saveSettings,
  type AppSettings,
  defaultSettings,
} from "@/lib/storage";
import { DEMO_EMAILS } from "@/lib/demo";
import { parseRawEmail } from "@/lib/local-ai";

type FilterType = RequestType | "all";
type FilterStatus = RecordStatus | "all";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function TypeBadge({ type }: { type: RequestType }) {
  return (
    <span className={`badge badge-${type}`}>{TYPE_LABELS[type]}</span>
  );
}

export default function AppShell() {
  const [records, setRecords] = useState<RequestRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [hydrated, setHydrated] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setRecords(loadRecords());
    setSettings(loadSettings());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveRecords(records);
  }, [records, hydrated]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const selected = records.find((r) => r.id === selectedId) || null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records
      .filter((r) => (filterType === "all" ? true : r.type === filterType))
      .filter((r) => (filterStatus === "all" ? true : r.status === filterStatus))
      .filter((r) => {
        if (!q) return true;
        return (
          r.subject.toLowerCase().includes(q) ||
          r.from.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q) ||
          (r.company || "").toLowerCase().includes(q)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
      );
  }, [records, filterType, filterStatus, query]);

  const counts = useMemo(() => {
    return {
      total: records.length,
      new: records.filter((r) => r.status === "new").length,
      kp: records.filter((r) => r.type === "kp").length,
      perechen: records.filter((r) => r.type === "perechen").length,
    };
  }, [records]);

  function upsertRecord(rec: RequestRecord) {
    setRecords((prev) => {
      const i = prev.findIndex((p) => p.id === rec.id);
      if (i === -1) return [rec, ...prev];
      const next = [...prev];
      next[i] = rec;
      return next;
    });
  }

  async function analyzeAndCreate(email: {
    from: string;
    subject: string;
    body: string;
    receivedAt?: string;
  }) {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        provider: settings.provider,
        groqKey: settings.groqKey || undefined,
        geminiKey: settings.geminiKey || undefined,
      }),
    });
    const data = (await res.json()) as AnalyzeResult & {
      error?: string;
      warning?: string;
    };
    if (!res.ok && data.error) throw new Error(data.error);

    const record = emailToRecord(email, {
      type: data.type,
      summary: data.summary,
      keyPoints: data.keyPoints || [],
      company: data.company,
      deadline: data.deadline,
      itemsMentioned: data.itemsMentioned,
      confidence: data.confidence,
      aiProvider: data.aiProvider,
    });
    upsertRecord(record);
    setSelectedId(record.id);
    setShowCompose(false);
    setToast(
      data.warning
        ? `Запись создана (локальный ИИ): ${data.warning}`
        : `Запись создана · ${TYPE_LABELS[record.type]} · ${
            record.aiProvider === "local"
              ? "бесплатный локальный ИИ"
              : record.aiProvider
          }`
    );
    return record;
  }

  async function loadDemos() {
    setPending(true);
    try {
      for (const demo of DEMO_EMAILS) {
        await analyzeAndCreate(demo);
      }
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Ошибка демо");
    } finally {
      setPending(false);
    }
  }

  function updateStatus(id: string, status: RecordStatus) {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status, updatedAt: new Date().toISOString() }
          : r
      )
    );
  }

  function updateNotes(id: string, notes: string) {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, notes, updatedAt: new Date().toISOString() }
          : r
      )
    );
  }

  function removeRecord(id: string) {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (selectedId === id) setSelectedId(null);
    setToast("Запись удалена");
  }

  function persistSettings(next: AppSettings) {
    setSettings(next);
    saveSettings(next);
    setToast("Настройки сохранены");
  }

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="brand-mark text-2xl text-[var(--moss)]">Конспект</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="px-5 sm:px-8 pt-7 pb-4 animate-rise">
        <div className="max-w-7xl mx-auto flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="live-dot" />
              <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[rgba(15,31,28,0.5)]">
                входящие запросы
              </span>
            </div>
            <h1 className="brand-mark text-4xl sm:text-5xl text-[var(--ink)] leading-none">
              Конспект
            </h1>
            <p className="mt-2 max-w-xl text-[rgba(15,31,28,0.68)] text-[0.98rem]">
              Отслеживайте письма с запросами КП, перечней и уточнений —
              ИИ кратко конспектирует и создаёт запись. Работает бесплатно
              без ключа; Groq / Gemini — по желанию.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowSettings(true)}
            >
              ИИ и ключи
            </button>
            <button
              type="button"
              className="btn btn-sand"
              onClick={loadDemos}
              disabled={pending}
            >
              Демо-письма
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowCompose(true)}
            >
              + Добавить письмо
            </button>
          </div>
        </div>
      </header>

      <section className="px-5 sm:px-8 pb-4 animate-rise" style={{ animationDelay: "0.08s" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Всего записей", value: counts.total },
            { label: "Новые", value: counts.new },
            { label: "Запросы КП", value: counts.kp },
            { label: "Перечни", value: counts.perechen },
          ].map((s) => (
            <div key={s.label} className="panel px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-[rgba(15,31,28,0.45)] font-semibold">
                {s.label}
              </div>
              <div className="brand-mark text-3xl mt-1 text-[var(--moss-deep)]">
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 sm:px-8 pb-3">
        <div className="max-w-7xl mx-auto panel p-3 sm:p-4 flex flex-col lg:flex-row gap-3">
          <input
            className="field lg:flex-1"
            placeholder="Поиск по теме, отправителю, конспекту…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "Все типы"],
                ["kp", "КП"],
                ["perechen", "Перечень"],
                ["request", "Запрос"],
                ["other", "Прочее"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`btn ${filterType === id ? "btn-primary" : "btn-ghost"} !py-2 !px-3 text-sm`}
                onClick={() => setFilterType(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <select
            className="field lg:w-44"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          >
            <option value="all">Все статусы</option>
            {(Object.keys(STATUS_LABELS) as RecordStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </section>

      <main className="px-5 sm:px-8 pb-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-4">
          <div className="panel overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--line)] flex items-center justify-between">
              <h2 className="font-semibold">Лента записей</h2>
              <span className="text-sm text-[rgba(15,31,28,0.5)]">
                {filtered.length}
              </span>
            </div>
            {filtered.length === 0 ? (
              <div className="p-10 text-center text-[rgba(15,31,28,0.55)]">
                <p className="brand-mark text-2xl text-[var(--ink)] mb-2">
                  Пока пусто
                </p>
                <p className="mb-5 max-w-sm mx-auto">
                  Вставьте письмо с запросом КП или перечня — Конспект сделает
                  краткую запись. Или загрузите демо.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowCompose(true)}
                >
                  Добавить первое письмо
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--line)] stagger max-h-[70vh] overflow-auto">
                {filtered.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(r.id)}
                      className={`w-full text-left px-4 py-4 transition-colors ${
                        selectedId === r.id
                          ? "bg-[rgba(31,111,91,0.1)]"
                          : "hover:bg-[rgba(255,255,255,0.45)]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <TypeBadge type={r.type} />
                        <span className="text-xs text-[rgba(15,31,28,0.45)] whitespace-nowrap">
                          {formatDate(r.receivedAt)}
                        </span>
                      </div>
                      <div className="font-semibold leading-snug">{r.subject}</div>
                      <div className="text-sm text-[rgba(15,31,28,0.55)] mt-0.5 truncate">
                        {r.from}
                        {r.company ? ` · ${r.company}` : ""}
                      </div>
                      <p className="text-sm mt-2 text-[rgba(15,31,28,0.72)] line-clamp-2">
                        {r.summary}
                      </p>
                      <div className="mt-2 text-xs font-medium text-[rgba(15,31,28,0.45)]">
                        {STATUS_LABELS[r.status]}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="panel min-h-[28rem] animate-fade">
            {!selected ? (
              <div className="h-full min-h-[28rem] flex items-center justify-center p-8 text-center text-[rgba(15,31,28,0.5)]">
                Выберите запись слева или добавьте письмо
              </div>
            ) : (
              <RecordDetail
                record={selected}
                onStatus={(s) => updateStatus(selected.id, s)}
                onNotes={(n) => updateNotes(selected.id, n)}
                onDelete={() => removeRecord(selected.id)}
              />
            )}
          </div>
        </div>
      </main>

      {showCompose && (
        <ComposeModal
          busy={pending}
          onClose={() => setShowCompose(false)}
          onSubmit={async (email) => {
            setPending(true);
            try {
              await analyzeAndCreate(email);
            } catch (e) {
              setToast(e instanceof Error ? e.message : "Ошибка");
            } finally {
              setPending(false);
            }
          }}
        />
      )}

      {showSettings && (
        <SettingsModal
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSave={(s) => {
            persistSettings(s);
            setShowSettings(false);
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 panel px-4 py-3 text-sm shadow-lg max-w-[90vw] animate-rise">
          {toast}
        </div>
      )}
    </div>
  );
}

function RecordDetail({
  record,
  onStatus,
  onNotes,
  onDelete,
}: {
  record: RequestRecord;
  onStatus: (s: RecordStatus) => void;
  onNotes: (n: string) => void;
  onDelete: () => void;
}) {
  return (
    <div className="p-5 sm:p-6 flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            <TypeBadge type={record.type} />
            <span className="badge badge-other">
              ИИ:{" "}
              {record.aiProvider === "local"
                ? "локальный (бесплатно)"
                : record.aiProvider}
            </span>
            <span className="badge badge-other">
              уверенность {Math.round(record.confidence * 100)}%
            </span>
          </div>
          <h2 className="brand-mark text-2xl sm:text-3xl leading-tight">
            {record.subject}
          </h2>
          <p className="text-sm text-[rgba(15,31,28,0.55)] mt-1">
            {record.from}
            {record.company ? ` · ${record.company}` : ""} ·{" "}
            {formatDate(record.receivedAt)}
          </p>
        </div>
        <button type="button" className="btn btn-ghost !py-2 text-sm" onClick={onDelete}>
          Удалить
        </button>
      </div>

      <div>
        <div className="field-label">Конспект</div>
        <p className="text-[1.05rem] leading-relaxed">{record.summary}</p>
      </div>

      {record.keyPoints?.length > 0 && (
        <div>
          <div className="field-label">Ключевые пункты</div>
          <ul className="space-y-1.5">
            {record.keyPoints.map((p) => (
              <li
                key={p}
                className="flex gap-2 text-sm leading-snug before:content-[''] before:mt-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-[var(--moss)] before:shrink-0"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {record.deadline && (
          <div className="rounded-2xl bg-[rgba(196,130,74,0.12)] px-4 py-3">
            <div className="field-label !mb-1">Срок</div>
            <div className="font-semibold">{record.deadline}</div>
          </div>
        )}
        {record.itemsMentioned && record.itemsMentioned.length > 0 && (
          <div className="rounded-2xl bg-[rgba(31,111,91,0.1)] px-4 py-3 sm:col-span-2">
            <div className="field-label !mb-1">Упомянутые позиции</div>
            <div className="text-sm">{record.itemsMentioned.join(" · ")}</div>
          </div>
        )}
      </div>

      <div>
        <label className="field-label" htmlFor="status">
          Статус
        </label>
        <select
          id="status"
          className="field"
          value={record.status}
          onChange={(e) => onStatus(e.target.value as RecordStatus)}
        >
          {(Object.keys(STATUS_LABELS) as RecordStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label" htmlFor="notes">
          Заметки менеджера
        </label>
        <textarea
          id="notes"
          className="field min-h-24"
          value={record.notes}
          onChange={(e) => onNotes(e.target.value)}
          placeholder="Что ответили, кому передали…"
        />
      </div>

      <details className="rounded-2xl border border-[var(--line)] bg-white/40 px-4 py-3">
        <summary className="cursor-pointer font-semibold text-sm">
          Исходное письмо
        </summary>
        <pre className="mt-3 whitespace-pre-wrap text-sm text-[rgba(15,31,28,0.75)] font-sans">
          {record.body}
        </pre>
      </details>
    </div>
  );
}

function ComposeModal({
  onClose,
  onSubmit,
  busy,
}: {
  onClose: () => void;
  onSubmit: (email: {
    from: string;
    subject: string;
    body: string;
    receivedAt?: string;
  }) => void;
  busy: boolean;
}) {
  const [mode, setMode] = useState<"fields" | "raw">("fields");
  const [from, setFrom] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [raw, setRaw] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "raw") {
      const parsed = parseRawEmail(raw);
      if (!parsed.body.trim()) return;
      onSubmit(parsed);
      return;
    }
    if (!body.trim() && !subject.trim()) return;
    onSubmit({
      from: from || "неизвестно@mail.local",
      subject: subject || "(без темы)",
      body,
      receivedAt: new Date().toISOString(),
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(15,31,28,0.45)] backdrop-blur-[2px]"
        aria-label="Закрыть"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative panel w-full max-w-2xl max-h-[92vh] overflow-auto p-5 sm:p-6 animate-rise"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="brand-mark text-2xl">Новое письмо</h2>
            <p className="text-sm text-[rgba(15,31,28,0.55)] mt-1">
              Вставьте запрос — ИИ определит тип и создаст конспект-запись
            </p>
          </div>
          <button type="button" className="btn btn-ghost !py-2" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            className={`btn !py-2 text-sm ${mode === "fields" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setMode("fields")}
          >
            Поля
          </button>
          <button
            type="button"
            className={`btn !py-2 text-sm ${mode === "raw" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setMode("raw")}
          >
            Сырой текст письма
          </button>
        </div>

        {mode === "fields" ? (
          <div className="space-y-3">
            <div>
              <label className="field-label" htmlFor="from">
                От кого
              </label>
              <input
                id="from"
                className="field"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Имя &lt;email@company.ru&gt;"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="subject">
                Тема
              </label>
              <input
                id="subject"
                className="field"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Запрос коммерческого предложения…"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="body">
                Текст
              </label>
              <textarea
                id="body"
                className="field min-h-48"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Вставьте текст письма…"
                required
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="field-label" htmlFor="raw">
              Полный текст (From / Subject / тело)
            </label>
            <textarea
              id="raw"
              className="field min-h-64 font-mono text-sm"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder={`From: client@firma.ru\nSubject: Запрос КП\n\nДобрый день...`}
              required
            />
          </div>
        )}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "Разбираем…" : "Конспектировать и создать запись"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SettingsModal({
  settings,
  onClose,
  onSave,
}: {
  settings: AppSettings;
  onClose: () => void;
  onSave: (s: AppSettings) => void;
}) {
  const [draft, setDraft] = useState(settings);

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(15,31,28,0.45)]"
        aria-label="Закрыть"
        onClick={onClose}
      />
      <div className="relative panel w-full max-w-lg p-5 sm:p-6 animate-rise">
        <h2 className="brand-mark text-2xl mb-1">ИИ</h2>
        <p className="text-sm text-[rgba(15,31,28,0.55)] mb-4">
          По умолчанию используется бесплатный локальный анализатор (без
          ключей). Для более точных конспектов — бесплатные ключи Groq или
          Google Gemini.
        </p>

        <label className="field-label" htmlFor="provider">
          Провайдер
        </label>
        <select
          id="provider"
          className="field mb-3"
          value={draft.provider}
          onChange={(e) =>
            setDraft({
              ...draft,
              provider: e.target.value as AppSettings["provider"],
            })
          }
        >
          <option value="auto">Авто (ключ → облако, иначе локально)</option>
          <option value="local">Только локальный (бесплатно)</option>
          <option value="groq">Groq (Llama, бесплатный tier)</option>
          <option value="gemini">Google Gemini Flash</option>
        </select>

        <label className="field-label" htmlFor="groq">
          Groq API key
        </label>
        <input
          id="groq"
          className="field mb-1"
          type="password"
          value={draft.groqKey}
          onChange={(e) => setDraft({ ...draft, groqKey: e.target.value })}
          placeholder="gsk_…"
        />
        <p className="text-xs text-[rgba(15,31,28,0.45)] mb-3">
          Бесплатно:{" "}
          <a
            className="underline text-[var(--moss-deep)]"
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noreferrer"
          >
            console.groq.com/keys
          </a>
        </p>

        <label className="field-label" htmlFor="gemini">
          Gemini API key
        </label>
        <input
          id="gemini"
          className="field mb-1"
          type="password"
          value={draft.geminiKey}
          onChange={(e) => setDraft({ ...draft, geminiKey: e.target.value })}
          placeholder="AIza…"
        />
        <p className="text-xs text-[rgba(15,31,28,0.45)] mb-5">
          Бесплатно:{" "}
          <a
            className="underline text-[var(--moss-deep)]"
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noreferrer"
          >
            aistudio.google.com/apikey
          </a>
        </p>

        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Отмена
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onSave(draft)}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
