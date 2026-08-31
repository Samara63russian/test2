import { BrowserRouter, Navigate, Route, Routes, NavLink, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import FormPage, { SyncButton } from './pages/FormPage'
import ReferencePage from './pages/ReferencePage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'
import './App.css'

function Layout() {
  const { user, logout, isAdmin } = useAuth()

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Сводные справки</h1>
        <nav className="nav">
          <NavLink to="/" end>Главная</NavLink>
          <NavLink to="/form">Новая справка</NavLink>
          <NavLink to="/reference">Справочник</NavLink>
          <NavLink to="/analytics">Аналитика</NavLink>
          {isAdmin && <NavLink to="/settings">Настройки</NavLink>}
        </nav>
        <div className="user-bar">
          <div>{user?.full_name || user?.username}</div>
          <button className="logout-btn" onClick={logout}>Выйти</button>
        </div>
      </aside>
      <main className="main">
        <SyncButton />
        <Outlet />
      </main>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding: '2rem' }}>Загрузка...</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<HomePage />} />
            <Route path="/form" element={<FormPage />} />
            <Route path="/form/:id" element={<FormPage />} />
            <Route path="/reference" element={<ReferencePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
