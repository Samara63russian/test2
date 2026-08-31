import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Calendar, 
  Layers, 
  PieChart as PieIcon,
  Download,
  Award,
  ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import { analyticsService } from '../services/api';

const COLORS = ['#0d9488', '#0284c7', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getOverview();
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-16 text-center text-slate-400 space-y-3">
        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-sm font-medium">Сбор и расчет аналитических данных...</p>
      </div>
    );
  }

  // Format category data for Pie / Bar chart
  const categoryChartData = Object.entries(data.inspections_by_category || {}).map(([name, value]) => ({
    name,
    value,
    compliance: data.compliance_by_category?.[name] || 0
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-teal-600 text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Сводная аналитика и статистика</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Аналитическая панель мониторинга качества
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Комплексные метрики соответствия нормам, динамика обследований и выявление системных нарушений.
          </p>
        </div>
        <a
          href="/api/reports/download/excel"
          download
          className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition shrink-0"
        >
          <Download className="w-4 h-4 text-teal-400" />
          <span>Выгрузить аналитический отчет (XLSX)</span>
        </a>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Всего учреждений</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{data.total_institutions}</div>
          <div className="text-[11px] text-teal-600 font-medium">В активном реестре</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Проведено проверок</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{data.total_reports}</div>
          <div className="text-[11px] text-blue-600 font-medium">Сформировано справок</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Средний балл качества</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{data.average_score}%</div>
          <div className="text-[11px] text-emerald-700 font-medium">Общий показатель нормы</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Критериев в чек-листе</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{data.total_questions}</div>
          <div className="text-[11px] text-purple-600 font-medium">Утвержденных вопросов</div>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Inspections by Category */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Распределение проверок по отраслям
              </h3>
              <p className="text-xs text-slate-400">Количество справок по категориям объектов</p>
            </div>
            <PieIcon className="w-4 h-4 text-teal-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Trends */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Динамика проверок и средний балл по месяцам
              </h3>
              <p className="text-xs text-slate-400">Тренды проведения аудитов</p>
            </div>
            <BarChart3 className="w-4 h-4 text-teal-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthly_trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" orientation="left" stroke="#0f766e" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#6366f1" tick={{ fontSize: 11 }} domain={[60, 100]} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar yAxisId="left" dataKey="inspections" name="Кол-во справок" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="avg_score" name="Средний балл (%)" stroke="#6366f1" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top & Low Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Institutions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Лидеры по соблюдению нормативов (Топ-5)</span>
            </h3>
          </div>

          <div className="space-y-3">
            {data.top_institutions?.map((inst, idx) => (
              <div key={inst.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition text-xs">
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">{inst.name}</div>
                    <div className="text-[10px] text-slate-500">{inst.category} • Проверок: {inst.count}</div>
                  </div>
                </div>
                <div className="font-black text-sm text-emerald-600">
                  {inst.score.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Frequent Deficiencies / Non-compliant Questions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Часто выявляемые нарушения и замечания</span>
            </h3>
          </div>

          <div className="space-y-3">
            {data.low_compliance_questions?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Критических нарушений не зафиксировано</p>
            ) : (
              data.low_compliance_questions?.map((q) => (
                <div key={q.id} className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-800">
                      {q.code ? `[${q.code}] ` : ''}{q.text}
                    </span>
                    <span className="font-black text-rose-700 shrink-0 ml-2">
                      {q.non_compliant_count} наруш. ({q.fail_rate}%)
                    </span>
                  </div>
                  <div className="w-full bg-rose-200/50 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-rose-600 h-full rounded-full" style={{ width: `${Math.min(100, q.fail_rate)}%` }}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
