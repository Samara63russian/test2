import React from 'react';
import {
  Filter,
  Download,
  RotateCcw,
  User,
  SlidersHorizontal,
  FileSpreadsheet,
  FileJson
} from 'lucide-react';
import { CATEGORIES, STATUSES, URGENCIES } from '../constants';

export function FilterBar({
  filters,
  setFilters,
  managers = [],
  onResetDemoData,
  isSeeding
}) {
  const activeCategory = filters.category || 'ALL';
  const activeUrgency = filters.urgency || 'ALL';
  const activeStatus = filters.status || 'ALL';
  const activeManager = filters.assigned_to || 'ALL';

  const hasActiveFilters = activeCategory !== 'ALL' || activeUrgency !== 'ALL' || activeStatus !== 'ALL' || activeManager !== 'ALL';

  return (
    <div className="bg-slate-900/60 border-b border-slate-800/80 py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            onClick={() => setFilters({ ...filters, category: 'ALL' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeCategory === 'ALL'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            Все категории
          </button>

          {Object.entries(CATEGORIES).map(([catKey, cat]) => (
            <button
              key={catKey}
              onClick={() => setFilters({ ...filters, category: catKey })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === catKey
                  ? 'bg-slate-200 text-slate-900 font-semibold shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
              }`}
            >
              {cat.shortLabel}
            </button>
          ))}
        </div>

        {/* Secondary Filters & Export Actions */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          
          {/* Urgency Filter */}
          <select
            value={activeUrgency}
            onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">Срочность: Все</option>
            <option value="HIGH">🔥 Срочно (ASAP)</option>
            <option value="MEDIUM">⚡ Стандартно</option>
            <option value="LOW">🟢 Не срочно</option>
          </select>

          {/* Status Filter */}
          <select
            value={activeStatus}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">Статус: Все</option>
            {Object.entries(STATUSES).map(([stKey, st]) => (
              <option key={stKey} value={stKey}>{st.label}</option>
            ))}
          </select>

          {/* Manager Filter */}
          {managers.length > 0 && (
            <select
              value={activeManager}
              onChange={(e) => setFilters({ ...filters, assigned_to: e.target.value })}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Менеджер: Все</option>
              {managers.map(mgr => (
                <option key={mgr} value={mgr}>{mgr}</option>
              ))}
            </select>
          )}

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={() => setFilters({ category: 'ALL', urgency: 'ALL', status: 'ALL', assigned_to: 'ALL' })}
              title="Сбросить все фильтры"
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-all flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Сброс</span>
            </button>
          )}

          <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

          {/* Export CSV */}
          <a
            href="/api/requests/export/csv"
            download
            title="Экспорт в Excel / CSV"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">CSV</span>
          </a>

          {/* Export JSON */}
          <a
            href="/api/requests/export/json"
            download
            title="Экспорт резервной копии в JSON"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
          >
            <FileJson className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">JSON</span>
          </a>

          {/* Reset & Load Demo Data */}
          <button
            onClick={onResetDemoData}
            disabled={isSeeding}
            title="Перезагрузить демонстрационные запросы с ИИ-конспектами"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-amber-500/10 text-slate-400 hover:text-amber-400 border border-slate-700/80 hover:border-amber-500/30 transition-all disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Демо-данные</span>
          </button>

        </div>
      </div>
    </div>
  );
}
