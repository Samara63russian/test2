import { useEffect, useState } from 'react'
import { Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import {
  api,
  clearToken,
  downloadReport,
  enqueueOfflineReport,
  getApiBase,
  getOfflineQueue,
  getToken,
  setApiBase,
  setToken,
  syncOfflineQueue,
  uuid,
} from './api'
import './styles.css'

function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    api
      .me()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  return { user, setUser, loading }
}

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [apiBase, setApiBaseState] = useState(getApiBase())
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const isNative = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      setApiBase(apiBase)
      const token = await api.login(username, password)
      setToken(token.access_token)
      const me = await api.me()
      onLogin(me)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card stack" onSubmit={submit}>
        <div className="brand-mark">Сводные справки</div>
        <h1>Вход в систему</h1>
        <p className="muted">Заполнение форм, справочник и выгрузка итоговых документов.</p>
        {error && <div className="alert">{error}</div>}
        {(isNative || apiBase !== undefined) && (
          <div className="field">
            <label>Адрес сервера (для Android / удалённый API)</label>
            <input
              placeholder="http://192.168.0.10:8000"
              value={apiBase}
              onChange={(e) => setApiBaseState(e.target.value)}
            />
          </div>
        )}
        <div className="field">
          <label>Логин</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
        </div>
        <div className="field">
          <label>Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <button className="btn accent" disabled={busy}>
          {busy ? 'Вход…' : 'Войти'}
        </button>
        <p className="muted" style={{ fontSize: '0.85rem' }}>
          Демо: admin / admin123 · operator / operator123
        </p>
      </form>
    </div>
  )
}

function Shell({ user, onLogout, children }) {
  const [online, setOnline] = useState(navigator.onLine)
  const [queueLen, setQueueLen] = useState(getOfflineQueue().length)
  const [syncMsg, setSyncMsg] = useState('')

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    const t = setInterval(() => setQueueLen(getOfflineQueue().length), 1500)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
      clearInterval(t)
    }
  }, [])

  async function doSync() {
    try {
      const res = await syncOfflineQueue()
      setQueueLen(getOfflineQueue().length)
      setSyncMsg(res.synced ? `Выгружено на сервер: ${res.synced}` : 'Очередь пуста')
    } catch (err) {
      setSyncMsg(err.message)
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          Сводные справки
          <span>{user.full_name || user.username}</span>
        </div>
        <nav className="nav">
          <NavLink to="/" end>
            Главная
          </NavLink>
          <NavLink to="/fill">Заполнить</NavLink>
          <NavLink to="/directory">Справочник</NavLink>
          <NavLink to="/analytics">Аналитика</NavLink>
          {user.role === 'admin' && <NavLink to="/settings">Настройки</NavLink>}
          <button className="linkish" onClick={doSync} title="Выгрузка офлайн-форм">
            <span className={`online-dot ${online ? '' : 'off'}`} />
            {online ? 'Онлайн' : 'Офлайн'}
            {queueLen ? ` · ${queueLen}` : ''}
          </button>
          <button className="linkish" onClick={onLogout}>
            Выход
          </button>
        </nav>
      </header>
      <main className="main">
        {syncMsg && (
          <div className="alert info" onClick={() => setSyncMsg('')}>
            {syncMsg}
          </div>
        )}
        {children}
      </main>
    </div>
  )
}

function HomePage() {
  const navigate = useNavigate()
  const [institutions, setInstitutions] = useState([])
  const [institutionId, setInstitutionId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [reports, setReports] = useState([])
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)

  async function load() {
    try {
      const [inst, reps] = await Promise.all([
        api.institutions(),
        api.reports({
          institution_id: institutionId || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        }),
      ])
      setInstitutions(inst)
      setReports(reps)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <>
      <section className="hero-home">
        <div className="eyebrow">Рабочий кабинет</div>
        <h1>Сводные справки</h1>
        <p>Выберите учреждение и период, просмотрите справки и скачайте итоговый документ.</p>
        <div className="split-actions" style={{ position: 'relative', zIndex: 1, marginTop: '0.5rem' }}>
          <button className="btn accent" onClick={() => navigate('/fill')}>
            Новая справка
          </button>
        </div>
      </section>

      <section className="panel" style={{ marginTop: '1rem' }}>
        <h2>Просмотр по датам</h2>
        {error && <div className="alert">{error}</div>}
        <div className="toolbar">
          <div className="field">
            <label>Учреждение</label>
            <select value={institutionId} onChange={(e) => setInstitutionId(e.target.value)}>
              <option value="">Все учреждения</option>
              {institutions.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>С даты</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="field">
            <label>По дату</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <button className="btn" onClick={load}>
            Показать
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Учреждение</th>
                <th>Название</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td>{r.report_date}</td>
                  <td>{r.institution_name}</td>
                  <td>{r.title}</td>
                  <td>
                    <span className={`badge ${r.status}`}>{r.status}</span>
                  </td>
                  <td>
                    <div className="split-actions">
                      <button className="btn ghost" onClick={() => setSelected(r)}>
                        Открыть
                      </button>
                      <button className="btn accent" onClick={() => downloadReport(r.id, 'docx')}>
                        DOCX
                      </button>
                      <button className="btn ghost" onClick={() => downloadReport(r.id, 'xlsx')}>
                        XLSX
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!reports.length && (
                <tr>
                  <td colSpan={5} className="empty">
                    Справки не найдены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal stack" onClick={(e) => e.stopPropagation()}>
            <h2>
              {selected.title} · {selected.report_date}
            </h2>
            <p className="muted">{selected.institution_name}</p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Вопрос</th>
                    <th>Ответ</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.answers.map((a) => (
                    <tr key={a.id}>
                      <td>{a.question_text}</td>
                      <td>{a.answer_text || a.text_value || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="split-actions">
              <button className="btn accent" onClick={() => downloadReport(selected.id, 'docx')}>
                Скачать документ
              </button>
              <button className="btn ghost" onClick={() => setSelected(null)}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function FillPage() {
  const [institutions, setInstitutions] = useState([])
  const [questions, setQuestions] = useState([])
  const [institutionId, setInstitutionId] = useState('')
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10))
  const [title, setTitle] = useState('Сводная справка')
  const [notes, setNotes] = useState('')
  const [answers, setAnswers] = useState({})
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    Promise.all([api.institutions(), api.questions(true)])
      .then(([inst, qs]) => {
        setInstitutions(inst)
        setQuestions(qs)
        if (inst[0]) setInstitutionId(String(inst[0].id))
      })
      .catch((err) => setError(err.message))
  }, [])

  function setAnswer(qid, patch) {
    setAnswers((prev) => ({ ...prev, [qid]: { ...(prev[qid] || {}), ...patch } }))
  }

  async function submit(asDraft = false) {
    setBusy(true)
    setError('')
    setMsg('')
    const payload = {
      institution_id: Number(institutionId),
      report_date: reportDate,
      title,
      notes,
      status: asDraft ? 'draft' : 'submitted',
      client_uuid: uuid(),
      answers: questions.map((q) => ({
        question_id: q.id,
        answer_option_id: answers[q.id]?.answer_option_id || null,
        text_value: answers[q.id]?.text_value || '',
      })),
    }

    try {
      if (!navigator.onLine) {
        enqueueOfflineReport(payload)
        setMsg('Нет сети: справка сохранена локально и будет выгружена при подключении.')
        return
      }
      const report = await api.createReport(payload)
      setMsg(`Справка №${report.id} сохранена на сервере.`)
      setAnswers({})
      setNotes('')
    } catch (err) {
      enqueueOfflineReport(payload)
      setMsg(`Сервер недоступен: сохранено офлайн. (${err.message})`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel">
      <h2>Заполнение формы</h2>
      <p className="muted">Быстрый ввод ответов. При отсутствии интернета данные копятся и выгружаются позже.</p>
      {error && <div className="alert">{error}</div>}
      {msg && <div className="alert ok">{msg}</div>}

      <div className="toolbar">
        <div className="field">
          <label>Учреждение</label>
          <select value={institutionId} onChange={(e) => setInstitutionId(e.target.value)}>
            {institutions.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Дата</label>
          <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
        </div>
        <div className="field">
          <label>Название</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
      </div>

      <div className="stack">
        {questions.map((q) => (
          <div className="qa-item" key={q.id}>
            <div className="cat">{q.category}</div>
            <strong>
              {q.text}
              {q.is_required ? ' *' : ''}
            </strong>
            {q.answer_type === 'choice' || q.answer_type === 'boolean' ? (
              <div className="choices">
                {q.answers
                  .filter((a) => a.is_active)
                  .map((a) => (
                    <button
                      type="button"
                      key={a.id}
                      className={`choice ${answers[q.id]?.answer_option_id === a.id ? 'selected' : ''}`}
                      onClick={() => setAnswer(q.id, { answer_option_id: a.id, text_value: '' })}
                    >
                      {a.text}
                    </button>
                  ))}
              </div>
            ) : (
              <input
                type={q.answer_type === 'number' ? 'number' : 'text'}
                placeholder="Введите ответ"
                value={answers[q.id]?.text_value || ''}
                onChange={(e) => setAnswer(q.id, { text_value: e.target.value, answer_option_id: null })}
              />
            )}
          </div>
        ))}
      </div>

      <div className="field" style={{ marginTop: '1rem' }}>
        <label>Примечания</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="split-actions" style={{ marginTop: '1rem' }}>
        <button className="btn accent" disabled={busy || !institutionId} onClick={() => submit(false)}>
          Сохранить и выгрузить
        </button>
        <button className="btn ghost" disabled={busy || !institutionId} onClick={() => submit(true)}>
          Черновик
        </button>
      </div>
    </section>
  )
}

function DirectoryPage() {
  const [institutions, setInstitutions] = useState([])
  const [questions, setQuestions] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.institutions(), api.questions(true)])
      .then(([i, q]) => {
        setInstitutions(i)
        setQuestions(q)
      })
      .catch((err) => setError(err.message))
  }, [])

  const byCategory = questions.reduce((acc, q) => {
    ;(acc[q.category] ||= []).push(q)
    return acc
  }, {})

  return (
    <div className="grid-2">
      <section className="panel">
        <h2>Справочник учреждений</h2>
        {error && <div className="alert">{error}</div>}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Название</th>
                <th>Код</th>
                <th>Адрес</th>
              </tr>
            </thead>
            <tbody>
              {institutions.map((i) => (
                <tr key={i.id}>
                  <td>{i.name}</td>
                  <td>{i.code}</td>
                  <td>{i.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel">
        <h2>Вопросы и ответы</h2>
        <div className="stack">
          {Object.entries(byCategory).map(([cat, qs]) => (
            <div key={cat}>
              <h3>{cat}</h3>
              {qs.map((q) => (
                <div className="qa-item" key={q.id} style={{ marginBottom: '0.6rem' }}>
                  <strong>{q.text}</strong>
                  {q.answers?.length > 0 && (
                    <div className="muted">{q.answers.map((a) => a.text).join(' · ')}</div>
                  )}
                  {!q.answers?.length && <div className="muted">Свободный ввод ({q.answer_type})</div>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .analytics()
      .then(setData)
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <div className="alert">{error}</div>
  if (!data) return <div className="panel">Загрузка аналитики…</div>

  const maxInst = Math.max(1, ...data.by_institution.map((x) => x.count))

  return (
    <>
      <div className="grid-3">
        <div className="stat">
          <span>Всего справок</span>
          <strong>{data.total_reports}</strong>
        </div>
        <div className="stat">
          <span>Отправлено</span>
          <strong>{data.submitted_reports}</strong>
        </div>
        <div className="stat">
          <span>Черновики</span>
          <strong>{data.draft_reports}</strong>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: '1rem' }}>
        <section className="panel">
          <h2>По учреждениям</h2>
          <div className="bar-list">
            {data.by_institution.map((row) => (
              <div className="bar-row" key={row.institution_id}>
                <div>{row.name}</div>
                <strong>{row.count}</strong>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(row.count / maxInst) * 100}%` }} />
                </div>
              </div>
            ))}
            {!data.by_institution.length && <div className="empty">Пока нет данных</div>}
          </div>
        </section>
        <section className="panel">
          <h2>По датам</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Справок</th>
                </tr>
              </thead>
              <tbody>
                {data.by_date.map((row) => (
                  <tr key={row.date}>
                    <td>{row.date}</td>
                    <td>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="panel" style={{ marginTop: '1rem' }}>
        <h2>Распределение ответов</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Вопрос</th>
                <th>Ответ</th>
                <th>Кол-во</th>
              </tr>
            </thead>
            <tbody>
              {data.answer_stats.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.question}</td>
                  <td>{row.answer}</td>
                  <td>{row.count}</td>
                </tr>
              ))}
              {!data.answer_stats.length && (
                <tr>
                  <td colSpan={3} className="empty">
                    Нет статистики ответов
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

function SettingsPage() {
  const [tab, setTab] = useState('questions')
  const [institutions, setInstitutions] = useState([])
  const [users, setUsers] = useState([])
  const [questions, setQuestions] = useState([])
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  const [instForm, setInstForm] = useState({ name: '', code: '', address: '' })
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'user',
    institution_ids: [],
  })
  const [qForm, setQForm] = useState({
    text: '',
    category: 'Общие',
    answer_type: 'choice',
    sort_order: 0,
    answersText: 'Да\nНет',
  })
  const [editUser, setEditUser] = useState(null)

  async function reload() {
    const [i, u, q] = await Promise.all([api.institutions(), api.users(), api.questions()])
    setInstitutions(i)
    setUsers(u)
    setQuestions(q)
  }

  useEffect(() => {
    reload().catch((err) => setError(err.message))
  }, [])

  async function createInstitution(e) {
    e.preventDefault()
    try {
      await api.createInstitution(instForm)
      setInstForm({ name: '', code: '', address: '' })
      setMsg('Учреждение создано')
      await reload()
    } catch (err) {
      setError(err.message)
    }
  }

  async function removeInstitution(id) {
    if (!confirm('Удалить учреждение?')) return
    try {
      await api.deleteInstitution(id)
      setMsg('Учреждение удалено')
      await reload()
    } catch (err) {
      setError(err.message)
    }
  }

  async function createUser(e) {
    e.preventDefault()
    try {
      await api.createUser({
        ...userForm,
        institution_ids: userForm.institution_ids.map(Number),
      })
      setUserForm({ username: '', password: '', full_name: '', role: 'user', institution_ids: [] })
      setMsg('Пользователь создан')
      await reload()
    } catch (err) {
      setError(err.message)
    }
  }

  async function saveUserEdit(e) {
    e.preventDefault()
    try {
      await api.updateUser(editUser.id, {
        full_name: editUser.full_name,
        role: editUser.role,
        is_active: editUser.is_active,
        password: editUser.password || undefined,
        institution_ids: editUser.institution_ids.map(Number),
      })
      setEditUser(null)
      setMsg('Пользователь обновлён')
      await reload()
    } catch (err) {
      setError(err.message)
    }
  }

  async function createQuestion(e) {
    e.preventDefault()
    try {
      const answers =
        qForm.answer_type === 'choice' || qForm.answer_type === 'boolean'
          ? qForm.answersText
              .split('\n')
              .map((t) => t.trim())
              .filter(Boolean)
              .map((text, idx) => ({ text, value: text, sort_order: idx + 1 }))
          : []
      await api.createQuestion({
        text: qForm.text,
        category: qForm.category,
        answer_type: qForm.answer_type,
        sort_order: Number(qForm.sort_order) || 0,
        answers,
      })
      setQForm({ text: '', category: 'Общие', answer_type: 'choice', sort_order: 0, answersText: 'Да\nНет' })
      setMsg('Вопрос добавлен')
      await reload()
    } catch (err) {
      setError(err.message)
    }
  }

  async function removeQuestion(id) {
    if (!confirm('Удалить вопрос?')) return
    try {
      await api.deleteQuestion(id)
      setMsg('Вопрос удалён')
      await reload()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="panel">
      <h2>Настройки</h2>
      <p className="muted">Вопросы и ответы, пользователи, учреждения.</p>
      {error && <div className="alert">{error}</div>}
      {msg && <div className="alert ok">{msg}</div>}

      <div className="nav" style={{ marginBottom: '1rem' }}>
        <button className={`linkish ${tab === 'questions' ? 'active' : ''}`} onClick={() => setTab('questions')} style={{ color: 'inherit', background: tab === 'questions' ? 'rgba(12,59,46,0.1)' : 'transparent' }}>
          Вопросы и ответы
        </button>
        <button className={`linkish ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')} style={{ color: 'inherit', background: tab === 'users' ? 'rgba(12,59,46,0.1)' : 'transparent' }}>
          Пользователи
        </button>
        <button className={`linkish ${tab === 'institutions' ? 'active' : ''}`} onClick={() => setTab('institutions')} style={{ color: 'inherit', background: tab === 'institutions' ? 'rgba(12,59,46,0.1)' : 'transparent' }}>
          Учреждения
        </button>
      </div>

      {tab === 'institutions' && (
        <div className="grid-2">
          <form className="stack" onSubmit={createInstitution}>
            <h3>Новое учреждение</h3>
            <div className="field">
              <label>Название</label>
              <input required value={instForm.name} onChange={(e) => setInstForm({ ...instForm, name: e.target.value })} />
            </div>
            <div className="field">
              <label>Код</label>
              <input value={instForm.code} onChange={(e) => setInstForm({ ...instForm, code: e.target.value })} />
            </div>
            <div className="field">
              <label>Адрес</label>
              <input value={instForm.address} onChange={(e) => setInstForm({ ...instForm, address: e.target.value })} />
            </div>
            <button className="btn accent">Создать</button>
          </form>
          <div>
            <h3>Список</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Название</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {institutions.map((i) => (
                    <tr key={i.id}>
                      <td>
                        <strong>{i.name}</strong>
                        <div className="muted">
                          {i.code} {i.address}
                        </div>
                      </td>
                      <td>
                        <button className="btn danger" onClick={() => removeInstitution(i.id)}>
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="grid-2">
          <form className="stack" onSubmit={createUser}>
            <h3>Новый пользователь</h3>
            <div className="field">
              <label>Логин</label>
              <input required value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} />
            </div>
            <div className="field">
              <label>Пароль</label>
              <input required type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
            </div>
            <div className="field">
              <label>ФИО</label>
              <input value={userForm.full_name} onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })} />
            </div>
            <div className="field">
              <label>Роль</label>
              <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <div className="field">
              <label>Учреждения</label>
              <select
                multiple
                value={userForm.institution_ids.map(String)}
                onChange={(e) =>
                  setUserForm({
                    ...userForm,
                    institution_ids: [...e.target.selectedOptions].map((o) => o.value),
                  })
                }
                style={{ minHeight: 110 }}
              >
                {institutions.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn accent">Создать</button>
          </form>
          <div>
            <h3>Список</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Пользователь</th>
                    <th>Роль</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.username}</strong>
                        <div className="muted">{u.full_name}</div>
                      </td>
                      <td>{u.role}</td>
                      <td>
                        <button className="btn ghost" onClick={() => setEditUser({ ...u, password: '' })}>
                          Изменить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'questions' && (
        <div className="grid-2">
          <form className="stack" onSubmit={createQuestion}>
            <h3>Новый вопрос</h3>
            <div className="field">
              <label>Текст вопроса</label>
              <textarea required value={qForm.text} onChange={(e) => setQForm({ ...qForm, text: e.target.value })} />
            </div>
            <div className="field">
              <label>Категория</label>
              <input value={qForm.category} onChange={(e) => setQForm({ ...qForm, category: e.target.value })} />
            </div>
            <div className="field">
              <label>Тип ответа</label>
              <select value={qForm.answer_type} onChange={(e) => setQForm({ ...qForm, answer_type: e.target.value })}>
                <option value="choice">Выбор из списка</option>
                <option value="text">Текст</option>
                <option value="number">Число</option>
                <option value="boolean">Да/Нет</option>
              </select>
            </div>
            <div className="field">
              <label>Порядок</label>
              <input type="number" value={qForm.sort_order} onChange={(e) => setQForm({ ...qForm, sort_order: e.target.value })} />
            </div>
            {(qForm.answer_type === 'choice' || qForm.answer_type === 'boolean') && (
              <div className="field">
                <label>Варианты ответов (по одному в строке)</label>
                <textarea value={qForm.answersText} onChange={(e) => setQForm({ ...qForm, answersText: e.target.value })} />
              </div>
            )}
            <button className="btn accent">Добавить вопрос</button>
          </form>
          <div>
            <h3>Список вопросов</h3>
            <div className="stack">
              {questions.map((q) => (
                <div className="qa-item" key={q.id}>
                  <div className="cat">
                    {q.category} · {q.answer_type}
                  </div>
                  <strong>{q.text}</strong>
                  {q.answers?.length > 0 && <div className="muted">{q.answers.map((a) => a.text).join(' · ')}</div>}
                  <button className="btn danger" onClick={() => removeQuestion(q.id)}>
                    Удалить
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {editUser && (
        <div className="modal-backdrop" onClick={() => setEditUser(null)}>
          <form className="modal stack" onClick={(e) => e.stopPropagation()} onSubmit={saveUserEdit}>
            <h3>Редактирование: {editUser.username}</h3>
            <div className="field">
              <label>ФИО</label>
              <input value={editUser.full_name} onChange={(e) => setEditUser({ ...editUser, full_name: e.target.value })} />
            </div>
            <div className="field">
              <label>Новый пароль (необязательно)</label>
              <input type="password" value={editUser.password} onChange={(e) => setEditUser({ ...editUser, password: e.target.value })} />
            </div>
            <div className="field">
              <label>Роль</label>
              <select value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <div className="field">
              <label>Учреждения</label>
              <select
                multiple
                value={editUser.institution_ids.map(String)}
                onChange={(e) =>
                  setEditUser({
                    ...editUser,
                    institution_ids: [...e.target.selectedOptions].map((o) => o.value),
                  })
                }
                style={{ minHeight: 110 }}
              >
                {institutions.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="split-actions">
              <button className="btn accent">Сохранить</button>
              <button type="button" className="btn ghost" onClick={() => setEditUser(null)}>
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}

export default function App() {
  const { user, setUser, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function autoSync() {
      if (!navigator.onLine || !getToken()) return
      try {
        await syncOfflineQueue()
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('online', autoSync)
    autoSync()
    return () => window.removeEventListener('online', autoSync)
  }, [])

  if (loading) {
    return (
      <div className="login-page">
        <div className="login-card">Загрузка…</div>
      </div>
    )
  }

  if (!user) {
    return (
      <LoginPage
        onLogin={(u) => {
          setUser(u)
          navigate('/')
        }}
      />
    )
  }

  function logout() {
    clearToken()
    setUser(null)
    navigate('/login')
  }

  return (
    <Shell user={user} onLogout={logout}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/fill" element={<FillPage />} />
        <Route path="/directory" element={<DirectoryPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route
          path="/settings"
          element={user.role === 'admin' ? <SettingsPage /> : <Navigate to="/" replace />}
        />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  )
}
