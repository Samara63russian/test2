import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  Printer,
  Send,
  RotateCw,
  Trash2,
  Save,
  Copy,
  ExternalLink,
  Plus,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CATEGORIES, STATUSES, URGENCIES, formatDate, formatCurrency } from '../constants';
import { api } from '../api';

export function RequestDetailModal({
  requestId,
  onClose,
  onUpdated,
  onDeleted,
  managers = []
}) {
  const [request, setRequest] = useState(null);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'email', 'quote', 'reply', 'history'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Editable fields state
  const [status, setStatus] = useState('NEW');
  const [assignedTo, setAssignedTo] = useState('Не назначен');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  const [draftReply, setDraftReply] = useState('');

  // Commercial Offer (КП) editor state
  const [quoteItems, setQuoteItems] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [taxPercent, setTaxPercent] = useState(20);
  const [paymentTerms, setPaymentTerms] = useState('100% предоплата (или 50/50 по согласованию)');
  const [deliveryTerms, setDeliveryTerms] = useState('Доставка транспортной компанией / Самовывоз');

  useEffect(() => {
    loadRequest();
  }, [requestId]);

  const loadRequest = async () => {
    try {
      setLoading(true);
      const res = await api.getRequestById(requestId);
      const data = res.data;
      setRequest(data);
      setLogs(res.logs || []);
      setStatus(data.status);
      setAssignedTo(data.assigned_to || 'Не назначен');
      setNotes(data.notes || '');
      setItems(data.items || []);
      setDraftReply(data.draft_reply || '');

      // Initialize quote editor items
      if (data.quote_data && data.quote_data.items) {
        setQuoteItems(data.quote_data.items);
        setDiscountPercent(data.quote_data.discount_percent || 0);
        setDeliveryCost(data.quote_data.delivery_cost || 0);
      } else if (data.items && data.items.length > 0) {
        setQuoteItems(
          data.items.map((it, idx) => ({
            id: idx + 1,
            name: it.name,
            sku: it.sku || '',
            quantity: Number(it.quantity || 1),
            unit: it.unit || 'шт',
            price: Number(it.target_price || 1500)
          }))
        );
      }
    } catch (err) {
      alert('Ошибка загрузки карточки: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const res = await api.updateRequest(requestId, {
        status,
        assigned_to: assignedTo,
        notes,
        items,
        draft_reply: draftReply
      });
      setRequest(res.data);
      if (onUpdated) onUpdated(res.data);
    } catch (err) {
      alert('Ошибка сохранения: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReanalyze = async () => {
    try {
      setReanalyzing(true);
      const res = await api.reanalyzeRequest(requestId);
      setRequest(res.data);
      setItems(res.data.items || []);
      setDraftReply(res.data.draft_reply || '');
      setStatus(res.data.status);
      if (onUpdated) onUpdated(res.data);
    } catch (err) {
      alert('Ошибка ИИ анализа: ' + err.message);
    } finally {
      setReanalyzing(false);
    }
  };

  const handleGenerateQuote = async () => {
    try {
      setSaving(true);
      const res = await api.generateQuote(requestId, {
        items: quoteItems,
        discount_percent: discountPercent,
        delivery_cost: deliveryCost,
        tax_percent: taxPercent,
        payment_terms: paymentTerms,
        delivery_terms: deliveryTerms
      });
      setRequest(res.data);
      setStatus(res.data.status);
      if (onUpdated) onUpdated(res.data);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      alert('Ошибка формирования КП: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendReply = async () => {
    try {
      setSaving(true);
      const res = await api.sendReply(requestId, {
        reply_text: draftReply,
        recipient_email: request.sender_email
      });
      setRequest(res.data);
      setStatus('SENT');
      if (onUpdated) onUpdated(res.data);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      alert(res.message);
    } catch (err) {
      alert('Ошибка отправки ответа: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      try {
        await api.deleteRequest(requestId);
        if (onDeleted) onDeleted(requestId);
        onClose();
      } catch (err) {
        alert('Ошибка удаления: ' + err.message);
      }
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !request) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-300">Загрузка данных запроса...</span>
        </div>
      </div>
    );
  }

  const cat = CATEGORIES[request.category] || CATEGORIES.RFQ;
  const urg = URGENCIES[request.urgency] || URGENCIES.MEDIUM;
  const st = STATUSES[status] || STATUSES.NEW;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                {request.id}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md ${cat.badge}`}>
                {cat.label}
              </span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded ${urg.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${urg.dot}`} />
                {urg.label}
              </span>
              <span className="text-xs text-slate-400">
                {formatDate(request.received_at)}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white truncate">
              {request.subject}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReanalyze}
              disabled={reanalyzing}
              title="Повторно проанализировать через ИИ"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 border border-slate-700 transition-all disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${reanalyzing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center px-5 border-b border-slate-800 bg-slate-950/40 overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'summary'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ИИ-Конспект и Анализ</span>
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'email'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Исходное письмо</span>
          </button>

          <button
            onClick={() => setActiveTab('quote')}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'quote'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Генератор КП (Оффер)</span>
          </button>

          <button
            onClick={() => setActiveTab('reply')}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'reply'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Проект ответа</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>История ({logs.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* TAB 1: AI Summary & Extracted Data */}
          {activeTab === 'summary' && (
            <div className="space-y-5">
              
              {/* Executive Summary Card */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Краткий ИИ-конспект (Executive Summary)</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Провайдер: {request.ai_provider || 'builtin_nlp'} ({(request.ai_confidence * 100).toFixed(0)}%)
                  </span>
                </div>
                <p className="text-sm text-slate-100 leading-relaxed font-medium bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                  {request.ai_summary || 'Резюме не сформировано'}
                </p>
              </div>

              {/* Contacts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Client Company & Contacts */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Данные контрагента</span>
                  </h4>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Компания:</span>
                      <span className="font-semibold text-slate-200">{request.sender_company || '—'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Контактное лицо:</span>
                      <span className="font-semibold text-slate-200">{request.sender_name || '—'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Телефон:</span>
                      <span className="font-mono text-slate-200">{request.sender_phone || '—'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Email:</span>
                      <span className="font-mono text-slate-200">{request.sender_email || '—'}</span>
                    </div>
                    {request.sender_inn && (
                      <div className="flex justify-between py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">ИНН:</span>
                        <span className="font-mono text-emerald-400 font-semibold">{request.sender_inn}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Next Steps / Action Items */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Рекомендуемые шаги</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    {request.ai_action_items && request.ai_action_items.length > 0 ? (
                      request.ai_action_items.map((action, i) => (
                        <div key={i} className="flex items-start gap-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                          <span className="text-amber-400 font-bold shrink-0">{i + 1}.</span>
                          <span className="text-slate-200">{action}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-400 text-xs">Нет сформированных задач</div>
                    )}
                  </div>
                </div>

              </div>

              {/* Extracted Items Table */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Извлеченная номенклатура ({items.length} позиций)</span>
                  </h4>
                  {request.estimated_budget > 0 && (
                    <div className="text-xs">
                      <span className="text-slate-400 mr-1.5">Ориентир бюджета:</span>
                      <span className="font-bold text-emerald-400">
                        {formatCurrency(request.estimated_budget, request.currency)}
                      </span>
                    </div>
                  )}
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    Список номенклатуры в тексте не распознан. Можно добавить позиции в Генераторе КП.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-2 px-3">№</th>
                          <th className="py-2 px-3">Наименование позиции</th>
                          <th className="py-2 px-3">Артикул</th>
                          <th className="py-2 px-3 text-right">Количество</th>
                          <th className="py-2 px-3">Ед. изм.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {items.map((it, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/40">
                            <td className="py-2.5 px-3 text-slate-500 font-mono">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-medium text-slate-200">{it.name}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-400">{it.sku || '—'}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-indigo-400 font-semibold">{it.quantity}</td>
                            <td className="py-2.5 px-3 text-slate-400">{it.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: Original Email Content */}
          {activeTab === 'email' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-400">От: </span>
                  <span className="font-semibold text-slate-200">{request.sender_name} &lt;{request.sender_email}&gt;</span>
                </div>
                <div>
                  <span className="text-slate-400">Дата получения: </span>
                  <span className="text-slate-200">{formatDate(request.received_at)}</span>
                </div>
                <div>
                  <span className="text-slate-400">Тема: </span>
                  <span className="font-semibold text-slate-200">{request.subject}</span>
                </div>
                <div>
                  <span className="text-slate-400">Источник: </span>
                  <span className="text-slate-200">{request.source}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Текст входящего письма:
                </h4>
                <div className="bg-slate-900/90 p-4 rounded-lg border border-slate-800/80 text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                  {request.raw_body_text || '(Текст письма пуст)'}
                </div>
              </div>

              {request.attachments && request.attachments.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Вложения ({request.attachments.length}):
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {request.attachments.map((att, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-200">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{att.name}</span>
                        <span className="text-slate-500 text-[10px]">({(att.size / 1024).toFixed(0)} KB)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Commercial Offer (КП) Generator & Printable Letterhead */}
          {activeTab === 'quote' && (
            <div className="space-y-5">
              
              {/* Quote Parameters Editor */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Параметры коммерческого предложения</span>
                  </h4>

                  <button
                    onClick={handleGenerateQuote}
                    disabled={saving}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 shadow"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Рассчитать и сохранить КП</span>
                  </button>
                </div>

                {/* Items pricing editor */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300">Позиции для расчета:</div>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {quoteItems.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 items-center text-xs">
                        <div className="col-span-5">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              const copy = [...quoteItems];
                              copy[idx].name = e.target.value;
                              setQuoteItems(copy);
                            }}
                            placeholder="Название позиции"
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const copy = [...quoteItems];
                              copy[idx].quantity = Number(e.target.value);
                              setQuoteItems(copy);
                            }}
                            placeholder="Кол-во"
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-right"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => {
                              const copy = [...quoteItems];
                              copy[idx].unit = e.target.value;
                              setQuoteItems(copy);
                            }}
                            placeholder="Ед."
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-center"
                          />
                        </div>
                        <div className="col-span-3">
                          <div className="relative">
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => {
                                const copy = [...quoteItems];
                                copy[idx].price = Number(e.target.value);
                                setQuoteItems(copy);
                              }}
                              placeholder="Цена за ед."
                              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-emerald-400 font-mono text-right pr-6"
                            />
                            <span className="absolute right-2 top-1 text-slate-500">₽</span>
                          </div>
                        </div>
                        <div className="col-span-1 text-right">
                          <button
                            onClick={() => setQuoteItems(quoteItems.filter((_, i) => i !== idx))}
                            className="p-1 text-rose-400 hover:text-rose-300"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setQuoteItems([...quoteItems, { id: quoteItems.length + 1, name: 'Новая позиция', quantity: 1, unit: 'шт', price: 1000 }])}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium mt-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Добавить позицию</span>
                  </button>
                </div>

                {/* Additional pricing parameters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Скидка (%):</label>
                    <input
                      type="number"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Стоимость доставки (руб):</label>
                    <input
                      type="number"
                      value={deliveryCost}
                      onChange={(e) => setDeliveryCost(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">НДС (%):</label>
                    <input
                      type="number"
                      value={taxPercent}
                      disabled
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-400"
                    />
                  </div>
                </div>

              </div>

              {/* Printable Official Commercial Offer Letterhead Preview */}
              <div className="border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
                <div className="bg-slate-800 px-4 py-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">Официальный бланк КП (готово к печати / отправке)</span>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-sky-400" />
                    <span>Печать / Экспорт PDF</span>
                  </button>
                </div>

                <div id="printable-commercial-offer" className="bg-white text-slate-900 p-8 space-y-6 text-xs font-sans">
                  {/* Header */}
                  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                    <div>
                      <h1 className="text-lg font-black tracking-tight text-slate-900">ООО «Бизнес Решения»</h1>
                      <p className="text-[11px] text-slate-600 mt-0.5">г. Москва, ул. Деловая, д. 10 | Тел: +7 (495) 123-45-67</p>
                      <p className="text-[11px] text-slate-600">Email: sales@example.com | ИНН 7701984729</p>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-emerald-700">КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ</div>
                      <div className="text-xs font-semibold text-slate-700 mt-1">№ {request.quote_data?.quote_number || `КП-${request.id}`}</div>
                      <div className="text-[11px] text-slate-500">от {new Date().toLocaleDateString('ru-RU')}</div>
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500">Заказчик: </span>
                      <span className="font-bold text-slate-900">{request.sender_company || 'Клиент'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Контактное лицо: </span>
                      <span className="font-semibold text-slate-900">{request.sender_name || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Телефон: </span>
                      <span className="font-mono text-slate-900">{request.sender_phone || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Email: </span>
                      <span className="font-mono text-slate-900">{request.sender_email || '—'}</span>
                    </div>
                  </div>

                  {/* Table */}
                  <table className="w-full border-collapse border border-slate-300 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-800">
                        <th className="p-2 border border-slate-300 w-8 text-center">№</th>
                        <th className="p-2 border border-slate-300 text-left">Наименование товаров / услуг</th>
                        <th className="p-2 border border-slate-300 w-16 text-right">Кол-во</th>
                        <th className="p-2 border border-slate-300 w-12 text-center">Ед.</th>
                        <th className="p-2 border border-slate-300 w-24 text-right">Цена, руб</th>
                        <th className="p-2 border border-slate-300 w-28 text-right">Сумма, руб</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(request.quote_data?.items || quoteItems).map((it, idx) => {
                        const sum = (it.price || 0) * (it.quantity || 1);
                        return (
                          <tr key={idx} className="border-b border-slate-200">
                            <td className="p-2 border border-slate-300 text-center font-mono text-slate-500">{idx + 1}</td>
                            <td className="p-2 border border-slate-300 font-medium">{it.name}</td>
                            <td className="p-2 border border-slate-300 text-right font-mono">{it.quantity}</td>
                            <td className="p-2 border border-slate-300 text-center">{it.unit}</td>
                            <td className="p-2 border border-slate-300 text-right font-mono">{Number(it.price || 0).toLocaleString('ru-RU')}</td>
                            <td className="p-2 border border-slate-300 text-right font-mono font-semibold">{sum.toLocaleString('ru-RU')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Totals */}
                  <div className="flex justify-end">
                    <div className="w-64 space-y-1 text-right text-xs">
                      {discountPercent > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Скидка ({discountPercent}%):</span>
                          <span>-{(request.quote_data?.discount_amount || 0).toLocaleString('ru-RU')} ₽</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-600">
                        <span>В т.ч. НДС 20%:</span>
                        <span>{(request.quote_data?.tax_amount || 0).toLocaleString('ru-RU')} ₽</span>
                      </div>
                      <div className="flex justify-between font-black text-sm text-slate-900 border-t border-slate-900 pt-1">
                        <span>ИТОГО К ОПЛАТЕ:</span>
                        <span className="text-emerald-700">{formatCurrency(request.estimated_budget, request.currency)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-600 space-y-1">
                    <div>• <strong>Срок действия предложения:</strong> 14 календарных дней</div>
                    <div>• <strong>Условия оплаты:</strong> {paymentTerms}</div>
                    <div>• <strong>Условия поставки:</strong> {deliveryTerms}</div>
                  </div>

                  {/* Signatures */}
                  <div className="flex justify-between items-end pt-6 border-t border-slate-200 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">Менеджер проекта: {assignedTo}</div>
                      <div className="text-[10px] text-slate-500">ООО «Бизнес Решения»</div>
                    </div>
                    <div className="text-center">
                      <div className="w-32 border-b border-slate-400 mb-1" />
                      <div className="text-[10px] text-slate-500">М.П. / Подпись</div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 4: Draft Response Email */}
          {activeTab === 'reply' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Сгенерированный ИИ проект ответа</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(draftReply)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 border border-slate-700 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? 'Скопировано!' : 'Скопировать'}</span>
                    </button>
                    <button
                      onClick={handleSendReply}
                      disabled={saving}
                      className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 shadow"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Отправить ответ клиенту</span>
                    </button>
                  </div>
                </div>

                <textarea
                  rows={14}
                  value={draftReply}
                  onChange={(e) => setDraftReply(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="Текст ответа клиенту..."
                />
              </div>
            </div>
          )}

          {/* TAB 5: Activity History */}
          {activeTab === 'history' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Хронология событий:
              </h4>
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-200">{log.action}</div>
                      <div className="text-slate-400 mt-0.5">{log.details}</div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* Status Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Статус:</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                {Object.entries(STATUSES).map(([k, s]) => (
                  <option key={k} value={k}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Manager Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Ответственный:</span>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Не назначен">Не назначен</option>
                {managers.map(mgr => (
                  <option key={mgr} value={mgr}>{mgr}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Удалить</span>
            </button>

            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Сохранить изменения</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
