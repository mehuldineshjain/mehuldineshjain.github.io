/* ============================================================
   PORTFOLIO — main.js
   Handles: scroll animations, active nav, hamburger, footer year
   ============================================================ */

// ── FOOTER YEAR ──────────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ── HAMBURGER MENU ────────────────────────────────────────────
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobileMenu');
const mobLinks    = document.querySelectorAll('.mob-link');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  const isOpen = mobileMenu.classList.contains('open');
  hamburger.setAttribute('aria-expanded', isOpen);
  hamburger.querySelectorAll('span').forEach((s, i) => {
    if (isOpen) {
      if (i === 0) s.style.transform = 'rotate(45deg) translate(5px, 5px)';
      if (i === 1) s.style.opacity   = '0';
      if (i === 2) s.style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      s.style.transform = '';
      s.style.opacity   = '';
    }
  });
});

// Close mobile menu on link click
mobLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => {
      s.style.transform = '';
      s.style.opacity   = '';
    });
  });
});

// ── INTERSECTION OBSERVER — scroll-in animations ──────────────
const observeTargets = document.querySelectorAll(
  '.timeline-item, .award-card, [data-animate]'
);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, idx) => {
    if (entry.isIntersecting) {
      // stagger children in the same batch
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, (idx % 6) * 80);
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

observeTargets.forEach(el => observer.observe(el));

// ── ACTIVE NAV HIGHLIGHTING ───────────────────────────────────
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle(
          'active',
          link.getAttribute('href') === `#${entry.target.id}`
        );
      });
    }
  });
}, { threshold: 0.45 });

sections.forEach(section => sectionObserver.observe(section));

// ── NAV SCROLL SHADOW BOOST ───────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    nav.style.top = '12px';
  } else {
    nav.style.top = '20px';
  }
}, { passive: true });
