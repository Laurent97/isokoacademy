-- ============================================================
-- ISOKO ACADEMY - DATABASE SCHEMA (Supabase/PostgreSQL)
-- ============================================================
-- This schema supports the full v1 feature set:
-- - User auth (phone + OTP)
-- - 6-level learning path (L0-L5)
-- - Sandbox simulator with trades
-- - Exams (MCQ + practical)
-- - AUXX economy with ledger
-- - AI coach with cost tracking
-- - Admin roles and audit log
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

DO $$ BEGIN CREATE TYPE user_role AS ENUM ('user', 'support', 'content_admin', 'finance', 'super_admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE language_code AS ENUM ('en', 'rw'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE lesson_status AS ENUM ('locked', 'in_progress', 'completed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE order_type AS ENUM ('market', 'limit', 'stop'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE order_side AS ENUM ('buy', 'sell'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE order_status AS ENUM ('pending', 'filled', 'closed', 'cancelled', 'partial', 'rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE exam_type AS ENUM ('mcq', 'practical'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE exam_attempt_status AS ENUM ('in_progress', 'passed', 'failed', 'expired'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE auxx_transaction_type AS ENUM ('purchase', 'spend', 'refund', 'bonus', 'penalty'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE content_state AS ENUM ('draft', 'review', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'view', 'block', 'unblock', 'reset'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- USERS & AUTH
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    password_reset_token VARCHAR(128),
    password_reset_expires TIMESTAMPTZ,
    country VARCHAR(4) DEFAULT 'RW',
    full_name VARCHAR(255),
    date_of_birth DATE,
    kyc_level INTEGER DEFAULT 0 CHECK (kyc_level >= 0 AND kyc_level <= 2),
    kyc_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    is_blocked BOOLEAN DEFAULT FALSE,
    blocked_reason TEXT,
    preferred_language language_code DEFAULT 'en'
);

-- User sandbox account (virtual funds)
CREATE TABLE IF NOT EXISTS sandbox_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    balance_usd DECIMAL(15, 2) DEFAULT 10000.00 NOT NULL,
    starting_balance_usd DECIMAL(15, 2) DEFAULT 10000.00 NOT NULL,
    reset_count INTEGER DEFAULT 0,
    last_reset_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- User overall level
CREATE TABLE IF NOT EXISTS user_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    current_level INTEGER DEFAULT 0 CHECK (current_level >= 0 AND current_level <= 5),
    unlocked_levels INTEGER[] DEFAULT ARRAY[0],
    readiness_score DECIMAL(5, 2) DEFAULT 0.00 CHECK (readiness_score >= 0 AND readiness_score <= 100),
    readiness_streak_days INTEGER DEFAULT 0,
    readiness_last_check DATE,
    broker_ready BOOLEAN DEFAULT FALSE,
    total_xp INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONTENT - LESSONS & QUIZZES
-- ============================================================

CREATE TABLE IF NOT EXISTS levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level_number INTEGER UNIQUE CHECK (level_number >= 0 AND level_number <= 5),
    title_en VARCHAR(255) NOT NULL,
    title_rw VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_rw TEXT,
    exam_pass_mark INTEGER DEFAULT 70 CHECK (exam_pass_mark >= 0 AND exam_pass_mark <= 100),
    exam_time_limit_minutes INTEGER DEFAULT 15,
    exam_cooldown_hours INTEGER DEFAULT 24,
    exam_max_attempts INTEGER DEFAULT 3,
    order_index INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level_id UUID REFERENCES levels(id) ON DELETE CASCADE NOT NULL,
    lesson_number INTEGER NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    title_rw VARCHAR(255) NOT NULL,
    content_en TEXT NOT NULL CHECK (LENGTH(content_en) <= 4000), -- Max ~200 words per spec
    content_rw TEXT NOT NULL,
    animation_url VARCHAR(500),
    diagram_url VARCHAR(500),
    duration_minutes INTEGER DEFAULT 5 CHECK (duration_minutes <= 5),
    order_index INTEGER,
    content_trust_score INTEGER DEFAULT 0 CHECK (content_trust_score >= 0 AND content_trust_score <= 100),
    state content_state DEFAULT 'draft',
    native_speaker_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(level_id, lesson_number)
);

-- User progress through levels (references lessons, must come after it)
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    level INTEGER CHECK (level >= 0 AND level <= 5) NOT NULL,
    lesson_id UUID REFERENCES lessons(id),
    status lesson_status DEFAULT 'locked',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    xp_earned INTEGER DEFAULT 0,
    UNIQUE(user_id, level, lesson_id)
);

-- Lesson mini quizzes (3 questions per lesson)
CREATE TABLE IF NOT EXISTS lesson_quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
    question_en TEXT NOT NULL,
    question_rw TEXT NOT NULL,
    options_en JSONB NOT NULL, -- Array of 4 options
    options_rw JSONB NOT NULL,
    correct_index INTEGER CHECK (correct_index >= 0 AND correct_index <= 3),
    explanation_en TEXT,
    explanation_rw TEXT,
    order_index INTEGER,
    UNIQUE(lesson_id, order_index)
);

-- Glossary terms
CREATE TABLE IF NOT EXISTS glossary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    term VARCHAR(100) UNIQUE NOT NULL,
    definition_en TEXT NOT NULL,
    definition_rw TEXT NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EXAMS
-- ============================================================

-- MCQ question banks (20 questions per level)
CREATE TABLE IF NOT EXISTS mcq_question_banks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level_id UUID REFERENCES levels(id) ON DELETE CASCADE NOT NULL,
    lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL, -- which lesson this question tests
    question_en TEXT NOT NULL,
    question_rw TEXT NOT NULL,
    options_en JSONB NOT NULL,
    options_rw JSONB NOT NULL,
    correct_index INTEGER CHECK (correct_index >= 0 AND correct_index <= 3),
    explanation_en TEXT,
    explanation_rw TEXT,
    difficulty VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Practical exam tasks with rubrics
CREATE TABLE IF NOT EXISTS practical_exam_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level_id UUID REFERENCES levels(id) ON DELETE CASCADE NOT NULL,
    task_number INTEGER NOT NULL,
    prompt_en TEXT NOT NULL,
    prompt_rw TEXT NOT NULL,
    rubric JSONB NOT NULL, -- Rubric schema as defined in spec
    pass_threshold DECIMAL(3, 2) DEFAULT 0.70 CHECK (pass_threshold >= 0 AND pass_threshold <= 1),
    time_limit_minutes INTEGER DEFAULT 30,
    UNIQUE(level_id, task_number)
);

-- Exam attempts
CREATE TABLE IF NOT EXISTS exam_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    level_id UUID REFERENCES levels(id) ON DELETE CASCADE NOT NULL,
    exam_type exam_type NOT NULL,
    task_id UUID REFERENCES practical_exam_tasks(id) ON DELETE SET NULL, -- NULL for MCQ
    status exam_attempt_status DEFAULT 'in_progress',
    score DECIMAL(5, 2),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    time_taken_seconds INTEGER,
    answers JSONB, -- User's answers
    feedback JSONB, -- AI-generated feedback text
    UNIQUE(user_id, level_id, exam_type, started_at)
);

-- ============================================================
-- SANDBOX SIMULATOR
-- ============================================================

-- Trading pairs
CREATE TABLE IF NOT EXISTS trading_pairs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) UNIQUE NOT NULL, -- e.g., XAU/USD, EUR/USD
    base_currency VARCHAR(10) NOT NULL,
    quote_currency VARCHAR(10) NOT NULL,
    pip_location INTEGER NOT NULL, -- Decimal places for pip calculation
    lot_size DECIMAL(15, 8) NOT NULL, -- Standard lot size
    is_active BOOLEAN DEFAULT TRUE,
    spread_pips DECIMAL(10, 1) DEFAULT 1.0,
    max_leverage INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sandbox orders
CREATE TABLE IF NOT EXISTS sandbox_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    sandbox_account_id UUID REFERENCES sandbox_accounts(id) ON DELETE CASCADE NOT NULL,
    pair_id UUID REFERENCES trading_pairs(id) ON DELETE CASCADE NOT NULL,
    order_type order_type NOT NULL,
    order_side order_side NOT NULL,
    order_status order_status DEFAULT 'pending',
    lot_size DECIMAL(15, 8) NOT NULL,
    entry_price DECIMAL(15, 5),
    stop_loss_price DECIMAL(15, 5),
    take_profit_price DECIMAL(15, 5),
    trailing_stop_pips DECIMAL(10, 2),
    risk_percent DECIMAL(5, 2), -- Risk as % of account
    risk_reward_ratio DECIMAL(5, 2),
    margin_used DECIMAL(15, 2),
    pip_value DECIMAL(15, 5),
    filled_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    close_price DECIMAL(15, 5),
    profit_loss DECIMAL(15, 2),
    profit_loss_pips DECIMAL(10, 2),
    journal_entry TEXT, -- User's reason for trade
    ai_feedback TEXT, -- AI coach feedback
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market replay datasets
CREATE TABLE IF NOT EXISTS market_replay_datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(100), -- e.g., NFP, CPI, CB decision, gold spike
    symbol VARCHAR(20) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    data_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User replay sessions
CREATE TABLE IF NOT EXISTS replay_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    dataset_id UUID REFERENCES market_replay_datasets(id) ON DELETE CASCADE NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    speed_multiplier INTEGER DEFAULT 1, -- 1x, 5x, step-through
    orders_placed INTEGER DEFAULT 0
);

-- ============================================================
-- AUXX ECONOMY
-- ============================================================

-- AUXX configuration
CREATE TABLE IF NOT EXISTS auxx_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usdt_rate DECIMAL(10, 2) DEFAULT 0.005 NOT NULL, -- 1 AUXX = 0.005 USDT (1,000 AUXX = 5 USDT)
    starting_sandbox_usd DECIMAL(15, 2) DEFAULT 10000.00,
    daily_free_reset_auxx INTEGER DEFAULT 2000,
    max_paid_refills_per_week INTEGER DEFAULT 2,
    max_paid_refills_per_month INTEGER DEFAULT 3,
    refill_cooldown_hours INTEGER DEFAULT 48,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUXX ledger (double-entry, append-only)
CREATE TABLE IF NOT EXISTS auxx_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    transaction_type auxx_transaction_type NOT NULL,
    amount_auxx INTEGER NOT NULL, -- Positive for credit, negative for debit
    amount_usdt DECIMAL(15, 2), -- USDT equivalent for purchases
    balance_after_auxx INTEGER NOT NULL,
    description TEXT,
    reference_id UUID, -- Related order, exam attempt, etc.
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_reversible BOOLEAN DEFAULT FALSE -- Super admin can reverse only if true
);

-- Crypto deposits
CREATE TABLE IF NOT EXISTS crypto_deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    transaction_hash VARCHAR(100) UNIQUE,
    amount_usdt DECIMAL(15, 2) NOT NULL,
    auxx_credited INTEGER NOT NULL,
    confirmations INTEGER DEFAULT 0,
    required_confirmations INTEGER DEFAULT 20,
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, failed, manual_review
    wallet_address VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    failure_reason TEXT
);

-- AUXX purchase limits tracking
CREATE TABLE IF NOT EXISTS auxx_purchase_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    lifetime_usdt_purchased DECIMAL(15, 2) DEFAULT 0.00,
    current_month_usdt_purchased DECIMAL(15, 2) DEFAULT 0.00,
    current_week_refills INTEGER DEFAULT 0,
    current_month_refills INTEGER DEFAULT 0,
    last_refill_at TIMESTAMPTZ,
    last_zero_balance_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI COACH
-- ============================================================

-- AI interactions (logged for compliance)
CREATE TABLE IF NOT EXISTS ai_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    feature VARCHAR(50) NOT NULL, -- lesson_explainer, trade_reviewer, study_plan, etc.
    input_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of input
    input_text TEXT,
    output_text TEXT,
    output_hash VARCHAR(64) NOT NULL,
    tokens_used INTEGER,
    cost_usd DECIMAL(10, 6),
    is_flagged BOOLEAN DEFAULT FALSE, -- Flagged for admin review
    flag_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI daily cost tracking per user
CREATE TABLE IF NOT EXISTS ai_daily_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    calls_made INTEGER DEFAULT 0,
    total_cost_usd DECIMAL(10, 6) DEFAULT 0.00,
    UNIQUE(user_id, date)
);

-- AI configuration
CREATE TABLE IF NOT EXISTS ai_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature VARCHAR(50) UNIQUE NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    max_calls_per_user_per_day INTEGER DEFAULT 20,
    max_cost_per_call_usd DECIMAL(10, 6) DEFAULT 0.05,
    system_prompt TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GAMIFICATION
-- ============================================================

-- XP and badges
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    badge_id VARCHAR(100) NOT NULL,
    badge_name_en VARCHAR(255) NOT NULL,
    badge_name_rw VARCHAR(255) NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Streaks
CREATE TABLE IF NOT EXISTS user_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    current_streak_days INTEGER DEFAULT 0,
    longest_streak_days INTEGER DEFAULT 0,
    last_activity_date DATE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly leaderboard (discipline-based)
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    week_start_date DATE NOT NULL,
    discipline_score DECIMAL(5, 2) NOT NULL, -- Based on rule-following, not profit
    total_trades INTEGER DEFAULT 0,
    risk_violations INTEGER DEFAULT 0,
    sl_missing_count INTEGER DEFAULT 0,
    rank INTEGER,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, week_start_date)
);

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    level_id UUID REFERENCES levels(id) ON DELETE CASCADE NOT NULL,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    verification_url VARCHAR(500),
    share_url VARCHAR(500),
    final_score DECIMAL(5,2),
    pdf_url VARCHAR(500),
    revoked_at TIMESTAMPTZ,
    revoked_reason TEXT,
    download_count INTEGER DEFAULT 0,
    UNIQUE(user_id, level_id)
);

-- ============================================================
-- ADMIN & AUDIT
-- ============================================================

-- Admin role assignments (server-side enforced)
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    role user_role NOT NULL,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Audit log (immutable)
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    role user_role NOT NULL,
    action audit_action NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    reason TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_reversible BOOLEAN DEFAULT FALSE
);

-- Support tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open', -- open, in_progress, resolved, closed
    priority VARCHAR(20) DEFAULT 'normal',
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(50) NOT NULL, -- push, sms, email, in_app
    title_en VARCHAR(255) NOT NULL,
    title_rw VARCHAR(255) NOT NULL,
    body_en TEXT NOT NULL,
    body_rw TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ANALYTICS
-- ============================================================

-- Daily analytics (aggregated)
CREATE TABLE IF NOT EXISTS daily_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    new_signups INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    exams_passed INTEGER DEFAULT 0,
    exams_failed INTEGER DEFAULT 0,
    auxx_purchased_usdt DECIMAL(15, 2) DEFAULT 0.00,
    ai_calls_made INTEGER DEFAULT 0,
    ai_cost_usd DECIMAL(10, 6) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Progress
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_level ON user_progress(level);

-- Orders
CREATE INDEX IF NOT EXISTS idx_sandbox_orders_user ON sandbox_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_sandbox_orders_status ON sandbox_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_sandbox_orders_created_at ON sandbox_orders(created_at);

-- AUXX
CREATE INDEX IF NOT EXISTS idx_auxx_ledger_user ON auxx_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_auxx_ledger_created_at ON auxx_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_crypto_deposits_user ON crypto_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_deposits_status ON crypto_deposits(status);

-- AI
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user ON ai_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_flagged ON ai_interactions(is_flagged);
CREATE INDEX IF NOT EXISTS idx_ai_daily_costs_user_date ON ai_daily_costs(user_id, date);

-- Audit
CREATE INDEX IF NOT EXISTS idx_audit_log_admin ON audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all user-facing tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sandbox_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE sandbox_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE auxx_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE auxx_purchase_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_daily_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE replay_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users: read own, admins read all
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE admin_roles.user_id = auth.uid()::uuid
            AND admin_roles.is_active = true
            AND admin_roles.role IN ('support', 'content_admin', 'finance', 'super_admin')
        )
    );

-- Sandbox accounts: users own, admins all
DROP POLICY IF EXISTS "Users can view own sandbox" ON sandbox_accounts;
CREATE POLICY "Users can view own sandbox" ON sandbox_accounts
    FOR SELECT USING (user_id = auth.uid()::uuid);

DROP POLICY IF EXISTS "Admins can view all sandboxes" ON sandbox_accounts;
CREATE POLICY "Admins can view all sandboxes" ON sandbox_accounts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE admin_roles.user_id = auth.uid()::uuid
            AND admin_roles.is_active = true
            AND admin_roles.role IN ('support', 'finance', 'super_admin')
        )
    );

-- Orders: users own, admins all
DROP POLICY IF EXISTS "Users can view own orders" ON sandbox_orders;
CREATE POLICY "Users can view own orders" ON sandbox_orders
    FOR SELECT USING (user_id = auth.uid()::uuid);

DROP POLICY IF EXISTS "Admins can view all orders" ON sandbox_orders;
CREATE POLICY "Admins can view all orders" ON sandbox_orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE admin_roles.user_id = auth.uid()::uuid
            AND admin_roles.is_active = true
            AND admin_roles.role IN ('support', 'finance', 'super_admin')
        )
    );

-- AUXX ledger: users own read-only, admins full
DROP POLICY IF EXISTS "Users can view own ledger" ON auxx_ledger;
CREATE POLICY "Users can view own ledger" ON auxx_ledger
    FOR SELECT USING (user_id = auth.uid()::uuid);

DROP POLICY IF EXISTS "Admins can view all ledger" ON auxx_ledger;
CREATE POLICY "Admins can view all ledger" ON auxx_ledger
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE admin_roles.user_id = auth.uid()::uuid
            AND admin_roles.is_active = true
            AND admin_roles.role IN ('finance', 'super_admin')
        )
    );

-- Crypto deposits: users own, finance admins all
DROP POLICY IF EXISTS "Users can view own deposits" ON crypto_deposits;
CREATE POLICY "Users can view own deposits" ON crypto_deposits
    FOR SELECT USING (user_id = auth.uid()::uuid);

DROP POLICY IF EXISTS "Finance admins can view all deposits" ON crypto_deposits;
CREATE POLICY "Finance admins can view all deposits" ON crypto_deposits
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE admin_roles.user_id = auth.uid()::uuid
            AND admin_roles.is_active = true
            AND admin_roles.role IN ('finance', 'super_admin')
        )
    );

-- AI interactions: users own, admins view flagged
DROP POLICY IF EXISTS "Users can view own AI interactions" ON ai_interactions;
CREATE POLICY "Users can view own AI interactions" ON ai_interactions
    FOR SELECT USING (user_id = auth.uid()::uuid);

DROP POLICY IF EXISTS "Admins can view flagged AI interactions" ON ai_interactions;
CREATE POLICY "Admins can view flagged AI interactions" ON ai_interactions
    FOR SELECT USING (
        is_flagged = true AND
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE admin_roles.user_id = auth.uid()::uuid
            AND admin_roles.is_active = true
            AND admin_roles.role IN ('content_admin', 'super_admin')
        )
    );

-- Audit log: only super admins can read, service role can insert
DROP POLICY IF EXISTS "Super admins can view audit log" ON audit_log;
CREATE POLICY "Super admins can view audit log" ON audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE admin_roles.user_id = auth.uid()::uuid
            AND admin_roles.is_active = true
            AND admin_roles.role = 'super_admin'
        )
    );

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sandbox_accounts_updated_at ON sandbox_accounts;
CREATE TRIGGER update_sandbox_accounts_updated_at BEFORE UPDATE ON sandbox_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_levels_updated_at ON user_levels;
CREATE TRIGGER update_user_levels_updated_at BEFORE UPDATE ON user_levels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_auxx_config_updated_at ON auxx_config;
CREATE TRIGGER update_auxx_config_updated_at BEFORE UPDATE ON auxx_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate readiness score (deterministic formula)
CREATE OR REPLACE FUNCTION calculate_readiness_score(p_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    v_exam_avg DECIMAL;
    v_practical_pass_rate DECIMAL;
    v_risk_discipline DECIMAL;
    v_consistency_days INTEGER;
    v_journal_quality DECIMAL;
    v_drawdown_control DECIMAL;
    v_score DECIMAL;
BEGIN
    -- Exam average (weighted 25%)
    SELECT COALESCE(AVG(score), 0)
    INTO v_exam_avg
    FROM exam_attempts
    WHERE user_id = p_user_id
    AND exam_type = 'mcq'
    AND status = 'passed';

    -- Practical pass rate (weighted 20%)
    SELECT COALESCE(
        (COUNT(*) FILTER (WHERE status = 'passed')::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
        0
    )
    INTO v_practical_pass_rate
    FROM exam_attempts
    WHERE user_id = p_user_id
    AND exam_type = 'practical';

    -- Risk discipline: % of trades within 1-2% risk (weighted 25%)
    SELECT COALESCE(
        (COUNT(*) FILTER (WHERE risk_percent >= 1 AND risk_percent <= 2)::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
        0
    )
    INTO v_risk_discipline
    FROM sandbox_orders
    WHERE user_id = p_user_id
    AND order_status = 'closed';

    -- Consistency: days traded in last 30 (weighted 15%)
    SELECT COALESCE(COUNT(DISTINCT DATE(created_at)), 0)
    INTO v_consistency_days
    FROM sandbox_orders
    WHERE user_id = p_user_id
    AND created_at >= NOW() - INTERVAL '30 days';

    -- Journal quality: AI-scored entries (weighted 10%)
    -- Simplified: percentage of trades with journal entries
    SELECT COALESCE(
        (COUNT(*) FILTER (WHERE journal_entry IS NOT NULL AND LENGTH(journal_entry) > 10)::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
        0
    )
    INTO v_journal_quality
    FROM sandbox_orders
    WHERE user_id = p_user_id
    AND order_status = 'closed';

    -- Drawdown control: max drawdown ≤ 10% (weighted 5%)
    -- Simplified: 100 if no drawdown > 10%, 0 otherwise
    SELECT COALESCE(
        CASE
            WHEN MAX_DRAWDOWN <= 10 THEN 100
            ELSE 0
        END,
        0
    )
    INTO v_drawdown_control
    FROM (
        SELECT
            (MAX(equity_curve) - MIN(equity_curve)) / NULLIF(MAX(equity_curve), 0) * 100 AS MAX_DRAWDOWN
        FROM (
            SELECT
                SUM(profit_loss) OVER (ORDER BY created_at) AS equity_curve
            FROM sandbox_orders
            WHERE user_id = p_user_id
            AND order_status = 'closed'
        ) equity
    ) drawdown;

    -- Calculate final score
    v_score := (v_exam_avg * 0.25) +
               (v_practical_pass_rate * 0.20) +
               (v_risk_discipline * 0.25) +
               (LEAST(v_consistency_days, 30) / 30.0 * 100 * 0.15) +
               (v_journal_quality * 0.10) +
               (v_drawdown_control * 0.05);

    RETURN ROUND(v_score, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to update user readiness score
CREATE OR REPLACE FUNCTION update_user_readiness_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_levels
    SET readiness_score = calculate_readiness_score(NEW.user_id),
        updated_at = NOW()
    WHERE user_id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger readiness score update on order close and exam completion
DROP TRIGGER IF EXISTS update_readiness_on_order ON sandbox_orders;
CREATE TRIGGER update_readiness_on_order
    AFTER INSERT OR UPDATE ON sandbox_orders
    FOR EACH ROW
    WHEN (NEW.order_status = 'closed')
    EXECUTE FUNCTION update_user_readiness_score();

DROP TRIGGER IF EXISTS update_readiness_on_exam ON exam_attempts;
CREATE TRIGGER update_readiness_on_exam
    AFTER UPDATE ON exam_attempts
    FOR EACH ROW
    WHEN (NEW.status IN ('passed', 'failed'))
    EXECUTE FUNCTION update_user_readiness_score();

-- ============================================================
-- INITIAL DATA
-- ============================================================

-- Insert default AUXX config
INSERT INTO auxx_config (usdt_rate, starting_sandbox_usd, daily_free_reset_auxx, max_paid_refills_per_week, max_paid_refills_per_month, refill_cooldown_hours)
VALUES (0.005, 10000.00, 2000, 2, 3, 48) ON CONFLICT DO NOTHING;

-- Insert trading pairs
INSERT INTO trading_pairs (symbol, base_currency, quote_currency, pip_location, lot_size, spread_pips, max_leverage) VALUES
('XAU/USD', 'XAU', 'USD', 2, 100, 0.5, 100),
('EUR/USD', 'EUR', 'USD', 4, 100000, 1.0, 100),
('GBP/USD', 'GBP', 'USD', 4, 100000, 1.5, 100),
('USD/JPY', 'USD', 'JPY', 2, 100000, 1.0, 100),
('USD/RWF', 'USD', 'RWF', 0, 100000, 50.0, 50) ON CONFLICT DO NOTHING;

-- Insert AI config
INSERT INTO ai_config (feature, is_enabled, max_calls_per_user_per_day, max_cost_per_call_usd, system_prompt) VALUES
('lesson_explainer', true, 20, 0.05, 'You are an educational AI assistant for Isoko Academy. Explain trading concepts in simple language. Never give financial advice. Always label responses as educational only.'),
('trade_reviewer', true, 20, 0.05, 'You are an educational AI coach for Isoko Academy. Review practice trades and provide feedback on risk management. Never promise profit. Always label responses as educational only.'),
('study_plan', true, 5, 0.05, 'You are an educational AI planner for Isoko Academy. Create study plans based on user performance. Never give financial advice. Always label responses as educational only.'),
('question_generator', true, 5, 0.05, 'You are an educational AI content generator for Isoko Academy. Generate quiz questions for admin approval. Never give financial advice. Always label responses as educational only.') ON CONFLICT DO NOTHING;

-- ============================================================
-- END OF SCHEMA
-- ============================================================
