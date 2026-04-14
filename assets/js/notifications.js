initLayout({ titleKey: 'page.notif.title', subtitleKey: 'page.notif.subtitle' });

const LOG = [
  { name: 'Marcus Chen',        email: 'marcus.c@email.com',  subject: 'Phase 2 Passed — Funded Account Activated',  type: 'success', time: '09:14',    status: 'sent'   },
  { name: 'James Okonkwo',      email: 'j.okonkwo@email.com', subject: 'Phase 1 Result — Challenge Unsuccessful',    type: 'error',   time: '09:12',    status: 'sent'   },
  { name: 'Batch (12 traders)', email: '—',                   subject: 'Phase 1 Results — Batch Dispatch',           type: 'info',    time: '08:00',    status: 'sent'   },
  { name: 'Aiko Tanaka',        email: 'aiko.t@email.com',    subject: 'Risk Alert — Drawdown at 78%',               type: 'warning', time: '07:45',    status: 'sent'   },
  { name: 'Luca Ferrari',       email: 'luca.f@email.com',    subject: 'Payout Confirmation — $4,200',               type: 'primary', time: '07:30',    status: 'sent'   },
  { name: 'Elena Volkov',       email: 'e.volkov@email.com',  subject: 'Risk Alert — Drawdown at 82%',               type: 'warning', time: 'Yesterday', status: 'sent'  },
  { name: 'Nikos Papadopoulos', email: 'nikos.p@email.com',   subject: 'Account Suspended — Max Drawdown Exceeded',  type: 'error',   time: 'Yesterday', status: 'sent'  },
  { name: 'Sofia Martínez',     email: 'sofia.m@email.com',   subject: 'Phase 1 Result — Pending',                   type: 'info',    time: 'Scheduled', status: 'queued'},
  { name: 'Anya Patel',         email: 'anya.p@email.com',    subject: 'Phase 1 Result — Pending',                   type: 'info',    time: 'Scheduled', status: 'queued'},
  { name: 'bad.address@x',      email: 'bad.address@x',       subject: 'Risk Alert — Delivery Failed',               type: 'error',   time: 'Yesterday', status: 'failed'},
];

const iconMap  = { success: 'check_circle', error: 'cancel', info: 'email', warning: 'warning', primary: 'payments' };
const colorMap = { success: 'var(--success)', error: 'var(--error)', info: 'var(--info)', warning: 'var(--warning)', primary: 'var(--primary)' };
const bgMap    = { success: 'rgba(134,239,172,.12)', error: 'rgba(255,180,171,.12)', info: 'rgba(147,197,253,.12)', warning: 'rgba(252,211,77,.12)', primary: 'rgba(34,197,94,.12)' };

let logFilter = 'all';

function renderLog(data) {
  document.getElementById('notifLog').innerHTML = data.map(n => {
    const statusLabel = window.t('notif.status.' + n.status);
    const badgeClass  = n.status === 'sent' ? 'badge-sent' : n.status === 'queued' ? 'badge-queued' : 'badge-failed-mail';
    const timeLabel   = n.time === 'Yesterday' ? window.t('notif.time.yesterday')
                      : n.time === 'Scheduled' ? window.t('notif.time.scheduled')
                      : n.time;
    return `
      <div class="notif-item">
        <div class="notif-item-icon" style="background:${bgMap[n.type]}">
          <span class="material-icons-round" style="color:${colorMap[n.type]}">${iconMap[n.type]}</span>
        </div>
        <div class="notif-item-body">
          <div class="notif-item-title">${n.subject}</div>
          <div class="notif-item-desc">${window.t('notif.log.to')} <strong>${n.name}</strong> &lt;${n.email}&gt;</div>
          <div class="notif-item-meta">
            <span class="badge ${badgeClass}">${statusLabel}</span>
            <span class="notif-item-time">${timeLabel}</span>
          </div>
        </div>
        <button class="btn btn-text btn-sm">
          <span class="material-icons-round" style="font-size:16px">open_in_new</span>
        </button>
      </div>`;
  }).join('');
}

window.rerender = () => filterLog();

function setLogFilter(el, filter) {
  logFilter = filter;
  document.querySelectorAll('[data-logfilter]').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  filterLog();
}

function filterLog() {
  const q    = document.getElementById('logSearch').value.toLowerCase();
  let   data = LOG;
  if (logFilter !== 'all') data = data.filter(n => n.status === logFilter);
  if (q)                   data = data.filter(n => n.name.toLowerCase().includes(q) || n.subject.toLowerCase().includes(q));
  renderLog(data);
}

function switchTab(tab) {
  ['log', 'templates', 'queue'].forEach(t => {
    document.getElementById(`panel-${t}`).style.display = t === tab ? 'block' : 'none';
    document.getElementById(`tab-${t}`).classList.toggle('active', t === tab);
  });
}

renderLog(LOG);
