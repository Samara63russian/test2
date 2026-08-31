import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { getApiBase, setApiBase } from "../config";

export function LoginPage() {
  const { user, login, loading } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [apiBase, setApiBaseInput] = useState(getApiBase());
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (apiBase.trim()) setApiBase(apiBase.trim());
      await login(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card stack" onSubmit={onSubmit}>
        <div>
          <div className="brand-mark" style={{ background: "rgba(15,92,69,0.1)", color: "var(--brand)" }}>
            СВ
          </div>
          <h1 className="brand-name">Сводные справки</h1>
          <p className="subtitle">Вход в систему учёта вопросов и ответов учреждений</p>
        </div>
        {error && <div className="error">{error}</div>}
        <div className="field">
          <label htmlFor="apiBase">Адрес сервера (для Android / внешнего API)</label>
          <input
            id="apiBase"
            value={apiBase}
            onChange={(e) => setApiBaseInput(e.target.value)}
            placeholder="http://192.168.0.10:8000"
          />
        </div>
        <div className="field">
          <label htmlFor="username">Логин</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <button className="btn" disabled={busy}>
          {busy ? "Вход…" : "Войти"}
        </button>
        <p className="muted" style={{ fontSize: "0.85rem", margin: 0 }}>
          Демо: admin / admin123 или operator / operator123
        </p>
      </form>
    </div>
  );
}
