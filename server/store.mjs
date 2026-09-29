import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataFile =
  process.env.DATA_FILE || path.join(rootDir, "data", "requests.local.json");

const minutesAgo = (minutes) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

const seedRequests = () => [
  {
    id: "req-1001",
    senderName: "Анна Смирнова",
    senderEmail: "a.smirnova@severstal.ru",
    company: "Северсталь",
    subject: "Запрос КП на поставку крепежа",
    body: "Добрый день! Просим подготовить коммерческое предложение на поставку крепежа по приложенному перечню из 42 позиций. В предложении укажите сроки поставки и условия оплаты. Ответ ожидаем до 30 сентября.",
    summary:
      "Нужно рассчитать 42 позиции крепежа, указать сроки поставки и условия оплаты.",
    type: "Запрос КП",
    priority: "Высокий",
    status: "Новый",
    receivedAt: minutesAgo(8),
    deadline: "30 сентября",
    amount: null,
    confidence: 96,
    engine: "Локальный AI",
    unread: true,
    attachments: ["Перечень_крепежа.xlsx"],
    nextAction: "Подготовить коммерческое предложение до 30 сентября",
    assignee: "Не назначен",
    source: "email",
  },
  {
    id: "req-1002",
    senderName: "Михаил Орлов",
    senderEmail: "orlov@volgastroi.ru",
    company: "ВолгаСтрой",
    subject: "Стоимость металлопроката",
    body: "Коллеги, добрый день. Пришлите, пожалуйста, актуальный прайс на листовой прокат и сообщите о наличии на складе. Интересует отгрузка в Самару.",
    summary:
      "Клиент запрашивает прайс и наличие листового проката с отгрузкой в Самару.",
    type: "Запрос цен",
    priority: "Средний",
    status: "В работе",
    receivedAt: minutesAgo(34),
    deadline: null,
    amount: null,
    confidence: 92,
    engine: "Локальный AI",
    unread: false,
    attachments: [],
    nextAction: "Проверить остатки и отправить актуальные цены",
    assignee: "Алексей",
    source: "email",
  },
  {
    id: "req-1003",
    senderName: "Елена Зотова",
    senderEmail: "tender@agroline.group",
    company: "Агролайн",
    subject: "Тендер №871 — складское оборудование",
    body: "Приглашаем вашу компанию принять участие в закрытом тендере на поставку складского оборудования. Крайний срок подачи заявки — 02.10.2026. Техническое задание во вложении.",
    summary:
      "Приглашение в тендер на складское оборудование; заявка нужна до 02.10.2026.",
    type: "Тендер",
    priority: "Высокий",
    status: "Новый",
    receivedAt: minutesAgo(62),
    deadline: "02.10.2026",
    amount: null,
    confidence: 98,
    engine: "Локальный AI",
    unread: true,
    attachments: ["ТЗ_тендер_871.pdf", "Форма_заявки.docx"],
    nextAction: "Проверить требования и назначить ответственного за тендер",
    assignee: "Не назначен",
    source: "email",
  },
  {
    id: "req-1004",
    senderName: "Игорь Соколов",
    senderEmail: "sokolov@promtech.pro",
    company: "Промтех",
    subject: "Повторный запрос по счёту",
    body: "Здравствуйте! Подскажите, пожалуйста, когда будет готов счёт по заявке 2419? Хотели бы оплатить сегодня до конца рабочего дня.",
    summary:
      "Клиент повторно запрашивает счёт по заявке 2419 и готов оплатить сегодня.",
    type: "Документы",
    priority: "Высокий",
    status: "Просрочен",
    receivedAt: minutesAgo(135),
    deadline: "Сегодня",
    amount: "486 000 руб.",
    confidence: 91,
    engine: "Локальный AI",
    unread: true,
    attachments: [],
    nextAction: "Проверить заявку 2419 и срочно отправить счёт",
    assignee: "Мария",
    source: "email",
  },
  {
    id: "req-1005",
    senderName: "Ольга Белова",
    senderEmail: "o.belova@medsnab.ru",
    company: "МедСнаб",
    subject: "Запрос сертификатов",
    body: "Добрый день. Для согласования закупки просим прислать действующие сертификаты соответствия на позиции из последнего предложения.",
    summary:
      "Для согласования закупки нужны действующие сертификаты соответствия.",
    type: "Документы",
    priority: "Обычный",
    status: "В работе",
    receivedAt: minutesAgo(205),
    deadline: null,
    amount: null,
    confidence: 89,
    engine: "Локальный AI",
    unread: false,
    attachments: [],
    nextAction: "Собрать сертификаты по позициям последнего предложения",
    assignee: "Алексей",
    source: "email",
  },
  {
    id: "req-1006",
    senderName: "Роман Климов",
    senderEmail: "r.klimov@vector-logistic.ru",
    company: "Вектор",
    subject: "Доставка партии в Казань",
    body: "Коллеги, сможете организовать доставку партии 12 тонн в Казань? Нужен ориентировочный расчёт стоимости и сроков.",
    summary:
      "Нужен ориентировочный расчёт доставки партии 12 тонн в Казань.",
    type: "Запрос КП",
    priority: "Средний",
    status: "Обработан",
    receivedAt: minutesAgo(24 * 60 + 18),
    deadline: null,
    amount: null,
    confidence: 88,
    engine: "Локальный AI",
    unread: false,
    attachments: [],
    nextAction: "Рассчитать логистику и отправить предложение",
    assignee: "Мария",
    source: "email",
  },
];

async function ensureStore() {
  await mkdir(path.dirname(dataFile), { recursive: true });
  try {
    await readFile(dataFile, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await writeFile(dataFile, JSON.stringify(seedRequests(), null, 2));
  }
}

async function readRequests() {
  await ensureStore();
  return JSON.parse(await readFile(dataFile, "utf8"));
}

async function writeRequests(requests) {
  const tempFile = `${dataFile}.tmp`;
  await writeFile(tempFile, JSON.stringify(requests, null, 2));
  await rename(tempFile, dataFile);
}

export async function listRequests() {
  const requests = await readRequests();
  return requests.sort(
    (a, b) => new Date(b.receivedAt) - new Date(a.receivedAt),
  );
}

export async function hasMessageId(messageId) {
  if (!messageId) return false;
  const requests = await readRequests();
  return requests.some((request) => request.messageId === messageId);
}

function companyFromEmail(email = "") {
  const domain = email.split("@")[1]?.split(".")[0] || "Новая компания";
  return domain.charAt(0).toUpperCase() + domain.slice(1);
}

export async function createRequest(input, analysis) {
  const requests = await readRequests();
  const request = {
    id: randomUUID(),
    senderName: input.senderName || input.senderEmail?.split("@")[0] || "Без имени",
    senderEmail: input.senderEmail || "",
    company: input.company || companyFromEmail(input.senderEmail),
    subject: input.subject || "Без темы",
    body: input.body || "",
    summary: analysis.summary,
    type: analysis.type,
    priority: analysis.priority,
    status: "Новый",
    receivedAt: input.receivedAt || new Date().toISOString(),
    deadline: analysis.deadline,
    amount: analysis.amount,
    confidence: analysis.confidence,
    engine: analysis.engine,
    unread: true,
    attachments: input.attachments || [],
    nextAction: analysis.nextAction,
    assignee: "Не назначен",
    source: input.source || "manual",
    messageId: input.messageId || null,
  };
  requests.unshift(request);
  await writeRequests(requests);
  return request;
}

export async function updateRequest(id, changes) {
  const requests = await readRequests();
  const index = requests.findIndex((request) => request.id === id);
  if (index === -1) return null;

  const allowed = ["status", "unread", "assignee", "priority"];
  const safeChanges = Object.fromEntries(
    Object.entries(changes).filter(([key]) => allowed.includes(key)),
  );
  requests[index] = { ...requests[index], ...safeChanges };
  await writeRequests(requests);
  return requests[index];
}

export async function resetStoreForTests(fileRequests = []) {
  await mkdir(path.dirname(dataFile), { recursive: true });
  await writeFile(dataFile, JSON.stringify(fileRequests, null, 2));
}
