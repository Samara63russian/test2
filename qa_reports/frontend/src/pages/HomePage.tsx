import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import type { Institution, Report } from '../types'

export default function HomePage() {
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [institutionId, setInstitutionId] = useState<number | ''>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getInstitutions().then(setInstitutions).catch(console.error)
  }, [])

  useEffect(() => {
    setLoading(true)
    const params: { institution_id?: number; date_from?: string; date_to?: string } = {}
    if (institutionId) params.institution_id = institutionId
    if (dateFrom) params.date_from = new Date(dateFrom).toISOString()
    if (dateTo) {
      const d = new Date(dateTo)
      d.setHours(23, 59, 59)
      params.date_to = d.toISOString()
    }
    api.getReports(params)
      .then(setReports)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [institutionId, dateFrom, dateTo])

  const handleExport = async (id: number) => {
    try {
      const blob = await api.exportReport(id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `spravka_${id}.docx`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Ошибка скачивания документа')
    }
  }

  return (
    <div>
      <h1 className="page-title">Главная — Справки по учреждениям</h1>

      <div className="card">
        <div className="filters">
          <div className="form-group">
            <label>Учреждение</label>
            <select value={institutionId} onChange={(e) => setInstitutionId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">Все учреждения</option>
              {institutions.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Дата с</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Дата по</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>
        <Link to="/form" className="btn btn-primary">+ Новая справка</Link>
      </div>

      <div className="card">
        {loading ? (
          <p>Загрузка...</p>
        ) : reports.length === 0 ? (
          <p style={{ color: '#64748b' }}>Справки не найдены</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Учреждение</th>
                <th>Автор</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.report_date).toLocaleDateString('ru-RU')}</td>
                  <td>{r.institution_name}</td>
                  <td>{r.author_name}</td>
                  <td>
                    <span className={`badge badge-${r.status}`}>
                      {r.status === 'submitted' ? 'Отправлена' : 'Черновик'}
                    </span>
                  </td>
                  <td>
                    <Link to={`/form/${r.id}`} className="btn btn-secondary" style={{ marginRight: '0.5rem', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                      Открыть
                    </Link>
                    <button className="btn btn-success" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => handleExport(r.id)}>
                      DOCX
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
