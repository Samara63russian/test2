import type { EmailInput, RequestRecord } from "./types";

const STORAGE_KEY = "konspekt.records.v1";
const SETTINGS_KEY = "konspekt.settings.v1";

export interface AppSettings {
  groqKey: string;
  geminiKey: string;
  provider: "auto" | "local" | "groq" | "gemini";
}

export const defaultSettings: AppSettings = {
  groqKey: "",
  geminiKey: "",
  provider: "auto",
};

export function loadRecords(): RequestRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecords(records: RequestRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function createId(): string {
  return `rec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function emailToRecord(
  email: EmailInput,
  analysis: Omit<
    RequestRecord,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "from"
    | "subject"
    | "body"
    | "receivedAt"
    | "status"
    | "notes"
  >
): RequestRecord {
  const now = new Date().toISOString();
  return {
    id: createId(),
    createdAt: now,
    updatedAt: now,
    from: email.from,
    subject: email.subject,
    body: email.body,
    receivedAt: email.receivedAt || now,
    status: "new",
    notes: "",
    ...analysis,
  };
}
