import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '../lib/api'
import type { BootstrapData, Institution, Question, User } from '../types'
import { useAuth } from './AuthContext'

type DataContextValue = {
  institutions: Institution[]
  questions: Question[]
  users: User[]
  loading: boolean
  error: string
  refresh: () => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [data, setData] = useState<BootstrapData>({ institutions: [], questions: [], users: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      setData(await api<BootstrapData>('/bootstrap'))
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось загрузить данные')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) void refresh()
    else {
      setData({ institutions: [], questions: [], users: [] })
      setLoading(false)
    }
  }, [user, refresh])

  const value = useMemo(() => ({ ...data, loading, error, refresh }), [data, loading, error, refresh])
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used inside DataProvider')
  return context
}
