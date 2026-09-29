"use client";

import type { AppSettings } from "@/lib/storage";

interface Props {
  settings: AppSettings;
  open: boolean;
  onClose: () => void;
  onChange: (next: AppSettings) => void;
}

export function SettingsModal({ settings, open, onClose, onChange }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--ink)]/45 p-4 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Настройки ИИ"
    >
      <div
        className="panel animate-rise w-full max-w-lg rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl">Бесплатный ИИ</h2>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              По умолчанию работает локальный анализатор (без ключей). Для более точных
              конспектов подключите бесплатный ключ Groq.
            </p>
          </div>
          <button type="button" className="btn btn-secondary !px-3" onClick={onClose}>
            ✕
          </button>
        </div>

        <label className="mb-4 flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={settings.preferGroq}
            onChange={(e) => onChange({ ...settings, preferGroq: e.target.checked })}
          />
          Использовать Groq, если ключ задан
        </label>

        <label className="mb-2 block text-xs uppercase tracking-wider text-[var(--ink-soft)]">
          Groq API Key
        </label>
        <input
          className="input-field mb-3"
          type="password"
          autoComplete="off"
          value={settings.groqApiKey}
          onChange={(e) => onChange({ ...settings, groqApiKey: e.target.value })}
          placeholder="gsk_…"
        />
        <p className="mb-5 text-xs leading-relaxed text-[var(--ink-soft)]">
          Бесплатный ключ:{" "}
          <a
            className="text-[var(--teal)] underline"
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noreferrer"
          >
            console.groq.com/keys
          </a>
          . Ключ хранится только в вашем браузере и отправляется на сервер приложения при
          анализе.
        </p>

        <button type="button" className="btn btn-primary" onClick={onClose}>
          Готово
        </button>
      </div>
    </div>
  );
}
