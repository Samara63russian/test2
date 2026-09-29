import express from 'express';
import db, { logActivity, getSetting } from '../db.js';
import { analyzeIncomingEmail } from '../ai/llmService.js';
import { SAMPLE_EMAILS, generateRandomEmail } from '../services/sampleData.js';
import { broadcastSseEvent } from '../index.js';

const router = express.Router();

/**
 * Generate unique ID for request record
 */
export function generateRequestId() {
  const dateStr = new Date().toISOString().replace(/\D/g, '').slice(2, 8);
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `REQ-${dateStr}-${rand}`;
}

/**
 * Helper to insert a request into SQLite and log activity
 */
export function createRequestRecord(data) {
  const id = data.id || generateRequestId();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO requests (
      id, source, subject, sender_name, sender_email, sender_phone,
      sender_company, sender_inn, recipient, received_at,
      category, urgency, status, ai_summary, ai_action_items,
      ai_confidence, ai_provider, raw_body_text, raw_body_html,
      attachments, items, estimated_budget, currency, assigned_to,
      tags, notes, quote_data, draft_reply, deadline_at,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?
    )
  `);

  stmt.run(
    id,
    data.source || 'manual_entry',
    data.subject || '(Без темы)',
    data.sender_name || '',
    data.sender_email || '',
    data.sender_phone || '',
    data.sender_company || '',
    data.sender_inn || '',
    data.recipient || '',
    data.received_at || now,
    data.category || 'RFQ',
    data.urgency || 'MEDIUM',
    data.status || 'NEW',
    data.ai_summary || '',
    JSON.stringify(data.ai_action_items || []),
    data.ai_confidence || 0.9,
    data.ai_provider || 'builtin_nlp',
    data.raw_body_text || '',
    data.raw_body_html || '',
    JSON.stringify(data.attachments || []),
    JSON.stringify(data.items || []),
    Number(data.estimated_budget) || 0,
    data.currency || 'RUB',
    data.assigned_to || 'Не назначен',
    JSON.stringify(data.tags || []),
    data.notes || '',
    data.quote_data ? JSON.stringify(data.quote_data) : null,
    data.draft_reply || '',
    data.deadline_at || null,
    now,
    now
  );

  logActivity(id, 'created', `Запись создана из источника: ${data.source || 'вручную'}`);
  if (data.ai_summary) {
    logActivity(id, 'ai_analyzed', `ИИ сформировал резюме (Категория: ${data.category}, Срочность: ${data.urgency})`);
  }

  return getRequestById(id);
}

export function getRequestById(id) {
  const row = db.prepare('SELECT * FROM requests WHERE id = ?').get(id);
  if (!row) return null;

  return {
    ...row,
    ai_action_items: JSON.parse(row.ai_action_items || '[]'),
    attachments: JSON.parse(row.attachments || '[]'),
    items: JSON.parse(row.items || '[]'),
    tags: JSON.parse(row.tags || '[]'),
    quote_data: row.quote_data ? JSON.parse(row.quote_data) : null
  };
}

/**
 * GET /api/requests - List requests with advanced filtering & search
 */
router.get('/', (req, res) => {
  try {
    const {
      status,
      category,
      urgency,
      search,
      assigned_to,
      sortBy = 'received_at',
      sortOrder = 'DESC',
      limit = 100,
      offset = 0
    } = req.query;

    let query = 'SELECT * FROM requests WHERE 1=1';
    const params = [];

    if (status && status !== 'ALL') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (category && category !== 'ALL') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (urgency && urgency !== 'ALL') {
      query += ' AND urgency = ?';
      params.push(urgency);
    }

    if (assigned_to && assigned_to !== 'ALL') {
      query += ' AND assigned_to = ?';
      params.push(assigned_to);
    }

    if (search) {
      query += ' AND (subject LIKE ? OR sender_name LIKE ? OR sender_company LIKE ? OR sender_email LIKE ? OR ai_summary LIKE ? OR raw_body_text LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s, s, s);
    }

    // Allowed sort columns
    const allowedSortCols = ['received_at', 'created_at', 'urgency', 'status', 'category', 'estimated_budget', 'subject'];
    const validSortCol = allowedSortCols.includes(sortBy) ? sortBy : 'received_at';
    const validSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${validSortCol} ${validSortOrder} LIMIT ? OFFSET ?`;
    params.push(Number(limit) || 100, Number(offset) || 0);

    const rows = db.prepare(query).all(...params);

    const parsed = rows.map(row => ({
      ...row,
      ai_action_items: JSON.parse(row.ai_action_items || '[]'),
      attachments: JSON.parse(row.attachments || '[]'),
      items: JSON.parse(row.items || '[]'),
      tags: JSON.parse(row.tags || '[]'),
      quote_data: row.quote_data ? JSON.parse(row.quote_data) : null
    }));

    // Total count for pagination
    const totalQuery = query.replace(/SELECT \* FROM/, 'SELECT COUNT(*) as count FROM').split(' ORDER BY')[0];
    const totalParams = params.slice(0, -2);
    const totalResult = db.prepare(totalQuery).get(...totalParams);

    res.json({
      success: true,
      total: totalResult ? totalResult.count : parsed.length,
      data: parsed
    });
  } catch (err) {
    console.error('Error fetching requests:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/requests/stats - Quick stats counters
 */
router.get('/stats', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM requests').get().count;
    const byStatus = db.prepare('SELECT status, COUNT(*) as count FROM requests GROUP BY status').all();
    const byCategory = db.prepare('SELECT category, COUNT(*) as count FROM requests GROUP BY category').all();
    const byUrgency = db.prepare('SELECT urgency, COUNT(*) as count FROM requests GROUP BY urgency').all();

    const statusCounts = {
      NEW: 0,
      IN_PROGRESS: 0,
      QUOTE_PREPARED: 0,
      SENT: 0,
      WON: 0,
      LOST: 0,
      REJECTED: 0
    };
    byStatus.forEach(r => { statusCounts[r.status] = r.count; });

    const categoryCounts = {
      RFQ: 0,
      SPEC_LIST: 0,
      GENERAL_INQUIRY: 0,
      ORDER: 0,
      SPAM_OTHER: 0
    };
    byCategory.forEach(r => { categoryCounts[r.category] = r.count; });

    const urgencyCounts = {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0
    };
    byUrgency.forEach(r => { urgencyCounts[r.urgency] = r.count; });

    res.json({
      success: true,
      total,
      statusCounts,
      categoryCounts,
      urgencyCounts
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/requests/:id - Single request + logs
 */
router.get('/:id', (req, res) => {
  try {
    const item = getRequestById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Запись не найдена' });
    }

    const logs = db.prepare('SELECT * FROM activity_logs WHERE request_id = ? ORDER BY created_at DESC').all(req.params.id);

    res.json({
      success: true,
      data: item,
      logs
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/requests - Create manual or automated request
 */
router.post('/', async (req, res) => {
  try {
    const {
      subject,
      body,
      sender_name,
      sender_company,
      sender_email,
      sender_phone,
      sender_inn,
      received_at,
      run_ai = true
    } = req.body;

    let aiResult = null;
    if (run_ai) {
      aiResult = await analyzeIncomingEmail({
        subject,
        body,
        from: sender_email ? `${sender_name || ''} <${sender_email}>` : sender_name,
        sender_name,
        sender_company,
        sender_phone,
        sender_email,
        sender_inn
      });
    }

    const record = createRequestRecord({
      source: 'manual_entry',
      subject: subject || '(Без темы)',
      sender_name: (aiResult && aiResult.contacts.contactPerson) || sender_name || '',
      sender_company: (aiResult && aiResult.contacts.company) || sender_company || '',
      sender_email: (aiResult && aiResult.contacts.email) || sender_email || '',
      sender_phone: (aiResult && aiResult.contacts.phone) || sender_phone || '',
      sender_inn: (aiResult && aiResult.contacts.inn) || sender_inn || '',
      received_at: received_at || new Date().toISOString(),
      category: aiResult ? aiResult.category : (req.body.category || 'RFQ'),
      urgency: aiResult ? aiResult.urgency : (req.body.urgency || 'MEDIUM'),
      status: 'NEW',
      ai_summary: aiResult ? aiResult.summary : '',
      ai_action_items: aiResult ? aiResult.actionItems : [],
      ai_confidence: aiResult ? aiResult.confidence : 1.0,
      ai_provider: aiResult ? aiResult.provider : 'manual',
      raw_body_text: body || '',
      raw_body_html: '',
      items: aiResult ? aiResult.items : (req.body.items || []),
      estimated_budget: aiResult ? aiResult.estimatedBudget : (req.body.estimated_budget || 0),
      draft_reply: aiResult ? aiResult.draftReply : '',
      deadline_at: (aiResult && aiResult.deadlineDate) || req.body.deadline_at || null
    });

    broadcastSseEvent('request_created', record);
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    console.error('Error creating request:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/requests/:id - Update fields
 */
router.put('/:id', (req, res) => {
  try {
    const existing = getRequestById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Запись не найдена' });
    }

    const updates = req.body;
    const now = new Date().toISOString();

    const allowedFields = [
      'subject', 'sender_name', 'sender_email', 'sender_phone', 'sender_company',
      'sender_inn', 'recipient', 'category', 'urgency', 'status', 'assigned_to',
      'notes', 'estimated_budget', 'currency', 'deadline_at', 'draft_reply', 'ai_summary'
    ];

    const jsonFields = ['ai_action_items', 'attachments', 'items', 'tags', 'quote_data'];

    let setClauses = ['updated_at = ?'];
    let values = [now];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        setClauses.push(`${field} = ?`);
        values.push(updates[field]);
      }
    }

    for (const field of jsonFields) {
      if (updates[field] !== undefined) {
        setClauses.push(`${field} = ?`);
        values.push(updates[field] ? JSON.stringify(updates[field]) : null);
      }
    }

    values.push(req.params.id);

    const stmt = db.prepare(`UPDATE requests SET ${setClauses.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    // Track status change log
    if (updates.status && updates.status !== existing.status) {
      logActivity(req.params.id, 'status_changed', `Статус изменен с "${existing.status}" на "${updates.status}"`);
    }

    if (updates.assigned_to && updates.assigned_to !== existing.assigned_to) {
      logActivity(req.params.id, 'assigned', `Ответственный изменен на: ${updates.assigned_to}`);
    }

    if (updates.notes && updates.notes !== existing.notes) {
      logActivity(req.params.id, 'note_updated', 'Обновлены примечания к записи');
    }

    const updated = getRequestById(req.params.id);
    broadcastSseEvent('request_updated', updated);

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating request:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/requests/:id/reanalyze - Re-run AI analysis
 */
router.post('/:id/reanalyze', async (req, res) => {
  try {
    const existing = getRequestById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Запись не найдена' });
    }

    const aiResult = await analyzeIncomingEmail({
      subject: existing.subject,
      body: existing.raw_body_text,
      from: existing.sender_email ? `${existing.sender_name} <${existing.sender_email}>` : existing.sender_name,
      sender_name: existing.sender_name,
      sender_company: existing.sender_company,
      sender_phone: existing.sender_phone,
      sender_email: existing.sender_email,
      sender_inn: existing.sender_inn
    });

    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE requests SET
        category = ?,
        urgency = ?,
        ai_summary = ?,
        ai_action_items = ?,
        ai_confidence = ?,
        ai_provider = ?,
        items = ?,
        estimated_budget = ?,
        draft_reply = ?,
        deadline_at = COALESCE(?, deadline_at),
        sender_company = COALESCE(NULLIF(sender_company, ''), ?),
        sender_name = COALESCE(NULLIF(sender_name, ''), ?),
        sender_phone = COALESCE(NULLIF(sender_phone, ''), ?),
        sender_inn = COALESCE(NULLIF(sender_inn, ''), ?),
        updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      aiResult.category,
      aiResult.urgency,
      aiResult.summary,
      JSON.stringify(aiResult.actionItems),
      aiResult.confidence,
      aiResult.provider,
      JSON.stringify(aiResult.items),
      aiResult.estimatedBudget || existing.estimated_budget,
      aiResult.draftReply,
      aiResult.deadlineDate || null,
      aiResult.contacts.company || '',
      aiResult.contacts.contactPerson || '',
      aiResult.contacts.phone || '',
      aiResult.contacts.inn || '',
      now,
      req.params.id
    );

    logActivity(req.params.id, 'ai_reanalyzed', `ИИ повторно проанализировал письмо через ${aiResult.provider}`);

    const updated = getRequestById(req.params.id);
    broadcastSseEvent('request_updated', updated);

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/requests/:id/generate-quote - Generate formal Commercial Offer / Quote
 */
router.post('/:id/generate-quote', (req, res) => {
  try {
    const existing = getRequestById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Запись не найдена' });
    }

    const {
      quote_number = `КП-${new Date().toISOString().replace(/\D/g, '').slice(2, 8)}-${Math.floor(Math.random() * 900 + 100)}`,
      items = existing.items || [],
      discount_percent = 0,
      tax_percent = 20,
      delivery_cost = 0,
      valid_until_days = 14,
      payment_terms = '100% предоплата (или 50/50 по согласованию)',
      delivery_terms = 'Доставка до склада покупателя / самовывоз',
      manager_comment = 'Цены включают НДС 20%. Товар сертифицирован.'
    } = req.body;

    // Calculate quote rows
    let subtotal = 0;
    const computedItems = items.map((it, idx) => {
      const price = Number(it.price || it.target_price || 1000);
      const qty = Number(it.quantity || 1);
      const sum = price * qty;
      subtotal += sum;
      return {
        id: idx + 1,
        name: it.name,
        sku: it.sku || '',
        quantity: qty,
        unit: it.unit || 'шт',
        price,
        sum
      };
    });

    const discountAmount = (subtotal * Number(discount_percent || 0)) / 100;
    const totalWithoutTax = subtotal - discountAmount + Number(delivery_cost || 0);
    const taxAmount = (totalWithoutTax * Number(tax_percent || 0)) / (100 + Number(tax_percent || 0));
    const grandTotal = totalWithoutTax;

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + Number(valid_until_days || 14));

    const quoteData = {
      quote_number,
      created_date: new Date().toISOString().split('T')[0],
      valid_until: validUntil.toISOString().split('T')[0],
      company_from: {
        name: getSetting('company_name', 'ООО "Бизнес Решения"'),
        phone: getSetting('company_phone', '+7 (495) 123-45-67'),
        email: getSetting('company_email', 'sales@example.com'),
        address: getSetting('company_address', 'г. Москва, ул. Деловая, д. 10')
      },
      client_to: {
        company: existing.sender_company || 'Клиент',
        contact_person: existing.sender_name || '',
        phone: existing.sender_phone || '',
        email: existing.sender_email || '',
        inn: existing.sender_inn || ''
      },
      items: computedItems,
      subtotal,
      discount_percent: Number(discount_percent || 0),
      discount_amount: discountAmount,
      delivery_cost: Number(delivery_cost || 0),
      tax_percent: Number(tax_percent || 20),
      tax_amount: taxAmount,
      grand_total: grandTotal,
      currency: existing.currency || 'RUB',
      payment_terms,
      delivery_terms,
      manager_comment,
      manager_name: existing.assigned_to || 'Менеджер отдела продаж'
    };

    const now = new Date().toISOString();
    db.prepare('UPDATE requests SET quote_data = ?, estimated_budget = ?, status = CASE WHEN status = \'NEW\' THEN \'QUOTE_PREPARED\' ELSE status END, updated_at = ? WHERE id = ?')
      .run(JSON.stringify(quoteData), grandTotal, now, req.params.id);

    logActivity(req.params.id, 'quote_generated', `Сформировано коммерческое предложение ${quote_number} на сумму ${grandTotal.toLocaleString('ru-RU')} ${quoteData.currency}`);

    const updated = getRequestById(req.params.id);
    broadcastSseEvent('request_updated', updated);

    res.json({ success: true, data: updated, quote: quoteData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/requests/:id/send-reply - Send / simulate sending response email
 */
router.post('/:id/send-reply', (req, res) => {
  try {
    const existing = getRequestById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Запись не найдена' });
    }

    const { reply_text, recipient_email = existing.sender_email, attach_quote = true } = req.body;
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      UPDATE requests SET
        status = 'SENT',
        draft_reply = ?,
        updated_at = ?
      WHERE id = ?
    `);

    stmt.run(reply_text || existing.draft_reply, now, req.params.id);

    logActivity(
      req.params.id,
      'email_sent',
      `Ответ отправлен на адрес: ${recipient_email} (${attach_quote ? 'КП прикреплено' : 'без вложений'})`
    );

    const updated = getRequestById(req.params.id);
    broadcastSseEvent('request_updated', updated);

    res.json({
      success: true,
      message: `Ответ успешно отправлен на ${recipient_email}!`,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/requests/:id - Delete single record
 */
router.delete('/:id', (req, res) => {
  try {
    const existing = getRequestById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Запись не найдена' });
    }

    db.prepare('DELETE FROM requests WHERE id = ?').run(req.params.id);
    broadcastSseEvent('request_deleted', { id: req.params.id });

    res.json({ success: true, message: 'Запись успешно удалена' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/requests/batch-status - Bulk status update
 */
router.post('/batch-status', (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || !status) {
      return res.status(400).json({ success: false, error: 'Укажите массив id и новый статус' });
    }

    const now = new Date().toISOString();
    const stmt = db.prepare('UPDATE requests SET status = ?, updated_at = ? WHERE id = ?');
    const updateBatch = db.transaction((idList) => {
      for (const id of idList) {
        stmt.run(status, now, id);
        logActivity(id, 'status_changed', `Массовое изменение статуса на "${status}"`);
      }
    });

    updateBatch(ids);
    broadcastSseEvent('requests_batch_updated', { ids, status });

    res.json({ success: true, message: `Обновлено записей: ${ids.length}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/requests/batch-delete - Bulk delete
 */
router.post('/batch-delete', (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: 'Укажите массив id для удаления' });
    }

    const stmt = db.prepare('DELETE FROM requests WHERE id = ?');
    const deleteBatch = db.transaction((idList) => {
      for (const id of idList) {
        stmt.run(id);
      }
    });

    deleteBatch(ids);
    broadcastSseEvent('requests_batch_deleted', { ids });

    res.json({ success: true, message: `Удалено записей: ${ids.length}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/requests/seed-samples - Reset & Load 8 rich business demo samples
 */
router.post('/seed-samples', async (req, res) => {
  try {
    const { clearExisting = false } = req.body;

    if (clearExisting) {
      db.prepare('DELETE FROM requests').run();
      db.prepare('DELETE FROM activity_logs').run();
    }

    const createdRecords = [];
    for (let i = 0; i < SAMPLE_EMAILS.length; i++) {
      const email = SAMPLE_EMAILS[i];
      const aiAnalysis = await analyzeIncomingEmail(email);

      // Distribute dates over last few days
      const d = new Date();
      d.setHours(d.getHours() - (i * 5));

      const record = createRequestRecord({
        source: 'demo',
        subject: email.subject,
        sender_name: email.sender_name || aiAnalysis.contacts.contactPerson,
        sender_company: email.sender_company || aiAnalysis.contacts.company,
        sender_email: email.sender_email || aiAnalysis.contacts.email,
        sender_phone: email.sender_phone || aiAnalysis.contacts.phone,
        sender_inn: email.sender_inn || aiAnalysis.contacts.inn,
        received_at: d.toISOString(),
        category: aiAnalysis.category,
        urgency: aiAnalysis.urgency,
        status: i === 0 ? 'IN_PROGRESS' : i === 1 ? 'QUOTE_PREPARED' : i === 4 ? 'WON' : 'NEW',
        ai_summary: aiAnalysis.summary,
        ai_action_items: aiAnalysis.actionItems,
        ai_confidence: aiAnalysis.confidence,
        ai_provider: aiAnalysis.provider,
        raw_body_text: email.body,
        items: aiAnalysis.items,
        estimated_budget: aiAnalysis.estimatedBudget || 0,
        draft_reply: aiAnalysis.draftReply,
        deadline_at: aiAnalysis.deadlineDate,
        assigned_to: ['Иван Петров', 'Екатерина Смирнова', 'Алексей Ковалев'][i % 3]
      });

      createdRecords.push(record);
    }

    broadcastSseEvent('samples_seeded', { count: createdRecords.length });

    res.json({
      success: true,
      message: `Успешно загружено ${createdRecords.length} демонстрационных запросов с ИИ-конспектами!`,
      data: createdRecords
    });
  } catch (err) {
    console.error('Error seeding samples:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/requests/generate-sample - Generate 1 fresh random email with AI processing
 */
router.post('/generate-sample', async (req, res) => {
  try {
    const randomEmail = generateRandomEmail();
    const aiAnalysis = await analyzeIncomingEmail(randomEmail);

    const record = createRequestRecord({
      source: 'demo',
      subject: randomEmail.subject,
      sender_name: randomEmail.sender_name,
      sender_company: randomEmail.sender_company,
      sender_email: randomEmail.sender_email,
      sender_phone: randomEmail.sender_phone,
      sender_inn: randomEmail.sender_inn,
      received_at: new Date().toISOString(),
      category: aiAnalysis.category,
      urgency: aiAnalysis.urgency,
      status: 'NEW',
      ai_summary: aiAnalysis.summary,
      ai_action_items: aiAnalysis.actionItems,
      ai_confidence: aiAnalysis.confidence,
      ai_provider: aiAnalysis.provider,
      raw_body_text: randomEmail.body,
      items: aiAnalysis.items,
      estimated_budget: aiAnalysis.estimatedBudget || 0,
      draft_reply: aiAnalysis.draftReply,
      deadline_at: aiAnalysis.deadlineDate
    });

    broadcastSseEvent('request_created', record);

    res.json({
      success: true,
      message: `Сгенерировано новое входящее письмо: "${record.subject}"`,
      data: record
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/requests/export/csv - Export records to CSV format
 */
router.get('/export/csv', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM requests ORDER BY received_at DESC').all();

    const headers = ['ID', 'Дата', 'Категория', 'Срочность', 'Статус', 'Тема', 'Компания', 'Контакт', 'Email', 'Телефон', 'ИНН', 'Сумма (руб)', 'Краткий конспект'];
    const csvLines = [headers.join(';')];

    for (const r of rows) {
      const line = [
        r.id,
        r.received_at,
        r.category,
        r.urgency,
        r.status,
        `"${(r.subject || '').replace(/"/g, '""')}"`,
        `"${(r.sender_company || '').replace(/"/g, '""')}"`,
        `"${(r.sender_name || '').replace(/"/g, '""')}"`,
        r.sender_email || '',
        r.sender_phone || '',
        r.sender_inn || '',
        r.estimated_budget || 0,
        `"${(r.ai_summary || '').replace(/"/g, '""')}"`
      ];
      csvLines.push(line.join(';'));
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="requests_export_${new Date().toISOString().split('T')[0]}.csv"`);
    // Add BOM for Excel UTF-8 compatibility
    res.send('\uFEFF' + csvLines.join('\r\n'));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/requests/export/json - Export records to JSON
 */
router.get('/export/json', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM requests ORDER BY received_at DESC').all();
    const parsed = rows.map(r => ({
      ...r,
      ai_action_items: JSON.parse(r.ai_action_items || '[]'),
      attachments: JSON.parse(r.attachments || '[]'),
      items: JSON.parse(r.items || '[]'),
      tags: JSON.parse(r.tags || '[]'),
      quote_data: r.quote_data ? JSON.parse(r.quote_data) : null
    }));

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="requests_backup_${new Date().toISOString().split('T')[0]}.json"`);
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
