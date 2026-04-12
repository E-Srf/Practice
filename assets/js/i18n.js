/* ── OpoFinance i18n ─────────────────────────────────────────
   Supports: EN (default) / FA (Persian)
   Persists selection in localStorage under 'opofinance_lang'
   Usage: add data-i18n="KEY" to text nodes,
          add data-i18n-placeholder="KEY" to inputs
─────────────────────────────────────────────────────────────── */

const TRANSLATIONS = {
  en: {
    /* ── shared brand ── */
    'brand.sub'              : 'Risk Management',

    /* ── sidebar ── */
    'nav.section.main'       : 'Main Menu',
    'nav.dashboard'          : 'Dashboard',
    'nav.phase1'             : 'Phase 1 Accounts',
    'nav.phase2'             : 'Phase 2 Accounts',
    'nav.funded'             : 'Funded Accounts',
    'nav.notifications'      : 'Notifications',
    'nav.settings'           : 'Settings',
    'sidebar.role'           : 'Risk Analyst',

    /* ── topbar ── */
    'topbar.search'          : 'Search accounts, traders…',

    /* ── dashboard stats ── */
    'dash.stat.pending1'          : 'Pending Phase 1',
    'dash.stat.pending2'          : 'Pending Phase 2',
    'dash.stat.funded-today'      : 'Funded Accounts Today',
    'dash.stat.active-traders'    : 'Total Active Traders',
    'dash.stat.note.24h'          : 'Results emailed within 24 hrs',
    'dash.stat.note.48h'          : 'Results emailed within 48 hrs',
    'dash.stat.note.funded'       : '↑ 3 more than yesterday',
    'dash.stat.note.traders'      : 'Across all account stages',

    /* ── dashboard cards ── */
    'dash.activity.title'         : 'Recent Activity',
    'dash.btn.view-all'           : 'View all',
    'dash.phase-rates.title'      : 'Phase Conversion Rates',
    'dash.phase-rates.p1p2'       : 'Phase 1 → Phase 2',
    'dash.phase-rates.p2f'        : 'Phase 2 → Funded',
    'dash.phase-rates.retention'  : 'Funded Retention (30d)',
    'dash.phase-rates.drawdown'   : 'Overall Drawdown Usage',
    'dash.glance.title'           : 'Today at a Glance',
    'dash.glance.new-apps'        : 'New Applications',
    'dash.glance.emails'          : 'Emails Sent',
    'dash.glance.reviewed'        : 'Accounts Reviewed',
    'dash.glance.payouts'         : 'Payouts Processed',
    'dash.glance.alerts'          : 'Risk Alerts',
    'dash.queue.title'            : 'Email Queue',
    'dash.queue.p1'               : 'Phase 1 Results',
    'dash.queue.p2'               : 'Phase 2 Results',
    'dash.queue.funded'           : 'Funded Welcome',
    'dash.reviews.title'          : 'Recent Account Reviews',
    'dash.btn.view-p1'            : 'View All Phase 1',

    /* ── dashboard table headers ── */
    'dash.table.account-id'  : 'Account ID',
    'dash.table.trader'      : 'Trader',
    'dash.table.phase'       : 'Phase',
    'dash.table.size'        : 'Account Size',
    'dash.table.pnl'         : 'P&L',
    'dash.table.drawdown'    : 'Drawdown',
    'dash.table.status'      : 'Status',

    /* ── auth — login ── */
    'login.title'            : 'Welcome back',
    'login.subtitle'         : 'Sign in to your risk management dashboard',
    'login.error'            : 'Invalid email or password. Please try again.',
    'login.label.email'      : 'Email Address',
    'login.label.password'   : 'Password',
    'login.forgot'           : 'Forgot password?',
    'login.submit'           : 'Sign In',
    'login.footer.text'      : "Don't have an account?",
    'login.footer.link'      : 'Create account',

    /* ── auth — signup ── */
    'signup.title'           : 'Create account',
    'signup.subtitle'        : 'Set up your risk management workspace',
    'signup.label.fullname'  : 'Full Name',
    'signup.label.email'     : 'Email Address',
    'signup.label.password'  : 'Password',
    'signup.label.confirm'   : 'Confirm Password',
    'signup.error'           : 'Passwords do not match. Please try again.',
    'signup.submit'          : 'Create Account',
    'signup.footer.text'     : 'Already have an account?',
    'signup.footer.link'     : 'Sign in',

    /* ── placeholders ── */
    'ph.email'               : 'elahe@opofinance.com',
    'ph.login.password'      : 'Enter your password',
    'ph.fullname'            : 'Elahe Ahmadi',
    'ph.new.password'        : 'Choose a strong password',
    'ph.confirm.password'    : 'Repeat your password',
  },

  fa: {
    /* ── shared brand ── */
    'brand.sub'              : 'پورتال مدیریت ریسک',

    /* ── sidebar ── */
    'nav.section.main'       : 'منوی اصلی',
    'nav.dashboard'          : 'داشبورد',
    'nav.phase1'             : 'حساب‌های فاز ۱',
    'nav.phase2'             : 'حساب‌های فاز ۲',
    'nav.funded'             : 'حساب‌های فاند شده',
    'nav.notifications'      : 'اعلان‌ها',
    'nav.settings'           : 'تنظیمات',
    'sidebar.role'           : 'تحلیل‌گر ریسک',

    /* ── topbar ── */
    'topbar.search'          : 'جستجوی حساب‌ها، تریدرها…',

    /* ── dashboard stats ── */
    'dash.stat.pending1'          : 'فاز ۱ در انتظار',
    'dash.stat.pending2'          : 'فاز ۲ در انتظار',
    'dash.stat.funded-today'      : 'حساب‌های فاند شده امروز',
    'dash.stat.active-traders'    : 'مجموع تریدرهای فعال',
    'dash.stat.note.24h'          : 'نتایج ظرف ۲۴ ساعت ایمیل می‌شود',
    'dash.stat.note.48h'          : 'نتایج ظرف ۴۸ ساعت ایمیل می‌شود',
    'dash.stat.note.funded'       : '↑ ۳ تا بیشتر از دیروز',
    'dash.stat.note.traders'      : 'در تمام مراحل حساب',

    /* ── dashboard cards ── */
    'dash.activity.title'         : 'فعالیت‌های اخیر',
    'dash.btn.view-all'           : 'مشاهده همه',
    'dash.phase-rates.title'      : 'نرخ تبدیل فازها',
    'dash.phase-rates.p1p2'       : 'فاز ۱ ← فاز ۲',
    'dash.phase-rates.p2f'        : 'فاز ۲ ← فاند',
    'dash.phase-rates.retention'  : 'نگهداری فاند (۳۰ روز)',
    'dash.phase-rates.drawdown'   : 'میزان کلی دراودان',
    'dash.glance.title'           : 'خلاصه امروز',
    'dash.glance.new-apps'        : 'درخواست‌های جدید',
    'dash.glance.emails'          : 'ایمیل‌های ارسال‌شده',
    'dash.glance.reviewed'        : 'حساب‌های بررسی‌شده',
    'dash.glance.payouts'         : 'پرداختی‌های انجام‌شده',
    'dash.glance.alerts'          : 'هشدارهای ریسک',
    'dash.queue.title'            : 'صف ایمیل',
    'dash.queue.p1'               : 'نتایج فاز ۱',
    'dash.queue.p2'               : 'نتایج فاز ۲',
    'dash.queue.funded'           : 'خوش‌آمد فاند',
    'dash.reviews.title'          : 'بررسی‌های اخیر حساب',
    'dash.btn.view-p1'            : 'مشاهده تمام فاز ۱',

    /* ── dashboard table headers ── */
    'dash.table.account-id'  : 'شناسه حساب',
    'dash.table.trader'      : 'تریدر',
    'dash.table.phase'       : 'فاز',
    'dash.table.size'        : 'اندازه حساب',
    'dash.table.pnl'         : 'سود/زیان',
    'dash.table.drawdown'    : 'دراودان',
    'dash.table.status'      : 'وضعیت',

    /* ── auth — login ── */
    'login.title'            : 'خوش آمدید',
    'login.subtitle'         : 'وارد داشبورد مدیریت ریسک خود شوید',
    'login.error'            : 'ایمیل یا رمز عبور نامعتبر است. لطفاً دوباره تلاش کنید.',
    'login.label.email'      : 'آدرس ایمیل',
    'login.label.password'   : 'رمز عبور',
    'login.forgot'           : 'رمز عبور را فراموش کردید؟',
    'login.submit'           : 'ورود',
    'login.footer.text'      : 'حساب کاربری ندارید؟',
    'login.footer.link'      : 'ثبت‌نام',

    /* ── auth — signup ── */
    'signup.title'           : 'ایجاد حساب کاربری',
    'signup.subtitle'        : 'فضای کاری مدیریت ریسک خود را راه‌اندازی کنید',
    'signup.label.fullname'  : 'نام کامل',
    'signup.label.email'     : 'آدرس ایمیل',
    'signup.label.password'  : 'رمز عبور',
    'signup.label.confirm'   : 'تأیید رمز عبور',
    'signup.error'           : 'رمزهای عبور مطابقت ندارند. لطفاً دوباره تلاش کنید.',
    'signup.submit'          : 'ایجاد حساب',
    'signup.footer.text'     : 'قبلاً حساب کاربری دارید؟',
    'signup.footer.link'     : 'ورود',

    /* ── placeholders ── */
    'ph.email'               : 'elahe@opofinance.com',
    'ph.login.password'      : 'رمز عبور خود را وارد کنید',
    'ph.fullname'            : 'الهه احمدی',
    'ph.new.password'        : 'یک رمز عبور قوی انتخاب کنید',
    'ph.confirm.password'    : 'رمز عبور را تکرار کنید',
  }
};

function applyLanguage(lang) {
  const t = TRANSLATIONS[lang];

  /* update text nodes */
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) el.textContent = t[key];
  });

  /* update input placeholders */
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key] !== undefined) el.placeholder = t[key];
  });

  /* swap --font token so every component switches cleanly */
  document.body.classList.toggle('lang-fa', lang === 'fa');

  /* html lang attribute */
  document.documentElement.lang = lang === 'fa' ? 'fa' : 'en';

  /* sync all switcher button active states (auth + dashboard) */
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const isActive = btn.getAttribute('data-lang') === lang;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive);
  });

  localStorage.setItem('opofinance_lang', lang);
}

document.addEventListener('DOMContentLoaded', () => {
  /* wire all lang buttons on the page */
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLanguage(btn.getAttribute('data-lang')));
  });

  /* restore persisted language */
  const saved = localStorage.getItem('opofinance_lang') || 'en';
  applyLanguage(saved);
});
