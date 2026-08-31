import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { api } from '../api'
import type { AnalyticsSummary } from '../types'

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null)

  useEffect(() => {
    api.getAnalytics().then(setData).catch(console.error)
  }, [])

  if (!data) return <p>Загрузка аналитики...</p>

  return (
    <div>
      <h1 className="page-title">Аналитика</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2563eb' }}>{data.total_reports}</div>
          <div style={{ color: '#64748b' }}>Всего справок</div>
        </div>
        {data.reports_by_status.map((s) => (
          <div key={s.status} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{s.count}</div>
            <div style={{ color: '#64748b' }}>{s.status === 'submitted' ? 'Отправлено' : 'Черновики'}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
        <div className="card">
          <h3 style={{ margin: '0 0 1rem' }}>По учреждениям</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.reports_by_institution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 1rem' }}>По месяцам</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.reports_by_month}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ margin: '0 0 1rem' }}>Последние справки</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Учреждение</th>
              <th>Автор</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {data.recent_reports.map((r) => (
              <tr key={r.id}>
                <td>{new Date(r.report_date).toLocaleDateString('ru-RU')}</td>
                <td>{r.institution_name}</td>
                <td>{r.author_name}</td>
                <td>
                  <span className={`badge badge-${r.status}`}>
                    {r.status === 'submitted' ? 'Отправлена' : 'Черновик'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
