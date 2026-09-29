import assert from "node:assert/strict";
import test from "node:test";
import { analyzeLocally } from "./analysis.mjs";

test("classifies an urgent RFQ and extracts its deadline", () => {
  const result = analyzeLocally({
    subject: "Срочный запрос КП",
    body: "Просим рассчитать поставку 20 позиций. Ответ ожидаем до 30.09.2026.",
  });

  assert.equal(result.type, "Запрос КП");
  assert.equal(result.priority, "Высокий");
  assert.equal(result.deadline, "30.09.2026");
  assert.match(result.nextAction, /коммерческое предложение/i);
});

test("recognizes tenders as high priority", () => {
  const result = analyzeLocally({
    subject: "Приглашение в тендер",
    body: "Крайний срок подачи заявки — 5 октября.",
  });

  assert.equal(result.type, "Тендер");
  assert.equal(result.priority, "Высокий");
  assert.equal(result.deadline, "5 октября");
});

test("falls back to a general request for neutral messages", () => {
  const result = analyzeLocally({
    subject: "Вопрос по доставке",
    body: "Здравствуйте! Подскажите, работаете ли вы с регионами?",
  });

  assert.equal(result.type, "Общий запрос");
  assert.equal(result.priority, "Обычный");
  assert.equal(result.deadline, null);
  assert.ok(result.summary.length > 10);
});
