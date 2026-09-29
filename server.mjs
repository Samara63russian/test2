import "dotenv/config";
import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeMessage } from "./server/analysis.mjs";
import { mailboxConfigured, syncMailbox } from "./server/mailbox.mjs";
import {
  createRequest,
  listRequests,
  updateRequest,
} from "./server/store.mjs";

const app = express();
const port = Number(process.env.PORT || 3000);
const rootDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(rootDir, "dist");

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    mailboxConfigured: mailboxConfigured(),
    aiEngine: process.env.OLLAMA_URL
      ? process.env.OLLAMA_MODEL || "Ollama"
      : "Локальный AI",
  });
});

app.get("/api/requests", async (_request, response, next) => {
  try {
    response.json(await listRequests());
  } catch (error) {
    next(error);
  }
});

app.post("/api/requests", async (request, response, next) => {
  try {
    const { senderName, senderEmail, company, subject, body } = request.body;
    if (!subject?.trim() || !body?.trim()) {
      return response
        .status(400)
        .json({ error: "Укажите тему и текст письма." });
    }

    const input = {
      senderName,
      senderEmail,
      company,
      subject: subject.trim(),
      body: body.trim(),
      source: "manual",
    };
    const analysis = await analyzeMessage(input);
    response.status(201).json(await createRequest(input, analysis));
  } catch (error) {
    next(error);
  }
});

app.patch("/api/requests/:id", async (request, response, next) => {
  try {
    const updated = await updateRequest(request.params.id, request.body);
    if (!updated) {
      return response.status(404).json({ error: "Запрос не найден." });
    }
    response.json(updated);
  } catch (error) {
    next(error);
  }
});

app.post("/api/sync", async (_request, response, next) => {
  try {
    const imported = await syncMailbox();
    response.json({
      imported: imported.length,
      requests: imported,
      message: imported.length
        ? `Новых писем: ${imported.length}`
        : "Новых писем нет",
    });
  } catch (error) {
    if (error.code === "MAILBOX_NOT_CONFIGURED") {
      return response.status(400).json({ error: error.message });
    }
    next(error);
  }
});

if (existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((request, response, next) => {
    if (request.path.startsWith("/api/")) return next();
    response.sendFile(path.join(distDir, "index.html"));
  });
}

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({
    error: "Не удалось выполнить операцию. Попробуйте ещё раз.",
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`КП Радар запущен на http://localhost:${port}`);
});
