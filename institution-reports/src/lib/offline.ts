import { api } from './api'
import type { ReportPayload } from '../types'

const QUEUE_KEY = 'forma-svodki-offline-queue'

export type QueuedReport = {
  localId: string
  ownerId: string
  createdAt: string
  payload: ReportPayload
}

function readQueue(): QueuedReport[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]') as QueuedReport[]
  } catch {
    return []
  }
}

function writeQueue(queue: QueuedReport[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  window.dispatchEvent(new CustomEvent('offline-queue-change'))
}

export function queueReport(payload: ReportPayload, ownerId: string) {
  const localId = payload.clientId ?? crypto.randomUUID()
  const queue = readQueue()
  const report: QueuedReport = {
    localId,
    ownerId,
    createdAt: new Date().toISOString(),
    payload: { ...payload, clientId: localId },
  }
  const index = queue.findIndex((item) => item.localId === localId)
  if (index >= 0) queue[index] = report
  else queue.push(report)
  writeQueue(queue)
  return localId
}

export function getQueuedReports(ownerId: string) {
  return readQueue().filter((item) => item.ownerId === ownerId)
}

export function getQueueCount(ownerId: string) {
  return getQueuedReports(ownerId).length
}

export async function syncQueuedReports(ownerId: string) {
  const queue = readQueue()
  const owned = queue.filter((item) => item.ownerId === ownerId)
  if (!owned.length) return { synced: 0, failed: 0 }

  const response = await api<{
    results: Array<{ clientId?: string; success: boolean; message?: string }>
  }>('/sync', {
    method: 'POST',
    body: JSON.stringify({ reports: owned.map((item) => item.payload) }),
  })
  const succeeded = new Set(
    response.results.filter((item) => item.success).map((item) => item.clientId),
  )
  writeQueue(queue.filter((item) => item.ownerId !== ownerId || !succeeded.has(item.localId)))
  return {
    synced: succeeded.size,
    failed: response.results.length - succeeded.size,
  }
}
