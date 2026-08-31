import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Calendar, 
  FileDown, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  FileText, 
  Eye, 
  Trash2,
  Download,
  Share2,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { institutionService, reportService } from '../services/api';

export default function Dashboard({ onNewReport, onViewReport }) {
  const [institutions, setInstitutions] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedInstId, setSelectedInstId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeReportModal, setActiveReportModal] = useState(null);

  useEffect(() => {
    loadData();
  }, [selectedInstId, startDate, endDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [instData, repData] = await Promise.all([
        institutionService.getAll(),
        reportService.getAll({
          institution_id: selectedInstId || undefined,
          start_date: startDate ? new Date(startDate).toISOString() : undefined,
          end_date: endDate ? new Date(endDate).toISOString() : undefined,
        })
      ]);
      setInstitutions(instData);
      setReports(repData);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Вы действительно хотите удалить данную справку?')) {
      try {
        await reportService.delete(id);
        setReports(reports.filter(r => r.id !== id));
        if (activeReportModal?.id === id) {
          setActiveReportModal(null);
        }
      } catch (err) {
        alert('Ошибка при удалении справки');
      }
    }
  };

  const categories = Array.from(new Set(institutions.map(i => i.category).filter(Boolean)));

  const filteredReports = reports.filter(r => {
    const matchesSearch = searchQuery === '' || 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.institution_name && r.institution_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.inspector_name && r.inspector_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || r.institution_category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedInstObj = institutions.find(i => i.id === Number(selectedInstId));

  return (
    <div className="space-y-6">
      {/* Top Banner & Fast Actions */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold backdrop-blur-sm border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Единый реестр обследований и справок</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Сводные справки по учреждениям
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Выберите учреждение из справочника и настройте временной интервал для просмотра детальных опросных листов, итоговых заключений и скачивания официальных документов.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={onNewReport}
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-emerald-500/30 transition duration-150"
          >
            <Plus className="w-5 h-5" />
            <span>Заполнить справку</span>
          </button>
          <a
            href="/api/reports/download/excel"
            download
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white px-4 py-3 rounded-xl font-semibold backdrop-blur-sm border border-white/20 transition duration-150"
            title="Выгрузить общую сводную ведомость по всем учреждениям"
          >
            <Download className="w-5 h-5 text-teal-300" />
            <span>Экспорт в Excel</span>
          </a>
        </div>
      </div>

      {/* Filter and Selection Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-slate-800 font-semibold text-sm">
            <Filter className="w-4 h-4 text-teal-600" />
            <span>Панель фильтрации и выбора учреждения</span>
          </div>
          {(selectedInstId || startDate || endDate || searchQuery || selectedCategory) && (
            <button
              onClick={() => {
                setSelectedInstId('');
                setStartDate('');
                setEndDate('');
                setSearchQuery('');
                setSelectedCategory('');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium"
            >
              Сбросить все фильтры
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Select Institution */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Учреждение:</span>
            </label>
            <select
              value={selectedInstId}
              onChange={(e) => setSelectedInstId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            >
              <option value="">— Все учреждения ({institutions.length}) —</option>
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} {inst.code ? `[${inst.code}]` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-600" />
              <span>Отрасль / Категория:</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            >
              <option value="">— Все отрасли —</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Start */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>Дата проверки с:</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            />
          </div>

          {/* Date Range End */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>Дата проверки по:</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            />
          </div>
        </div>

        {/* Text Search Bar */}
        <div className="pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Поиск по названию справки, учреждению, ФИО проверяющего..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-sm rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Institution Info Card (If specific institution selected) */}
      {selectedInstObj && (
        <div className="bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-2xl p-6 shadow-md border border-teal-800/40 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                Карточка учреждения
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">
                {selectedInstObj.name}
              </h2>
              <div className="text-sm text-slate-300 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                <span>Отрасль: <b className="text-white">{selectedInstObj.category || '—'}</b></span>
                <span>Код: <b className="text-white">{selectedInstObj.code || '—'}</b></span>
                <span>Адрес: <b className="text-white">{selectedInstObj.address || '—'}</b></span>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-white/10 px-4 py-3 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="text-right">
                <div className="text-xs text-slate-300">Всего проверок</div>
                <div className="text-xl font-extrabold text-teal-300">{reports.length}</div>
              </div>
              <div className="h-8 w-px bg-white/20"></div>
              <div className="text-right">
                <div className="text-xs text-slate-300">Средний балл</div>
                <div className="text-xl font-extrabold text-emerald-400">
                  {reports.length > 0
                    ? (reports.reduce((acc, r) => acc + r.score, 0) / reports.length).toFixed(1) + '%'
                    : '—'}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
            <div>Руководитель: <span className="font-semibold text-white">{selectedInstObj.head_name || 'Не указан'}</span></div>
            <div>Телефон: <span className="font-semibold text-white">{selectedInstObj.phone || 'Не указан'}</span></div>
            <div>Email: <span className="font-semibold text-white">{selectedInstObj.email || 'Не указан'}</span></div>
          </div>
        </div>
      )}

      {/* Reports List / Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <h2 className="font-bold text-slate-900">
              Сформированные справки и опросные листы ({filteredReports.length})
            </h2>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Нажмите на строку для детального просмотра и скачивания документов
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm">Загрузка данных...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <p className="font-semibold text-slate-700">Справки не найдены</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                По выбранным параметрам поиска и учреждениям не найдено ни одной справки.
              </p>
            </div>
            <button
              onClick={onNewReport}
              className="inline-flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition"
            >
              <Plus className="w-4 h-4" />
              <span>Создать первую справку</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReports.map((r) => {
              const inspDate = new Date(r.inspection_date);
              const dateFormatted = inspDate.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              const isGood = r.score >= 85;
              const isMedium = r.score >= 70 && r.score < 85;

              return (
                <div
                  key={r.id}
                  onClick={() => setActiveReportModal(r)}
                  className="p-5 hover:bg-slate-50/80 transition-all cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        № {r.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                        {r.institution_category || 'Организация'}
                      </span>
                      <div className="flex items-center space-x-1 text-xs text-slate-500 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{dateFormatted}</span>
                      </div>
                      {r.client_uuid && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 text-emerald-800 flex items-center space-x-1" title="Синхронизировано из мобильного приложения инспектора">
                          <span>Android Sync</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-teal-700 transition flex items-center space-x-2">
                        <span>{r.title}</span>
                      </h3>
                      <div className="text-sm font-medium text-slate-600 mt-0.5 flex items-center space-x-1.5">
                        <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{r.institution_name}</span>
                      </div>
                    </div>

                    {r.summary_text && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed bg-slate-50/60 p-2.5 rounded-lg border border-slate-100">
                        {r.summary_text}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                      <span>Инспектор: <b className="text-slate-700">{r.inspector_name || '—'}</b></span>
                      <span>Ответов в чек-листе: <b className="text-slate-700">{r.answers?.length || 0}</b></span>
                    </div>
                  </div>

                  {/* Score & Action Buttons */}
                  <div className="flex sm:items-center justify-between lg:justify-end gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-[11px] text-slate-400 font-medium">Оценка соответствия</div>
                        <div className="text-xs font-bold text-slate-600">
                          {isGood ? 'Высокая норма' : isMedium ? 'С замечаниями' : 'Критично'}
                        </div>
                      </div>
                      <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-sm shadow-sm border ${
                        isGood
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : isMedium
                          ? 'bg-amber-50 border-amber-300 text-amber-700'
                          : 'bg-rose-50 border-rose-300 text-rose-700'
                      }`}>
                        <span>{r.score.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <a
                        href={`/api/reports/${r.id}/download/pdf`}
                        download
                        onClick={(e) => e.stopPropagation()}
                        title="Скачать официальную PDF-справку"
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 transition border border-slate-200"
                      >
                        <FileDown className="w-4 h-4" />
                      </a>
                      <a
                        href={`/api/reports/${r.id}/download/docx`}
                        download
                        onClick={(e) => e.stopPropagation()}
                        title="Скачать документ Word (DOCX)"
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition border border-slate-200"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={(e) => handleDeleteReport(r.id, e)}
                        title="Удалить справку"
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition border border-slate-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:translate-x-0.5 transition">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detailed Report Modal */}
      {activeReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-900 to-slate-900 p-6 text-white flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-1">
                  <span>Справка № {activeReportModal.id}</span>
                  <span>•</span>
                  <span>{new Date(activeReportModal.inspection_date).toLocaleDateString('ru-RU')}</span>
                </div>
                <h2 className="text-xl font-bold leading-snug">
                  {activeReportModal.title}
                </h2>
                <div className="text-sm text-slate-300 mt-1 flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-teal-400" />
                  <span>{activeReportModal.institution_name}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveReportModal(null)}
                className="text-slate-300 hover:text-white p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
              {/* Summary Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Итоговый балл</div>
                  <div className="text-xl font-black text-teal-700">{activeReportModal.score.toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Категория</div>
                  <div className="text-sm font-bold text-slate-800">{activeReportModal.institution_category || '—'}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Проверяющий</div>
                  <div className="text-sm font-bold text-slate-800">{activeReportModal.inspector_name || '—'}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Статус</div>
                  <div className="text-sm font-bold text-emerald-600">Завершена и подписана</div>
                </div>
              </div>

              {/* Summary and Recommendations */}
              {activeReportModal.summary_text && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Сводное заключение:</h4>
                  <p className="text-sm text-slate-700 bg-teal-50/50 p-3.5 rounded-xl border border-teal-100 leading-relaxed">
                    {activeReportModal.summary_text}
                  </p>
                </div>
              )}

              {activeReportModal.recommendations && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Предписания и рекомендации:</h4>
                  <p className="text-sm text-slate-700 bg-amber-50/50 p-3.5 rounded-xl border border-amber-100 leading-relaxed whitespace-pre-line">
                    {activeReportModal.recommendations}
                  </p>
                </div>
              )}

              {/* Answers Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Ответы на вопросы чек-листа ({activeReportModal.answers?.length || 0}):
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                    <thead className="bg-slate-50 font-bold text-slate-700">
                      <tr>
                        <th className="px-3.5 py-2.5">№</th>
                        <th className="px-3.5 py-2.5">Вопрос / Критерий</th>
                        <th className="px-3.5 py-2.5">Ответ</th>
                        <th className="px-3.5 py-2.5">Норма</th>
                        <th className="px-3.5 py-2.5">Комментарий</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {activeReportModal.answers?.map((ans, idx) => (
                        <tr key={ans.id || idx} className="hover:bg-slate-50/60">
                          <td className="px-3.5 py-2.5 text-slate-400 font-medium">{idx + 1}</td>
                          <td className="px-3.5 py-2.5 font-medium text-slate-900 max-w-xs">
                            <div className="text-[10px] text-teal-600 font-semibold">{ans.question_category}</div>
                            {ans.question_text || `Вопрос #${ans.question_id}`}
                          </td>
                          <td className="px-3.5 py-2.5 font-semibold text-slate-800">
                            {ans.value === 'true' || ans.value === true ? 'Да' : ans.value === 'false' || ans.value === false ? 'Нет' : ans.value}
                          </td>
                          <td className="px-3.5 py-2.5">
                            {ans.is_compliant ? (
                              <span className="inline-flex items-center text-emerald-600 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Да
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-rose-600 font-bold">
                                <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Нет
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-500">
                            {ans.comment || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer with Download buttons */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Документ сгенерирован автоматически и готов к печати и выгрузке.
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={`/api/reports/${activeReportModal.id}/download/pdf`}
                  download
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Скачать PDF</span>
                </a>
                <a
                  href={`/api/reports/${activeReportModal.id}/download/docx`}
                  download
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Скачать DOCX</span>
                </a>
                <button
                  onClick={() => setActiveReportModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
