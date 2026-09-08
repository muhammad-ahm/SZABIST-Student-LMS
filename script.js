(function () {
  'use strict';

  const toggle = document.getElementById('themeToggle');
  const sun = document.getElementById('iconSun');
  const moon = document.getElementById('iconMoon');
  const body = document.body;

  function setTheme(mode) {
    body.setAttribute('data-theme', mode);
    const isDark = mode === 'dark';
    toggle.setAttribute('aria-pressed', String(isDark));
    toggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    sun.style.display = isDark ? 'none' : 'block';
    moon.style.display = isDark ? 'block' : 'none';
  }

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme('dark');
  }

  toggle.addEventListener('click', function () {
    setTheme(body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  const pctText = document.getElementById('pctText');
  const pctSr = document.getElementById('pctSr');
  const TARGET = 82;
  const DURATION = 2400;
  const start = performance.now() + 300;

  function tick(now) {
    const elapsed = now - start;
    if (elapsed < 0) { requestAnimationFrame(tick); return; }
    const progress = Math.min(elapsed / DURATION, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(eased * TARGET);
    pctText.textContent = String(value).padStart(2, '0') + '%';
    if (progress >= 1) pctSr.textContent = 'Loading, ' + value + ' percent';
    if (progress < 1) requestAnimationFrame(tick);
  }

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    pctText.textContent = TARGET + '%';
  } else {
    requestAnimationFrame(tick);
  }

  const EMAILJS_PUBLIC_KEY = "wrNv2DhKAGsh-yE6g";
  const EMAILJS_SERVICE_ID = "service_5wxik6g";
  const EMAILJS_TEMPLATE_ID = "template_eb36ya5";

  if (window.emailjs && EMAILJS_PUBLIC_KEY) {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  let allowlist = null;

  async function loadAllowlist() {
    try {
      const res = await fetch('./allowed-emails.json', { cache: 'no-store' });
      allowlist = await res.json();
    } catch (err) {
      allowlist = { allowedDomains: [], allowedSpecificEmails: [] };
    }
  }
  loadAllowlist();

  function isAllowedEmail(email) {
    if (!allowlist) return false;
    const lower = email.trim().toLowerCase();
    const specific = (allowlist.allowedSpecificEmails || []).map(function (e) { return e.toLowerCase(); });
    if (specific.indexOf(lower) !== -1) return true;

    const domain = lower.split('@')[1] || '';
    const domains = (allowlist.allowedDomains || []).map(function (d) { return d.toLowerCase(); });
    return domains.indexOf(domain) !== -1;
  }

  function isValidEmailFormat(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  const captchaQuestionEl = document.getElementById('captchaQuestion');
  const captchaInput = document.getElementById('captchaAnswer');
  let captchaAnswer = null;

  function newCaptcha() {
    const a = Math.floor(Math.random() * 8) + 1;
    const b = Math.floor(Math.random() * 8) + 1;
    captchaAnswer = a + b;
    captchaQuestionEl.textContent = 'Quick check: ' + a + ' + ' + b + ' =';
    captchaInput.value = '';
    captchaInput.removeAttribute('aria-invalid');
  }
  newCaptcha();

  const form = document.getElementById('notifyForm');
  const emailInput = document.getElementById('notify-email');
  const companyInput = document.getElementById('notify-company');
  const submitBtn = document.getElementById('notifySubmit');
  const statusEl = document.getElementById('notify-status');

  function setStatus(message, state) {
    statusEl.textContent = message;
    statusEl.setAttribute('data-state', state || '');
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (companyInput.value.trim() !== '') {
      setStatus('Request sent — talk soon.', 'success');
      form.reset();
      newCaptcha();
      return;
    }

    const email = emailInput.value.trim();
    if (!isValidEmailFormat(email)) {
      emailInput.setAttribute('aria-invalid', 'true');
      setStatus('Enter a valid email address.', 'error');
      emailInput.focus();
      return;
    }
    emailInput.removeAttribute('aria-invalid');

    const answered = parseInt(captchaInput.value, 10);
    if (answered !== captchaAnswer) {
      captchaInput.setAttribute('aria-invalid', 'true');
      setStatus("That check didn't match — try the new one.", 'error');
      newCaptcha();
      captchaInput.focus();
      return;
    }
    captchaInput.removeAttribute('aria-invalid');

    if (!isAllowedEmail(email)) {
      setStatus('Please use an email from a major provider (Gmail, Outlook, iCloud, etc.).', 'error');
      return;
    }

    if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
      setStatus("Connection requests aren't wired up yet — check back soon.", 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = '...';
    setStatus('', '');

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        visitor_email: email,
        source: 'coming-soon page'
      });
      setStatus('Request sent — talk soon.', 'success');
      form.reset();
      newCaptcha();
    } catch (err) {
      setStatus('Something went wrong. Try again in a bit.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'GO';
    }
  });

  emailInput.addEventListener('input', function () {
    if (emailInput.getAttribute('aria-invalid') === 'true' && isValidEmailFormat(emailInput.value.trim())) {
      emailInput.removeAttribute('aria-invalid');
      setStatus('', '');
    }
  });
})();
