import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../api";

export default function Login() {
  const nav = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Вход — Сводные справки";
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.login(username, password);
      setToken(data.access_token);
      localStorage.setItem("spravka_user", JSON.stringify(data.user));
      nav("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="brand-mark">С</div>
        <h1>Сводные справки</h1>
        <p>Формы вопросов и ответов, справочники и итоговые документы по учреждениям.</p>
        <div className="field">
          <label>Логин</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label>Пароль</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        {error && <p className="error">{error}</p>}
        <button className="btn teal" style={{ width: "100%", marginTop: 16 }} disabled={loading}>
          {loading ? "Вход..." : "Войти"}
        </button>
        <div className="hint-box">
          Демо: <b>admin / admin123</b> — полный доступ; <b>operator / operator123</b> — заполнение справок.
          <div style={{ marginTop: 8 }}>
            <a href="/api/apk">Скачать приложение для Android (APK)</a>
          </div>
        </div>
      </form>
    </div>
  );
}
