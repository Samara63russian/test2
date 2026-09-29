"use client";

import type { InquiryRecord, InquiryStatus, InquiryType } from "@/lib/types";
import { STATUS_LABELS, TYPE_LABELS, URGENCY_LABELS } from "@/lib/types";

function typeTone(type: InquiryType): string {
  switch (type) {
    case "kp":
      return "bg-[rgba(15,107,92,0.12)] text-[var(--teal-deep)]";
    case "price_list":
      return "bg-[rgba(196,122,26,0.14)] text-[#7a4a0c]";
    case "inquiry":
      return "bg-[rgba(42,59,52,0.1)] text-[var(--ink-soft)]";
    default:
      return "bg-black/5 text-[var(--ink-soft)]";
  }
}

function urgencyTone(urgency: InquiryRecord["urgency"]): string {
  if (urgency === "high") return "text-[var(--danger)]";
  if (urgency === "medium") return "text-[var(--amber)]";
  return "text-[var(--ink-soft)]";
}

interface Props {
  record: InquiryRecord;
  selected: boolean;
  onSelect: () => void;
  onStatus: (status: InquiryStatus) => void;
}

export function RecordCard({ record, selected, onSelect, onStatus }: Props) {
  return (
    <article
      className={`cursor-pointer rounded-lg border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${
        selected
          ? "border-[var(--teal)] bg-white shadow-md"
          : "border-[var(--line)] bg-white/55"
      }`}
      onClick={onSelect}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className={`badge ${typeTone(record.type)}`}>
          {TYPE_LABELS[record.type]}
        </span>
        <span className={`text-xs font-medium ${urgencyTone(record.urgency)}`}>
          {URGENCY_LABELS[record.urgency]}
        </span>
        <span className="ml-auto text-[11px] text-[var(--ink-soft)]">
          {new Date(record.createdAt).toLocaleString("ru-RU", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <h3 className="mb-1 font-display text-lg leading-snug text-[var(--ink)]">
        {record.company}
      </h3>
      <p className="mb-2 line-clamp-1 text-sm text-[var(--ink-soft)]">
        {record.subject}
      </p>
      <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-[var(--ink)]">
        {record.summary}
      </p>

      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <select
          className="input-field !py-1.5 text-xs"
          value={record.status}
          onChange={(e) => onStatus(e.target.value as InquiryStatus)}
          aria-label="Статус записи"
        >
          {(Object.keys(STATUS_LABELS) as InquiryStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <span className="text-[10px] uppercase tracking-wider text-[var(--ink-soft)]">
          {record.aiProvider === "groq" ? "Groq" : "Локально"}
        </span>
      </div>
    </article>
  );
}
