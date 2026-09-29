/**
 * Smart Built-in NLP Engine for Russian and English business emails.
 * 100% Free, Zero-latency, Offline, No external API keys required.
 */

// Category Definitions
export const CATEGORIES = {
  RFQ: {
    id: 'RFQ',
    label: 'Запрос КП / Цен',
    labelEn: 'Commercial Proposal / RFQ',
    color: 'emerald',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
  },
  SPEC_LIST: {
    id: 'SPEC_LIST',
    label: 'Запрос перечня / номенклатуры',
    labelEn: 'Specification / Item List Request',
    color: 'blue',
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
  },
  GENERAL_INQUIRY: {
    id: 'GENERAL_INQUIRY',
    label: 'Общий запрос / Консультация',
    labelEn: 'General Inquiry / Consultation',
    color: 'amber',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
  },
  ORDER: {
    id: 'ORDER',
    label: 'Прямой заказ / Счёт',
    labelEn: 'Direct Order / Invoice Request',
    color: 'purple',
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
  },
  SPAM_OTHER: {
    id: 'SPAM_OTHER',
    label: 'Инфо / Спам / Рассылка',
    labelEn: 'Info / Spam / Newsletter',
    color: 'slate',
    badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
  }
};

export function classifyEmail(subject = '', body = '') {
  const text = `${subject} ${body}`.toLowerCase();

  // Keyword score counters
  let scores = {
    RFQ: 0,
    SPEC_LIST: 0,
    GENERAL_INQUIRY: 0,
    ORDER: 0,
    SPAM_OTHER: 0
  };

  // RFQ Keywords
  const rfqPatterns = [
    /коммерческ\w*\s+предложен\w*/i,
    /\bкп\b/i,
    /расчет\w*\s+стоимост\w*/i,
    /запрос\w*\s+цен\w*/i,
    /ценов\w*\s+предложен\w*/i,
    /прош\w*\s+рассчитать/i,
    /стоимост\w*\s+поставк\w*/i,
    /смет\w*/i,
    /калькуляц\w*/i,
    /rfq/i,
    /request for quote/i,
    /price quote/i,
    /commercial offer/i,
    /прайс-лист\s+с\s+учетом\s+скидк/i,
    /условия\s+поставки/i,
    /тендер\w*/i,
    /закупк\w*/i,
    /бюджет\w*/i,
    /прошу\s+выставить\s+кп/i,
    /направьте\s+кп/i
  ];

  // Spec List Keywords
  const specPatterns = [
    /перечен\w*/i,
    /номенклатур\w*/i,
    /спецификац\w*/i,
    /список\s+позици\w*/i,
    /список\s+товар\w*/i,
    /список\s+запчаст\w*/i,
    /ведомост\w*/i,
    /реестр/i,
    /наличи\w*\s+на\s+склад\w*/i,
    /остатк\w*\s+на\s+склад\w*/i,
    /каталог\w*/i,
    /ассортимент/i,
    /specification/i,
    /item list/i,
    /bill of materials/i,
    /bom/i,
    /артикул\w*/i,
    /наименовани\w*\s+и\s+количеств\w*/i
  ];

  // General Inquiry Keywords
  const inquiryPatterns = [
    /консультац\w*/i,
    /подскажите/i,
    /вопрос\s+по/i,
    /информац\w*\s+о/i,
    /уточнить\s+возможност\w*/i,
    /сотрудничеств\w*/i,
    /возможно\s+ли/i,
    /как\s+работает/i,
    /интересует\s+услуг\w*/i,
    /сертификат\w*/i,
    /техническ\w*\s+характеристик\w*/i,
    /inquiry/i,
    /question/i,
    /information request/i,
    /could you clarify/i
  ];

  // Direct Order Keywords
  const orderPatterns = [
    /выставить\s+счет/i,
    /выставите\s+счет/i,
    /оформля\w*\s+заказ/i,
    /готовы\s+заказать/i,
    /реквизиты\s+во\s+вложении/i,
    /карточка\s+предприятия/i,
    /направляем\s+договор/i,
    /оплата\s+по\s+безнал/i,
    /подтверждаем\s+заказ/i,
    /счет\s+на\s+оплату/i,
    /purchase order/i,
    /place an order/i,
    /proforma invoice/i
  ];

  // Spam / Promo Keywords
  const spamPatterns = [
    /рассылк\w*/i,
    /вебинар/i,
    /увеличить\s+продажи/i,
    /seo\s+продвижен\w*/i,
    /базы\s+клиентов/i,
    /холодн\w*\s+звонк\w*/i,
    /unsubscribe/i,
    /отписаться\s+от\s+рассылки/i,
    /выигрыш/i,
    /казино/i,
    /займ\w*/i,
    /кредит\s+для\s+бизнеса/i
  ];

  // Compute scores
  for (const p of rfqPatterns) if (p.test(text)) scores.RFQ += 2.5;
  for (const p of specPatterns) if (p.test(text)) scores.SPEC_LIST += 2.2;
  for (const p of inquiryPatterns) if (p.test(text)) scores.GENERAL_INQUIRY += 1.8;
  for (const p of orderPatterns) if (p.test(text)) scores.ORDER += 2.8;
  for (const p of spamPatterns) if (p.test(text)) scores.SPAM_OTHER += 3.0;

  // Subject line weight multiplier (subject has higher intent signal)
  const subjectLower = subject.toLowerCase();
  for (const p of rfqPatterns) if (p.test(subjectLower)) scores.RFQ += 3.0;
  for (const p of specPatterns) if (p.test(subjectLower)) scores.SPEC_LIST += 2.5;
  for (const p of inquiryPatterns) if (p.test(subjectLower)) scores.GENERAL_INQUIRY += 2.0;
  for (const p of orderPatterns) if (p.test(subjectLower)) scores.ORDER += 3.5;
  for (const p of spamPatterns) if (p.test(subjectLower)) scores.SPAM_OTHER += 4.0;

  // Determine top category
  let topCategory = 'RFQ';
  let maxScore = -1;
  let totalScore = 0;

  for (const [cat, score] of Object.entries(scores)) {
    totalScore += score;
    if (score > maxScore) {
      maxScore = score;
      topCategory = cat;
    }
  }

  // If no specific match, default smartly
  if (maxScore <= 0) {
    if (/запрос|расчет|цена|купить|поставка|price|quote/i.test(text)) {
      topCategory = 'RFQ';
    } else {
      topCategory = 'GENERAL_INQUIRY';
    }
    maxScore = 1;
    totalScore = 1;
  }

  const confidence = Math.min(0.98, Math.max(0.65, Number((maxScore / (totalScore || 1) * 0.5 + 0.5).toFixed(2))));

  return { category: topCategory, confidence };
}

export function extractUrgencyAndDeadline(text = '') {
  const lower = text.toLowerCase();
  let urgency = 'MEDIUM';
  let deadlineDate = null;
  const now = new Date();

  // High urgency keywords
  if (
    /срочно|asap|горят\s+сроки|до\s+конца\s+дня|в\s+кратчайшие\s+сроки|до\s+завтра|дедлайн|сегодня|аукцион\s+до|urgent|immediate/i.test(lower)
  ) {
    urgency = 'HIGH';
    // default deadline to tomorrow or 2 days
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    deadlineDate = d.toISOString().split('T')[0];
  } else if (/не\s+срочно|в\s+течение\s+месяца|на\s+следующий\s+квартал|в\s+перспективе|planning\s+for/i.test(lower)) {
    urgency = 'LOW';
    const d = new Date(now);
    d.setDate(d.getDate() + 14);
    deadlineDate = d.toISOString().split('T')[0];
  } else {
    urgency = 'MEDIUM';
    const d = new Date(now);
    d.setDate(d.getDate() + 3);
    deadlineDate = d.toISOString().split('T')[0];
  }

  // Exact date extraction: "до 15.10.2026", "до 25 октября", etc.
  const dateMatch1 = text.match(/(?:до|к|дедлайн|срок)[:\s]+(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?/i);
  if (dateMatch1) {
    const day = parseInt(dateMatch1[1], 10);
    const month = parseInt(dateMatch1[2], 10) - 1;
    const year = dateMatch1[3] ? (dateMatch1[3].length === 2 ? 2000 + parseInt(dateMatch1[3], 10) : parseInt(dateMatch1[3], 10)) : now.getFullYear();
    const parsedDate = new Date(year, month, day);
    if (!isNaN(parsedDate.getTime())) {
      deadlineDate = parsedDate.toISOString().split('T')[0];
    }
  }

  const monthsRu = {
    'январ': 0, 'феврал': 1, 'март': 2, 'апрел': 3, 'ма': 4, 'июн': 5,
    'июл': 6, 'август': 7, 'сентябр': 8, 'октябр': 9, 'ноябр': 10, 'декабр': 11
  };
  const dateMatch2 = text.match(/(?:до|к|срок)[:\s]+(\d{1,2})\s+([а-яё]+)(?:\s+(\d{4}))?/i);
  if (dateMatch2) {
    const day = parseInt(dateMatch2[1], 10);
    const monthStr = dateMatch2[2].toLowerCase();
    const year = dateMatch2[3] ? parseInt(dateMatch2[3], 10) : now.getFullYear();
    for (const [mPrefix, mIndex] of Object.entries(monthsRu)) {
      if (monthStr.startsWith(mPrefix)) {
        const parsedDate = new Date(year, mIndex, day);
        if (!isNaN(parsedDate.getTime())) {
          deadlineDate = parsedDate.toISOString().split('T')[0];
        }
        break;
      }
    }
  }

  return { urgency, deadlineDate };
}

export function extractContactsAndCompany(text = '', fromHeader = '') {
  let company = '';
  let contactPerson = '';
  let phone = '';
  let email = '';
  let inn = '';
  let city = '';

  // Extract Email
  const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  if (emailMatch) {
    email = emailMatch[1];
  } else if (fromHeader) {
    const headerEmail = fromHeader.match(/<([^>]+)>/) || fromHeader.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    if (headerEmail) email = headerEmail[1];
  }

  // Extract Phone (+7/8 standard format)
  const phoneMatch = text.match(/(?:\+7|8|7)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}/);
  if (phoneMatch) {
    phone = phoneMatch[0].trim();
  }

  // Extract INN / KPP
  const innMatch = text.match(/ИНН[\s:]+(\d{10,12})/i);
  if (innMatch) {
    inn = innMatch[1];
  }

  // Extract Company Name
  const companyPatterns = [
    /(?:ООО|АО|ЗАО|ПАО|ИП|НПО|МК|ГК|ТД)\s+["«][^"»\n\r]+["»]/i,
    /(?:ООО|АО|ЗАО|ПАО|ИП|НПО|МК|ГК|ТД)\s+[A-Za-zА-Яа-я0-9_-]+/i,
    /(?:Компания|Организация|Предприятие|Завод|Холдинг)[:\s]+["«]?([^"»\n\r,]+)["»]?/i,
    /(?:LLC|Inc\.|Corp\.|Ltd\.)\s+["«]?([A-Za-z0-9\s]+)["»]?/i
  ];

  for (const pattern of companyPatterns) {
    const match = text.match(pattern);
    if (match) {
      company = match[0].trim().replace(/^(?:Компания|Организация|Предприятие)[:\s]+/i, '');
      break;
    }
  }

  // Extract Contact Person
  const personPatterns = [
    /(?:С уважением|Best regards|С наилучшими пожеланиями)[,\s\n]+([А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ][а-яё]+)?)/,
    /(?:Контактное лицо|Менеджер|Инженер|Директор|Ответственный)[:\s]+([А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ][а-яё]+)?)/i,
    /(?:Подготовил|Исполнитель)[:\s]+([А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+)/i
  ];

  for (const pattern of personPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      contactPerson = match[1].trim();
      break;
    }
  }

  // Fallback contact person from fromHeader if empty
  if (!contactPerson && fromHeader) {
    const cleanHeader = fromHeader.replace(/<[^>]+>/, '').replace(/["']/g, '').trim();
    if (cleanHeader && !cleanHeader.includes('@') && cleanHeader.length > 2) {
      contactPerson = cleanHeader;
    }
  }

  // Extract City / Delivery destination
  const cityMatch = text.match(/(?:доставка|город|г\.|в\s+город|склад\s+в)\s+([А-ЯЁ][а-яё]+(?:-[А-ЯЁ][а-яё]+)?)/i);
  if (cityMatch) {
    city = cityMatch[1].trim();
  }

  return { company, contactPerson, phone, email, inn, city };
}

export function extractItemsAndQuantities(text = '') {
  const items = [];
  if (!text) return items;

  // 1. Clean out greetings, headers, and signatures
  const cleanedText = text
    .replace(/(?:с уважением|best regards|с наилучшими пожеланиями|тел(?:ефон)?[:\s]|email:|инн:|огрн:).*$/is, '')
    .replace(/^(?:здравствуйте|добрый день|добрый вечер|приветствую|уважаемые коллеги|уважаемый[^,\n!]+)[,!\.]+/gim, '');

  // 2. Break into lines or sentences
  const rawLines = cleanedText.split(/\r?\n+/);
  const candidates = [];

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 3) continue;

    // Check if line contains numbered/bullet items or multiple items
    if (/^\s*(?:\d+[\.\)]|\-|\*|•)\s+/.test(trimmed)) {
      candidates.push(trimmed);
    } else {
      // Split sentences or clauses by period, exclamation, or semicolon
      const subParts = trimmed.split(/(?<=[.?!;])\s+|\s+;\s+/);
      for (const p of subParts) {
        if (!p.trim()) continue;
        // If clause has " и " or " а также " with multiple items
        if (/\s+и\s+|\s*,\s*а также\s*/i.test(p) && (p.match(/\d+\s*(?:шт|компл|м|кг|т|упак|метров|паллет|pcs|\bм2\b|\bпог\.?\s*м\b)/gi) || []).length > 1) {
          const splitItems = p.split(/\s+и\s+|\s*,\s*а также\s*/i);
          candidates.push(...splitItems);
        } else {
          candidates.push(p);
        }
      }
    }
  }

  // Regex patterns
  const qtyRegex = /(?:\((\d+(?:[.,]\d+)?)\s*(шт\.?|штук\w*|компл\w*|п\.м\.?|пог\.?\s*м|м2|кв\.?\s*м|м3|куб\.?\s*м|метров|м|кг|килограмм\w*|тонн\w*|упак\w*|паллет\w*|pcs|units|sets|kg|m)\)|\b(\d+(?:[.,]\d+)?)\s*(шт\.?|штук\w*|компл\w*|п\.м\.?|пог\.?\s*м|м2|кв\.?\s*м|м3|куб\.?\s*м|метров|м|кг|килограмм\w*|тонн\w*|упак\w*|паллет\w*|pcs|units|sets|kg|m)\b)/i;
  const skuRegex = /(?:арт\.?|артикул|код|модель|pn|sku|s\/n)[:\s]*([A-Za-z0-9\-_\/]+)/i;
  const priceRegex = /(?:цена|стоимость|по|бюджет)[:\s]*(\d+[\s\d]*(?:[.,]\d+)?)\s*(?:руб|р|rub|usd|\$|eur|€)?/i;

  for (const cand of candidates) {
    const s = cand.trim();
    if (!s || s.length < 3) continue;

    // Skip purely logistical or deadline clauses
    if (/^(?:дедлайн|срок поставки|доставка|оплата|прошу|направляем|условия|требования|в наличии)/i.test(s) && !qtyRegex.test(s)) {
      continue;
    }

    const matchNumbered = s.match(/^(?:(?:\d+[\.\)]|\-|\*|•)\s*)(.+)/);
    const content = matchNumbered ? matchNumbered[1].trim() : s;

    const qtyMatch = content.match(qtyRegex);
    const skuMatch = content.match(skuRegex);
    const priceMatch = content.match(priceRegex);

    if (qtyMatch || matchNumbered || skuMatch) {
      let quantity = 1;
      let unit = 'шт';
      let sku = skuMatch ? skuMatch[1] : '';
      let targetPrice = null;

      if (qtyMatch) {
        const numStr = qtyMatch[1] || qtyMatch[3];
        const unitStr = qtyMatch[2] || qtyMatch[4];
        if (numStr) quantity = parseFloat(numStr.replace(',', '.'));
        if (unitStr) unit = unitStr.replace(/\.$/, '');
      }

      if (priceMatch) {
        targetPrice = parseFloat(priceMatch[1].replace(/\s/g, '').replace(',', '.'));
      }

      // Clean item name
      let cleanName = content
        .replace(/\(\s*\d+(?:[.,]\d+)?\s*(?:шт|компл|м|кг|т|упак|метров|паллет|pcs)[^\)]*\)/i, '')
        .replace(/[-—–:]\s*\d+(?:[.,]\d+)?\s*(?:шт|компл|м|кг|т|упак|метров|паллет|pcs).*$/i, '')
        .replace(/(?:доставка|дедлайн|срок|оплата|тел|инн).*$/i, '')
        .replace(/(?:арт|артикул|sku)[:\s]*[A-Za-z0-9\-_\/]+/i, '')
        .trim();

      while (/^(?:просим|прошу|рассчитать|сделать|подготовить|направить|поставка|поставку|расчет|кп|коммерческое\s+предложение|заказ|на|по|в|для|наличие|позиции)\s+/i.test(cleanName)) {
        cleanName = cleanName.replace(/^(?:просим|прошу|рассчитать|сделать|подготовить|направить|поставка|поставку|расчет|кп|коммерческое\s+предложение|заказ|на|по|в|для|наличие|позиции)\s+/i, '').trim();
      }

      cleanName = cleanName.replace(/^[-—–:\s\.\,]+|[-—–:\s\.\,]+$/g, '').trim();

      if (cleanName.length > 2 && !/^(доставка|дедлайн|оплата|срок|требования|условия)/i.test(cleanName)) {
        items.push({
          name: cleanName,
          sku,
          quantity: quantity || 1,
          unit: unit || 'шт',
          target_price: targetPrice,
          note: ''
        });
      }
    }
  }

  // Deduplicate items
  const uniqueItems = [];
  const seen = new Set();
  for (const it of items) {
    const key = it.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueItems.push(it);
    }
  }

  return uniqueItems.slice(0, 30);
}

export function generateExecutiveSummary(category, contacts, items, urgency, subject, body) {
  const catObj = CATEGORIES[category] || CATEGORIES.RFQ;
  const companyOrPerson = contacts.company || contacts.contactPerson || 'Клиент';
  const itemCount = items.length;

  let summaryParts = [];

  // Sentence 1: Purpose & Sender
  if (category === 'RFQ') {
    summaryParts.push(`Поступил запрос на расчет коммерческого предложения от ${companyOrPerson}.`);
  } else if (category === 'SPEC_LIST') {
    summaryParts.push(`Запрос спецификации и информации о наличии номенклатуры от ${companyOrPerson}.`);
  } else if (category === 'ORDER') {
    summaryParts.push(`Прямой запрос на оформление заказа и выставление счета от ${companyOrPerson}.`);
  } else if (category === 'GENERAL_INQUIRY') {
    summaryParts.push(`Поступило обращение / консультационный запрос от ${companyOrPerson}.`);
  } else {
    summaryParts.push(`Информационное входящее сообщение от ${companyOrPerson}.`);
  }

  // Sentence 2: Key positions / Scope
  if (itemCount > 0) {
    const sampleItems = items.slice(0, 3).map(i => `"${i.name}" (${i.quantity} ${i.unit})`).join(', ');
    const moreText = itemCount > 3 ? ` и еще ${itemCount - 3} поз.` : '';
    summaryParts.push(`Требуется расчет по ${itemCount} позициям: ${sampleItems}${moreText}.`);
  } else {
    // Extract key sentence from body
    const firstSentences = body
      .replace(/\r?\n+/g, ' ')
      .split(/(?<=[.?!])\s+/)
      .filter(s => s.length > 15 && !s.toLowerCase().includes('здравствуйте') && !s.toLowerCase().includes('уважением'))
      .slice(0, 1);
    if (firstSentences.length > 0) {
      summaryParts.push(`Суть обращения: "${firstSentences[0].trim().slice(0, 150)}${firstSentences[0].length > 150 ? '...' : ''}"`);
    }
  }

  // Sentence 3: Urgency & Logistics
  const urgencyLabel = urgency === 'HIGH' ? 'Срочный приоритет (ASAP)' : urgency === 'LOW' ? 'Низкий приоритет' : 'Стандартный срок ответа';
  let logistics = contacts.city ? ` Доставка в г. ${contacts.city}.` : '';
  summaryParts.push(`Приоритет: ${urgencyLabel}.${logistics}`);

  return summaryParts.join(' ');
}

export function generateActionItems(category, contacts, items, urgency) {
  const actions = [];
  const clientName = contacts.contactPerson || contacts.company || 'клиентом';

  if (category === 'RFQ') {
    if (items.length > 0) {
      actions.push(`Проверить складские остатки и закупочные цены по ${items.length} позициям`);
      actions.push(`Сформировать и рассчитать официальное коммерческое предложение (КП)`);
    } else {
      actions.push(`Уточнить точную спецификацию, объемы и артикулы у клиента`);
    }
    if (contacts.city) {
      actions.push(`Рассчитать стоимость и ориентировочные сроки доставки до г. ${contacts.city}`);
    }
    actions.push(`Отправить КП и связаться с ${clientName} для согласования условий`);
  } else if (category === 'SPEC_LIST') {
    actions.push(`Сверить перечень номенклатуры с текущим прайс-листом и каталогом`);
    actions.push(`Подготовить выгрузку остатков и спецификацию с актуальными ценами`);
    actions.push(`Направить ответное письмо с каталогом / перечнем позиций`);
  } else if (category === 'ORDER') {
    actions.push(`Зарезервировать товар на складе под заказ`);
    actions.push(`Сформировать и выставить официальный счёт на оплату`);
    if (contacts.inn) {
      actions.push(`Проверить реквизиты контрагента по ИНН ${contacts.inn} в 1С`);
    }
    actions.push(`Направить счёт и проект договора на ${contacts.email || 'email клиента'}`);
  } else if (category === 'GENERAL_INQUIRY') {
    actions.push(`Подготовить развернутую консультацию по техническим характеристикам и условиям`);
    actions.push(`Связаться с ${clientName} по ${contacts.phone ? `тел. ${contacts.phone}` : 'почте'}`);
  } else {
    actions.push(`Ознакомиться с сообщением и при необходимости переместить в архив`);
  }

  return actions;
}

export function generateDraftReply(category, contacts, items, subject) {
  const greeting = contacts.contactPerson ? `Добрый день, ${contacts.contactPerson}!` : 'Добрый день!';
  const compRef = contacts.company ? ` для компании ${contacts.company}` : '';

  let bodyText = '';

  if (category === 'RFQ') {
    let itemsTable = '';
    if (items.length > 0) {
      itemsTable = '\n\nПредварительный расчет по вашему списку:\n' +
        items.map((it, idx) => `${idx + 1}. ${it.name} — ${it.quantity} ${it.unit} (в наличии / под заказ)`).join('\n') +
        '\n';
    }

    bodyText = `${greeting}

Благодарим за обращение и интерес к нашей продукции!

Мы получили ваш запрос на коммерческое предложение${compRef} по теме "${subject}".${itemsTable}
Официальное коммерческое предложение с точной стоимостью, сроками поставки и условиями оплаты сформировано и приложено к данному письму.

Условия сотрудничества:
• Срок действия предложения: 14 календарных дней
• Условия оплаты: по согласованию (безналичный расчет)
• Доставка: самовывоз со склада / транспортной компанией

Готовы ответить на любые уточняющие вопросы и обсудить индивидуальные скидки при согласовании объема.

С уважением,
Отдел продаж
ООО "Бизнес Решения"
Тел: +7 (495) 123-45-67
Email: sales@example.com`;
  } else if (category === 'SPEC_LIST') {
    bodyText = `${greeting}

Благодарим за проявленный интерес к нашей номенклатуре.

Направляем вам актуальный перечень позиций и спецификацию по вашему запросу "${subject}".
Все указанные позиции доступны к заказу с нашего распределительного склада.

Прикрепляем актуальный прайс-лист и карточки технических характеристик.
Будем рады подготовить детальный расчет при предоставлении планируемых объемов.

С уважением,
Менеджер по работе с клиентами
ООО "Бизнес Решения"`;
  } else if (category === 'ORDER') {
    bodyText = `${greeting}

Благодарим за заказ!
Ваш заказ по теме "${subject}" принят в работу.

Счет на оплату сформирован и направлен во вложении.
Товар зарезервирован на складе на 3 банковских дня.

После поступления оплаты мы немедленно приступим к комплектации и отгрузке.

С уважением,
ООО "Бизнес Решения"`;
  } else {
    bodyText = `${greeting}

Благодарим за ваше письмо!

Мы внимательно ознакомились с вашим обращением по теме "${subject}".
Наш специалист свяжется с вами в ближайшее время для предоставления детальной информации.

С уважением,
ООО "Бизнес Решения"`;
  }

  return bodyText;
}

export function analyzeEmailWithNLP(emailData) {
  const subject = emailData.subject || '';
  const body = emailData.body || emailData.raw_body_text || '';
  const from = emailData.from || emailData.sender_email || '';

  const { category, confidence } = classifyEmail(subject, body);
  const { urgency, deadlineDate } = extractUrgencyAndDeadline(`${subject}\n${body}`);
  const contacts = extractContactsAndCompany(`${subject}\n${body}`, from);
  const items = extractItemsAndQuantities(body);

  const summary = generateExecutiveSummary(category, contacts, items, urgency, subject, body);
  const actionItems = generateActionItems(category, contacts, items, urgency);
  const draftReply = generateDraftReply(category, contacts, items, subject);

  // Calculate estimated budget if items have target prices
  const estimatedBudget = items.reduce((acc, it) => acc + ((it.target_price || 0) * (it.quantity || 1)), 0);

  return {
    category,
    urgency,
    confidence,
    provider: 'builtin_nlp',
    summary,
    actionItems,
    items,
    contacts: {
      company: contacts.company || emailData.sender_company || '',
      contactPerson: contacts.contactPerson || emailData.sender_name || '',
      phone: contacts.phone || emailData.sender_phone || '',
      email: contacts.email || emailData.sender_email || from || '',
      inn: contacts.inn || emailData.sender_inn || '',
      city: contacts.city || ''
    },
    estimatedBudget,
    deadlineDate,
    draftReply
  };
}
