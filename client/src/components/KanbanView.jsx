import React from 'react';
import {
  Sparkles,
  Building,
  User,
  Clock,
  Calendar,
  Layers,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  FileCheck,
  Send,
  MoreHorizontal
} from 'lucide-react';
import { CATEGORIES, STATUSES, URGENCIES, formatDate, formatCurrency } from '../constants';

const KANBAN_COLUMNS = [
  { status: 'NEW', label: 'Новые запросы', icon: '📥', color: 'border-t-sky-500' },
  { status: 'IN_PROGRESS', label: 'В обработке', icon: '⚙️', color: 'border-t-amber-500' },
  { status: 'QUOTE_PREPARED', label: 'КП готово', icon: '📝', color: 'border-t-indigo-500' },
  { status: 'SENT', label: 'Отправлено', icon: '🚀', color: 'border-t-blue-500' },
  { status: 'WON', label: 'Успешная сделка', icon: '🏆', color: 'border-t-emerald-500' }
];

export function KanbanView({ requests, onSelectRequest, onUpdateStatus }) {
  // Group requests by status
  const grouped = {
    NEW: [],
    IN_PROGRESS: [],
    QUOTE_PREPARED: [],
    SENT: [],
    WON: [],
    LOST: [],
    REJECTED: []
  };

  requests.forEach(req => {
    if (grouped[req.status]) {
      grouped[req.status].push(req);
    } else {
      grouped.NEW.push(req);
    }
  });

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 5-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
        {KANBAN_COLUMNS.map(col => {
          const items = grouped[col.status] || [];
          const statusInfo = STATUSES[col.status] || STATUSES.NEW;

          return (
            <div
              key={col.status}
              className={`bg-slate-900/70 border border-slate-800 rounded-xl p-3 flex flex-col max-h-[calc(100vh-230px)] min-h-[500px] border-t-4 ${col.color} shadow-lg`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-base">{col.icon}</span>
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    {col.label}
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {items.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                {items.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-lg text-slate-500 text-xs text-center p-4">
                    <span>Нет запросов в этом статусе</span>
                  </div>
                ) : (
                  items.map(req => {
                    const cat = CATEGORIES[req.category] || CATEGORIES.RFQ;
                    const urg = URGENCIES[req.urgency] || URGENCIES.MEDIUM;
                    const itemCount = (req.items || []).length;

                    return (
                      <div
                        key={req.id}
                        onClick={() => onSelectRequest(req)}
                        className="group bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 hover:border-slate-600 rounded-lg p-3.5 shadow-md cursor-pointer transition-all hover:scale-[1.01] hover:shadow-emerald-500/5 flex flex-col gap-2.5 relative"
                      >
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${cat.badge}`}>
                            {cat.shortLabel}
                          </span>

                          <div className="flex items-center gap-1">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${urg.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${urg.dot}`} />
                              {req.urgency === 'HIGH' ? 'ASAP' : req.urgency === 'LOW' ? 'Низкий' : 'Обычный'}
                            </span>
                          </div>
                        </div>

                        {/* Subject */}
                        <h4 className="text-xs font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                          {req.subject}
                        </h4>

                        {/* Company / Contact */}
                        <div className="text-[11px] text-slate-300 flex flex-col gap-1">
                          {req.sender_company && (
                            <div className="flex items-center gap-1.5 text-slate-200 font-medium truncate">
                              <Building className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{req.sender_company}</span>
                            </div>
                          )}
                          {req.sender_name && (
                            <div className="flex items-center gap-1.5 text-slate-400 truncate">
                              <User className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate">{req.sender_name}</span>
                            </div>
                          )}
                        </div>

                        {/* AI Summary Snippet */}
                        {req.ai_summary && (
                          <div className="bg-slate-900/80 rounded-md p-2 border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed">
                            <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 mb-0.5">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>ИИ-Резюме:</span>
                            </div>
                            <p className="line-clamp-2 text-slate-300">
                              {req.ai_summary}
                            </p>
                          </div>
                        )}

                        {/* Footer details: items count, budget, deadline */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-700/50 mt-0.5">
                          <div className="flex items-center gap-2">
                            {itemCount > 0 && (
                              <span className="flex items-center gap-0.5 bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-700/60 text-slate-300">
                                <Layers className="w-2.5 h-2.5 text-indigo-400" />
                                {itemCount} поз.
                              </span>
                            )}
                            {req.estimated_budget > 0 && (
                              <span className="font-semibold text-emerald-400">
                                {formatCurrency(req.estimated_budget, req.currency)}
                              </span>
                            )}
                          </div>

                          <span className="text-[10px] text-slate-500">
                            {formatDate(req.received_at).split(',')[0]}
                          </span>
                        </div>

                        {/* Quick Move Action Buttons */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-between pt-1 text-[10px]"
                        >
                          {col.status !== 'NEW' && (
                            <button
                              onClick={() => {
                                const prevStatus = col.status === 'WON' ? 'SENT' : col.status === 'SENT' ? 'QUOTE_PREPARED' : col.status === 'QUOTE_PREPARED' ? 'IN_PROGRESS' : 'NEW';
                                onUpdateStatus(req.id, prevStatus);
                              }}
                              title="Вернуть на предыдущий этап"
                              className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-700 flex items-center gap-0.5"
                            >
                              <ChevronLeft className="w-3 h-3" />
                              <span>Назад</span>
                            </button>
                          )}

                          <div className="flex-1" />

                          {col.status !== 'WON' && (
                            <button
                              onClick={() => {
                                const nextStatus = col.status === 'NEW' ? 'IN_PROGRESS' : col.status === 'IN_PROGRESS' ? 'QUOTE_PREPARED' : col.status === 'QUOTE_PREPARED' ? 'SENT' : 'WON';
                                onUpdateStatus(req.id, nextStatus);
                              }}
                              title="Перевести на следующий этап"
                              className="text-emerald-400 hover:text-emerald-300 font-medium p-1 rounded hover:bg-emerald-500/10 flex items-center gap-0.5"
                            >
                              <span>Далее</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
