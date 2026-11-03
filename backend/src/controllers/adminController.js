const db = require('../database/db');

async function audit(client, { adminId, role, action, table, recordId, oldV, newV, reason, req }) {
  await (client || db).query(
    `INSERT INTO audit_log (admin_user_id, role, action, table_name, record_id, old_values, new_values, reason, ip_address, user_agent)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [adminId, role, action, table || null, recordId || null,
     oldV ? JSON.stringify(oldV) : null, newV ? JSON.stringify(newV) : null,
     reason || null, req?.ip || null, req?.headers?.['user-agent'] || null]
  );
}

/** GET /admin/stats - dashboard overview */
const getStats = async (req, res) => {
  try {
    const [users, lessonsDone, exams, orders, auxx, ai, deposits, tickets] = await Promise.all([
      db.query(`SELECT COUNT(*)::int AS total,
                       SUM(CASE WHEN last_active_at > NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END)::int AS active_7d,
                       SUM(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END)::int AS new_7d
                FROM users`),
      db.query(`SELECT COUNT(*)::int AS n FROM user_progress WHERE status='completed'`),
      db.query(`SELECT SUM(CASE WHEN status='passed' THEN 1 ELSE 0 END)::int AS passed,
                       SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END)::int AS failed
                FROM exam_attempts`),
      db.query(`SELECT COUNT(*)::int AS total,
                       SUM(CASE WHEN order_status='filled' THEN 1 ELSE 0 END)::int AS open
                FROM sandbox_orders`),
      db.query(`SELECT COALESCE(SUM(CASE WHEN amount_auxx>0 THEN amount_auxx END),0)::int AS issued,
                       COALESCE(SUM(CASE WHEN transaction_type='purchase' THEN amount_usdt END),0) AS revenue_usdt
                FROM auxx_ledger`),
      db.query(`SELECT COUNT(*)::int AS calls, COALESCE(SUM(cost_usd),0) AS cost,
                       SUM(CASE WHEN is_flagged THEN 1 ELSE 0 END)::int AS flagged
                FROM ai_interactions`),
      db.query(`SELECT COUNT(*)::int AS n FROM crypto_deposits WHERE status='pending'`),
      db.query(`SELECT COUNT(*)::int AS n FROM support_tickets WHERE status='open'`),
    ]);
    res.json({
      users: users.rows[0],
      lessons_completed: lessonsDone.rows[0].n,
      exams: exams.rows[0],
      orders: orders.rows[0],
      auxx: auxx.rows[0],
      ai: ai.rows[0],
      pending_deposits: deposits.rows[0].n,
      open_tickets: tickets.rows[0].n,
    });
  } catch (e) {
    console.error('getStats:', e);
    res.status(500).json({ error: 'Failed to load stats' });
  }
};

/** GET /admin/users?q=&page= */
const getUsers = async (req, res) => {
  try {
    const q = req.query.q ? `%${req.query.q}%` : null;
    const r = await db.query(
      `SELECT u.id, u.phone_number, u.full_name, u.email, u.preferred_language,
              u.is_blocked, u.created_at, u.last_active_at,
              ul.current_level, ul.total_xp, ul.readiness_score,
              sa.balance_usd
       FROM users u
       LEFT JOIN user_levels ul ON ul.user_id = u.id
       LEFT JOIN sandbox_accounts sa ON sa.user_id = u.id
       ${q ? 'WHERE u.phone_number ILIKE $1 OR u.full_name ILIKE $1 OR u.email ILIKE $1' : ''}
       ORDER BY u.created_at DESC LIMIT 200`,
      q ? [q] : []
    );
    res.json({ users: r.rows });
  } catch (e) {
    console.error('getUsers:', e);
    res.status(500).json({ error: 'Failed to load users' });
  }
};

/** POST /admin/users/:id/block { reason } */
const blockUser = async (req, res) => {
  try {
    const r = await db.query(
      `UPDATE users SET is_blocked=true, blocked_reason=$1, updated_at=NOW()
       WHERE id=$2 RETURNING id, phone_number`,
      [req.body.reason || 'Blocked by admin', req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'User not found' });
    await audit(null, { adminId: req.user.id, role: req.user.role, action: 'block', table: 'users', recordId: req.params.id, reason: req.body.reason, req });
    res.json({ message: 'User blocked', user: r.rows[0] });
  } catch (e) {
    console.error('blockUser:', e);
    res.status(500).json({ error: 'Failed to block user' });
  }
};

const unblockUser = async (req, res) => {
  try {
    const r = await db.query(
      `UPDATE users SET is_blocked=false, blocked_reason=NULL, updated_at=NOW()
       WHERE id=$1 RETURNING id, phone_number`,
      [req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'User not found' });
    await audit(null, { adminId: req.user.id, role: req.user.role, action: 'unblock', table: 'users', recordId: req.params.id, req });
    res.json({ message: 'User unblocked', user: r.rows[0] });
  } catch (e) {
    console.error('unblockUser:', e);
    res.status(500).json({ error: 'Failed to unblock user' });
  }
};

/** POST /admin/users/:id/reset-sandbox */
const resetUserSandbox = async (req, res) => {
  try {
    const r = await db.query(
      `UPDATE sandbox_accounts SET balance_usd=starting_balance_usd, reset_count=reset_count+1, last_reset_at=NOW()
       WHERE user_id=$1 RETURNING *`,
      [req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Sandbox not found' });
    await audit(null, { adminId: req.user.id, role: req.user.role, action: 'reset', table: 'sandbox_accounts', recordId: r.rows[0].id, req });
    res.json({ message: 'Sandbox reset', account: r.rows[0] });
  } catch (e) {
    console.error('resetUserSandbox:', e);
    res.status(500).json({ error: 'Failed to reset sandbox' });
  }
};

/** GET /admin/content/lessons?state= */
const getContentLessons = async (req, res) => {
  try {
    const r = await db.query(
      `SELECT l.id, l.lesson_number, l.title_en, l.state, l.content_trust_score,
              l.native_speaker_approved, lv.level_number
       FROM lessons l JOIN levels lv ON lv.id = l.level_id
       ORDER BY lv.level_number, l.lesson_number`
    );
    res.json({ lessons: r.rows });
  } catch (e) {
    console.error('getContentLessons:', e);
    res.status(500).json({ error: 'Failed to load content' });
  }
};

/** POST /admin/lessons/:id/state { state: draft|review|published } */
const setLessonState = async (req, res) => {
  try {
    const { state } = req.body;
    if (!['draft', 'review', 'published'].includes(state)) {
      return res.status(400).json({ error: 'Invalid state' });
    }
    const r = await db.query(
      `UPDATE lessons SET state=$1, updated_at=NOW() WHERE id=$2 RETURNING id, title_en, state`,
      [state, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Lesson not found' });
    await audit(null, { adminId: req.user.id, role: req.user.role, action: 'update', table: 'lessons', recordId: req.params.id, newV: { state }, req });
    res.json({ lesson: r.rows[0] });
  } catch (e) {
    console.error('setLessonState:', e);
    res.status(500).json({ error: 'Failed to update lesson' });
  }
};

/** GET /admin/audit */
const getAuditLog = async (req, res) => {
  try {
    const r = await db.query(
      `SELECT a.*, u.phone_number AS admin_phone
       FROM audit_log a LEFT JOIN users u ON u.id = a.admin_user_id
       ORDER BY a.created_at DESC LIMIT 200`
    );
    res.json({ entries: r.rows });
  } catch (e) {
    console.error('getAuditLog:', e);
    res.status(500).json({ error: 'Failed to load audit log' });
  }
};

/** GET /admin/deposits */
const getDeposits = async (req, res) => {
  try {
    const r = await db.query(
      `SELECT d.*, u.phone_number FROM crypto_deposits d
       JOIN users u ON u.id = d.user_id ORDER BY d.created_at DESC LIMIT 200`
    );
    res.json({ deposits: r.rows });
  } catch (e) {
    console.error('getDeposits:', e);
    res.status(500).json({ error: 'Failed to load deposits' });
  }
};

/** POST /admin/deposits/:id/status { status } - finance review */
const setDepositStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['confirmed', 'failed', 'manual_review'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const r = await db.query(
      `UPDATE crypto_deposits SET status=$1, confirmed_at=CASE WHEN $1='confirmed' THEN NOW() ELSE confirmed_at END
       WHERE id=$2 RETURNING *`,
      [status, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Deposit not found' });
    await audit(null, { adminId: req.user.id, role: req.user.role, action: 'update', table: 'crypto_deposits', recordId: req.params.id, newV: { status }, req });
    res.json({ deposit: r.rows[0] });
  } catch (e) {
    console.error('setDepositStatus:', e);
    res.status(500).json({ error: 'Failed to update deposit' });
  }
};

/** GET /admin/ai/flagged */
const getFlaggedAi = async (req, res) => {
  try {
    const r = await db.query(
      `SELECT i.*, u.phone_number FROM ai_interactions i
       JOIN users u ON u.id=i.user_id WHERE i.is_flagged=true
       ORDER BY i.created_at DESC LIMIT 100`
    );
    res.json({ interactions: r.rows });
  } catch (e) {
    console.error('getFlaggedAi:', e);
    res.status(500).json({ error: 'Failed to load flagged interactions' });
  }
};

/** GET /admin/tickets */
const getTickets = async (req, res) => {
  try {
    const r = await db.query(
      `SELECT t.*, u.phone_number FROM support_tickets t
       JOIN users u ON u.id=t.user_id ORDER BY t.created_at DESC LIMIT 200`
    );
    res.json({ tickets: r.rows });
  } catch (e) {
    console.error('getTickets:', e);
    res.status(500).json({ error: 'Failed to load tickets' });
  }
};

// ---- app settings (certificate signers etc.) ----
const getSettings = async (req, res) => {
  const r = await db.query('SELECT key, value FROM app_settings ORDER BY key');
  res.json({ settings: Object.fromEntries(r.rows.map(x => [x.key, x.value])) });
};

const setSettings = async (req, res) => {
  const { settings } = req.body; // { key: value }
  if (!settings || typeof settings !== 'object') return res.status(400).json({ error: 'settings object required' });
  for (const [k, v] of Object.entries(settings)) {
    await db.query(
      `INSERT INTO app_settings (key, value, updated_at) VALUES ($1,$2,NOW())
       ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
      [k, String(v)]
    );
  }
  await db.query(`INSERT INTO audit_log (admin_user_id, action, target_table, metadata) VALUES ($1,'update','app_settings',$2)`,
    [req.user.id, JSON.stringify({ keys: Object.keys(settings) })]);
  res.json({ message: 'Settings saved' });
};

module.exports = {
  getStats, getUsers, blockUser, unblockUser, resetUserSandbox,
  getContentLessons, setLessonState, getAuditLog, getDeposits,
  setDepositStatus, getFlaggedAi, getTickets, getSettings, setSettings,
};
