/* ============================================================
   PORTFOLIO — builders/gallery.js
   Photo carousel (lightbox) + the categorized Gallery section.

   Photos live on the items themselves (project/volunteering/award
   `images: [{ src, caption }]`). This file:
     - PB.indexCarousels(data) — build the key→images lookup once
     - PB.galleryGroups(data)  — items-with-photos grouped by category
     - PB.galleryItemCount()   — total photographed items (cover count)
     - PB.photoBadge(key,n)    — the "📷 n" trigger on an item
     - PB.openCarousel(imgs,i) — the lightbox overlay
     - PB.galleryDetail(data)  — tabbed gallery section
   Triggers carry data-carousel="<key>"; main.js resolves + opens.
   ============================================================ */
(function (g) {
  "use strict";
  const PB = (g.PB = g.PB || {});
  const el = PB.el;

  // ── data helpers ───────────────────────────────────────────
  // category definitions reused by indexCarousels + galleryGroups so the
  // keys ("proj-0", "vol-2", …) always line up between badges and tiles.
  const CATS = [
    { key: "projects", label: "Projects", arrKey: "projects", titleKey: "title", prefix: "proj-" },
    { key: "volunteering", label: "Volunteering", arrKey: "volunteering", titleKey: "role", prefix: "vol-" },
    { key: "awards", label: "Awards", arrKey: "awards", titleKey: "title", prefix: "award-" },
  ];

  function normImages(arr) {
    return (arr || []).map((im) =>
      typeof im === "string" ? { src: im, caption: "" } : { src: im.src, caption: im.caption || "" },
    );
  }

  // Build window-level key→images map. Call once before the deck renders so
  // both item badges and gallery tiles resolve regardless of render order.
  PB.indexCarousels = function (data) {
    PB.carousels = {};
    CATS.forEach((c) => {
      (data[c.arrKey] || []).forEach((item, i) => {
        if (item.images && item.images.length) {
          PB.carousels[c.prefix + i] = normImages(item.images);
        }
      });
    });
    return PB.carousels;
  };

  // [{ key, label, items: [{ key, title, thumb, count }] }] for items w/ photos.
  PB.galleryGroups = function (data) {
    const groups = [];
    CATS.forEach((c) => {
      const items = [];
      (data[c.arrKey] || []).forEach((item, i) => {
        if (item.images && item.images.length) {
          const imgs = normImages(item.images);
          items.push({
            key: c.prefix + i,
            title: item[c.titleKey],
            thumb: imgs[0].src,
            count: imgs.length,
          });
        }
      });
      if (items.length) groups.push({ key: c.key, label: c.label, items: items });
    });
    return groups;
  };

  PB.galleryItemCount = function (data) {
    return PB.galleryGroups(data).reduce((n, grp) => n + grp.items.length, 0);
  };

  // ── photo badge (item-level trigger) ───────────────────────
  // Returned to projectItem / timelineItem / award card when images exist.
  PB.photoBadge = function (key, count) {
    return el(
      "button",
      {
        class: "photo-badge neu-flat",
        type: "button",
        "data-carousel": key,
        "aria-label": "View " + count + (count === 1 ? " photo" : " photos"),
      },
      ["📷 " + count],
    );
  };

  // ── carousel lightbox ──────────────────────────────────────
  let lb = null; // singleton DOM
  const state = { images: [], index: 0, trigger: null };

  function buildLightbox() {
    if (lb) return lb;
    const img = el("img", { class: "lightbox-img", alt: "" });
    const caption = el("figcaption", { class: "lightbox-caption" });
    const figure = el("figure", { class: "lightbox-figure" }, [img, caption]);
    const prev = el("button", { class: "lightbox-nav lightbox-prev neu-flat", type: "button", "aria-label": "Previous photo", html: "‹" });
    const next = el("button", { class: "lightbox-nav lightbox-next neu-flat", type: "button", "aria-label": "Next photo", html: "›" });
    const close = el("button", { class: "lightbox-close neu-flat", type: "button", "aria-label": "Close gallery", html: "✕" });
    const dots = el("div", { class: "lightbox-dots" });
    const dialog = el(
      "div",
      { class: "lightbox-dialog", role: "dialog", "aria-modal": "true", "aria-label": "Photo gallery" },
      [close, prev, figure, next, dots],
    );
    const overlay = el("div", { class: "lightbox-overlay", "aria-hidden": "true" }, [dialog]);
    document.body.appendChild(overlay);

    close.addEventListener("click", closeCarousel);
    prev.addEventListener("click", () => step(-1));
    next.addEventListener("click", () => step(1));
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeCarousel(); });
    dots.addEventListener("click", (e) => {
      const d = e.target.closest("[data-dot]");
      if (d) render(parseInt(d.getAttribute("data-dot"), 10));
    });
    // touch swipe on the figure
    let startX = null;
    figure.addEventListener("pointerdown", (e) => { startX = e.clientX; });
    figure.addEventListener("pointerup", (e) => {
      if (startX == null) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
      startX = null;
    });

    lb = { overlay, dialog, img, caption, prev, next, dots };
    return lb;
  }

  function render(i) {
    const imgs = state.images;
    if (!imgs.length) return;
    state.index = (i + imgs.length) % imgs.length;
    const cur = imgs[state.index];
    lb.img.src = cur.src;
    lb.img.alt = cur.caption || "Photo " + (state.index + 1) + " of " + imgs.length;
    lb.caption.textContent = cur.caption || "";
    const multi = imgs.length > 1;
    lb.prev.hidden = !multi;
    lb.next.hidden = !multi;
    // dots
    lb.dots.textContent = "";
    if (multi) {
      imgs.forEach((_, di) => {
        lb.dots.appendChild(
          el("button", {
            class: "lightbox-dot" + (di === state.index ? " active" : ""),
            type: "button",
            "data-dot": di,
            "aria-label": "Go to photo " + (di + 1),
            "aria-current": di === state.index ? "true" : "false",
          }),
        );
      });
    }
  }

  function step(delta) { render(state.index + delta); }

  function onKey(e) {
    switch (e.key) {
      case "ArrowLeft": e.preventDefault(); step(-1); break;
      case "ArrowRight": e.preventDefault(); step(1); break;
      case "Escape": e.preventDefault(); closeCarousel(); break;
      case "Tab": trapFocus(e); break;
    }
  }

  function trapFocus(e) {
    const f = lb.dialog.querySelectorAll("button:not([hidden])");
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  PB.openCarousel = function (images, startIndex) {
    if (!images || !images.length) return;
    buildLightbox();
    state.images = images;
    state.trigger = document.activeElement;
    render(startIndex || 0);
    lb.overlay.classList.add("open");
    lb.overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    document.addEventListener("keydown", onKey);
    lb.dialog.querySelector(".lightbox-close").focus();
  };

  function closeCarousel() {
    if (!lb) return;
    lb.overlay.classList.remove("open");
    lb.overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    document.removeEventListener("keydown", onKey);
    if (state.trigger && state.trigger.focus) state.trigger.focus();
  }
  PB.closeCarousel = closeCarousel;

  // ── gallery section (categorized tabs) ─────────────────────
  function tile(item) {
    return el(
      "button",
      {
        class: "gallery-item neu-raised",
        type: "button",
        "data-carousel": item.key,
        "aria-label": item.title + " — view " + item.count + (item.count === 1 ? " photo" : " photos"),
      },
      [
        el("figure", { class: "gallery-figure" }, [
          el("img", { src: item.thumb, alt: item.title, class: "gallery-img", loading: "lazy" }),
          item.count > 1
            ? el("span", { class: "gallery-count", "aria-hidden": "true", text: "📷 " + item.count })
            : null,
          el("figcaption", { class: "gallery-caption", text: item.title }),
        ]),
      ],
    );
  }

  function galleryDetail(data) {
    const groups = PB.galleryGroups(data);
    if (!groups.length) {
      return PB.detail([
        PB.heading("Gallery"),
        el("p", { class: "gallery-empty", text: "Photos coming soon." }),
      ]);
    }
    const tabs = el(
      "div",
      { class: "gallery-tabs", role: "tablist", "aria-label": "Gallery categories" },
      groups.map((grp, i) =>
        el("button", {
          class: "gallery-tab neu-flat" + (i === 0 ? " active" : ""),
          type: "button",
          role: "tab",
          "data-tab": grp.key,
          "aria-selected": i === 0 ? "true" : "false",
          text: grp.label + " (" + grp.items.length + ")",
        }),
      ),
    );
    const panels = groups.map((grp, i) =>
      el(
        "div",
        {
          class: "gallery-panel" + (i === 0 ? " active" : ""),
          role: "tabpanel",
          "data-panel": grp.key,
          hidden: i === 0 ? null : "hidden",
        },
        [el("div", { class: "gallery-grid" }, grp.items.map((it) => tile(it)))],
      ),
    );
    return PB.detail([PB.heading("Gallery"), tabs].concat(panels));
  }

  // switch active tab/panel within a gallery card (called from main.js)
  PB.switchGalleryTab = function (tabBtn) {
    const card = tabBtn.closest(".card-scroll") || document;
    const key = tabBtn.getAttribute("data-tab");
    card.querySelectorAll(".gallery-tab").forEach((t) => {
      const on = t === tabBtn;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    card.querySelectorAll(".gallery-panel").forEach((p) => {
      const on = p.getAttribute("data-panel") === key;
      p.classList.toggle("active", on);
      if (on) p.removeAttribute("hidden");
      else p.setAttribute("hidden", "hidden");
    });
  };

  PB.galleryDetail = galleryDetail;
})(window);
