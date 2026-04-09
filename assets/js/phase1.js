initLayout({ title: 'Phase 1 Accounts', subtitle: 'Challenge evaluation — 24hr email SLA' });

const ACCOUNTS = [
  { id: '#FX-29041', name: 'Marcus Chen',     size: '$100,000', start: '2026-03-15', days: 21, pnl: +8.32,  dd: 3.1,  ddd: 1.2, status: 'passed'  },
  { id: '#FX-29038', name: 'Sofia Martínez',  size: '$100,000', start: '2026-04-01', days:  8, pnl: +1.20,  dd: 0.8,  ddd: 0.4, status: 'pending' },
  { id: '#FX-29035', name: 'James Okonkwo',   size: '$50,000',  start: '2026-03-28', days: 10, pnl: -6.80,  dd: 10.0, ddd: 5.0, status: 'failed'  },
  { id: '#FX-29032', name: 'Aiko Tanaka',     size: '$200,000', start: '2026-03-20', days: 18, pnl: +4.75,  dd: 4.7,  ddd: 2.1, status: 'pending' },
  { id: '#FX-29030', name: 'Luca Ferrari',    size: '$50,000',  start: '2026-03-12', days: 24, pnl: +10.10, dd: 2.4,  ddd: 0.8, status: 'passed'  },
  { id: '#FX-29027', name: 'Anya Patel',      size: '$25,000',  start: '2026-04-03', days:  5, pnl: +0.60,  dd: 0.3,  ddd: 0.2, status: 'pending' },
  { id: '#FX-29025', name: 'Rafael Torres',   size: '$100,000', start: '2026-03-18', days: 20, pnl: +7.80,  dd: 2.8,  ddd: 1.0, status: 'passed'  },
  { id: '#FX-29021', name: 'Mei Lin',         size: '$200,000', start: '2026-03-10', days: 28, pnl: -2.40,  dd: 5.2,  ddd: 1.6, status: 'failed'  },
  { id: '#FX-29019', name: 'Kwame Asante',    size: '$50,000',  start: '2026-04-05', days:  3, pnl: +0.45,  dd: 0.2,  ddd: 0.1, status: 'pending' },
  { id: '#FX-29017', name: 'Elena Volkov',    size: '$100,000', start: '2026-03-22', days: 16, pnl: +5.20,  dd: 3.4,  ddd: 1.5, status: 'pending' },
  { id: '#FX-29015', name: 'Carlos Mendoza',  size: '$200,000', start: '2026-03-08', days: 29, pnl: +9.60,  dd: 1.9,  ddd: 0.7, status: 'passed'  },
  { id: '#FX-29012', name: 'Priya Sharma',    size: '$25,000',  start: '2026-03-25', days: 13, pnl: +2.10,  dd: 1.4,  ddd: 0.6, status: 'pending' },
  { id: '#FX-29009', name: 'Noah Bergmann',   size: '$100,000', start: '2026-03-30', days:  9, pnl: -8.00,  dd: 10.0, ddd: 4.8, status: 'failed'  },
  { id: '#FX-29007', name: 'Fatima Al-Rashid',size: '$50,000',  start: '2026-04-02', days:  6, pnl: +1.80,  dd: 0.9,  ddd: 0.3, status: 'pending' },
  { id: '#FX-29005', name: 'Arjun Nair',      size: '$100,000', start: '2026-03-14', days: 23, pnl: +6.40,  dd: 2.0,  ddd: 0.9, status: 'passed'  },
  { id: '#FX-28998', name: 'Camille Dubois',  size: '$25,000',  start: '2026-03-27', days: 11, pnl: -1.20,  dd: 2.1,  ddd: 1.1, status: 'pending' },
  { id: '#FX-28994', name: 'Ivan Petrov',     size: '$50,000',  start: '2026-04-04', days:  4, pnl: +0.20,  dd: 0.1,  ddd: 0.0, status: 'pending' },
  { id: '#FX-28990', name: 'Yuki Yamamoto',   size: '$200,000', start: '2026-03-16', days: 22, pnl: +11.20, dd: 1.7,  ddd: 0.6, status: 'passed'  },
];

let currentFilter = 'all';

function statusBadge(s) {
  const map   = { pending: 'badge-pending', passed: 'badge-passed', failed: 'badge-failed' };
  const label = { pending: 'Pending',       passed: 'Passed',       failed: 'Failed'       };
  return `<span class="badge ${map[s]}">${label[s]}</span>`;
}

function pnlCell(v) {
  const cls  = v >= 0 ? 'text-success' : 'text-error';
  const sign = v >= 0 ? '+' : '';
  return `<span class="${cls} font-semibold">${sign}${v.toFixed(2)}%</span>`;
}

function renderTable(data) {
  const tbody = document.getElementById('p1Body');
  const empty = document.getElementById('p1Empty');

  if (!data.length) {
    tbody.innerHTML      = '';
    empty.style.display  = 'block';
    return;
  }

  empty.style.display = 'none';
  tbody.innerHTML = data.map(a => `
    <tr>
      <td class="text-xs text-muted font-semibold">${a.id}</td>
      <td><div class="font-semibold">${a.name}</div></td>
      <td>${a.size}</td>
      <td>${a.start}</td>
      <td style="text-align:center">${a.days} / 30</td>
      <td>${pnlCell(a.pnl)}</td>
      <td>${a.dd.toFixed(1)}%</td>
      <td>${a.ddd.toFixed(1)}%</td>
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
  const q    = document.getElementById('p1Search').value.toLowerCase();
  let   data = ACCOUNTS;
  if (currentFilter !== 'all') data = data.filter(a => a.status === currentFilter);
  if (q)                       data = data.filter(a => a.name.toLowerCase().includes(q) || a.id.includes(q));
  renderTable(data);
}

function exportCSV() {
  const headers = 'Account ID,Trader,Size,Start,Days,P&L,Max DD,Status\n';
  const rows    = ACCOUNTS.map(a =>
    `${a.id},${a.name},${a.size},${a.start},${a.days},${a.pnl}%,${a.dd}%,${a.status}`
  ).join('\n');
  const blob = new Blob([headers + rows], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = 'phase1_accounts.csv';
  link.click();
}

renderTable(ACCOUNTS);
