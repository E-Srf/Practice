// Redirect if already logged in
if (sessionStorage.getItem('forexrm_user')) {
  window.location.href = 'dashboard.html';
}

document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorEl  = document.getElementById('authError');

  // Simulate auth — accept any non-empty credentials
  if (!email || !password) {
    errorEl.style.display = 'block';
    return;
  }

  errorEl.style.display = 'none';

  sessionStorage.setItem('forexrm_user', JSON.stringify({
    name:  'Elahe Ahmadi',
    email: email,
    role:  'Risk Analyst',
  }));

  window.location.href = 'dashboard.html';
});
