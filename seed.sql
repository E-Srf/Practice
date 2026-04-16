-- ============================================================
--  SEED DATA — Risk Management Platform
-- ============================================================


-- ============================================================
--  USERS
-- ============================================================

INSERT INTO users (email, password_hash, full_name, role, email_verified) VALUES
('admin@riskplatform.com',  '$2b$12$adminhashedpassword',   'Admin User',    'admin',   TRUE),
('john.doe@gmail.com',      '$2b$12$johnhashedpassword',    'John Doe',      'trader',  TRUE),
('sara.malik@gmail.com',    '$2b$12$sarahashedpassword',    'Sara Malik',    'trader',  TRUE),
('carlos.vega@gmail.com',   '$2b$12$carloshashedpassword',  'Carlos Vega',   'trader',  FALSE),
('support@riskplatform.com','$2b$12$supporthashedpassword', 'Support Agent', 'support', TRUE);


-- ============================================================
--  CHALLENGES
-- ============================================================

INSERT INTO challenges (name, description, account_size, price, phase, duration_days, is_active) VALUES
('$10K Phase 1',  'Standard evaluation phase 1', 10000, 99,  1, 30, TRUE),
('$10K Phase 2',  'Standard evaluation phase 2', 10000, 0,   2, 60, TRUE),
('$25K Phase 1',  'Pro evaluation phase 1',      25000, 199, 1, 30, TRUE),
('$25K Phase 2',  'Pro evaluation phase 2',       25000, 0,   2, 60, TRUE),
('$50K Phase 1',  'Elite evaluation phase 1',    50000, 299, 1, 45, TRUE);


-- ============================================================
--  ACCOUNTS
-- ============================================================

INSERT INTO accounts (user_id, challenge_id, account_number, platform, currency, phase, status, balance, equity, initial_balance, peak_balance, expires_at) VALUES
(2, 1, 'ACC-10001', 'MT5', 'USD', 'phase1',  'active',  10450.00, 10420.00, 10000.00, 10450.00, CURRENT_TIMESTAMP + INTERVAL '20 days'),
(2, 2, 'ACC-10002', 'MT5', 'USD', 'phase2',  'active',  10800.00, 10790.00, 10000.00, 10900.00, CURRENT_TIMESTAMP + INTERVAL '45 days'),
(3, 3, 'ACC-10003', 'MT5', 'USD', 'phase1',  'active',  24500.00, 24450.00, 25000.00, 25000.00, CURRENT_TIMESTAMP + INTERVAL '15 days'),
(3, 1, 'ACC-10004', 'MT4', 'USD', 'phase1',  'breached', 8800.00,  8800.00, 10000.00,  9500.00, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(4, 5, 'ACC-10005', 'MT5', 'USD', 'phase1',  'active',  51200.00, 51100.00, 50000.00, 51200.00, CURRENT_TIMESTAMP + INTERVAL '30 days');


-- ============================================================
--  RULES
-- ============================================================

INSERT INTO rules (account_id, max_daily_loss_pct, max_total_loss_pct, profit_target_pct, trailing_drawdown_pct, max_lot_size, max_open_lots, max_open_trades, min_trading_days, news_trading_allowed, weekend_holding_allowed) VALUES
(1, 5.00, 10.00, 8.00,  5.00, 2.00, 5.00,  5, 5, FALSE, FALSE),
(2, 5.00, 10.00, 5.00,  5.00, 5.00, 10.00, 10, 5, FALSE, FALSE),
(3, 4.00, 8.00,  10.00, 4.00, 5.00, 15.00, 8, 5, FALSE, FALSE),
(4, 5.00, 10.00, 8.00,  5.00, 2.00, 5.00,  5, 5, FALSE, FALSE),
(5, 4.00, 8.00,  10.00, 4.00, 10.00,25.00, 15, 5, FALSE, FALSE);


-- ============================================================
--  TRADES
-- ============================================================

-- Account 1 (John - Phase 1, active)
INSERT INTO trades (account_id, broker_trade_id, symbol, direction, trade_type, status, lot, entry_price, exit_price, stop_loss, take_profit, commission, swap, gross_profit, open_time, close_time) VALUES
(1, 'BRK-0001', 'EURUSD', 'BUY',  'market', 'closed', 0.50, 1.08500, 1.08750, 1.08300, 1.08900, 2.50, -0.50,  125.00, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '3 hours'),
(1, 'BRK-0002', 'GBPUSD', 'SELL', 'market', 'closed', 0.30, 1.26500, 1.26200, 1.26700, 1.26000, 1.50, -0.20,   90.00, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '2 hours'),
(1, 'BRK-0003', 'USDJPY', 'BUY',  'market', 'closed', 0.20, 149.200, 148.900, 149.000, 149.600, 1.00,  0.00,  -60.00, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '1 hour'),
(1, 'BRK-0004', 'EURUSD', 'BUY',  'market', 'closed', 1.00, 1.08300, 1.08100, 1.08100, 1.08700, 5.00, -1.00, -200.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '4 hours'),
(1, 'BRK-0005', 'XAUUSD', 'BUY',  'market', 'open',   0.10, 2310.00, NULL,    2290.00, 2340.00, 1.00, -2.00,    0.00, NOW() - INTERVAL '1 hour',  NULL);

-- Account 2 (John - Phase 2, active)
INSERT INTO trades (account_id, broker_trade_id, symbol, direction, trade_type, status, lot, entry_price, exit_price, stop_loss, take_profit, commission, swap, gross_profit, open_time, close_time) VALUES
(2, 'BRK-0006', 'EURUSD', 'BUY',  'market', 'closed', 1.00, 1.07800, 1.08200, 1.07600, 1.08500, 5.00, -1.50,  400.00, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '5 hours'),
(2, 'BRK-0007', 'GBPJPY', 'SELL', 'market', 'closed', 0.50, 188.500, 187.900, 189.000, 187.000, 2.50, -3.00,  300.00, NOW() - INTERVAL '8 days',  NOW() - INTERVAL '8 days' + INTERVAL '6 hours'),
(2, 'BRK-0008', 'EURUSD', 'BUY',  'market', 'open',   0.80, 1.08100, NULL,    1.07900, 1.08500, 4.00, -2.00,    0.00, NOW() - INTERVAL '2 hours', NULL);

-- Account 3 (Sara - Phase 1, active)
INSERT INTO trades (account_id, broker_trade_id, symbol, direction, trade_type, status, lot, entry_price, exit_price, stop_loss, take_profit, commission, swap, gross_profit, open_time, close_time) VALUES
(3, 'BRK-0009', 'EURUSD', 'SELL', 'market', 'closed', 2.00, 1.09000, 1.08600, 1.09200, 1.08400, 10.00,-2.00,  800.00, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days' + INTERVAL '4 hours'),
(3, 'BRK-0010', 'USDJPY', 'BUY',  'market', 'closed', 1.50, 148.000, 147.500, 147.700, 149.000, 7.50, -1.00, -750.00, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '2 hours'),
(3, 'BRK-0011', 'XAUUSD', 'BUY',  'market', 'open',   0.50, 2305.00, NULL,    2285.00, 2335.00, 5.00, -8.00,    0.00, NOW() - INTERVAL '3 hours',NULL);

-- Account 4 (Sara - breached)
INSERT INTO trades (account_id, broker_trade_id, symbol, direction, trade_type, status, lot, entry_price, exit_price, stop_loss, take_profit, commission, swap, gross_profit, open_time, close_time) VALUES
(4, 'BRK-0012', 'EURUSD', 'BUY',  'market', 'closed', 2.00, 1.09500, 1.08500, 1.09200, 1.10000, 10.00,-3.00,-1000.00, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '2 hours'),
(4, 'BRK-0013', 'GBPUSD', 'BUY',  'market', 'closed', 2.00, 1.27000, 1.25800, 1.26700, 1.27500, 10.00,-4.00,-1200.00, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '3 hours');


-- ============================================================
--  EQUITY LOGS
-- ============================================================

INSERT INTO equity_logs (account_id, balance, equity, drawdown, peak_balance, logged_at) VALUES
(1, 10000.00, 10000.00, 0.00,    10000.00, NOW() - INTERVAL '5 days'),
(1, 10125.00, 10110.00, 0.00,    10125.00, NOW() - INTERVAL '4 days'),
(1, 10215.00, 10200.00, 0.00,    10215.00, NOW() - INTERVAL '3 days'),
(1, 10015.00,  9990.00, 1.96,    10215.00, NOW() - INTERVAL '2 days'),
(1, 10450.00, 10420.00, 0.00,    10450.00, NOW() - INTERVAL '1 day'),

(3, 25000.00, 25000.00, 0.00,    25000.00, NOW() - INTERVAL '6 days'),
(3, 25800.00, 25780.00, 0.00,    25800.00, NOW() - INTERVAL '5 days'),
(3, 25050.00, 24980.00, 2.91,    25800.00, NOW() - INTERVAL '3 days'),
(3, 24500.00, 24450.00, 5.23,    25800.00, NOW() - INTERVAL '1 day'),

(4, 10000.00, 10000.00, 0.00,    10000.00, NOW() - INTERVAL '7 days'),
(4,  9000.00,  8950.00, 10.00,   10000.00, NOW() - INTERVAL '5 days'),
(4,  8800.00,  8800.00, 12.00,   10000.00, NOW() - INTERVAL '4 days');


-- ============================================================
--  VIOLATIONS
-- ============================================================

INSERT INTO violations (account_id, trade_id, violation_type, description, value_at_breach, rule_limit, breached_at) VALUES
(4, 12, 'daily_loss',  'Daily loss exceeded 5% limit', 1000.00, 500.00,  NOW() - INTERVAL '5 days'),
(4, 13, 'total_loss',  'Total loss exceeded 10% limit',1200.00, 1000.00, NOW() - INTERVAL '4 days');


-- ============================================================
--  PAYOUTS
-- ============================================================

INSERT INTO payouts (account_id, amount, currency, status, payment_method, note, requested_at, processed_at, processed_by) VALUES
(2, 800.00, 'USD', 'approved', 'Bank Transfer', 'First payout approved', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 1),
(2, 500.00, 'USD', 'pending',  'Crypto - USDT', 'Awaiting review',       NOW() - INTERVAL '1 day',  NULL, NULL);


-- ============================================================
--  NOTIFICATIONS
-- ============================================================

INSERT INTO notifications (user_id, account_id, type, title, message) VALUES
(2, 1, 'warning', 'Approaching Daily Loss Limit',  'Your account ACC-10001 has used 60% of daily loss limit.'),
(2, 2, 'info',    'Payout Approved',               'Your payout of $800 has been approved and is being processed.'),
(3, 3, 'warning', 'Drawdown Alert',                'Account ACC-10003 drawdown is at 5.2% — limit is 8%.'),
(3, 4, 'breach',  'Account Breached',              'Account ACC-10004 has been breached due to total loss limit exceeded.'),
(4, 5, 'info',    'Challenge Started',             'Your $50K Phase 1 challenge is now active. Good luck!');


-- ============================================================
--  DAILY STATS
-- ============================================================

INSERT INTO daily_stats (account_id, stat_date, total_trades, winning_trades, losing_trades, gross_profit, net_profit, total_lots, daily_loss) VALUES
(1, CURRENT_DATE - 5, 1, 1, 0,  125.00,  122.00, 0.50,    0.00),
(1, CURRENT_DATE - 4, 1, 1, 0,   90.00,   88.30, 0.30,    0.00),
(1, CURRENT_DATE - 3, 1, 0, 1,  -60.00,  -61.00, 0.20,   61.00),
(1, CURRENT_DATE - 2, 1, 0, 1, -200.00, -206.00, 1.00,  206.00),
(3, CURRENT_DATE - 6, 1, 1, 0,  800.00,  788.00, 2.00,    0.00),
(3, CURRENT_DATE - 3, 1, 0, 1, -750.00, -758.50, 1.50,  758.50),
(4, CURRENT_DATE - 5, 1, 0, 1,-1000.00,-1013.00, 2.00, 1013.00),
(4, CURRENT_DATE - 4, 1, 0, 1,-1200.00,-1214.00, 2.00, 1214.00);
