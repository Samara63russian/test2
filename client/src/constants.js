export const CATEGORIES = {
  RFQ: {
    id: 'RFQ',
    label: 'Запрос на КП (RFQ)',
    shortLabel: 'Запрос КП',
    description: 'Запрос коммерческого предложения, цен, сметы или условий поставки',
    badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    color: '#10b981',
    icon: 'FileText'
  },
  SPEC_LIST: {
    id: 'SPEC_LIST',
    label: 'Запрос перечня / номенклатуры',
    shortLabel: 'Перечень / Спецификация',
    description: 'Запрос каталога, списка доступных позиций, спецификации или остатков',
    badge: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    color: '#3b82f6',
    icon: 'ListChecks'
  },
  GENERAL_INQUIRY: {
    id: 'GENERAL_INQUIRY',
    label: 'Общий запрос / Консультация',
    shortLabel: 'Общий запрос',
    description: 'Вопросы по услугам, техническая консультация, условия работы',
    badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    color: '#f59e0b',
    icon: 'HelpCircle'
  },
  ORDER: {
    id: 'ORDER',
    label: 'Прямой заказ / Счёт',
    shortLabel: 'Заказ / Счёт',
    description: 'Оформление покупки, запрос счёта на оплату с реквизитами',
    badge: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    color: '#a855f7',
    icon: 'ShoppingCart'
  },
  SPAM_OTHER: {
    id: 'SPAM_OTHER',
    label: 'Спам / Рассылка / Инфо',
    shortLabel: 'Спам / Инфо',
    description: 'Рекламные сообщения, сторонние коммерческие рассылки',
    badge: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
    color: '#64748b',
    icon: 'Archive'
  }
};

export const STATUSES = {
  NEW: {
    id: 'NEW',
    label: 'Новый запрос',
    shortLabel: 'Новый',
    badge: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
    columnHeader: 'border-t-2 border-sky-500',
    color: '#0ea5e9'
  },
  IN_PROGRESS: {
    id: 'IN_PROGRESS',
    label: 'В обработке',
    shortLabel: 'В работе',
    badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    columnHeader: 'border-t-2 border-amber-500',
    color: '#f59e0b'
  },
  QUOTE_PREPARED: {
    id: 'QUOTE_PREPARED',
    label: 'КП сформировано',
    shortLabel: 'КП готово',
    badge: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
    columnHeader: 'border-t-2 border-indigo-500',
    color: '#6366f1'
  },
  SENT: {
    id: 'SENT',
    label: 'Отправлено клиенту',
    shortLabel: 'Отправлено',
    badge: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    columnHeader: 'border-t-2 border-blue-500',
    color: '#3b82f6'
  },
  WON: {
    id: 'WON',
    label: 'Сделка заключена',
    shortLabel: 'Успешно',
    badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    columnHeader: 'border-t-2 border-emerald-500',
    color: '#10b981'
  },
  LOST: {
    id: 'LOST',
    label: 'Отказ / Утеряно',
    shortLabel: 'Отказ',
    badge: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    columnHeader: 'border-t-2 border-rose-500',
    color: '#f43f5e'
  },
  REJECTED: {
    id: 'REJECTED',
    label: 'Отклонено / Спам',
    shortLabel: 'Отклонено',
    badge: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
    columnHeader: 'border-t-2 border-slate-500',
    color: '#64748b'
  }
};

export const URGENCIES = {
  HIGH: {
    id: 'HIGH',
    label: 'Срочно (ASAP)',
    badge: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    dot: 'bg-rose-500 animate-pulse',
    color: '#f43f5e'
  },
  MEDIUM: {
    id: 'MEDIUM',
    label: 'Стандартный срок',
    badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    dot: 'bg-amber-500',
    color: '#f59e0b'
  },
  LOW: {
    id: 'LOW',
    label: 'Низкий приоритет',
    badge: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
    dot: 'bg-slate-400',
    color: '#94a3b8'
  }
};

export const AI_PROVIDERS = [
  {
    id: 'builtin_nlp',
    name: 'Встроенный NLP (100% Бесплатно, без API ключей)',
    badge: 'Free & Offline',
    desc: 'Мгновенный анализ текста, извлечение контактов, реквизитов, списков товаров, оценка срочности и генерация резюме на русском языке без обращения к внешним серверам.'
  },
  {
    id: 'groq',
    name: 'Groq Cloud (Llama 3.3 70B - Бесплатный тариф)',
    badge: 'Free Tier API',
    desc: 'Сверхбыстрый облачный вывод (500+ токенов/сек) на базе модели Meta Llama 3.3 70B Versatile.'
  },
  {
    id: 'gemini',
    name: 'Google Gemini 2.0 Flash (Бесплатный ключ API)',
    badge: 'Free Tier API',
    desc: 'Продвинутая мультимодальная модель от Google с глубоким пониманием сложных корпоративных писем.'
  },
  {
    id: 'openrouter',
    name: 'OpenRouter Free Models (:free)',
    badge: 'Free Models',
    desc: 'Доступ к бесплатным моделям Llama-3.3-70B, DeepSeek, Qwen2.5 через единый API OpenRouter.'
  },
  {
    id: 'ollama',
    name: 'Локальный Ollama (http://localhost:11434)',
    badge: '100% Local AI',
    desc: 'Запуск локальных моделей (Llama 3, Mistral, Qwen) на вашем собственном компьютере или сервере.'
  }
];

export function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch (_) {
    return isoString;
  }
}

export function formatCurrency(amount, currency = 'RUB') {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₽';
  const symbols = { RUB: '₽', USD: '$', EUR: '€' };
  const symbol = symbols[currency] || currency;
  return `${Number(amount).toLocaleString('ru-RU')} ${symbol}`;
}
