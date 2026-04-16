initLayout({ titleKey: 'page.dashboard.title', subtitleKey: 'page.dashboard.subtitle' });

// Personalise the greeting with real user name
(function () {
  try {
    const user = JSON.parse(sessionStorage.getItem('forexrm_user')) || {};
    const firstName = (user.name || 'there').split(' ')[0];
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const el = document.getElementById('dashGreeting');
    if (el) el.textContent = `${greeting}, ${firstName} 👋`;
  } catch (_) {}
})();
