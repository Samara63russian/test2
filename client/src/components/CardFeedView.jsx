import React from 'react';
import {
  Sparkles,
  Building,
  User,
  Phone,
  Mail,
  Calendar,
  Layers,
  ArrowRight,
  FileCheck,
  Clock,
  ExternalLink
} from 'lucide-react';
import { CATEGORIES, STATUSES, URGENCIES, formatDate, formatCurrency } from '../constants';

export function CardFeedView({ requests, onSelectRequest, onUpdateStatus }) {
  if (requests.length === 0) {
    return (
      <div className="py-20 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 text-2xl">
          📭
        </div>
        <h3 className="text-base font-semibold text-slate-200">Запросы не найдены</h3>
        <p className="text-xs text-slate-400 mt-1">
          Попробуйте изменить фильтры или добавьте новое входящее письмо.
        </p>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {requests.map(req => {
          const cat = CATEGORIES[req.category] || CATEGORIES.RFQ;
          const urg = URGENCIES[req.urgency] || URGENCIES.MEDIUM;
          const st = STATUSES[req.status] || STATUSES.NEW;
          const items = req.items || [];

          return (
            <div
              key={req.id}
              onClick={() => onSelectRequest(req)}
              className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01] hover:shadow-emerald-500/5 group"
            >
              {/* Header Badges */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${cat.badge}`}>
                    {cat.label}
                  </span>

                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${urg.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${urg.dot}`} />
                    {urg.label}
                  </span>
                </div>

                {/* Subject */}
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-2">
                  {req.subject}
                </h3>

                {/* Company & Contact Details */}
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 space-y-1 text-xs">
                  {req.sender_company && (
                    <div className="flex items-center gap-2 text-slate-200 font-semibold truncate">
                      <Building className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{req.sender_company}</span>
                    </div>
                  )}
                  {req.sender_name && (
                    <div className="flex items-center gap-2 text-slate-400 truncate">
                      <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{req.sender_name}</span>
                    </div>
                  )}
                  {req.sender_phone && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{req.sender_phone}</span>
                    </div>
                  )}
                </div>

                {/* Executive Summary */}
                {req.ai_summary && (
                  <div className="bg-gradient-to-br from-slate-950 to-slate-900 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-emerald-400 text-[11px]">
                      <Sparkles className="w-3 h-3" />
                      <span>Краткий ИИ-конспект:</span>
                    </div>
                    <p className="line-clamp-3 leading-relaxed text-slate-300">
                      {req.ai_summary}
                    </p>
                  </div>
                )}

                {/* Items preview pills */}
                {items.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-medium text-slate-300">
                        <Layers className="w-3 h-3 text-indigo-400" />
                        Позиции ({items.length}):
                      </span>
                      {req.estimated_budget > 0 && (
                        <span className="font-bold text-emerald-400">
                          {formatCurrency(req.estimated_budget, req.currency)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {items.slice(0, 3).map((it, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/80 text-[11px] text-slate-300 truncate max-w-[200px]"
                        >
                          {it.name} ({it.quantity} {it.unit})
                        </span>
                      ))}
                      {items.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700/80 text-[10px] text-slate-400">
                          +{items.length - 3} еще
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${st.badge}`}>
                  {st.label}
                </span>

                <div className="flex items-center gap-1 text-emerald-400 font-medium group-hover:translate-x-1 transition-transform">
                  <span>Открыть</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
