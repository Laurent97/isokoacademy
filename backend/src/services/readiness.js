const db = require('../database/db');

/**
 * Application-side readiness score (replaces the plpgsql function so it
 * also runs on the dev in-memory DB).
 *
 * Weights: exam avg 25% + practical pass rate 20% + risk discipline 25%
 *        + consistency 15% + journal quality 10% + drawdown control 5%
 */
async function updateReadiness(userId) {
  const exam = await db.query(
    `SELECT COALESCE(AVG(score),0) AS avg FROM exam_attempts
     WHERE user_id=$1 AND exam_type='mcq' AND status='passed'`, [userId]);

  const prac = await db.query(
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN status='passed' THEN 1 ELSE 0 END) AS passed
     FROM exam_attempts WHERE user_id=$1 AND exam_type='practical'`, [userId]);

  const trades = await db.query(
    `SELECT profit_loss, risk_percent, journal_entry, created_at
     FROM sandbox_orders WHERE user_id=$1 AND order_status='closed'
     ORDER BY created_at`, [userId]);

  const closed = trades.rows;
  const total = closed.length;

  const inRiskBand = closed.filter(o => Number(o.risk_percent) >= 1 && Number(o.risk_percent) <= 2).length;
  const journaled = closed.filter(o => o.journal_entry && o.journal_entry.length > 10).length;
  const days = new Set(closed.filter(o =>
    new Date(o.created_at) > new Date(Date.now() - 30 * 864e5)
  ).map(o => new Date(o.created_at).toDateString())).size;

  // max drawdown on cumulative P&L
  let peak = 0, maxDd = 0, cum = 0;
  for (const o of closed) {
    cum += Number(o.profit_loss || 0);
    peak = Math.max(peak, cum);
    if (peak > 0) maxDd = Math.max(maxDd, ((peak - cum) / peak) * 100);
  }

  const examAvg = Number(exam.rows[0].avg) || 0;
  const pracRate = prac.rows[0].total > 0 ? (prac.rows[0].passed / prac.rows[0].total) * 100 : 0;
  const riskDisc = total > 0 ? (inRiskBand / total) * 100 : 0;
  const consistency = Math.min(days, 30) / 30 * 100;
  const journalQ = total > 0 ? (journaled / total) * 100 : 0;
  const ddCtrl = maxDd <= 10 ? 100 : 0;

  const score = examAvg * 0.25 + pracRate * 0.20 + riskDisc * 0.25 +
    consistency * 0.15 + journalQ * 0.10 + ddCtrl * 0.05;

  // v2 rule: readiness ≥70 for 14 consecutive days unlocks broker-ready flag.
  // Streak counts distinct days; resets when a check lands below 70.
  const cur = await db.query(
    'SELECT readiness_streak_days, readiness_last_check FROM user_levels WHERE user_id=$1',
    [userId]
  );
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const lastCheck = cur.rows[0]?.readiness_last_check ? new Date(cur.rows[0].readiness_last_check) : null;
  let streak = cur.rows[0]?.readiness_streak_days || 0;

  if (score >= 70) {
    if (!lastCheck || lastCheck.getTime() < today.getTime()) {
      const yesterday = new Date(today.getTime() - 864e5);
      streak = lastCheck && lastCheck.getTime() === yesterday.getTime() ? streak + 1 : 1;
    }
  } else if (!lastCheck || lastCheck.getTime() < today.getTime()) {
    streak = 0;
  }

  await db.query(
    `UPDATE user_levels
     SET readiness_score=$1, readiness_streak_days=$2, readiness_last_check=CURRENT_DATE,
         broker_ready=$3, updated_at=NOW()
     WHERE user_id=$4`,
    [Math.round(score * 100) / 100, streak, streak >= 14, userId]
  );
  return score;
}

module.exports = { updateReadiness };
