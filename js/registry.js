/* ============================================================
   PORTFOLIO — registry.js
   THE single source of truth for deck order + nav + dots.

   2D model:
     - Horizontal axis = sections (one per nav item).
     - Vertical axis   = cards within a section.
         row 0  = COVER card  (fixed hero size, NOT scrollable)
         row 1+ = DETAIL card (scrollable, holds the full content)

   Shape:
     {
       id, label,
       cards: [
         { build(data) -> HTMLElement, scrollable: false },  // cover
         { build(data) -> HTMLElement, scrollable: true  },  // detail (optional)
       ]
     }

   deck.js renders this grid; nav + dots read the same array.

   MIGRATION NOTE (vanilla -> React):
   Keep this shape. Replace each `build(data)` with a component;
   the deck maps over sections/cards identically. data.js unchanged.
   ============================================================ */
(function (global) {
  "use strict";

  // ── tiny DOM helpers (vanilla-only; React replaces these) ──
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (attrs[k] == null) continue;
        if (k === "class") node.className = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else node.setAttribute(k, attrs[k]);
      }
    }
    (children || []).forEach((c) => {
      if (c == null) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  const ICONS = {
    github:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>',
    linkedin:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>',
  };

  // ── wrappers ───────────────────────────────────────────────
  // cover: fixed, centered, never scrolls
  function cover(children, extraClass) {
    return el(
      "div",
      { class: "card-cover" + (extraClass ? " " + extraClass : "") },
      [el("div", { class: "cover-inner" }, children)],
    );
  }
  // detail: scrollable region
  function detail(children) {
    return el("div", { class: "card-body" }, [
      el("div", { class: "card-scroll", tabindex: "-1" }, children),
    ]);
  }

  function heading(title, accentWord) {
    if (accentWord && title.indexOf(accentWord) !== -1) {
      const plain = title.replace(accentWord, "").trim();
      return el("h2", { class: "card-title" }, [
        plain + " ",
        el("span", { class: "accent", text: accentWord }),
      ]);
    }
    return el("h2", { class: "card-title", text: title });
  }

  // cover for multi-entry sections: big title + count + cue
  function countCover(title, accentWord, count, noun) {
    // the "↓ detail" affordance is the deck-level cue (see card `cue` field)
    return cover(
      [
        el(
          "h2",
          { class: "cover-title" },
          accentWord
            ? [
                title.replace(accentWord, "").trim() + " ",
                el("span", { class: "accent", text: accentWord }),
              ]
            : [title],
        ),
        el("p", { class: "cover-count", text: count + " " + noun }),
      ],
      "cover-count",
    );
  }

  // a timeline entry (Experience / Education / Volunteering detail)
  function timelineItem(entry, dotClass) {
    return el("div", { class: "timeline-item visible" }, [
      el("div", { class: "timeline-marker neu-raised" }, [
        el("span", { class: "timeline-dot " + (dotClass || "") }),
      ]),
      el("div", { class: "timeline-content neu-raised" }, [
        el("div", { class: "timeline-header" }, [
          el("div", {}, [
            el("h3", { class: "timeline-role", text: entry.role }),
            el("p", { class: "timeline-org", text: entry.org }),
          ]),
          el("span", { class: "timeline-date neu-inset", text: entry.date }),
        ]),
        el(
          "ul",
          { class: "timeline-bullets" },
          entry.bullets.map((b) => el("li", { text: b })),
        ),
        entry.tags && entry.tags.length
          ? el(
              "div",
              { class: "timeline-tags" },
              entry.tags.map((t) => el("span", { class: "mini-tag", text: t })),
            )
          : null,
      ]),
    ]);
  }

  // ── covers / details per section ────────────────────────────

  function heroCover(data) {
    const p = data.profile;
    return cover(
      [
        el("div", { class: "hero-avatar neu-inset" }, [
          el("img", {
            src: p.avatar,
            alt: "Profile photo",
            class: "avatar-img",
          }),
        ]),
        el("h1", { class: "hero-name", text: p.name }),
        // .hero-title gets the typewriter wired by main.js
        el("p", { class: "hero-title", text: p.roles[0] }),
        el("p", { class: "hero-tagline", text: p.tagline }),
        el("div", { class: "hero-ctas" }, [
          el(
            "a",
            {
              class: "btn-primary neu-raised",
              href: "#about",
              "data-action": "down",
            },
            ["Explore My Work"],
          ),
          el("a", { class: "btn-ghost neu-flat", href: "mailto:" + p.email }, [
            "Get in Touch",
          ]),
        ]),
      ],
      "hero-cover",
    );
  }

  function aboutDetail(data) {
    const p = data.profile;
    return detail([
      heading("About Me", "Me"),
      el(
        "div",
        { class: "about-bio-block" },
        p.bio.map((para) => el("p", { text: para })),
      ),
      el(
        "div",
        { class: "about-links" },
        p.links.map((l) =>
          el("a", {
            href: l.href,
            class: "icon-link neu-raised",
            "aria-label": l.label,
            target: l.icon === "mail" ? null : "_blank",
            rel: l.icon === "mail" ? null : "noopener",
            html: ICONS[l.icon] || "",
          }),
        ),
      ),
    ]);
  }

  function skillsCover(data) {
    return cover(
      [
        el("h2", { class: "cover-title" }, [
          "Core ",
          el("span", { class: "accent", text: "Skills" }),
        ]),
        el(
          "div",
          { class: "skill-tags" },
          data.skills.map((s) =>
            el("span", { class: "skill-tag neu-inset", text: s }),
          ),
        ),
      ],
      "skills-cover",
    );
  }

  function experienceDetail(data) {
    return detail([
      heading("Work Experience", "Experience"),
      el(
        "div",
        { class: "timeline" },
        data.experience.map((e) => timelineItem(e, "")),
      ),
    ]);
  }
  function educationDetail(data) {
    return detail([
      heading("Education"),
      el(
        "div",
        { class: "timeline" },
        data.education.map((e) => timelineItem(e, "edu-dot")),
      ),
    ]);
  }
  function awardsDetail(data) {
    return detail([
      heading("Awards & Recognition", "Recognition"),
      el(
        "div",
        { class: "awards-grid" },
        data.awards.map((a) =>
          el("div", { class: "award-card neu-raised" }, [
            el("div", { class: "award-icon neu-inset", text: a.icon }),
            el("div", { class: "award-body" }, [
              el("span", { class: "award-year", text: a.year }),
              el("h3", { class: "award-title", text: a.title }),
              el("p", { class: "award-org", text: a.org }),
              el("p", { class: "award-desc", text: a.desc }),
            ]),
          ]),
        ),
      ),
    ]);
  }
  function volunteeringDetail(data) {
    return detail([
      heading("Volunteering & Leadership", "Leadership"),
      el(
        "div",
        { class: "timeline" },
        data.volunteering.map((e) => timelineItem(e, "vol-dot")),
      ),
    ]);
  }

  function projectsDetail(data) {
    return detail([
      heading("Projects"),
      el(
        "div",
        { class: "timeline" },
        data.projects.map((e) => timelineItem(e, "vol-dot")),
      ),
    ]);
  }

  // ── the registry (sections) ─────────────────────────────────
  // `cue` = label of the card directly below; drives the "↓ <label>"
  // down-swipe affordance shown by the deck on the front card.
  const registry = [
    {
      id: "home",
      label: "Home",
      cards: [
        { build: heroCover, scrollable: false, cue: "About" },
        { build: aboutDetail, scrollable: true, cue: "Skills" },
        { build: skillsCover, scrollable: false },
      ],
    },
    {
      id: "experience",
      label: "Experience",
      cards: [
        {
          build: (d) =>
            countCover(
              "Work Experience",
              "Experience",
              d.experience.length,
              "roles",
            ),
          scrollable: false,
          cue: "Detail",
        },
        { build: experienceDetail, scrollable: true },
      ],
    },
    {
      id: "projects",
      label: "Projects",
      cards: [
        {
          build: (d) =>
            countCover("Projects", null, d.projects.length, "projects"),
          scrollable: false,
          cue: "Detail",
        },
        { build: projectsDetail, scrollable: true },
      ],
    },
    {
      id: "education",
      label: "Education",
      cards: [
        {
          build: (d) =>
            countCover("Education", null, d.education.length, "entries"),
          scrollable: false,
          cue: "Detail",
        },
        { build: educationDetail, scrollable: true },
      ],
    },
    {
      id: "awards",
      label: "Awards",
      cards: [
        {
          build: (d) =>
            countCover(
              "Awards & Recognition",
              "Recognition",
              d.awards.length,
              "awards",
            ),
          scrollable: false,
          cue: "Detail",
        },
        { build: awardsDetail, scrollable: true },
      ],
    },
    {
      id: "volunteering",
      label: "Volunteering",
      cards: [
        {
          build: (d) =>
            countCover(
              "Volunteering & Leadership",
              "Leadership",
              d.volunteering.length,
              "roles",
            ),
          scrollable: false,
          cue: "Detail",
        },
        { build: volunteeringDetail, scrollable: true },
      ],
    },
  ];

  global.PORTFOLIO_REGISTRY = registry;
})(window);
