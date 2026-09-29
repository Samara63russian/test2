import express from 'express';
import { getAllSettings, updateSettings } from '../db.js';
import { testAiConnection } from '../ai/llmService.js';
import { setupImapAutoCheck } from '../services/imapService.js';

const router = express.Router();

/**
 * GET /api/settings - Fetch all settings
 */
router.get('/', (req, res) => {
  try {
    const settings = getAllSettings();
    // Parse JSON strings if necessary
    if (settings.manager_names) {
      try {
        settings.manager_names = JSON.parse(settings.manager_names);
      } catch (_) {}
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/settings - Save settings
 */
router.put('/', (req, res) => {
  try {
    const newSettings = req.body;
    updateSettings(newSettings);

    // If IMAP auto-check parameters changed, reload timer
    if (newSettings.imap_auto_check !== undefined || newSettings.imap_check_interval !== undefined) {
      setupImapAutoCheck();
    }

    res.json({ success: true, message: 'Настройки успешно сохранены' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/settings/test-ai - Test AI provider
 */
router.post('/test-ai', async (req, res) => {
  try {
    const { provider, ...config } = req.body;
    const startTime = Date.now();
    const result = await testAiConnection(provider, config);
    const latency = Date.now() - startTime;

    res.json({
      success: true,
      message: result.message,
      latencyMs: latency,
      sample: result.sample
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

export default router;
