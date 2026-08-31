import { Navigate, Route, Routes } from "react-router-dom";
import { getToken } from "./api";
import Layout from "./pages/Layout";
import Login from "./pages/Login";
import Home from "./pages/Home";
import FormPage from "./pages/FormPage";
import Directory from "./pages/Directory";
import AnalyticsPage from "./pages/Analytics";
import SettingsPage from "./pages/Settings";

function Private({ children }: { children: JSX.Element }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Private>
            <Layout />
          </Private>
        }
      >
        <Route index element={<Home />} />
        <Route path="reports/new" element={<FormPage />} />
        <Route path="reports/:id" element={<FormPage />} />
        <Route path="directory" element={<Directory />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
