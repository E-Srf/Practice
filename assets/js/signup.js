document.getElementById('signupForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const name      = document.getElementById('fullName').value.trim();
  const email     = document.getElementById('email').value.trim();
  const pass      = document.getElementById('password').value;
  const confirm   = document.getElementById('confirmPass').value;
  const errorEl   = document.getElementById('signupError');
  const submitBtn = e.target.querySelector('[type="submit"]');

  function showError(msg) {
    errorEl.style.background   = '';
    errorEl.style.color        = '';
    errorEl.style.borderColor  = '';
    errorEl.textContent        = msg;
    errorEl.style.display      = 'block';
  }

  function showSuccess(msg) {
    errorEl.style.background  = 'rgba(34,197,94,.12)';
    errorEl.style.color       = 'var(--success)';
    errorEl.style.borderColor = 'rgba(34,197,94,.3)';
    errorEl.textContent       = msg;
    errorEl.style.display     = 'block';
  }

  function setLoading(on) {
    submitBtn.disabled = on;
    const label = submitBtn.querySelector('span:not(.material-icons-round)');
    if (label) label.textContent = on ? 'Creating account…' : 'Create Account';
  }

  // Client-side checks
  if (!name || !email || !pass) { showError('Please fill in all fields.'); return; }
  if (pass !== confirm)          { showError('Passwords do not match.');    return; }
  if (pass.length < 6)           { showError('Password must be at least 6 characters.'); return; }

  errorEl.style.display = 'none';
  setLoading(true);

  try {
    const res  = await fetch(`${API_BASE}/api/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email, password: pass, role: 'risk_manager' }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.message || 'Registration failed. Please try again.');
      return;
    }

    showSuccess('Account created! Redirecting to sign in…');
    setTimeout(() => { window.location.href = 'index.html'; }, 1500);

  } catch (_) {
    showError('Could not connect to server. Please try again.');
  } finally {
    setLoading(false);
  }
});
