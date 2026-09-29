"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { v4 as uuidv4 } from "uuid";
import { EmailForm } from "@/components/EmailForm";
import { RecordCard } from "@/components/RecordCard";
import { RecordDetail } from "@/components/RecordDetail";
import { SettingsModal } from "@/components/SettingsModal";
import { StatsBar } from "@/components/StatsBar";
import type { AnalysisResult, EmailInput, InquiryRecord, InquiryStatus, InquiryType } from "@/lib/types";
import { TYPE_LABELS } from "@/lib/types";
import {
  loadRecords,
  loadSettings,
  saveRecords,
  saveSettings,
  type AppSettings,
} from "@/lib/storage";

type FilterType = "all" | InquiryType;

export default function HomePage() {
  const [records, setRecords] = useState<InquiryRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    groqApiKey: "",
    preferGroq: true,
  });
  const [hydrated, setHydrated] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [query, setQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [, startTransition] = useTransition();

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
    if (!hydrated) return;
    saveSettings(settings);
  }, [settings, hydrated]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records
      .filter((r) => (filter === "all" ? true : r.type === filter))
      .filter((r) => {
        if (!q) return true;
        return (
          r.company.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q) ||
          r.from.toLowerCase().includes(q)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [records, filter, query]);

  const selected = records.find((r) => r.id === selectedId) ?? null;

  async function createFromEmail(email: EmailInput) {
    setBusy(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          groqApiKey:
            settings.preferGroq && settings.groqApiKey
              ? settings.groqApiKey
              : undefined,
        }),
      });
      const data = (await res.json()) as {
        analysis?: AnalysisResult;
        error?: string;
      };
      if (!res.ok || !data.analysis) {
        throw new Error(data.error || "Не удалось проанализировать письмо");
      }

      const record: InquiryRecord = {
        id: uuidv4(),
        from: email.from,
        subject: email.subject,
        body: email.body,
        receivedAt: email.receivedAt || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: "new",
        notes: "",
        ...data.analysis,
      };

      startTransition(() => {
        setRecords((prev) => [record, ...prev]);
        setSelectedId(record.id);
      });
      setToast(
        data.analysis.aiProvider === "groq"
          ? "Запись создана (Groq)"
          : "Запись создана (локальный ИИ)",
      );
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  }

  function patchStatus(id: string, status: InquiryStatus) {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r)),
    );
  }

  function patchNotes(id: string, notes: string) {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, notes } : r)),
    );
  }

  function removeRecord(id: string) {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (selectedId === id) setSelectedId(null);
    setToast("Запись удалена");
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 md:px-6 md:py-10">
      <header className="animate-rise mb-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--amber)]">
            Отдел продаж · входящие
          </p>
          <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-[var(--ink)] md:text-6xl">
            Письмо → Запись
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--ink-soft)] md:text-lg">
            Отслеживайте запросы КП, перечней и обычные обращения: бесплатный ИИ кратко
            конспектирует письмо и создаёт карточку для работы менеджера.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-start gap-3 lg:justify-end">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setSettingsOpen(true)}
          >
            Настройки ИИ
          </button>
          <a
            className="btn btn-amber"
            href="#compose"
          >
            Добавить письмо
          </a>
        </div>
      </header>

      <div className="mb-8">
        <StatsBar records={records} />
      </div>

      <div id="compose" className="mb-8">
        <EmailForm busy={busy} onSubmit={createFromEmail} />
      </div>

      <section className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-2xl">Журнал запросов</h2>
        <div className="flex flex-wrap gap-2">
          <input
            className="input-field max-w-xs"
            placeholder="Поиск по компании, теме…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="input-field max-w-[220px]"
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
          >
            <option value="all">Все типы</option>
            {(Object.keys(TYPE_LABELS) as InquiryType[]).map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="scrollbar-thin flex max-h-[720px] flex-col gap-3 overflow-y-auto pr-1">
          {!hydrated ? (
            <p className="text-sm text-[var(--ink-soft)]">Загрузка…</p>
          ) : filtered.length === 0 ? (
            <div className="panel rounded-2xl p-8 text-center">
              <p className="font-display text-xl">Пока нет записей</p>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">
                Вставьте письмо выше или загрузите пример одним кликом.
              </p>
            </div>
          ) : (
            filtered.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                selected={record.id === selectedId}
                onSelect={() => setSelectedId(record.id)}
                onStatus={(status) => patchStatus(record.id, status)}
              />
            ))
          )}
        </div>

        <RecordDetail
          record={selected}
          onStatus={(status) => selected && patchStatus(selected.id, status)}
          onNotes={(notes) => selected && patchNotes(selected.id, notes)}
          onDelete={() => selected && removeRecord(selected.id)}
        />
      </div>

      <footer className="mt-12 border-t border-[var(--line)] pt-6 text-sm text-[var(--ink-soft)]">
        Локальный анализатор работает без ключей. Опционально — бесплатный Groq API для
        более точных конспектов. Данные хранятся в браузере.
      </footer>

      <SettingsModal
        open={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onChange={setSettings}
      />

      {toast && (
        <div
          className="animate-rise fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm text-[#f3efe6] shadow-lg"
          role="status"
        >
          {toast}
        </div>
      )}
    </main>
  );
}
