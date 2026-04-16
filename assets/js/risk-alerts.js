// risk-alerts.js — full CRUD for the risk_alerts table

initLayout({ titleKey: 'page.dashboard.title' });

const ENDPOINT = `${API_BASE}/api/risk-alerts`;

// ── State ──────────────────────────────────────────────────────────────────
let allAlerts = [];   // full list from server
let editingId = null; // null = new record, number = edit mode

// ── DOM refs ───────────────────────────────────────────────────────────────
const tableWrap      = document.getElementById('tableWrap');
const modal          = document.getElementById('alertModal');
const modalTitle     = document.getElementById('modalTitle');
const modalError     = document.getElementById('modalError');
const alertForm      = document.getElementById('alertForm');
const btnAddAlert    = document.getElementById('btnAddAlert');
const btnModalCancel = document.getElementById('btnModalCancel');
const btnModalSave   = document.getElementById('btnModalSave');
const filterStatus   = document.getElementById('filterStatus');
const filterSeverity = document.getElementById('filterSeverity');
const pageError      = document.getElementById('pageError');
const pageErrorMsg   = document.getElementById('pageErrorMsg');

// form fields
const F = {
  id:             () => document.getElementById('alertId'),
  clientEmail:    () => document.getElementById('fClientEmail'),
  accountNumber:  () => document.getElementById('fAccountNumber'),
  symbol:         () => document.getElementById('fSymbol'),
  alertType:      () => document.getElementById('fAlertType'),
  severity:       () => document.getElementById('fSeverity'),
  status:         () => document.getElementById('fStatus'),
  valueTriggered: () => document.getElementById('fValueTriggered'),
  threshold:      () => document.getElementById('fThreshold'),
  description:    () => document.getElementById('fDescription'),
  notes:          () => document.getElementById('fNotes'),
};

// ── Toast ──────────────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  const icon  = document.getElementById('toastIcon');
  const text  = document.getElementById('toastMsg');
  toast.className = `toast ${type}`;
  icon.textContent = type === 'success' ? 'check_circle' : 'error_outline';
  text.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── Page-level error banner ────────────────────────────────────────────────
function showPageError(msg) {
  pageErrorMsg.textContent = msg;
  pageError.style.display  = 'flex';
}
function hidePageError() {
  pageError.style.display = 'none';
}

// ── Format helpers ─────────────────────────────────────────────────────────
function sevBadge(sev) {
  return `<span class="badge sev-${sev}">${sev}</span>`;
}
function stBadge(st) {
  return `<span class="badge st-${st}">${st}</span>`;
}
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
function fmtType(t) {
  return t ? t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '—';
}

// ── Render table ───────────────────────────────────────────────────────────
function renderTable(alerts) {
  if (alerts.length === 0) {
    tableWrap.innerHTML = `
      <div class="state-msg">
        <span class="material-icons-round">shield</span>
        No alerts found.
      </div>`;
    return;
  }

  const rows = alerts.map(a => `
    <tr>
      <td>${sevBadge(a.severity)}</td>
      <td><span class="font-semibold">${fmtType(a.alert_type)}</span></td>
      <td>${a.client_email}</td>
      <td class="text-xs text-muted">${a.account_number || '—'}</td>
      <td>${a.symbol || '—'}</td>
      <td>${a.value_triggered != null ? a.value_triggered : '—'}</td>
      <td>${stBadge(a.status)}</td>
      <td class="text-xs text-muted">${fmtDate(a.created_at)}</td>
      <td>
        <button class="action-btn" onclick="openEdit(${a.id})">
          <span class="material-icons-round" style="font-size:13px">edit</span> Edit
        </button>
        <button class="action-btn danger" onclick="confirmDelete(${a.id})" style="margin-left:4px">
          <span class="material-icons-round" style="font-size:13px">delete</span> Delete
        </button>
      </td>
    </tr>`).join('');

  tableWrap.innerHTML = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Severity</th>
            <th>Alert Type</th>
            <th>Client Email</th>
            <th>Account #</th>
            <th>Symbol</th>
            <th>Value</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ── Apply filters ──────────────────────────────────────────────────────────
function applyFilters() {
  const st  = filterStatus.value;
  const sev = filterSeverity.value;
  const filtered = allAlerts.filter(a =>
    (!st  || a.status   === st) &&
    (!sev || a.severity === sev)
  );
  renderTable(filtered);
}

// ── Load alerts from API ───────────────────────────────────────────────────
async function loadAlerts() {
  tableWrap.innerHTML = `
    <div class="state-msg">
      <span class="material-icons-round">hourglass_top</span>
      Loading alerts…
    </div>`;
  hidePageError();

  try {
    const res  = await fetch(ENDPOINT);
    const data = await res.json();

    if (!res.ok || !data.success) {
      showPageError(data.message || 'Failed to load alerts.');
      tableWrap.innerHTML = `<div class="state-msg"><span class="material-icons-round">error_outline</span>Could not load data.</div>`;
      return;
    }

    allAlerts = data.data || [];
    applyFilters();

  } catch (_) {
    showPageError('Could not connect to the server. Is the backend running?');
    tableWrap.innerHTML = `<div class="state-msg"><span class="material-icons-round">wifi_off</span>Server unreachable.</div>`;
  }
}

// ── Open modal ─────────────────────────────────────────────────────────────
function openAdd() {
  editingId = null;
  modalTitle.textContent = 'Add Risk Alert';
  alertForm.reset();
  F.id().value = '';
  hideModalError();
  modal.classList.add('open');
  F.clientEmail().focus();
}

function openEdit(id) {
  const alert = allAlerts.find(a => a.id === id);
  if (!alert) return;

  editingId = id;
  modalTitle.textContent = 'Edit Risk Alert';
  hideModalError();

  F.id().value              = id;
  F.clientEmail().value     = alert.client_email    || '';
  F.accountNumber().value   = alert.account_number  || '';
  F.symbol().value          = alert.symbol          || '';
  F.alertType().value       = alert.alert_type      || '';
  F.severity().value        = alert.severity        || 'medium';
  F.status().value          = alert.status          || 'open';
  F.valueTriggered().value  = alert.value_triggered != null ? alert.value_triggered : '';
  F.threshold().value       = alert.threshold       != null ? alert.threshold : '';
  F.description().value     = alert.description     || '';
  F.notes().value           = alert.notes           || '';

  modal.classList.add('open');
  F.clientEmail().focus();
}

function closeModal() {
  modal.classList.remove('open');
  editingId = null;
}

// ── Modal error ────────────────────────────────────────────────────────────
function showModalError(msg) {
  modalError.textContent    = msg;
  modalError.style.display  = 'block';
}
function hideModalError() {
  modalError.style.display = 'none';
}

// ── Build request body from form ───────────────────────────────────────────
function buildPayload() {
  return {
    client_email:    F.clientEmail().value.trim(),
    account_number:  F.accountNumber().value.trim()  || null,
    symbol:          F.symbol().value.trim().toUpperCase() || null,
    alert_type:      F.alertType().value,
    severity:        F.severity().value,
    status:          F.status().value,
    value_triggered: F.valueTriggered().value !== '' ? parseFloat(F.valueTriggered().value) : null,
    threshold:       F.threshold().value       !== '' ? parseFloat(F.threshold().value)       : null,
    description:     F.description().value.trim() || null,
    notes:           F.notes().value.trim()       || null,
  };
}

// ── Submit form (create or update) ────────────────────────────────────────
alertForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  hideModalError();

  const payload = buildPayload();

  // Client-side validation
  if (!payload.client_email) { showModalError("Field 'client_email' is required."); return; }
  if (!payload.alert_type)   { showModalError("Field 'alert_type' is required.");   return; }

  const isEdit  = editingId !== null;
  const url     = isEdit ? `${ENDPOINT}/${editingId}` : ENDPOINT;
  const method  = isEdit ? 'PUT' : 'POST';

  btnModalSave.disabled = true;
  const label = btnModalSave.querySelector('span:not(.material-icons-round)');
  if (label) label.textContent = isEdit ? 'Saving…' : 'Creating…';

  try {
    const res  = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      showModalError(data.message || 'Something went wrong. Please try again.');
      return;
    }

    closeModal();
    showToast(isEdit ? 'Alert updated successfully.' : 'Alert created successfully.', 'success');
    await loadAlerts();

  } catch (_) {
    showModalError('Could not connect to server. Please try again.');
  } finally {
    btnModalSave.disabled = false;
    if (label) label.textContent = 'Save Alert';
  }
});

// ── Delete ─────────────────────────────────────────────────────────────────
async function confirmDelete(id) {
  const alert = allAlerts.find(a => a.id === id);
  const label = alert ? `alert for ${alert.client_email}` : `alert #${id}`;

  if (!confirm(`Delete ${label}?\n\nThis action cannot be undone.`)) return;

  try {
    const res  = await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (!res.ok || !data.success) {
      showToast(data.message || 'Delete failed.', 'error');
      return;
    }

    showToast('Alert deleted.', 'success');
    await loadAlerts();

  } catch (_) {
    showToast('Could not connect to server.', 'error');
  }
}

// ── Event wiring ───────────────────────────────────────────────────────────
btnAddAlert.addEventListener('click', openAdd);
btnModalCancel.addEventListener('click', closeModal);

// Close modal when clicking outside
modal.addEventListener('click', function (e) {
  if (e.target === modal) closeModal();
});

// Close modal on Escape
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
});

// Filters
filterStatus.addEventListener('change', applyFilters);
filterSeverity.addEventListener('change', applyFilters);

// ── Init ───────────────────────────────────────────────────────────────────
loadAlerts();
