import express from 'express';
import db from '../db.js';

const router = express.Router();

/**
 * GET /api/analytics/dashboard - Comprehensive analytics data
 */
router.get('/dashboard', (req, res) => {
  try {
    const totalRequests = db.prepare('SELECT COUNT(*) as count FROM requests').get().count;

    // Categories Breakdown
    const categoriesRaw = db.prepare(`
      SELECT category, COUNT(*) as count, SUM(estimated_budget) as total_budget
      FROM requests
      GROUP BY category
    `).all();

    const categoryLabels = {
      RFQ: 'Запрос на КП (RFQ)',
      SPEC_LIST: 'Спецификация / Перечень',
      GENERAL_INQUIRY: 'Общий запрос / Инфо',
      ORDER: 'Прямой заказ / Счёт',
      SPAM_OTHER: 'Спам / Рассылка'
    };

    const categoryStats = categoriesRaw.map(c => ({
      category: c.category,
      label: categoryLabels[c.category] || c.category,
      count: c.count,
      total_budget: c.total_budget || 0,
      percentage: totalRequests > 0 ? Math.round((c.count / totalRequests) * 100) : 0
    }));

    // Urgency Breakdown
    const urgencyRaw = db.prepare(`
      SELECT urgency, COUNT(*) as count
      FROM requests
      GROUP BY urgency
    `).all();

    const urgencyStats = urgencyRaw.map(u => ({
      urgency: u.urgency,
      label: u.urgency === 'HIGH' ? 'Срочно (ASAP)' : u.urgency === 'LOW' ? 'Низкий' : 'Средний',
      count: u.count,
      percentage: totalRequests > 0 ? Math.round((u.count / totalRequests) * 100) : 0
    }));

    // Status Funnel
    const statusesRaw = db.prepare(`
      SELECT status, COUNT(*) as count, SUM(estimated_budget) as total_budget
      FROM requests
      GROUP BY status
    `).all();

    const statusMap = {};
    statusesRaw.forEach(s => { statusMap[s.status] = s; });

    const funnelStages = [
      { status: 'NEW', label: 'Новые', count: statusMap['NEW']?.count || 0 },
      { status: 'IN_PROGRESS', label: 'В обработке', count: statusMap['IN_PROGRESS']?.count || 0 },
      { status: 'QUOTE_PREPARED', label: 'КП сформировано', count: statusMap['QUOTE_PREPARED']?.count || 0 },
      { status: 'SENT', label: 'Отправлено клиенту', count: statusMap['SENT']?.count || 0 },
      { status: 'WON', label: 'Сделка выиграна', count: statusMap['WON']?.count || 0 },
      { status: 'LOST', label: 'Отказ / Утеряно', count: statusMap['LOST']?.count || 0 }
    ];

    // Pipeline Value
    const totalPipelineBudget = db.prepare('SELECT SUM(estimated_budget) as total FROM requests WHERE status != \'REJECTED\' AND status != \'LOST\'').get().total || 0;
    const wonBudget = db.prepare('SELECT SUM(estimated_budget) as total FROM requests WHERE status = \'WON\'').get().total || 0;

    // Timeline Trend (Grouped by date)
    const trendRaw = db.prepare(`
      SELECT substr(received_at, 1, 10) as date,
             COUNT(*) as count,
             SUM(CASE WHEN category = 'RFQ' THEN 1 ELSE 0 END) as rfq_count,
             SUM(CASE WHEN category = 'SPEC_LIST' THEN 1 ELSE 0 END) as spec_count,
             SUM(CASE WHEN category = 'ORDER' THEN 1 ELSE 0 END) as order_count
      FROM requests
      GROUP BY substr(received_at, 1, 10)
      ORDER BY date ASC
      LIMIT 14
    `).all();

    // Top Companies
    const topCompanies = db.prepare(`
      SELECT sender_company, COUNT(*) as count, SUM(estimated_budget) as total_budget
      FROM requests
      WHERE sender_company IS NOT NULL AND sender_company != ''
      GROUP BY sender_company
      ORDER BY count DESC
      LIMIT 5
    `).all();

    // Manager workload
    const managerWorkload = db.prepare(`
      SELECT assigned_to, COUNT(*) as count,
             SUM(CASE WHEN status IN ('WON', 'SENT', 'QUOTE_PREPARED') THEN 1 ELSE 0 END) as processed_count
      FROM requests
      WHERE assigned_to IS NOT NULL AND assigned_to != ''
      GROUP BY assigned_to
      ORDER BY count DESC
    `).all();

    // AI Classification Accuracy indicator
    const avgConfidence = db.prepare('SELECT AVG(ai_confidence) as avg_conf FROM requests WHERE ai_confidence IS NOT NULL').get().avg_conf || 0.94;

    res.json({
      success: true,
      data: {
        totalRequests,
        totalPipelineBudget,
        wonBudget,
        conversionRate: totalRequests > 0 ? Math.round(((statusMap['WON']?.count || 0) / totalRequests) * 100) : 0,
        avgConfidence: Number(avgConfidence.toFixed(2)),
        categoryStats,
        urgencyStats,
        funnelStages,
        timelineTrend: trendRaw,
        topCompanies,
        managerWorkload
      }
    });
  } catch (err) {
    console.error('Analytics dashboard error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
