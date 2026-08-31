import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Sparkles,
  Layers,
  Send,
  FileCheck
} from 'lucide-react';
import { institutionService, questionService, reportService } from '../services/api';

export default function MobileAppTab() {
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [syncLogs, setSyncLogs] = useState([]);
  const [pendingSyncList, setPendingSyncList] = useState([]);
  const [syncing, setSyncing] = useState(false);

  // Live simulation form state for the mobile demo container
  const [institutions, setInstitutions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedInstId, setSelectedInstId] = useState('');
  const [mobileAnswers, setMobileAnswers] = useState({});

  useEffect(() => {
    loadPrerequisites();
  }, []);

  const loadPrerequisites = async () => {
    try {
      const [insts, qs] = await Promise.all([
        institutionService.getAll(),
        questionService.getAll({ active_only: true })
      ]);
      setInstitutions(insts);
      setQuestions(qs);
      if (insts.length > 0) setSelectedInstId(insts[0].id);

      const initA = {};
      qs.forEach(q => {
        initA[q.id] = { value: 'Да', is_compliant: true };
      });
      setMobileAnswers(initA);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMobileSaveOffline = () => {
    const selectedInst = institutions.find(i => i.id === Number(selectedInstId));
    const newReport = {
      client_uuid: 'mob-' + Math.random().toString(36).substring(2, 9),
      institution_id: Number(selectedInstId),
      institution_name: selectedInst ? selectedInst.name : 'Учреждение',
      inspection_date: new Date().toISOString(),
      title: `Мобильное обследование: ${selectedInst ? selectedInst.name : 'Объект'}`,
      summary_text: 'Справка сохранена во внутреннее хранилище SQLite на мобильном устройстве (офлайн).',
      answers: Object.entries(mobileAnswers).map(([qid, a]) => ({
        question_id: Number(qid),
        value: a.value,
        is_compliant: a.is_compliant,
        comment: 'Заполнено через Android-приложение инспектором'
      }))
    };

    setPendingSyncList(prev => [newReport, ...prev]);
    addLog(`Опросный лист по «${newReport.institution_name}» сохранен в локальной базе смартфона.`);
  };

  const handleTriggerSync = async () => {
    if (pendingSyncList.length === 0) {
      alert('Нет сохраненных офлайн-справок для выгрузки.');
      return;
    }
    if (!onlineStatus) {
      alert('Нет подключения к сети Интернет. Включите сеть для синхронизации с сервером.');
      return;
    }

    setSyncing(true);
    addLog('Запуск синхронизации с центральным сервером...');
    try {
      const res = await reportService.syncBatch(pendingSyncList);
      addLog(`Синхронизация успешна! Передано на сервер: ${res.synced_count} справок.`);
      setPendingSyncList([]);
    } catch (e) {
      addLog('Ошибка синхронизации: соединение отклонено сервером.');
    } finally {
      setSyncing(false);
    }
  };

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString('ru-RU');
    setSyncLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 8)]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold backdrop-blur-sm border border-emerald-500/30">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Мобильное Android-приложение (APK)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Офлайн-клиент для инспекторов на выезде
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Позволяет оперативно заполнять контрольные листы непосредственно на объектах проверки без доступа к интернету, локально рассчитывать баллы и выполнять пакетную выгрузку на центральный сервер при появлении связи.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <a
            href="/apk/svod_spravka_inspector_v1.0.apk"
            download
            className="flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition duration-150"
          >
            <Download className="w-5 h-5" />
            <span>Скачать APK для Android (v1.0)</span>
          </a>
        </div>
      </div>

      {/* APK Features & Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">100% Offline-First режим</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Полный справочник учреждений и чек-лист вопросов кэшируются на смартфоне. Инспектор заполняет протокол в подвальных помещениях и местах без сигнала.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Фоновая выгрузка на сервер</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            При подключении к Wi-Fi или 4G все накопленные акты отправляются через защищенный API (/api/sync/batch) с гарантией от дублирования (UUID).
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Безопасность и подпись</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Каждая справка заверяется электронной меткой инспектора и токеном авторизации с автоматическим расчетом индекса надежности.
          </p>
        </div>
      </div>

      {/* Interactive Mobile Emulator Demo */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Интерактивный симулятор Android-приложения инспектора
              </h2>
              <p className="text-xs text-slate-500">
                Протестируйте заполнение формы в режиме отсутствия связи и последующую выгрузку на сервер.
              </p>
            </div>

            {/* Network Toggle Button */}
            <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl shrink-0">
              <button
                onClick={() => setOnlineStatus(true)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  onlineStatus
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>В сети (Онлайн)</span>
              </button>
              <button
                onClick={() => setOnlineStatus(false)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  !onlineStatus
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <WifiOff className="w-3.5 h-3.5" />
                <span>Офлайн режим</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Mobile Device Mockup Screen */}
            <div className="w-full max-w-sm mx-auto bg-slate-900 rounded-[40px] p-4 shadow-2xl border-4 border-slate-800 space-y-3">
              {/* Phone Status Bar */}
              <div className="flex items-center justify-between px-4 pt-1 text-[11px] text-slate-400 font-mono">
                <span>12:00</span>
                <div className="w-16 h-4 bg-slate-800 rounded-full"></div>
                <div className="flex items-center space-x-1.5">
                  {onlineStatus ? (
                    <span className="text-emerald-400 font-bold">LTE 4G</span>
                  ) : (
                    <span className="text-rose-400 font-bold">NO NET</span>
                  )}
                  <span>🔋 95%</span>
                </div>
              </div>

              {/* Mobile App Container */}
              <div className="bg-slate-50 rounded-[28px] overflow-hidden text-slate-800 p-4 space-y-3 min-h-[460px] flex flex-col justify-between text-xs">
                {/* App Title inside Mockup */}
                <div className="bg-gradient-to-r from-teal-700 to-emerald-600 -mx-4 -mt-4 p-3.5 text-white shadow-sm">
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>СводСправка Mobile v1.0</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-semibold">
                      {onlineStatus ? 'Сервер доступен' : 'Офлайн хранилище'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[320px] pr-1">
                  <div>
                    <label className="font-bold text-[10px] text-slate-500 uppercase">Учреждение:</label>
                    <select
                      value={selectedInstId}
                      onChange={(e) => setSelectedInstId(e.target.value)}
                      className="w-full mt-0.5 p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                    >
                      {institutions.map(i => (
                        <option key={i.id} value={i.id}>{i.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="font-bold text-[10px] text-slate-500 uppercase">Экспресс-опрос:</div>
                    {questions.slice(0, 3).map((q) => (
                      <div key={q.id} className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                        <div className="font-semibold text-[11px] text-slate-800">{q.text}</div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setMobileAnswers({ ...mobileAnswers, [q.id]: { value: 'Да', is_compliant: true } })}
                            className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition ${
                              mobileAnswers[q.id]?.value === 'Да'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-slate-50 text-slate-600'
                            }`}
                          >
                            ✓ Да (Норма)
                          </button>
                          <button
                            type="button"
                            onClick={() => setMobileAnswers({ ...mobileAnswers, [q.id]: { value: 'Нет', is_compliant: false } })}
                            className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition ${
                              mobileAnswers[q.id]?.value === 'Нет'
                                ? 'bg-rose-600 text-white border-rose-600'
                                : 'bg-slate-50 text-slate-600'
                            }`}
                          >
                            ✕ Нет
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleMobileSaveOffline}
                    className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-xs shadow-md transition"
                  >
                    💾 Сохранить в память телефона
                  </button>
                </div>
              </div>
            </div>

            {/* Sync Queue & Terminal Log */}
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-teal-600" />
                    <span>Очередь выгрузки на сервер ({pendingSyncList.length})</span>
                  </h3>
                  <button
                    onClick={handleTriggerSync}
                    disabled={syncing || pendingSyncList.length === 0}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{syncing ? 'Выгрузка...' : 'Выгрузить на сервер'}</span>
                  </button>
                </div>

                {pendingSyncList.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    Очередь пуста. Нажмите «Сохранить в память телефона» на симуляторе слева.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {pendingSyncList.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-800">{item.institution_name}</div>
                          <div className="text-[10px] text-slate-400">UUID: {item.client_uuid}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Готово к выгрузке
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Terminal Logs Box */}
              <div className="bg-slate-900 rounded-2xl p-4 text-slate-200 font-mono text-[11px] space-y-2 shadow-inner">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1.5">
                  <span>Журнал мобильного шлюза (Sync Logs)</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {syncLogs.length === 0 ? (
                    <div className="text-slate-500">Система готова к приему пакетов с мобильных клиентов.</div>
                  ) : (
                    syncLogs.map((log, idx) => (
                      <div key={idx} className="text-emerald-300">{log}</div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
