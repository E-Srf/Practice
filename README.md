# ForexRM — Risk Management Dashboard

A frontend-only risk management dashboard built for **Elahe Ahmadi**, Risk Management Analyst at a forex prop trading brokerage. No backend, no database — pure HTML, CSS, and JavaScript.

---

## Project Structure

```
Practice/
├── index.html               # Login page (entry point)
├── signup.html              # Sign Up page
├── dashboard.html           # Main Dashboard
├── phase1.html              # Phase 1 Accounts review
├── phase2.html              # Phase 2 Accounts review
├── funded.html              # Funded Accounts
├── notifications.html       # Email Notifications
├── settings.html            # Settings
│
└── assets/
    ├── css/
    │   └── styles.css       # All shared styles (Material Design 3, dark theme)
    └── js/
        ├── layout.js        # Shared sidebar + topbar (injected on every dashboard page)
        ├── login.js         # Login page logic & simulated auth
        ├── signup.js        # Sign Up form validation
        ├── dashboard.js     # Dashboard page initialisation
        ├── phase1.js        # Phase 1 accounts data, filtering, CSV export
        ├── phase2.js        # Phase 2 accounts data, filtering, CSV export
        ├── funded.js        # Funded accounts data & filtering
        ├── notifications.js # Email log, templates, queue tab logic
        └── settings.js      # Settings sections, toast, sign-out
```

---

## Pages & Routes

| File | Route | Description |
|------|-------|-------------|
| `index.html` | `/index.html` | Login — enter any email + password to sign in |
| `signup.html` | `/signup.html` | Sign Up — creates a simulated account |
| `dashboard.html` | `/dashboard.html` | Overview with KPI cards, activity feed, and tables |
| `phase1.html` | `/phase1.html` | Phase 1 challenge accounts — 24hr email SLA |
| `phase2.html` | `/phase2.html` | Phase 2 verification accounts — 48hr email SLA |
| `funded.html` | `/funded.html` | Live funded trader accounts with drawdown monitoring |
| `notifications.html` | `/notifications.html` | Email notification log, templates, and queue |
| `settings.html` | `/settings.html` | Profile, notification prefs, risk parameters, security |

---

## Features

### Dashboard
- KPI stat cards: Pending Phase 1 (47), Pending Phase 2 (23), Funded Today (8), Active Traders (312)
- Phase conversion rate progress bars
- Real-time activity feed with event types (pass, fail, alert, payout, email)
- Email queue status snapshot
- Recent account reviews table

### Phase 1 & Phase 2 Accounts
- Filterable data tables (All / Pending / Passed / Failed)
- Live search by trader name or account ID
- P&L display with color-coded success/failure
- Drawdown usage columns
- Phase 2 includes profit target progress bars
- One-click CSV export

### Funded Accounts
- 18 simulated funded traders with account size, profit split %, monthly P&L
- Drawdown usage bars with color-coded risk thresholds (green / amber / red)
- Status filters: Active, At Risk, Suspended

### Email Notifications
- **Log tab** — searchable history of sent, queued, and failed emails
- **Templates tab** — 5 pre-built email templates (Phase 1 Pass/Fail, Phase 2/Funded, Risk Alert, Payout)
- **Queue tab** — pending dispatches with SLA deadlines and "Send Now" actions

### Settings
- Profile information editing
- Per-category notification toggles
- Configurable risk parameters (profit targets, max drawdown, daily loss limits) for Phase 1 and Phase 2
- Appearance preferences (theme, compact tables, animations)
- Security section: password change, 2FA toggle, login notifications, Sign Out

---

## Design

- **Design system:** Material Design 3 principles
- **Theme:** Dark mode by default
- **Primary color:** Royal Purple (`#C4AAFF` on dark surfaces)
- **Font:** Inter (via Google Fonts)
- **Icons:** Material Icons Round (via Google Fonts CDN)
- **Responsive:** Fully mobile-friendly with hamburger sidebar navigation

---

## How to Run

No build step required. Open `index.html` directly in any modern browser:

```bash
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

**Login:** Enter any non-empty email and password — authentication is simulated via `sessionStorage`.

---

## Auth Flow

1. Enter credentials on `index.html` → session stored in `sessionStorage`
2. All dashboard pages check for a valid session on load — unauthenticated users are redirected to login
3. Sign Out (Settings → Security) clears the session and returns to login
