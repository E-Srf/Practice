initLayout({ titleKey: 'page.funded.title', subtitleKey: 'page.funded.subtitle' });

const ACCOUNTS = [
  { id: '#FF-1081', name: 'Luca Ferrari',       size: 50000,  split: 80, start: '2026-01-15', pnl: +11.40, dd: 2.4,  payouts: 4200,  status: 'active'    },
  { id: '#FF-1078', name: 'Carlos Mendoza',      size: 200000, split: 75, start: '2026-02-01', pnl: +6.80,  dd: 1.9,  payouts: 18200, status: 'active'    },
  { id: '#FF-1074', name: 'Yuki Yamamoto',       size: 200000, split: 75, start: '2026-01-20', pnl: +9.40,  dd: 3.2,  payouts: 22400, status: 'active'    },
  { id: '#FF-1070', name: 'Amara Diallo',        size: 100000, split: 80, start: '2026-02-10', pnl: +5.20,  dd: 2.7,  payouts: 8400,  status: 'active'    },
  { id: '#FF-1066', name: 'Rafael Torres',       size: 100000, split: 80, start: '2026-01-08', pnl: +14.20, dd: 4.8,  payouts: 11200, status: 'active'    },
  { id: '#FF-1062', name: 'Andrei Ionescu',      size: 100000, split: 80, start: '2026-02-20', pnl: +4.60,  dd: 2.1,  payouts: 6000,  status: 'active'    },
  { id: '#FF-1058', name: 'Baptiste Moreau',     size: 200000, split: 75, start: '2026-01-25', pnl: +8.80,  dd: 1.6,  payouts: 31200, status: 'active'    },
  { id: '#FF-1054', name: 'Arjun Nair',          size: 100000, split: 80, start: '2026-03-01', pnl: +3.40,  dd: 1.4,  payouts: 2800,  status: 'active'    },
  { id: '#FF-1050', name: 'Chen Wei',            size: 200000, split: 75, start: '2026-02-05', pnl: +7.60,  dd: 7.4,  payouts: 14800, status: 'at-risk'   },
  { id: '#FF-1046', name: 'Elena Volkov',        size: 100000, split: 80, start: '2026-01-30', pnl: +2.80,  dd: 8.2,  payouts: 3600,  status: 'at-risk'   },
  { id: '#FF-1042', name: 'Sofia Martínez',      size: 50000,  split: 80, start: '2026-03-05', pnl: +1.60,  dd: 9.1,  payouts: 0,     status: 'at-risk'   },
  { id: '#FF-1038', name: 'Dominic Walsh',       size: 50000,  split: 80, start: '2026-02-15', pnl: -8.40,  dd: 10.0, payouts: 0,     status: 'suspended' },
  { id: '#FF-1034', name: 'Layla Hassan',        size: 100000, split: 80, start: '2026-03-10', pnl: +2.10,  dd: 7.8,  payouts: 1200,  status: 'at-risk'   },
  { id: '#FF-1030', name: 'Marcus Chen',         size: 100000, split: 80, start: '2026-04-01', pnl: +1.80,  dd: 0.6,  payouts: 0,     status: 'active'    },
  { id: '#FF-1026', name: 'Aiko Tanaka',         size: 200000, split: 75, start: '2026-01-10', pnl: +12.60, dd: 2.8,  payouts: 28400, status: 'active'    },
  { id: '#FF-1022', name: 'Priya Sharma',        size: 25000,  split: 80, start: '2026-03-18', pnl: +4.20,  dd: 1.2,  payouts: 800,   status: 'active'    },
  { id: '#FF-1018', name: 'Kwame Asante',        size: 50000,  split: 80, start: '2026-02-25', pnl: +6.40,  dd: 3.6,  payouts: 4000,  status: 'active'    },
  { id: '#FF-1014', name: 'Nikos Papadopoulos',  size: 100000, split: 80, start: '2026-01-05', pnl: -4.80,  dd: 10.0, payouts: 9600,  status: 'suspended' },
];

let currentFilter = 'all';

function statusBadge(s) {
  const map   = { active: 'badge-active', 'at-risk': 'badge-pending', suspended: 'badge-failed' };
  const icons = { active: 'circle',       'at-risk': 'warning',       suspended: 'block'        };
  return `<span class="badge ${map[s]}"><span class="material-icons-round">${icons[s]}</span>${window.t('status.' + s)}</span>`;
}

window.rerender = () => filterTable();

function ddBar(pct) {
  const color = pct >= 80 ? 'var(--error)' : pct >= 60 ? 'var(--warning)' : 'var(--success)';
  return `
    <div style="min-width:100px">
      <div style="font-size:11px;margin-bottom:4px;${pct >= 80 ? 'color:var(--error)' : ''}">${pct.toFixed(1)}% / 10%</div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct * 10}%;background:${color}"></div></div>
    </div>`;
}

function fmt(n)    { return n >= 0 ? `+${n.toFixed(2)}%` : `${n.toFixed(2)}%`; }
function fmtCur(n) { return n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n}`; }

function renderTable(data) {
  const tbody = document.getElementById('fundedBody');
  const empty = document.getElementById('fundedEmpty');

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
      <td><strong>$${a.size.toLocaleString()}</strong></td>
      <td><span class="badge badge-active">${a.split}%</span></td>
      <td>${a.start}</td>
      <td><span class="${a.pnl >= 0 ? 'text-success' : 'text-error'} font-semibold">${fmt(a.pnl)}</span></td>
      <td>${ddBar(a.dd)}</td>
      <td>${fmtCur(a.payouts)}</td>
      <td>${statusBadge(a.status)}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-text btn-sm" style="padding:6px 10px">
            <span class="material-icons-round" style="font-size:14px">visibility</span>
          </button>
          <button class="btn btn-outlined btn-sm" style="padding:6px 10px">
            <span class="material-icons-round" style="font-size:14px">payments</span>
          </button>
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
  const q    = document.getElementById('fundedSearch').value.toLowerCase();
  let   data = ACCOUNTS;
  if (currentFilter !== 'all') data = data.filter(a => a.status === currentFilter);
  if (q)                       data = data.filter(a => a.name.toLowerCase().includes(q) || a.id.includes(q));
  renderTable(data);
}

renderTable(ACCOUNTS);
