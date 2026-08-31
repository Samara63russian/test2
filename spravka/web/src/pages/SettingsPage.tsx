import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api";
import type { Institution, Question, User } from "../types";

type Tab = "questions" | "users" | "institutions";

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>("questions");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [qText, setQText] = useState("");
  const [qType, setQType] = useState("text");
  const [qOptions, setQOptions] = useState("");
  const [qRequired, setQRequired] = useState(true);

  const [uName, setUName] = useState("");
  const [uFull, setUFull] = useState("");
  const [uPass, setUPass] = useState("");
  const [uRole, setURole] = useState<"admin" | "user">("user");

  const [iName, setIName] = useState("");
  const [iCode, setICode] = useState("");
  const [iAddress, setIAddress] = useState("");

  async function reload() {
    const [qs, us, inst] = await Promise.all([
      api.questions.list(true),
      api.users.list(),
      api.institutions.list(true),
    ]);
    setQuestions(qs);
    setUsers(us);
    setInstitutions(inst);
  }

  useEffect(() => {
    reload().catch((err) => setError(err instanceof Error ? err.message : "Ошибка"));
  }, []);

  async function createQuestion(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const options = qOptions
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean)
        .map((text, sort_order) => ({ text, sort_order }));
      await api.questions.create({
        text: qText,
        question_type: qType,
        required: qRequired,
        sort_order: questions.length + 1,
        options,
      });
      setQText("");
      setQOptions("");
      setMessage("Вопрос добавлен");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  async function createUser(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.users.create({
        username: uName,
        full_name: uFull,
        password: uPass,
        role: uRole,
        is_active: true,
      });
      setUName("");
      setUFull("");
      setUPass("");
      setMessage("Пользователь создан");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  async function createInstitution(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.institutions.create({
        name: iName,
        code: iCode,
        address: iAddress,
        is_active: true,
      });
      setIName("");
      setICode("");
      setIAddress("");
      setMessage("Учреждение создано");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>Настройки</h2>
          <p>Вопросы и ответы, пользователи, учреждения</p>
        </div>
      </div>

      <div className="panel">
        <div className="tabs">
          <button className={tab === "questions" ? "active" : ""} onClick={() => setTab("questions")}>
            Вопросы и ответы
          </button>
          <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>
            Пользователи
          </button>
          <button
            className={tab === "institutions" ? "active" : ""}
            onClick={() => setTab("institutions")}
          >
            Учреждения
          </button>
        </div>

        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}

        {tab === "questions" && (
          <div className="grid-2">
            <form className="stack" onSubmit={createQuestion}>
              <h3 style={{ margin: 0, fontFamily: "var(--font-display)" }}>Новый вопрос</h3>
              <div className="field">
                <label>Текст вопроса</label>
                <textarea rows={3} value={qText} onChange={(e) => setQText(e.target.value)} required />
              </div>
              <div className="field">
                <label>Тип</label>
                <select value={qType} onChange={(e) => setQType(e.target.value)}>
                  <option value="text">Текст</option>
                  <option value="number">Число</option>
                  <option value="date">Дата</option>
                  <option value="single">Один вариант</option>
                  <option value="multi">Несколько вариантов</option>
                  <option value="yesno">Да / Нет</option>
                </select>
              </div>
              <div className="field">
                <label>Варианты ответов (каждый с новой строки)</label>
                <textarea
                  rows={4}
                  value={qOptions}
                  onChange={(e) => setQOptions(e.target.value)}
                  placeholder="Вариант 1&#10;Вариант 2"
                />
              </div>
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={qRequired}
                  onChange={(e) => setQRequired(e.target.checked)}
                />
                Обязательный вопрос
              </label>
              <button className="btn">Добавить вопрос</button>
            </form>

            <div>
              {questions.map((q) => (
                <div className="question-block" key={q.id}>
                  <h4>{q.text}</h4>
                  <div className="help">
                    {q.question_type} · порядок {q.sort_order}
                    {q.is_active ? "" : " · выключен"}
                  </div>
                  {q.options.length > 0 && (
                    <ul>
                      {q.options.map((o) => (
                        <li key={o.id}>{o.text}</li>
                      ))}
                    </ul>
                  )}
                  <div className="row-actions">
                    <button
                      className="btn ghost"
                      onClick={() =>
                        void api.questions
                          .update(q.id, { is_active: !q.is_active })
                          .then(reload)
                      }
                    >
                      {q.is_active ? "Отключить" : "Включить"}
                    </button>
                    <button
                      className="btn danger"
                      onClick={() => void api.questions.remove(q.id).then(reload)}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "users" && (
          <div className="grid-2">
            <form className="stack" onSubmit={createUser}>
              <h3 style={{ margin: 0, fontFamily: "var(--font-display)" }}>Новый пользователь</h3>
              <div className="field">
                <label>Логин</label>
                <input value={uName} onChange={(e) => setUName(e.target.value)} required />
              </div>
              <div className="field">
                <label>ФИО</label>
                <input value={uFull} onChange={(e) => setUFull(e.target.value)} />
              </div>
              <div className="field">
                <label>Пароль</label>
                <input
                  type="password"
                  value={uPass}
                  onChange={(e) => setUPass(e.target.value)}
                  required
                  minLength={4}
                />
              </div>
              <div className="field">
                <label>Роль</label>
                <select value={uRole} onChange={(e) => setURole(e.target.value as "admin" | "user")}>
                  <option value="user">Пользователь</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
              <button className="btn">Создать</button>
            </form>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Логин</th>
                    <th>ФИО</th>
                    <th>Роль</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.username}</td>
                      <td>{u.full_name || "—"}</td>
                      <td>{u.role}</td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="btn ghost"
                            onClick={() => {
                              const password = prompt("Новый пароль (мин. 4 символа)");
                              if (!password) return;
                              void api.users.update(u.id, { password }).then(reload);
                            }}
                          >
                            Пароль
                          </button>
                          <button
                            className="btn ghost"
                            onClick={() =>
                              void api.users
                                .update(u.id, { is_active: !u.is_active })
                                .then(reload)
                            }
                          >
                            {u.is_active ? "Блок" : "Разблок"}
                          </button>
                          <button
                            className="btn danger"
                            onClick={() => void api.users.remove(u.id).then(reload)}
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "institutions" && (
          <div className="grid-2">
            <form className="stack" onSubmit={createInstitution}>
              <h3 style={{ margin: 0, fontFamily: "var(--font-display)" }}>Новое учреждение</h3>
              <div className="field">
                <label>Название</label>
                <input value={iName} onChange={(e) => setIName(e.target.value)} required />
              </div>
              <div className="field">
                <label>Код</label>
                <input value={iCode} onChange={(e) => setICode(e.target.value)} />
              </div>
              <div className="field">
                <label>Адрес</label>
                <input value={iAddress} onChange={(e) => setIAddress(e.target.value)} />
              </div>
              <button className="btn">Создать</button>
            </form>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Код</th>
                    <th>Название</th>
                    <th>Адрес</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {institutions.map((i) => (
                    <tr key={i.id}>
                      <td>{i.code || "—"}</td>
                      <td>
                        {i.name}
                        {!i.is_active && " (архив)"}
                      </td>
                      <td>{i.address || "—"}</td>
                      <td>
                        <button
                          className="btn danger"
                          onClick={() => void api.institutions.remove(i.id).then(reload)}
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
