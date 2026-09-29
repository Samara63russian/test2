import type { AnalyzeResult, EmailInput } from "./types";
import { analyzeLocal } from "./local-ai";

const SYSTEM_PROMPT = `Ты помощник менеджера по продажам. По входящему письму определи тип запроса и сделай краткий конспект на русском.

Типы:
- kp — запрос коммерческого предложения / цен / котировки
- perechen — запрос перечня, спецификации, номенклатуры, списка позиций
- request — общий запрос информации / уточнение
- other — не похоже на запрос

Ответь ТОЛЬКО валидным JSON без markdown:
{
  "type": "kp|perechen|request|other",
  "summary": "2-3 предложения: кто, чего хочет, важные детали",
  "keyPoints": ["краткий пункт", "..."],
  "company": "название или null",
  "deadline": "срок или null",
  "itemsMentioned": ["позиция", "..."],
  "confidence": 0.0
}`;

function buildUserPrompt(email: EmailInput): string {
  return `От: ${email.from}
Тема: ${email.subject}
Текст:
${email.body.slice(0, 6000)}`;
}

function safeParse(content: string): Partial<AnalyzeResult> | null {
  try {
    const cleaned = content.replace(/```json\s*|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    const m = content.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      return JSON.parse(m[0]);
    } catch {
      return null;
    }
  }
}

function mergeWithLocal(
  email: EmailInput,
  partial: Partial<AnalyzeResult>,
  provider: "groq" | "gemini"
): AnalyzeResult {
  const local = analyzeLocal(email);
  const type = partial.type ?? local.type;
  return {
    type: ["kp", "perechen", "request", "other"].includes(type as string)
      ? (type as AnalyzeResult["type"])
      : local.type,
    summary: partial.summary?.trim() || local.summary,
    keyPoints:
      Array.isArray(partial.keyPoints) && partial.keyPoints.length
        ? partial.keyPoints.map(String).slice(0, 6)
        : local.keyPoints,
    company: partial.company || local.company,
    deadline: partial.deadline || local.deadline,
    itemsMentioned:
      Array.isArray(partial.itemsMentioned) && partial.itemsMentioned.length
        ? partial.itemsMentioned.map(String).slice(0, 10)
        : local.itemsMentioned,
    confidence:
      typeof partial.confidence === "number"
        ? Math.min(1, Math.max(0, partial.confidence))
        : local.confidence,
    aiProvider: provider,
  };
}

async function analyzeWithGroq(
  email: EmailInput,
  apiKey: string
): Promise<AnalyzeResult> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(email) },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq: ${res.status} ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  const parsed = safeParse(content);
  if (!parsed) throw new Error("Groq: не удалось разобрать ответ");
  return mergeWithLocal(email, parsed, "groq");
}

async function analyzeWithGemini(
  email: EmailInput,
  apiKey: string
): Promise<AnalyzeResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: `${SYSTEM_PROMPT}\n\n${buildUserPrompt(email)}` }],
        },
      ],
      generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini: ${res.status} ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const parsed = safeParse(content);
  if (!parsed) throw new Error("Gemini: не удалось разобрать ответ");
  return mergeWithLocal(email, parsed, "gemini");
}

export type AiProviderChoice = "auto" | "local" | "groq" | "gemini";

export async function analyzeEmail(
  email: EmailInput,
  opts: {
    provider?: AiProviderChoice;
    groqKey?: string;
    geminiKey?: string;
  } = {}
): Promise<AnalyzeResult> {
  const provider = opts.provider ?? "auto";

  if (provider === "local") return analyzeLocal(email);

  if (provider === "groq" || (provider === "auto" && opts.groqKey)) {
    if (!opts.groqKey) throw new Error("Укажите ключ Groq");
    return analyzeWithGroq(email, opts.groqKey);
  }

  if (provider === "gemini" || (provider === "auto" && opts.geminiKey)) {
    if (!opts.geminiKey) throw new Error("Укажите ключ Gemini");
    return analyzeWithGemini(email, opts.geminiKey);
  }

  // auto without keys → free local analyzer
  return analyzeLocal(email);
}
