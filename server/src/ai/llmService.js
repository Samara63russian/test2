import { analyzeEmailWithNLP } from './nlpEngine.js';
import { getSetting } from '../db.js';

const SYSTEM_PROMPT = `Ты — профессиональный ИИ-ассистент отдела продаж и коммерческих предложений.
Твоя задача — детально проанализировать входящее деловое письмо/запрос, категоризировать его, извлечь структурированную информацию и составить краткий конспект (резюме) и проект ответа.

Категории:
- RFQ: Запрос на коммерческое предложение, расчет цен, смету, закупку
- SPEC_LIST: Запрос перечня товаров/услуг, номенклатуры, спецификации, каталога, остатков
- GENERAL_INQUIRY: Общий вопрос, консультация по услугам/продукции, уточнение деталей
- ORDER: Прямой заказ, запрос счета на оплату, прикрепление реквизитов для договора
- SPAM_OTHER: Спам, реклама, нерелевантная рассылка

Срочность (urgency):
- HIGH: Срочно, дедлайн сегодня/завтра, ASAP, горящие сроки
- MEDIUM: Обычный рабочий запрос (2-3 дня)
- LOW: Планирование на будущее, не срочно

Ответь ИСКЛЮЧИТЕЛЬНО в формате валидного JSON со следующими полями:
{
  "category": "RFQ" | "SPEC_LIST" | "GENERAL_INQUIRY" | "ORDER" | "SPAM_OTHER",
  "urgency": "HIGH" | "MEDIUM" | "LOW",
  "confidence": 0.95,
  "summary": "Краткое резюме в 2-3 предложениях: кто пишет, суть запроса, ключевые позиции и требования",
  "actionItems": ["Шаг 1: ...", "Шаг 2: ..."],
  "contacts": {
    "company": "Название компании (ООО/АО/ИП...)",
    "contactPerson": "ФИО или имя контактного лица",
    "phone": "+7...",
    "email": "user@example.com",
    "inn": "ИНН если есть",
    "city": "Город доставки/регион если указан"
  },
  "items": [
    {
      "name": "Наименование товара или услуги",
      "sku": "Артикул если есть",
      "quantity": 10,
      "unit": "шт / м / кг / компл",
      "target_price": null,
      "note": ""
    }
  ],
  "estimatedBudget": 0,
  "deadlineDate": "YYYY-MM-DD или null",
  "draftReply": "Готовый вежливый деловой проект ответа клиенту"
}`;

/**
 * Call Groq API (Free Tier with Llama 3.3 70B / 8B)
 */
async function callGroq(apiKey, model, emailData) {
  const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Проанализируй входящее письмо:\n\nОт: ${emailData.from || ''}\nТема: ${emailData.subject || ''}\nТекст:\n${emailData.body || emailData.raw_body_text || ''}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2
    }),
    signal: AbortSignal.timeout(20000)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  return JSON.parse(content);
}

/**
 * Call Google Gemini API (Free tier)
 */
async function callGemini(apiKey, model, emailData) {
  const modelName = model || 'gemini-2.0-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: `${SYSTEM_PROMPT}\n\nПисьмо для анализа:\nОт: ${emailData.from || ''}\nТема: ${emailData.subject || ''}\nТекст:\n${emailData.body || emailData.raw_body_text || ''}` }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    }),
    signal: AbortSignal.timeout(25000)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(text);
}

/**
 * Call OpenRouter API (Free models: :free)
 */
async function callOpenRouter(apiKey, model, emailData) {
  const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://github.com/cursor-agent/email-ai-tracker',
      'X-Title': 'Email AI RFQ Tracker'
    },
    body: JSON.stringify({
      model: model || 'meta-llama/llama-3.3-70b-instruct:free',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Проанализируй входящее письмо:\n\nОт: ${emailData.from || ''}\nТема: ${emailData.subject || ''}\nТекст:\n${emailData.body || emailData.raw_body_text || ''}`
        }
      ],
      temperature: 0.2
    }),
    signal: AbortSignal.timeout(25000)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter API Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  // Parse JSON from code fence if needed
  const cleaned = content.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
  return JSON.parse(cleaned);
}

/**
 * Call Local Ollama API (100% Free & Local)
 */
async function callOllama(endpointUrl, model, emailData) {
  const url = `${endpointUrl || 'http://localhost:11434'}/api/chat`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model || 'llama3',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Проанализируй входящее письмо:\n\nОт: ${emailData.from || ''}\nТема: ${emailData.subject || ''}\nТекст:\n${emailData.body || emailData.raw_body_text || ''}`
        }
      ],
      format: 'json',
      stream: false
    }),
    signal: AbortSignal.timeout(30000)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Ollama Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return JSON.parse(data.message?.content);
}

/**
 * Master analyzer function that respects user configuration
 * and seamlessly falls back to built-in NLP.
 */
export async function analyzeIncomingEmail(emailData) {
  const provider = getSetting('ai_provider', 'builtin_nlp');

  // If built-in NLP is selected, return instantly
  if (provider === 'builtin_nlp') {
    return analyzeEmailWithNLP(emailData);
  }

  try {
    let result = null;

    if (provider === 'groq') {
      const apiKey = getSetting('groq_api_key', '');
      const model = getSetting('groq_model', 'llama-3.3-70b-versatile');
      if (apiKey) {
        result = await callGroq(apiKey, model, emailData);
      }
    } else if (provider === 'gemini') {
      const apiKey = getSetting('gemini_api_key', '');
      const model = getSetting('gemini_model', 'gemini-2.0-flash');
      if (apiKey) {
        result = await callGemini(apiKey, model, emailData);
      }
    } else if (provider === 'openrouter') {
      const apiKey = getSetting('openrouter_api_key', '');
      const model = getSetting('openrouter_model', 'meta-llama/llama-3.3-70b-instruct:free');
      if (apiKey) {
        result = await callOpenRouter(apiKey, model, emailData);
      }
    } else if (provider === 'ollama') {
      const endpoint = getSetting('ollama_endpoint', 'http://localhost:11434');
      const model = getSetting('ollama_model', 'llama3:latest');
      result = await callOllama(endpoint, model, emailData);
    }

    if (result && result.summary) {
      return {
        category: result.category || 'RFQ',
        urgency: result.urgency || 'MEDIUM',
        confidence: typeof result.confidence === 'number' ? result.confidence : 0.95,
        provider: provider,
        summary: result.summary,
        actionItems: Array.isArray(result.actionItems) ? result.actionItems : [],
        items: Array.isArray(result.items) ? result.items : [],
        contacts: {
          company: result.contacts?.company || emailData.sender_company || '',
          contactPerson: result.contacts?.contactPerson || emailData.sender_name || '',
          phone: result.contacts?.phone || emailData.sender_phone || '',
          email: result.contacts?.email || emailData.sender_email || emailData.from || '',
          inn: result.contacts?.inn || emailData.sender_inn || '',
          city: result.contacts?.city || ''
        },
        estimatedBudget: Number(result.estimatedBudget || 0),
        deadlineDate: result.deadlineDate || null,
        draftReply: result.draftReply || ''
      };
    }
  } catch (err) {
    console.warn(`[AI Engine] External LLM provider ${provider} failed, falling back to Built-in NLP:`, err.message);
  }

  // Fallback to built-in smart NLP
  const fallbackResult = analyzeEmailWithNLP(emailData);
  return fallbackResult;
}

/**
 * Test AI Provider Connection
 */
export async function testAiConnection(provider, config) {
  const testEmail = {
    subject: 'Запрос КП на поставку кабельной продукции',
    from: 'Иван Сергеев <sergeev@promstroy.ru>',
    body: `Добрый день! Просим направить коммерческое предложение на кабель ВВГнг-LS 3х2.5 в количестве 500 метров и муфты соединительные 10 шт. Срок до пятницы, доставка в г. Казань. С уважением, ООО "ПромСтройМонтаж", тел. +7 (843) 299-11-22.`
  };

  if (provider === 'builtin_nlp') {
    const res = analyzeEmailWithNLP(testEmail);
    return { success: true, message: 'Встроенный NLP движок активен и готов к работе!', sample: res };
  }

  if (provider === 'groq') {
    if (!config.groq_api_key) throw new Error('Не указан API ключ Groq');
    const res = await callGroq(config.groq_api_key, config.groq_model, testEmail);
    return { success: true, message: `Подключение к Groq (${config.groq_model || 'llama-3.3-70b'}) успешно!`, sample: res };
  }

  if (provider === 'gemini') {
    if (!config.gemini_api_key) throw new Error('Не указан API ключ Google Gemini');
    const res = await callGemini(config.gemini_api_key, config.gemini_model, testEmail);
    return { success: true, message: `Подключение к Gemini (${config.gemini_model || 'gemini-2.0-flash'}) успешно!`, sample: res };
  }

  if (provider === 'openrouter') {
    if (!config.openrouter_api_key) throw new Error('Не указан API ключ OpenRouter');
    const res = await callOpenRouter(config.openrouter_api_key, config.openrouter_model, testEmail);
    return { success: true, message: `Подключение к OpenRouter успешно!`, sample: res };
  }

  if (provider === 'ollama') {
    const res = await callOllama(config.ollama_endpoint, config.ollama_model, testEmail);
    return { success: true, message: `Подключение к локальному Ollama успешно!`, sample: res };
  }

  throw new Error(`Неизвестный провайдер: ${provider}`);
}
