const TYPE_RULES = [
  {
    type: "Тендер",
    keywords: ["тендер", "конкурс", "закупк", "44-фз", "223-фз", "торгов"],
  },
  {
    type: "Запрос КП",
    keywords: [
      "коммерческ",
      "кп ",
      "предложени",
      "рассчитать",
      "расчёт",
      "расчет",
    ],
  },
  {
    type: "Запрос цен",
    keywords: ["прайс", "стоимост", "цен", "расценк", "сколько стоит"],
  },
  {
    type: "Документы",
    keywords: ["договор", "реквизит", "сертификат", "лицензи", "документ"],
  },
];

const HIGH_PRIORITY_WORDS = [
  "срочно",
  "сегодня",
  "до конца дня",
  "asap",
  "в течение часа",
  "крайний срок",
];

const MEDIUM_PRIORITY_WORDS = [
  "завтра",
  "в ближайшее время",
  "просим направить",
  "ждём",
  "ждем",
];

function cleanText(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

function firstUsefulSentence(body) {
  const clean = cleanText(body);
  const sentences = clean
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 18);

  const useful =
    sentences.find(
      (sentence) =>
        !/^(добрый|здравствуйте|коллеги|уважаем)/i.test(sentence),
    ) || sentences[0];

  if (!useful) return "Текст письма не содержит подробностей.";
  return useful.length > 190 ? `${useful.slice(0, 187)}…` : useful;
}

function detectType(text) {
  const match = TYPE_RULES.find(({ keywords }) =>
    keywords.some((keyword) => text.includes(keyword)),
  );
  return match?.type || "Общий запрос";
}

function detectPriority(text, type) {
  if (
    HIGH_PRIORITY_WORDS.some((keyword) => text.includes(keyword)) ||
    type === "Тендер"
  ) {
    return "Высокий";
  }
  if (
    MEDIUM_PRIORITY_WORDS.some((keyword) => text.includes(keyword)) ||
    type === "Запрос КП"
  ) {
    return "Средний";
  }
  return "Обычный";
}

function extractDeadline(text) {
  const numericDate = text.match(
    /(?:до|срок[:\s]*)?\s*(\d{1,2}[./]\d{1,2}(?:[./]\d{2,4})?)/i,
  );
  if (numericDate) return numericDate[1].replaceAll("/", ".");

  const wordDate = text.match(
    /(?:до|не позднее)\s+(\d{1,2}\s+(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря))/i,
  );
  if (wordDate) return wordDate[1];

  if (text.includes("сегодня")) return "Сегодня";
  if (text.includes("завтра")) return "Завтра";
  return null;
}

function extractAmount(text) {
  const match = text.match(
    /(\d[\d\s]*(?:[.,]\d+)?)\s*(₽|руб(?:лей|ля|.)?|тыс\.?\s*руб|млн\s*руб)/i,
  );
  return match ? cleanText(`${match[1]} ${match[2]}`) : null;
}

function buildNextAction(type, deadline) {
  const due = deadline ? ` до ${deadline}` : "";
  const actions = {
    Тендер: `Проверить требования и подготовить пакет документов${due}`,
    "Запрос КП": `Уточнить объём и подготовить коммерческое предложение${due}`,
    "Запрос цен": `Проверить наличие и отправить актуальные цены${due}`,
    Документы: `Подготовить и отправить запрошенные документы${due}`,
    "Общий запрос": `Уточнить детали и назначить ответственного${due}`,
  };
  return actions[type];
}

export function analyzeLocally({ subject = "", body = "" }) {
  const text = cleanText(`${subject} ${body}`).toLocaleLowerCase("ru");
  const type = detectType(text);
  const priority = detectPriority(text, type);
  const deadline = extractDeadline(text);
  const amount = extractAmount(text);
  const summary = firstUsefulSentence(body || subject);
  const keywordHits = TYPE_RULES.flatMap((rule) => rule.keywords).filter(
    (keyword) => text.includes(keyword),
  ).length;

  return {
    type,
    priority,
    deadline,
    amount,
    summary,
    nextAction: buildNextAction(type, deadline),
    confidence: Math.min(97, 78 + keywordHits * 4),
    engine: "Локальный AI",
  };
}

async function analyzeWithOllama(input) {
  const baseUrl = process.env.OLLAMA_URL?.replace(/\/$/, "");
  if (!baseUrl) return null;

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL || "qwen2.5:3b",
      stream: false,
      format: "json",
      prompt: `Проанализируй входящее деловое письмо. Верни только JSON с ключами:
type (одно из: "Запрос КП", "Запрос цен", "Тендер", "Документы", "Общий запрос"),
priority (одно из: "Высокий", "Средний", "Обычный"),
summary (одно короткое предложение на русском),
deadline (строка или null),
amount (строка или null),
nextAction (одно конкретное действие на русском),
confidence (целое число 0-100).

Тема: ${input.subject || ""}
Письмо: ${input.body || ""}`,
    }),
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) throw new Error(`Ollama returned ${response.status}`);
  const payload = await response.json();
  const parsed = JSON.parse(payload.response);
  return { ...parsed, engine: process.env.OLLAMA_MODEL || "Ollama" };
}

export async function analyzeMessage(input) {
  try {
    return (await analyzeWithOllama(input)) || analyzeLocally(input);
  } catch (error) {
    console.warn("Ollama analysis failed, using local engine:", error.message);
    return analyzeLocally(input);
  }
}
