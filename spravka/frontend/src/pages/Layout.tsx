import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { setToken } from "../api";

function userFromStorage() {
  try {
    return JSON.parse(localStorage.getItem("spravka_user") || "null");
  } catch {
    return null;
  }
}

export default function Layout() {
  const nav = useNavigate();
  const user = userFromStorage();
  const isAdmin = user?.role === "admin";

  function logout() {
    setToken(null);
    localStorage.removeItem("spravka_user");
    nav("/login");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo">
          <div className="brand-mark">С</div>
          <div>
            <b>Сводные справки</b>
            <span>учёт по учреждениям</span>
          </div>
        </div>
        <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
          Главная
        </NavLink>
        <NavLink to="/directory" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
          Справочник
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
          Аналитика
        </NavLink>
        {isAdmin && (
          <NavLink to="/settings" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
            Настройки
          </NavLink>
        )}
        <div className="spacer" />
        <div className="user-box">
          <b>{user?.full_name || user?.username}</b>
          <div>{isAdmin ? "Администратор" : "Оператор"}</div>
          <button className="btn ghost" onClick={logout}>
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
