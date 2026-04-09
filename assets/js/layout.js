// layout.js — shared sidebar + topbar for all dashboard pages

const NAV_ITEMS = [
  { href: 'dashboard.html',     icon: 'dashboard',              label: 'Dashboard',        badge: null },
  { href: 'phase1.html',        icon: 'assignment',             label: 'Phase 1 Accounts', badge: '47' },
  { href: 'phase2.html',        icon: 'assignment_turned_in',   label: 'Phase 2 Accounts', badge: '23' },
  { href: 'funded.html',        icon: 'account_balance_wallet', label: 'Funded Accounts',  badge: null },
  { href: 'notifications.html', icon: 'notifications',          label: 'Notifications',    badge: '5'  },
  { href: 'settings.html',      icon: 'settings',               label: 'Settings',         badge: null },
];

function initLayout(config = {}) {
  const { title = 'Dashboard', subtitle = '' } = config;
  const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';

  // ── Build sidebar ──────────────────────────────────────────
  const navHTML = NAV_ITEMS.map(item => {
    const active = currentPage === item.href ? 'active' : '';
    const badge  = item.badge ? `<span class="nav-badge">${item.badge}</span>` : '';
    return `
      <a href="${item.href}" class="nav-item ${active}">
        <span class="material-icons-round">${item.icon}</span>
        ${item.label}
        ${badge}
      </a>`;
  }).join('');

  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.innerHTML = `
      <div class="sidebar-header">
        <div class="brand-icon">
          <span class="material-icons-round">show_chart</span>
        </div>
        <div>
          <div class="brand-name">ForexRM</div>
          <div class="brand-tag">Risk Management</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-label">Main Menu</div>
        ${navHTML}
      </nav>

      <div class="sidebar-footer">
        <div class="user-chip">
          <div class="avatar">EL</div>
          <div>
            <div class="user-info-name">Elahe Ahmadi</div>
            <div class="user-info-role">Risk Analyst</div>
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
        <div class="topbar-title">${title}</div>
        ${subtitle ? `<div class="topbar-subtitle">${subtitle}</div>` : ''}
      </div>

      <div class="topbar-spacer"></div>

      <div class="topbar-search">
        <span class="material-icons-round">search</span>
        <input type="text" placeholder="Search accounts, traders…">
      </div>

      <div class="topbar-actions">
        <button class="btn btn-icon notif-btn" onclick="window.location='notifications.html'" aria-label="Notifications">
          <span class="material-icons-round">notifications_none</span>
          <span class="notif-dot"></span>
        </button>

        <div class="topbar-avatar" title="Elahe Ahmadi">EL</div>
      </div>`;

    // Mobile menu toggle
    const menuBtn = document.getElementById('menuToggle');
    const sidebarEl = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

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
  }

  // ── Auth guard ─────────────────────────────────────────────
  const user = sessionStorage.getItem('forexrm_user');
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
}
