import { NextRequest, NextResponse } from "next/server";
import { analyzeEmail, analyzeLocal } from "@/lib/analyze";
import type { EmailInput } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: EmailInput;
      groqApiKey?: string;
      forceLocal?: boolean;
    };

    if (!body.email?.from || !body.email?.subject || !body.email?.body) {
      return NextResponse.json(
        { error: "Нужны поля from, subject и body" },
        { status: 400 },
      );
    }

    const email: EmailInput = {
      from: String(body.email.from).slice(0, 300),
      subject: String(body.email.subject).slice(0, 500),
      body: String(body.email.body).slice(0, 20000),
      receivedAt: body.email.receivedAt,
    };

    if (body.forceLocal) {
      return NextResponse.json({ analysis: analyzeLocal(email) });
    }

    const analysis = await analyzeEmail(email, body.groqApiKey);
    return NextResponse.json({ analysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка анализа";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
