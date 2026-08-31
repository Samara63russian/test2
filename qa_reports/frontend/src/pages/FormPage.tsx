import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import {
  cacheInstitutions,
  cacheQuestions,
  generateUuid,
  getCachedInstitutions,
  getCachedQuestions,
  getOfflineReports,
  isOnline,
  markOfflineSynced,
  removeOfflineReport,
  saveOfflineReport,
} from '../offline'
import type { Institution, Question, ReportAnswer } from '../types'

export default function FormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [institutionId, setInstitutionId] = useState<number | ''>('')
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [clientUuid, setClientUuid] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [online, setOnline] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    isOnline().then(setOnline)
    const load = async () => {
      const on = await isOnline()
      if (on) {
        try {
          const [insts, qs] = await Promise.all([api.getInstitutions(true), api.getQuestions()])
          setInstitutions(insts)
          setQuestions(qs)
          cacheInstitutions(insts)
          cacheQuestions(qs)
        } catch {
          setInstitutions(getCachedInstitutions())
          setQuestions(getCachedQuestions())
        }
      } else {
        setInstitutions(getCachedInstitutions())
        setQuestions(getCachedQuestions())
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!id) {
      setClientUuid(generateUuid())
      return
    }
    api.getReport(Number(id)).then((r) => {
      setInstitutionId(r.institution_id)
      setReportDate(r.report_date.slice(0, 10))
      setNotes(r.notes)
      setClientUuid(r.client_uuid)
      const ans: Record<number, string> = {}
      r.answers.forEach((a) => { ans[a.question_id] = a.answer_text })
      setAnswers(ans)
    }).catch(console.error)
  }, [id])

  const setAnswer = (qId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }))
  }

  const buildAnswers = (): ReportAnswer[] =>
    questions.map((q) => ({ question_id: q.id, answer_text: answers[q.id] || '' }))

  const handleSave = async (submitStatus: string) => {
    if (!institutionId) {
      alert('Выберите учреждение')
      return
    }
    setSaving(true)
    setMessage('')
    const payload = {
      institution_id: institutionId,
      report_date: new Date(reportDate).toISOString(),
      status: submitStatus,
      notes,
      answers: buildAnswers(),
      client_uuid: clientUuid || generateUuid(),
    }

    const on = await isOnline()
    if (!on) {
      saveOfflineReport({
        ...payload,
        client_uuid: payload.client_uuid!,
        synced: false,
        created_at: new Date().toISOString(),
      })
      setMessage('Сохранено локально. Будет отправлено при подключении к интернету.')
      setSaving(false)
      return
    }

    try {
      if (id) {
        await api.updateReport(Number(id), payload)
      } else {
        await api.createReport(payload)
      }
      setMessage('Справка сохранена')
      setTimeout(() => navigate('/'), 800)
    } catch {
      saveOfflineReport({
        ...payload,
        client_uuid: payload.client_uuid!,
        synced: false,
        created_at: new Date().toISOString(),
      })
      setMessage('Сервер недоступен. Сохранено локально.')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = async () => {
    if (!id) return
    try {
      const blob = await api.exportReport(Number(id))
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `spravka_${id}.docx`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Ошибка скачивания')
    }
  }

  const categories = [...new Set(questions.map((q) => q.category))]

  return (
    <div>
      <h1 className="page-title">{id ? 'Редактирование справки' : 'Новая справка'}</h1>

      {!online && (
        <div className="sync-banner">
          <span>Офлайн-режим. Данные будут синхронизированы при подключении.</span>
        </div>
      )}

      {message && <div className="card" style={{ background: '#ecfdf5', border: '1px solid #6ee7b7' }}>{message}</div>}

      <div className="card">
        <div className="form-group">
          <label>Учреждение *</label>
          <select value={institutionId} onChange={(e) => setInstitutionId(Number(e.target.value))} required>
            <option value="">Выберите...</option>
            {institutions.map((i) => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Дата справки *</label>
          <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
        </div>
      </div>

      {categories.map((cat) => (
        <div key={cat} className="card">
          <h3 style={{ margin: '0 0 1rem', color: '#1e3a5f' }}>{cat}</h3>
          {questions.filter((q) => q.category === cat).map((q) => (
            <div key={q.id} className="form-group">
              <label>{q.text}{q.is_required ? ' *' : ''}</label>
              {q.question_type === 'select' ? (
                <select value={answers[q.id] || ''} onChange={(e) => setAnswer(q.id, e.target.value)}>
                  <option value="">Выберите...</option>
                  {q.options.map((o) => (
                    <option key={o.id} value={o.text}>{o.text}</option>
                  ))}
                </select>
              ) : q.question_type === 'textarea' ? (
                <textarea value={answers[q.id] || ''} onChange={(e) => setAnswer(q.id, e.target.value)} />
              ) : (
                <input
                  type={q.question_type === 'number' ? 'number' : q.question_type === 'date' ? 'date' : 'text'}
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      ))}

      <div className="card">
        <div className="form-group">
          <label>Примечания</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => handleSave('draft')} disabled={saving}>
            Сохранить черновик
          </button>
          <button className="btn btn-primary" onClick={() => handleSave('submitted')} disabled={saving}>
            Отправить
          </button>
          {id && (
            <button className="btn btn-success" onClick={handleExport}>
              Скачать DOCX
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  )
}

export function SyncButton() {
  const [pending, setPending] = useState(0)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const check = () => {
      setPending(getOfflineReports().filter((r) => !r.synced).length)
    }
    check()
    const interval = setInterval(check, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSync = async () => {
    const on = await isOnline()
    if (!on) {
      alert('Нет подключения к интернету')
      return
    }
    const unsynced = getOfflineReports().filter((r) => !r.synced)
    if (unsynced.length === 0) return
    setSyncing(true)
    try {
      await api.syncReports(unsynced)
      unsynced.forEach((r) => {
        markOfflineSynced(r.client_uuid)
        removeOfflineReport(r.client_uuid)
      })
      setPending(0)
      alert(`Синхронизировано: ${unsynced.length}`)
    } catch {
      alert('Ошибка синхронизации')
    } finally {
      setSyncing(false)
    }
  }

  if (pending === 0) return null

  return (
    <div className="sync-banner">
      <span>Ожидают синхронизации: {pending}</span>
      <button className="btn btn-primary" onClick={handleSync} disabled={syncing}>
        {syncing ? 'Синхронизация...' : 'Синхронизировать'}
      </button>
    </div>
  )
}
