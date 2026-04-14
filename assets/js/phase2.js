initLayout({ titleKey: 'page.phase2.title', subtitleKey: 'page.phase2.subtitle' });

const ACCOUNTS = [
  { id: '#FX-P2-8841', name: 'Amara Diallo',      size: '$100,000', start: '2026-03-10', days: 28, pnl: +6.80, dd: 2.1, ddd: 0.9, target: 5.0, status: 'passed'  },
  { id: '#FX-P2-8837', name: 'Dominic Walsh',      size: '$50,000',  start: '2026-03-20', days: 18, pnl: +3.40, dd: 3.8, ddd: 1.4, target: 5.0, status: 'pending' },
  { id: '#FX-P2-8834', name: 'Rin Nakamura',       size: '$200,000', start: '2026-03-15', days: 23, pnl: -5.20, dd: 5.0, ddd: 2.0, target: 5.0, status: 'failed'  },
  { id: '#FX-P2-8829', name: 'Thomas Brandt',      size: '$100,000', start: '2026-03-28', days: 10, pnl: +2.10, dd: 1.2, ddd: 0.6, target: 5.0, status: 'pending' },
  { id: '#FX-P2-8825', name: 'Isabella Romano',    size: '$25,000',  start: '2026-04-01', days:  7, pnl: +0.80, dd: 0.5, ddd: 0.2, target: 5.0, status: 'pending' },
  { id: '#FX-P2-8820', name: 'Chen Wei',           size: '$200,000', start: '2026-03-05', days: 33, pnl: +7.20, dd: 1.8, ddd: 0.7, target: 5.0, status: 'passed'  },
  { id: '#FX-P2-8816', name: 'Layla Hassan',       size: '$50,000',  start: '2026-03-22', days: 16, pnl: +4.60, dd: 2.7, ddd: 1.1, target: 5.0, status: 'pending' },
  { id: '#FX-P2-8812', name: 'Nikos Papadopoulos', size: '$100,000', start: '2026-03-12', days: 26, pnl: -3.60, dd: 5.0, ddd: 2.0, target: 5.0, status: 'failed'  },
  { id: '#FX-P2-8808', name: 'Sandra Osei',        size: '$25,000',  start: '2026-04-04', days:  4, pnl: +0.30, dd: 0.2, ddd: 0.1, target: 5.0, status: 'pending' },
  { id: '#FX-P2-8802', name: 'Andrei Ionescu',     size: '$100,000', start: '2026-03-18', days: 20, pnl: +5.80, dd: 2.4, ddd: 0.9, target: 5.0, status: 'passed'  },
  { id: '#FX-P2-8797', name: 'Zara Ahmed',         size: '$50,000',  start: '2026-03-25', days: 13, pnl: +3.10, dd: 1.6, ddd: 0.8, target: 5.0, status: 'pending' },
  { id: '#FX-P2-8791', name: 'Baptiste Moreau',    size: '$200,000', start: '2026-03-08', days: 30, pnl: +9.40, dd: 1.4, ddd: 0.5, target: 5.0, status: 'passed'  },
  { id: '#FX-P2-8786', name: 'Hiroshi Kato',       size: '$100,000', start: '2026-03-30', days:  8, pnl: +1.40, dd: 0.8, ddd: 0.4, target: 5.0, status: 'pending' },
  { id: '#FX-P2-8780', name: 'Grace Otieno',       size: '$50,000',  start: '2026-04-02', days:  6, pnl: +0.60, dd: 0.3, ddd: 0.1, target: 5.0, status: 'pending' },
];

let currentFilter = 'all';

function statusBadge(s) {
  const map = { pending: 'badge-pending', passed: 'badge-passed', failed: 'badge-failed' };
  return `<span class="badge ${map[s]}">${window.t('status.' + s)}</span>`;
}

window.rerender = () => filterTable();

function pnlCell(v) {
  const cls = v >= 0 ? 'text-success' : 'text-error';
  return `<span class="${cls} font-semibold">${v >= 0 ? '+' : ''}${v.toFixed(2)}%</span>`;
}

function targetProgress(pnl, target) {
  const pct   = Math.min(100, Math.max(0, (pnl / target) * 100));
  const color = pct >= 100 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--info)';
  return `
    <div style="min-width:90px">
      <div style="font-size:11px;margin-bottom:4px;color:var(--on-surface-variant)">${pnl >= 0 ? pnl.toFixed(1) : 0}% / ${target}%</div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${color}"></div></div>
    </div>`;
}

function renderTable(data) {
  const tbody = document.getElementById('p2Body');
  const empty = document.getElementById('p2Empty');

  if (!data.length) {
    tbody.innerHTML     = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  tbody.innerHTML = data.map(a => `
    <tr>
      <td class="text-xs text-muted font-semibold">${a.id}</td>
      <td><div class="font-semibold">${a.name}</div></td>
      <td>${a.size}</td>
      <td>${a.start}</td>
      <td style="text-align:center">${a.days} / 60</td>
      <td>${pnlCell(a.pnl)}</td>
      <td>${a.dd.toFixed(1)}%</td>
      <td>${a.ddd.toFixed(1)}%</td>
      <td>${targetProgress(a.pnl, a.target)}</td>
      <td>${statusBadge(a.status)}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-text btn-sm" style="padding:6px 10px">
            <span class="material-icons-round" style="font-size:14px">visibility</span>
          </button>
          ${a.status === 'pending' ? `
            <button class="btn btn-outlined btn-sm" style="padding:6px 10px;border-color:var(--success);color:var(--success)">
              <span class="material-icons-round" style="font-size:14px">check</span>
            </button>
            <button class="btn btn-outlined btn-sm" style="padding:6px 10px;border-color:var(--error);color:var(--error)">
              <span class="material-icons-round" style="font-size:14px">close</span>
            </button>` : ''}
        </div>
      </td>
    </tr>`).join('');
}

function setFilter(el, filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  filterTable();
}

function filterTable() {
  const q    = document.getElementById('p2Search').value.toLowerCase();
  let   data = ACCOUNTS;
  if (currentFilter !== 'all') data = data.filter(a => a.status === currentFilter);
  if (q)                       data = data.filter(a => a.name.toLowerCase().includes(q) || a.id.includes(q));
  renderTable(data);
}

function exportCSV() {
  const headers = 'Account ID,Trader,Size,Start,Days,P&L,Max DD,Daily DD,Status\n';
  const rows    = ACCOUNTS.map(a =>
    `${a.id},${a.name},${a.size},${a.start},${a.days},${a.pnl}%,${a.dd}%,${a.ddd}%,${a.status}`
  ).join('\n');
  const blob = new Blob([headers + rows], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = 'phase2_accounts.csv';
  link.click();
}

renderTable(ACCOUNTS);
