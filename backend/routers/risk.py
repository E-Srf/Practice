from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from decimal import Decimal
from datetime import date
from backend.database import get_db
from backend.models.account import Account, AccountStatus
from backend.models.trade import Trade, TradeStatus
from backend.models.rule import Rule
from backend.models.user import User

router = APIRouter(prefix="/risk", tags=["Risk"])


@router.get("/daily-loss")
def daily_loss_check(db: Session = Depends(get_db)):
    today = date.today()

    rows = (
        db.query(
            Account.id.label("account_id"),
            Account.account_number,
            User.full_name,
            Account.initial_balance,
            Rule.max_daily_loss_pct,
            func.coalesce(
                func.abs(func.sum(
                    case((Trade.gross_profit < 0, Trade.gross_profit), else_=0)
                )), 0
            ).label("todays_loss"),
        )
        .join(User, User.id == Account.user_id)
        .join(Rule, Rule.account_id == Account.id)
        .outerjoin(Trade, (Trade.account_id == Account.id) &
                          (Trade.status == TradeStatus.closed) &
                          (func.date(Trade.close_time) == today))
        .filter(Account.status == AccountStatus.active)
        .group_by(Account.id, Account.account_number, User.full_name,
                  Account.initial_balance, Rule.max_daily_loss_pct)
        .all()
    )

    result = []
    for row in rows:
        limit = float(row.initial_balance) * float(row.max_daily_loss_pct) / 100
        loss  = float(row.todays_loss)
        pct   = round(loss / limit * 100, 2) if limit else 0
        status = "BREACHED" if loss >= limit else "WARNING" if pct >= 80 else "OK"
        result.append({
            "account_id":      row.account_id,
            "account_number":  row.account_number,
            "trader":          row.full_name,
            "daily_limit":     round(limit, 2),
            "todays_loss":     round(loss, 2),
            "pct_of_limit":    pct,
            "status":          status,
        })

    return sorted(result, key=lambda x: x["pct_of_limit"], reverse=True)


@router.get("/drawdown")
def drawdown_check(db: Session = Depends(get_db)):
    rows = (
        db.query(Account, Rule, User)
        .join(Rule, Rule.account_id == Account.id)
        .join(User, User.id == Account.user_id)
        .filter(Rule.trailing_drawdown_pct.isnot(None))
        .all()
    )

    result = []
    for account, rule, user in rows:
        peak    = float(account.peak_balance or account.initial_balance)
        equity  = float(account.equity)
        limit   = peak * float(rule.trailing_drawdown_pct) / 100
        dd      = round(peak - equity, 2)
        dd_pct  = round(dd / peak * 100, 2) if peak else 0
        status  = "BREACHED" if dd >= limit else "WARNING" if dd_pct >= float(rule.trailing_drawdown_pct) * 0.8 else "OK"
        result.append({
            "account_id":     account.id,
            "account_number": account.account_number,
            "trader":         user.full_name,
            "peak_balance":   round(peak, 2),
            "equity":         round(equity, 2),
            "drawdown":       dd,
            "drawdown_pct":   dd_pct,
            "trailing_limit": round(limit, 2),
            "status":         status,
        })

    return sorted(result, key=lambda x: x["drawdown_pct"], reverse=True)


@router.get("/summary")
def risk_summary(db: Session = Depends(get_db)):
    total     = db.query(Account).count()
    active    = db.query(Account).filter(Account.status == AccountStatus.active).count()
    breached  = db.query(Account).filter(Account.status == AccountStatus.breached).count()
    funded    = db.query(Account).filter(Account.status == AccountStatus.funded).count()
    open_trades = db.query(Trade).filter(Trade.status == TradeStatus.open).count()

    return {
        "total_accounts":  total,
        "active":          active,
        "breached":        breached,
        "funded":          funded,
        "open_trades":     open_trades,
    }
