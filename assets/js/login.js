// Redirect if already logged in
if (sessionStorage.getItem('forexrm_user')) {
  window.location.href = 'dashboard.html';
}

document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email     = document.getElementById('email').value.trim();
  const password  = document.getElementById('password').value;
  const errorEl   = document.getElementById('authError');
  const submitBtn = e.target.querySelector('[type="submit"]');

  function showError(msg) {
    const span = errorEl.querySelector('span[data-i18n]');
    if (span) span.textContent = msg;
    else errorEl.textContent = msg;
    errorEl.style.display = 'flex';
  }

  function setLoading(on) {
    submitBtn.disabled = on;
    const label = submitBtn.querySelector('span:not(.material-icons-round)');
    if (label) label.textContent = on ? 'Signing in…' : 'Sign In';
  }

  if (!email || !password) {
    showError('Please enter your email and password.');
    return;
  }

  errorEl.style.display = 'none';
  setLoading(true);

  try {
    const res  = await fetch(`${API_BASE}/api/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.message || 'Login failed. Please try again.');
      return;
    }

    sessionStorage.setItem('forexrm_user', JSON.stringify({
      name:  data.name,
      email: email,
      role:  data.role,
    }));

    window.location.href = 'dashboard.html';

  } catch (_) {
    showError('Could not connect to server. Please try again.');
  } finally {
    setLoading(false);
  }
});
