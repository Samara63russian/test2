import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import db, { getSetting, logActivity } from '../db.js';
import { analyzeIncomingEmail } from '../ai/llmService.js';
import { createRequestRecord } from '../routes/requests.js';
import { broadcastSseEvent } from '../index.js';

let pollingIntervalId = null;
let isFetching = false;

export function getImapConfigFromDb() {
  return {
    host: getSetting('imap_host', ''),
    port: parseInt(getSetting('imap_port', '993'), 10),
    secure: getSetting('imap_tls', 'true') === 'true',
    auth: {
      user: getSetting('imap_user', ''),
      pass: getSetting('imap_password', '')
    },
    mailbox: getSetting('imap_mailbox', 'INBOX'),
    logger: false
  };
}

/**
 * Test IMAP connection
 */
export async function testImapConnection(customConfig = null) {
  const config = customConfig || getImapConfigFromDb();

  if (!config.host || !config.auth?.user || !config.auth?.pass) {
    throw new Error('Укажите хост, логин и пароль почтового ящика IMAP');
  }

  const client = new ImapFlow({
    host: config.host,
    port: Number(config.port) || 993,
    secure: config.secure !== false,
    auth: {
      user: config.auth.user,
      pass: config.auth.pass
    },
    logger: false,
    emitLogs: false
  });

  try {
    await client.connect();
    const lock = await client.getMailboxLock(config.mailbox || 'INBOX');
    const mailboxStatus = client.mailbox;
    lock.release();
    await client.logout();

    return {
      success: true,
      message: `Подключение успешно! В папке "${config.mailbox || 'INBOX'}" обнаружено писем: ${mailboxStatus.exists}, непрочитанных: ${mailboxStatus.unseen || 0}`
    };
  } catch (err) {
    try { await client.logout(); } catch (_) {}
    throw new Error(`Ошибка подключения к IMAP (${config.host}): ${err.message}`);
  }
}

/**
 * Fetch and process new emails from IMAP
 */
export async function fetchImapEmails(limit = 10) {
  if (isFetching) {
    return { success: false, message: 'Сбор писем уже выполняется...' };
  }

  const config = getImapConfigFromDb();
  if (!config.host || !config.auth?.user || !config.auth?.pass) {
    return { success: false, message: 'Параметры IMAP не настроены в настройках' };
  }

  isFetching = true;
  const client = new ImapFlow({
    host: config.host,
    port: Number(config.port) || 993,
    secure: config.secure !== false,
    auth: {
      user: config.auth.user,
      pass: config.auth.pass
    },
    logger: false
  });

  const importedRecords = [];

  try {
    await client.connect();
    const lock = await client.getMailboxLock(config.mailbox || 'INBOX');

    try {
      // Fetch the latest N messages
      const status = client.mailbox;
      if (status.exists > 0) {
        const startSeq = Math.max(1, status.exists - limit + 1);
        const sequence = `${startSeq}:${status.exists}`;

        for await (const message of client.fetch(sequence, { source: true, envelope: true, bodyStructure: true })) {
          const parsed = await simpleParser(message.source);
          const messageId = parsed.messageId || `imap_${message.seq}_${message.uid}`;

          // Check if already in DB
          const existing = db.prepare('SELECT id FROM requests WHERE raw_body_text LIKE ? OR subject = ?').get(`%${messageId}%`, parsed.subject || '');
          if (existing) {
            continue;
          }

          const senderAddress = parsed.from?.value?.[0]?.address || '';
          const senderName = parsed.from?.value?.[0]?.name || senderAddress.split('@')[0] || 'Отправитель';

          const emailData = {
            subject: parsed.subject || '(Без темы)',
            from: senderAddress ? `${senderName} <${senderAddress}>` : senderName,
            sender_name: senderName,
            sender_email: senderAddress,
            body: parsed.text || '',
            raw_body_text: parsed.text || '',
            raw_body_html: parsed.html || '',
            received_at: parsed.date ? parsed.date.toISOString() : new Date().toISOString()
          };

          // Run AI Analysis
          const aiAnalysis = await analyzeIncomingEmail(emailData);

          // Create CRM record
          const record = createRequestRecord({
            source: 'email_imap',
            subject: emailData.subject,
            sender_name: aiAnalysis.contacts.contactPerson || senderName,
            sender_email: aiAnalysis.contacts.email || senderAddress,
            sender_phone: aiAnalysis.contacts.phone || '',
            sender_company: aiAnalysis.contacts.company || '',
            sender_inn: aiAnalysis.contacts.inn || '',
            recipient: parsed.to?.text || config.auth.user,
            received_at: emailData.received_at,
            category: aiAnalysis.category,
            urgency: aiAnalysis.urgency,
            status: 'NEW',
            ai_summary: aiAnalysis.summary,
            ai_action_items: aiAnalysis.actionItems,
            ai_confidence: aiAnalysis.confidence,
            ai_provider: aiAnalysis.provider,
            raw_body_text: emailData.raw_body_text,
            raw_body_html: emailData.raw_body_html,
            attachments: (parsed.attachments || []).map(a => ({ name: a.filename || 'file', size: a.size || 0, type: a.contentType || 'application/octet-stream' })),
            items: aiAnalysis.items,
            estimated_budget: aiAnalysis.estimatedBudget || 0,
            draft_reply: aiAnalysis.draftReply || '',
            deadline_at: aiAnalysis.deadlineDate || null
          });

          importedRecords.push(record);
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();

    if (importedRecords.length > 0) {
      broadcastSseEvent('new_emails_imported', { count: importedRecords.length, records: importedRecords });
    }

    return {
      success: true,
      message: `Импортировано новых писем: ${importedRecords.length}`,
      count: importedRecords.length,
      records: importedRecords
    };
  } catch (err) {
    try { await client.logout(); } catch (_) {}
    throw new Error(`Ошибка сбора писем по IMAP: ${err.message}`);
  } finally {
    isFetching = false;
  }
}

/**
 * Configure background auto-check polling timer
 */
export function setupImapAutoCheck() {
  if (pollingIntervalId) {
    clearInterval(pollingIntervalId);
    pollingIntervalId = null;
  }

  const autoCheck = getSetting('imap_auto_check', 'false') === 'true';
  const intervalMinutes = Math.max(1, parseInt(getSetting('imap_check_interval', '5'), 10));

  if (autoCheck) {
    console.log(`[IMAP Service] Автоматический опрос почты включен (каждые ${intervalMinutes} мин)`);
    pollingIntervalId = setInterval(async () => {
      try {
        await fetchImapEmails(10);
      } catch (err) {
        console.error('[IMAP Service] Background poll error:', err.message);
      }
    }, intervalMinutes * 60 * 1000);
  }
}
