import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { AnalyticsPage } from './pages/Analytics'
import { DashboardPage } from './pages/Dashboard'
import { DirectoryPage } from './pages/Directory'
import { LoginPage } from './pages/Login'
import { ReportFormPage } from './pages/ReportForm'
import { SettingsPage } from './pages/Settings'

function ProtectedApp() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />

  return (
    <DataProvider>
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
