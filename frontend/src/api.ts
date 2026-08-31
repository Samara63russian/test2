import type {
  AnalyticsData,
  Institution,
  KnowledgeArticle,
  Question,
  ReportDetail,
  ReportPayload,
  ReportSummary,
  User,
} from './types'

const API_BASE = import.meta.env.VITE_API_URL || '/api'
const TOKEN_KEY = 'svodka.auth.token'
const USER_KEY = 'svodka.auth.user'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export const auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  getUser: () => {
    try {
      const value = localStorage.getItem(USER_KEY)
      return value ? (JSON.parse(value) as User) : null
    } catch {
      return null
    }
  },
  setUser: (user: User) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  authenticated = true,
): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  const token = auth.getToken()
  if (authenticated && token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  } catch {
    throw new ApiError('Нет соединения с сервером', 0)
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const detail =
      typeof payload?.detail === 'string' ? payload.detail : 'Не удалось выполнить запрос'
    if (response.status === 401) auth.clear()
    throw new ApiError(detail, response.status)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const api = {
  login: (username: string, password: string) =>
    request<{ token: string; user: User }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ username, password }) },
      false,
    ),
  me: () => request<User>('/auth/me'),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),

  institutions: (includeInactive = false) =>
    request<Institution[]>(`/institutions?include_inactive=${includeInactive}`),
  createInstitution: (payload: Omit<Institution, 'id'>) =>
    request<Institution>('/institutions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateInstitution: (id: number, payload: Omit<Institution, 'id'>) =>
    request<Institution>(`/institutions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteInstitution: (id: number) =>
    request<{ result: string }>(`/institutions/${id}`, { method: 'DELETE' }),

  questions: (includeInactive = false) =>
    request<Question[]>(`/questions?include_inactive=${includeInactive}`),
  createQuestion: (payload: Omit<Question, 'id'>) =>
    request<Question>('/questions', { method: 'POST', body: JSON.stringify(payload) }),
  updateQuestion: (id: number, payload: Omit<Question, 'id'>) =>
    request<Question>(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteQuestion: (id: number) =>
    request<{ result: string }>(`/questions/${id}`, { method: 'DELETE' }),

  users: () => request<User[]>('/users'),
  createUser: (payload: Record<string, unknown>) =>
    request<User>('/users', { method: 'POST', body: JSON.stringify(payload) }),
  updateUser: (id: number, payload: Record<string, unknown>) =>
    request<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  reports: (filters: Record<string, string | number | undefined> = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, String(value))
    })
    return request<ReportSummary[]>(`/reports?${params}`)
  },
  report: (id: number) => request<ReportDetail>(`/reports/${id}`),
  createReport: (payload: ReportPayload) =>
    request<ReportDetail>('/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  sync: (reports: ReportPayload[]) =>
    request<{
      synced: number
      failed: number
      results: Array<{ client_id?: string; report_id?: number; status: string; message?: string }>
    }>('/sync', { method: 'POST', body: JSON.stringify({ reports }) }),
  analytics: (institutionId?: number, days = 30) =>
    request<AnalyticsData>(
      `/analytics?days=${days}${institutionId ? `&institution_id=${institutionId}` : ''}`,
    ),
  knowledge: () => request<KnowledgeArticle[]>('/knowledge'),

  async downloadDocument(id: number): Promise<void> {
    const headers = new Headers()
    const token = auth.getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
    const response = await fetch(`${API_BASE}/reports/${id}/document`, { headers })
    if (!response.ok) throw new ApiError('Не удалось сформировать документ', response.status)
    const blob = await response.blob()
    const disposition = response.headers.get('Content-Disposition') || ''
    const encodedName = disposition.match(/filename\*=UTF-8''([^;]+)/)?.[1]
    const filename = encodedName ? decodeURIComponent(encodedName) : `spravka-${id}.doc`
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  },
}
