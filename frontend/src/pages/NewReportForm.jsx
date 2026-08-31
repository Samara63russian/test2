import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Calendar, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  FileText, 
  Check, 
  X,
  HelpCircle,
  Clock,
  User,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { institutionService, questionService, reportService } from '../services/api';

export default function NewReportForm({ onCancel, onSuccess }) {
  const [institutions, setInstitutions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [institutionId, setInstitutionId] = useState('');
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().slice(0, 16));
  const [title, setTitle] = useState('');
  const [summaryText, setSummaryText] = useState('');
  const [recommendations, setRecommendations] = useState('');
  
  // Answers state keyed by question id: { value, is_compliant, comment }
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    setLoading(true);
    try {
      const [instData, catData, qData] = await Promise.all([
        institutionService.getAll(),
        questionService.getCategories(),
        questionService.getAll({ active_only: true })
      ]);
      setInstitutions(instData);
      setCategories(catData);
      setQuestions(qData);

      // Pre-populate answers with sensible defaults
      const initialAnswers = {};
      qData.forEach(q => {
        if (q.question_type === 'boolean') {
          initialAnswers[q.id] = { value: 'Да', is_compliant: true, comment: '' };
        } else if (q.question_type === 'scale') {
          initialAnswers[q.id] = { value: '5', is_compliant: true, comment: '' };
        } else if (q.question_type === 'choice' && q.options?.length > 0) {
          initialAnswers[q.id] = { value: q.options[0], is_compliant: true, comment: '' };
        } else {
          initialAnswers[q.id] = { value: '', is_compliant: true, comment: '' };
        }
      });
      setAnswers(initialAnswers);

      if (instData.length > 0) {
        setInstitutionId(instData[0].id);
        setTitle(`Справка планового обследования: ${instData[0].name}`);
      }
    } catch (err) {
      console.error('Failed to load form prerequisites', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInstitutionChange = (id) => {
    setInstitutionId(id);
    const selectedInst = institutions.find(i => i.id === Number(id));
    if (selectedInst) {
      setTitle(`Справка планового обследования: ${selectedInst.name}`);
    }
  };

  const handleAnswerValueChange = (qId, value, isCompliantAuto = null) => {
    setAnswers(prev => {
      const current = prev[qId] || { value: '', is_compliant: true, comment: '' };
      let isComp = current.is_compliant;
      
      if (isCompliantAuto !== null) {
        isComp = isCompliantAuto;
      } else {
        if (value === 'Да' || value === 'true' || value === '5' || value === '4') {
          isComp = true;
        } else if (value === 'Нет' || value === 'false' || value === '1' || value === '2' || value === 'Неудовлетворительно') {
          isComp = false;
        }
      }

      return {
        ...prev,
        [qId]: {
          ...current,
          value,
          is_compliant: isComp
        }
      };
    });
  };

  const handleCommentChange = (qId, comment) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        comment
      }
    }));
  };

  const handleComplianceToggle = (qId, isCompliant) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        is_compliant: isCompliant
      }
    }));
  };

  // Group questions by category
  const groupedQuestions = {};
  questions.forEach(q => {
    const catName = q.category_name || 'Общие критерии';
    if (!groupedQuestions[catName]) {
      groupedQuestions[catName] = [];
    }
    groupedQuestions[catName].push(q);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!institutionId) {
      alert('Пожалуйста, выберите учреждение');
      return;
    }

    setSaving(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, data]) => ({
        question_id: Number(qId),
        value: String(data.value || ''),
        is_compliant: data.is_compliant,
        comment: data.comment || ''
      }));

      const payload = {
        institution_id: Number(institutionId),
        inspection_date: new Date(inspectionDate).toISOString(),
        title: title || 'Справка обследования',
        status: 'completed',
        summary_text: summaryText || 'Обследование учреждения завершено. Сводные показатели соответствуют требованиям регламентов.',
        recommendations: recommendations || 'Рекомендовано продолжить соблюдение установленных норм.',
        answers: formattedAnswers
      };

      const result = await reportService.create(payload);
      alert('Справка успешно сохранена и сформирована!');
      onSuccess?.(result);
    } catch (err) {
      console.error('Save error', err);
      alert('Ошибка при сохранении справки');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-sm font-medium">Загрузка формы опросного листа...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">
              Заполнение опросного листа и сводной справки
            </h1>
            <p className="text-xs text-slate-500">
              Введите ответы на контрольные вопросы. Итоговый балл и документ справки рассчитаются автоматически.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-md shadow-teal-600/20 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Формирование...' : 'Сохранить и выгрузить'}</span>
          </button>
        </div>
      </div>

      {/* Main Metadata Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-2">
          <Building2 className="w-4 h-4 text-teal-600" />
          <span>1. Основные реквизиты обследования</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Учреждение из справочника <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={institutionId}
              onChange={(e) => handleInstitutionChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium"
            >
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} ({inst.category || 'Без категории'})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Дата и время проведения проверки <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={inspectionDate}
              onChange={(e) => setInspectionDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Тема / Заголовок сводной справки <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Плановая проверка соблюдения требований пожарной безопасности..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Questions by Categories */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-base flex items-center space-x-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <span>2. Опросный лист (Вопросы и критерии оценки)</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Всего вопросов в бланке: {questions.length}
          </span>
        </div>

        {Object.entries(groupedQuestions).map(([catName, qList], catIdx) => (
          <div key={catName} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="bg-slate-50/80 px-6 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-lg bg-teal-700 text-white text-xs font-bold flex items-center justify-center">
                  {catIdx + 1}
                </span>
                <h3 className="font-bold text-sm text-slate-800">{catName}</h3>
              </div>
              <span className="text-xs text-slate-400 font-semibold">{qList.length} вопр.</span>
            </div>

            <div className="p-6 divide-y divide-slate-100 space-y-6">
              {qList.map((q, idx) => {
                const ans = answers[q.id] || { value: '', is_compliant: true, comment: '' };

                return (
                  <div key={q.id} className={idx > 0 ? "pt-6 space-y-3" : "space-y-3"}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          {q.code && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                              {q.code}
                            </span>
                          )}
                          <span className="font-semibold text-slate-900 text-sm">
                            {q.text}
                          </span>
                        </div>
                        {q.description && (
                          <p className="text-xs text-slate-500">{q.description}</p>
                        )}
                      </div>

                      {/* Compliance Flag Pill */}
                      <div className="shrink-0 flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => handleComplianceToggle(q.id, true)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                            ans.is_compliant
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Норма</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleComplianceToggle(q.id, false)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                            !ans.is_compliant
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Нарушение</span>
                        </button>
                      </div>
                    </div>

                    {/* Question Input Type Selector */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {/* Answer Input */}
                      <div>
                        {q.question_type === 'boolean' && (
                          <div className="flex items-center space-x-3">
                            <label className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-xl border text-xs font-bold cursor-pointer transition ${
                              ans.value === 'Да'
                                ? 'bg-teal-50 border-teal-500 text-teal-800'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}>
                              <input
                                type="radio"
                                name={`q_${q.id}`}
                                className="hidden"
                                checked={ans.value === 'Да'}
                                onChange={() => handleAnswerValueChange(q.id, 'Да', true)}
                              />
                              <CheckCircle2 className="w-4 h-4 text-teal-600" />
                              <span>Да (Соответствует)</span>
                            </label>

                            <label className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-xl border text-xs font-bold cursor-pointer transition ${
                              ans.value === 'Нет'
                                ? 'bg-rose-50 border-rose-500 text-rose-800'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}>
                              <input
                                type="radio"
                                name={`q_${q.id}`}
                                className="hidden"
                                checked={ans.value === 'Нет'}
                                onChange={() => handleAnswerValueChange(q.id, 'Нет', false)}
                              />
                              <AlertCircle className="w-4 h-4 text-rose-600" />
                              <span>Нет (Не соответствует)</span>
                            </label>
                          </div>
                        )}

                        {q.question_type === 'choice' && (
                          <select
                            value={ans.value}
                            onChange={(e) => handleAnswerValueChange(q.id, e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-teal-500"
                          >
                            {(q.options || ['Соответствует', 'Не соответствует']).map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}

                        {q.question_type === 'scale' && (
                          <div className="flex items-center space-x-2">
                            {['1', '2', '3', '4', '5'].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => handleAnswerValueChange(q.id, num)}
                                className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition ${
                                  ans.value === num
                                    ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        )}

                        {(q.question_type === 'text' || q.question_type === 'number') && (
                          <input
                            type={q.question_type === 'number' ? 'number' : 'text'}
                            value={ans.value}
                            onChange={(e) => handleAnswerValueChange(q.id, e.target.value)}
                            placeholder="Введите значение / факт..."
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-teal-500 font-medium"
                          />
                        )}
                      </div>

                      {/* Inspector Comment */}
                      <div>
                        <input
                          type="text"
                          value={ans.comment}
                          onChange={(e) => handleCommentChange(q.id, e.target.value)}
                          placeholder="Замечание, реквизиты документа или комментарий..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-teal-500 text-slate-700"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Conclusion and Recommendations */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-2">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>3. Итоговое заключение и рекомендации для справки</span>
        </h2>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Сводный текст заключения / резюме:
            </label>
            <textarea
              rows={3}
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
              placeholder="Опишите общее впечатление от обследования, готовность объекта к эксплуатации..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 font-medium"
            ></textarea>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Предписания и рекомендации руководителю:
            </label>
            <textarea
              rows={3}
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="1. Устранить замечания по доступной среде до...\n2. Провести инструктаж персонала..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 font-medium"
            ></textarea>
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center space-x-2 px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-extrabold shadow-lg shadow-teal-600/30 transition disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Сохранение...' : 'Сформировать сводную справку'}</span>
        </button>
      </div>
    </form>
  );
}
