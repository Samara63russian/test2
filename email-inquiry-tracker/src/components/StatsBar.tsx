"use client";

import type { InquiryRecord } from "@/lib/types";

interface Props {
  records: InquiryRecord[];
}

export function StatsBar({ records }: Props) {
  const newCount = records.filter((r) => r.status === "new").length;
  const kp = records.filter((r) => r.type === "kp").length;
  const price = records.filter((r) => r.type === "price_list").length;
  const high = records.filter((r) => r.urgency === "high").length;

  const items = [
    { label: "Всего записей", value: records.length },
    { label: "Новые", value: newCount },
    { label: "Запросы КП", value: kp },
    { label: "Перечни", value: price },
    { label: "Срочные", value: high },
  ];

  return (
    <div className="animate-rise-delay-2 grid grid-cols-2 gap-3 sm:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-[var(--line)] bg-white/50 px-3 py-3 text-center"
        >
          <div className="font-display text-2xl text-[var(--teal-deep)]">{item.value}</div>
          <div className="mt-0.5 text-[11px] uppercase tracking-wider text-[var(--ink-soft)]">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
