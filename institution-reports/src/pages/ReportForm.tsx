import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CloudOff,
  FileText,
  Save,
  Send,
} from 'lucide-react'
import { format } from 'date-fns'
import { PageHeader, LoadingState } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { api, ApiError } from '../lib/api'
import { getQueuedReports, queueReport } from '../lib/offline'
import type { ReportDetails, ReportPayload } from '../types'

type FormState = {
  institutionId: string
  reportDate: string
  comment: string
  answers: Record<string, string>
}

export function ReportFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { institutions, questions, loading: dataLoading } = useData()
  const draftKey = `forma-svodki-draft-${user?.id ?? 'anonymous'}`
  const [form, setForm] = useState<FormState>({
    institutionId: user?.institutionId ?? '',
    reportDate: format(new Date(), 'yyyy-MM-dd'),
    comment: '',
    answers: {},
  })
  const [activeCategory, setActiveCategory] = useState('')
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [invalid, setInvalid] = useState<Set<string>>(new Set())
  const [online, setOnline] = useState(navigator.onLine)

  const activeQuestions = useMemo(
    () => questions.filter((question) => question.active).sort((a, b) => a.position - b.position),
    [questions],
  )
  const categories = useMemo(() => [...new Set(activeQuestions.map((question) => question.category))], [activeQuestions])
  const categoryIndex = Math.max(0, categories.indexOf(activeCategory))
  const currentQuestions = activeQuestions.filter((question) => question.category === activeCategory)

  useEffect(() => {
    if (!activeCategory && categories.length) setActiveCategory(categories[0])
  }, [categories, activeCategory])

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (id || !user) return
    try {
      const localDraft = localStorage.getItem(draftKey)
      if (localDraft) setForm(JSON.parse(localDraft) as FormState)
    } catch {
      localStorage.removeItem(draftKey)
    }
  }, [id, user, draftKey])

  useEffect(() => {
    if (id || !user) return
    const timeout = window.setTimeout(() => localStorage.setItem(draftKey, JSON.stringify(form)), 300)
    return () => window.clearTimeout(timeout)
  }, [form, id, user, draftKey])

  useEffect(() => {
    if (!id || !user) return
    const local = getQueuedReports(user.id).find((item) => item.localId === id)
    if (local) {
      setForm({
        institutionId: local.payload.institutionId,
        reportDate: local.payload.reportDate,
        comment: local.payload.comment,
        answers: Object.fromEntries(Object.entries(local.payload.answers).map(([key, value]) => [key, String(value ?? '')])),
      })
      setLoading(false)
      return
    }
    api<ReportDetails>(`/reports/${id}`)
      .then((report) => {
        setForm({
          institutionId: report.institutionId,
          reportDate: report.reportDate,
          comment: report.comment,
          answers: Object.fromEntries(Object.entries(report.answers).map(([key, value]) => [key, String(value ?? '')])),
        })
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Не удалось загрузить справку'))
      .finally(() => setLoading(false))
  }, [id, user])

  function setAnswer(questionId: string, value: string) {
    setForm((current) => ({ ...current, answers: { ...current.answers, [questionId]: value } }))
    setInvalid((current) => {
      const next = new Set(current)
      next.delete(questionId)
      return next
    })
  }

  function validateSubmission() {
    const missing = new Set(
      activeQuestions
        .filter((question) => question.required && !String(form.answers[question.id] ?? '').trim())
        .map((question) => question.id),
    )
    if (!form.institutionId) missing.add('institution')
    if (!form.reportDate) missing.add('date')
    setInvalid(missing)
    if (missing.size) {
      const firstQuestion = activeQuestions.find((question) => missing.has(question.id))
      if (firstQuestion) setActiveCategory(firstQuestion.category)
      setError('Заполните обязательные поля перед отправкой')
      return false
    }
    return true
  }

  async function save(status: 'draft' | 'submitted') {
    if (!user) return
    if (status === 'submitted' && !validateSubmission()) return
    if (!form.institutionId || !form.reportDate) {
      setError('Выберите учреждение и дату справки')
      return
    }
    setSaving(true)
    setError('')
    const payload: ReportPayload = {
      ...(id ? { clientId: id } : {}),
      institutionId: form.institutionId,
      reportDate: form.reportDate,
      status,
      comment: form.comment,
      answers: form.answers,
    }

    try {
      if (!navigator.onLine || (id && getQueuedReports(user.id).some((item) => item.localId === id))) {
        queueReport(payload, user.id)
      } else {
        try {
          await api(id ? `/reports/${id}` : '/reports', {
            method: id ? 'PUT' : 'POST',
            body: JSON.stringify(payload),
          })
        } catch (requestError) {
          if (requestError instanceof ApiError && requestError.status === 0) queueReport(payload, user.id)
          else throw requestError
        }
      }
      localStorage.removeItem(draftKey)
      navigate('/')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось сохранить справку')
    } finally {
      setSaving(false)
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void save('submitted')
  }

  if (dataLoading || loading) return <div className="page"><LoadingState /></div>

  return (
    <div className="page report-form-page">
      <PageHeader
        eyebrow={id ? 'Редактирование' : 'Новая запись'}
        title={id ? 'Редактирование справки' : 'Заполнение справки'}
        description="Ответьте на вопросы по текущему состоянию учреждения"
        actions={<button className="button ghost" onClick={() => navigate(-1)}><ArrowLeft size={17} /> Назад</button>}
      />

      {!online && <div className="form-offline-note"><CloudOff size={18} /><span><strong>Офлайн-режим</strong> Форма сохранится на устройстве и отправится при подключении к интернету.</span></div>}
      {error && <div className="inline-alert danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <section className="card report-basics">
          <div className="section-title"><span><FileText size={19} /></span><div><h2>Основная информация</h2><p>Укажите учреждение и отчётную дату</p></div></div>
          <div className="form-grid two">
            <label className={`field ${invalid.has('institution') ? 'invalid' : ''}`}>
              <span>Учреждение <b>*</b></span>
              <select
                value={form.institutionId}
                onChange={(event) => setForm((current) => ({ ...current, institutionId: event.target.value }))}
                disabled={user?.role === 'editor'}
                required
              >
                <option value="">Выберите учреждение</option>
                {institutions.filter((item) => item.active).map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
              </select>
            </label>
            <label className={`field ${invalid.has('date') ? 'invalid' : ''}`}>
              <span>Дата справки <b>*</b></span>
              <input type="date" value={form.reportDate} max={format(new Date(), 'yyyy-MM-dd')} onChange={(event) => setForm((current) => ({ ...current, reportDate: event.target.value }))} required />
            </label>
          </div>
        </section>

        <div className="questionnaire">
          <aside className="category-nav card">
            <span className="nav-heading">Разделы формы</span>
            {categories.map((category, index) => {
              const categoryQuestions = activeQuestions.filter((question) => question.category === category)
              const completed = categoryQuestions.filter((question) => String(form.answers[question.id] ?? '').trim()).length
              const hasErrors = categoryQuestions.some((question) => invalid.has(question.id))
              return (
                <button type="button" key={category} className={`${activeCategory === category ? 'active' : ''} ${hasErrors ? 'has-error' : ''}`} onClick={() => setActiveCategory(category)}>
                  <span className="category-number">{completed === categoryQuestions.length && completed > 0 ? <Check size={14} /> : index + 1}</span>
                  <span><strong>{category}</strong><small>{completed} из {categoryQuestions.length}</small></span>
                </button>
              )
            })}
          </aside>

          <section className="card questions-card">
            <div className="questions-heading">
              <div><span>Раздел {categoryIndex + 1} из {categories.length}</span><h2>{activeCategory}</h2></div>
              <span className="section-progress">{currentQuestions.filter((question) => form.answers[question.id]).length}/{currentQuestions.length}</span>
            </div>
            <div className="questions-list">
              {currentQuestions.map((question, index) => (
                <div className={`question ${invalid.has(question.id) ? 'invalid' : ''}`} key={question.id}>
                  <label htmlFor={question.id}>
                    <span className="question-index">{index + 1}</span>
                    <span>{question.text} {question.required && <b>*</b>}</span>
                  </label>
                  {question.helpText && <p>{question.helpText}</p>}
                  {question.type === 'textarea' ? (
                    <textarea id={question.id} value={form.answers[question.id] ?? ''} onChange={(event) => setAnswer(question.id, event.target.value)} rows={4} placeholder="Введите ответ" />
                  ) : question.type === 'select' ? (
                    <select id={question.id} value={form.answers[question.id] ?? ''} onChange={(event) => setAnswer(question.id, event.target.value)}>
                      <option value="">Выберите вариант</option>
                      {question.options.map((option) => <option value={option} key={option}>{option}</option>)}
                    </select>
                  ) : question.type === 'boolean' ? (
                    <div className="boolean-control">
                      <button type="button" className={form.answers[question.id] === 'true' ? 'selected' : ''} onClick={() => setAnswer(question.id, 'true')}><CheckCircle2 size={17} /> Да</button>
                      <button type="button" className={form.answers[question.id] === 'false' ? 'selected no' : ''} onClick={() => setAnswer(question.id, 'false')}>Нет</button>
                    </div>
                  ) : (
                    <input id={question.id} type={question.type === 'number' ? 'number' : 'text'} min={question.type === 'number' ? 0 : undefined} value={form.answers[question.id] ?? ''} onChange={(event) => setAnswer(question.id, event.target.value)} placeholder={question.type === 'number' ? '0' : 'Введите ответ'} />
                  )}
                  {invalid.has(question.id) && <small className="field-error">Это поле обязательно</small>}
                </div>
              ))}
            </div>
            <div className="question-navigation">
              <button type="button" className="button secondary" disabled={categoryIndex === 0} onClick={() => setActiveCategory(categories[categoryIndex - 1])}><ArrowLeft size={17} /> Назад</button>
              {categoryIndex < categories.length - 1 ? (
                <button type="button" className="button primary" onClick={() => setActiveCategory(categories[categoryIndex + 1])}>Следующий раздел <ArrowRight size={17} /></button>
              ) : (
                <span className="last-section-note"><Check size={16} /> Последний раздел</span>
              )}
            </div>
          </section>
        </div>

        <section className="card comment-card">
          <label className="field">
            <span>Комментарий к справке</span>
            <textarea value={form.comment} onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))} rows={3} placeholder="Необязательный общий комментарий" />
          </label>
        </section>

        <footer className="form-actions">
          <div><strong>Заполнено {Object.values(form.answers).filter((value) => value.trim()).length} из {activeQuestions.length}</strong><small>Можно сохранить черновик и продолжить позже</small></div>
          <div>
            <button className="button secondary" type="button" disabled={saving} onClick={() => void save('draft')}><Save size={17} /> Сохранить черновик</button>
            <button className="button primary" type="submit" disabled={saving}><Send size={17} /> {saving ? 'Сохранение…' : online ? 'Отправить справку' : 'Сохранить на устройстве'}</button>
          </div>
        </footer>
      </form>
    </div>
  )
}
