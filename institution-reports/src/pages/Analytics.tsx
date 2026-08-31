import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Building2, CheckCircle2, ClipboardCheck, TrendingUp } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { format, parse } from 'date-fns'
import { ru } from 'date-fns/locale'
import { EmptyState, LoadingState, PageHeader } from '../components/UI'
import { api } from '../lib/api'
import type { AnalyticsData } from '../types'

const palette = ['#4978c7', '#46a884', '#e4a948', '#d5636c', '#8069c8']

export function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api<AnalyticsData>('/analytics')
      .then(setData)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Не удалось загрузить аналитику'))
      .finally(() => setLoading(false))
  }, [])

  const totals = useMemo(() => {
    const reports = data?.byInstitution.reduce((sum, item) => sum + Number(item.reports), 0) ?? 0
    const submitted = data?.byInstitution.reduce((sum, item) => sum + Number(item.submitted), 0) ?? 0
    return {
      reports,
      submitted,
      completion: reports ? Math.round((submitted / reports) * 100) : 0,
      institutions: data?.byInstitution.length ?? 0,
    }
  }, [data])

  const monthData = useMemo(
    () =>
      data?.byMonth.map((item) => ({
        ...item,
        reports: Number(item.reports),
        label: format(parse(item.month, 'yyyy-MM', new Date()), 'LLL yy', { locale: ru }),
      })) ?? [],
    [data],
  )

  if (loading) return <div className="page"><LoadingState /></div>

  return (
    <div className="page analytics-page">
      <PageHeader
        eyebrow="Динамика и показатели"
        title="Аналитика"
        description="Сводная картина по предоставленным учреждениями данным"
      />
      {error && <div className="inline-alert danger">{error}</div>}

      <section className="stats-grid analytics-stats">
        <article className="stat-card blue"><span className="stat-icon"><ClipboardCheck size={21} /></span><div><span>Всего справок</span><strong>{totals.reports}</strong><small>за всё время</small></div></article>
        <article className="stat-card green"><span className="stat-icon"><CheckCircle2 size={21} /></span><div><span>Готовность</span><strong>{totals.completion}%</strong><small>{totals.submitted} отправлено</small></div></article>
        <article className="stat-card violet"><span className="stat-icon"><Building2 size={21} /></span><div><span>Учреждений</span><strong>{totals.institutions}</strong><small>со справками</small></div></article>
        <article className="stat-card amber"><span className="stat-icon"><TrendingUp size={21} /></span><div><span>За последний месяц</span><strong>{monthData.at(-1)?.reports ?? 0}</strong><small>новых справок</small></div></article>
      </section>

      {!data || totals.reports === 0 ? (
        <section className="card"><EmptyState title="Недостаточно данных" text="Аналитика появится после отправки первых справок." /></section>
      ) : (
        <>
          <section className="analytics-grid">
            <article className="card chart-card chart-wide">
              <div className="card-heading"><div><h2>Динамика заполнения</h2><p>Количество справок по месяцам</p></div><BarChart3 size={20} /></div>
              <div className="chart-area">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthData} margin={{ left: -18, right: 8, top: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf4" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#748195', fontSize: 12 }} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#748195', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: '#f4f7fb' }} contentStyle={{ border: '1px solid #e1e6ee', borderRadius: 10, boxShadow: '0 6px 20px rgba(35,55,80,.08)' }} />
                    <Bar dataKey="reports" name="Справок" fill="#4978c7" radius={[6, 6, 0, 0]} maxBarSize={42} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="card chart-card">
              <div className="card-heading"><div><h2>Оценка ситуации</h2><p>Распределение ответов</p></div></div>
              <div className="chart-area pie-area">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.statusAnswers.map((item) => ({ ...item, value: Number(item.value) }))} dataKey="value" nameKey="name" innerRadius={55} outerRadius={84} paddingAngle={3}>
                      {data.statusAnswers.map((item, index) => <Cell key={item.name} fill={palette[index % palette.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ border: '1px solid #e1e6ee', borderRadius: 10 }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>

          <section className="card ranking-card">
            <div className="card-heading"><div><h2>Активность учреждений</h2><p>Количество созданных и отправленных справок</p></div></div>
            <div className="ranking-list">
              {data.byInstitution.map((item, index) => {
                const reports = Number(item.reports)
                const submitted = Number(item.submitted)
                const width = Math.round((reports / Math.max(...data.byInstitution.map((candidate) => Number(candidate.reports)))) * 100)
                return (
                  <div className="ranking-row" key={item.name}>
                    <span className="rank">{index + 1}</span>
                    <strong>{item.name}</strong>
                    <span className="ranking-bar"><i style={{ width: `${width}%` }} /></span>
                    <span><b>{reports}</b> справок</span>
                    <span className="status success">{submitted} готово</span>
                  </div>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
