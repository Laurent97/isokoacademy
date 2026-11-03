const db = require('../database/db');

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const userResult = await db.query(
      `SELECT id, phone_number, email, full_name, preferred_language,
              created_at, last_active_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get user level info
    const levelResult = await db.query(
      'SELECT * FROM user_levels WHERE user_id = $1',
      [userId]
    );

    // Get sandbox balance
    const sandboxResult = await db.query(
      'SELECT balance_usd FROM sandbox_accounts WHERE user_id = $1',
      [userId]
    );

    res.json({
      user,
      level: levelResult.rows[0] || null,
      sandbox_balance: sandboxResult.rows[0]?.balance_usd || 0
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, full_name } = req.body;

    const result = await db.query(
      `UPDATE users
       SET email = COALESCE($1, email),
           full_name = COALESCE($2, full_name),
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, phone_number, email, full_name`,
      [email, full_name, userId]
    );

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const updateLanguage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { language } = req.body;

    if (!['en', 'rw'].includes(language)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

    await db.query(
      'UPDATE users SET preferred_language = $1 WHERE id = $2',
      [language, userId]
    );

    res.json({ message: 'Language updated successfully' });
  } catch (error) {
    console.error('Update language error:', error);
    res.status(500).json({ error: 'Failed to update language' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateLanguage
};
