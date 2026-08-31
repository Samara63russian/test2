import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'

type ReportDocumentData = {
  institutionName: string
  institutionAddress: string
  reportDate: string
  authorName: string
  status: string
  comment: string
  answers: Array<{
    category: string
    question: string
    value: string
  }>
}

const borders = {
  top: { style: BorderStyle.SINGLE, size: 1, color: 'D9E0EA' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D9E0EA' },
  left: { style: BorderStyle.SINGLE, size: 1, color: 'D9E0EA' },
  right: { style: BorderStyle.SINGLE, size: 1, color: 'D9E0EA' },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'D9E0EA' },
  insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'D9E0EA' },
}

export async function createReportDocument(data: ReportDocumentData) {
  const date = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${data.reportDate}T12:00:00`))

  const tableRows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          shading: { fill: 'EAF0FA' },
          children: [new Paragraph({ children: [new TextRun({ text: 'Вопрос', bold: true })] })],
        }),
        new TableCell({
          shading: { fill: 'EAF0FA' },
          children: [new Paragraph({ children: [new TextRun({ text: 'Ответ', bold: true })] })],
        }),
      ],
    }),
    ...data.answers.flatMap((answer, index, list) => {
      const categoryChanged = index === 0 || answer.category !== list[index - 1].category
      const answerRow = new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(answer.question)] }),
          new TableCell({ children: [new Paragraph(answer.value || '—')] }),
        ],
      })
      if (!categoryChanged) return [answerRow]
      return [
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 2,
              shading: { fill: 'F6F8FB' },
              children: [new Paragraph({ children: [new TextRun({ text: answer.category, bold: true, color: '365E9D' })] })],
            }),
          ],
        }),
        answerRow,
      ]
    }),
  ]

  const document = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Arial', size: 22, color: '27364A' },
          paragraph: { spacing: { after: 120 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 900, right: 900, bottom: 900, left: 900 },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.TITLE,
            spacing: { after: 280 },
            children: [new TextRun({ text: 'СВОДНАЯ СПРАВКА', bold: true, size: 32, color: '244C86' })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 380 },
            children: [new TextRun({ text: `по состоянию на ${date}`, size: 22 })],
          }),
          new Paragraph({ children: [new TextRun({ text: 'Учреждение: ', bold: true }), new TextRun(data.institutionName)] }),
          new Paragraph({ children: [new TextRun({ text: 'Адрес: ', bold: true }), new TextRun(data.institutionAddress || '—')] }),
          new Paragraph({ children: [new TextRun({ text: 'Ответственный: ', bold: true }), new TextRun(data.authorName)] }),
          new Paragraph({
            spacing: { after: 280 },
            children: [
              new TextRun({ text: 'Статус: ', bold: true }),
              new TextRun(data.status === 'submitted' ? 'Отправлена' : 'Черновик'),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnWidths: [6200, 3200],
            borders,
            rows: tableRows,
          }),
          ...(data.comment
            ? [
                new Paragraph({
                  spacing: { before: 320 },
                  children: [new TextRun({ text: 'Комментарий: ', bold: true }), new TextRun(data.comment)],
                }),
              ]
            : []),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 500 },
            children: [new TextRun({ text: `Сформировано: ${new Intl.DateTimeFormat('ru-RU').format(new Date())}`, italics: true, color: '65758B' })],
          }),
        ],
      },
    ],
  })

  return Packer.toBuffer(document)
}
