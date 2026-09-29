import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'requests.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency and performance
db.pragma('journal_mode = WAL');

// Initialize schema
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL DEFAULT 'manual_entry',
      subject TEXT NOT NULL,
      sender_name TEXT,
      sender_email TEXT,
      sender_phone TEXT,
      sender_company TEXT,
      sender_inn TEXT,
      recipient TEXT,
      received_at TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'RFQ',
      urgency TEXT NOT NULL DEFAULT 'MEDIUM',
      status TEXT NOT NULL DEFAULT 'NEW',
      ai_summary TEXT,
      ai_action_items TEXT, -- JSON array
      ai_confidence REAL DEFAULT 0.9,
      ai_provider TEXT DEFAULT 'builtin_nlp',
      raw_body_text TEXT,
      raw_body_html TEXT,
      attachments TEXT, -- JSON array
      items TEXT, -- JSON array of requested items
      estimated_budget REAL DEFAULT 0,
      currency TEXT DEFAULT 'RUB',
      assigned_to TEXT DEFAULT 'Не назначен',
      tags TEXT, -- JSON array
      notes TEXT DEFAULT '',
      quote_data TEXT, -- JSON object for generated CP
      draft_reply TEXT,
      deadline_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(request_id) REFERENCES requests(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
    CREATE INDEX IF NOT EXISTS idx_requests_category ON requests(category);
    CREATE INDEX IF NOT EXISTS idx_requests_urgency ON requests(urgency);
    CREATE INDEX IF NOT EXISTS idx_requests_received_at ON requests(received_at);
  `);

  // Initialize default settings if not set
  const defaultSettings = {
    ai_provider: 'builtin_nlp', // 'builtin_nlp', 'groq', 'gemini', 'openrouter', 'ollama', 'huggingface'
    groq_api_key: '',
    groq_model: 'llama-3.3-70b-versatile',
    gemini_api_key: '',
    gemini_model: 'gemini-2.0-flash',
    openrouter_api_key: '',
    openrouter_model: 'meta-llama/llama-3.3-70b-instruct:free',
    huggingface_api_key: '',
    huggingface_model: 'Qwen/Qwen2.5-72B-Instruct',
    ollama_endpoint: 'http://localhost:11434',
    ollama_model: 'llama3:latest',
    imap_host: '',
    imap_port: '993',
    imap_user: '',
    imap_password: '',
    imap_tls: 'true',
    imap_mailbox: 'INBOX',
    imap_auto_check: 'false',
    imap_check_interval: '5', // minutes
    company_name: 'ООО "Бизнес Решения"',
    company_email: 'sales@example.com',
    company_phone: '+7 (495) 123-45-67',
    company_address: 'г. Москва, ул. Деловая, д. 10',
    manager_names: JSON.stringify(['Иван Петров', 'Екатерина Смирнова', 'Алексей Ковалев', 'Мария Новикова']),
    auto_classify: 'true',
    notification_sound: 'true'
  };

  const getStmt = db.prepare('SELECT value FROM settings WHERE key = ?');
  const setStmt = db.prepare('INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)');

  for (const [key, val] of Object.entries(defaultSettings)) {
    const existing = getStmt.get(key);
    if (!existing) {
      setStmt.run(key, val, new Date().toISOString());
    }
  }
}

export function logActivity(requestId, action, details) {
  try {
    const stmt = db.prepare(
      'INSERT INTO activity_logs (request_id, action, details, created_at) VALUES (?, ?, ?, ?)'
    );
    stmt.run(requestId, action, details, new Date().toISOString());
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

export function getSetting(key, defaultValue = '') {
  try {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return row ? row.value : defaultValue;
  } catch (err) {
    return defaultValue;
  }
}

export function getAllSettings() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const settings = {};
  for (const row of rows) {
    // Mask sensitive keys when returning all settings if requested
    settings[row.key] = row.value;
  }
  return settings;
}

export function updateSettings(settingsObj) {
  const stmt = db.prepare(
    'INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at'
  );
  const now = new Date().toISOString();
  const updateMany = db.transaction((entries) => {
    for (const [key, value] of entries) {
      stmt.run(key, typeof value === 'object' ? JSON.stringify(value) : String(value), now);
    }
  });
  updateMany(Object.entries(settingsObj));
}

export default db;
