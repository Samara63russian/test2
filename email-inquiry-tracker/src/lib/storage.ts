import type { InquiryRecord, InquiryStatus } from "./types";

const STORAGE_KEY = "email-inquiry-tracker:records:v1";
const SETTINGS_KEY = "email-inquiry-tracker:settings:v1";

export interface AppSettings {
  groqApiKey: string;
  preferGroq: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  groqApiKey: "",
  preferGroq: true,
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function loadRecords(): InquiryRecord[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as InquiryRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecords(records: InquiryRecord[]): void {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function loadSettings(): AppSettings {
  if (!canUseStorage()) return { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as AppSettings) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings): void {
  if (!canUseStorage()) return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function updateRecordStatus(
  records: InquiryRecord[],
  id: string,
  status: InquiryStatus,
): InquiryRecord[] {
  return records.map((r) => (r.id === id ? { ...r, status } : r));
}

export function updateRecordNotes(
  records: InquiryRecord[],
  id: string,
  notes: string,
): InquiryRecord[] {
  return records.map((r) => (r.id === id ? { ...r, notes } : r));
}
