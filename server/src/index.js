import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import db, { initDatabase } from './db.js';
import requestsRouter, { createRequestRecord } from './routes/requests.js';
import emailRouter from './routes/email.js';
import settingsRouter from './routes/settings.js';
import analyticsRouter from './routes/analytics.js';
import { setupImapAutoCheck } from './services/imapService.js';
import { SAMPLE_EMAILS } from './services/sampleData.js';
import { analyzeEmailWithNLP } from './ai/nlpEngine.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// SSE Clients Registry
const sseClients = new Set();

export function broadcastSseEvent(eventType, payload) {
  const message = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch (_) {
      sseClients.delete(client);
    }
  }
}

// SSE stream endpoint
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  res.write('event: connected\ndata: {"status":"connected"}\n\n');
  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// API Routes
app.use('/api/requests', requestsRouter);
app.use('/api/email', emailRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/analytics', analyticsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Email AI RFQ Tracker',
    version: '1.0.0'
  });
});

// Serve frontend static build if available
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Initialize and Seed initial data if empty
async function bootstrap() {
  initDatabase();

  const count = db.prepare('SELECT COUNT(*) as count FROM requests').get().count;
  if (count === 0) {
    console.log('[Bootstrap] Initializing demo data with 8 realistic business emails...');
    for (let i = 0; i < SAMPLE_EMAILS.length; i++) {
      const email = SAMPLE_EMAILS[i];
      const ai = analyzeEmailWithNLP(email);
      const d = new Date();
      d.setHours(d.getHours() - (i * 6));

      createRequestRecord({
        source: 'demo',
        subject: email.subject,
        sender_name: email.sender_name,
        sender_company: email.sender_company,
        sender_email: email.sender_email,
        sender_phone: email.sender_phone,
        sender_inn: email.sender_inn,
        received_at: d.toISOString(),
        category: ai.category,
        urgency: ai.urgency,
        status: i === 0 ? 'IN_PROGRESS' : i === 1 ? 'QUOTE_PREPARED' : i === 4 ? 'WON' : 'NEW',
        ai_summary: ai.summary,
        ai_action_items: ai.actionItems,
        ai_confidence: ai.confidence,
        ai_provider: ai.provider,
        raw_body_text: email.body,
        items: ai.items,
        estimated_budget: ai.estimatedBudget || (i === 1 ? 1450000 : i === 0 ? 320000 : i === 4 ? 240000 : 0),
        draft_reply: ai.draftReply,
        deadline_at: ai.deadlineDate,
        assigned_to: ['Иван Петров', 'Екатерина Смирнова', 'Алексей Ковалев'][i % 3]
      });
    }
    console.log('[Bootstrap] Demo data initialized successfully.');
  }

  setupImapAutoCheck();

  app.listen(PORT, () => {
    console.log(`[Server] Email AI RFQ Tracker backend running on port ${PORT}`);
  });
}

bootstrap().catch(err => {
  console.error('[Bootstrap Error]', err);
});
