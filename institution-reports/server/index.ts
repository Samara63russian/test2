import express, { type NextFunction, type Request, type Response } from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { z } from 'zod'
import { createId, db } from './database.js'
import { createReportDocument } from './export.js'

const app = express()
const port = Number(process.env.PORT ?? 3001)
const jwtSecret = process.env.JWT_SECRET ?? 'local-development-secret-change-in-production'

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true }))
app.use(express.json({ limit: '1mb' }))

type AuthUser = {
  id: string
  username: string
  fullName: string
  role: 'admin' | 'editor' | 'viewer'
  institutionId: string | null
}

type AuthRequest = Request & { user?: AuthUser }

const asyncRoute =
  (handler: (req: AuthRequest, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    void handler(req as AuthRequest, res, next).catch(next)
  }

function toUser(row: Record<string, unknown>): AuthUser {
  return {
    id: String(row.id),
    username: String(row.username),
    fullName: String(row.full_name),
    role: row.role as AuthUser['role'],
    institutionId: row.institution_id ? String(row.institution_id) : null,
  }
}

function toInstitution(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    name: String(row.name),
    shortName: String(row.short_name),
    address: String(row.address),
    active: Boolean(row.active),
  }
}

function toQuestion(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    text: String(row.text),
    helpText: String(row.help_text),
    type: String(row.type),
    options: JSON.parse(String(row.options)) as string[],
    category: String(row.category),
    required: Boolean(row.required),
    position: Number(row.position),
    active: Boolean(row.active),
  }
}

function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) {
    res.status(401).json({ message: 'Требуется авторизация' })
    return
  }
  try {
    req.user = jwt.verify(token, jwtSecret) as AuthUser
    next()
  } catch {
    res.status(401).json({ message: 'Сеанс истёк. Войдите снова' })
  }
}

function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Доступно только администратору' })
    return
  }
  next()
}

function canAccessInstitution(user: AuthUser, institutionId: string) {
  return user.role === 'admin' || user.role === 'viewer' || user.institutionId === institutionId
}

const reportSchema = z.object({
  clientId: z.string().min(1).optional(),
  institutionId: z.string().min(1),
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['draft', 'submitted']),
  comment: z.string().max(5000).default(''),
  answers: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
})

const institutionSchema = z.object({
  name: z.string().trim().min(3).max(250),
  shortName: z.string().trim().min(2).max(100),
  address: z.string().trim().max(300).default(''),
  active: z.boolean().default(true),
})

const questionSchema = z.object({
  text: z.string().trim().min(3).max(500),
  helpText: z.string().trim().max(500).default(''),
  type: z.enum(['text', 'textarea', 'number', 'select', 'boolean']),
  options: z.array(z.string().trim().min(1)).default([]),
  category: z.string().trim().min(2).max(100),
  required: z.boolean().default(false),
  position: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
})

const userSchema = z.object({
  username: z.string().trim().min(3).max(50).regex(/^[a-zA-Z0-9._-]+$/),
  password: z.string().min(6).max(100).optional(),
  fullName: z.string().trim().min(3).max(150),
  role: z.enum(['admin', 'editor', 'viewer']),
  institutionId: z.string().nullable().default(null),
  active: z.boolean().default(true),
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

app.post('/api/auth/login', (req, res) => {
  const parsed = z.object({ username: z.string(), password: z.string() }).safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Укажите логин и пароль' })
    return
  }
  const row = db.prepare('SELECT * FROM users WHERE username = ? AND active = 1').get(parsed.data.username) as
    | Record<string, unknown>
    | undefined
  if (!row || !bcrypt.compareSync(parsed.data.password, String(row.password_hash))) {
    res.status(401).json({ message: 'Неверный логин или пароль' })
    return
  }
  const user = toUser(row)
  const token = jwt.sign(user, jwtSecret, { expiresIn: '12h' })
  res.json({ token, user })
})

app.use('/api', authenticate)

app.get('/api/bootstrap', (req: AuthRequest, res) => {
  const institutions = (db.prepare('SELECT * FROM institutions ORDER BY active DESC, name').all() as Record<string, unknown>[]).map(toInstitution)
  const questions = (db.prepare('SELECT * FROM questions ORDER BY position, created_at').all() as Record<string, unknown>[]).map(toQuestion)
  const users =
    req.user?.role === 'admin'
      ? (db.prepare('SELECT * FROM users ORDER BY active DESC, full_name').all() as Record<string, unknown>[]).map((row) => ({
          ...toUser(row),
          active: Boolean(row.active),
        }))
      : []
  res.json({ institutions, questions, users })
})

app.get('/api/reports', (req: AuthRequest, res) => {
  const user = req.user!
  const filters: string[] = []
  const values: unknown[] = []

  if (user.role === 'editor') {
    filters.push('r.institution_id = ?')
    values.push(user.institutionId)
  }
  if (typeof req.query.institutionId === 'string' && req.query.institutionId) {
    filters.push('r.institution_id = ?')
    values.push(req.query.institutionId)
  }
  if (typeof req.query.from === 'string' && req.query.from) {
    filters.push('r.report_date >= ?')
    values.push(req.query.from)
  }
  if (typeof req.query.to === 'string' && req.query.to) {
    filters.push('r.report_date <= ?')
    values.push(req.query.to)
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''
  const rows = db
    .prepare(`
      SELECT r.*, i.name AS institution_name, i.short_name AS institution_short_name,
        u.full_name AS author_name,
        COUNT(a.question_id) AS answer_count,
        (SELECT COUNT(*) FROM questions q WHERE q.active = 1) AS question_count
      FROM reports r
      JOIN institutions i ON i.id = r.institution_id
      JOIN users u ON u.id = r.author_id
      LEFT JOIN answers a ON a.report_id = r.id AND a.value != ''
      ${where}
      GROUP BY r.id
      ORDER BY r.report_date DESC, r.updated_at DESC
    `)
    .all(...values) as Record<string, unknown>[]

  res.json(
    rows.map((row) => ({
      id: String(row.id),
      clientId: row.client_id ? String(row.client_id) : null,
      institutionId: String(row.institution_id),
      institutionName: String(row.institution_name),
      institutionShortName: String(row.institution_short_name),
      reportDate: String(row.report_date),
      status: String(row.status),
      comment: String(row.comment),
      authorName: String(row.author_name),
      answerCount: Number(row.answer_count),
      questionCount: Number(row.question_count),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    })),
  )
})

app.get('/api/reports/:id', (req: AuthRequest, res) => {
  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined
  if (!report) {
    res.status(404).json({ message: 'Справка не найдена' })
    return
  }
  if (!canAccessInstitution(req.user!, String(report.institution_id))) {
    res.status(403).json({ message: 'Нет доступа к этой справке' })
    return
  }
  const answers = db.prepare('SELECT question_id, value FROM answers WHERE report_id = ?').all(req.params.id) as Array<{
    question_id: string
    value: string
  }>
  res.json({
    id: String(report.id),
    clientId: report.client_id ? String(report.client_id) : null,
    institutionId: String(report.institution_id),
    reportDate: String(report.report_date),
    status: String(report.status),
    comment: String(report.comment),
    answers: Object.fromEntries(answers.map((answer) => [answer.question_id, answer.value])),
  })
})

function saveReport(input: z.infer<typeof reportSchema>, user: AuthUser, existingId?: string) {
  if (user.role === 'viewer') throw new Error('READ_ONLY')
  if (!canAccessInstitution(user, input.institutionId)) throw new Error('FORBIDDEN')

  const existing = existingId
    ? (db.prepare('SELECT * FROM reports WHERE id = ?').get(existingId) as Record<string, unknown> | undefined)
    : input.clientId
      ? (db.prepare('SELECT * FROM reports WHERE client_id = ?').get(input.clientId) as Record<string, unknown> | undefined)
      : undefined

  if (existing && !canAccessInstitution(user, String(existing.institution_id))) throw new Error('FORBIDDEN')

  const requiredQuestions = db.prepare('SELECT id FROM questions WHERE active = 1 AND required = 1').all() as Array<{ id: string }>
  if (input.status === 'submitted') {
    const missing = requiredQuestions.filter(({ id }) => {
      const value = input.answers[id]
      return value === undefined || value === null || String(value).trim() === ''
    })
    if (missing.length) throw new Error('INCOMPLETE')
  }

  const id = existing ? String(existing.id) : createId('report')
  const transaction = db.transaction(() => {
    if (existing) {
      db.prepare(`
        UPDATE reports
        SET institution_id = ?, report_date = ?, status = ?, comment = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(input.institutionId, input.reportDate, input.status, input.comment, id)
      db.prepare('DELETE FROM answers WHERE report_id = ?').run(id)
    } else {
      db.prepare(`
        INSERT INTO reports (id, client_id, institution_id, report_date, status, comment, author_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, input.clientId ?? null, input.institutionId, input.reportDate, input.status, input.comment, user.id)
    }
    const insertAnswer = db.prepare('INSERT INTO answers (report_id, question_id, value) VALUES (?, ?, ?)')
    for (const [questionId, value] of Object.entries(input.answers)) {
      insertAnswer.run(id, questionId, value === null ? '' : String(value))
    }
  })
  transaction()
  return id
}

app.post('/api/reports', (req: AuthRequest, res) => {
  const parsed = reportSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Проверьте заполнение формы', details: parsed.error.flatten() })
    return
  }
  try {
    const id = saveReport(parsed.data, req.user!)
    res.status(201).json({ id })
  } catch (error) {
    const code = error instanceof Error ? error.message : ''
    const messages: Record<string, [number, string]> = {
      READ_ONLY: [403, 'У пользователя нет прав на заполнение'],
      FORBIDDEN: [403, 'Нет доступа к выбранному учреждению'],
      INCOMPLETE: [400, 'Заполните все обязательные вопросы'],
    }
    const [status, message] = messages[code] ?? [500, 'Не удалось сохранить справку']
    res.status(status).json({ message })
  }
})

app.put('/api/reports/:id', (req: AuthRequest, res) => {
  const parsed = reportSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Проверьте заполнение формы', details: parsed.error.flatten() })
    return
  }
  try {
    const id = saveReport(parsed.data, req.user!, req.params.id)
    res.json({ id })
  } catch (error) {
    const code = error instanceof Error ? error.message : ''
    const status = code === 'INCOMPLETE' ? 400 : 403
    res.status(status).json({ message: code === 'INCOMPLETE' ? 'Заполните все обязательные вопросы' : 'Нет прав на изменение' })
  }
})

app.post('/api/sync', (req: AuthRequest, res) => {
  const parsed = z.object({ reports: z.array(reportSchema).max(100) }).safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Некорректные данные синхронизации' })
    return
  }
  const results = parsed.data.reports.map((report) => {
    try {
      return { clientId: report.clientId, id: saveReport(report, req.user!), success: true }
    } catch (error) {
      return {
        clientId: report.clientId,
        success: false,
        message: error instanceof Error && error.message === 'INCOMPLETE' ? 'Не заполнены обязательные поля' : 'Ошибка синхронизации',
      }
    }
  })
  res.json({ results })
})

app.get(
  '/api/reports/:id/export',
  asyncRoute(async (req, res) => {
    const report = db
      .prepare(`
        SELECT r.*, i.name AS institution_name, i.address AS institution_address, u.full_name AS author_name
        FROM reports r
        JOIN institutions i ON i.id = r.institution_id
        JOIN users u ON u.id = r.author_id
        WHERE r.id = ?
      `)
      .get(req.params.id) as Record<string, unknown> | undefined
    if (!report) {
      res.status(404).json({ message: 'Справка не найдена' })
      return
    }
    if (!canAccessInstitution(req.user!, String(report.institution_id))) {
      res.status(403).json({ message: 'Нет доступа к этой справке' })
      return
    }
    const answers = db
      .prepare(`
        SELECT q.category, q.text AS question, a.value
        FROM questions q
        LEFT JOIN answers a ON a.question_id = q.id AND a.report_id = ?
        WHERE q.active = 1
        ORDER BY q.position
      `)
      .all(req.params.id) as Array<{ category: string; question: string; value: string | null }>
    const document = await createReportDocument({
      institutionName: String(report.institution_name),
      institutionAddress: String(report.institution_address),
      reportDate: String(report.report_date),
      authorName: String(report.author_name),
      status: String(report.status),
      comment: String(report.comment),
      answers: answers.map((answer) => ({ ...answer, value: answer.value ?? '' })),
    })
    const safeDate = String(report.report_date)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    res.setHeader('Content-Disposition', `attachment; filename="report-${safeDate}.docx"`)
    res.send(document)
  }),
)

app.get('/api/analytics', (req: AuthRequest, res) => {
  const where = req.user?.role === 'editor' ? 'WHERE r.institution_id = ?' : ''
  const values = req.user?.role === 'editor' ? [req.user.institutionId] : []
  const byInstitution = db
    .prepare(`
      SELECT i.short_name AS name, COUNT(r.id) AS reports,
        SUM(CASE WHEN r.status = 'submitted' THEN 1 ELSE 0 END) AS submitted
      FROM institutions i
      LEFT JOIN reports r ON r.institution_id = i.id
      ${where}
      GROUP BY i.id
      HAVING reports > 0
      ORDER BY reports DESC
    `)
    .all(...values)
  const byMonth = db
    .prepare(`
      SELECT substr(r.report_date, 1, 7) AS month, COUNT(*) AS reports
      FROM reports r
      ${where}
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `)
    .all(...values)
  const statusAnswers = db
    .prepare(`
      SELECT a.value AS name, COUNT(*) AS value
      FROM answers a
      JOIN reports r ON r.id = a.report_id
      WHERE a.question_id = 'q-status' ${req.user?.role === 'editor' ? 'AND r.institution_id = ?' : ''}
      GROUP BY a.value
    `)
    .all(...values)
  res.json({ byInstitution, byMonth: byMonth.reverse(), statusAnswers })
})

app.post('/api/institutions', adminOnly, (req, res) => {
  const parsed = institutionSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Проверьте данные учреждения' })
    return
  }
  const id = createId('inst')
  const item = parsed.data
  db.prepare('INSERT INTO institutions (id, name, short_name, address, active) VALUES (?, ?, ?, ?, ?)').run(
    id,
    item.name,
    item.shortName,
    item.address,
    Number(item.active),
  )
  res.status(201).json({ id })
})

app.put('/api/institutions/:id', adminOnly, (req, res) => {
  const parsed = institutionSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Проверьте данные учреждения' })
    return
  }
  const item = parsed.data
  db.prepare('UPDATE institutions SET name = ?, short_name = ?, address = ?, active = ? WHERE id = ?').run(
    item.name,
    item.shortName,
    item.address,
    Number(item.active),
    req.params.id,
  )
  res.json({ id: req.params.id })
})

app.delete('/api/institutions/:id', adminOnly, (req, res) => {
  db.prepare('UPDATE institutions SET active = 0 WHERE id = ?').run(req.params.id)
  res.status(204).end()
})

app.post('/api/questions', adminOnly, (req, res) => {
  const parsed = questionSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Проверьте данные вопроса' })
    return
  }
  const id = createId('q')
  const item = parsed.data
  db.prepare(`
    INSERT INTO questions (id, text, help_text, type, options, category, required, position, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, item.text, item.helpText, item.type, JSON.stringify(item.options), item.category, Number(item.required), item.position, Number(item.active))
  res.status(201).json({ id })
})

app.put('/api/questions/:id', adminOnly, (req, res) => {
  const parsed = questionSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Проверьте данные вопроса' })
    return
  }
  const item = parsed.data
  db.prepare(`
    UPDATE questions
    SET text = ?, help_text = ?, type = ?, options = ?, category = ?, required = ?, position = ?, active = ?
    WHERE id = ?
  `).run(item.text, item.helpText, item.type, JSON.stringify(item.options), item.category, Number(item.required), item.position, Number(item.active), req.params.id)
  res.json({ id: req.params.id })
})

app.delete('/api/questions/:id', adminOnly, (req, res) => {
  db.prepare('UPDATE questions SET active = 0 WHERE id = ?').run(req.params.id)
  res.status(204).end()
})

app.post('/api/users', adminOnly, (req, res) => {
  const parsed = userSchema.extend({ password: z.string().min(6).max(100) }).safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Проверьте данные пользователя' })
    return
  }
  const id = createId('user')
  const item = parsed.data
  try {
    db.prepare(`
      INSERT INTO users (id, username, password_hash, full_name, role, institution_id, active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, item.username, bcrypt.hashSync(item.password, 12), item.fullName, item.role, item.institutionId, Number(item.active))
    res.status(201).json({ id })
  } catch {
    res.status(409).json({ message: 'Пользователь с таким логином уже существует' })
  }
})

app.put('/api/users/:id', adminOnly, (req, res) => {
  const parsed = userSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Проверьте данные пользователя' })
    return
  }
  const item = parsed.data
  try {
    if (item.password) {
      db.prepare(`
        UPDATE users SET username = ?, password_hash = ?, full_name = ?, role = ?, institution_id = ?, active = ?
        WHERE id = ?
      `).run(item.username, bcrypt.hashSync(item.password, 12), item.fullName, item.role, item.institutionId, Number(item.active), req.params.id)
    } else {
      db.prepare(`
        UPDATE users SET username = ?, full_name = ?, role = ?, institution_id = ?, active = ?
        WHERE id = ?
      `).run(item.username, item.fullName, item.role, item.institutionId, Number(item.active), req.params.id)
    }
    res.json({ id: req.params.id })
  } catch {
    res.status(409).json({ message: 'Пользователь с таким логином уже существует' })
  }
})

app.delete('/api/users/:id', adminOnly, (req: AuthRequest, res) => {
  if (req.params.id === req.user?.id) {
    res.status(400).json({ message: 'Нельзя отключить собственную учётную запись' })
    return
  }
  db.prepare('UPDATE users SET active = 0 WHERE id = ?').run(req.params.id)
  res.status(204).end()
})

const distPath = resolve('dist')
if (existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('*path', (_req, res) => res.sendFile(resolve(distPath, 'index.html')))
}

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error)
  res.status(500).json({ message: 'Внутренняя ошибка сервера' })
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Forma Svodki API listening on http://0.0.0.0:${port}`)
})
