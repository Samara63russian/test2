import express from 'express';
import multer from 'multer';
import { parseEmlContent } from '../services/emailParser.js';
import { fetchImapEmails, testImapConnection } from '../services/imapService.js';
import { analyzeIncomingEmail } from '../ai/llmService.js';
import { createRequestRecord } from './requests.js';
import { broadcastSseEvent } from '../index.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB
});

/**
 * POST /api/email/fetch-imap - On-demand trigger to fetch emails from IMAP
 */
router.post('/fetch-imap', async (req, res) => {
  try {
    const limit = parseInt(req.body.limit || '10', 10);
    const result = await fetchImapEmails(limit);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/email/test-imap - Test IMAP connection with provided or saved settings
 */
router.post('/test-imap', async (req, res) => {
  try {
    const customConfig = req.body.host ? {
      host: req.body.host,
      port: req.body.port,
      secure: req.body.secure,
      auth: {
        user: req.body.user,
        pass: req.body.password
      },
      mailbox: req.body.mailbox || 'INBOX'
    } : null;

    const result = await testImapConnection(customConfig);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/email/upload-eml - Upload and parse .eml file
 */
router.post('/upload-eml', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Файл не прикреплен' });
    }

    const parsed = await parseEmlContent(req.file.buffer);

    const emailData = {
      subject: parsed.subject,
      from: parsed.from,
      sender_name: parsed.senderName,
      sender_email: parsed.senderEmail,
      body: parsed.textBody || '',
      raw_body_text: parsed.textBody || '',
      raw_body_html: parsed.htmlBody || '',
      received_at: parsed.date
    };

    // Run AI analysis
    const aiAnalysis = await analyzeIncomingEmail(emailData);

    const record = createRequestRecord({
      source: 'eml_upload',
      subject: parsed.subject,
      sender_name: aiAnalysis.contacts.contactPerson || parsed.senderName,
      sender_email: aiAnalysis.contacts.email || parsed.senderEmail,
      sender_phone: aiAnalysis.contacts.phone || '',
      sender_company: aiAnalysis.contacts.company || '',
      sender_inn: aiAnalysis.contacts.inn || '',
      recipient: parsed.to,
      received_at: parsed.date,
      category: aiAnalysis.category,
      urgency: aiAnalysis.urgency,
      status: 'NEW',
      ai_summary: aiAnalysis.summary,
      ai_action_items: aiAnalysis.actionItems,
      ai_confidence: aiAnalysis.confidence,
      ai_provider: aiAnalysis.provider,
      raw_body_text: parsed.textBody,
      raw_body_html: parsed.htmlBody,
      attachments: parsed.attachments,
      items: aiAnalysis.items,
      estimated_budget: aiAnalysis.estimatedBudget || 0,
      draft_reply: aiAnalysis.draftReply,
      deadline_at: aiAnalysis.deadlineDate
    });

    broadcastSseEvent('request_created', record);

    res.json({
      success: true,
      message: `Файл "${req.file.originalname}" успешно обработан!`,
      data: record
    });
  } catch (err) {
    console.error('Error processing EML upload:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/email/analyze-raw - Analyze pasted text on the fly
 */
router.post('/analyze-raw', async (req, res) => {
  try {
    const { subject = '', body = '', from = '', createRecord = false } = req.body;
    if (!body && !subject) {
      return res.status(400).json({ success: false, error: 'Укажите текст письма или тему' });
    }

    const aiAnalysis = await analyzeIncomingEmail({ subject, body, from });

    let record = null;
    if (createRecord) {
      record = createRequestRecord({
        source: 'manual_entry',
        subject: subject || '(Без темы)',
        sender_name: aiAnalysis.contacts.contactPerson || '',
        sender_company: aiAnalysis.contacts.company || '',
        sender_email: aiAnalysis.contacts.email || from || '',
        sender_phone: aiAnalysis.contacts.phone || '',
        sender_inn: aiAnalysis.contacts.inn || '',
        received_at: new Date().toISOString(),
        category: aiAnalysis.category,
        urgency: aiAnalysis.urgency,
        status: 'NEW',
        ai_summary: aiAnalysis.summary,
        ai_action_items: aiAnalysis.actionItems,
        ai_confidence: aiAnalysis.confidence,
        ai_provider: aiAnalysis.provider,
        raw_body_text: body,
        items: aiAnalysis.items,
        estimated_budget: aiAnalysis.estimatedBudget || 0,
        draft_reply: aiAnalysis.draftReply,
        deadline_at: aiAnalysis.deadlineDate
      });
      broadcastSseEvent('request_created', record);
    }

    res.json({
      success: true,
      analysis: aiAnalysis,
      record
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/email/webhook - Webhook endpoint for inbound emails
 */
router.post('/webhook', async (req, res) => {
  try {
    const {
      subject = 'Входящий запрос',
      from = '',
      to = '',
      text = '',
      html = '',
      sender_name = '',
      sender_company = ''
    } = req.body;

    const emailData = {
      subject,
      from,
      body: text || html || '',
      raw_body_text: text,
      raw_body_html: html,
      sender_name,
      sender_company
    };

    const aiAnalysis = await analyzeIncomingEmail(emailData);

    const record = createRequestRecord({
      source: 'webhook',
      subject,
      sender_name: aiAnalysis.contacts.contactPerson || sender_name || from.split('@')[0],
      sender_email: aiAnalysis.contacts.email || from,
      sender_phone: aiAnalysis.contacts.phone || '',
      sender_company: aiAnalysis.contacts.company || sender_company || '',
      sender_inn: aiAnalysis.contacts.inn || '',
      recipient: to,
      received_at: new Date().toISOString(),
      category: aiAnalysis.category,
      urgency: aiAnalysis.urgency,
      status: 'NEW',
      ai_summary: aiAnalysis.summary,
      ai_action_items: aiAnalysis.actionItems,
      ai_confidence: aiAnalysis.confidence,
      ai_provider: aiAnalysis.provider,
      raw_body_text: text,
      raw_body_html: html,
      items: aiAnalysis.items,
      estimated_budget: aiAnalysis.estimatedBudget || 0,
      draft_reply: aiAnalysis.draftReply,
      deadline_at: aiAnalysis.deadlineDate
    });

    broadcastSseEvent('request_created', record);

    res.status(201).json({ success: true, id: record.id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
