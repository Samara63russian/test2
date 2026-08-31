export function formatDate(value: string, includeYear = true): string {
  if (!value) return '—'
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    ...(includeYear ? { year: 'numeric' } : {}),
  }).format(new Date(`${value.slice(0, 10)}T12:00:00`))
}

export function formatShortDate(value: string): string {
  if (!value) return '—'
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(`${value.slice(0, 10)}T12:00:00`))
}

export function todayIso(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

export function roleLabel(role: string): string {
  return { admin: 'Администратор', operator: 'Оператор', viewer: 'Наблюдатель' }[role] || role
}

export function answerLabel(value: unknown, type?: string): string {
  if (type === 'boolean') return value ? 'Да' : 'Нет'
  if (value === '' || value === null || value === undefined) return 'Не указано'
  return String(value)
}
