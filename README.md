# OpoFinance — Risk Management Dashboard

A frontend-only dashboard for managing forex prop trading accounts. It lets a risk analyst track traders through a two-phase evaluation process, monitor live funded accounts, manage email notifications, and configure risk parameters.

There is no backend, no database, and no build step. Everything runs directly in the browser using static HTML, CSS, and JavaScript.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Page structure for all 8 pages |
| CSS3 | All styling in a single shared stylesheet |
| Vanilla JavaScript (ES6+) | All interactivity and data rendering |
| [Google Fonts — Inter](https://fonts.google.com/specimen/Inter) | UI typeface (loaded via CSS `@import`) |
| [Google Fonts — Material Icons Round](https://fonts.google.com/icons) | All icons (loaded via CSS `@import`) |

No npm, no bundler, no framework, no external JavaScript libraries.

---

## Project Structure

```
Practice/
├── index.html            # Login page — entry point for the app
├── signup.html           # Sign-up page (form validation only; no real account creation)
├── dashboard.html        # Main overview page
├── phase1.html           # Phase 1 evaluation accounts
├── phase2.html           # Phase 2 verification accounts
├── funded.html           # Live funded trader accounts
├── notifications.html    # Email log, templates, and dispatch queue
├── settings.html         # Profile, notifications, risk rules, appearance, security
│
└── assets/
    ├── css/
    │   └── styles.css    # All styles for every page — theme variables, layout, components, responsive breakpoints
    └── js/
        ├── layout.js        # Shared sidebar and topbar — injected into every dashboard page
        ├── login.js         # Login form logic and simulated authentication
        ├── signup.js        # Sign-up form validation
        ├── dashboard.js     # Dashboard page initialisation
        ├── phase1.js        # Phase 1 account data, table rendering, filtering, CSV export
        ├── phase2.js        # Phase 2 account data, table rendering, filtering, CSV export
        ├── funded.js        # Funded account data, table rendering, filtering
        ├── notifications.js # Email log data, log filtering, tab switching
        └── settings.js      # Settings section switching, toast notifications, sign-out
```

### File descriptions

**`index.html`** — Login form with email and password fields. Submits to `login.js`. If the user is already logged in, they are redirected to `dashboard.html` immediately on load.

**`signup.html`** — Sign-up form with name, email, password, and confirm password fields. On valid submission it redirects to `index.html`. No session is created.

**`dashboard.html`** — Static overview page with four KPI stat cards, an activity feed, phase conversion rate progress bars, a "Today at a Glance" summary, an email queue snapshot, and a recent account reviews table. All content is written directly in HTML.

**`phase1.html`** — Phase 1 evaluation accounts page. Contains the stat cards and filter bar in HTML; the table body is rendered by `phase1.js`.

**`phase2.html`** — Phase 2 verification accounts page. Same structure as `phase1.html`. Includes an info banner describing Phase 2 rules. Table rendered by `phase2.js`.

**`funded.html`** — Funded accounts page. Stat cards and filter bar in HTML; table body rendered by `funded.js`.

**`notifications.html`** — Three-tab page: Notification Log, Templates, and Queue. The log list is rendered by `notifications.js`. The Templates and Queue panels are static HTML.

**`settings.html`** — Five-section settings page (Profile, Notifications, Risk Parameters, Appearance, Security). Sections are shown/hidden by `settings.js`. The outer layout uses the `.settings-layout` CSS class (240px sidebar nav + content area).

**`assets/css/styles.css`** — Single stylesheet for the entire project. Contains:
- CSS custom properties for dark and light themes under `:root` and `[data-theme="light"]`
- Auth page styles
- App shell layout (sidebar, topbar, main content area)
- Component styles: cards, stat cards, tables, badges, buttons, filter chips, progress bars, activity feed, notification items, settings rows, toggle switches
- Responsive breakpoints at 900px and 560px
- Utility classes

**`assets/js/layout.js`** — Runs on every dashboard page. Builds the sidebar and topbar HTML and injects it into `#sidebar` and `#topbar`. Handles the mobile hamburger menu toggle, the dark/light theme toggle, and the auth guard (redirects to `index.html` if no session).

**`assets/js/login.js`** — Handles the login form. Accepts any non-empty email and password. Stores a user object in `sessionStorage` and redirects to `dashboard.html`.

**`assets/js/signup.js`** — Handles the sign-up form. Validates that all fields are filled and that passwords match. On success redirects to `index.html`. Does not create a session.

**`assets/js/dashboard.js`** — One line: calls `initLayout()` to set the page title and inject the shared layout.

**`assets/js/phase1.js`** — Holds 18 hardcoded Phase 1 account records. Renders, filters, and searches the accounts table. Exports all records to a CSV file.

**`assets/js/phase2.js`** — Holds 14 hardcoded Phase 2 account records. Same render/filter/search/export pattern as `phase1.js`. Adds a profit target progress bar column.

**`assets/js/funded.js`** — Holds 18 hardcoded funded account records. Same render/filter/search pattern. No working CSV export (the button in `funded.html` has no `onclick` handler).

**`assets/js/notifications.js`** — Holds 10 hardcoded email log entries. Renders the notification log, filters it by status and search text, and handles switching between the Log, Templates, and Queue tabs.

**`assets/js/settings.js`** — Handles showing one settings section at a time, displaying a toast notification on save actions, and signing the user out.

---

## Functions

### `layout.js`

**`getTheme()`**
Reads the theme preference from `localStorage` using the key `forexrm-theme`. Returns `'dark'` if nothing is stored.

**`applyTheme(theme)`**
Sets the `data-theme` attribute on `<html>` to `'light'` or `'dark'`. Updates the theme toggle button icon (`light_mode` or `dark_mode`).

**`toggleTheme()`**
Reads the current theme, switches it to the opposite value, saves it to `localStorage`, and calls `applyTheme()`. Temporarily adds the `theme-switching` class to `<html>` for 300ms to enable smooth CSS transitions across all properties.

**`initLayout(config)`**
The main shared layout function, called at the top of every page script.
- `config.title` — sets the topbar title text
- `config.subtitle` — sets the topbar subtitle text (optional)

What it does:
1. Builds and injects the sidebar HTML into `#sidebar`, including the brand logo (linked to `index.html`), navigation links with active-state detection based on the current filename, and the user chip at the bottom.
2. Builds and injects the topbar HTML into `#topbar`, including the hamburger menu button, title, search input (hidden on mobile), theme toggle, notifications button, and avatar.
3. Attaches click listeners for the hamburger menu (toggles `.open` on `#sidebar` and `#sidebarOverlay`) and the theme toggle button.
4. Calls `applyTheme()` to ensure the correct theme icon is shown.
5. Reads `sessionStorage.getItem('forexrm_user')` — if no session exists, redirects immediately to `index.html`.

---

### `login.js`

**Form submit handler**
Reads `email` and `password` inputs. If either is empty, shows `#authError`. Otherwise stores `{ name: 'Elahe Ahmadi', email, role: 'Risk Analyst' }` as a JSON string in `sessionStorage` under the key `forexrm_user`, then redirects to `dashboard.html`.

On page load, if `forexrm_user` already exists in `sessionStorage`, redirects to `dashboard.html` immediately.

---

### `signup.js`

**Form submit handler**
Reads `fullName`, `email`, `password`, and `confirmPass` inputs. Shows an error message in `#signupError` if any field is empty, or if the passwords do not match. On success, redirects to `index.html`. Does not write to `sessionStorage`.

---

### `phase1.js`

**`statusBadge(s)`**
Takes a status string (`'pending'`, `'passed'`, or `'failed'`) and returns an HTML `<span>` badge with the appropriate CSS class.

**`pnlCell(v)`**
Takes a numeric P&L value. Returns a green (`text-success`) span if positive, red (`text-error`) span if negative. Formats as `+X.XX%` or `−X.XX%`.

**`renderTable(data)`**
Takes a filtered array of account objects and writes `<tr>` rows into `#p1Body`. If the array is empty, hides the table and shows the `#p1Empty` empty state. Action buttons (view, pass, fail) are only shown for pending accounts.

**`setFilter(el, filter)`**
Removes the `active` class from all `.filter-chip` elements, adds it to `el`, updates `currentFilter`, and calls `filterTable()`.

**`filterTable()`**
Reads the search input from `#p1Search` and the current filter value. Filters the `ACCOUNTS` array by status and by whether the trader name or account ID contains the search text. Calls `renderTable()` with the result.

**`exportCSV()`**
Builds a CSV string from all 18 records in `ACCOUNTS` (regardless of current filter). Creates a `Blob`, creates a temporary anchor element, triggers a download, and names the file `phase1_accounts.csv`. Columns: Account ID, Trader, Size, Start, Days, P&L, Max DD, Status.

---

### `phase2.js`

Same functions as `phase1.js` (`statusBadge`, `pnlCell`, `renderTable`, `setFilter`, `filterTable`, `exportCSV`) with these differences:

**`targetProgress(pnl, target)`**
Takes the trader's current P&L and their profit target percentage. Returns an HTML progress bar. The bar is blue if progress is below 60%, orange between 60% and 99%, and green at 100% or above.

`exportCSV()` downloads as `phase2_accounts.csv`. Columns: Account ID, Trader, Size, Start, Days, P&L, Max DD, Daily DD, Status.

---

### `funded.js`

**`statusBadge(s)`**
Returns a badge for `'active'`, `'at-risk'`, or `'suspended'`. Each includes a Material icon (`circle`, `warning`, or `block`).

**`ddBar(pct)`**
Takes a drawdown percentage (0–10). Returns an HTML progress bar. The bar is green below 60%, orange between 60% and 79%, and red at 80% or above. The bar fill width is calculated as `pct * 10` (converting from the 0–10% scale to 0–100% visual width).

**`fmt(n)`**
Formats a P&L number as `+X.XX%` or `X.XX%`.

**`fmtCur(n)`**
Formats a dollar amount. If 1000 or above, formats as `$X.XK`. Otherwise `$X`.

**`renderTable(data)`, `setFilter(el, filter)`, `filterTable()`**
Same pattern as `phase1.js`. Search input is `#fundedSearch`. Table body is `#fundedBody`.

---

### `notifications.js`

**`renderLog(data)`**
Takes an array of log entries and renders each as a `.notif-item` card into `#notifLog`. Each item shows an icon (colored by type), the email subject, the recipient name and address, a status badge, and the time. Uses `iconMap`, `colorMap`, and `bgMap` to look up the correct icon and colors by entry type.

**`setLogFilter(el, filter)`**
Removes `active` from all `[data-logfilter]` elements, adds it to `el`, updates `logFilter`, and calls `filterLog()`.

**`filterLog()`**
Filters the `LOG` array by `logFilter` (status) and by the `#logSearch` input (matches against trader name or email subject). Calls `renderLog()`.

**`switchTab(tab)`**
Shows the panel matching `tab` (`'log'`, `'templates'`, or `'queue'`) and hides the other two. Toggles the `active` class on the corresponding tab button.

---

### `settings.js`

**`showSection(id)`**
Iterates over the five section IDs (`profile`, `notifications`, `risk`, `appearance`, `security`). Sets the matching section's `display` to `block` and all others to `none`. Toggles the `active` class on the matching nav button in the settings sidebar.

**`showToast(msg)`**
Writes `msg` into `#toastMsg`, then animates the `#toast` element into view by setting `transform: translateY(0)` and `opacity: 1`. After 3000ms, reverses the animation.

**`signOut()`**
Calls `sessionStorage.removeItem('forexrm_user')` and redirects to `index.html`.

---

## External API Connections

This project makes **no JavaScript API calls** to any external service.

The only external resources are two Google Fonts URLs loaded passively through CSS `@import` in `styles.css`. No data is sent or received — the browser simply fetches font files.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons+Round');
```

---

## API Endpoints Hosted by This Project

This project does not host any API endpoints. It is a static frontend with no server.

---

## Authentication

Authentication is simulated entirely in the browser:

1. **Login** — Any non-empty email and password is accepted. A user object is written to `sessionStorage` under the key `forexrm_user`.
2. **Auth guard** — Every dashboard page calls `initLayout()`, which checks for `forexrm_user` in `sessionStorage`. If it is not found, the user is redirected to `index.html`.
3. **Sign Out** — Removes `forexrm_user` from `sessionStorage` and redirects to `index.html`.
4. **Sign Up** — Validates the form and redirects to the login page. Does not create a session.

---

## How to Run Locally

No installation or build step is required.

Open `index.html` in any modern browser:

```bash
# macOS
open index.html

# Windows
start index.html

# Linux
xdg-open index.html
```

Or serve it with any static file server, for example:

```bash
npx serve .
# then open http://localhost:3000
```

**To log in:** enter any non-empty email address and any password.
