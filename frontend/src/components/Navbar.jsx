import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  Settings, 
  BarChart3, 
  Smartphone, 
  LogOut, 
  User as UserIcon,
  HelpCircle,
  FolderOpen,
  PlusCircle,
  DownloadCloud
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, user, onLogout }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-lg leading-tight bg-gradient-to-r from-teal-800 to-slate-900 bg-clip-text text-transparent">
                СводСправка
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Аналитическая система опросных листов и справок
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-teal-50 text-teal-700 border border-teal-200/60 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Главная (Справки)</span>
            </button>

            <button
              onClick={() => setActiveTab('new_report')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'new_report'
                  ? 'bg-teal-50 text-teal-700 border border-teal-200/60 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Заполнить форму</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-teal-50 text-teal-700 border border-teal-200/60 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Аналитика</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-teal-50 text-teal-700 border border-teal-200/60 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Справочники и Настройки</span>
            </button>

            <button
              onClick={() => setActiveTab('mobile')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'mobile'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Android APK</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 pl-3 border-l border-slate-200 text-sm">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-semibold">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="hidden lg:block text-left">
                <div className="font-semibold text-xs text-slate-800 leading-tight">
                  {user?.full_name || 'Администратор'}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                  {user?.role === 'admin' ? 'Администратор' : 'Инспектор'}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Выйти из системы"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex border-t border-slate-200 overflow-x-auto bg-slate-50/50 py-1.5 px-2 space-x-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
            activeTab === 'dashboard' ? 'bg-teal-600 text-white' : 'text-slate-600'
          }`}
        >
          Главная
        </button>
        <button
          onClick={() => setActiveTab('new_report')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
            activeTab === 'new_report' ? 'bg-teal-600 text-white' : 'text-slate-600'
          }`}
        >
          Форма вопросов
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
            activeTab === 'analytics' ? 'bg-teal-600 text-white' : 'text-slate-600'
          }`}
        >
          Аналитика
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
            activeTab === 'settings' ? 'bg-teal-600 text-white' : 'text-slate-600'
          }`}
        >
          Настройки
        </button>
        <button
          onClick={() => setActiveTab('mobile')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
            activeTab === 'mobile' ? 'bg-emerald-600 text-white' : 'text-slate-600'
          }`}
        >
          Android APK
        </button>
      </div>
    </header>
  );
}
