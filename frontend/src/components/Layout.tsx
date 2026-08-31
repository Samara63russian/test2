import {
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  ChevronDown,
  ClipboardList,
  FilePlus2,
  LogOut,
  Menu,
  Settings,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { Page, User } from '../types'

interface LayoutProps {
  children: ReactNode
  page: Page
  user: User
  online: boolean
  queueCount: number
  onNavigate: (page: Page) => void
  onLogout: () => void
  onSync: () => void
}

const navItems: Array<{ id: Page; label: string; icon: typeof Building2 }> = [
  { id: 'home', label: 'Главная', icon: Building2 },
  { id: 'form', label: 'Новая справка', icon: FilePlus2 },
  { id: 'directory', label: 'Справочник', icon: BookOpen },
  { id: 'analytics', label: 'Аналитика', icon: BarChart3 },
  { id: 'settings', label: 'Настройки', icon: Settings },
]

const roleNames = {
  admin: 'Администратор',
  operator: 'Оператор',
  viewer: 'Наблюдатель',
}

export function Layout({
  children,
  page,
  user,
  online,
  queueCount,
  onNavigate,
  onLogout,
  onSync,
}: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const visibleItems = navItems.filter(
    (item) => item.id !== 'settings' || user.role === 'admin',
  )

  const navigate = (target: Page) => {
    onNavigate(target)
    setMobileOpen(false)
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><ClipboardList size={23} /></div>
          <div>
            <strong>Сводка</strong>
            <span>Информационная система</span>
          </div>
          <button
            className="icon-button mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Закрыть меню"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="main-nav" aria-label="Основное меню">
          <span className="nav-caption">Рабочее пространство</span>
          {visibleItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={`nav-item ${page === item.id ? 'active' : ''}`}
                onClick={() => navigate(item.id)}
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{item.label}</span>
                {item.id === 'form' && queueCount > 0 && (
                  <span className="nav-badge">{queueCount}</span>
                )}
              </button>
            )
          })}
        </nav>
        <div className="sidebar-footer">
          <div className={`connection ${online ? 'online' : 'offline'}`}>
            {online ? <Wifi size={15} /> : <WifiOff size={15} />}
            <span>{online ? 'Подключено к серверу' : 'Офлайн-режим'}</span>
          </div>
          <button className="profile-card" type="button">
            <span className="avatar">{user.full_name.slice(0, 2).toUpperCase()}</span>
            <span className="profile-info">
              <strong>{user.full_name}</strong>
              <small>{roleNames[user.role]}</small>
            </span>
            <ChevronDown size={17} />
          </button>
          <button className="logout-link" onClick={onLogout}>
            <LogOut size={16} /> Выйти
          </button>
        </div>
      </aside>
      {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}
      <div className="workspace">
        <header className="topbar">
          <button
            className="icon-button menu-button"
            onClick={() => setMobileOpen(true)}
            aria-label="Открыть меню"
          >
            <Menu size={22} />
          </button>
          <div className="topbar-context">
            <span>Единая система оперативной отчётности</span>
          </div>
          <div className="topbar-actions">
            {queueCount > 0 && (
              <button
                className="sync-pill"
                onClick={onSync}
                disabled={!online}
                title={online ? 'Синхронизировать' : 'Будет отправлено после подключения'}
              >
                {online ? <Wifi size={15} /> : <WifiOff size={15} />}
                {queueCount} в очереди
              </button>
            )}
            <button className="icon-button notification-button" aria-label="Уведомления">
              <Bell size={20} />
              <span />
            </button>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  )
}
