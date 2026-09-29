import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Mail,
  Building,
  Save,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCw,
  Cpu,
  Key,
  Globe
} from 'lucide-react';
import { api } from '../api';
import { AI_PROVIDERS } from '../constants';

export function SettingsModal({ onClose, onSaved }) {
  const [activeTab, setActiveTab] = useState('ai'); // 'ai', 'imap', 'company'
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.getSettings();
      setSettings(res.data);
    } catch (err) {
      alert('Ошибка загрузки настроек: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      await api.saveSettings(settings);
      setMessage({ type: 'success', text: 'Настройки успешно сохранены!' });
      if (onSaved) onSaved(settings);
    } catch (err) {
      setMessage({ type: 'error', text: 'Ошибка сохранения: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleTestAi = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const res = await api.testAi({
        provider: settings.ai_provider,
        groq_api_key: settings.groq_api_key,
        groq_model: settings.groq_model,
        gemini_api_key: settings.gemini_api_key,
        gemini_model: settings.gemini_model,
        openrouter_api_key: settings.openrouter_api_key,
        openrouter_model: settings.openrouter_model,
        ollama_endpoint: settings.ollama_endpoint,
        ollama_model: settings.ollama_model
      });
      setTestResult({ success: true, message: res.message, latencyMs: res.latencyMs, sample: res.sample });
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleTestImap = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const res = await api.testImap({
        host: settings.imap_host,
        port: settings.imap_port,
        secure: settings.imap_tls === 'true',
        user: settings.imap_user,
        password: settings.imap_password,
        mailbox: settings.imap_mailbox
      });
      setTestResult({ success: true, message: res.message });
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-300">Загрузка конфигурации...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Параметры и Интеграции
              </h2>
              <p className="text-xs text-slate-400">
                Конфигурация бесплатного ИИ, сбор почты по IMAP и реквизиты КП
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

        {/* Tabs */}
        <div className="flex items-center px-5 border-b border-slate-800 bg-slate-950/40 text-xs">
          <button
            onClick={() => { setActiveTab('ai'); setTestResult(null); }}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'ai'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Бесплатный ИИ-Движок</span>
          </button>

          <button
            onClick={() => { setActiveTab('imap'); setTestResult(null); }}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'imap'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Входящая почта IMAP</span>
          </button>

          <button
            onClick={() => { setActiveTab('company'); setTestResult(null); }}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'company'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Реквизиты и Бланк КП</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {message && (
            <div className={`p-3 rounded-lg border flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* TAB 1: AI Provider Settings */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block">
                  Выберите активного ИИ-провайдера для суммаризации и извлечения данных:
                </label>
                
                <div className="grid grid-cols-1 gap-2.5">
                  {AI_PROVIDERS.map((provider) => (
                    <label
                      key={provider.id}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        settings.ai_provider === provider.id
                          ? 'bg-emerald-950/20 border-emerald-500 text-white shadow-md shadow-emerald-500/5'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="ai_provider"
                        value={provider.id}
                        checked={settings.ai_provider === provider.id}
                        onChange={(e) => setSettings({ ...settings, ai_provider: e.target.value })}
                        className="mt-1 text-emerald-500 focus:ring-emerald-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-100">{provider.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                            {provider.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          {provider.desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Provider specific inputs */}
              {settings.ai_provider === 'groq' && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="font-bold text-slate-200">Параметры Groq API (Free Tier):</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Groq API Key:</label>
                      <input
                        type="password"
                        value={settings.groq_api_key || ''}
                        onChange={(e) => setSettings({ ...settings, groq_api_key: e.target.value })}
                        placeholder="gsk_..."
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Модель:</label>
                      <input
                        type="text"
                        value={settings.groq_model || 'llama-3.3-70b-versatile'}
                        onChange={(e) => setSettings({ ...settings, groq_model: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {settings.ai_provider === 'gemini' && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="font-bold text-slate-200">Параметры Google Gemini API (Free Tier):</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Google AI API Key:</label>
                      <input
                        type="password"
                        value={settings.gemini_api_key || ''}
                        onChange={(e) => setSettings({ ...settings, gemini_api_key: e.target.value })}
                        placeholder="AIzaSy..."
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Модель:</label>
                      <input
                        type="text"
                        value={settings.gemini_model || 'gemini-2.0-flash'}
                        onChange={(e) => setSettings({ ...settings, gemini_model: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {settings.ai_provider === 'openrouter' && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="font-bold text-slate-200">Параметры OpenRouter API:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">OpenRouter API Key:</label>
                      <input
                        type="password"
                        value={settings.openrouter_api_key || ''}
                        onChange={(e) => setSettings({ ...settings, openrouter_api_key: e.target.value })}
                        placeholder="sk-or-v1-..."
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Бесплатная модель (:free):</label>
                      <input
                        type="text"
                        value={settings.openrouter_model || 'meta-llama/llama-3.3-70b-instruct:free'}
                        onChange={(e) => setSettings({ ...settings, openrouter_model: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {settings.ai_provider === 'ollama' && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="font-bold text-slate-200">Параметры локального Ollama:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Адрес Ollama (Endpoint):</label>
                      <input
                        type="text"
                        value={settings.ollama_endpoint || 'http://localhost:11434'}
                        onChange={(e) => setSettings({ ...settings, ollama_endpoint: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Имя модели:</label>
                      <input
                        type="text"
                        value={settings.ollama_model || 'llama3:latest'}
                        onChange={(e) => setSettings({ ...settings, ollama_model: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Test Button & Result */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleTestAi}
                  disabled={testing}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 border border-slate-700 transition-all disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 text-emerald-400 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Проверка...' : 'Протестировать работу ИИ'}</span>
                </button>
              </div>

              {testResult && (
                <div className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  <div className="flex items-center justify-between font-bold">
                    <span>{testResult.message}</span>
                    {testResult.latencyMs && (
                      <span className="font-mono text-[11px] text-slate-400">Время ответа: {testResult.latencyMs} мс</span>
                    )}
                  </div>
                  {testResult.sample && (
                    <div className="bg-slate-950 p-2 rounded text-[11px] text-slate-200 font-mono">
                      Резюме: {testResult.sample.summary}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: IMAP Settings */}
          {activeTab === 'imap' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200">Подключение к почтовому ящику:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-slate-400 block mb-1">IMAP Сервер (Хост):</label>
                    <input
                      type="text"
                      value={settings.imap_host || ''}
                      onChange={(e) => setSettings({ ...settings, imap_host: e.target.value })}
                      placeholder="imap.yandex.ru / imap.mail.ru / imap.gmail.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Порт:</label>
                    <input
                      type="number"
                      value={settings.imap_port || 993}
                      onChange={(e) => setSettings({ ...settings, imap_port: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Логин / Email:</label>
                    <input
                      type="text"
                      value={settings.imap_user || ''}
                      onChange={(e) => setSettings({ ...settings, imap_user: e.target.value })}
                      placeholder="user@example.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Пароль / Пароль приложения:</label>
                    <input
                      type="password"
                      value={settings.imap_password || ''}
                      onChange={(e) => setSettings({ ...settings, imap_password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Папка:</label>
                    <input
                      type="text"
                      value={settings.imap_mailbox || 'INBOX'}
                      onChange={(e) => setSettings({ ...settings, imap_mailbox: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={settings.imap_auto_check === 'true'}
                      onChange={(e) => setSettings({ ...settings, imap_auto_check: e.target.checked ? 'true' : 'false' })}
                      className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span>Автоматический опрос почты в фоне</span>
                  </label>

                  {settings.imap_auto_check === 'true' && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Каждые:</span>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={settings.imap_check_interval || 5}
                        onChange={(e) => setSettings({ ...settings, imap_check_interval: e.target.value })}
                        className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-center"
                      />
                      <span className="text-slate-400">мин</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Test IMAP */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleTestImap}
                  disabled={testing}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 border border-slate-700 transition-all disabled:opacity-50"
                >
                  <Mail className={`w-3.5 h-3.5 text-sky-400 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Проверка...' : 'Проверить подключение IMAP'}</span>
                </button>
              </div>

              {testResult && (
                <div className={`p-3.5 rounded-xl border text-xs font-semibold ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  {testResult.message}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Company & Template Settings */}
          {activeTab === 'company' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200">Реквизиты вашей компании (для бланка КП):</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Название организации:</label>
                    <input
                      type="text"
                      value={settings.company_name || ''}
                      onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Телефон:</label>
                    <input
                      type="text"
                      value={settings.company_phone || ''}
                      onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Email:</label>
                    <input
                      type="email"
                      value={settings.company_email || ''}
                      onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Юридический адрес:</label>
                    <input
                      type="text"
                      value={settings.company_address || ''}
                      onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
          >
            Закрыть
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Сохранение...' : 'Сохранить настройки'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
