const API_BASE = import.meta.env.VITE_API_URL || '/api'

let authToken: string | null = localStorage.getItem('token')

export function setToken(token: string | null) {
  authToken = token
  if (token) localStorage.setItem('token', token)
  else localStorage.removeItem('token')
}

export function getToken() {
  return authToken
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
  ...(options.headers as Record<string, string> || {}),
  }
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Ошибка запроса')
  }
  if (res.status === 204) return undefined as T
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json()
  return res as unknown as T
}

export const api = {
  login: (username: string, password: string) =>
    request<{ access_token: string }>('/auth/login-json', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  me: () => request<import('./types').User>('/auth/me'),

  getInstitutions: (activeOnly = false) =>
    request<import('./types').Institution[]>(`/institutions/?active_only=${activeOnly}`),

  createInstitution: (data: Partial<import('./types').Institution>) =>
    request<import('./types').Institution>('/institutions/', { method: 'POST', body: JSON.stringify(data) }),

  updateInstitution: (id: number, data: Partial<import('./types').Institution>) =>
    request<import('./types').Institution>(`/institutions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteInstitution: (id: number) =>
    request(`/institutions/${id}`, { method: 'DELETE' }),

  getUsers: () => request<import('./types').User[]>('/users/'),

  createUser: (data: { username: string; password: string; full_name?: string; role?: string }) =>
    request<import('./types').User>('/users/', { method: 'POST', body: JSON.stringify(data) }),

  updateUser: (id: number, data: Partial<import('./types').User & { password?: string }>) =>
    request<import('./types').User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteUser: (id: number) => request(`/users/${id}`, { method: 'DELETE' }),

  getQuestions: () => request<import('./types').Question[]>('/questions/'),

  createQuestion: (data: Partial<import('./types').Question> & { options?: { text: string }[] }) =>
    request<import('./types').Question>('/questions/', { method: 'POST', body: JSON.stringify(data) }),

  updateQuestion: (id: number, data: Partial<import('./types').Question>) =>
    request<import('./types').Question>(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteQuestion: (id: number) => request(`/questions/${id}`, { method: 'DELETE' }),

  getReference: () => request<import('./types').ReferenceItem[]>('/reference/'),

  getReferenceCategories: () => request<string[]>('/reference/categories'),

  createReference: (data: Partial<import('./types').ReferenceItem>) =>
    request<import('./types').ReferenceItem>('/reference/', { method: 'POST', body: JSON.stringify(data) }),

  updateReference: (id: number, data: Partial<import('./types').ReferenceItem>) =>
    request<import('./types').ReferenceItem>(`/reference/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteReference: (id: number) => request(`/reference/${id}`, { method: 'DELETE' }),

  getReports: (params?: { institution_id?: number; date_from?: string; date_to?: string }) => {
    const q = new URLSearchParams()
    if (params?.institution_id) q.set('institution_id', String(params.institution_id))
    if (params?.date_from) q.set('date_from', params.date_from)
    if (params?.date_to) q.set('date_to', params.date_to)
    return request<import('./types').Report[]>(`/reports/?${q}`)
  },

  getReport: (id: number) => request<import('./types').Report>(`/reports/${id}`),

  createReport: (data: Partial<import('./types').Report> & { answers: import('./types').ReportAnswer[]; client_uuid?: string }) =>
    request<import('./types').Report>('/reports/', { method: 'POST', body: JSON.stringify(data) }),

  updateReport: (id: number, data: Partial<import('./types').Report> & { answers?: import('./types').ReportAnswer[] }) =>
    request<import('./types').Report>(`/reports/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteReport: (id: number) => request(`/reports/${id}`, { method: 'DELETE' }),

  syncReports: (payloads: import('./types').OfflineReport[]) =>
    request<import('./types').Report[]>('/reports/sync', { method: 'POST', body: JSON.stringify(payloads) }),

  getAnalytics: () => request<import('./types').AnalyticsSummary>('/analytics/summary'),

  exportReport: async (id: number) => {
    const headers: Record<string, string> = {}
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`
    const res = await fetch(`${API_BASE}/reports/${id}/export`, { headers })
    if (!res.ok) throw new Error('Ошибка экспорта')
    return res.blob()
  },
}
