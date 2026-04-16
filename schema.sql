-- ============================================================
--  RISK MANAGEMENT PLATFORM — DATABASE SCHEMA
--  PostgreSQL 14+
-- ============================================================


-- ============================================================
--  ENUMS
-- ============================================================

CREATE TYPE user_role       AS ENUM ('admin', 'trader', 'support');
CREATE TYPE account_status  AS ENUM ('active', 'passed', 'breached', 'funded', 'suspended', 'expired');
CREATE TYPE account_phase   AS ENUM ('phase1', 'phase2', 'funded');
CREATE TYPE trade_direction AS ENUM ('BUY', 'SELL');
CREATE TYPE trade_status    AS ENUM ('open', 'closed', 'cancelled');
CREATE TYPE trade_type      AS ENUM ('market', 'limit', 'stop');
CREATE TYPE payout_status   AS ENUM ('pending', 'approved', 'rejected', 'paid');
CREATE TYPE violation_type  AS ENUM ('daily_loss', 'total_loss', 'lot_size', 'trailing_drawdown', 'news_trading', 'weekend_holding', 'open_trades_limit');
CREATE TYPE platform_type   AS ENUM ('MT4', 'MT5', 'cTrader', 'DXtrade');
CREATE TYPE currency_code   AS ENUM ('USD', 'EUR', 'GBP', 'CHF');
CREATE TYPE notif_type      AS ENUM ('warning', 'breach', 'payout', 'system', 'info');


-- ============================================================
--  USERS
-- ============================================================

CREATE TABLE users (
    id                SERIAL PRIMARY KEY,
    email             TEXT UNIQUE NOT NULL,
    password_hash     TEXT NOT NULL,
    full_name         TEXT NOT NULL,
    role              user_role DEFAULT 'trader',
    email_verified    BOOLEAN DEFAULT FALSE,
    is_active         BOOLEAN DEFAULT TRUE,
    last_login        TIMESTAMP,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);


-- ============================================================
--  SESSIONS (Auth)
-- ============================================================

CREATE TABLE sessions (
    id            TEXT PRIMARY KEY,               -- UUID token
    user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address    TEXT,
    user_agent    TEXT,
    expires_at    TIMESTAMP NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);


-- ============================================================
--  CHALLENGES (Programs offered e.g. $10k Phase 1)
-- ============================================================

CREATE TABLE challenges (
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL,
    description     TEXT,
    account_size    NUMERIC NOT NULL,
    price           NUMERIC NOT NULL,
    currency        currency_code DEFAULT 'USD',
    phase           INT NOT NULL DEFAULT 1 CHECK (phase IN (1, 2)),
    duration_days   INT NOT NULL DEFAULT 30,
    is_active       BOOLEAN DEFAULT TRUE,
    rules           JSONB,                        -- extra/custom rules as JSON
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
--  ACCOUNTS
-- ============================================================

CREATE TABLE accounts (
    id               SERIAL PRIMARY KEY,
    user_id          INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id     INT REFERENCES challenges(id) ON DELETE SET NULL,
    account_number   TEXT UNIQUE NOT NULL,
    platform         platform_type DEFAULT 'MT5',
    currency         currency_code DEFAULT 'USD',
    phase            account_phase DEFAULT 'phase1',
    status           account_status DEFAULT 'active',
    balance          NUMERIC DEFAULT 0 CHECK (balance >= 0),
    equity           NUMERIC DEFAULT 0,
    initial_balance  NUMERIC NOT NULL CHECK (initial_balance > 0),
    peak_balance     NUMERIC,                     -- for trailing drawdown
    expires_at       TIMESTAMP,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_accounts_user_id    ON accounts(user_id);
CREATE INDEX idx_accounts_status     ON accounts(status);
CREATE INDEX idx_accounts_phase      ON accounts(phase);


-- ============================================================
--  RULES (Per account risk limits)
-- ============================================================

CREATE TABLE rules (
    id                        SERIAL PRIMARY KEY,
    account_id                INT UNIQUE NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    max_daily_loss_pct        NUMERIC NOT NULL CHECK (max_daily_loss_pct > 0),   -- % of balance
    max_total_loss_pct        NUMERIC NOT NULL CHECK (max_total_loss_pct > 0),   -- % of initial
    profit_target_pct         NUMERIC NOT NULL CHECK (profit_target_pct > 0),    -- % of initial
    trailing_drawdown_pct     NUMERIC,            -- % trailing from peak
    max_lot_size              NUMERIC,
    max_open_lots             NUMERIC,
    max_open_trades           INT,
    min_trading_days          INT DEFAULT 0,
    news_trading_allowed      BOOLEAN DEFAULT FALSE,
    weekend_holding_allowed   BOOLEAN DEFAULT FALSE,
    ea_allowed                BOOLEAN DEFAULT TRUE,  -- Expert Advisors
    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
--  TRADES
-- ============================================================

CREATE TABLE trades (
    id               SERIAL PRIMARY KEY,
    account_id       INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    broker_trade_id  TEXT,                         -- external broker reference
    symbol           TEXT NOT NULL,
    direction        trade_direction NOT NULL,
    trade_type       trade_type DEFAULT 'market',
    status           trade_status DEFAULT 'open',
    lot              NUMERIC NOT NULL CHECK (lot > 0),
    entry_price      NUMERIC NOT NULL,
    exit_price       NUMERIC,
    stop_loss        NUMERIC,
    take_profit      NUMERIC,
    commission       NUMERIC DEFAULT 0,
    swap             NUMERIC DEFAULT 0,
    gross_profit     NUMERIC DEFAULT 0,
    net_profit       NUMERIC GENERATED ALWAYS AS (gross_profit + swap - commission) STORED,
    open_time        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    close_time       TIMESTAMP,
    CONSTRAINT chk_close_after_open CHECK (close_time IS NULL OR close_time >= open_time)
);

CREATE INDEX idx_trades_account_id  ON trades(account_id);
CREATE INDEX idx_trades_symbol      ON trades(symbol);
CREATE INDEX idx_trades_status      ON trades(status);
CREATE INDEX idx_trades_open_time   ON trades(open_time);


-- ============================================================
--  EQUITY LOGS (Snapshot for drawdown tracking)
-- ============================================================

CREATE TABLE equity_logs (
    id           SERIAL PRIMARY KEY,
    account_id   INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    balance      NUMERIC NOT NULL,
    equity       NUMERIC NOT NULL,
    drawdown     NUMERIC,                          -- calculated at log time
    peak_balance NUMERIC,
    logged_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_equity_logs_account_id ON equity_logs(account_id);
CREATE INDEX idx_equity_logs_logged_at  ON equity_logs(logged_at);


-- ============================================================
--  VIOLATIONS (Rule breach records)
-- ============================================================

CREATE TABLE violations (
    id               SERIAL PRIMARY KEY,
    account_id       INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    trade_id         INT REFERENCES trades(id) ON DELETE SET NULL,
    violation_type   violation_type NOT NULL,
    description      TEXT,
    value_at_breach  NUMERIC,                      -- actual value that triggered it
    rule_limit       NUMERIC,                      -- what the limit was
    breached_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_violations_account_id ON violations(account_id);


-- ============================================================
--  PAYOUTS (Funded account withdrawals)
-- ============================================================

CREATE TABLE payouts (
    id             SERIAL PRIMARY KEY,
    account_id     INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    amount         NUMERIC NOT NULL CHECK (amount > 0),
    currency       currency_code DEFAULT 'USD',
    status         payout_status DEFAULT 'pending',
    payment_method TEXT,
    payment_ref    TEXT,                           -- external transaction ID
    note           TEXT,
    requested_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at   TIMESTAMP,
    processed_by   INT REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_payouts_account_id ON payouts(account_id);
CREATE INDEX idx_payouts_status     ON payouts(status);


-- ============================================================
--  NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
    id           SERIAL PRIMARY KEY,
    user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id   INT REFERENCES accounts(id) ON DELETE CASCADE,
    type         notif_type DEFAULT 'info',
    title        TEXT NOT NULL,
    message      TEXT NOT NULL,
    is_read      BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id  ON notifications(user_id);
CREATE INDEX idx_notifications_is_read  ON notifications(is_read);


-- ============================================================
--  AUDIT LOGS (Admin action trail)
-- ============================================================

CREATE TABLE audit_logs (
    id          SERIAL PRIMARY KEY,
    user_id     INT REFERENCES users(id) ON DELETE SET NULL,
    action      TEXT NOT NULL,
    table_name  TEXT,
    record_id   INT,
    old_data    JSONB,
    new_data    JSONB,
    ip_address  TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id    ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);


-- ============================================================
--  DAILY STATS (Aggregated per account per day)
-- ============================================================

CREATE TABLE daily_stats (
    id              SERIAL PRIMARY KEY,
    account_id      INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    stat_date       DATE NOT NULL,
    total_trades    INT DEFAULT 0,
    winning_trades  INT DEFAULT 0,
    losing_trades   INT DEFAULT 0,
    gross_profit    NUMERIC DEFAULT 0,
    net_profit      NUMERIC DEFAULT 0,
    total_lots      NUMERIC DEFAULT 0,
    daily_loss      NUMERIC DEFAULT 0,
    UNIQUE (account_id, stat_date)
);

CREATE INDEX idx_daily_stats_account_id ON daily_stats(account_id);
CREATE INDEX idx_daily_stats_date       ON daily_stats(stat_date);


-- ============================================================
--  AUTO-UPDATE updated_at TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_rules_updated_at
    BEFORE UPDATE ON rules
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
