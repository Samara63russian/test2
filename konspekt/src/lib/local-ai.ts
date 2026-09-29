import type { AnalyzeResult, EmailInput, RequestType } from "./types";

const KP_PATTERNS =
  /коммерческ[а-яё]*\s+предложен|запрос\s+кп(?![а-яёa-z0-9])|(?<![а-яёa-z0-9])кп(?![а-яёa-z0-9])|прайс|цен[аыу]\s+на|котировк|quote\s+request|(?<![a-z])rfq(?![a-z])|(?<![a-z])rfp(?![a-z])|стоимость|расч[её]т\s+стоимост/i;

const PERECHEN_PATTERNS =
  /перечен[ьяи]|спецификац|номенклатур|список\s+(товар|позиц|материал)|комплектац|ведомост|bill\s+of\s+materials|(?<![a-z])bom(?![a-z])|артикул/i;

const REQUEST_PATTERNS =
  /просьб[аы]|прошу\s+(предостав|выслат|направ|присл)|нужн[аоы]\s+|интересует|можно\s+ли|запрашива|уточн[ия]/i;

function extractCompany(from: string, body: string): string | undefined {
  const domain = from.match(/@([a-z0-9.-]+\.[a-z]{2,})/i)?.[1];
  if (domain && !/gmail|mail\.ru|yandex|yahoo|outlook|hotmail|icloud/i.test(domain)) {
    const name = domain.split(".")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  const org = body.match(
    /(?:ООО|АО|ПАО|ИП|ЗАО)\s+[«"]?([A-Za-zА-Яа-яёЁ0-9\s\-.]+)[»"]?/
  );
  if (org?.[1]) return org[0].trim().slice(0, 80);
  return undefined;
}

function extractDeadline(text: string): string | undefined {
  const m = text.match(
    /(?:до|срок|дедлайн|к)\s+(\d{1,2}[./]\d{1,2}(?:[./]\d{2,4})?|\d{1,2}\s+(?:январ|феврал|март|апрел|ма[йя]|июн|июл|август|сентябр|октябр|ноябр|декабр)\w*)/i
  );
  return m?.[1];
}

function extractItems(text: string): string[] {
  const lines = text
    .split(/\n|•|—|- |\d+[.)]\s+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 3 && l.length < 120);

  const itemish = lines.filter((l) =>
    /шт|ед\.|комплект|артикул|модель|позиц|товар|материал|\d+\s*(мм|м|кг|л|шт)/i.test(
      l
    )
  );
  return [...new Set(itemish)].slice(0, 8);
}

function classifyType(text: string): { type: RequestType; confidence: number } {
  const kp = KP_PATTERNS.test(text);
  const pe = PERECHEN_PATTERNS.test(text);
  const rq = REQUEST_PATTERNS.test(text);

  if (kp && pe) return { type: "perechen", confidence: 0.72 };
  if (kp) return { type: "kp", confidence: 0.86 };
  if (pe) return { type: "perechen", confidence: 0.82 };
  if (rq) return { type: "request", confidence: 0.7 };
  return { type: "other", confidence: 0.45 };
}

function buildSummary(email: EmailInput, type: RequestType): string {
  const who = email.from.split("<")[0].trim() || email.from;
  const typeHint =
    type === "kp"
      ? "запрашивает коммерческое предложение"
      : type === "perechen"
        ? "просит перечень / спецификацию"
        : type === "request"
          ? "направил общий запрос"
          : "пришло письмо";

  const firstMeaningful = email.body
    .split(/\n+/)
    .map((l) => l.trim())
    .find((l) => l.length > 40 && !/^from:|^sent:|^to:|^subject:/i.test(l));

  const snippet = (firstMeaningful || email.subject)
    .replace(/\s+/g, " ")
    .slice(0, 160);

  return `${who} ${typeHint}. Тема: «${email.subject}». Суть: ${snippet}${snippet.length >= 160 ? "…" : ""}`;
}

function buildKeyPoints(email: EmailInput, type: RequestType): string[] {
  const points: string[] = [];
  points.push(`Тип: ${type === "kp" ? "запрос КП" : type === "perechen" ? "перечень" : type === "request" ? "запрос" : "прочее"}`);
  if (email.subject) points.push(`Тема: ${email.subject}`);
  const deadline = extractDeadline(`${email.subject}\n${email.body}`);
  if (deadline) points.push(`Срок: ${deadline}`);
  const items = extractItems(email.body);
  if (items.length) points.push(`Позиции: ${items.slice(0, 3).join("; ")}`);
  const ask = email.body.match(/(?:прошу|просим|нужно|требуется)[^.!?\n]{10,90}/i);
  if (ask) points.push(ask[0].trim());
  return points.slice(0, 5);
}

/** Offline / free fallback — no API key required */
export function analyzeLocal(email: EmailInput): AnalyzeResult {
  const blob = `${email.subject}\n${email.body}\n${email.from}`;
  const { type, confidence } = classifyType(blob);
  return {
    type,
    summary: buildSummary(email, type),
    keyPoints: buildKeyPoints(email, type),
    company: extractCompany(email.from, email.body),
    deadline: extractDeadline(blob),
    itemsMentioned: extractItems(email.body),
    confidence,
    aiProvider: "local",
  };
}

export function parseRawEmail(raw: string): EmailInput {
  const from =
    raw.match(/^From:\s*(.+)$/im)?.[1]?.trim() ||
    raw.match(/От:\s*(.+)$/im)?.[1]?.trim() ||
    "";
  const subject =
    raw.match(/^Subject:\s*(.+)$/im)?.[1]?.trim() ||
    raw.match(/^Тема:\s*(.+)$/im)?.[1]?.trim() ||
    "";
  const bodyStart = raw.search(/\n\n/);
  const body =
    bodyStart >= 0
      ? raw.slice(bodyStart).trim()
      : raw
          .replace(/^(From|От|Subject|Тема|To|Дата|Date|Sent):.*$/gim, "")
          .trim();

  return {
    from: from || "неизвестно@mail.local",
    subject: subject || "(без темы)",
    body: body || raw.trim(),
  };
}
