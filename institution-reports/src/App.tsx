import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { LoadingState } from './components/UI'
import { useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { DashboardPage } from './pages/Dashboard'
import { LoginPage } from './pages/Login'

const AnalyticsPage = lazy(() => import('./pages/Analytics').then((module) => ({ default: module.AnalyticsPage })))
const DirectoryPage = lazy(() => import('./pages/Directory').then((module) => ({ default: module.DirectoryPage })))
const ReportFormPage = lazy(() => import('./pages/ReportForm').then((module) => ({ default: module.ReportFormPage })))
const SettingsPage = lazy(() => import('./pages/Settings').then((module) => ({ default: module.SettingsPage })))

function ProtectedApp() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />

  return (
    <DataProvider>
      <Suspense fallback={<div className="page"><LoadingState /></div>}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="new" element={user.role === 'viewer' ? <Navigate to="/" replace /> : <ReportFormPage />} />
            <Route path="reports/:id/edit" element={user.role === 'viewer' ? <Navigate to="/" replace /> : <ReportFormPage />} />
            <Route path="directory" element={<DirectoryPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={user.role === 'admin' ? <SettingsPage /> : <Navigate to="/" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </DataProvider>
  )
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/*" element={<ProtectedApp />} />
    </Routes>
  )
}
