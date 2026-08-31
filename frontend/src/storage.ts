import type { Institution, PendingReport, Question, ReportPayload } from './types'

const DRAFT_KEY = 'svodka.form.draft'
const QUEUE_KEY = 'svodka.sync.queue'
const INSTITUTIONS_KEY = 'svodka.cache.institutions'
const QUESTIONS_KEY = 'svodka.cache.questions'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export const offlineStorage = {
  getDraft: () => read<ReportPayload | null>(DRAFT_KEY, null),
  saveDraft: (draft: ReportPayload) => write(DRAFT_KEY, draft),
  clearDraft: () => localStorage.removeItem(DRAFT_KEY),

  getQueue: () => read<PendingReport[]>(QUEUE_KEY, []),
  enqueue(payload: ReportPayload): PendingReport {
    const queued: PendingReport = {
      ...payload,
      client_id: payload.client_id || crypto.randomUUID(),
      queued_at: new Date().toISOString(),
    }
    const queue = [...this.getQueue(), queued]
    write(QUEUE_KEY, queue)
    return queued
  },
  removeSynced(clientIds: string[]) {
    const synced = new Set(clientIds)
    write(
      QUEUE_KEY,
      this.getQueue().filter((item) => !item.client_id || !synced.has(item.client_id)),
    )
  },

  cacheReferences(institutions: Institution[], questions: Question[]) {
    write(INSTITUTIONS_KEY, institutions)
    write(QUESTIONS_KEY, questions)
  },
  getInstitutions: () => read<Institution[]>(INSTITUTIONS_KEY, []),
  getQuestions: () => read<Question[]>(QUESTIONS_KEY, []),
}
