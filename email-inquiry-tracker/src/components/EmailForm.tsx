"use client";

import { useRef, useState } from "react";
import { SAMPLE_EMAILS } from "@/lib/samples";
import type { EmailInput } from "@/lib/types";

interface Props {
  busy: boolean;
  onSubmit: (email: EmailInput) => Promise<void>;
}

function parseEmlOrText(raw: string, fileName: string): EmailInput {
  const fromMatch = raw.match(/^From:\s*(.+)$/im);
  const subjectMatch = raw.match(/^Subject:\s*(.+)$/im);
  const dateMatch = raw.match(/^Date:\s*(.+)$/im);

  let body = raw;
  const headerEnd = raw.search(/\r?\n\r?\n/);
  if (headerEnd >= 0 && (fromMatch || subjectMatch)) {
    body = raw.slice(headerEnd).trim();
  }

  return {
    from: fromMatch?.[1]?.trim() || `import@local (${fileName})`,
    subject: subjectMatch?.[1]?.trim() || fileName,
    body: body || raw,
    receivedAt: dateMatch?.[1] ? new Date(dateMatch[1]).toISOString() : new Date().toISOString(),
  };
}

export function EmailForm({ busy, onSubmit }: Props) {
  const [from, setFrom] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!from.trim() || !subject.trim() || !body.trim()) {
      setError("Заполните отправителя, тему и текст письма");
      return;
    }
    await onSubmit({
      from: from.trim(),
      subject: subject.trim(),
      body: body.trim(),
      receivedAt: new Date().toISOString(),
    });
    setFrom("");
    setSubject("");
    setBody("");
  }

  function loadSample(id: string) {
    const sample = SAMPLE_EMAILS.find((s) => s.id === id);
    if (!sample) return;
    setFrom(sample.from);
    setSubject(sample.subject);
    setBody(sample.body);
    setError(null);
  }

  async function onFile(file: File) {
    const text = await file.text();
    const parsed = parseEmlOrText(text, file.name);
    setFrom(parsed.from);
    setSubject(parsed.subject);
    setBody(parsed.body);
    setError(null);
  }

  return (
    <form onSubmit={handleSubmit} className="panel animate-rise-delay-1 rounded-2xl p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-[var(--ink)]">Новое письмо</h2>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            Вставьте письмо — ИИ определит тип запроса и создаст запись.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
          >
            Импорт .eml / .txt
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".eml,.txt,.msg,text/plain,message/rfc822"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {SAMPLE_EMAILS.map((s) => (
          <button
            key={s.id}
            type="button"
            className="rounded-full border border-[var(--line)] bg-white/50 px-3 py-1 text-xs text-[var(--ink-soft)] transition hover:border-[var(--teal)] hover:text-[var(--teal)]"
            onClick={() => loadSample(s.id)}
            disabled={busy}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mb-3 grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-[var(--ink-soft)]">
            От кого
          </span>
          <input
            className="input-field"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Имя <email@company.ru>"
            disabled={busy}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-[var(--ink-soft)]">
            Тема
          </span>
          <input
            className="input-field"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Запрос КП / прайс / вопрос"
            disabled={busy}
          />
        </label>
      </div>

      <label className="mb-4 block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-[var(--ink-soft)]">
          Текст письма
        </span>
        <textarea
          className="input-field min-h-[160px] resize-y"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Вставьте полный текст входящего письма…"
          disabled={busy}
        />
      </label>

      {error && (
        <p className="mb-3 text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={busy}>
        {busy ? (
          <span className="animate-pulse-soft">Анализируем…</span>
        ) : (
          "Создать запись с конспектом"
        )}
      </button>
    </form>
  );
}
