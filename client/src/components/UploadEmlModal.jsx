import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { api } from '../api';

export function UploadEmlModal({ onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Выберите файл для загрузки (.eml)');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const res = await api.uploadEml(file);
      if (onUploaded) onUploaded(res.data);
      onClose();
    } catch (err) {
      setError('Ошибка обработки файла: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Импорт файла письма (.EML)</h3>
              <p className="text-xs text-slate-400">Парсинг заголовков, тела и ИИ-анализ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            isDragOver
              ? 'border-emerald-500 bg-emerald-500/5'
              : 'border-slate-700 hover:border-slate-600 bg-slate-950/50'
          }`}
          onClick={() => document.getElementById('eml-file-input').click()}
        >
          <input
            id="eml-file-input"
            type="file"
            accept=".eml,.msg,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <FileText className="w-6 h-6 text-indigo-400" />
          </div>

          {file ? (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-emerald-400">{file.name}</p>
              <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-200">
                Перетащите файл .eml сюда или нажмите для выбора
              </p>
              <p className="text-[11px] text-slate-500">
                Поддерживаются экспортированные письма из Outlook, Thunderbird, Mail.ru, Yandex
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{uploading ? 'Парсинг и ИИ анализ...' : 'Загрузить и создать запись'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
