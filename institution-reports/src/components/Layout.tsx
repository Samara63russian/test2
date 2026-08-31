import { useCallback, useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  BarChart3,
  BookOpen,
  Building2,
  CloudOff,
  FilePlus2,
  Home,
  LogOut,
  Menu,
  RefreshCw,
  Settings,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getQueueCount, syncQueuedReports } from '../lib/offline'

const navigation = [
  { to: '/', label: 'Главная', icon: Home, end: true },
  { to: '/new', label: 'Заполнить форму', icon: FilePlus2 },
  { to: '/directory', label: 'Справочник', icon: BookOpen },
  { to: '/analytics', label: 'Аналитика', icon: BarChart3 },
]

const roleNames = {
  admin: 'Администратор',
  editor: 'Специалист',
  viewer: 'Наблюдатель',
}

export function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)
  const [pending, setPending] = useState(() => (user ? getQueueCount(user.id) : 0))
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')

  const updatePending = useCallback(() => {
    if (user) setPending(getQueueCount(user.id))
  }, [user])

  const syncNow = useCallback(async () => {
    if (!user || !navigator.onLine || getQueueCount(user.id) === 0 || syncing) return
    setSyncing(true)
    try {
      const result = await syncQueuedReports(user.id)
      updatePending()
      if (result.synced) {
        setSyncMessage(`Синхронизировано: ${result.synced}`)
        window.dispatchEvent(new CustomEvent('reports-synced'))
        window.setTimeout(() => setSyncMessage(''), 3000)
      }
    } catch {
      setSyncMessage('Синхронизация будет повторена позже')
      window.setTimeout(() => setSyncMessage(''), 4000)
    } finally {
      setSyncing(false)
    }
  }, [user, syncing, updatePending])

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true)
      void syncNow()
    }
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('offline-queue-change', updatePending)
    void syncNow()
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('offline-queue-change', updatePending)
    }
  }, [syncNow, updatePending])

  useEffect(() => setMenuOpen(false), [location.pathname])

  if (!user) return null

  return (
    <div className="app-shell">
      <header className="mobile-header">
        <button className="icon-button" onClick={() => setMenuOpen(true)} aria-label="Открыть меню">
          <Menu size={22} />
        </button>
        <div className="mobile-brand">
          <span className="brand-mark"><Building2 size={18} /></span>
          <strong>Форма Сводки</strong>
        </div>
        <span className={`connection-dot ${online ? 'online' : ''}`} title={online ? 'В сети' : 'Нет сети'} />
      </header>

      {menuOpen && <button className="sidebar-overlay" onClick={() => setMenuOpen(false)} aria-label="Закрыть меню" />}
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand">
          <span className="brand-mark"><Building2 size={24} /></span>
          <div>
            <strong>Форма Сводки</strong>
            <small>Мониторинг учреждений</small>
          </div>
          <button className="icon-button close-menu" onClick={() => setMenuOpen(false)} aria-label="Закрыть меню">
            <X size={20} />
          </button>
        </div>

        <nav className="main-nav" aria-label="Основная навигация">
          <span className="nav-heading">Рабочее пространство</span>
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
              {to === '/new' && pending > 0 && <span className="nav-badge">{pending}</span>}
            </NavLink>
          ))}
          {user.role === 'admin' && (
            <>
              <span className="nav-heading nav-heading-spaced">Администрирование</span>
              <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
                <Settings size={19} strokeWidth={1.8} />
                <span>Настройки</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className={`sync-card ${online ? '' : 'offline'}`} onClick={() => void syncNow()} disabled={!online || syncing || pending === 0}>
            <span className="sync-icon">
              {online ? <RefreshCw size={17} className={syncing ? 'spinning' : ''} /> : <CloudOff size={17} />}
            </span>
            <span>
              <strong>{online ? (pending ? `${pending} в очереди` : 'Все синхронизировано') : 'Работа без сети'}</strong>
              <small>{online ? (pending ? 'Нажмите для отправки' : 'Соединение установлено') : 'Данные сохранятся на устройстве'}</small>
            </span>
          </button>
          <div className="profile">
            <span className="avatar">{user.fullName.split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase()}</span>
            <span className="profile-text">
              <strong>{user.fullName}</strong>
              <small>{roleNames[user.role]}</small>
            </span>
            <button className="icon-button" onClick={logout} title="Выйти" aria-label="Выйти">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {!online && (
          <div className="offline-banner">
            <CloudOff size={16} />
            Нет подключения. Заполненные формы сохраняются на устройстве.
          </div>
        )}
        {syncMessage && <div className="toast">{syncMessage}</div>}
        <Outlet />
      </main>
    </div>
  )
}
