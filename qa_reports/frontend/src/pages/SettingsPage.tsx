import { useEffect, useState } from 'react'
import { api } from '../api'
import type { Institution, Question, ReferenceItem, User } from '../types'

type Tab = 'questions' | 'users' | 'institutions' | 'reference'

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('questions')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'questions', label: 'Вопросы' },
    { id: 'users', label: 'Пользователи' },
    { id: 'institutions', label: 'Учреждения' },
    { id: 'reference', label: 'Справочник' },
  ]

  return (
    <div>
      <h1 className="page-title">Настройки</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`btn ${tab === t.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'questions' && <QuestionsSettings />}
      {tab === 'users' && <UsersSettings />}
      {tab === 'institutions' && <InstitutionsSettings />}
      {tab === 'reference' && <ReferenceSettings />}
    </div>
  )
}

function QuestionsSettings() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [text, setText] = useState('')
  const [category, setCategory] = useState('Общие')
  const [qtype, setQtype] = useState('text')

  const load = () => api.getQuestions().then(setQuestions).catch(console.error)
  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    if (!text.trim()) return
    await api.createQuestion({ text, category, question_type: qtype, options: [] })
    setText('')
    load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить вопрос?')) return
    await api.deleteQuestion(id)
    load()
  }

  return (
    <div className="card">
      <h3>Добавить вопрос</h3>
      <div className="form-group">
        <label>Текст вопроса</label>
        <input value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Категория</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Тип</label>
          <select value={qtype} onChange={(e) => setQtype(e.target.value)}>
            <option value="text">Текст</option>
            <option value="textarea">Многострочный</option>
            <option value="number">Число</option>
            <option value="date">Дата</option>
            <option value="select">Выбор</option>
          </select>
        </div>
      </div>
      <button className="btn btn-primary" onClick={handleAdd}>Добавить</button>

      <table className="table" style={{ marginTop: '1.5rem' }}>
        <thead>
          <tr><th>Категория</th><th>Вопрос</th><th>Тип</th><th></th></tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q.id}>
              <td>{q.category}</td>
              <td>{q.text}</td>
              <td>{q.question_type}</td>
              <td><button className="btn btn-danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleDelete(q.id)}>Удалить</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function UsersSettings() {
  const [users, setUsers] = useState<User[]>([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('user')

  const load = () => api.getUsers().then(setUsers).catch(console.error)
  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    if (!username || !password) return
    await api.createUser({ username, password, full_name: fullName, role })
    setUsername(''); setPassword(''); setFullName('')
    load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить пользователя?')) return
    await api.deleteUser(id)
    load()
  }

  return (
    <div className="card">
      <h3>Новый пользователь</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div className="form-group"><label>Логин</label><input value={username} onChange={(e) => setUsername(e.target.value)} /></div>
        <div className="form-group"><label>Пароль</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <div className="form-group"><label>ФИО</label><input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
        <div className="form-group">
          <label>Роль</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">Пользователь</option>
            <option value="admin">Администратор</option>
          </select>
        </div>
      </div>
      <button className="btn btn-primary" onClick={handleAdd}>Создать</button>

      <table className="table" style={{ marginTop: '1.5rem' }}>
        <thead><tr><th>Логин</th><th>ФИО</th><th>Роль</th><th></th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.username}</td>
              <td>{u.full_name}</td>
              <td>{u.role === 'admin' ? 'Администратор' : 'Пользователь'}</td>
              <td><button className="btn btn-danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleDelete(u.id)}>Удалить</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function InstitutionsSettings() {
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [contact, setContact] = useState('')

  const load = () => api.getInstitutions().then(setInstitutions).catch(console.error)
  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    if (!name.trim()) return
    await api.createInstitution({ name, address, contact })
    setName(''); setAddress(''); setContact('')
    load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить учреждение?')) return
    await api.deleteInstitution(id)
    load()
  }

  return (
    <div className="card">
      <h3>Новое учреждение</h3>
      <div className="form-group"><label>Название</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="form-group"><label>Адрес</label><input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
      <div className="form-group"><label>Контакт</label><input value={contact} onChange={(e) => setContact(e.target.value)} /></div>
      <button className="btn btn-primary" onClick={handleAdd}>Добавить</button>

      <table className="table" style={{ marginTop: '1.5rem' }}>
        <thead><tr><th>Название</th><th>Адрес</th><th>Контакт</th><th></th></tr></thead>
        <tbody>
          {institutions.map((i) => (
            <tr key={i.id}>
              <td>{i.name}</td>
              <td>{i.address}</td>
              <td>{i.contact}</td>
              <td><button className="btn btn-danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleDelete(i.id)}>Удалить</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ReferenceSettings() {
  const [items, setItems] = useState<ReferenceItem[]>([])
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const load = () => api.getReference().then(setItems).catch(console.error)
  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    if (!title.trim()) return
    await api.createReference({ category: category || 'Общие', title, content })
    setTitle(''); setContent('')
    load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить запись?')) return
    await api.deleteReference(id)
    load()
  }

  return (
    <div className="card">
      <h3>Новая запись справочника</h3>
      <div className="form-group"><label>Категория</label><input value={category} onChange={(e) => setCategory(e.target.value)} /></div>
      <div className="form-group"><label>Название</label><input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
      <div className="form-group"><label>Содержание</label><textarea value={content} onChange={(e) => setContent(e.target.value)} /></div>
      <button className="btn btn-primary" onClick={handleAdd}>Добавить</button>

      <table className="table" style={{ marginTop: '1.5rem' }}>
        <thead><tr><th>Категория</th><th>Название</th><th></th></tr></thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td>{i.category}</td>
              <td>{i.title}</td>
              <td><button className="btn btn-danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleDelete(i.id)}>Удалить</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
