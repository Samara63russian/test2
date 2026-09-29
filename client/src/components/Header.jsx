import React, { useState } from 'react';
import {
  Mail,
  Sparkles,
  Plus,
  Upload,
  RefreshCw,
  Dices,
  Settings,
  LayoutGrid,
  Table as TableIcon,
  Columns,
  BarChart3,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { formatCurrency } from '../constants';

export function Header({
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  stats,
  onOpenNewModal,
  onOpenUploadModal,
  onOpenSettingsModal,
  onFetchImap,
  onGenerateSample,
  isFetchingImap,
  isGeneratingSample,
  isLiveConnected
}) {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 min-w-max">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  EmailAI Tracker
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Free AI
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Отслеживание запросов на КП, перечней и автоматический ИИ-конспект
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск по теме, компании, ФИО, ИНН или конспекту..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-800/80 hover:bg-slate-800 focus:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* Generate Random Test Email */}
            <button
              onClick={onGenerateSample}
              disabled={isGeneratingSample}
              title="Сгенерировать случайное входящее письмо для тестирования"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-lg transition-all disabled:opacity-50"
            >
              <Dices className={`w-3.5 h-3.5 text-amber-400 ${isGeneratingSample ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline">Тест-письмо</span>
            </button>

            {/* Fetch IMAP */}
            <button
              onClick={onFetchImap}
              disabled={isFetchingImap}
              title="Проверить почту по IMAP"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-lg transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isFetchingImap ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Собрать с IMAP</span>
            </button>

            {/* Upload EML */}
            <button
              onClick={onOpenUploadModal}
              title="Загрузить файл письма (.eml)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-lg transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Импорт .EML</span>
            </button>

            {/* New Request Button */}
            <button
              onClick={onOpenNewModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Создать запрос</span>
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettingsModal}
              title="Настройки ИИ и IMAP почты"
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-transparent hover:border-slate-700 rounded-lg transition-all"
            >
              <Settings className="w-4 h-4" />
            </button>

          </div>
        </div>

        {/* Sub-bar: KPI Stats & View Mode Switcher */}
        <div className="py-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Quick Stats Badges */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/60 text-slate-300">
              <span className="text-slate-400">Всего:</span>
              <span className="font-bold text-white">{stats.total || 0}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <span>Запросы КП:</span>
              <span className="font-bold">{stats.categoryCounts?.RFQ || 0}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <span>Спецификации:</span>
              <span className="font-bold">{stats.categoryCounts?.SPEC_LIST || 0}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <span>🔥 Срочные:</span>
              <span className="font-bold">{stats.urgencyCounts?.HIGH || 0}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <span>В работе:</span>
              <span className="font-bold">{stats.statusCounts?.IN_PROGRESS || 0}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <span>КП готово:</span>
              <span className="font-bold">{stats.statusCounts?.QUOTE_PREPARED || 0}</span>
            </div>

            {isLiveConnected && (
              <div className="hidden xl:flex items-center gap-1 text-[11px] text-emerald-400/80 px-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </div>
            )}
          </div>

          {/* View Modes Switcher */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                viewMode === 'kanban'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Канбан</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                viewMode === 'table'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Таблица</span>
            </button>

            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                viewMode === 'cards'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Карточки</span>
            </button>

            <button
              onClick={() => setViewMode('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                viewMode === 'analytics'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Аналитика</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
