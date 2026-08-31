import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Filter,
  Plus,
  Search,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { api } from '../api'
import { Modal } from '../components/Modal'
import type { Institution, ReportDetail, ReportSummary, User } from '../types'
import { answerLabel, formatDate, formatShortDate, todayIso } from '../utils'

interface HomePageProps {
  user: User
  institutions: Institution[]
  reports: ReportSummary[]
  loading: boolean
  onOpenForm: () => void
  onFilter: (filters: { institution_id?: number; date_from?: string; date_to?: string }) => void
  notify: (message: string, kind?: 'success' | 'error') => void
}

export function HomePage({
  user,
  institutions,
  reports,
  loading,
  onOpenForm,
  onFilter,
  notify,
}: HomePageProps) {
  const defaultInstitution = user.role === 'operator' ? user.institution_id || undefined : undefined
  const [institutionId, setInstitutionId] = useState<number | undefined>(defaultInstitution)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [search, setSearch] = useState('')
  const [selectedReport, setSelectedReport] = useState<ReportDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return reports
    return reports.filter(
      (report) =>
        report.institution_name.toLowerCase().includes(query) ||
        report.author_name.toLowerCase().includes(query) ||
        formatShortDate(report.report_date).includes(query),
    )
  }, [reports, search])

  const today = todayIso()
  const todayReports = reports.filter((report) => report.report_date === today)
  const represented = new Set(todayReports.map((report) => report.institution_id)).size
  const drafts = reports.filter((report) => report.status === 'draft').length

  const openReport = async (id: number) => {
    setDetailLoading(true)
    try {
      setSelectedReport(await api.report(id))
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : 'Не удалось открыть справку', 'error')
    } finally {
      setDetailLoading(false)
    }
  }

  const download = async (id: number) => {
    try {
      await api.downloadDocument(id)
      notify('Документ подготовлен и загружен')
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : 'Не удалось скачать документ', 'error')
    }
  }

  return (
    <>
      <div className="page-heading heading-with-action">
        <div>
          <span className="eyebrow">Оперативная отчётность</span>
          <h1>Добрый день, {user.full_name.split(' ')[0]}</h1>
          <p>Контролируйте поступление справок и состояние учреждений.</p>
        </div>
        {user.role !== 'viewer' && (
          <button className="primary-button" onClick={onOpenForm}>
            <Plus size={18} /> Заполнить справку
          </button>
        )}
      </div>

      <section className="metric-grid">
        <article className="metric-card">
          <span className="metric-icon blue"><FileText size={21} /></span>
          <div><span>Справок сегодня</span><strong>{todayReports.length}</strong></div>
          <small className="positive"><CheckCircle2 size={14} /> Данные обновлены</small>
        </article>
        <article className="metric-card">
          <span className="metric-icon teal"><Building2 size={21} /></span>
          <div><span>Учреждений отчиталось</span><strong>{represented}<i> / {institutions.length}</i></strong></div>
          <small>{institutions.length ? Math.round((represented / institutions.length) * 100) : 0}% охват</small>
        </article>
        <article className="metric-card">
          <span className="metric-icon amber"><Clock3 size={21} /></span>
          <div><span>Ожидают завершения</span><strong>{drafts}</strong></div>
          <small>{drafts ? 'Есть незавершённые справки' : 'Все справки отправлены'}</small>
        </article>
      </section>

      <section className="panel filter-panel">
        <div className="panel-title compact-title">
          <div><Filter size={18} /><h2>Фильтры</h2></div>
          {(institutionId || dateFrom || dateTo) && (
            <button
              className="text-button"
              onClick={() => {
                setInstitutionId(defaultInstitution)
                setDateFrom('')
                setDateTo('')
                onFilter({ institution_id: defaultInstitution })
              }}
            >
              <X size={15} /> Сбросить
            </button>
          )}
        </div>
        <div className="filter-row">
          <label>
            <span>Учреждение</span>
            <select
              value={institutionId || ''}
              onChange={(event) =>
                setInstitutionId(event.target.value ? Number(event.target.value) : undefined)
              }
              disabled={user.role === 'operator'}
            >
              <option value="">Все учреждения</option>
              {institutions.map((institution) => (
                <option key={institution.id} value={institution.id}>{institution.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Дата с</span>
            <div className="input-with-icon">
              <CalendarDays size={17} />
              <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
            </div>
          </label>
          <label>
            <span>Дата по</span>
            <div className="input-with-icon">
              <CalendarDays size={17} />
              <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
            </div>
          </label>
          <button
            className="secondary-button apply-filter"
            onClick={() => onFilter({ institution_id: institutionId, date_from: dateFrom, date_to: dateTo })}
          >
            Применить
          </button>
        </div>
      </section>

      <section className="panel reports-panel">
        <div className="panel-title">
          <div>
            <h2>Последние справки</h2>
            <p>{reports.length} записей по выбранным условиям</p>
          </div>
          <div className="table-search">
            <Search size={17} />
            <input
              placeholder="Найти учреждение…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table reports-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Учреждение</th>
                <th>Ответственный</th>
                <th>Статус</th>
                <th aria-label="Действия" />
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id}>
                  <td><strong>{formatShortDate(report.report_date)}</strong></td>
                  <td>
                    <div className="institution-cell">
                      <span>{report.institution_short_name.slice(0, 3).toUpperCase()}</span>
                      <div><strong>{report.institution_short_name}</strong><small>{report.institution_name}</small></div>
                    </div>
                  </td>
                  <td>{report.author_name}</td>
                  <td>
                    <span className={`status-badge ${report.status}`}>
                      {report.status === 'submitted' ? 'Отправлена' : 'Черновик'}
                    </span>
                  </td>
                  <td>
                    <button className="row-action" onClick={() => openReport(report.id)}>
                      Открыть <ArrowRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredReports.length === 0 && (
            <div className="empty-state">
              <FileText size={32} />
              <strong>Справки не найдены</strong>
              <span>Измените условия фильтра или создайте новую справку.</span>
            </div>
          )}
          {loading && <div className="loading-row">Загружаем справки…</div>}
        </div>
      </section>

      {detailLoading && <div className="global-loader">Загрузка…</div>}
      {selectedReport && (
        <Modal
          title={`Справка от ${formatDate(selectedReport.report_date)}`}
          subtitle={selectedReport.institution_name}
          onClose={() => setSelectedReport(null)}
          wide
        >
          <div className="report-meta">
            <span><small>Статус</small><strong>{selectedReport.status === 'submitted' ? 'Отправлена' : 'Черновик'}</strong></span>
            <span><small>Ответственный</small><strong>{selectedReport.author_name}</strong></span>
            <span><small>Ответов</small><strong>{selectedReport.answer_details.length}</strong></span>
          </div>
          <div className="report-answers">
            {selectedReport.answer_details.map((answer, index) => (
              <div className="report-answer" key={answer.question_id}>
                <span>{index + 1}</span>
                <div>
                  <small>{answer.question}</small>
                  <strong>{answerLabel(answer.value, answer.answer_type)}</strong>
                </div>
              </div>
            ))}
          </div>
          {selectedReport.comment && (
            <div className="report-comment"><strong>Комментарий</strong><p>{selectedReport.comment}</p></div>
          )}
          <footer className="modal-actions">
            <button className="secondary-button" onClick={() => setSelectedReport(null)}>Закрыть</button>
            <button className="primary-button" onClick={() => download(selectedReport.id)}>
              <Download size={17} /> Скачать документ
            </button>
          </footer>
        </Modal>
      )}
    </>
  )
}
