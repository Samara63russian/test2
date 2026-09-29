import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  Award,
  CheckCircle,
  Clock,
  Layers,
  PieChart as PieIcon,
  BarChart3,
  Users
} from 'lucide-react';
import { api } from '../api';
import { formatCurrency } from '../constants';

const CATEGORY_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#a855f7', '#64748b'];
const URGENCY_COLORS = ['#f43f5e', '#f59e0b', '#94a3b8'];

export function AnalyticsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.getAnalyticsDashboard();
      setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Загрузка аналитики и показателей...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-12 text-center text-rose-400 text-xs">
        Ошибка загрузки аналитики: {error}
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Inflow */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Всего запросов</span>
            <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {data.totalRequests}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Обработано ИИ: 100%
          </p>
        </div>

        {/* Pipeline Budget */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Общий объем пайплайна</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2 truncate">
            {formatCurrency(data.totalPipelineBudget)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Сумма открытых запросов и КП
          </p>
        </div>

        {/* Won Deals Budget */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Выигранные сделки</span>
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-indigo-400 mt-2 truncate">
            {formatCurrency(data.wonBudget)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Конверсия в оплату: <span className="font-semibold text-white">{data.conversionRate}%</span>
          </p>
        </div>

        {/* AI Confidence */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Точность ИИ-анализа</span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-400 mt-2">
            {(data.avgConfidence * 100).toFixed(0)}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Автоматическая классификация
          </p>
        </div>

      </div>

      {/* Charts Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown Donut */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              <span>Распределение по категориям запросов</span>
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryStats}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {data.categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel Stages Bar Chart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              <span>Воронка обработки обращений</span>
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.funnelStages}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="count" name="Количество" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bottom Grid: Top Clients & Manager Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Clients */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Топ компаний по объему запросов</span>
          </h3>
          <div className="space-y-2">
            {data.topCompanies.map((comp, idx) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-100">{comp.sender_company}</div>
                  <div className="text-[11px] text-slate-400">{comp.count} обращений</div>
                </div>
                <div className="font-bold text-emerald-400">
                  {formatCurrency(comp.total_budget)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manager Workload */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Нагрузка и результативность менеджеров</span>
          </h3>
          <div className="space-y-2">
            {data.managerWorkload.map((mgr, idx) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-100">{mgr.assigned_to}</div>
                  <div className="text-[11px] text-slate-400">В работе: {mgr.count} запросов</div>
                </div>
                <div className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  {mgr.processed_count} обработано
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
