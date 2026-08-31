import type { OfflineDraft } from "./types";

const QUEUE_KEY = "spravka_offline_queue";

export function loadOfflineQueue(): OfflineDraft[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveOfflineQueue(items: OfflineDraft[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export function upsertOfflineDraft(draft: OfflineDraft) {
  const items = loadOfflineQueue().filter((d) => d.client_uuid !== draft.client_uuid);
  items.unshift(draft);
  saveOfflineQueue(items);
}

export function removeOfflineDraft(clientUuid: string) {
  saveOfflineQueue(loadOfflineQueue().filter((d) => d.client_uuid !== clientUuid));
}

export function pendingOfflineCount() {
  return loadOfflineQueue().filter((d) => !d.synced).length;
}

export function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
