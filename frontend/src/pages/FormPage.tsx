import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  CloudOff,
  Info,
  Save,
  Send,
} from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { api, ApiError } from '../api'
import { offlineStorage } from '../storage'
import type { Institution, Question, ReportPayload, User } from '../types'
import { todayIso } from '../utils'

interface FormPageProps {
  user: User
  institutions: Institution[]
  questions: Question[]
  online: boolean
  onBack: () => void
  onSaved: (queued: boolean) => void
  notify: (message: string, kind?: 'success' | 'error') => void
}

export function FormPage({
  user,
  institutions,
  questions,
  online,
  onBack,
  onSaved,
  notify,
}: FormPageProps) {
  const stored = offlineStorage.getDraft()
  const initialInstitution =
    user.role === 'operator'
      ? user.institution_id || 0
      : stored?.institution_id || institutions[0]?.id || 0
  const [institutionId, setInstitutionId] = useState(initialInstitution)
  const [reportDate, setReportDate] = useState(stored?.report_date || todayIso())
  const [answers, setAnswers] = useState<Record<string, unknown>>(stored?.answers || {})
  const [comment, setComment] = useState(stored?.comment || '')
  const [errors, setErrors] = useState<Set<number>>(new Set())
  const [saving, setSaving] = useState(false)
  const activeQuestions = useMemo(
    () => questions.filter((question) => question.is_active),
    [questions],
  )

  const payload = useMemo<ReportPayload>(
    () => ({
      institution_id: institutionId,
      report_date: reportDate,
      status: 'submitted',
      answers,
      comment,
    }),
    [institutionId, reportDate, answers, comment],
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (institutionId) offlineStorage.saveDraft(payload)
    }, 400)
    return () => window.clearTimeout(timer)
  }, [payload, institutionId])

  const completed = activeQuestions.filter((question) => {
    const value = answers[String(question.id)]
    return value !== undefined && value !== null && value !== ''
  }).length
  const completion = activeQuestions.length
    ? Math.round((completed / activeQuestions.length) * 100)
    : 0

  const setAnswer = (questionId: number, value: unknown) => {
    setAnswers((current) => ({ ...current, [String(questionId)]: value }))
    setErrors((current) => {
      const next = new Set(current)
      next.delete(questionId)
      return next
    })
  }

  const validate = () => {
    const missing = activeQuestions
      .filter((question) => {
        const value = answers[String(question.id)]
        return question.is_required && (value === undefined || value === null || value === '')
      })
      .map((question) => question.id)
    setErrors(new Set(missing))
    if (!institutionId) {
      notify('Выберите учреждение', 'error')
      return false
    }
    if (missing.length) {
      notify(`Заполните обязательные поля (${missing.length})`, 'error')
      document.getElementById(`question-${missing[0]}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
      return false
    }
    return true
  }

  const queueReport = () => {
    offlineStorage.enqueue({ ...payload, client_id: crypto.randomUUID() })
    offlineStorage.clearDraft()
    notify('Справка сохранена. Она отправится при подключении к интернету.')
    onSaved(true)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    setSaving(true)
    if (!online) {
      queueReport()
      setSaving(false)
      return
    }
    try {
      await api.createReport({ ...payload, client_id: crypto.randomUUID() })
      offlineStorage.clearDraft()
      notify('Справка успешно отправлена')
      onSaved(false)
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 0) {
        queueReport()
      } else {
        notify(reason instanceof Error ? reason.message : 'Не удалось отправить справку', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const saveDraft = () => {
    offlineStorage.saveDraft(payload)
    notify('Черновик сохранён на этом устройстве')
  }

  const renderAnswer = (question: Question) => {
    const key = String(question.id)
    const value = answers[key]
    if (question.answer_type === 'textarea') {
      return (
        <textarea
          rows={4}
          value={String(value ?? '')}
          onChange={(event) => setAnswer(question.id, event.target.value)}
          placeholder="Введите подробный ответ"
        />
      )
    }
    if (question.answer_type === 'select') {
      return (
        <select
          value={String(value ?? '')}
          onChange={(event) => setAnswer(question.id, event.target.value)}
        >
          <option value="">Выберите вариант</option>
          {question.options.map((option) => <option key={option}>{option}</option>)}
        </select>
      )
    }
    if (question.answer_type === 'boolean') {
      return (
        <div className="choice-group">
          <button
            type="button"
            className={value === true ? 'selected danger-choice' : ''}
            onClick={() => setAnswer(question.id, true)}
          >
            {value === true && <Check size={16} />} Да
          </button>
          <button
            type="button"
            className={value === false ? 'selected' : ''}
            onClick={() => setAnswer(question.id, false)}
          >
            {value === false && <Check size={16} />} Нет
          </button>
        </div>
      )
    }
    return (
      <input
        type={question.answer_type === 'number' ? 'number' : 'text'}
        min={question.answer_type === 'number' ? 0 : undefined}
        value={String(value ?? '')}
        onChange={(event) =>
          setAnswer(
            question.id,
            question.answer_type === 'number' && event.target.value !== ''
              ? Number(event.target.value)
              : event.target.value,
          )
        }
        placeholder={question.answer_type === 'number' ? '0' : 'Введите ответ'}
      />
    )
  }

  return (
    <form className="questionnaire" onSubmit={submit}>
      <button type="button" className="back-link" onClick={onBack}>
        <ArrowLeft size={17} /> Вернуться к справкам
      </button>
      <div className="page-heading form-heading">
        <span className="eyebrow">Ежедневная форма</span>
        <h1>Новая справка</h1>
        <p>Заполните сведения по состоянию учреждения на выбранную дату.</p>
      </div>

      {!online && (
        <div className="offline-banner">
          <CloudOff size={20} />
          <div>
            <strong>Вы работаете без подключения к интернету</strong>
            <span>Ответы сохраняются на устройстве и будут отправлены автоматически.</span>
          </div>
        </div>
      )}

      <section className="form-progress panel">
        <div className="progress-copy">
          <span>Заполнение формы</span>
          <strong>{completed} из {activeQuestions.length} вопросов</strong>
        </div>
        <div className="progress-track"><span style={{ width: `${completion}%` }} /></div>
        <strong className="progress-percent">{completion}%</strong>
      </section>

      <section className="panel form-section">
        <div className="section-title">
          <span>1</span>
          <div><h2>Основные сведения</h2><p>Учреждение и отчётный период</p></div>
        </div>
        <div className="form-grid two-columns">
          <label>
            <span>Учреждение <i>*</i></span>
            <select
              value={institutionId || ''}
              onChange={(event) => setInstitutionId(Number(event.target.value))}
              disabled={user.role === 'operator'}
              required
            >
              <option value="">Выберите учреждение</option>
              {institutions.map((institution) => (
                <option key={institution.id} value={institution.id}>{institution.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Дата справки <i>*</i></span>
            <input
              type="date"
              value={reportDate}
              max={todayIso()}
              onChange={(event) => setReportDate(event.target.value)}
              required
            />
          </label>
        </div>
      </section>

      <section className="panel form-section">
        <div className="section-title">
          <span>2</span>
          <div><h2>Показатели учреждения</h2><p>Обязательные поля отмечены звёздочкой</p></div>
        </div>
        <div className="questions-list">
          {activeQuestions.map((question, index) => (
            <label
              id={`question-${question.id}`}
              key={question.id}
              className={`question-field ${errors.has(question.id) ? 'field-invalid' : ''}`}
            >
              <span className="question-number">{index + 1}</span>
              <div className="question-content">
                <span className="question-label">
                  {question.text} {question.is_required && <i>*</i>}
                </span>
                {question.description && (
                  <small><Info size={14} /> {question.description}</small>
                )}
                {renderAnswer(question)}
                {errors.has(question.id) && <em>Это поле обязательно для заполнения</em>}
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className="panel form-section">
        <div className="section-title">
          <span>3</span>
          <div><h2>Комментарий к справке</h2><p>Необязательное поле</p></div>
        </div>
        <textarea
          className="comment-field"
          rows={4}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Добавьте общий комментарий или пояснение…"
        />
      </section>

      <div className="form-actions">
        <div className="autosave-note"><CheckCircle2 size={16} /> Ответы сохраняются автоматически</div>
        <button type="button" className="secondary-button" onClick={saveDraft}>
          <Save size={17} /> Сохранить черновик
        </button>
        <button className="primary-button submit-report" disabled={saving}>
          {saving ? 'Сохранение…' : online ? 'Отправить справку' : 'Сохранить для отправки'}
          {online ? <Send size={17} /> : <ChevronRight size={17} />}
        </button>
      </div>
    </form>
  )
}
