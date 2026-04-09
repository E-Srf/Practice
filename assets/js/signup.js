document.getElementById('signupForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name    = document.getElementById('fullName').value.trim();
  const email   = document.getElementById('email').value.trim();
  const pass    = document.getElementById('password').value;
  const confirm = document.getElementById('confirmPass').value;
  const errorEl = document.getElementById('signupError');

  if (!name || !email || !pass) {
    errorEl.textContent    = 'Please fill in all fields.';
    errorEl.style.display  = 'block';
    return;
  }

  if (pass !== confirm) {
    errorEl.textContent   = 'Passwords do not match.';
    errorEl.style.display = 'block';
    return;
  }

  errorEl.style.display = 'none';
  window.location.href  = 'index.html';
});
