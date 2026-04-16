// layout.js — shared sidebar + topbar for all dashboard pages

// ── Theme ──────────────────────────────────────────────────────────────────

function getTheme() {
  return localStorage.getItem('forexrm-theme') || 'dark';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.getElementById('themeIcon');
  if (icon) icon.textContent = theme === 'light' ? 'dark_mode' : 'light_mode';
}

function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.classList.add('theme-switching');
  applyTheme(next);
  localStorage.setItem('forexrm-theme', next);
  setTimeout(() => document.documentElement.classList.remove('theme-switching'), 300);
}

// Apply before first paint
applyTheme(getTheme());

// ── Helpers ────────────────────────────────────────────────────────────────

function getUser() {
  try { return JSON.parse(sessionStorage.getItem('forexrm_user')) || {}; }
  catch (_) { return {}; }
}

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join('');
}

function formatRole(role) {
  if (!role) return 'User';
  return role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function logout() {
  sessionStorage.removeItem('forexrm_user');
  window.location.href = 'index.html';
}

// ── Nav items ──────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: 'dashboard.html',     icon: 'dashboard',              label: 'Dashboard',        i18n: 'nav.dashboard',      badge: null },
  { href: 'phase1.html',        icon: 'assignment',             label: 'Phase 1 Accounts', i18n: 'nav.phase1',         badge: '47' },
  { href: 'phase2.html',        icon: 'assignment_turned_in',   label: 'Phase 2 Accounts', i18n: 'nav.phase2',         badge: '23' },
  { href: 'funded.html',        icon: 'account_balance_wallet', label: 'Funded Accounts',  i18n: 'nav.funded',         badge: null },
  { href: 'risk-alerts.html',   icon: 'warning_amber',          label: 'Risk Alerts',      i18n: 'nav.risk-alerts',    badge: null },
  { href: 'notifications.html', icon: 'notifications',          label: 'Notifications',    i18n: 'nav.notifications',  badge: '5'  },
  { href: 'settings.html',      icon: 'settings',               label: 'Settings',         i18n: 'nav.settings',       badge: null },
];

// ── initLayout ─────────────────────────────────────────────────────────────

function initLayout(config = {}) {
  const { titleKey = 'page.dashboard.title', subtitleKey = '' } = config;
  const title       = titleKey    ? window.t(titleKey)    : '';
  const subtitle    = subtitleKey ? window.t(subtitleKey) : '';
  const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
  const user        = getUser();
  const userName    = user.name  || 'User';
  const userRole    = user.role  || '';
  const userInitials = initials(userName);

  // ── Sidebar ──────────────────────────────────────────────────

  const navHTML = NAV_ITEMS.map(item => {
    const active = currentPage === item.href ? 'active' : '';
    const badge  = item.badge ? `<span class="nav-badge">${item.badge}</span>` : '';
    return `
      <a href="${item.href}" class="nav-item ${active}">
        <span class="material-icons-round">${item.icon}</span>
        <span data-i18n="${item.i18n}">${item.label}</span>
        ${badge}
      </a>`;
  }).join('');

  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.innerHTML = `
      <div class="sidebar-header">
        <a href="index.html" class="brand-link">
          <div class="brand-icon">
            <span class="material-icons-round">show_chart</span>
          </div>
          <div>
            <div class="brand-name">OpoFinance</div>
            <div class="brand-tag" data-i18n="brand.sub">Risk Management</div>
          </div>
        </a>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-label" data-i18n="nav.section.main">Main Menu</div>
        ${navHTML}
      </nav>

      <div class="sidebar-footer">
        <div class="user-chip">
          <div class="avatar">${userInitials}</div>
          <div style="flex:1;min-width:0">
            <div class="user-info-name">${userName}</div>
            <div class="user-info-role">${formatRole(userRole)}</div>
          </div>
        </div>
        <button
          onclick="logout()"
          style="margin-top:10px;width:100%;background:transparent;border:1px solid var(--outline);
                 color:var(--on-surface-variant);border-radius:var(--radius-sm);padding:6px 10px;
                 font-size:12px;cursor:pointer;display:flex;align-items:center;gap:6px;justify-content:center"
          title="Sign out">
          <span class="material-icons-round" style="font-size:15px">logout</span>
          Sign Out
        </button>
      </div>`;
  }

  // ── Topbar ───────────────────────────────────────────────────

  const topbar = document.getElementById('topbar');
  if (topbar) {
    topbar.innerHTML = `
      <button class="btn btn-icon topbar-menu-btn" id="menuToggle" aria-label="Toggle sidebar">
        <span class="material-icons-round">menu</span>
      </button>

      <div>
        <div class="topbar-title" data-i18n="${titleKey}">${title}</div>
        ${subtitleKey ? `<div class="topbar-subtitle" data-i18n="${subtitleKey}">${subtitle}</div>` : ''}
      </div>

      <div class="topbar-spacer"></div>

      <div class="topbar-search">
        <span class="material-icons-round">search</span>
        <input type="text" data-i18n-placeholder="topbar.search" placeholder="Search accounts, traders…">
      </div>

      <div class="topbar-actions">
        <div class="lang-switcher" role="group" aria-label="Language selector">
          <button class="lang-btn active" data-lang="en" aria-pressed="true">EN</button>
          <button class="lang-btn"        data-lang="fa" aria-pressed="false">FA</button>
        </div>

        <button class="btn btn-icon" id="themeToggle" aria-label="Toggle theme">
          <span class="material-icons-round" id="themeIcon">light_mode</span>
        </button>

        <button class="btn btn-icon notif-btn" onclick="window.location='notifications.html'" aria-label="Notifications">
          <span class="material-icons-round">notifications_none</span>
          <span class="notif-dot"></span>
        </button>

        <div class="topbar-avatar" title="${userName}">${userInitials}</div>
      </div>`;

    // Mobile menu
    const menuBtn   = document.getElementById('menuToggle');
    const sidebarEl = document.getElementById('sidebar');
    const overlay   = document.getElementById('sidebarOverlay');

    if (menuBtn && sidebarEl) {
      menuBtn.addEventListener('click', () => {
        sidebarEl.classList.toggle('open');
        if (overlay) overlay.classList.toggle('open');
      });
    }
    if (overlay && sidebarEl) {
      overlay.addEventListener('click', () => {
        sidebarEl.classList.remove('open');
        overlay.classList.remove('open');
      });
    }

    applyTheme(getTheme());
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    topbar.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (typeof applyLanguage === 'function') applyLanguage(btn.getAttribute('data-lang'));
      });
    });
  }

  if (typeof applyLanguage === 'function') applyLanguage(window._lang);

  // ── Auth guard ───────────────────────────────────────────────
  if (!sessionStorage.getItem('forexrm_user')) {
    window.location.href = 'index.html';
  }
}
