import { CheckCircle2, CircleAlert, ClipboardList, X } from 'lucide-react'
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { api, ApiError, auth, serverConfig } from './api'
import './App.css'
import { Layout } from './components/Layout'
import { offlineStorage } from './storage'
import { LoginPage } from './pages/LoginPage'
import type {
  Institution,
  KnowledgeArticle,
  Page,
  Question,
  ReportSummary,
  User,
} from './types'

const AnalyticsPage = lazy(() =>
  import('./pages/AnalyticsPage').then((module) => ({ default: module.AnalyticsPage })),
)
const DirectoryPage = lazy(() =>
  import('./pages/DirectoryPage').then((module) => ({ default: module.DirectoryPage })),
)
const FormPage = lazy(() =>
  import('./pages/FormPage').then((module) => ({ default: module.FormPage })),
)
const HomePage = lazy(() =>
  import('./pages/HomePage').then((module) => ({ default: module.HomePage })),
)
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((module) => ({ default: module.SettingsPage })),
)

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [booting, setBooting] = useState(true)
  const [page, setPage] = useState<Page>('home')
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [reports, setReports] = useState<ReportSummary[]>([])
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [reportsLoading, setReportsLoading] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)
  const [queueCount, setQueueCount] = useState(offlineStorage.getQueue().length)
  const [toast, setToast] = useState<{ message: string; kind: 'success' | 'error' } | null>(null)
  const toastTimer = useRef<number | null>(null)

  const notify = useCallback((message: string, kind: 'success' | 'error' = 'success') => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    setToast({ message, kind })
    toastTimer.current = window.setTimeout(() => setToast(null), 4500)
  }, [])

  const refreshReferences = useCallback(async () => {
    try {
      const [institutionData, questionData] = await Promise.all([
        api.institutions(),
        api.questions(),
      ])
      setInstitutions(institutionData)
      setQuestions(questionData)
      offlineStorage.cacheReferences(institutionData, questionData)
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 0) {
        setInstitutions(offlineStorage.getInstitutions())
        setQuestions(offlineStorage.getQuestions())
      } else {
        throw reason
      }
    }
  }, [])

  const refreshReports = useCallback(
    async (filters: { institution_id?: number; date_from?: string; date_to?: string } = {}) => {
      setReportsLoading(true)
      try {
        setReports(await api.reports(filters))
      } catch (reason) {
        if (!(reason instanceof ApiError && reason.status === 0)) {
          notify(reason instanceof Error ? reason.message : 'Не удалось загрузить справки', 'error')
        }
      } finally {
        setReportsLoading(false)
      }
    },
    [notify],
  )

  const syncQueue = useCallback(async () => {
    const queue = offlineStorage.getQueue()
    setQueueCount(queue.length)
    if (!navigator.onLine || !queue.length || !auth.getToken()) return
    try {
      const syncPayload = queue.map((item) => ({
        institution_id: item.institution_id,
        report_date: item.report_date,
        status: item.status,
        comment: item.comment,
        answers: item.answers,
        client_id: item.client_id,
      }))
      const result = await api.sync(syncPayload)
      const syncedIds = result.results
        .filter((item) => item.status !== 'error' && item.client_id)
        .map((item) => item.client_id as string)
      offlineStorage.removeSynced(syncedIds)
      setQueueCount(offlineStorage.getQueue().length)
      if (result.synced) {
        notify(`Синхронизировано справок: ${result.synced}`)
        void refreshReports()
      }
      if (result.failed) notify(`Не отправлено справок: ${result.failed}`, 'error')
    } catch (reason) {
      if (!(reason instanceof ApiError && reason.status === 0)) {
        notify(reason instanceof Error ? reason.message : 'Ошибка синхронизации', 'error')
      }
    }
  }, [notify, refreshReports])

  useEffect(() => {
    const restoreSession = async () => {
      if (!auth.getToken()) {
        setBooting(false)
        return
      }
      try {
        const currentUser = await api.me()
        auth.setUser(currentUser)
        setUser(currentUser)
      } catch (reason) {
        if (reason instanceof ApiError && reason.status === 0 && auth.getUser()) {
          setUser(auth.getUser())
        } else {
          auth.clear()
        }
      } finally {
        setBooting(false)
      }
    }
    void restoreSession()
  }, [])

  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        await refreshReferences()
        const [reportResult, knowledgeResult] = await Promise.allSettled([
          api.reports(
            user.role === 'operator' && user.institution_id
              ? { institution_id: user.institution_id }
              : {},
          ),
          api.knowledge(),
        ])
        if (reportResult.status === 'fulfilled') setReports(reportResult.value)
        if (knowledgeResult.status === 'fulfilled') setArticles(knowledgeResult.value)
      } catch (reason) {
        notify(reason instanceof Error ? reason.message : 'Не удалось загрузить данные', 'error')
      }
      void syncQueue()
    }
    void load()
  }, [notify, refreshReferences, syncQueue, user])

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true)
      void syncQueue()
    }
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [syncQueue])

  const login = async (username: string, password: string, serverUrl: string) => {
    serverConfig.setUrl(serverUrl)
    const result = await api.login(username, password)
    auth.setToken(result.token)
    auth.setUser(result.user)
    setUser(result.user)
    setPage('home')
  }

  const logout = async () => {
    try {
      if (online) await api.logout()
    } catch {
      // Local logout must still work if the server is unavailable.
    }
    auth.clear()
    setUser(null)
    setPage('home')
  }

  const handleSaved = (queued: boolean) => {
    setQueueCount(offlineStorage.getQueue().length)
    setPage('home')
    if (!queued) void refreshReports()
  }

  if (booting) {
    return (
      <div className="splash-screen">
        <span><ClipboardList size={28} /></span>
        <strong>Сводка</strong>
        <div className="splash-loader" />
      </div>
    )
  }

  if (!user) return <LoginPage onLogin={login} />

  let content
  if (page === 'form') {
    content = (
      <FormPage
        user={user}
        institutions={institutions}
        questions={questions}
        online={online}
        onBack={() => setPage('home')}
        onSaved={handleSaved}
        notify={notify}
      />
    )
  } else if (page === 'directory') {
    content = <DirectoryPage articles={articles} />
  } else if (page === 'analytics') {
    content = <AnalyticsPage institutions={institutions} user={user} notify={notify} />
  } else if (page === 'settings' && user.role === 'admin') {
    content = (
      <SettingsPage notify={notify} onReferencesChanged={() => void refreshReferences()} />
    )
  } else {
    content = (
      <HomePage
        user={user}
        institutions={institutions}
        reports={reports}
        loading={reportsLoading}
        onOpenForm={() => setPage('form')}
        onFilter={(filters) => void refreshReports(filters)}
        notify={notify}
      />
    )
  }

  return (
    <Layout
      page={page}
      user={user}
      online={online}
      queueCount={queueCount}
      onNavigate={setPage}
      onLogout={() => void logout()}
      onSync={() => void syncQueue()}
    >
      <Suspense fallback={<div className="loading-row">Загрузка раздела…</div>}>
        {content}
      </Suspense>
      {toast && (
        <div className={`toast ${toast.kind}`}>
          {toast.kind === 'success' ? <CheckCircle2 size={19} /> : <CircleAlert size={19} />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)}><X size={16} /></button>
        </div>
      )}
    </Layout>
  )
}

export default App
