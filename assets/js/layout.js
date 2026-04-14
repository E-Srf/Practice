// layout.js — shared sidebar + topbar for all dashboard pages

// ── Theme ──────────────────────────────────────────────────

function getTheme() {
  return localStorage.getItem('forexrm-theme') || 'dark';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.getElementById('themeIcon');
  if (icon) icon.textContent = theme === 'light' ? 'dark_mode' : 'light_mode';
}

function toggleTheme() {
  const current  = getTheme();
  const next     = current === 'dark' ? 'light' : 'dark';
  const html     = document.documentElement;

  // Briefly enable cross-property transitions for a smooth swap
  html.classList.add('theme-switching');
  applyTheme(next);
  localStorage.setItem('forexrm-theme', next);
  setTimeout(() => html.classList.remove('theme-switching'), 300);
}

// Apply before first paint to avoid flash
applyTheme(getTheme());

const NAV_ITEMS = [
  { href: 'dashboard.html',     icon: 'dashboard',              label: 'Dashboard',        i18n: 'nav.dashboard',      badge: null },
  { href: 'phase1.html',        icon: 'assignment',             label: 'Phase 1 Accounts', i18n: 'nav.phase1',         badge: '47' },
  { href: 'phase2.html',        icon: 'assignment_turned_in',   label: 'Phase 2 Accounts', i18n: 'nav.phase2',         badge: '23' },
  { href: 'funded.html',        icon: 'account_balance_wallet', label: 'Funded Accounts',  i18n: 'nav.funded',         badge: null },
  { href: 'notifications.html', icon: 'notifications',          label: 'Notifications',    i18n: 'nav.notifications',  badge: '5'  },
  { href: 'settings.html',      icon: 'settings',               label: 'Settings',         i18n: 'nav.settings',       badge: null },
];

function initLayout(config = {}) {
  const { titleKey = 'page.dashboard.title', subtitleKey = '' } = config;
  const title    = titleKey    ? window.t(titleKey)    : '';
  const subtitle = subtitleKey ? window.t(subtitleKey) : '';
  const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';

  // ── Build sidebar ──────────────────────────────────────────
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
          <div class="avatar">EL</div>
          <div>
            <div class="user-info-name">Elahe Ahmadi</div>
            <div class="user-info-role" data-i18n="sidebar.role">Risk Analyst</div>
          </div>
        </div>
      </div>`;
  }

  // ── Build topbar ───────────────────────────────────────────
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

        <div class="topbar-avatar" title="Elahe Ahmadi">EL</div>
      </div>`;

    // Mobile menu toggle
    const menuBtn  = document.getElementById('menuToggle');
    const sidebarEl = document.getElementById('sidebar');
    const overlay  = document.getElementById('sidebarOverlay');

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

    // Theme toggle — icon must be set after topbar HTML is injected
    applyTheme(getTheme());
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    // Wire language switcher buttons immediately (don't wait for DOMContentLoaded)
    topbar.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (typeof applyLanguage === 'function') applyLanguage(btn.getAttribute('data-lang'));
      });
    });
  }

  // Apply current language to all DOM elements now visible (static HTML + sidebar + topbar)
  // window.rerender is not set yet at this point; DOMContentLoaded handles the table pass
  if (typeof applyLanguage === 'function') applyLanguage(window._lang);

  // ── Auth guard ─────────────────────────────────────────────
  const user = sessionStorage.getItem('forexrm_user');
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
}
