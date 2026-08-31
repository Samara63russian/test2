import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'

const databasePath = resolve(process.env.DATABASE_PATH ?? 'server/data/reports.db')
mkdirSync(dirname(databasePath), { recursive: true })

export const db: InstanceType<typeof Database> = new Database(databasePath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS institutions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    address TEXT NOT NULL DEFAULT '',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
    institution_id TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    help_text TEXT NOT NULL DEFAULT '',
    type TEXT NOT NULL CHECK (type IN ('text', 'textarea', 'number', 'select', 'boolean')),
    options TEXT NOT NULL DEFAULT '[]',
    category TEXT NOT NULL,
    required INTEGER NOT NULL DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    client_id TEXT UNIQUE,
    institution_id TEXT NOT NULL,
    report_date TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'submitted')),
    comment TEXT NOT NULL DEFAULT '',
    author_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(id),
    FOREIGN KEY (author_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS answers (
    report_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    value TEXT NOT NULL DEFAULT '',
    PRIMARY KEY (report_id, question_id),
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id)
  );

  CREATE INDEX IF NOT EXISTS reports_date_idx ON reports(report_date);
  CREATE INDEX IF NOT EXISTS reports_institution_idx ON reports(institution_id);
`)

const institutionCount = db.prepare('SELECT COUNT(*) AS count FROM institutions').get() as { count: number }

if (institutionCount.count === 0) {
  const insertInstitution = db.prepare(
    'INSERT INTO institutions (id, name, short_name, address) VALUES (?, ?, ?, ?)',
  )
  insertInstitution.run('inst-center', 'ГБУ «Центр социального обслуживания»', 'ЦСО Центральный', 'г. Самара, ул. Молодогвардейская, 210')
  insertInstitution.run('inst-family', 'ГКУ «Семейный центр поддержки»', 'Семейный центр', 'г. Самара, ул. Ново-Садовая, 15')
  insertInstitution.run('inst-health', 'ГАУ «Центр здоровья и реабилитации»', 'Центр здоровья', 'г. Тольятти, ул. Мира, 48')
}

const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get() as { count: number }

if (userCount.count === 0) {
  const insertUser = db.prepare(`
    INSERT INTO users (id, username, password_hash, full_name, role, institution_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  insertUser.run('user-admin', 'admin', bcrypt.hashSync('admin123', 12), 'Администратор системы', 'admin', null)
  insertUser.run('user-editor', 'specialist', bcrypt.hashSync('demo123', 12), 'Анна Петрова', 'editor', 'inst-center')
  insertUser.run('user-viewer', 'observer', bcrypt.hashSync('demo123', 12), 'Сергей Волков', 'viewer', null)
}

const questionCount = db.prepare('SELECT COUNT(*) AS count FROM questions').get() as { count: number }

if (questionCount.count === 0) {
  const insertQuestion = db.prepare(`
    INSERT INTO questions (id, text, help_text, type, options, category, required, position)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const questions = [
    ['q-people', 'Численность получателей услуг', 'Укажите число людей за отчётную дату', 'number', [], 'Основные показатели', 1],
    ['q-capacity', 'Свободных мест', 'Количество доступных мест на момент заполнения', 'number', [], 'Основные показатели', 1],
    ['q-status', 'Общая оценка ситуации', '', 'select', ['Стабильная', 'Требует внимания', 'Критическая'], 'Основные показатели', 1],
    ['q-staff', 'Учреждение полностью укомплектовано персоналом?', '', 'boolean', [], 'Кадровая ситуация', 1],
    ['q-vacancies', 'Количество открытых вакансий', '', 'number', [], 'Кадровая ситуация', 0],
    ['q-incidents', 'Происшествия за отчётный период', 'Если происшествий не было, укажите «Нет»', 'textarea', [], 'Безопасность', 1],
    ['q-supplies', 'Обеспеченность необходимыми материалами', '', 'select', ['В полном объёме', 'Частично', 'Недостаточно'], 'Обеспечение', 1],
    ['q-needs', 'Какая помощь требуется учреждению?', '', 'textarea', [], 'Обеспечение', 0],
    ['q-note', 'Дополнительная информация', '', 'textarea', [], 'Дополнительно', 0],
  ] as const

  questions.forEach(([id, text, help, type, options, category, required], index) => {
    insertQuestion.run(id, text, help, type, JSON.stringify(options), category, required, index + 1)
  })
}

const reportCount = db.prepare('SELECT COUNT(*) AS count FROM reports').get() as { count: number }

if (reportCount.count === 0 && process.env.SEED_DEMO !== 'false') {
  const dateOffset = (days: number) => {
    const date = new Date()
    date.setDate(date.getDate() - days)
    return date.toISOString().slice(0, 10)
  }
  const insertReport = db.prepare(`
    INSERT INTO reports (id, institution_id, report_date, status, comment, author_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const insertAnswer = db.prepare('INSERT INTO answers (report_id, question_id, value) VALUES (?, ?, ?)')
  const examples = [
    ['demo-1', 'inst-center', 1, 'submitted', 'Ситуация штатная, обращения обработаны.', 'Стабильная', '124', '8', 'true', '2', 'Нет', 'В полном объёме'],
    ['demo-2', 'inst-family', 3, 'submitted', '', 'Требует внимания', '86', '4', 'false', '3', 'Нет', 'Частично'],
    ['demo-3', 'inst-health', 5, 'draft', 'Ожидаются уточнённые кадровые данные.', 'Стабильная', '57', '12', 'true', '1', 'Нет', 'В полном объёме'],
    ['demo-4', 'inst-center', 15, 'submitted', '', 'Стабильная', '119', '10', 'true', '1', 'Нет', 'В полном объёме'],
    ['demo-5', 'inst-family', 31, 'submitted', 'Требуется поставка расходных материалов.', 'Требует внимания', '91', '2', 'false', '4', 'Нет', 'Частично'],
    ['demo-6', 'inst-health', 46, 'submitted', '', 'Стабильная', '62', '9', 'true', '0', 'Нет', 'В полном объёме'],
  ] as const
  const answerIds = ['q-status', 'q-people', 'q-capacity', 'q-staff', 'q-vacancies', 'q-incidents', 'q-supplies']

  const transaction = db.transaction(() => {
    examples.forEach(([id, institutionId, days, status, comment, ...values]) => {
      const timestamp = `${dateOffset(days)}T10:30:00.000Z`
      insertReport.run(id, institutionId, dateOffset(days), status, comment, 'user-admin', timestamp, timestamp)
      answerIds.forEach((questionId, index) => insertAnswer.run(id, questionId, values[index] ?? ''))
    })
  })
  transaction()
}

export function createId(prefix: string) {
  return `${prefix}-${randomUUID()}`
}
