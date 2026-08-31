import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FilePlus2,
  FileText,
  Filter,
  Pencil,
  RefreshCw,
  Search,
} from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { api, downloadReport } from '../lib/api'
import { getQueuedReports } from '../lib/offline'
import type { ReportDetails, ReportListItem } from '../types'
import { EmptyState, LoadingState, Modal, PageHeader } from '../components/UI'

function displayDate(value: string) {
  return format(new Date(`${value}T12:00:00`), 'd MMMM yyyy', { locale: ru })
}

export function DashboardPage() {
  const { user } = useAuth()
  const { institutions, questions } = useData()
  const [reports, setReports] = useState<ReportListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [institutionId, setInstitutionId] = useState(user?.role === 'editor' ? (user.institutionId ?? '') : '')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [details, setDetails] = useState<ReportDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const loadReports = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const params = new URLSearchParams()
    if (institutionId) params.set('institutionId', institutionId)
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    try {
      const serverReports = await api<ReportListItem[]>(`/reports?${params}`)
      const queued = getQueuedReports(user.id)
        .filter((item) => !institutionId || item.payload.institutionId === institutionId)
        .filter((item) => !from || item.payload.reportDate >= from)
        .filter((item) => !to || item.payload.reportDate <= to)
        .map<ReportListItem>((item) => {
          const institution = institutions.find((candidate) => candidate.id === item.payload.institutionId)
          return {
            id: item.localId,
            clientId: item.localId,
            institutionId: item.payload.institutionId,
            institutionName: institution?.name ?? 'Учреждение',
            institutionShortName: institution?.shortName ?? 'Учреждение',
            reportDate: item.payload.reportDate,
            status: item.payload.status,
            comment: item.payload.comment,
            authorName: user.fullName,
            answerCount: Object.values(item.payload.answers).filter((value) => String(value ?? '').trim()).length,
            questionCount: questions.filter((question) => question.active).length,
            createdAt: item.createdAt,
            updatedAt: item.createdAt,
            pending: true,
          }
        })
      setReports([...queued, ...serverReports])
      setError('')
    } catch (requestError) {
      const queued = getQueuedReports(user.id)
      if (queued.length) {
        setReports([])
        setError('Сервер недоступен. Локальные формы доступны во вкладке «Заполнить форму».')
      } else {
        setError(requestError instanceof Error ? requestError.message : 'Не удалось загрузить справки')
      }
    } finally {
      setLoading(false)
    }
  }, [user, institutionId, from, to, institutions, questions])

  useEffect(() => {
    void loadReports()
    window.addEventListener('reports-synced', loadReports)
    window.addEventListener('offline-queue-change', loadReports)
    return () => {
      window.removeEventListener('reports-synced', loadReports)
      window.removeEventListener('offline-queue-change', loadReports)
    }
  }, [loadReports])

  useEffect(() => {
    if (!selectedId) {
      setDetails(null)
      return
    }
    const local = user ? getQueuedReports(user.id).find((item) => item.localId === selectedId) : undefined
    if (local) {
      setDetails({ ...local.payload, id: local.localId, clientId: local.localId })
      return
    }
    setDetailsLoading(true)
    api<ReportDetails>(`/reports/${selectedId}`)
      .then(setDetails)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Не удалось открыть справку'))
      .finally(() => setDetailsLoading(false))
  }, [selectedId, user])

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase()
    return query
      ? reports.filter((report) =>
          `${report.institutionName} ${report.authorName} ${report.reportDate}`.toLowerCase().includes(query),
        )
      : reports
  }, [reports, search])

  const stats = useMemo(() => {
    const submitted = reports.filter((report) => report.status === 'submitted').length
    return {
      total: reports.length,
      submitted,
      drafts: reports.length - submitted,
      institutions: new Set(reports.map((report) => report.institutionId)).size,
    }
  }, [reports])

  const selectedReport = reports.find((report) => report.id === selectedId)
  const activeQuestions = questions.filter((question) => question.active).sort((a, b) => a.position - b.position)

  async function handleDownload() {
    if (!selectedReport || selectedReport.pending) return
    setDownloading(true)
    try {
      await downloadReport(selectedReport.id, selectedReport.reportDate)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось скачать документ')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="page dashboard-page">
      <PageHeader
        eyebrow="Обзор данных"
        title="Сводные справки"
        description="Контролируйте заполнение и просматривайте сведения по учреждениям"
        actions={
          user?.role !== 'viewer' && (
            <Link className="button primary" to="/new"><FilePlus2 size={18} /> Новая справка</Link>
          )
        }
      />

      <section className="stats-grid">
        <article className="stat-card blue">
          <span className="stat-icon"><FileText size={21} /></span>
          <div><span>Всего справок</span><strong>{stats.total}</strong><small>за выбранный период</small></div>
        </article>
        <article className="stat-card green">
          <span className="stat-icon"><CheckCircle2 size={21} /></span>
          <div><span>Отправлено</span><strong>{stats.submitted}</strong><small>{stats.total ? Math.round((stats.submitted / stats.total) * 100) : 0}% от общего числа</small></div>
        </article>
        <article className="stat-card amber">
          <span className="stat-icon"><Clock3 size={21} /></span>
          <div><span>Черновики</span><strong>{stats.drafts}</strong><small>ожидают завершения</small></div>
        </article>
        <article className="stat-card violet">
          <span className="stat-icon"><Building2 size={21} /></span>
          <div><span>Учреждений</span><strong>{stats.institutions}</strong><small>представили сведения</small></div>
        </article>
      </section>

      <section className="card filters-card">
        <div className="filter-title"><Filter size={17} /> Фильтры</div>
        <div className="filters-row">
          <label className="field compact grow">
            <span>Учреждение</span>
            <select value={institutionId} onChange={(event) => setInstitutionId(event.target.value)} disabled={user?.role === 'editor'}>
              <option value="">Все учреждения</option>
              {institutions.filter((item) => item.active).map((item) => <option value={item.id} key={item.id}>{item.shortName}</option>)}
            </select>
          </label>
          <label className="field compact">
            <span>Дата с</span>
            <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          </label>
          <label className="field compact">
            <span>Дата по</span>
            <input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </label>
          <label className="field compact search-field">
            <span>Поиск</span>
            <span className="input-with-icon"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Учреждение или автор" /></span>
          </label>
          <button className="button secondary icon-only desktop-refresh" onClick={() => void loadReports()} title="Обновить"><RefreshCw size={18} /></button>
        </div>
      </section>

      <section className="card reports-card">
        <div className="card-heading">
          <div><h2>Последние справки</h2><p>Найдено записей: {filteredReports.length}</p></div>
          <CalendarDays size={21} />
        </div>
        {error && <div className="inline-alert">{error}</div>}
        {loading ? <LoadingState /> : filteredReports.length === 0 ? (
          <EmptyState
            title="Справок пока нет"
            text="Создайте первую справку или измените параметры фильтра."
            action={user?.role !== 'viewer' && <Link className="button primary small" to="/new">Заполнить форму <ArrowRight size={16} /></Link>}
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Учреждение</th><th>Дата справки</th><th>Заполнение</th><th>Автор</th><th>Статус</th><th aria-label="Действия" /></tr></thead>
              <tbody>
                {filteredReports.map((report) => {
                  const completion = report.questionCount ? Math.round((report.answerCount / report.questionCount) * 100) : 0
                  return (
                    <tr key={`${report.id}-${report.pending ? 'local' : 'server'}`}>
                      <td><span className="institution-cell"><span className="table-avatar">{report.institutionShortName.slice(0, 2).toUpperCase()}</span><span><strong>{report.institutionShortName}</strong><small>{report.institutionName}</small></span></span></td>
                      <td><strong>{displayDate(report.reportDate)}</strong><small>{format(new Date(report.updatedAt), 'HH:mm')}</small></td>
                      <td><span className="progress-cell"><span><i style={{ width: `${Math.min(completion, 100)}%` }} /></span><small>{completion}%</small></span></td>
                      <td>{report.authorName}</td>
                      <td>{report.pending ? <span className="status pending"><RefreshCw size={13} /> В очереди</span> : report.status === 'submitted' ? <span className="status success">Отправлена</span> : <span className="status draft">Черновик</span>}</td>
                      <td><button className="icon-button table-action" onClick={() => setSelectedId(report.id)} title="Просмотреть"><Eye size={18} /></button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        open={Boolean(selectedId)}
        onClose={() => setSelectedId(null)}
        title="Сводная справка"
        subtitle={selectedReport ? `${selectedReport.institutionName} · ${displayDate(selectedReport.reportDate)}` : undefined}
        wide
      >
        {detailsLoading || !details ? <LoadingState /> : (
          <div className="report-preview">
            <div className="preview-meta">
              <div><span>Статус</span><strong>{selectedReport?.pending ? 'Ожидает отправки' : details.status === 'submitted' ? 'Отправлена' : 'Черновик'}</strong></div>
              <div><span>Ответов</span><strong>{Object.values(details.answers).filter(Boolean).length} из {activeQuestions.length}</strong></div>
              <div><span>Дата</span><strong>{displayDate(details.reportDate)}</strong></div>
            </div>
            <div className="preview-answers">
              {activeQuestions.map((question) => (
                <div className="preview-answer" key={question.id}>
                  <span>{question.text}</span>
                  <strong>{details.answers[question.id] === 'true' ? 'Да' : details.answers[question.id] === 'false' ? 'Нет' : String(details.answers[question.id] || '—')}</strong>
                </div>
              ))}
            </div>
            {details.comment && <div className="preview-comment"><span>Комментарий</span><p>{details.comment}</p></div>}
            <div className="modal-actions">
              {user?.role !== 'viewer' && <Link className="button secondary" to={`/reports/${details.id}/edit`}><Pencil size={17} /> Редактировать</Link>}
              <button className="button primary" onClick={() => void handleDownload()} disabled={selectedReport?.pending || downloading}>
                <Download size={17} /> {selectedReport?.pending ? 'После синхронизации' : downloading ? 'Подготовка…' : 'Скачать DOCX'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
