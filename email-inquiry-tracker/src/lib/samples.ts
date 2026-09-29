import type { EmailInput } from "./types";

export const SAMPLE_EMAILS: Array<EmailInput & { id: string; label: string }> = [
  {
    id: "sample-1",
    label: "Запрос КП — офисная мебель",
    from: "Ирина Соколова <i.sokolova@nordline.ru>",
    subject: "Запрос коммерческого предложения на офисные кресла",
    body: `Добрый день!

ООО «Нордлайн» просит подготовить коммерческое предложение на поставку офисных кресел.

Нужно:
1. Кресло эргономичное «Focus Pro» — 24 шт.
2. Кресло посетителя «Guest Soft» — 12 шт.

Срок поставки — желательно до 15 числа следующего месяца.
Просим указать цены с НДС, условия оплаты и гарантию.

С уважением,
Ирина Соколова
Менеджер по закупкам
ООО «Нордлайн»
+7 (495) 123-45-67`,
    receivedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: "sample-2",
    label: "Запрос прайса — расходники",
    from: "Закупки <procurement@tehprom.spb.ru>",
    subject: "Просим выслать актуальный прайс-лист",
    body: `Здравствуйте!

Просим выслать актуальный перечень / прайс-лист на канцелярские и упаковочные расходные материалы за текущий квартал.

Особенно интересуют:
— скотч упаковочный 48 мм
— стретч-плёнка
— коробки картонные №3–№7

Также нужны минимальные партии и сроки отгрузки со склада.

Спасибо,
Отдел закупок АО «ТехПром»`,
    receivedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: "sample-3",
    label: "Общий запрос — сроки",
    from: "Алексей Морозов <a.morozov@gmail.com>",
    subject: "Подскажите по наличию и срокам",
    body: `Добрый день!

Интересует наличие промышленных пылесосов и сроки поставки в Самару.
Можно ли организовать демонстрацию на объекте?

Условия сотрудничества пока изучаем, КП пока не нужно — сначала хотим понять, подходит ли оборудование.

С уважением,
Алексей Морозов`,
    receivedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: "sample-4",
    label: "Срочный RFQ",
    from: "Marina Chen <marina.chen@buildera.com>",
    subject: "URGENT RFQ — cable trays delivery",
    body: `Hello,

We urgently need a commercial quotation (RFQ) for cable trays and mounting kits.
Quantity: 850 meters of perforated trays 400x100.
Delivery ASAP to warehouse in Moscow region — today confirmation needed.

Please send КП with prices and lead time.

Best regards,
Marina Chen
Buildera Supply`,
    receivedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
];
