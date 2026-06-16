/* ============================================================
   PORTFOLIO — main.js  (bootstrap)
   Wires the framework-free pieces together:
     theme  -> dark/light toggle
     deck   -> 2D swipe engine (reads registry + data)
     nav    -> sliding title (faint prev · bold current · faint next)
     dots   -> one per section, built from the registry
     keys   -> ←/→ sections, ↑/↓ cards, Home/End
     extras -> hero typewriter, "Explore" CTA, swipe hint, year
   No content here — everything comes from js/data.js.
   ============================================================ */
(function () {
  'use strict';

  const data = window.PORTFOLIO_DATA;
  const registry = window.PORTFOLIO_REGISTRY;
  const PB = window.PB || {};
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // build the carousel key→images lookup once (used by [data-carousel] clicks)
  if (PB.indexCarousels) PB.indexCarousels(data);

  // ── footer year ────────────────────────────────────────────
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── theme ──────────────────────────────────────────────────
  if (window.PortfolioTheme) window.PortfolioTheme.init();

  // ── deck ───────────────────────────────────────────────────
  const stage = document.getElementById('deckStage');
  const deck = window.createDeck({ stage: stage, registry: registry, data: data });

  // ── nav sliding title (prev · current · next) ──────────────
  const ntPrev = document.getElementById('ntPrev');
  const ntCur = document.getElementById('ntCur');
  const ntNext = document.getElementById('ntNext');
  const navTitle = document.getElementById('navTitle');
  if (ntPrev) ntPrev.addEventListener('click', () => deck.prev());
  if (ntNext) ntNext.addEventListener('click', () => deck.next());

  function updateTitle(col) {
    if (!navTitle) return;
    ntPrev.textContent = col > 0 ? registry[col - 1].label : '';
    ntCur.textContent = registry[col].label;
    ntNext.textContent = col < registry.length - 1 ? registry[col + 1].label : '';
    // retrigger the slide/fade animation
    navTitle.classList.remove('animate');
    void navTitle.offsetWidth; // force reflow
    navTitle.classList.add('animate');
  }

  // ── mobile menu links (built from registry; markup commented) ──
  const mobMenuEl = document.getElementById('mobileMenuList');
  if (mobMenuEl) {
    registry.forEach((entry, i) => {
      const a = document.createElement('a');
      a.href = '#' + entry.id;
      a.className = 'mob-link';
      a.textContent = entry.label;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        deck.goToSection(i);
        const menu = document.getElementById('mobileMenu');
        if (menu) menu.classList.remove('open');
      });
      mobMenuEl.appendChild(document.createElement('li')).appendChild(a);
    });
  }

  // ── progress dots (one per section) ────────────────────────
  const dotsEl = document.getElementById('deckDots');
  const dots = [];
  registry.forEach((entry, i) => {
    const dot = document.createElement('button');
    dot.className = 'deck-dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', 'Go to ' + entry.label);
    dot.addEventListener('click', () => deck.goToSection(i));
    dotsEl.appendChild(dot);
    dots.push(dot);
  });

  // ── reflect active section in title + dots ─────────────────
  function syncActive(col) {
    updateTitle(col);
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === col);
      d.setAttribute('aria-current', i === col ? 'true' : 'false');
    });
  }
  deck.onChange((col) => { syncActive(col); dismissHint(); });
  syncActive(deck.getSection());

  // ── left / right side arrows (persistent hint + control) ──
  const arrowLeft = document.getElementById('arrowLeft');
  const arrowRight = document.getElementById('arrowRight');
  if (arrowLeft) arrowLeft.addEventListener('click', () => deck.prev());
  if (arrowRight) arrowRight.addEventListener('click', () => deck.next());

  // ── nav logo (MJ.) -> jump home ────────────────────────────
  const navLogo = document.querySelector('.nav-logo');
  if (navLogo) navLogo.addEventListener('click', (e) => { e.preventDefault(); deck.goToSection(0); });

  // ── keyboard ───────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    switch (e.key) {
      case 'ArrowRight': e.preventDefault(); deck.next(); break;
      case 'ArrowLeft':  e.preventDefault(); deck.prev(); break;
      // ↓/↑ scroll the detail card; jump cards only at the scroll edge
      case 'ArrowDown':  e.preventDefault(); deck.nudge(1); break;
      case 'ArrowUp':    e.preventDefault(); deck.nudge(-1); break;
      case 'Home':       e.preventDefault(); deck.goToSection(0); break;
      case 'End':        e.preventDefault(); deck.goToSection(deck.getSectionCount() - 1); break;
      // Enter/Space activates a focused clickable affordance (cover-count, CTA, badge)
      case 'Enter':
      case ' ': {
        const a = document.activeElement;
        if (a && a.matches && a.matches('[data-action],[data-goto],[data-carousel],[data-tab]')) {
          e.preventDefault();
          a.click();
        }
        break;
      }
    }
  });

  // ── in-card actions: CTAs + section jumps + photo carousel ──
  stage.addEventListener('click', (e) => {
    // photo badge / gallery tile -> open the carousel
    const carousel = e.target.closest('[data-carousel]');
    if (carousel && PB.openCarousel) {
      e.preventDefault();
      const key = carousel.getAttribute('data-carousel');
      const imgs = (PB.carousels || {})[key];
      if (imgs) PB.openCarousel(imgs, 0);
      return;
    }
    // gallery category tab -> switch panel
    const tab = e.target.closest('[data-tab]');
    if (tab && PB.switchGalleryTab) { e.preventDefault(); PB.switchGalleryTab(tab); return; }
    // "Get in Touch" / cover affordance -> drop to the detail card below
    const trigger = e.target.closest('[data-action="down"]');
    if (trigger) { e.preventDefault(); deck.down(); return; }
    // "Explore My Work" -> jump to its linked section
    const goto = e.target.closest('[data-goto]');
    if (goto) {
      e.preventDefault();
      const id = goto.getAttribute('data-goto');
      const idx = registry.findIndex((s) => s.id === id);
      if (idx >= 0) deck.goToSection(idx);
    }
  });

  // ── swipe hint: dismiss on first navigation ────────────────
  let hintGone = false;
  function dismissHint() {
    if (hintGone) return;
    hintGone = true;
    const hint = document.getElementById('swipeHint');
    if (hint) hint.classList.add('hidden');
  }

  // ── hero typewriter (kept by request) ──────────────────────
  const roleEl = stage.querySelector('.deck-card[data-id="home"][data-row="0"] .hero-title');
  if (roleEl && !reduce && data.profile.roles.length > 1) {
    const roles = data.profile.roles;
    let roleIdx = 0, charIdx = 0, deleting = false;
    roleEl.innerHTML = '<span class="type-text"></span><span class="type-cursor">|</span>';
    const textEl = roleEl.querySelector('.type-text');
    const type = () => {
      const word = roles[roleIdx];
      charIdx += deleting ? -1 : 1;
      textEl.textContent = word.slice(0, charIdx);
      let delay = deleting ? 45 : 80;
      if (!deleting && charIdx === word.length) { delay = 1800; deleting = true; }
      else if (deleting && charIdx === 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        delay = 400;
      }
      setTimeout(type, delay);
    };
    setTimeout(type, 900);
  }

  // ── hamburger (EXPERIMENTAL — markup commented out in index.html) ──
  // To re-enable: uncomment the hamburger button + #mobileMenu markup
  // in index.html. Safe to delete this block if you drop the feature.
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      const isOpen = mobileMenu.classList.contains('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
      hamburger.querySelectorAll('span').forEach((s, i) => {
        if (isOpen) {
          if (i === 0) s.style.transform = 'rotate(45deg) translate(5px, 5px)';
          if (i === 1) s.style.opacity = '0';
          if (i === 2) s.style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
          s.style.transform = '';
          s.style.opacity = '';
        }
      });
    });
  }
})();
