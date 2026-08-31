import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import { Layout } from "./Layout";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { DirectoryPage } from "./pages/DirectoryPage";
import { FormPage } from "./pages/FormPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { SettingsPage } from "./pages/SettingsPage";

function Protected({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="empty">Загрузка…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <Protected>
              <Layout />
            </Protected>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="form" element={<FormPage />} />
          <Route path="directory" element={<DirectoryPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route
            path="settings"
            element={
              <Protected adminOnly>
                <SettingsPage />
              </Protected>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
