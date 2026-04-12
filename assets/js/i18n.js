/* ── OpoFinance i18n ─────────────────────────────────────────
   Supports: EN (default) / FA (Persian)
   Persists selection in localStorage under 'opofinance_lang'
   Usage: add data-i18n="KEY" to text nodes,
          add data-i18n-placeholder="KEY" to inputs
─────────────────────────────────────────────────────────────── */

const TRANSLATIONS = {
  en: {
    /* shared */
    'brand.sub'              : 'Risk Management Portal',

    /* login page */
    'login.title'            : 'Welcome back',
    'login.subtitle'         : 'Sign in to your risk management dashboard',
    'login.error'            : 'Invalid email or password. Please try again.',
    'login.label.email'      : 'Email Address',
    'login.label.password'   : 'Password',
    'login.forgot'           : 'Forgot password?',
    'login.submit'           : 'Sign In',
    'login.footer.text'      : "Don't have an account?",
    'login.footer.link'      : 'Create account',

    /* signup page */
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

    /* placeholders */
    'ph.email'               : 'elahe@opofinance.com',
    'ph.login.password'      : 'Enter your password',
    'ph.fullname'            : 'Elahe Ahmadi',
    'ph.new.password'        : 'Choose a strong password',
    'ph.confirm.password'    : 'Repeat your password',
  },

  fa: {
    /* shared */
    'brand.sub'              : 'پورتال مدیریت ریسک',

    /* login page */
    'login.title'            : 'خوش آمدید',
    'login.subtitle'         : 'وارد داشبورد مدیریت ریسک خود شوید',
    'login.error'            : 'ایمیل یا رمز عبور نامعتبر است. لطفاً دوباره تلاش کنید.',
    'login.label.email'      : 'آدرس ایمیل',
    'login.label.password'   : 'رمز عبور',
    'login.forgot'           : 'رمز عبور را فراموش کردید؟',
    'login.submit'           : 'ورود',
    'login.footer.text'      : 'حساب کاربری ندارید؟',
    'login.footer.link'      : 'ثبت‌نام',

    /* signup page */
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

    /* placeholders */
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

  /* Farsi font class on body */
  document.body.classList.toggle('lang-fa', lang === 'fa');

  /* html lang attribute */
  document.documentElement.lang = lang === 'fa' ? 'fa' : 'en';

  /* sync switcher button active state */
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    btn.setAttribute('aria-pressed', btn.getAttribute('data-lang') === lang);
  });

  localStorage.setItem('opofinance_lang', lang);
}

document.addEventListener('DOMContentLoaded', () => {
  /* wire up buttons */
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLanguage(btn.getAttribute('data-lang')));
  });

  /* restore persisted language */
  const saved = localStorage.getItem('opofinance_lang') || 'en';
  applyLanguage(saved);
});
