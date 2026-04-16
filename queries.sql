-- ============================================================
--  RISK MANAGEMENT QUERIES
-- ============================================================


-- ============================================================
--  1. DAILY LOSS CHECK
--     Returns today's loss per account vs the allowed limit.
--     Flag accounts that are close or over the limit.
-- ============================================================

SELECT
    a.id                                          AS account_id,
    a.account_number,
    u.full_name,
    a.initial_balance,
    r.max_daily_loss_pct,
    ROUND(a.initial_balance * r.max_daily_loss_pct / 100, 2)  AS daily_loss_limit,
    COALESCE(ABS(SUM(t.net_profit)) FILTER (WHERE t.net_profit < 0), 0) AS todays_loss,
    ROUND(
        COALESCE(ABS(SUM(t.net_profit)) FILTER (WHERE t.net_profit < 0), 0)
        / (a.initial_balance * r.max_daily_loss_pct / 100) * 100, 2
    )                                             AS pct_of_limit_used,
    CASE
        WHEN COALESCE(ABS(SUM(t.net_profit)) FILTER (WHERE t.net_profit < 0), 0)
             >= a.initial_balance * r.max_daily_loss_pct / 100
        THEN 'BREACHED'
        WHEN COALESCE(ABS(SUM(t.net_profit)) FILTER (WHERE t.net_profit < 0), 0)
             >= a.initial_balance * r.max_daily_loss_pct / 100 * 0.8
        THEN 'WARNING'
        ELSE 'OK'
    END                                           AS daily_status
FROM accounts a
JOIN users u        ON u.id = a.user_id
JOIN rules r        ON r.account_id = a.id
LEFT JOIN trades t  ON t.account_id = a.id
                   AND t.status = 'closed'
                   AND DATE(t.close_time) = CURRENT_DATE
WHERE a.status = 'active'
GROUP BY a.id, a.account_number, u.full_name, a.initial_balance, r.max_daily_loss_pct
ORDER BY pct_of_limit_used DESC;


-- ============================================================
--  2. TOTAL LOSS CHECK (Max Drawdown from Initial Balance)
-- ============================================================

SELECT
    a.id                                                      AS account_id,
    a.account_number,
    u.full_name,
    a.initial_balance,
    a.balance,
    r.max_total_loss_pct,
    ROUND(a.initial_balance * r.max_total_loss_pct / 100, 2) AS total_loss_limit,
    ROUND(a.initial_balance - a.balance, 2)                  AS total_loss_so_far,
    ROUND((a.initial_balance - a.balance) / a.initial_balance * 100, 2) AS loss_pct,
    CASE
        WHEN (a.initial_balance - a.balance) >= a.initial_balance * r.max_total_loss_pct / 100
        THEN 'BREACHED'
        WHEN (a.initial_balance - a.balance) >= a.initial_balance * r.max_total_loss_pct / 100 * 0.8
        THEN 'WARNING'
        ELSE 'OK'
    END                                                       AS total_loss_status
FROM accounts a
JOIN users u ON u.id = a.user_id
JOIN rules r ON r.account_id = a.id
ORDER BY loss_pct DESC;


-- ============================================================
--  3. TRAILING DRAWDOWN CHECK
--     Checks if current equity has dropped from peak balance
--     beyond the trailing drawdown % allowed.
-- ============================================================

SELECT
    a.id                                                      AS account_id,
    a.account_number,
    u.full_name,
    a.peak_balance,
    a.equity,
    r.trailing_drawdown_pct,
    ROUND(a.peak_balance * r.trailing_drawdown_pct / 100, 2) AS trailing_limit,
    ROUND(a.peak_balance - a.equity, 2)                      AS current_drawdown,
    ROUND((a.peak_balance - a.equity) / a.peak_balance * 100, 2) AS drawdown_pct,
    CASE
        WHEN (a.peak_balance - a.equity) >= a.peak_balance * r.trailing_drawdown_pct / 100
        THEN 'BREACHED'
        WHEN (a.peak_balance - a.equity) >= a.peak_balance * r.trailing_drawdown_pct / 100 * 0.8
        THEN 'WARNING'
        ELSE 'OK'
    END                                                       AS trailing_status
FROM accounts a
JOIN users u ON u.id = a.user_id
JOIN rules r ON r.account_id = a.id
WHERE r.trailing_drawdown_pct IS NOT NULL
ORDER BY drawdown_pct DESC;


-- ============================================================
--  4. PROFIT TARGET CHECK
--     How far each account is from hitting the profit target.
-- ============================================================

SELECT
    a.id                                                          AS account_id,
    a.account_number,
    u.full_name,
    a.phase,
    a.initial_balance,
    a.balance,
    r.profit_target_pct,
    ROUND(a.initial_balance * r.profit_target_pct / 100, 2)      AS profit_target,
    ROUND(a.balance - a.initial_balance, 2)                       AS current_profit,
    ROUND((a.balance - a.initial_balance) / (a.initial_balance * r.profit_target_pct / 100) * 100, 2) AS target_pct_reached,
    CASE
        WHEN a.balance >= a.initial_balance * (1 + r.profit_target_pct / 100)
        THEN 'TARGET HIT'
        WHEN (a.balance - a.initial_balance) >= a.initial_balance * r.profit_target_pct / 100 * 0.8
        THEN 'NEAR TARGET'
        ELSE 'IN PROGRESS'
    END                                                           AS target_status
FROM accounts a
JOIN users u ON u.id = a.user_id
JOIN rules r ON r.account_id = a.id
WHERE a.status = 'active'
ORDER BY target_pct_reached DESC;


-- ============================================================
--  5. OPEN TRADES — LOT SIZE & COUNT CHECK
--     Detects accounts currently violating open trade limits.
-- ============================================================

SELECT
    a.id             AS account_id,
    a.account_number,
    u.full_name,
    COUNT(t.id)      AS open_trades,
    r.max_open_trades,
    SUM(t.lot)       AS open_lots,
    r.max_open_lots,
    r.max_lot_size,
    MAX(t.lot)       AS largest_open_lot,
    CASE
        WHEN COUNT(t.id) > r.max_open_trades      THEN 'TOO MANY TRADES'
        WHEN SUM(t.lot)  > r.max_open_lots        THEN 'LOT LIMIT EXCEEDED'
        WHEN MAX(t.lot)  > r.max_lot_size         THEN 'LOT SIZE EXCEEDED'
        ELSE 'OK'
    END              AS lot_status
FROM accounts a
JOIN users u        ON u.id = a.user_id
JOIN rules r        ON r.account_id = a.id
LEFT JOIN trades t  ON t.account_id = a.id AND t.status = 'open'
WHERE a.status = 'active'
GROUP BY a.id, a.account_number, u.full_name, r.max_open_trades, r.max_open_lots, r.max_lot_size
HAVING COUNT(t.id) > 0
ORDER BY open_trades DESC;


-- ============================================================
--  6. FULL ACCOUNT RISK DASHBOARD
--     One row per active account with all key risk metrics.
-- ============================================================

SELECT
    a.account_number,
    u.full_name,
    a.phase,
    a.status,
    a.balance,
    a.equity,
    a.initial_balance,

    -- Daily loss
    COALESCE(ds.daily_loss, 0)                                    AS todays_loss,
    ROUND(a.initial_balance * r.max_daily_loss_pct / 100, 2)      AS daily_limit,

    -- Total loss
    ROUND(a.initial_balance - a.balance, 2)                       AS total_loss,
    ROUND(a.initial_balance * r.max_total_loss_pct / 100, 2)      AS total_limit,

    -- Trailing drawdown
    ROUND(a.peak_balance - a.equity, 2)                           AS drawdown_from_peak,
    ROUND(a.peak_balance * COALESCE(r.trailing_drawdown_pct, 0) / 100, 2) AS trailing_limit,

    -- Profit progress
    ROUND(a.balance - a.initial_balance, 2)                       AS profit,
    ROUND(a.initial_balance * r.profit_target_pct / 100, 2)       AS profit_target,

    -- Overall risk flag
    CASE
        WHEN (a.initial_balance - a.balance) >= a.initial_balance * r.max_total_loss_pct / 100
        THEN 'TOTAL LOSS BREACH'
        WHEN COALESCE(ds.daily_loss, 0) >= a.initial_balance * r.max_daily_loss_pct / 100
        THEN 'DAILY LOSS BREACH'
        WHEN r.trailing_drawdown_pct IS NOT NULL
         AND (a.peak_balance - a.equity) >= a.peak_balance * r.trailing_drawdown_pct / 100
        THEN 'TRAILING DRAWDOWN BREACH'
        ELSE 'HEALTHY'
    END                                                           AS risk_flag

FROM accounts a
JOIN users u        ON u.id = a.user_id
JOIN rules r        ON r.account_id = a.id
LEFT JOIN daily_stats ds ON ds.account_id = a.id AND ds.stat_date = CURRENT_DATE
WHERE a.status != 'breached'
ORDER BY a.id;


-- ============================================================
--  7. TRADER PERFORMANCE SUMMARY
-- ============================================================

SELECT
    u.full_name,
    COUNT(DISTINCT a.id)                  AS total_accounts,
    COUNT(t.id)                           AS total_trades,
    SUM(CASE WHEN t.net_profit > 0 THEN 1 ELSE 0 END) AS winning_trades,
    SUM(CASE WHEN t.net_profit < 0 THEN 1 ELSE 0 END) AS losing_trades,
    ROUND(
        SUM(CASE WHEN t.net_profit > 0 THEN 1 ELSE 0 END)::NUMERIC
        / NULLIF(COUNT(t.id), 0) * 100, 2
    )                                     AS win_rate_pct,
    ROUND(SUM(t.net_profit), 2)           AS total_net_profit,
    ROUND(AVG(t.net_profit), 2)           AS avg_profit_per_trade,
    ROUND(SUM(t.lot), 2)                  AS total_lots_traded
FROM users u
JOIN accounts a ON a.user_id = u.id
JOIN trades t   ON t.account_id = a.id AND t.status = 'closed'
WHERE u.role = 'trader'
GROUP BY u.id, u.full_name
ORDER BY total_net_profit DESC;


-- ============================================================
--  8. RECENT VIOLATIONS
-- ============================================================

SELECT
    v.breached_at,
    a.account_number,
    u.full_name,
    v.violation_type,
    v.description,
    v.value_at_breach,
    v.rule_limit
FROM violations v
JOIN accounts a ON a.id = v.account_id
JOIN users u    ON u.id = a.user_id
ORDER BY v.breached_at DESC
LIMIT 50;


-- ============================================================
--  9. EQUITY CURVE (for charts)
-- ============================================================

SELECT
    logged_at::DATE  AS date,
    balance,
    equity,
    drawdown,
    peak_balance
FROM equity_logs
WHERE account_id = 1           -- replace with target account_id
ORDER BY logged_at ASC;


-- ============================================================
--  10. MINIMUM TRADING DAYS CHECK
-- ============================================================

SELECT
    a.account_number,
    u.full_name,
    r.min_trading_days,
    COUNT(DISTINCT DATE(t.close_time)) AS days_traded,
    GREATEST(r.min_trading_days - COUNT(DISTINCT DATE(t.close_time))::INT, 0) AS days_remaining
FROM accounts a
JOIN users u        ON u.id = a.user_id
JOIN rules r        ON r.account_id = a.id
LEFT JOIN trades t  ON t.account_id = a.id AND t.status = 'closed'
WHERE a.status = 'active'
GROUP BY a.id, a.account_number, u.full_name, r.min_trading_days
ORDER BY days_remaining DESC;
