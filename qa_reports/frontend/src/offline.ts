import type { Institution, OfflineReport, Question } from './types'

const OFFLINE_REPORTS_KEY = 'offline_reports'
const CACHE_INSTITUTIONS_KEY = 'cache_institutions'
const CACHE_QUESTIONS_KEY = 'cache_questions'

export function generateUuid(): string {
  return crypto.randomUUID()
}

export function getOfflineReports(): OfflineReport[] {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_REPORTS_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveOfflineReport(report: OfflineReport) {
  const reports = getOfflineReports()
  const idx = reports.findIndex((r) => r.client_uuid === report.client_uuid)
  if (idx >= 0) reports[idx] = report
  else reports.push(report)
  localStorage.setItem(OFFLINE_REPORTS_KEY, JSON.stringify(reports))
}

export function markOfflineSynced(uuid: string) {
  const reports = getOfflineReports().map((r) =>
    r.client_uuid === uuid ? { ...r, synced: true } : r,
  )
  localStorage.setItem(OFFLINE_REPORTS_KEY, JSON.stringify(reports))
}

export function removeOfflineReport(uuid: string) {
  const reports = getOfflineReports().filter((r) => r.client_uuid !== uuid)
  localStorage.setItem(OFFLINE_REPORTS_KEY, JSON.stringify(reports))
}

export function cacheInstitutions(institutions: Institution[]) {
  localStorage.setItem(CACHE_INSTITUTIONS_KEY, JSON.stringify(institutions))
}

export function getCachedInstitutions(): Institution[] {
  try {
    return JSON.parse(localStorage.getItem(CACHE_INSTITUTIONS_KEY) || '[]')
  } catch {
    return []
  }
}

export function cacheQuestions(questions: Question[]) {
  localStorage.setItem(CACHE_QUESTIONS_KEY, JSON.stringify(questions))
}

export function getCachedQuestions(): Question[] {
  try {
    return JSON.parse(localStorage.getItem(CACHE_QUESTIONS_KEY) || '[]')
  } catch {
    return []
  }
}

export async function isOnline(): Promise<boolean> {
  if (!navigator.onLine) return false
  try {
    const { Network } = await import('@capacitor/network')
    const status = await Network.getStatus()
    return status.connected
  } catch {
    return navigator.onLine
  }
}
