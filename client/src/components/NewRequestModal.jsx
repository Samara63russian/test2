import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  Building,
  User,
  Phone,
  Mail,
  FileText,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../api';
import { CATEGORIES, URGENCIES } from '../constants';

export function NewRequestModal({ onClose, onCreated }) {
  const [subject, setSubject] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderCompany, setSenderCompany] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderInn, setSenderInn] = useState('');
  const [body, setBody] = useState('');

  const [analyzing, setAnalyzing] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Live test analysis of raw text
  const handleLiveAnalyze = async () => {
    if (!body && !subject) {
      setError('Введите тему или текст письма для анализа');
      return;
    }
    try {
      setError(null);
      setAnalyzing(true);
      const res = await api.analyzeRawText({
        subject,
        body,
        from: senderEmail ? `${senderName} <${senderEmail}>` : senderName
      });
      setAiPreview(res.analysis);
      // Auto-fill extracted contacts if empty
      if (res.analysis?.contacts) {
        if (!senderCompany && res.analysis.contacts.company) setSenderCompany(res.analysis.contacts.company);
        if (!senderName && res.analysis.contacts.contactPerson) setSenderName(res.analysis.contacts.contactPerson);
        if (!senderPhone && res.analysis.contacts.phone) setSenderPhone(res.analysis.contacts.phone);
        if (!senderEmail && res.analysis.contacts.email) setSenderEmail(res.analysis.contacts.email);
        if (!senderInn && res.analysis.contacts.inn) setSenderInn(res.analysis.contacts.inn);
      }
    } catch (err) {
      setError('Ошибка анализа: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!subject && !body) {
      setError('Укажите тему или текст запроса');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const res = await api.createRequest({
        subject: subject || 'Входящий запрос',
        body,
        sender_name: senderName,
        sender_company: senderCompany,
        sender_email: senderEmail,
        sender_phone: senderPhone,
        sender_inn: senderInn,
        run_ai: true
      });

      if (onCreated) onCreated(res.data);
      onClose();
    } catch (err) {
      setError('Ошибка создания записи: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Новый запрос / Входящее письмо
              </h2>
              <p className="text-xs text-slate-400">
                Вставьте текст письма — ИИ автоматически определит категорию, извлечет реквизиты, список товаров и составит краткий конспект.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Тема письма / Запроса <span className="text-emerald-400">*</span>:
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Например: Запрос КП на поставку кабельной продукции и муфт"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Body Textarea with Live AI Button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-semibold">
                Текст входящего обращения / письма <span className="text-emerald-400">*</span>:
              </label>
              <button
                type="button"
                onClick={handleLiveAnalyze}
                disabled={analyzing}
                className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 hover:underline"
              >
                <Sparkles className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
                <span>{analyzing ? 'ИИ анализирует...' : 'Предпросмотр ИИ-анализа'}</span>
              </button>
            </div>
            <textarea
              rows={6}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Вставьте полный текст входящего письма с перечнем номенклатуры, контактами, сроками и условиями..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-sans leading-relaxed"
            />
          </div>

          {/* Live AI Analysis Preview Box */}
          {aiPreview && (
            <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-4 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Результат ИИ-обработки:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                    {CATEGORIES[aiPreview.category]?.shortLabel || aiPreview.category}
                  </span>
                  <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                    {aiPreview.urgency === 'HIGH' ? '🔥 Срочно' : 'Стандартно'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-200">
                <strong>Краткий конспект:</strong> {aiPreview.summary}
              </div>

              {aiPreview.items && aiPreview.items.length > 0 && (
                <div>
                  <div className="text-slate-400 font-semibold mb-1">
                    Обнаружено позиций ({aiPreview.items.length}):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {aiPreview.items.map((it, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                        {it.name} ({it.quantity} {it.unit})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contact Details Fields */}
          <div className="pt-2">
            <h4 className="font-semibold text-slate-400 uppercase tracking-wider text-[11px] mb-2">
              Данные отправителя (заполняются автоматически или вручную):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Компания / Организация:</label>
                <input
                  type="text"
                  value={senderCompany}
                  onChange={(e) => setSenderCompany(e.target.value)}
                  placeholder="ООО / АО / ИП"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">ФИО контактного лица:</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Иван Иванов"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Email:</label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="client@company.ru"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Телефон:</label>
                <input
                  type="text"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="+7 (999) 000-00-00"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">ИНН (если есть):</label>
                <input
                  type="text"
                  value={senderInn}
                  onChange={(e) => setSenderInn(e.target.value)}
                  placeholder="7701234567"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{saving ? 'Создание и анализ...' : 'Создать запись с ИИ-конспектом'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
