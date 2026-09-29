import { NextResponse } from "next/server";
import { analyzeEmail, type AiProviderChoice } from "@/lib/ai";
import { analyzeLocal } from "@/lib/local-ai";
import type { EmailInput } from "@/lib/types";

export async function POST(req: Request) {
  let email: EmailInput | undefined;
  let provider: AiProviderChoice = "auto";
  let groqKey: string | undefined;
  let geminiKey: string | undefined;

  try {
    const body = await req.json();
    email = body.email as EmailInput | undefined;
    provider = (body.provider as AiProviderChoice) || "auto";
    groqKey =
      (body.groqKey as string) || process.env.GROQ_API_KEY || undefined;
    geminiKey =
      (body.geminiKey as string) || process.env.GEMINI_API_KEY || undefined;

    if (!email?.body && !email?.subject) {
      return NextResponse.json(
        { error: "Укажите тему или текст письма" },
        { status: 400 }
      );
    }

    const result = await analyzeEmail(
      {
        from: email.from || "неизвестно",
        subject: email.subject || "(без темы)",
        body: email.body || "",
        receivedAt: email.receivedAt,
      },
      { provider, groqKey, geminiKey }
    );

    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка анализа";
    if (email) {
      const fallback = analyzeLocal({
        from: email.from || "неизвестно",
        subject: email.subject || "(без темы)",
        body: email.body || "",
      });
      return NextResponse.json({ ...fallback, warning: message });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
