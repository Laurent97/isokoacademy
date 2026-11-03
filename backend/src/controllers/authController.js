const db = require('../database/db');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

// Twilio is optional: without credentials, dev mode logs the OTP and
// accepts the fixed code 123456.
const twilioEnabled = !!(
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_PHONE_NUMBER &&
  !process.env.TWILIO_ACCOUNT_SID.startsWith('your_')
);
const twilioClient = twilioEnabled ? require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;

const DEV_OTP = '123456';

// Store OTPs in memory (in production, use Redis)
const otpStore = new Map();

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const getUserRole = async (userId) => {
  const r = await db.query(
    'SELECT role FROM admin_roles WHERE user_id = $1 AND is_active = true',
    [userId]
  );
  return r.rows.length > 0 ? r.rows[0].role : 'user';
};

const sendOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone_number, country_code = '+250' } = req.body;
    const digits = phone_number.replace(/\D/g, '');
    const fullPhone = phone_number.startsWith('+')
      ? `+${digits}`
      : `${country_code}${digits}`;

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP
    otpStore.set(fullPhone, { otp, expiresAt });

    if (twilioEnabled) {
      await twilioClient.messages.create({
        body: `Your Isoko Academy verification code is: ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: fullPhone
      });
      res.json({
        message: 'OTP sent successfully',
        phone: fullPhone
      });
    } else {
      // Dev mode: no SMS provider configured
      console.log(`[auth] DEV OTP for ${fullPhone}: ${otp} (or use universal dev code ${DEV_OTP})`);
      res.json({
        message: 'OTP sent successfully (dev mode - check server log)',
        phone: fullPhone,
        dev_otp: otp
      });
    }
  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone_number, code } = req.body;
    const digits = phone_number.replace(/\D/g, '');
    const fullPhone = `+${digits}`;

    // Check OTP
    const stored = otpStore.get(fullPhone);
    const devBypass = !twilioEnabled && code === DEV_OTP;

    if (!devBypass) {
      if (!stored) {
        return res.status(400).json({ error: 'OTP not found or expired' });
      }
      if (stored.otp !== code) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }
      if (new Date() > stored.expiresAt) {
        otpStore.delete(fullPhone);
        return res.status(400).json({ error: 'OTP expired' });
      }
      otpStore.delete(fullPhone);
    }

    // Check if user exists
    const userResult = await db.query(
      'SELECT * FROM users WHERE phone_number = $1',
      [fullPhone]
    );

    let user;

    if (userResult.rows.length === 0) {
      // Guardrail: users under 18 are refused (checked at first signup)
      const { date_of_birth } = req.body;
      if (date_of_birth) {
        const dob = new Date(date_of_birth);
        const age = (Date.now() - dob.getTime()) / (365.25 * 864e5);
        if (dob.toString() === 'Invalid Date' || age < 18) {
          return res.status(403).json({
            error: 'You must be 18 or older to use Isoko Academy',
            code: 'UNDER_18',
          });
        }
      }

      // Create new user
      const newUserResult = await db.query(
        `INSERT INTO users (phone_number, preferred_language, date_of_birth)
         VALUES ($1, 'en', $2)
         RETURNING *`,
        [fullPhone, date_of_birth || null]
      );

      user = newUserResult.rows[0];

      // Create sandbox account
      await db.query(
        `INSERT INTO sandbox_accounts (user_id, balance_usd, starting_balance_usd)
         VALUES ($1, 10000.00, 10000.00)`,
        [user.id]
      );

      // Create user levels
      await db.query(
        `INSERT INTO user_levels (user_id, current_level, unlocked_levels)
         VALUES ($1, 0, ARRAY[0])`,
        [user.id]
      );

      // Create auxx limits + streaks rows
      await db.query('INSERT INTO auxx_purchase_limits (user_id) VALUES ($1)', [user.id]);
      await db.query('INSERT INTO user_streaks (user_id) VALUES ($1)', [user.id]);

      // Welcome AUXX bonus
      await db.query(
        `INSERT INTO auxx_ledger (user_id, transaction_type, amount_auxx, balance_after_auxx, description)
         VALUES ($1, 'bonus', 5000, 5000, 'Welcome bonus')`,
        [user.id]
      );
    } else {
      user = userResult.rows[0];

      if (user.is_blocked) {
        return res.status(403).json({ error: 'Account is blocked', reason: user.blocked_reason });
      }
    }

    // Update last active
    await db.query(
      'UPDATE users SET last_active_at = NOW() WHERE id = $1',
      [user.id]
    );

    const role = await getUserRole(user.id);
    const levelRow = await db.query(
      'SELECT current_level, total_xp, readiness_score FROM user_levels WHERE user_id = $1',
      [user.id]
    );

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        phone_number: user.phone_number,
        role
      },
      process.env.JWT_SECRET || 'dev-secret-change-me',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        phone_number: user.phone_number,
        full_name: user.full_name,
        preferred_language: user.preferred_language,
        role,
        current_level: levelRow.rows[0]?.current_level ?? 0,
        total_xp: levelRow.rows[0]?.total_xp ?? 0,
        readiness_score: levelRow.rows[0]?.readiness_score ?? 0
      }
    });
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');

    // Check if user still exists
    const userResult = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const role = await getUserRole(decoded.id);

    // Generate new token
    const newToken = jwt.sign(
      {
        id: userResult.rows[0].id,
        phone_number: userResult.rows[0].phone_number,
        role
      },
      process.env.JWT_SECRET || 'dev-secret-change-me',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const bcrypt = require('bcryptjs');

// ---- Email + password auth (Supabase-style normal signup) ----

const signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, password, full_name, date_of_birth, phone_number } = req.body;

    if (date_of_birth) {
      const dob = new Date(date_of_birth);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date_of_birth) || dob.toString() === 'Invalid Date' || isNaN(dob.getTime())) {
        return res.status(400).json({ error: 'Date of birth must be YYYY-MM-DD', code: 'BAD_DOB' });
      }
      const age = (Date.now() - dob.getTime()) / (365.25 * 864e5);
      if (age < 18) return res.status(403).json({ error: 'You must be 18 or older', code: 'UNDER_18' });
    }
    const existing = await db.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rows.length) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    // phone_number column is NOT NULL VARCHAR(20) — email users get a compact placeholder
    const phonePlaceholder = phone_number || `e_${require('crypto').randomBytes(8).toString('hex')}`;
    const r = await db.query(
      `INSERT INTO users (email, phone_number, password_hash, full_name, date_of_birth, country, preferred_language)
       VALUES ($1,$2,$3,$4,$5,$6,'en') RETURNING *`,
      [email, phonePlaceholder, hash, full_name || null, date_of_birth || null, req.body.country || 'RW']
    );
    const user = r.rows[0];
    await db.query('INSERT INTO sandbox_accounts (user_id) VALUES ($1)', [user.id]);
    await db.query('INSERT INTO user_levels (user_id, current_level, unlocked_levels) VALUES ($1,0,ARRAY[0])', [user.id]);
    await db.query('INSERT INTO auxx_purchase_limits (user_id) VALUES ($1)', [user.id]);
    await db.query('INSERT INTO user_streaks (user_id) VALUES ($1)', [user.id]);
    await db.query(`INSERT INTO auxx_ledger (user_id, transaction_type, amount_auxx, balance_after_auxx, description) VALUES ($1,'bonus',5000,5000,'Welcome bonus')`, [user.id]);

    const role = await getUserRole(user.id);
    const token = jwt.sign({ id: user.id, phone_number: user.phone_number, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.status(201).json({ token, user: { id: user.id, email, role } });
  } catch (e) {
    console.error('signup:', e);
    res.status(500).json({ error: 'Signup failed' });
  }
};

// per-IP failed-login lockout: 5 fails -> 60s
const loginFails = new Map();
const failKey = (req) => `${req.ip}:${String(req.body?.email || '').toLowerCase()}`;

const login = async (req, res) => {
  try {
    const k = failKey(req);
    const rec = loginFails.get(k);
    if (rec?.until && rec.until > Date.now()) {
      return res.status(429).json({ error: `Too many attempts. Wait ${Math.ceil((rec.until - Date.now()) / 1000)}s.`, retry_after: Math.ceil((rec.until - Date.now()) / 1000) });
    }
    const { email, password } = req.body;
    const r = await db.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = r.rows[0];
    if (!user || !user.password_hash || !(await bcrypt.compare(password, user.password_hash))) {
      const n = (rec?.count || 0) + 1;
      loginFails.set(k, { count: n, until: n >= 5 ? Date.now() + 60000 : null });
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    loginFails.delete(k);
    if (user.is_blocked) return res.status(403).json({ error: 'Account is blocked' });
    await db.query('UPDATE users SET last_active_at=NOW() WHERE id=$1', [user.id]);
    const role = await getUserRole(user.id);
    const token = jwt.sign({ id: user.id, phone_number: user.phone_number, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ token, user: { id: user.id, email, role } });
  } catch (e) {
    console.error('login:', e);
    res.status(500).json({ error: 'Login failed' });
  }
};

// ---- Password reset ----
// POST /auth/forgot-password { email } — issues a reset token (dev: returned in response; prod: emailed)
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const r = await db.query('SELECT id FROM users WHERE email=$1', [email]);
  // Always respond ok to avoid account enumeration
  if (!r.rows[0]) return res.json({ message: 'If that email exists, a reset link was sent' });
  const token = require('crypto').randomBytes(24).toString('hex');
  await db.query('UPDATE users SET password_reset_token=$1, password_reset_expires=NOW()+INTERVAL \'1 hour\' WHERE id=$2', [token, r.rows[0].id]);
  res.json({ message: 'If that email exists, a reset link was sent', dev_reset_token: process.env.NODE_ENV !== 'production' ? token : undefined });
};

// POST /auth/reset-password { token, password }
const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const r = await db.query(
    `SELECT id FROM users WHERE password_reset_token=$1 AND password_reset_expires > NOW()`, [token]);
  if (!r.rows[0]) return res.status(400).json({ error: 'Invalid or expired reset link' });
  const hash = await bcrypt.hash(password, 10);
  await db.query('UPDATE users SET password_hash=$1, password_reset_token=NULL, password_reset_expires=NULL WHERE id=$2', [hash, r.rows[0].id]);
  res.json({ message: 'Password updated. You can log in now.' });
};

const logout = async (req, res) => {
  // Stateless JWT: client discards the token.
  res.json({ message: 'Logged out successfully' });
};

module.exports = {
  sendOTP,
  verifyOTP,
  refreshToken,
  logout,
  signup,
  login,
  forgotPassword,
  resetPassword
};
