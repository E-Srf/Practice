# OpoFinance — Risk Management Platform

A full-stack risk management dashboard for forex prop trading firms. Risk managers can monitor trader accounts through evaluation phases, track live funded accounts, manage risk rules, log risk alerts, and review equity drawdowns — all backed by a real PostgreSQL database.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| HTML5 / CSS3 | 9 pages, single shared stylesheet |
| Vanilla JavaScript (ES6+) | All interactivity, `fetch()` API calls |
| Material Icons Round | UI icons (loaded via Google Fonts CSS) |

No npm, no bundler, no frontend framework.

### Backend
| Technology | Purpose |
|---|---|
| Python 3.9+ | Runtime |
| FastAPI | REST API framework |
| SQLAlchemy 2 | ORM |
| Alembic | Database migrations |
| PostgreSQL | Primary database |
| bcrypt | Password hashing |
| pydantic-settings | `.env` configuration |

---

## Project Structure

```
Practice/
├── index.html               # Login page
├── signup.html              # Sign-up page
├── dashboard.html           # Main overview
├── phase1.html              # Phase 1 evaluation accounts
├── phase2.html              # Phase 2 verification accounts
├── funded.html              # Live funded trader accounts
├── risk-alerts.html         # Risk alert management (CRUD)
├── notifications.html       # Email log and notification queue
├── settings.html            # User and system settings
│
├── assets/
│   ├── css/styles.css       # All styles — dark/light theme, components, responsive
│   └── js/
│       ├── api.js           # Shared API_BASE URL constant (edit this for deployment)
│       ├── layout.js        # Shared sidebar + topbar, auth guard, logout
│       ├── login.js         # Login form → POST /api/auth/login
│       ├── signup.js        # Sign-up form → POST /api/auth/register
│       ├── dashboard.js     # Dashboard page init + personalised greeting
│       ├── risk-alerts.js   # Full CRUD for risk alerts (load, add, edit, delete)
│       ├── phase1.js        # Phase 1 table, filters, CSV export
│       ├── phase2.js        # Phase 2 table, filters, CSV export
│       ├── funded.js        # Funded accounts table
│       ├── notifications.js # Notification log + tabs
│       └── settings.js      # Settings section switching + sign out
│
├── backend/
│   ├── main.py              # FastAPI app, CORS, global exception handlers
│   ├── database.py          # SQLAlchemy engine + session factory
│   ├── config.py            # Loads DATABASE_URL from .env
│   ├── alembic.ini          # Alembic config (URL overridden by migrations/env.py)
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # ← NOT committed (add to git — see .env.example)
│   ├── .env.example         # ← Committed — placeholder values for teammates
│   │
│   ├── models/              # SQLAlchemy ORM models
│   │   ├── user.py          # users table
│   │   ├── account.py       # accounts table
│   │   ├── challenge.py     # challenges table
│   │   ├── rule.py          # rules table
│   │   ├── trade.py         # trades table
│   │   ├── equity_log.py    # equity_logs table
│   │   ├── risk_alert.py    # risk_alerts table
│   │   ├── violation.py     # violations table
│   │   ├── payout.py        # payouts table
│   │   └── notification.py  # notifications table
│   │
│   ├── routers/             # FastAPI route handlers
│   │   ├── auth.py          # POST /api/auth/register, /api/auth/login
│   │   ├── users.py         # CRUD /api/users
│   │   ├── accounts.py      # CRUD /api/accounts
│   │   ├── challenges.py    # CRUD /api/challenges
│   │   ├── rules.py         # CRUD /api/rules
│   │   ├── trades.py        # CRUD /api/trades
│   │   ├── equity_logs.py   # CRUD /api/equity-logs
│   │   ├── risk_alerts.py   # CRUD /api/risk-alerts
│   │   └── risk.py          # GET /risk/summary, /risk/daily-loss, /risk/drawdown
│   │
│   ├── utils/
│   │   └── responses.py     # Consistent { success, data, message } helpers
│   │
│   └── migrations/          # Alembic migration files — always committed
│       ├── env.py           # Migration runner — reads DATABASE_URL from .env
│       ├── script.py.mako   # Migration file template
│       └── versions/
│           ├── c7aad3f7c594_initial_schema.py
│           └── 1709ea99703e_add_equity_logs.py
│
├── schema.sql               # Reference SQL schema (not used by Alembic)
├── seed.sql                 # Sample seed data for development
├── queries.sql              # Useful risk management queries
├── .gitignore               # Root gitignore
└── README.md
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and retrieve name + role |

### Resources (all support GET / POST / PUT /:id / DELETE /:id)
| Prefix | Table |
|---|---|
| `/api/users` | Users |
| `/api/accounts` | Trader accounts |
| `/api/challenges` | Challenge programs |
| `/api/rules` | Risk rules per account |
| `/api/trades` | Trade records |
| `/api/equity-logs` | Equity snapshots |
| `/api/risk-alerts` | Risk violation alerts |

### Risk Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/risk/summary` | Account counts by status |
| GET | `/risk/daily-loss` | Daily loss check with WARNING / BREACHED flags |
| GET | `/risk/drawdown` | Trailing drawdown check per account |

All responses follow the shape:
```json
{ "success": true, "data": { ... }, "message": "..." }
```

---

## How to Run Locally

### Prerequisites
- Python 3.9+
- PostgreSQL running locally
- A database and user already created (see step 1)

---

### Step 1 — Set up PostgreSQL

```bash
# Connect as superuser
psql postgres

# Create user and database
CREATE USER dashboard_user WITH PASSWORD 'choose_a_password';
CREATE DATABASE dashboard_db OWNER dashboard_user;
GRANT ALL PRIVILEGES ON DATABASE dashboard_db TO dashboard_user;
\q
```

---

### Step 2 — Configure environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` and replace `your_password_here` with the password you chose:

```
DATABASE_URL=postgresql://dashboard_user:your_password_here@localhost:5432/dashboard_db
```

---

### Step 3 — Install dependencies

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

### Step 4 — Run migrations

```bash
# Must be run from inside the backend/ folder
alembic upgrade head
```

This creates all tables in your database. To add seed data:

```bash
psql -U dashboard_user -d dashboard_db -h localhost -f seed.sql
```

---

### Step 5 — Start the backend

```bash
# From the project root (Practice/)
source backend/venv/bin/activate
uvicorn backend.main:app --reload
```

The API will be available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

---

### Step 6 — Open the frontend

No build step required. Open `index.html` directly in any modern browser:

```bash
open index.html       # macOS
start index.html      # Windows
xdg-open index.html   # Linux
```

Or serve it with any static file server:

```bash
npx serve .           # then open http://localhost:3000
python3 -m http.server 3000
```

> **Important:** The frontend expects the backend at `http://localhost:8000`.
> If you run the backend on a different port, update `assets/js/api.js` — it is
> the single place where the backend URL is configured.

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/dashboard_db` |

Copy `backend/.env.example` to `backend/.env` to get started. Never commit `.env`.

---

## Database Migrations

Migrations live in `backend/migrations/versions/` and are always committed to git. Teammates run `alembic upgrade head` after pulling to stay in sync.

```bash
# Apply all pending migrations
alembic upgrade head

# Generate a new migration after changing a model
alembic revision --autogenerate -m "describe the change"

# Roll back one migration
alembic downgrade -1
```

---

## Authentication

- Passwords are hashed with **bcrypt** before storing — plain text is never saved
- On login, `name` and `role` are returned and stored in `sessionStorage`
- Every dashboard page checks `sessionStorage` on load — unauthenticated users are redirected to the login page
- Sign out clears `sessionStorage` and redirects to login

---

## Development Notes

- `seed.sql` contains sample traders, accounts, trades, and risk alerts for local development
- `queries.sql` contains pre-written SQL for daily loss checks, drawdown analysis, and trader performance reports
- The frontend uses only native `fetch()` — no Axios, no jQuery, no external JS libraries
