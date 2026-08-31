import {
  AlertTriangle,
  BarChart3,
  Building2,
  CalendarRange,
  CheckCircle2,
  FileText,
  TrendingUp,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { api } from '../api'
import type { AnalyticsData, Institution, User } from '../types'
import { formatShortDate } from '../utils'

interface AnalyticsPageProps {
  institutions: Institution[]
  user: User
  notify: (message: string, kind?: 'success' | 'error') => void
}

const levelColors: Record<string, string> = {
  Низкий: '#4cae9b',
  Средний: '#3e78d7',
  Высокий: '#e9a23b',
  Критический: '#d85c61',
}

const emptyAnalytics: AnalyticsData = {
  summary: { total_reports: 0, today_reports: 0, coverage: 0, incidents: 0 },
  daily: [],
  institutions: [],
  levels: [],
}

export function AnalyticsPage({ institutions, user, notify }: AnalyticsPageProps) {
  const [institutionId, setInstitutionId] = useState<number | undefined>(
    user.role === 'operator' ? user.institution_id || undefined : undefined,
  )
  const [days, setDays] = useState(30)
  const [data, setData] = useState<AnalyticsData>(emptyAnalytics)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    queueMicrotask(() => active && setLoading(true))
    api.analytics(institutionId, days)
      .then((result) => active && setData(result))
      .catch((reason) => notify(reason instanceof Error ? reason.message : 'Не удалось загрузить аналитику', 'error'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [days, institutionId, notify])

  const daily = data.daily.map((item) => ({
    ...item,
    label: new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit' }).format(
      new Date(`${item.date}T12:00:00`),
    ),
  }))

  return (
    <>
      <div className="page-heading heading-with-action">
        <div>
          <span className="eyebrow">Сводные показатели</span>
          <h1>Аналитика</h1>
          <p>Динамика поступления справок и ключевые показатели учреждений.</p>
        </div>
        <div className="analytics-filters">
          <label>
            <Building2 size={16} />
            <select
              value={institutionId || ''}
              disabled={user.role === 'operator'}
              onChange={(event) => setInstitutionId(event.target.value ? Number(event.target.value) : undefined)}
            >
              <option value="">Все учреждения</option>
              {institutions.map((institution) => (
                <option key={institution.id} value={institution.id}>{institution.short_name}</option>
              ))}
            </select>
          </label>
          <label>
            <CalendarRange size={16} />
            <select value={days} onChange={(event) => setDays(Number(event.target.value))}>
              <option value={7}>7 дней</option>
              <option value={30}>30 дней</option>
              <option value={90}>90 дней</option>
              <option value={365}>1 год</option>
            </select>
          </label>
        </div>
      </div>

      <section className="metric-grid analytics-metrics">
        <article className="metric-card">
          <span className="metric-icon blue"><FileText size={21} /></span>
          <div><span>Всего справок</span><strong>{data.summary.total_reports}</strong></div>
          <small><TrendingUp size={14} /> За выбранный период</small>
        </article>
        <article className="metric-card">
          <span className="metric-icon teal"><CheckCircle2 size={21} /></span>
          <div><span>Охват сегодня</span><strong>{data.summary.coverage}<i>%</i></strong></div>
          <small>{data.summary.today_reports} учреждений отчиталось</small>
        </article>
        <article className="metric-card">
          <span className="metric-icon red"><AlertTriangle size={21} /></span>
          <div><span>Требуют внимания</span><strong>{data.summary.incidents}</strong></div>
          <small>Дефицит или происшествия</small>
        </article>
      </section>

      <div className={`analytics-grid ${loading ? 'loading-content' : ''}`}>
        <section className="panel chart-card chart-wide">
          <div className="panel-title">
            <div><h2>Динамика поступления справок</h2><p>Последние {Math.min(days, 14)} дней</p></div>
            <span className="chart-legend"><i /> Справки</span>
          </div>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily} margin={{ top: 8, right: 12, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="reportsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#316bd1" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#316bd1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e8edf3" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#7b8798' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#7b8798' }} axisLine={false} tickLine={false} />
                <Tooltip
                  labelFormatter={(_, payload) => payload?.[0] ? formatShortDate(payload[0].payload.date as string) : ''}
                  formatter={(value) => [String(value), 'Справок']}
                />
                <Area type="monotone" dataKey="reports" stroke="#316bd1" strokeWidth={2.5} fill="url(#reportsGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel chart-card">
          <div className="panel-title">
            <div><h2>Уровень загрузки</h2><p>По последним справкам</p></div>
          </div>
          <div className="donut-layout">
            <div className="donut-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.levels} dataKey="value" nameKey="level" innerRadius={58} outerRadius={82} paddingAngle={3}>
                    {data.levels.map((item) => (
                      <Cell key={item.level} fill={levelColors[item.level] || '#8da0b7'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [String(value), 'Справок']} />
                </PieChart>
              </ResponsiveContainer>
              <span><strong>{data.levels.reduce((sum, item) => sum + item.value, 0)}</strong><small>ответов</small></span>
            </div>
            <div className="donut-legend">
              {data.levels.map((item) => (
                <div key={item.level}>
                  <i style={{ background: levelColors[item.level] || '#8da0b7' }} />
                  <span>{item.level}</span><strong>{item.value}</strong>
                </div>
              ))}
              {!data.levels.length && <small>Пока нет данных</small>}
            </div>
          </div>
        </section>

        <section className="panel chart-card chart-wide">
          <div className="panel-title">
            <div><h2>Активность учреждений</h2><p>Количество отправленных справок</p></div>
            <BarChart3 size={20} />
          </div>
          <div className="chart-box short-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.institutions} layout="vertical" margin={{ top: 0, right: 20, left: 12, bottom: 0 }}>
                <CartesianGrid stroke="#e8edf3" strokeDasharray="4 4" horizontal={false} />
                <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 12, fill: '#4a5668' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [String(value), 'Справок']} />
                <Bar dataKey="reports" fill="#3d78d8" radius={[0, 5, 5, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </>
  )
}
