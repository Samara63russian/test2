import React, { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  Building,
  User,
  Trash2,
  CheckCircle,
  Clock,
  ArrowUpDown,
  ExternalLink
} from 'lucide-react';
import { CATEGORIES, STATUSES, URGENCIES, formatDate, formatCurrency } from '../constants';

export function TableView({
  requests,
  onSelectRequest,
  onUpdateStatus,
  onBatchUpdateStatus,
  onBatchDelete
}) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [sortCol, setSortCol] = useState('received_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const toggleSelectAll = () => {
    if (selectedIds.size === requests.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(requests.map(r => r.id)));
    }
  };

  const toggleSelectOne = (id, e) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortOrder('desc');
    }
  };

  // Sort client-side
  const sorted = [...requests].sort((a, b) => {
    let valA = a[sortCol];
    let valB = b[sortCol];
    if (sortCol === 'estimated_budget') {
      valA = Number(valA || 0);
      valB = Number(valB || 0);
    }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-4">
      
      {/* Batch Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-emerald-400">
              Выбрано записей: {selectedIds.size}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Изменить статус:</span>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onBatchUpdateStatus(Array.from(selectedIds), e.target.value);
                  setSelectedIds(new Set());
                }
              }}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1"
            >
              <option value="">Выберите статус...</option>
              {Object.entries(STATUSES).map(([k, st]) => (
                <option key={k} value={k}>{st.label}</option>
              ))}
            </select>

            <button
              onClick={() => {
                if (window.confirm(`Удалить выбранные ${selectedIds.size} записей?`)) {
                  onBatchDelete(Array.from(selectedIds));
                  setSelectedIds(new Set());
                }
              }}
              className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 flex items-center gap-1 font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Удалить</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700/80">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={requests.length > 0 && selectedIds.size === requests.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                  />
                </th>
                <th
                  onClick={() => handleSort('received_at')}
                  className="py-3 px-3 font-semibold cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Дата / ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('subject')}
                  className="py-3 px-3 font-semibold cursor-pointer hover:text-white min-w-[280px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Тема и ИИ-Конспект</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-3 font-semibold">Категория</th>
                <th className="py-3 px-3 font-semibold">Срочность</th>
                <th className="py-3 px-3 font-semibold min-w-[160px]">Контрагент</th>
                <th
                  onClick={() => handleSort('estimated_budget')}
                  className="py-3 px-3 font-semibold cursor-pointer hover:text-white text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Бюджет</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-3 font-semibold">Статус</th>
                <th className="py-3 px-3 font-semibold">Ответственный</th>
                <th className="py-3 px-3 text-center">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500 text-sm">
                    Запросы не найдены. Создайте новый запрос или загрузите .eml письмо.
                  </td>
                </tr>
              ) : (
                sorted.map((req) => {
                  const cat = CATEGORIES[req.category] || CATEGORIES.RFQ;
                  const urg = URGENCIES[req.urgency] || URGENCIES.MEDIUM;
                  const st = STATUSES[req.status] || STATUSES.NEW;
                  const isExpanded = expandedRowId === req.id;
                  const isSelected = selectedIds.has(req.id);
                  const itemCount = (req.items || []).length;

                  return (
                    <React.Fragment key={req.id}>
                      <tr
                        onClick={() => onSelectRequest(req)}
                        className={`hover:bg-slate-800/60 cursor-pointer transition-colors ${
                          isSelected ? 'bg-slate-800/50' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => toggleSelectOne(req.id, e)}
                            className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                          />
                        </td>

                        {/* Date & ID */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-mono text-[11px] text-slate-400">{req.id}</div>
                          <div className="text-[10px] text-slate-500">{formatDate(req.received_at)}</div>
                        </td>

                        {/* Subject & Summary Preview */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-100 hover:text-emerald-400 transition-colors line-clamp-1">
                            {req.subject}
                          </div>
                          {req.ai_summary && (
                            <div className="text-[11px] text-slate-400 line-clamp-1 flex items-center gap-1 mt-0.5">
                              <Sparkles className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                              <span className="truncate">{req.ai_summary}</span>
                            </div>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${cat.badge}`}>
                            {cat.shortLabel}
                          </span>
                        </td>

                        {/* Urgency */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${urg.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${urg.dot}`} />
                            {req.urgency === 'HIGH' ? 'Срочно' : req.urgency === 'LOW' ? 'Низкий' : 'Обычный'}
                          </span>
                        </td>

                        {/* Sender / Company */}
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-200 line-clamp-1">
                            {req.sender_company || req.sender_name || 'Не указан'}
                          </div>
                          {req.sender_company && req.sender_name && (
                            <div className="text-[10px] text-slate-400 line-clamp-1">
                              {req.sender_name}
                            </div>
                          )}
                        </td>

                        {/* Budget */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          {req.estimated_budget > 0 ? (
                            <span className="font-semibold text-emerald-400">
                              {formatCurrency(req.estimated_budget, req.currency)}
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>

                        {/* Status Dropdown */}
                        <td className="py-3 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={req.status}
                            onChange={(e) => onUpdateStatus(req.id, e.target.value)}
                            className="bg-slate-800 border border-slate-700 text-[11px] text-slate-200 rounded px-2 py-1 focus:ring-1 focus:ring-emerald-500"
                          >
                            {Object.entries(STATUSES).map(([k, s]) => (
                              <option key={k} value={k}>{s.label}</option>
                            ))}
                          </select>
                        </td>

                        {/* Assigned To */}
                        <td className="py-3 px-3 whitespace-nowrap text-slate-400 text-[11px]">
                          {req.assigned_to || 'Не назначен'}
                        </td>

                        {/* Expand / Details */}
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setExpandedRowId(isExpanded ? null : req.id)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                            title={isExpanded ? 'Свернуть' : 'Развернуть детали'}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Row Detail */}
                      {isExpanded && (
                        <tr className="bg-slate-950/60 border-b border-slate-800/80">
                          <td colSpan={10} className="p-4">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                              {/* Summary */}
                              <div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Полный ИИ-Конспект:</span>
                                </div>
                                <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                                  {req.ai_summary || 'Резюме отсутствует'}
                                </p>
                              </div>

                              {/* Items Table */}
                              {itemCount > 0 && (
                                <div>
                                  <div className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Извлеченные позиции ({itemCount}):</span>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {req.items.map((it, idx) => (
                                      <div key={idx} className="bg-slate-950 p-2 rounded border border-slate-800 text-[11px] flex justify-between items-center">
                                        <span className="text-slate-200 font-medium truncate pr-2">{it.name}</span>
                                        <span className="text-indigo-400 font-mono shrink-0">{it.quantity} {it.unit}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Action Items */}
                              {req.ai_action_items && req.ai_action_items.length > 0 && (
                                <div>
                                  <div className="text-xs font-semibold text-amber-400 mb-1">
                                    Следующие действия:
                                  </div>
                                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-0.5">
                                    {req.ai_action_items.map((action, i) => (
                                      <li key={i}>{action}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              <div className="pt-2 flex justify-end">
                                <button
                                  onClick={() => onSelectRequest(req)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 shadow"
                                >
                                  <span>Открыть полную карточку и генератор КП</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
