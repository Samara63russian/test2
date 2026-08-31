import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { pendingOfflineCount } from "./offline";

export function Layout() {
  const { user, logout } = useAuth();
  const pending = pendingOfflineCount();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">СВ</div>
          <h1>Сводные справки</h1>
          <p>Учёт ответов учреждений и итоговые документы</p>
        </div>
        <nav className="nav">
          <NavLink to="/" end>
            Главная
          </NavLink>
          <NavLink to="/form">Заполнение</NavLink>
          <NavLink to="/directory">Справочник</NavLink>
          <NavLink to="/analytics">Аналитика</NavLink>
          {user?.role === "admin" && <NavLink to="/settings">Настройки</NavLink>}
        </nav>
        <div className="sidebar-footer">
          <div>
            <strong>{user?.full_name || user?.username}</strong>
            <div className="muted" style={{ color: "rgba(243,248,245,0.7)" }}>
              {user?.role === "admin" ? "Администратор" : "Пользователь"}
              {pending > 0 ? ` · офлайн: ${pending}` : ""}
            </div>
          </div>
          <button
            className="btn secondary"
            style={{ marginTop: 12, width: "100%", color: "#fff", borderColor: "rgba(255,255,255,0.25)" }}
            onClick={logout}
          >
            Выйти
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
