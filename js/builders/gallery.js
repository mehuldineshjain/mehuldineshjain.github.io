/* ============================================================
   PORTFOLIO — builders/gallery.js
   Photo/video carousel (lightbox) + the categorized Gallery section.

   Two media shapes are supported on items:
     - flat:   item.images = [{ src, caption }]            (projects, awards)
     - nested: item.events = [{ name, date, media:[...] }] (volunteering)
   A media entry is an image by default; add `type: "video"`
   (+ optional `poster`) for a clip.

   Carousel keys:
     proj-<i> / award-<i>     — a flat item's images
     vol-<i>                  — ALL of an org's media (item photo badge)
     vol-<i>-evt-<j>          — one event's media (gallery tile)

   This file exposes:
     PB.indexCarousels(data) — build the key→media lookup once
     PB.mediaCount(item)     — total media on an item (events or images)
     PB.galleryGroups(data)  — items-with-media grouped by category → org
     PB.galleryItemCount()   — total tiles (cover count)
     PB.photoBadge(key,n)    — the "📷 n" trigger on an item
     PB.openCarousel(m,i)    — the lightbox overlay (image + video)
     PB.galleryDetail(data)  — tabbed gallery section
   ============================================================ */
(function (g) {
  "use strict";
  const PB = (g.PB = g.PB || {});
  const el = PB.el;

  // ── data helpers ───────────────────────────────────────────
  // category definitions reused by indexCarousels + galleryGroups so the
  // keys ("proj-0", "vol-2-evt-1", …) line up between badges and tiles.
  const CATS = [
    { key: "projects", label: "Projects", arrKey: "projects", titleKey: "title", prefix: "proj-" },
    { key: "volunteering", label: "Volunteering", arrKey: "volunteering", titleKey: "role", prefix: "vol-" },
    { key: "awards", label: "Awards", arrKey: "awards", titleKey: "title", prefix: "award-" },
  ];

  // normalize one media entry → { type, src, caption, poster }
  function normMedia(arr) {
    return (arr || []).map((m) => {
      if (typeof m === "string") return { type: "image", src: m, caption: "", poster: "" };
      return {
        type: m.type === "video" ? "video" : "image",
        src: m.src,
        caption: m.caption || "",
        poster: m.poster || "",
      };
    });
  }

  // every media entry on an item, flattened (events.media… or images)
  function itemMedia(item) {
    if (item.events && item.events.length) {
      return item.events.reduce((acc, ev) => acc.concat(normMedia(ev.media)), []);
    }
    if (item.images && item.images.length) return normMedia(item.images);
    return [];
  }

  PB.mediaCount = function (item) {
    return itemMedia(item).length;
  };

  // first image src (for a tile thumbnail); fall back to a video poster.
  function thumbOf(media) {
    const img = media.find((m) => m.type === "image");
    if (img) return img.src;
    const vid = media.find((m) => m.poster);
    return vid ? vid.poster : (media[0] && media[0].src) || "";
  }

  // Build window-level key→media map. Call once before the deck renders so
  // both item badges and gallery tiles resolve regardless of render order.
  PB.indexCarousels = function (data) {
    PB.carousels = {};
    CATS.forEach((c) => {
      (data[c.arrKey] || []).forEach((item, i) => {
        const all = itemMedia(item);
        if (all.length) PB.carousels[c.prefix + i] = all; // org/item-level
        // per-event keys (volunteering): vol-<i>-evt-<j>
        if (item.events && item.events.length) {
          item.events.forEach((ev, j) => {
            const m = normMedia(ev.media);
            if (m.length) PB.carousels[c.prefix + i + "-evt-" + j] = m;
          });
        }
      });
    });
    return PB.carousels;
  };

  // Categorized gallery model:
  //   [{ key, label, blocks: [ { title|null, items: [tile] } ] }]
  // tile = { key, title, thumb, count, hasVideo }
  // Flat categories (projects/awards) → one untitled block.
  // Nested categories (volunteering) → one block per org, items per event.
  PB.galleryGroups = function (data) {
    const groups = [];
    CATS.forEach((c) => {
      const blocks = [];
      (data[c.arrKey] || []).forEach((item, i) => {
        if (item.events && item.events.length) {
          // one block per org; a tile per event
          const items = [];
          item.events.forEach((ev, j) => {
            const m = normMedia(ev.media);
            if (!m.length) return;
            items.push({
              key: c.prefix + i + "-evt-" + j,
              title: ev.name || item[c.titleKey],
              thumb: thumbOf(m),
              count: m.length,
              hasVideo: m.some((x) => x.type === "video"),
            });
          });
          if (items.length) blocks.push({ title: item.org || item[c.titleKey], items: items });
        } else if (item.images && item.images.length) {
          // flat item → a single untitled block (merged below)
          const m = normMedia(item.images);
          blocks.push({
            title: null,
            items: [{
              key: c.prefix + i,
              title: item[c.titleKey],
              thumb: thumbOf(m),
              count: m.length,
              hasVideo: m.some((x) => x.type === "video"),
            }],
          });
        }
      });
      if (!blocks.length) return;
      // merge the untitled (flat) blocks into one so they share a grid
      const merged = [];
      let flat = null;
      blocks.forEach((b) => {
        if (b.title == null) {
          if (!flat) { flat = { title: null, items: [] }; merged.push(flat); }
          flat.items = flat.items.concat(b.items);
        } else {
          merged.push(b);
        }
      });
      groups.push({ key: c.key, label: c.label, blocks: merged });
    });
    return groups;
  };

  PB.galleryItemCount = function (data) {
    return PB.galleryGroups(data).reduce(
      (n, grp) => n + grp.blocks.reduce((m, b) => m + b.items.length, 0),
      0,
    );
  };

  // ── photo badge (item-level trigger) ───────────────────────
  // Returned to projectItem / timelineItem / award card when media exist.
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
  const state = { media: [], index: 0, trigger: null };

  function buildLightbox() {
    if (lb) return lb;
    const img = el("img", { class: "lightbox-img", alt: "" });
    const video = el("video", {
      class: "lightbox-video",
      controls: "controls",
      preload: "metadata",
      playsinline: "playsinline",
    });
    video.hidden = true;
    const caption = el("figcaption", { class: "lightbox-caption" });
    const figure = el("figure", { class: "lightbox-figure" }, [img, video, caption]);
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
    // touch swipe on the figure (ignored while interacting with video controls)
    let startX = null;
    figure.addEventListener("pointerdown", (e) => {
      startX = e.target === video ? null : e.clientX;
    });
    figure.addEventListener("pointerup", (e) => {
      if (startX == null) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
      startX = null;
    });

    lb = { overlay, dialog, img, video, caption, prev, next, dots };
    return lb;
  }

  // stop + unload the <video> (on nav away / close)
  function resetVideo() {
    if (!lb) return;
    try { lb.video.pause(); } catch (e) { /* noop */ }
    lb.video.removeAttribute("src");
    lb.video.removeAttribute("poster");
    lb.video.hidden = true;
  }

  function render(i) {
    const media = state.media;
    if (!media.length) return;
    state.index = (i + media.length) % media.length;
    const cur = media[state.index];

    if (cur.type === "video") {
      lb.img.hidden = true;
      lb.img.removeAttribute("src");
      lb.video.hidden = false;
      lb.video.src = cur.src;
      if (cur.poster) lb.video.poster = cur.poster;
      else lb.video.removeAttribute("poster");
      lb.video.load();
    } else {
      resetVideo();
      lb.img.hidden = false;
      lb.img.src = cur.src;
      lb.img.alt = cur.caption || "Photo " + (state.index + 1) + " of " + media.length;
    }
    lb.caption.textContent = cur.caption || "";

    const multi = media.length > 1;
    lb.prev.hidden = !multi;
    lb.next.hidden = !multi;
    // dots
    lb.dots.textContent = "";
    if (multi) {
      media.forEach((_, di) => {
        lb.dots.appendChild(
          el("button", {
            class: "lightbox-dot" + (di === state.index ? " active" : ""),
            type: "button",
            "data-dot": di,
            "aria-label": "Go to item " + (di + 1),
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

  PB.openCarousel = function (media, startIndex) {
    if (!media || !media.length) return;
    buildLightbox();
    state.media = media;
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
    resetVideo();
    lb.overlay.classList.remove("open");
    lb.overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    document.removeEventListener("keydown", onKey);
    if (state.trigger && state.trigger.focus) state.trigger.focus();
  }
  PB.closeCarousel = closeCarousel;

  // ── gallery section (categorized tabs → org blocks → tiles) ─
  function tile(item) {
    return el(
      "button",
      {
        class: "gallery-item neu-raised",
        type: "button",
        "data-carousel": item.key,
        "aria-label": item.title + " — view " + item.count + (item.count === 1 ? " item" : " items"),
      },
      [
        el("figure", { class: "gallery-figure" }, [
          el("img", { src: item.thumb, alt: item.title, class: "gallery-img", loading: "lazy" }),
          item.hasVideo
            ? el("span", { class: "gallery-video-badge", "aria-hidden": "true", text: "▶" })
            : null,
          item.count > 1
            ? el("span", { class: "gallery-count", "aria-hidden": "true", text: "📷 " + item.count })
            : null,
          el("figcaption", { class: "gallery-caption", text: item.title }),
        ]),
      ],
    );
  }

  // a panel's content: optional org sub-heading + a tile grid, per block
  function blockNodes(grp) {
    const nodes = [];
    grp.blocks.forEach((b) => {
      if (b.title) nodes.push(el("h3", { class: "gallery-block-title", text: b.title }));
      nodes.push(el("div", { class: "gallery-grid" }, b.items.map((it) => tile(it))));
    });
    return nodes;
  }

  function galleryDetail(data) {
    const groups = PB.galleryGroups(data);
    if (!groups.length) {
      return PB.detail([
        PB.heading("Gallery"),
        el("p", { class: "gallery-empty", text: "Photos coming soon." }),
      ]);
    }
    const countOf = (grp) => grp.blocks.reduce((m, b) => m + b.items.length, 0);
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
          text: grp.label + " (" + countOf(grp) + ")",
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
        blockNodes(grp),
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
