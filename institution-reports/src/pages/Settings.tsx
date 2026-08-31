import { useMemo, useState, type FormEvent } from 'react'
import {
  Building2,
  CircleHelp,
  KeyRound,
  MapPin,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react'
import { Modal, PageHeader } from '../components/UI'
import { useData } from '../context/DataContext'
import { api } from '../lib/api'
import type { Institution, Question, QuestionType, Role, User } from '../types'

type SettingsTab = 'questions' | 'users' | 'institutions'
type Editor =
  | { kind: 'institution'; value: Partial<Institution> }
  | { kind: 'question'; value: Partial<Question> & { optionsText?: string } }
  | { kind: 'user'; value: Partial<User> & { password?: string } }
  | null

const roleLabels: Record<Role, string> = { admin: 'Администратор', editor: 'Специалист', viewer: 'Наблюдатель' }
const typeLabels: Record<QuestionType, string> = { text: 'Короткий текст', textarea: 'Развёрнутый текст', number: 'Число', select: 'Выбор из списка', boolean: 'Да / нет' }

export function SettingsPage() {
  const { institutions, questions, users, refresh } = useData()
  const [tab, setTab] = useState<SettingsTab>('questions')
  const [editor, setEditor] = useState<Editor>(null)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const query = search.toLowerCase()
  const visibleQuestions = useMemo(() => questions.filter((item) => `${item.text} ${item.category}`.toLowerCase().includes(query)).sort((a, b) => a.position - b.position), [questions, query])
  const visibleUsers = useMemo(() => users.filter((item) => `${item.fullName} ${item.username}`.toLowerCase().includes(query)), [users, query])
  const visibleInstitutions = useMemo(() => institutions.filter((item) => `${item.name} ${item.shortName}`.toLowerCase().includes(query)), [institutions, query])

  function openNew() {
    setError('')
    if (tab === 'questions') {
      setEditor({ kind: 'question', value: { type: 'text', category: 'Основные показатели', required: false, active: true, position: questions.length + 1, optionsText: '' } })
    } else if (tab === 'users') {
      setEditor({ kind: 'user', value: { role: 'editor', active: true, institutionId: null, password: '' } })
    } else {
      setEditor({ kind: 'institution', value: { active: true } })
    }
  }

  function openEdit(item: Question | User | Institution, kind: 'question' | 'user' | 'institution') {
    setError('')
    if (kind === 'question') {
      const question = item as Question
      setEditor({ kind, value: { ...question, optionsText: question.options.join('\n') } })
    } else if (kind === 'user') {
      setEditor({ kind, value: { ...(item as User), password: '' } })
    } else {
      setEditor({ kind, value: item as Institution })
    }
  }

  async function saveEditor(event: FormEvent) {
    event.preventDefault()
    if (!editor) return
    setSaving(true)
    setError('')
    const path = editor.kind === 'question' ? 'questions' : editor.kind === 'user' ? 'users' : 'institutions'
    const id = editor.value.id
    let body: Record<string, unknown> = { ...editor.value }
    delete body.id
    if (editor.kind === 'question') {
      const value = editor.value
      body = {
        text: value.text,
        helpText: value.helpText ?? '',
        type: value.type,
        options: (value.optionsText ?? '').split('\n').map((item) => item.trim()).filter(Boolean),
        category: value.category,
        required: Boolean(value.required),
        position: Number(value.position),
        active: value.active !== false,
      }
    }
    if (editor.kind === 'user' && !editor.value.password) delete body.password

    try {
      await api(`/${path}${id ? `/${id}` : ''}`, {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(body),
      })
      await refresh()
      setEditor(null)
      setMessage(id ? 'Изменения сохранены' : 'Запись создана')
      window.setTimeout(() => setMessage(''), 3000)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  async function deactivate(id: string, kind: SettingsTab) {
    if (!window.confirm('Отключить эту запись? Существующие справки сохранятся.')) return
    setError('')
    const path = kind === 'questions' ? 'questions' : kind === 'users' ? 'users' : 'institutions'
    try {
      await api(`/${path}/${id}`, { method: 'DELETE' })
      await refresh()
      setMessage('Запись отключена')
      window.setTimeout(() => setMessage(''), 3000)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось отключить запись')
    }
  }

  return (
    <div className="page settings-page">
      <PageHeader
        eyebrow="Администрирование"
        title="Настройки"
        description="Управляйте структурой формы, пользователями и учреждениями"
        actions={<button className="button primary" onClick={openNew}><Plus size={18} /> Добавить</button>}
      />
      {message && <div className="toast fixed-toast">{message}</div>}
      {error && !editor && <div className="inline-alert danger">{error}</div>}

      <div className="settings-layout">
        <aside className="card settings-nav">
          <span className="nav-heading">Разделы</span>
          <button className={tab === 'questions' ? 'active' : ''} onClick={() => { setTab('questions'); setSearch('') }}><CircleHelp size={18} /><span><strong>Вопросы и ответы</strong><small>Структура отчётной формы</small></span><b>{questions.length}</b></button>
          <button className={tab === 'users' ? 'active' : ''} onClick={() => { setTab('users'); setSearch('') }}><Users size={18} /><span><strong>Пользователи</strong><small>Логины, роли и доступ</small></span><b>{users.length}</b></button>
          <button className={tab === 'institutions' ? 'active' : ''} onClick={() => { setTab('institutions'); setSearch('') }}><Building2 size={18} /><span><strong>Учреждения</strong><small>Справочник организаций</small></span><b>{institutions.length}</b></button>
        </aside>

        <section className="card settings-content">
          <div className="settings-toolbar">
            <div>
              <h2>{tab === 'questions' ? 'Вопросы формы' : tab === 'users' ? 'Пользователи системы' : 'Справочник учреждений'}</h2>
              <p>{tab === 'questions' ? 'Порядок и доступные варианты ответов' : tab === 'users' ? 'Учётные записи и права доступа' : 'Организации, предоставляющие сведения'}</p>
            </div>
            <label className="input-with-icon"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск…" /></label>
          </div>

          {tab === 'questions' && (
            <div className="settings-list question-settings-list">
              {visibleQuestions.map((question) => (
                <article className={!question.active ? 'inactive' : ''} key={question.id}>
                  <span className="order">{question.position}</span>
                  <div className="settings-item-main">
                    <span className="item-meta"><em>{question.category}</em><small>{typeLabels[question.type]}</small>{question.required && <small className="required-badge">Обязательный</small>}</span>
                    <h3>{question.text}</h3>
                    {question.options.length > 0 && <p>Варианты: {question.options.join(' · ')}</p>}
                  </div>
                  <div className="item-actions">
                    <button className="icon-button" onClick={() => openEdit(question, 'question')} title="Редактировать"><Pencil size={17} /></button>
                    {question.active && <button className="icon-button danger" onClick={() => void deactivate(question.id, 'questions')} title="Отключить"><Trash2 size={17} /></button>}
                  </div>
                </article>
              ))}
            </div>
          )}

          {tab === 'users' && (
            <div className="settings-list user-settings-list">
              {visibleUsers.map((item) => {
                const institution = institutions.find((candidate) => candidate.id === item.institutionId)
                return (
                  <article className={item.active === false ? 'inactive' : ''} key={item.id}>
                    <span className="settings-avatar"><UserRound size={19} /></span>
                    <div className="settings-item-main"><h3>{item.fullName}</h3><p>@{item.username} · {institution?.shortName ?? 'Все учреждения'}</p></div>
                    <span className={`role-badge ${item.role}`}>{roleLabels[item.role]}</span>
                    <div className="item-actions">
                      <button className="icon-button" onClick={() => openEdit(item, 'user')} title="Редактировать"><Pencil size={17} /></button>
                      {item.active !== false && <button className="icon-button danger" onClick={() => void deactivate(item.id, 'users')} title="Отключить"><Trash2 size={17} /></button>}
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {tab === 'institutions' && (
            <div className="settings-list institution-settings-list">
              {visibleInstitutions.map((institution) => (
                <article className={!institution.active ? 'inactive' : ''} key={institution.id}>
                  <span className="settings-avatar building"><Building2 size={19} /></span>
                  <div className="settings-item-main"><h3>{institution.shortName}</h3><p>{institution.name}</p><small><MapPin size={13} /> {institution.address || 'Адрес не указан'}</small></div>
                  <span className={`status ${institution.active ? 'success' : 'draft'}`}>{institution.active ? 'Активно' : 'Отключено'}</span>
                  <div className="item-actions">
                    <button className="icon-button" onClick={() => openEdit(institution, 'institution')} title="Редактировать"><Pencil size={17} /></button>
                    {institution.active && <button className="icon-button danger" onClick={() => void deactivate(institution.id, 'institutions')} title="Отключить"><Trash2 size={17} /></button>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <Modal
        open={Boolean(editor)}
        onClose={() => setEditor(null)}
        title={editor?.value.id ? 'Редактирование' : 'Новая запись'}
        subtitle={editor?.kind === 'question' ? 'Настройка вопроса формы' : editor?.kind === 'user' ? 'Данные и права пользователя' : 'Карточка учреждения'}
      >
        {editor && (
          <form className="editor-form" onSubmit={saveEditor}>
            {error && <div className="form-alert">{error}</div>}
            {editor.kind === 'institution' && (
              <>
                <label className="field"><span>Полное наименование *</span><input required value={editor.value.name ?? ''} onChange={(event) => setEditor({ ...editor, value: { ...editor.value, name: event.target.value } })} placeholder="ГБУ «Наименование учреждения»" /></label>
                <label className="field"><span>Краткое наименование *</span><input required value={editor.value.shortName ?? ''} onChange={(event) => setEditor({ ...editor, value: { ...editor.value, shortName: event.target.value } })} placeholder="Краткое название" /></label>
                <label className="field"><span>Адрес</span><span className="input-with-icon"><MapPin size={17} /><input value={editor.value.address ?? ''} onChange={(event) => setEditor({ ...editor, value: { ...editor.value, address: event.target.value } })} placeholder="Город, улица, дом" /></span></label>
              </>
            )}
            {editor.kind === 'question' && (
              <>
                <label className="field"><span>Текст вопроса *</span><textarea required rows={3} value={editor.value.text ?? ''} onChange={(event) => setEditor({ ...editor, value: { ...editor.value, text: event.target.value } })} /></label>
                <div className="form-grid two">
                  <label className="field"><span>Раздел *</span><input required value={editor.value.category ?? ''} onChange={(event) => setEditor({ ...editor, value: { ...editor.value, category: event.target.value } })} /></label>
                  <label className="field"><span>Тип ответа *</span><select value={editor.value.type} onChange={(event) => setEditor({ ...editor, value: { ...editor.value, type: event.target.value as QuestionType } })}>{Object.entries(typeLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                </div>
                <label className="field"><span>Подсказка</span><input value={editor.value.helpText ?? ''} onChange={(event) => setEditor({ ...editor, value: { ...editor.value, helpText: event.target.value } })} placeholder="Пояснение для сотрудника" /></label>
                {editor.value.type === 'select' && <label className="field"><span>Варианты ответа (каждый с новой строки)</span><textarea rows={4} value={editor.value.optionsText ?? ''} onChange={(event) => setEditor({ ...editor, value: { ...editor.value, optionsText: event.target.value } })} /></label>}
                <div className="form-grid two">
                  <label className="field"><span>Порядок</span><input type="number" min="0" value={editor.value.position ?? 0} onChange={(event) => setEditor({ ...editor, value: { ...editor.value, position: Number(event.target.value) } })} /></label>
                  <label className="toggle-field"><input type="checkbox" checked={Boolean(editor.value.required)} onChange={(event) => setEditor({ ...editor, value: { ...editor.value, required: event.target.checked } })} /><span><i /> Обязательный вопрос</span></label>
                </div>
              </>
            )}
            {editor.kind === 'user' && (
              <>
                <label className="field"><span>ФИО *</span><input required value={editor.value.fullName ?? ''} onChange={(event) => setEditor({ ...editor, value: { ...editor.value, fullName: event.target.value } })} placeholder="Иванов Иван Иванович" /></label>
                <div className="form-grid two">
                  <label className="field"><span>Логин *</span><input required value={editor.value.username ?? ''} onChange={(event) => setEditor({ ...editor, value: { ...editor.value, username: event.target.value } })} placeholder="ivanov" /></label>
                  <label className="field"><span>{editor.value.id ? 'Новый пароль' : 'Пароль *'}</span><span className="input-with-icon"><KeyRound size={16} /><input type="password" required={!editor.value.id} minLength={6} value={editor.value.password ?? ''} onChange={(event) => setEditor({ ...editor, value: { ...editor.value, password: event.target.value } })} placeholder={editor.value.id ? 'Оставьте пустым без изменений' : 'Не менее 6 символов'} /></span></label>
                </div>
                <div className="form-grid two">
                  <label className="field"><span>Роль</span><select value={editor.value.role} onChange={(event) => setEditor({ ...editor, value: { ...editor.value, role: event.target.value as Role } })}>{Object.entries(roleLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                  <label className="field"><span>Учреждение</span><select value={editor.value.institutionId ?? ''} onChange={(event) => setEditor({ ...editor, value: { ...editor.value, institutionId: event.target.value || null } })}><option value="">Все учреждения</option>{institutions.filter((item) => item.active).map((item) => <option value={item.id} key={item.id}>{item.shortName}</option>)}</select></label>
                </div>
              </>
            )}
            <div className="modal-actions">
              <button className="button secondary" type="button" onClick={() => setEditor(null)}>Отмена</button>
              <button className="button primary" type="submit" disabled={saving}><Settings size={17} /> {saving ? 'Сохранение…' : 'Сохранить'}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
