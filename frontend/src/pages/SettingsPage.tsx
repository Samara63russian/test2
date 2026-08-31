import {
  Building2,
  Check,
  CircleHelp,
  Edit3,
  KeyRound,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { api } from '../api'
import { Modal } from '../components/Modal'
import type { AnswerType, Institution, Question, User } from '../types'
import { roleLabel } from '../utils'

interface SettingsPageProps {
  notify: (message: string, kind?: 'success' | 'error') => void
  onReferencesChanged: () => void
}

type Tab = 'questions' | 'users' | 'institutions'

const blankQuestion: Omit<Question, 'id'> = {
  text: '',
  description: '',
  answer_type: 'text',
  options: [],
  is_required: false,
  is_active: true,
  order_index: 0,
}

const blankInstitution: Omit<Institution, 'id'> = {
  name: '',
  short_name: '',
  address: '',
  is_active: true,
}

interface UserForm {
  id?: number
  username: string
  full_name: string
  password: string
  role: 'admin' | 'operator' | 'viewer'
  institution_id: number | null
  is_active: boolean
}

const blankUser: UserForm = {
  username: '',
  full_name: '',
  password: '',
  role: 'operator',
  institution_id: null,
  is_active: true,
}

export function SettingsPage({ notify, onReferencesChanged }: SettingsPageProps) {
  const [tab, setTab] = useState<Tab>('questions')
  const [questions, setQuestions] = useState<Question[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [questionForm, setQuestionForm] = useState<(Omit<Question, 'id'> & { id?: number }) | null>(null)
  const [institutionForm, setInstitutionForm] = useState<(Omit<Institution, 'id'> & { id?: number }) | null>(null)
  const [userForm, setUserForm] = useState<UserForm | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [questionData, userData, institutionData] = await Promise.all([
        api.questions(true),
        api.users(),
        api.institutions(true),
      ])
      setQuestions(questionData)
      setUsers(userData)
      setInstitutions(institutionData)
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : 'Не удалось загрузить настройки', 'error')
    } finally {
      setLoading(false)
    }
  }, [notify])

  useEffect(() => { void load() }, [load])

  const filteredQuestions = useMemo(
    () => questions.filter((item) => item.text.toLowerCase().includes(search.toLowerCase())),
    [questions, search],
  )
  const filteredUsers = useMemo(
    () => users.filter((item) => `${item.full_name} ${item.username}`.toLowerCase().includes(search.toLowerCase())),
    [users, search],
  )
  const filteredInstitutions = useMemo(
    () => institutions.filter((item) => `${item.name} ${item.short_name}`.toLowerCase().includes(search.toLowerCase())),
    [institutions, search],
  )

  const openCreate = () => {
    if (tab === 'questions') setQuestionForm({ ...blankQuestion, order_index: questions.length + 1 })
    if (tab === 'users') setUserForm({ ...blankUser, institution_id: institutions.find((item) => item.is_active)?.id || null })
    if (tab === 'institutions') setInstitutionForm({ ...blankInstitution })
  }

  const saveQuestion = async (event: FormEvent) => {
    event.preventDefault()
    if (!questionForm) return
    setSaving(true)
    try {
      if (questionForm.id) {
        const { id, ...payload } = questionForm
        await api.updateQuestion(id, payload)
      } else {
        await api.createQuestion(questionForm)
      }
      notify(questionForm.id ? 'Вопрос обновлён' : 'Вопрос добавлен')
      setQuestionForm(null)
      await load()
      onReferencesChanged()
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : 'Не удалось сохранить вопрос', 'error')
    } finally {
      setSaving(false)
    }
  }

  const saveInstitution = async (event: FormEvent) => {
    event.preventDefault()
    if (!institutionForm) return
    setSaving(true)
    try {
      if (institutionForm.id) {
        const { id, ...payload } = institutionForm
        await api.updateInstitution(id, payload)
      } else {
        await api.createInstitution(institutionForm)
      }
      notify(institutionForm.id ? 'Учреждение обновлено' : 'Учреждение добавлено')
      setInstitutionForm(null)
      await load()
      onReferencesChanged()
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : 'Не удалось сохранить учреждение', 'error')
    } finally {
      setSaving(false)
    }
  }

  const saveUser = async (event: FormEvent) => {
    event.preventDefault()
    if (!userForm) return
    setSaving(true)
    try {
      const { id, ...payload } = userForm
      if (id) await api.updateUser(id, payload)
      else await api.createUser(payload)
      notify(id ? 'Пользователь обновлён' : 'Пользователь создан')
      setUserForm(null)
      await load()
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : 'Не удалось сохранить пользователя', 'error')
    } finally {
      setSaving(false)
    }
  }

  const removeQuestion = async (question: Question) => {
    if (!window.confirm(`Удалить вопрос «${question.text}»?`)) return
    try {
      const result = await api.deleteQuestion(question.id)
      notify(result.result === 'archived' ? 'Вопрос скрыт, история ответов сохранена' : 'Вопрос удалён')
      await load()
      onReferencesChanged()
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : 'Не удалось удалить вопрос', 'error')
    }
  }

  const removeInstitution = async (institution: Institution) => {
    if (!window.confirm(`Удалить учреждение «${institution.short_name}»?`)) return
    try {
      const result = await api.deleteInstitution(institution.id)
      notify(result.result === 'archived' ? 'Учреждение архивировано, история сохранена' : 'Учреждение удалено')
      await load()
      onReferencesChanged()
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : 'Не удалось удалить учреждение', 'error')
    }
  }

  const tabs: Array<{ id: Tab; label: string; icon: typeof CircleHelp; count: number }> = [
    { id: 'questions', label: 'Вопросы формы', icon: CircleHelp, count: questions.length },
    { id: 'users', label: 'Пользователи', icon: Users, count: users.length },
    { id: 'institutions', label: 'Учреждения', icon: Building2, count: institutions.length },
  ]

  return (
    <>
      <div className="page-heading heading-with-action">
        <div>
          <span className="eyebrow">Администрирование</span>
          <h1>Настройки</h1>
          <p>Управление формой, учётными записями и справочником учреждений.</p>
        </div>
        <button className="primary-button" onClick={openCreate}>
          <Plus size={18} />
          {tab === 'questions' ? 'Добавить вопрос' : tab === 'users' ? 'Создать пользователя' : 'Добавить учреждение'}
        </button>
      </div>

      <section className="settings-layout">
        <aside className="settings-tabs panel">
          {tabs.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={tab === item.id ? 'active' : ''}
                onClick={() => { setTab(item.id); setSearch('') }}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                <small>{item.count}</small>
              </button>
            )
          })}
          <div className="settings-security">
            <ShieldCheck size={21} />
            <strong>Доступ защищён</strong>
            <span>Пароли хранятся в зашифрованном виде.</span>
          </div>
        </aside>

        <section className="panel settings-content">
          <div className="settings-toolbar">
            <div>
              <h2>{tabs.find((item) => item.id === tab)?.label}</h2>
              <p>
                {tab === 'questions' && 'Определите состав и порядок полей ежедневной формы.'}
                {tab === 'users' && 'Назначайте роли и доступ к учреждениям.'}
                {tab === 'institutions' && 'Ведите единый перечень подотчётных учреждений.'}
              </p>
            </div>
            <label className="table-search">
              <Search size={17} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск…" />
            </label>
          </div>

          {loading && <div className="loading-row">Загружаем настройки…</div>}

          {!loading && tab === 'questions' && (
            <div className="settings-list">
              {filteredQuestions.map((question, index) => (
                <article className={`question-setting ${!question.is_active ? 'inactive-row' : ''}`} key={question.id}>
                  <span className="drag-number">{index + 1}</span>
                  <div className="setting-main">
                    <strong>{question.text}</strong>
                    <span>
                      {question.answer_type === 'text' && 'Короткий текст'}
                      {question.answer_type === 'textarea' && 'Развёрнутый текст'}
                      {question.answer_type === 'number' && 'Число'}
                      {question.answer_type === 'select' && `Выбор: ${question.options.join(', ')}`}
                      {question.answer_type === 'boolean' && 'Да / Нет'}
                    </span>
                  </div>
                  <div className="setting-tags">
                    {question.is_required && <span>Обязательный</span>}
                    {!question.is_active && <span className="muted-tag">Скрыт</span>}
                  </div>
                  <button className="icon-button" onClick={() => setQuestionForm({ ...question })} aria-label="Редактировать">
                    <Edit3 size={17} />
                  </button>
                  <button className="icon-button danger" onClick={() => removeQuestion(question)} aria-label="Удалить">
                    <Trash2 size={17} />
                  </button>
                </article>
              ))}
            </div>
          )}

          {!loading && tab === 'users' && (
            <div className="table-wrap">
              <table className="data-table settings-table">
                <thead><tr><th>Пользователь</th><th>Роль</th><th>Учреждение</th><th>Статус</th><th /></tr></thead>
                <tbody>
                  {filteredUsers.map((item) => (
                    <tr key={item.id} className={!item.is_active ? 'inactive-row' : ''}>
                      <td>
                        <div className="user-cell">
                          <span>{item.full_name.slice(0, 2).toUpperCase()}</span>
                          <div><strong>{item.full_name}</strong><small>@{item.username}</small></div>
                        </div>
                      </td>
                      <td><span className={`role-badge ${item.role}`}><UserCog size={14} />{roleLabel(item.role)}</span></td>
                      <td>{item.institution_name || 'Все учреждения'}</td>
                      <td><span className={`active-badge ${item.is_active ? '' : 'disabled'}`}>{item.is_active ? 'Активен' : 'Отключён'}</span></td>
                      <td><button className="icon-button" onClick={() => setUserForm({
                        id: item.id,
                        username: item.username,
                        full_name: item.full_name,
                        password: '',
                        role: item.role,
                        institution_id: item.institution_id,
                        is_active: item.is_active,
                      })}><Edit3 size={17} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && tab === 'institutions' && (
            <div className="institution-settings-grid">
              {filteredInstitutions.map((item) => (
                <article className={`institution-setting-card ${!item.is_active ? 'inactive-row' : ''}`} key={item.id}>
                  <span className="institution-mark"><Building2 size={21} /></span>
                  <div><small>{item.short_name}</small><strong>{item.name}</strong><p>{item.address || 'Адрес не указан'}</p></div>
                  <span className={`active-badge ${item.is_active ? '' : 'disabled'}`}>{item.is_active ? 'Действует' : 'Архив'}</span>
                  <div className="card-actions">
                    <button className="icon-button" onClick={() => setInstitutionForm({ ...item })}><Edit3 size={17} /></button>
                    <button className="icon-button danger" onClick={() => removeInstitution(item)}><Trash2 size={17} /></button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      {questionForm && (
        <Modal
          title={questionForm.id ? 'Редактировать вопрос' : 'Новый вопрос'}
          subtitle="Поле будет отображаться в ежедневной форме"
          onClose={() => setQuestionForm(null)}
        >
          <form className="modal-form" onSubmit={saveQuestion}>
            <label><span>Текст вопроса *</span><textarea rows={2} value={questionForm.text} onChange={(event) => setQuestionForm({ ...questionForm, text: event.target.value })} required /></label>
            <label><span>Подсказка</span><textarea rows={2} value={questionForm.description} onChange={(event) => setQuestionForm({ ...questionForm, description: event.target.value })} /></label>
            <div className="form-grid two-columns">
              <label>
                <span>Тип ответа *</span>
                <select value={questionForm.answer_type} onChange={(event) => setQuestionForm({ ...questionForm, answer_type: event.target.value as AnswerType })}>
                  <option value="text">Короткий текст</option>
                  <option value="textarea">Развёрнутый текст</option>
                  <option value="number">Число</option>
                  <option value="select">Выбор из списка</option>
                  <option value="boolean">Да / Нет</option>
                </select>
              </label>
              <label><span>Порядок</span><input type="number" min={0} value={questionForm.order_index} onChange={(event) => setQuestionForm({ ...questionForm, order_index: Number(event.target.value) })} /></label>
            </div>
            {questionForm.answer_type === 'select' && (
              <label><span>Варианты ответа через запятую *</span><input value={questionForm.options.join(', ')} onChange={(event) => setQuestionForm({ ...questionForm, options: event.target.value.split(',').map((value) => value.trim()) })} required /></label>
            )}
            <div className="checkbox-row">
              <label><input type="checkbox" checked={questionForm.is_required} onChange={(event) => setQuestionForm({ ...questionForm, is_required: event.target.checked })} /><span><Check size={14} /> Обязательное поле</span></label>
              <label><input type="checkbox" checked={questionForm.is_active} onChange={(event) => setQuestionForm({ ...questionForm, is_active: event.target.checked })} /><span><Check size={14} /> Активен</span></label>
            </div>
            <footer className="modal-actions"><button type="button" className="secondary-button" onClick={() => setQuestionForm(null)}>Отмена</button><button className="primary-button" disabled={saving}>{saving ? 'Сохранение…' : 'Сохранить'}</button></footer>
          </form>
        </Modal>
      )}

      {institutionForm && (
        <Modal title={institutionForm.id ? 'Редактировать учреждение' : 'Новое учреждение'} onClose={() => setInstitutionForm(null)}>
          <form className="modal-form" onSubmit={saveInstitution}>
            <label><span>Полное название *</span><input value={institutionForm.name} onChange={(event) => setInstitutionForm({ ...institutionForm, name: event.target.value })} required /></label>
            <label><span>Краткое название *</span><input value={institutionForm.short_name} onChange={(event) => setInstitutionForm({ ...institutionForm, short_name: event.target.value })} required /></label>
            <label><span>Адрес</span><input value={institutionForm.address} onChange={(event) => setInstitutionForm({ ...institutionForm, address: event.target.value })} /></label>
            <div className="checkbox-row"><label><input type="checkbox" checked={institutionForm.is_active} onChange={(event) => setInstitutionForm({ ...institutionForm, is_active: event.target.checked })} /><span><Check size={14} /> Действующее учреждение</span></label></div>
            <footer className="modal-actions"><button type="button" className="secondary-button" onClick={() => setInstitutionForm(null)}>Отмена</button><button className="primary-button" disabled={saving}>{saving ? 'Сохранение…' : 'Сохранить'}</button></footer>
          </form>
        </Modal>
      )}

      {userForm && (
        <Modal title={userForm.id ? 'Редактировать пользователя' : 'Новый пользователь'} subtitle="Настройте данные для входа и уровень доступа" onClose={() => setUserForm(null)}>
          <form className="modal-form" onSubmit={saveUser}>
            <label><span>Фамилия и имя *</span><input value={userForm.full_name} onChange={(event) => setUserForm({ ...userForm, full_name: event.target.value })} required /></label>
            <label><span>Логин *</span><input value={userForm.username} pattern="[a-zA-Z0-9_.-]+" onChange={(event) => setUserForm({ ...userForm, username: event.target.value })} required /></label>
            <label><span>{userForm.id ? 'Новый пароль (не заполняйте, чтобы оставить прежний)' : 'Пароль *'}</span><div className="input-with-icon"><KeyRound size={17} /><input type="password" minLength={8} value={userForm.password} onChange={(event) => setUserForm({ ...userForm, password: event.target.value })} required={!userForm.id} /></div></label>
            <div className="form-grid two-columns">
              <label><span>Роль *</span><select value={userForm.role} onChange={(event) => setUserForm({ ...userForm, role: event.target.value as UserForm['role'] })}><option value="admin">Администратор</option><option value="operator">Оператор</option><option value="viewer">Наблюдатель</option></select></label>
              <label><span>Учреждение</span><select value={userForm.institution_id || ''} onChange={(event) => setUserForm({ ...userForm, institution_id: event.target.value ? Number(event.target.value) : null })}><option value="">Все учреждения</option>{institutions.filter((item) => item.is_active).map((item) => <option key={item.id} value={item.id}>{item.short_name}</option>)}</select></label>
            </div>
            <div className="checkbox-row"><label><input type="checkbox" checked={userForm.is_active} onChange={(event) => setUserForm({ ...userForm, is_active: event.target.checked })} /><span><Check size={14} /> Учётная запись активна</span></label></div>
            <footer className="modal-actions"><button type="button" className="secondary-button" onClick={() => setUserForm(null)}>Отмена</button><button className="primary-button" disabled={saving}>{saving ? 'Сохранение…' : 'Сохранить'}</button></footer>
          </form>
        </Modal>
      )}
    </>
  )
}
