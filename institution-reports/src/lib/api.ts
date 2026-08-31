import { Capacitor } from '@capacitor/core'

const TOKEN_KEY = 'forma-svodki-token'
const SERVER_URL_KEY = 'forma-svodki-server-url'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function isNativeApp() {
  return Capacitor.isNativePlatform()
}

export function getServerUrl() {
  return localStorage.getItem(SERVER_URL_KEY) ?? ''
}

export function setServerUrl(url: string) {
  const normalized = url.trim().replace(/\/+$/, '')
  if (normalized) localStorage.setItem(SERVER_URL_KEY, normalized)
  else localStorage.removeItem(SERVER_URL_KEY)
}

function getApiBase() {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL
  const configured = getServerUrl()
  if (configured) return configured.endsWith('/api') ? configured : `${configured}/api`
  return isNativeApp() ? '' : '/api'
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const apiBase = getApiBase()
  if (!apiBase) throw new ApiError('Укажите адрес сервера перед входом', 0)
  const token = getToken()
  const headers = new Headers(options.headers)
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${apiBase}${path}`, { ...options, headers })
  } catch {
    throw new ApiError('Нет соединения с сервером', 0)
  }

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { message?: string }
    if (response.status === 401) window.dispatchEvent(new Event('auth-expired'))
    throw new ApiError(data.message ?? 'Не удалось выполнить запрос', response.status)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export async function downloadReport(reportId: string, date: string) {
  const apiBase = getApiBase()
  if (!apiBase) throw new ApiError('Адрес сервера не настроен', 0)
  const token = getToken()
  const response = await fetch(`${apiBase}/reports/${reportId}/export`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { message?: string }
    throw new ApiError(data.message ?? 'Не удалось скачать документ', response.status)
  }
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `Сводная-справка-${date}.docx`
  anchor.click()
  URL.revokeObjectURL(url)
}
