import { useEffect, useState } from "react";
import {
  api,
  type Category,
  type DictionaryItem,
  type Institution,
  type Question,
  type User,
} from "../api";

type Tab = "questions" | "users" | "institutions" | "general";

const emptyInst: Partial<Institution> = {
  name: "",
  code: "",
  type_code: "school",
  district: "",
  address: "",
  phone: "",
  email: "",
  head_name: "",
  is_active: true,
};

export default function SettingsPage() {
  const user = JSON.parse(localStorage.getItem("spravka_user") || "{}");
  const [tab, setTab] = useState<Tab>("questions");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [dictionary, setDictionary] = useState<DictionaryItem[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});

  const [qModal, setQModal] = useState<Partial<Question> | null>(null);
  const [uModal, setUModal] = useState<Record<string, unknown> | null>(null);
  const [iModal, setIModal] = useState<Partial<Institution> | null>(null);
  const [catName, setCatName] = useState("");

  async function load() {
    setError("");
    try {
      const [cats, qs, us, inst, dict, st] = await Promise.all([
        api.categories(),
        api.questions(),
        api.users(),
        api.institutions(),
        api.dictionary(),
        api.settings(),
      ]);
      setCategories(cats);
      setQuestions(qs);
      setUsers(us);
      setInstitutions(inst);
      setDictionary(dict);
      setSettings(st);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Нет доступа к настройкам");
    }
  }

  useEffect(() => {
    if (user.role !== "admin") return;
    load();
  }, []);

  if (user.role !== "admin") {
    return <p className="error">Настройки доступны только администратору.</p>;
  }

  async function run(fn: () => Promise<unknown>, ok: string) {
    setError("");
    setInfo("");
    try {
      await fn();
      setInfo(ok);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    }
  }

  const types = dictionary.filter((d) => d.group_code === "institution_type");
  const districts = dictionary.filter((d) => d.group_code === "district");

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Настройки</h1>
          <p>Вопросы и ответы формы, пользователи, учреждения и реквизиты документа.</p>
        </div>
      </div>
      <div className="tabs">
        {(
          [
            ["questions", "Вопросы и ответы"],
            ["users", "Пользователи"],
            ["institutions", "Учреждения"],
            ["general", "Документ"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button key={key} className={`btn tab ${tab === key ? "on" : ""}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
      {info && <p className="muted">{info}</p>}

      {tab === "questions" && (
        <div>
          <div className="card pad" style={{ marginBottom: 14 }}>
            <div className="btn-row">
              <input placeholder="Новый раздел" value={catName} onChange={(e) => setCatName(e.target.value)} />
              <button
                className="btn"
                onClick={() =>
                  run(async () => {
                    if (!catName.trim()) throw new Error("Укажите название раздела");
                    await api.saveCategory({ name: catName.trim(), sort_order: categories.length + 1, is_active: true });
                    setCatName("");
                  }, "Раздел добавлен")
                }
              >
                Добавить раздел
              </button>
              <button className="btn teal" onClick={() => setQModal({ answer_type: "text", required: true, options: "", hint: "", sort_order: 0, is_active: true, category_id: categories[0]?.id })}>
                Новый вопрос
              </button>
            </div>
          </div>
          {categories.map((c) => (
            <div className="card pad q-block" key={c.id}>
              <div className="page-head" style={{ marginBottom: 8 }}>
                <h3 style={{ margin: 0 }}>{c.name}</h3>
                <button className="btn small danger" onClick={() => run(() => api.deleteCategory(c.id), "Раздел удалён")}>
                  Удалить раздел
                </button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Вопрос</th>
                    <th>Тип</th>
                    <th>Обяз.</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {questions
                    .filter((q) => q.category_id === c.id)
                    .map((q) => (
                      <tr key={q.id}>
                        <td>{q.text}</td>
                        <td>{q.answer_type}</td>
                        <td>{q.required ? "да" : "нет"}</td>
                        <td>
                          <div className="btn-row">
                            <button className="btn small ghost" onClick={() => setQModal(q)}>
                              Изменить
                            </button>
                            <button className="btn small danger" onClick={() => run(() => api.deleteQuestion(q.id), "Вопрос удалён")}>
                              Удалить
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div className="card table-wrap">
          <div className="pad">
            <button
              className="btn teal"
              onClick={() => setUModal({ username: "", password: "", full_name: "", role: "operator", institution_id: null, is_active: true })}
            >
              Новый пользователь
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Логин</th>
                <th>ФИО</th>
                <th>Роль</th>
                <th>Учреждение</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.full_name}</td>
                  <td>{u.role === "admin" ? "администратор" : "оператор"}</td>
                  <td>{institutions.find((i) => i.id === u.institution_id)?.name || "все"}</td>
                  <td>
                    <div className="btn-row">
                      <button className="btn small ghost" onClick={() => setUModal({ ...u, password: "" })}>
                        Изменить
                      </button>
                      <button className="btn small danger" onClick={() => run(() => api.deleteUser(u.id), "Пользователь удалён")}>
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "institutions" && (
        <div>
          <div className="card pad" style={{ marginBottom: 12 }}>
            <div className="page-head" style={{ marginBottom: 0 }}>
              <p className="muted" style={{ margin: 0 }}>
                Создание и удаление учреждений, которые доступны на главной и в мобильном приложении.
              </p>
              <button className="btn teal" onClick={() => setIModal({ ...emptyInst })}>
                Новое учреждение
              </button>
            </div>
          </div>
          <div className="card table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Код</th>
                  <th>Район</th>
                  <th>Руководитель</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {institutions.map((i) => (
                  <tr key={i.id}>
                    <td>{i.name}</td>
                    <td>{i.code}</td>
                    <td>{i.district}</td>
                    <td>{i.head_name}</td>
                    <td>
                      <div className="btn-row">
                        <button className="btn small ghost" onClick={() => setIModal(i)}>
                          Изменить
                        </button>
                        <button className="btn small danger" onClick={() => run(() => api.deleteInstitution(i.id), "Учреждение удалено")}>
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

      {tab === "general" && (
        <div className="card pad" style={{ maxWidth: 720 }}>
          {[
            ["org_header", "Шапка документа", true],
            ["org_name", "Название организации", false],
            ["org_city", "Город", false],
            ["document_title", "Заголовок документа", false],
            ["footer_text", "Подвал", false],
          ].map(([key, label, area]) => (
            <div className="field" key={key} style={{ marginBottom: 12 }}>
              <label>{label}</label>
              {area ? (
                <textarea value={settings[key] || ""} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} />
              ) : (
                <input value={settings[key] || ""} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} />
              )}
            </div>
          ))}
          <button
            className="btn teal"
            onClick={() =>
              run(
                () => api.saveSettings(Object.entries(settings).map(([key, value]) => ({ key, value }))),
                "Реквизиты сохранены"
              )
            }
          >
            Сохранить
          </button>
        </div>
      )}

      {qModal && (
        <div className="modal-back" onClick={() => setQModal(null)}>
          <form
            className="modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                await api.saveQuestion(qModal);
                setQModal(null);
              }, "Вопрос сохранён");
            }}
          >
            <h3>{qModal.id ? "Изменить вопрос" : "Новый вопрос"}</h3>
            <div className="field">
              <label>Раздел</label>
              <select value={qModal.category_id || ""} onChange={(e) => setQModal({ ...qModal, category_id: Number(e.target.value) })}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ marginTop: 8 }}>
              <label>Текст вопроса</label>
              <textarea value={qModal.text || ""} onChange={(e) => setQModal({ ...qModal, text: e.target.value })} />
            </div>
            <div className="grid-2" style={{ marginTop: 8 }}>
              <div className="field">
                <label>Тип ответа</label>
                <select value={qModal.answer_type} onChange={(e) => setQModal({ ...qModal, answer_type: e.target.value })}>
                  <option value="text">Строка</option>
                  <option value="textarea">Текст</option>
                  <option value="number">Число</option>
                  <option value="select">Список</option>
                  <option value="yesno">Да / Нет</option>
                  <option value="date">Дата</option>
                </select>
              </div>
              <div className="field">
                <label>Обязательный</label>
                <select
                  value={qModal.required ? "1" : "0"}
                  onChange={(e) => setQModal({ ...qModal, required: e.target.value === "1" })}
                >
                  <option value="1">Да</option>
                  <option value="0">Нет</option>
                </select>
              </div>
            </div>
            <div className="field" style={{ marginTop: 8 }}>
              <label>Варианты (каждый с новой строки, для списка)</label>
              <textarea value={qModal.options || ""} onChange={(e) => setQModal({ ...qModal, options: e.target.value })} />
            </div>
            <div className="btn-row" style={{ marginTop: 14 }}>
              <button className="btn teal">Сохранить</button>
              <button type="button" className="btn ghost" onClick={() => setQModal(null)}>
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {uModal && (
        <div className="modal-back" onClick={() => setUModal(null)}>
          <form
            className="modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                await api.saveUser(uModal);
                setUModal(null);
              }, "Пользователь сохранён");
            }}
          >
            <h3>{uModal.id ? "Изменить пользователя" : "Новый пользователь"}</h3>
            <div className="grid-2">
              <div className="field">
                <label>Логин</label>
                <input value={String(uModal.username || "")} onChange={(e) => setUModal({ ...uModal, username: e.target.value })} />
              </div>
              <div className="field">
                <label>Пароль {uModal.id ? "(пусто — не менять)" : ""}</label>
                <input value={String(uModal.password || "")} onChange={(e) => setUModal({ ...uModal, password: e.target.value })} />
              </div>
              <div className="field">
                <label>ФИО</label>
                <input value={String(uModal.full_name || "")} onChange={(e) => setUModal({ ...uModal, full_name: e.target.value })} />
              </div>
              <div className="field">
                <label>Роль</label>
                <select value={String(uModal.role)} onChange={(e) => setUModal({ ...uModal, role: e.target.value })}>
                  <option value="operator">Оператор</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
              <div className="field">
                <label>Учреждение</label>
                <select
                  value={uModal.institution_id == null ? "" : String(uModal.institution_id)}
                  onChange={(e) => setUModal({ ...uModal, institution_id: e.target.value ? Number(e.target.value) : null })}
                >
                  <option value="">Все учреждения</option>
                  {institutions.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="btn-row" style={{ marginTop: 14 }}>
              <button className="btn teal">Сохранить</button>
              <button type="button" className="btn ghost" onClick={() => setUModal(null)}>
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {iModal && (
        <div className="modal-back" onClick={() => setIModal(null)}>
          <form
            className="modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                await api.saveInstitution(iModal);
                setIModal(null);
              }, "Учреждение сохранено");
            }}
          >
            <h3>{iModal.id ? "Изменить учреждение" : "Новое учреждение"}</h3>
            <div className="grid-2">
              <div className="field">
                <label>Название</label>
                <input value={iModal.name || ""} onChange={(e) => setIModal({ ...iModal, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Код</label>
                <input value={iModal.code || ""} onChange={(e) => setIModal({ ...iModal, code: e.target.value })} />
              </div>
              <div className="field">
                <label>Тип</label>
                <select value={iModal.type_code || ""} onChange={(e) => setIModal({ ...iModal, type_code: e.target.value })}>
                  {types.map((t) => (
                    <option key={t.id} value={t.code}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Район</label>
                <select value={iModal.district || ""} onChange={(e) => setIModal({ ...iModal, district: e.target.value })}>
                  <option value="">—</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Адрес</label>
                <input value={iModal.address || ""} onChange={(e) => setIModal({ ...iModal, address: e.target.value })} />
              </div>
              <div className="field">
                <label>Телефон</label>
                <input value={iModal.phone || ""} onChange={(e) => setIModal({ ...iModal, phone: e.target.value })} />
              </div>
              <div className="field">
                <label>Руководитель</label>
                <input value={iModal.head_name || ""} onChange={(e) => setIModal({ ...iModal, head_name: e.target.value })} />
              </div>
              <div className="field">
                <label>Email</label>
                <input value={iModal.email || ""} onChange={(e) => setIModal({ ...iModal, email: e.target.value })} />
              </div>
            </div>
            <div className="btn-row" style={{ marginTop: 14 }}>
              <button className="btn teal">Сохранить</button>
              <button type="button" className="btn ghost" onClick={() => setIModal(null)}>
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
