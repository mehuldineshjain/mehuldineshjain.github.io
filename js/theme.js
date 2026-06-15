/* ============================================================
   PORTFOLIO — theme.js
   Dark / light toggle. Persists choice in localStorage.
   Sets data-theme="dark" on <html>; CSS overrides the neu tokens.
   Honours the OS preference on first visit (no stored choice).
   ============================================================ */
(function (global) {
  'use strict';

  const KEY = 'portfolio-theme';
  const root = document.documentElement;

  function systemPrefersDark() {
    return global.matchMedia &&
      global.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function resolve() {
    const stored = localStorage.getItem(KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return systemPrefersDark() ? 'dark' : 'light';
  }

  function apply(theme) {
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    const btn = document.getElementById('themeToggle');
    if (btn) {
      const dark = theme === 'dark';
      btn.setAttribute('aria-pressed', String(dark));
      btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      btn.textContent = dark ? '☀' : '☾';
    }
  }

  function init() {
    apply(resolve());
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        localStorage.setItem(KEY, next);
        apply(next);
      });
    }
  }

  global.PortfolioTheme = { init: init };
})(window);
