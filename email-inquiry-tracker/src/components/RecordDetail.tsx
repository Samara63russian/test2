"use client";

import type { InquiryRecord, InquiryStatus } from "@/lib/types";
import {
  STATUS_LABELS,
  TYPE_LABELS,
  URGENCY_LABELS,
} from "@/lib/types";

interface Props {
  record: InquiryRecord | null;
  onStatus: (status: InquiryStatus) => void;
  onNotes: (notes: string) => void;
  onDelete: () => void;
}

export function RecordDetail({ record, onStatus, onNotes, onDelete }: Props) {
  if (!record) {
    return (
      <div className="panel flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl p-8 text-center">
        <p className="font-display text-2xl text-[var(--ink)]">Выберите запись</p>
        <p className="mt-2 max-w-sm text-sm text-[var(--ink-soft)]">
          Здесь появится полный конспект письма, контакты и рекомендуемое действие.
        </p>
      </div>
    );
  }

  return (
    <div className="panel animate-stamp h-full rounded-2xl p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--teal)]">
            {TYPE_LABELS[record.type]}
          </p>
          <h2 className="font-display text-3xl leading-tight text-[var(--ink)]">
            {record.company}
          </h2>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">{record.subject}</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={onDelete}>
          Удалить
        </button>
      </div>

      <div className="mb-6 rounded-xl border border-[var(--line)] bg-[rgba(15,107,92,0.06)] p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--teal-deep)]">
          Конспект ИИ
        </p>
        <p className="text-[15px] leading-relaxed text-[var(--ink)]">{record.summary}</p>
      </div>

      <dl className="mb-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wider text-[var(--ink-soft)]">Контакт</dt>
          <dd className="mt-1 text-sm font-medium">{record.contactName}</dd>
          <dd className="text-sm text-[var(--teal)]">{record.contactEmail || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-[var(--ink-soft)]">От кого</dt>
          <dd className="mt-1 text-sm">{record.from}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-[var(--ink-soft)]">Срочность</dt>
          <dd className="mt-1 text-sm font-medium">{URGENCY_LABELS[record.urgency]}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-[var(--ink-soft)]">Статус</dt>
          <dd className="mt-1">
            <select
              className="input-field !py-1.5"
              value={record.status}
              onChange={(e) => onStatus(e.target.value as InquiryStatus)}
            >
              {(Object.keys(STATUS_LABELS) as InquiryStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </dd>
        </div>
      </dl>

      {record.products.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-xs uppercase tracking-wider text-[var(--ink-soft)]">
            Позиции / товары
          </p>
          <ul className="flex flex-wrap gap-2">
            {record.products.map((p) => (
              <li
                key={p}
                className="rounded-md border border-[var(--line)] bg-white/70 px-2.5 py-1 text-sm"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-6 rounded-xl border border-dashed border-[var(--amber)]/40 bg-[rgba(196,122,26,0.08)] p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#7a4a0c]">
          Рекомендуемое действие
        </p>
        <p className="text-sm leading-relaxed">{record.suggestedAction}</p>
      </div>

      <label className="mb-2 block text-xs uppercase tracking-wider text-[var(--ink-soft)]">
        Заметки менеджера
      </label>
      <textarea
        className="input-field min-h-[100px] resize-y"
        value={record.notes}
        onChange={(e) => onNotes(e.target.value)}
        placeholder="Добавьте комментарий к записи…"
      />

      <details className="mt-6">
        <summary className="cursor-pointer text-sm font-medium text-[var(--teal)]">
          Текст письма
        </summary>
        <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--ink)]/95 p-4 text-xs leading-relaxed text-[#e8efe9] scrollbar-thin">
          {record.body}
        </pre>
      </details>
    </div>
  );
}
