import type { AnalysisResult, EmailInput, InquiryType } from "./types";

const KP_PATTERNS =
  /коммерческ(ое|ого|ому)\s+предложен|запрос\s+кп|\bкп\b|расчёт\s+стоимост|расчет\s+стоимост|quote\s+request|\brfq\b|\brfp\b|предложите\s+цен|прос(им|ю)\s+выслать\s+кп|подготов(ьте|ить)\s+кп/i;

const PRICE_PATTERNS =
  /перечен|прайс.?лист|каталог\s+цен|price\s*list|актуальн(ые|ый)\s+цен|вышлите\s+цены|прайс\b|спецификац(ия|ию)\s+с\s+ценами/i;

const INQUIRY_PATTERNS =
  /интересует|хотим\s+узнать|подскажите|можно\s+ли|наличие|сроки\s+поставк|условия\s+сотрудничеств|заявк|inquiry|request\s+for\s+information|\brfi\b/i;

const URGENCY_HIGH =
  /срочн|asap|сегодня|до\s+\d{1,2}[\.\/]\d{1,2}|как\s+можно\s+быстрее|urgent|немедленн/i;

function extractEmail(from: string, body: string): string {
  const fromMatch = from.match(/[\w.+-]+@[\w.-]+\.\w+/);
  if (fromMatch) return fromMatch[0];
  const bodyMatch = body.match(/[\w.+-]+@[\w.-]+\.\w+/);
  return bodyMatch?.[0] ?? "";
}

function extractCompany(from: string, subject: string, body: string): string {
  const domain = extractEmail(from, "").split("@")[1];
  if (domain && !/gmail|mail\.ru|yandex|yahoo|outlook|hotmail|icloud/i.test(domain)) {
    const name = domain.split(".")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  const companyPatterns = [
    /(?:ООО|АО|ЗАО|ПАО|ИП)\s+[«"]?([^«»"\n,]{2,60})[»"]?/i,
    /компания\s+[«"]?([^«»"\n,]{2,60})[»"]?/i,
    /от\s+компании\s+([^\n,.]{2,60})/i,
  ];

  for (const pattern of companyPatterns) {
    const match = `${subject}\n${body}`.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  const nameFromFrom = from.replace(/<[^>]+>/, "").trim();
  if (nameFromFrom && !nameFromFrom.includes("@")) return nameFromFrom;
  return domain ? domain : "Не указана";
}

function extractContactName(from: string, body: string): string {
  const fromName = from.replace(/<[^>]+>/, "").trim();
  if (fromName && !fromName.includes("@") && fromName.length < 80) {
    return fromName;
  }

  const signature = body.match(
    /(?:с\s+уважением|best\s+regards|искренее|cordially)[,:\s]*\n+([^\n]{2,60})/i,
  );
  if (signature?.[1]) return signature[1].trim();

  return fromName.includes("@") ? fromName.split("@")[0] : fromName || "Не указано";
}

function extractProducts(text: string): string[] {
  const products = new Set<string>();
  const lines = text.split(/\n|;/).map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    if (
      /(?:нужн|требуется|интересует|поставк|артикул|поз\.|наименование)/i.test(line) &&
      line.length < 120
    ) {
      const cleaned = line
        .replace(/^[-•*\d.)\s]+/, "")
        .replace(/(?:нужн[оаые]*|требуется|интересует)[:\s]*/i, "")
        .trim();
      if (cleaned.length > 3) products.add(cleaned.slice(0, 80));
    }
  }

  const quoted = text.matchAll(/[«"]([^«»"]{3,50})[»"]/g);
  for (const m of quoted) {
    if (!/запрос|письмо|коммерческ/i.test(m[1])) products.add(m[1]);
  }

  return Array.from(products).slice(0, 6);
}

function classifyType(text: string): InquiryType {
  if (KP_PATTERNS.test(text)) return "kp";
  if (PRICE_PATTERNS.test(text)) return "price_list";
  if (INQUIRY_PATTERNS.test(text)) return "inquiry";
  return "other";
}

function classifyUrgency(text: string): AnalysisResult["urgency"] {
  if (URGENCY_HIGH.test(text)) return "high";
  if (/на\s+этой\s+неделе|в\s+ближайшее|скоро|до\s+конца/i.test(text)) {
    return "medium";
  }
  return "low";
}

function extractiveSummary(body: string, type: InquiryType): string {
  const sentences = body
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && s.length < 280);

  const typeHint =
    type === "kp"
      ? "Запрос коммерческого предложения"
      : type === "price_list"
        ? "Запрос перечня / прайс-листа"
        : type === "inquiry"
          ? "Общий запрос"
          : "Входящее письмо";

  const pick =
    sentences.find((s) =>
      /запрос|нужн|интересу|прос(им|ю)|вышлите|предложите|коммерческ|прайс|перечен/i.test(
        s,
      ),
    ) ??
    sentences[0] ??
    body.replace(/\s+/g, " ").slice(0, 180);

  return `${typeHint}: ${pick}`.slice(0, 320);
}

function suggestedAction(type: InquiryType, urgency: AnalysisResult["urgency"]): string {
  const asap = urgency === "high" ? " Срочно — ответить сегодня." : "";
  switch (type) {
    case "kp":
      return `Подготовить коммерческое предложение и отправить ответ.${asap}`;
    case "price_list":
      return `Выслать актуальный прайс / перечень позиций.${asap}`;
    case "inquiry":
      return `Уточнить детали запроса и дать информационный ответ.${asap}`;
    default:
      return `Просмотреть письмо и определить следующий шаг.${asap}`;
  }
}

/** Offline free analyzer — works without API keys */
export function analyzeLocal(email: EmailInput): AnalysisResult {
  const text = `${email.subject}\n${email.body}`;
  const type = classifyType(text);
  const urgency = classifyUrgency(text);
  const contactEmail = extractEmail(email.from, email.body);

  return {
    type,
    summary: extractiveSummary(email.body, type),
    company: extractCompany(email.from, email.subject, email.body),
    contactName: extractContactName(email.from, email.body),
    contactEmail,
    products: extractProducts(text),
    urgency,
    suggestedAction: suggestedAction(type, urgency),
    aiProvider: "local",
  };
}

const GROQ_SYSTEM = `Ты помощник отдела продаж. Проанализируй входящее письмо на русском.
Верни ТОЛЬКО валидный JSON без markdown:
{
  "type": "kp" | "price_list" | "inquiry" | "other",
  "summary": "краткое резюме 1-2 предложения",
  "company": "название компании",
  "contactName": "ФИО или имя",
  "contactEmail": "email",
  "products": ["товар1", "товар2"],
  "urgency": "low" | "medium" | "high",
  "suggestedAction": "что сделать менеджеру"
}
type=kp — запрос коммерческого предложения / КП / RFQ
type=price_list — запрос прайса, перечня, каталога цен
type=inquiry — общий вопрос / интерес
type=other — не относится к продажам`;

export async function analyzeWithGroq(
  email: EmailInput,
  apiKey: string,
): Promise<AnalysisResult> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: GROQ_SYSTEM },
        {
          role: "user",
          content: `От: ${email.from}\nТема: ${email.subject}\n\n${email.body.slice(0, 6000)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Пустой ответ от Groq");

  const parsed = JSON.parse(content) as Partial<AnalysisResult>;
  const local = analyzeLocal(email);

  const validTypes: InquiryType[] = ["kp", "price_list", "inquiry", "other"];
  const type = validTypes.includes(parsed.type as InquiryType)
    ? (parsed.type as InquiryType)
    : local.type;

  const urgency =
    parsed.urgency === "low" || parsed.urgency === "medium" || parsed.urgency === "high"
      ? parsed.urgency
      : local.urgency;

  return {
    type,
    summary: (parsed.summary || local.summary).slice(0, 400),
    company: parsed.company || local.company,
    contactName: parsed.contactName || local.contactName,
    contactEmail: parsed.contactEmail || local.contactEmail,
    products: Array.isArray(parsed.products)
      ? parsed.products.map(String).slice(0, 8)
      : local.products,
    urgency,
    suggestedAction: parsed.suggestedAction || local.suggestedAction,
    aiProvider: "groq",
  };
}

export async function analyzeEmail(
  email: EmailInput,
  groqApiKey?: string | null,
): Promise<AnalysisResult> {
  if (groqApiKey?.trim()) {
    try {
      return await analyzeWithGroq(email, groqApiKey.trim());
    } catch {
      // fall through to local
    }
  }
  return analyzeLocal(email);
}
