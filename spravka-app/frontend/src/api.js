const TOKEN_KEY = 'spravka_token'
const OFFLINE_KEY = 'spravka_offline_queue'
const DRAFT_KEY = 'spravka_local_drafts'
const API_BASE_KEY = 'spravka_api_base'

export function getApiBase() {
  const stored = localStorage.getItem(API_BASE_KEY)
  if (stored != null) return stored.replace(/\/$/, '')
  // Capacitor/Android: default empty until user sets server; web: same origin
  if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
    return localStorage.getItem(API_BASE_KEY) || ''
  }
  return ''
}

export function setApiBase(url) {
  localStorage.setItem(API_BASE_KEY, (url || '').replace(/\/$/, ''))
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  const isJsonBody =
    options.body &&
    !(options.body instanceof FormData) &&
    !(options.body instanceof URLSearchParams) &&
    typeof options.body === 'object'
  if (isJsonBody) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(options.body)
  }
  const base = getApiBase()
  const url = path.startsWith('http') ? path : `${base}${path}`
  const res = await fetch(url, { ...options, headers })
  if (res.status === 401) {
    clearToken()
    if (!path.includes('/auth/login')) {
      window.location.hash = '#/login'
    }
  }
  if (!res.ok) {
    let detail = 'Ошибка запроса'
    try {
      const data = await res.json()
      detail = data.detail || detail
    } catch {
      /* ignore */
    }
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail))
  }
  if (res.status === 204) return null
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json()
  return res
}

export const api = {
  login: (username, password) => {
    const body = new URLSearchParams()
    body.set('username', username)
    body.set('password', password)
    return request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
  },
  me: () => request('/api/auth/me'),
  institutions: () => request('/api/institutions'),
  createInstitution: (data) => request('/api/institutions', { method: 'POST', body: data }),
  updateInstitution: (id, data) => request(`/api/institutions/${id}`, { method: 'PUT', body: data }),
  deleteInstitution: (id) => request(`/api/institutions/${id}`, { method: 'DELETE' }),
  users: () => request('/api/users'),
  createUser: (data) => request('/api/users', { method: 'POST', body: data }),
  updateUser: (id, data) => request(`/api/users/${id}`, { method: 'PUT', body: data }),
  deleteUser: (id) => request(`/api/users/${id}`, { method: 'DELETE' }),
  questions: (activeOnly = false) =>
    request(`/api/questions${activeOnly ? '?active_only=true' : ''}`),
  createQuestion: (data) => request('/api/questions', { method: 'POST', body: data }),
  updateQuestion: (id, data) => request(`/api/questions/${id}`, { method: 'PUT', body: data }),
  deleteQuestion: (id) => request(`/api/questions/${id}`, { method: 'DELETE' }),
  reports: (params = {}) => {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.set(k, v)
    })
    const s = q.toString()
    return request(`/api/reports${s ? `?${s}` : ''}`)
  },
  getReport: (id) => request(`/api/reports/${id}`),
  createReport: (data) => request('/api/reports', { method: 'POST', body: data }),
  updateReport: (id, data) => request(`/api/reports/${id}`, { method: 'PUT', body: data }),
  deleteReport: (id) => request(`/api/reports/${id}`, { method: 'DELETE' }),
  syncReports: (reports) => request('/api/reports/sync', { method: 'POST', body: { reports } }),
  analytics: () => request('/api/analytics/summary'),
  downloadUrl: (id, format = 'docx') => `/api/reports/${id}/download?format=${format}`,
}

export function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID()
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function getOfflineQueue() {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveOfflineQueue(items) {
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(items))
}

export function enqueueOfflineReport(report) {
  const queue = getOfflineQueue()
  const idx = queue.findIndex((r) => r.client_uuid === report.client_uuid)
  if (idx >= 0) queue[idx] = report
  else queue.push(report)
  saveOfflineQueue(queue)
  return queue
}

export function getLocalDrafts() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveLocalDrafts(items) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(items))
}

export async function syncOfflineQueue() {
  if (!navigator.onLine) return { synced: 0, remaining: getOfflineQueue().length }
  const queue = getOfflineQueue()
  if (!queue.length) return { synced: 0, remaining: 0 }
  const result = await api.syncReports(queue)
  saveOfflineQueue([])
  return {
    synced: (result.created?.length || 0) + (result.updated?.length || 0),
    remaining: 0,
    result,
  }
}

export async function downloadReport(id, format = 'docx') {
  const token = getToken()
  const res = await fetch(`${getApiBase()}${api.downloadUrl(id, format)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error('Не удалось скачать документ')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `spravka_${id}.${format}`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
