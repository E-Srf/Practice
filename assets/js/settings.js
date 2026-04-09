initLayout({ title: 'Settings', subtitle: 'Account & preferences' });

function showSection(id) {
  ['profile', 'notifications', 'risk', 'appearance', 'security'].forEach(s => {
    document.getElementById(`section-${s}`).style.display = s === id ? 'block' : 'none';
    document.getElementById(`nav-${s}`).classList.toggle('active', s === id);
  });
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  toast.style.transform = 'translateY(0)';
  toast.style.opacity   = '1';
  setTimeout(() => {
    toast.style.transform = 'translateY(80px)';
    toast.style.opacity   = '0';
  }, 3000);
}

function signOut() {
  sessionStorage.removeItem('forexrm_user');
  window.location.href = 'index.html';
}
