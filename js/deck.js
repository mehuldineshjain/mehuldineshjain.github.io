/* ============================================================
   PORTFOLIO — deck.js
   2D swipeable 3D card-deck engine. Framework-free.

   Grid model:
     - columns = sections (horizontal): left / right
     - rows    = cards within a section (vertical): up / down
         row 0  = cover  (fixed hero size, never scrolls)
         row 1+ = detail (scrolls internally)

   Reads PORTFOLIO_REGISTRY (sections + builders) + PORTFOLIO_DATA.

   Behaviour:
     - 3D stack: the leaving card recedes behind the deck; the
       incoming card rises from behind into frame (both axes).
     - pointer drag (touch / pen only — mouse is ignored on desktop),
       axis-locked (commit ~80px OR ~400px/s).
       Horizontal moves sections (resets to the cover). Vertical
       moves cards; if the front card can scroll in that direction
       it scrolls natively instead of navigating.
     - horizontal trackpad wheel  -> change section
       vertical wheel             -> scroll detail, or change card
       at the scroll boundary. One flick = one move (debounced).
     - rubber-band at every edge (no wrap).
     - prefers-reduced-motion -> crossfade only, no drag.
     - ARIA carousel semantics.

   Public API:
     goToSection(col), next(), prev(), down(), up(),
     getSection(), getRow(), getSectionCount(), getRowCount(col),
     onChange(cb(col,row))

   MIGRATION NOTE (vanilla -> React): replace this file with a
   framer-motion deck; keep the public API so main.js/nav/dots work.
   ============================================================ */
(function (global) {
  'use strict';

  const COMMIT_DISTANCE = 80;   // px
  const COMMIT_VELOCITY = 0.4;  // px/ms == 400 px/s
  const RUBBER = 0.32;
  const HX = 44, HZ = 140;      // horizontal peek / depth
  const VY = 46, VZ = 150;      // vertical peek / depth
  const KEY_SCROLL_STEP = 80;   // px scrolled per Arrow press inside a card

  function clamp(min, max, v) { return Math.max(min, Math.min(max, v)); }

  function createDeck(opts) {
    const stage = opts.stage;
    const sections = opts.registry;
    const data = opts.data;
    const reduce = global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const nSec = sections.length;
    const pos = { col: 0, row: 0 };
    const changeCbs = [];
    const grid = []; // grid[col] = [{ el, scrollable }, ...]

    // ── ARIA on stage ─────────────────────────────────────────
    stage.setAttribute('role', 'region');
    stage.setAttribute('aria-roledescription', 'carousel');
    stage.setAttribute('aria-label', 'Portfolio sections');
    stage.tabIndex = 0;
    if (reduce) stage.classList.add('reduce-motion');

    // ── build cards ───────────────────────────────────────────
    sections.forEach((section, col) => {
      const rows = [];
      section.cards.forEach((cardDef, row) => {
        const card = document.createElement('article');
        card.className = 'deck-card neu-raised' + (cardDef.scrollable ? ' is-scroll' : ' is-cover');
        card.dataset.id = section.id;
        card.dataset.col = col;
        card.dataset.row = row;
        card.setAttribute('role', 'group');
        card.setAttribute('aria-roledescription', 'slide');
        card.setAttribute('aria-label',
          'section ' + (col + 1) + ' of ' + nSec + ': ' + section.label +
          (section.cards.length > 1 ? ' (card ' + (row + 1) + ' of ' + section.cards.length + ')' : ''));

        card.appendChild(cardDef.build(data));

        // vertical cues — clickable, navigate like the arrow keys.
        // ↓ shown when a card sits below; ↑ shown when one sits above.
        // labels come from the registry card's `cue` / `cueUp` fields.
        if (row < section.cards.length - 1) {
          const dn = document.createElement('button');
          dn.type = 'button';
          dn.className = 'card-cue card-cue--down';
          dn.setAttribute('aria-label', 'Go to ' + (cardDef.cue || 'next card'));
          dn.textContent = '↓ ' + (cardDef.cue || 'more');
          dn.addEventListener('click', function (e) { e.preventDefault(); down(); });
          card.appendChild(dn);
        }
        if (row > 0) {
          const upBtn = document.createElement('button');
          upBtn.type = 'button';
          upBtn.className = 'card-cue card-cue--up';
          upBtn.setAttribute('aria-label', 'Go to ' + (cardDef.cueUp || 'previous card'));
          upBtn.textContent = '↑ ' + (cardDef.cueUp || 'back');
          upBtn.addEventListener('click', function (e) { e.preventDefault(); up(); });
          card.appendChild(upBtn);
        }

        stage.appendChild(card);
        rows.push({ el: card, scrollable: !!cardDef.scrollable });
      });
      grid.push(rows);
    });

    function frontCard() { return grid[pos.col][pos.row]; }
    function rowCount(col) { return grid[col].length; }

    // ── transforms ─────────────────────────────────────────────
    function applyTransforms(dx, dy) {
      dx = dx || 0; dy = dy || 0;
      for (let col = 0; col < nSec; col++) {
        for (let row = 0; row < grid[col].length; row++) {
          const card = grid[col][row].el;
          // circular (cyclical) horizontal distance: last wraps to first
          let dcol = col - pos.col;
          if (nSec > 1) {
            if (dcol > nSec / 2) dcol -= nSec;
            else if (dcol < -nSec / 2) dcol += nSec;
          }
          const drow = row - pos.row;
          const front = dcol === 0 && drow === 0;

          if (reduce) {
            card.style.transform = 'translate(-50%, -50%)';
            card.style.opacity = front ? '1' : '0';
            card.style.zIndex = front ? '40' : '1';
            card.style.pointerEvents = front ? 'auto' : 'none';
            card.setAttribute('aria-hidden', front ? 'false' : 'true');
            continue;
          }

          let t = 'translate(-50%, -50%) ';
          let op = 0, z = 1, pe = 'none';

          if (front) {
            t += 'translateX(' + dx + 'px) translateY(' + dy + 'px) translateZ(0px) ' +
                 'rotateY(' + (dx * -0.02) + 'deg) rotateX(' + (dy * 0.02) + 'deg) scale(1)';
            op = 1; z = 40; pe = 'auto';
          } else if (dcol === 0) {
            // same section, other rows (vertical stack)
            if (drow > 0) {
              const peek = VY * drow + (dy < 0 ? dy : 0) * 0.06;
              t += 'translateY(' + peek + 'px) translateZ(' + (-VZ * drow) + 'px) rotateX(6deg) scale(' + (1 - 0.06 * drow) + ')';
              op = drow <= 2 ? 0.5 - 0.22 * (drow - 1) : 0; z = 40 - drow;
            } else {
              t += 'translateY(-130%) translateZ(-90px) rotateX(-14deg) scale(0.92)';
              op = 0; z = 5 + drow;
            }
          } else {
            // other section: only the cover (row 0) joins the horizontal stack
            if (row !== 0) {
              card.style.transform = 'translate(-50%, -50%) scale(0.9)';
              card.style.opacity = '0';
              card.style.zIndex = '0';
              card.style.pointerEvents = 'none';
              card.setAttribute('aria-hidden', 'true');
              continue;
            }
            if (dcol > 0) {
              const peek = HX * dcol + (dx < 0 ? dx : 0) * 0.06;
              t += 'translateX(' + peek + 'px) translateZ(' + (-HZ * dcol) + 'px) rotateY(-6deg) scale(' + (1 - 0.06 * dcol) + ')';
              op = dcol <= 2 ? 0.5 - 0.22 * (dcol - 1) : 0; z = 40 - dcol;
            } else {
              t += 'translateX(-130%) translateZ(-90px) rotateY(16deg) scale(0.92)';
              op = 0; z = 5 + dcol;
            }
          }

          card.style.transform = t;
          card.style.opacity = String(op);
          card.style.zIndex = String(z);
          card.style.pointerEvents = pe;
          card.setAttribute('aria-hidden', front ? 'false' : 'true');
        }
      }
    }

    function setDragging(on) {
      const c = frontCard().el;
      c.classList.toggle('dragging', on);
    }

    function updateCues() {
      // show cues only on the front card: ↓ if a card sits below, ↑ if above
      grid.forEach((rows, col) =>
        rows.forEach((c, row) => {
          const isFront = col === pos.col && row === pos.row;
          c.el.classList.toggle('has-more', isFront && row < rowCount(col) - 1);
          c.el.classList.toggle('has-prev', isFront && row > 0);
        }));
    }

    function emit() { changeCbs.forEach((cb) => cb(pos.col, pos.row)); }

    // ── navigation ─────────────────────────────────────────────
    let vTimer = null;
    function setPos(col, row, silent) {
      col = clamp(0, nSec - 1, col);
      row = clamp(0, rowCount(col) - 1, row);
      if (col === pos.col && row === pos.row) { applyTransforms(0, 0); return; }
      // vertical moves (same section, different row) animate slower/smoother
      const vertical = col === pos.col;
      if (vertical) {
        stage.classList.add('v-move');
        clearTimeout(vTimer);
        vTimer = setTimeout(() => stage.classList.remove('v-move'), 900);
      } else {
        stage.classList.remove('v-move');
      }
      pos.col = col; pos.row = row;
      applyTransforms(0, 0);
      const sc = grid[col][row].el.querySelector('.card-scroll');
      if (sc) sc.scrollTop = 0;
      updateCues();
      if (!silent) emit();
    }
    function goToSection(col) { setPos(col, 0); }
    // horizontal is cyclical — wrap around at both ends
    function next() { setPos(nSec ? (pos.col + 1) % nSec : 0, 0); }
    function prev() { setPos((pos.col - 1 + nSec) % nSec, 0); }
    function down() { setPos(pos.col, pos.row + 1); }
    function up() { setPos(pos.col, pos.row - 1); }

    // vertical key nudge: scroll the detail card a step if it can scroll
    // that way; otherwise move to the next/previous card (cover <-> detail)
    function nudge(dir) {
      if (canScroll(dir)) {
        const sc = frontCard().el.querySelector('.card-scroll');
        if (sc) sc.scrollBy({ top: dir * KEY_SCROLL_STEP, behavior: 'smooth' });
        return;
      }
      if (dir > 0) down(); else up();
    }

    // can the current front card scroll in the given direction? (delta>0 == down)
    function canScroll(delta) {
      const c = frontCard();
      if (!c.scrollable) return false;
      const sc = c.el.querySelector('.card-scroll');
      if (!sc || sc.scrollHeight <= sc.clientHeight + 2) return false;
      if (delta > 0) return sc.scrollTop + sc.clientHeight < sc.scrollHeight - 1;
      return sc.scrollTop > 1;
    }

    // ── pointer drag ───────────────────────────────────────────
    // axis: null | 'x' (sections) | 'y' (cards) | 'scroll' (manual
    // scroll of a detail card; stage has touch-action:none so we must
    // drive the inner scroll ourselves on touch)
    if (!reduce) {
      let dragging = false, axis = null;
      let startX = 0, startY = 0, lastX = 0, lastY = 0, lastT = 0, vx = 0, vy = 0;
      let scrollEl = null, scrollStart = 0;

      const onDown = (e) => {
        if (e.target.closest('a, button')) return;
        // desktop: a mouse should not drag the whole card — it confuses
        // (use arrows / dots / keys / wheel + the count & ↓/↑ buttons).
        // touch + pen still swipe, so touchscreen laptops are unaffected.
        if (e.pointerType === 'mouse') return;
        dragging = true; axis = null;
        startX = lastX = e.clientX;
        startY = lastY = e.clientY;
        lastT = performance.now(); vx = vy = 0;
      };

      const onMove = (e) => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (axis === null) {
          if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
          if (Math.abs(dx) > Math.abs(dy)) {
            axis = 'x';
          } else if (canScroll(dy < 0 ? 1 : -1)) {
            // the detail card can scroll this way — scroll it, don't navigate
            axis = 'scroll';
            scrollEl = frontCard().el.querySelector('.card-scroll');
            scrollStart = scrollEl ? scrollEl.scrollTop : 0;
          } else {
            axis = 'y';
          }
          if (axis === 'x' || axis === 'y') setDragging(true);
          if (stage.setPointerCapture) stage.setPointerCapture(e.pointerId);
        }
        if (axis === null) return;
        e.preventDefault();

        if (axis === 'scroll') {
          if (scrollEl) scrollEl.scrollTop = scrollStart - dy;
          return;
        }

        const now = performance.now();
        const dt = now - lastT || 16;
        vx = (e.clientX - lastX) / dt;
        vy = (e.clientY - lastY) / dt;
        lastX = e.clientX; lastY = e.clientY; lastT = now;

        if (axis === 'x') {
          // cyclical horizontally — no end rubber-band
          applyTransforms(dx, 0);
        } else {
          let eff = dy;
          const atTopRow = pos.row === 0;
          const atBottomRow = pos.row === rowCount(pos.col) - 1;
          if ((atTopRow && dy > 0) || (atBottomRow && dy < 0)) eff = dy * RUBBER;
          applyTransforms(0, eff);
        }
      };

      const onUp = (e) => {
        if (!dragging) return;
        dragging = false;
        if (axis !== 'x' && axis !== 'y') { axis = null; scrollEl = null; return; }
        setDragging(false);

        if (axis === 'x') {
          const dx = e.clientX - startX;
          const commit = Math.abs(dx) > COMMIT_DISTANCE || Math.abs(vx) > COMMIT_VELOCITY;
          if (commit && dx < 0) next();        // wraps last -> first
          else if (commit && dx > 0) prev();   // wraps first -> last
          else applyTransforms(0, 0);
        } else {
          const dy = e.clientY - startY;
          const commit = Math.abs(dy) > COMMIT_DISTANCE || Math.abs(vy) > COMMIT_VELOCITY;
          if (commit && dy < 0 && pos.row < rowCount(pos.col) - 1) down();
          else if (commit && dy > 0 && pos.row > 0) up();
          else applyTransforms(0, 0);
        }
        axis = null;
      };

      stage.addEventListener('pointerdown', onDown);
      stage.addEventListener('pointermove', onMove, { passive: false });
      stage.addEventListener('pointerup', onUp);
      stage.addEventListener('pointercancel', onUp);
    }

    // ── wheel / trackpad ───────────────────────────────────────
    if (!reduce) {
      let cooling = false, settle = null;
      const cool = () => {
        clearTimeout(settle);
        settle = setTimeout(() => { cooling = false; }, 280);
      };
      stage.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          // horizontal -> sections
          e.preventDefault(); cool();
          if (cooling) return;
          cooling = true;
          if (e.deltaX > 0) next(); else prev();
          return;
        }
        // vertical -> let the detail card scroll until its boundary
        if (canScroll(e.deltaY > 0 ? 1 : -1)) return; // native scroll, don't hijack
        e.preventDefault(); cool();
        if (cooling) return;
        cooling = true;
        if (e.deltaY > 0) down(); else up();
      }, { passive: false });
    }

    // ── recompute cues on resize (sizes are viewport-relative) ──
    global.addEventListener('resize', updateCues, { passive: true });

    // ── init ───────────────────────────────────────────────────
    applyTransforms(0, 0);
    updateCues();

    return {
      goToSection: goToSection,
      next: next, prev: prev, down: down, up: up, nudge: nudge,
      getSection: function () { return pos.col; },
      getRow: function () { return pos.row; },
      getSectionCount: function () { return nSec; },
      getRowCount: function (col) { return rowCount(col == null ? pos.col : col); },
      onChange: function (cb) { changeCbs.push(cb); },
    };
  }

  global.createDeck = createDeck;
})(window);
