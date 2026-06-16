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
    // resume: "📄 Resume",
    resume:
      '<svg viewBox="0 0 24 24" fill="currentColor"> <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 15H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V6h12v2z"/></svg>  CV',
    meta: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M640 381.9C640 473.2 600.6 530.4 529.7 530.4C467.1 530.4 433.9 495.8 372.8 393.8L341.4 341.2C333.1 328.7 326.9 317 320.2 306.2C300.1 340 273.1 389.2 273.1 389.2C206.1 505.8 168.5 530.4 116.2 530.4C43.4 530.4 0 473.1 0 384.5C0 241.5 79.8 106.4 183.9 106.4C234.1 106.4 277.7 131.1 328.7 195.9C365.8 145.8 406.8 106.4 459.3 106.4C558.4 106.4 640 232.1 640 381.9zM287.4 256.2C244.5 194.1 216.5 175.7 183 175.7C121.1 175.7 69.2 281.8 69.2 385.7C69.2 434.2 87.7 461.4 118.8 461.4C149 461.4 167.8 442.4 222 357.6C222 357.6 246.7 318.5 287.4 256.2zM531.2 461.4C563.4 461.4 578.1 433.9 578.1 386.5C578.1 262.3 523.8 161.1 454.9 161.1C421.7 161.1 393.8 187 360 239.1C369.4 252.9 379.1 268.1 389.3 284.5L426.8 346.9C485.5 441 500.3 461.4 531.2 461.4z"/></svg>',
    claude:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M164.4 404.5L265.1 348L266.8 343.1L265.1 340.4L260.2 340.4L243.4 339.4L185.9 337.8L136 335.7L87.7 333.1L75.5 330.5L64.1 315.5L65.3 308L75.5 301.1L90.2 302.4C109.1 303.7 136.1 305.5 171.2 308L206.4 310.1L258.6 315.5L266.9 315.5L268.1 312.1L265.3 310L263.1 307.9L212.8 273.8L158.4 237.8L129.9 217.1L114.5 206.6L106.7 196.8L103.3 175.3L117.3 159.9L136.1 161.2L140.9 162.5L159.9 177.2L200.6 208.7L253.7 247.8L261.5 254.3L264.6 252.1L265 250.5L261.5 244.7L232.6 192.5L201.8 139.4L188.1 117.4L184.5 104.2C183.2 98.8 182.3 94.2 182.3 88.7L198.2 67.1L207 64.3L228.2 67.1L237.1 74.9L250.3 105.1L271.7 152.6L304.9 217.2L314.6 236.4L319.8 254.2L321.7 259.6L325.1 259.6L325.1 256.5L327.8 220.1L332.8 175.4L337.7 117.9L339.4 101.7L347.4 82.3L363.3 71.8L375.7 77.7L385.9 92.4L384.5 101.9L378.4 141.4L366.5 203.3L358.7 244.8L363.2 244.8L368.4 239.6L389.4 211.8L424.6 167.7L440.1 150.2L458.2 130.9L469.8 121.7L491.8 121.7L508 145.8L500.7 170.7L478 199.4L459.2 223.8L432.2 260.1L415.4 289.1L417 291.4L421 291L481.9 278L514.8 272.1L554.1 265.4L571.9 273.7L573.8 282.1L566.8 299.3L524.8 309.7L475.6 319.5L402.3 336.8L401.4 337.5L402.4 338.8L435.4 341.9L449.5 342.7L484.1 342.7L548.5 347.5L565.3 358.6L575.4 372.2L573.7 382.6L547.8 395.8C532.3 392.1 493.4 382.9 431.2 368.1L403.2 361.1L399.3 361.1L399.3 363.4L422.6 386.2L465.3 424.8L518.8 474.6L521.5 486.9L514.6 496.6L507.3 495.6L460.3 460.2L442.2 444.3L401.1 409.7L398.4 409.7L398.4 413.3L407.9 427.2L457.9 502.4L460.5 525.4L456.9 532.9L443.9 537.4L429.7 534.8L400.4 493.7L370.2 447.4L345.8 405.9L342.8 407.6L328.4 562.4L321.7 570.3L306.2 576.2L293.2 566.4L286.3 550.5L293.2 519L301.5 477.9L308.2 445.2L314.3 404.6L317.9 391.1L317.7 390.2L314.7 390.6L284.1 432.6L237.6 495.5L200.8 534.9L192 538.4L176.7 530.5L178.1 516.4L186.6 503.8L237.5 439L268.2 398.8L288 375.6L287.9 372.2L286.7 372.2L151.4 460L127.3 463.1L116.9 453.4L118.2 437.5L123.1 432.3L163.8 404.3L163.7 404.4L163.7 404.5z"/></svg>',
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
            entry.link
              ? el("a", {
                  href: entry.link,
                  class: "timeline-org",
                  target: "_blank",
                  rel: "noopener",
                  text: entry.org,
                })
              : el("p", { class: "timeline-org", text: entry.org }),
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

  // a project item (title-based, not timeline format)
  function projectItem(project) {
    // live / in-progress status dot (top-right of the card)
    const statusDot =
      project.status === "live" ||
      project.status === "wip" ||
      project.status === "nda"
        ? el("span", {
            class: "project-status project-status--" + project.status,
            title:
              project.status === "live"
                ? "Live"
                : project.status === "wip"
                  ? "In progress"
                  : "NDA",
            "aria-label":
              project.status === "live"
                ? "Live project"
                : project.status === "wip"
                  ? "Project in progress"
                  : "Project under NDA",
          })
        : null;
    return el(
      "div",
      {
        class:
          "timeline-item visible" +
          (project.status === "nda" ? " timeline-item--nda" : ""),
      },
      [
        el("div", { class: "timeline-marker neu-raised" }, [
          el("span", { class: "timeline-dot vol-dot" }),
        ]),
        el("div", { class: "timeline-content neu-raised has-status" }, [
          statusDot,
          el("div", { class: "timeline-header" }, [
            el("div", {}, [
              project.link
                ? el("a", {
                    href: project.link,
                    class: "timeline-role",
                    target: "_blank",
                    rel: "noopener",
                    text: project.title,
                  })
                : el("h3", { class: "timeline-role", text: project.title }),
              el("p", { class: "timeline-org", text: project.desc }),
            ]),
          ]),
          el(
            "ul",
            { class: "timeline-bullets" },
            project.bullets.map((b) => el("li", { text: b })),
          ),
          project.tags && project.tags.length
            ? el(
                "div",
                { class: "timeline-tags" },
                project.tags.map((t) =>
                  el("span", { class: "mini-tag", text: t }),
                ),
              )
            : null,
        ]),
      ],
    );
  }

  // ── covers / details per section ────────────────────────────

  function heroCover(data) {
    const p = data.profile;
    const card = cover(
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
              href: "#projects",
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

    // résumé link moved into About links (profile.links)
    return card;
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
      // accessibility note removed from About card; present as a skill now
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
          el("div", { class: "award-card neu-raised visible" }, [
            el("div", { class: "award-icon neu-inset", text: a.icon }),

            el("div", { class: "award-body" }, [
              el("span", { class: "award-year", text: a.year }),
              a.link
                ? el("h3", { class: "award-title" }, [
                    el("a", {
                      href: a.link,
                      class: "award-link",
                      target: "_blank",
                      rel: "noopener",
                      text: a.title,
                    }),
                  ])
                : el("h3", { class: "award-title", text: a.title }),
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

  // function projectsDetail(data) {
  //   return detail([
  //     heading("Projects"),
  //     el(
  //       "div",
  //       { class: "timeline" },
  //       data.projects.map((p) => projectItem(p)),
  //     ),
  //   ]);
  // }

  function projectItem(project) {
    // live / in-progress / nda status dot (top-right of the card)
    const statusDot =
      project.status === "live" ||
      project.status === "wip" ||
      project.status === "nda"
        ? el("span", {
            class: "project-status project-status--" + project.status,
            title:
              project.status === "live"
                ? "Live"
                : project.status === "wip"
                  ? "In progress"
                  : "NDA",
            "aria-label":
              project.status === "live"
                ? "Live project"
                : project.status === "wip"
                  ? "Project in progress"
                  : "Project under NDA",
          })
        : null;

    // A neat, standard text-adjacent icon mapping to your solid/filled SVG design requirements
    const linkIcon = el("span", {
      class: "project-link-icon",
      html: '<svg viewBox="0 0 24 24" fill="currentColor" style="display:inline-block; width:1em; height:1em; margin-left:6px; vertical-align:middle;"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>',
    });

    return el(
      "div",
      {
        class:
          "timeline-item visible" +
          (project.status === "nda" ? " timeline-item--nda" : ""),
      },
      [
        el("div", { class: "timeline-marker neu-raised" }, [
          el("span", { class: "timeline-dot vol-dot" }),
        ]),
        el("div", { class: "timeline-content neu-raised has-status" }, [
          statusDot,
          el("div", { class: "timeline-header" }, [
            el("div", {}, [
              project.link
                ? el(
                    "a",
                    {
                      href: project.link,
                      class: "timeline-role",
                      target: "_blank",
                      rel: "noopener",
                    },
                    [
                      // Preserves the textual title and pairs it with the visual anchor node
                      el("span", { text: project.title }),
                      linkIcon,
                    ],
                  )
                : el("h3", { class: "timeline-role", text: project.title }),
              el("p", { class: "timeline-org", text: project.desc }),
            ]),
          ]),
          el(
            "ul",
            { class: "timeline-bullets" },
            project.bullets.map((b) => el("li", { text: b })),
          ),
          project.tags && project.tags.length
            ? el(
                "div",
                { class: "timeline-tags" },
                project.tags.map((t) =>
                  el("span", { class: "mini-tag", text: t }),
                ),
              )
            : null,
        ]),
      ],
    );
  }

  function projectsDetail(data) {
    return detail([
      heading("Projects"),
      el(
        "div",
        { class: "timeline" },
        data.projects.map((p) => projectItem(p)),
      ),
    ]);
  }

  // a certification card (reuses the award-card styling)
  function certItem(c) {
    return el("div", { class: "award-card cert-card neu-raised visible" }, [
      el("div", {
        class: "award-icon neu-inset",
        // text: c.icon,
        html: ICONS[c.icon] || "",
      }),
      el("div", { class: "award-body" }, [
        el("span", { class: "award-year", text: c.year }),
        c.link
          ? el("h3", { class: "award-title" }, [
              el("a", {
                href: c.link,
                class: "award-link",
                target: "_blank",
                rel: "noopener",
                text: c.title,
              }),
            ])
          : el("h3", { class: "award-title", text: c.title }),
        el("p", { class: "award-org", text: c.org }),
        el("p", { class: "award-desc", text: c.desc }),
        c.tags && c.tags.length
          ? el(
              "div",
              { class: "timeline-tags" },
              c.tags.map((t) => el("span", { class: "mini-tag", text: t })),
            )
          : null,
      ]),
    ]);
  }
  function certificationsDetail(data) {
    return detail([
      heading("Certifications"),
      el(
        "div",
        { class: "awards-grid" },
        data.certifications.map((c) => certItem(c)),
      ),
    ]);
  }

  // a gallery tile — image (or placeholder while empty) + caption.
  // If `section` is set the tile is a button that jumps the deck there
  // (wired in main.js via the [data-goto] attribute).
  function galleryItem(item) {
    const media = item.img
      ? el("img", {
          src: item.img,
          alt: item.caption,
          class: "gallery-img",
          loading: "lazy",
        })
      : el("div", { class: "gallery-placeholder", "aria-hidden": "true" }, [
          el("span", { text: "🖼" }),
        ]);
    const figure = el("figure", { class: "gallery-figure" }, [
      media,
      el("figcaption", { class: "gallery-caption", text: item.caption }),
    ]);
    if (item.section) {
      return el(
        "button",
        {
          class: "gallery-item neu-raised",
          type: "button",
          "data-goto": item.section,
          "aria-label": item.caption + " — go to " + item.section + " section",
        },
        [figure],
      );
    }
    return el("div", { class: "gallery-item neu-raised" }, [figure]);
  }
  function galleryDetail(data) {
    return detail([
      heading("Gallery"),
      el(
        "div",
        { class: "gallery-grid" },
        data.gallery.map((g) => galleryItem(g)),
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
        { build: aboutDetail, scrollable: true, cue: "Skills", cueUp: "Top" },
        { build: skillsCover, scrollable: false, cueUp: "About" },
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
        { build: experienceDetail, scrollable: true, cueUp: "Overview" },
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
        { build: projectsDetail, scrollable: true, cueUp: "Overview" },
      ],
    },
    {
      id: "certifications",
      label: "Certifications",
      cards: [
        {
          build: (d) =>
            countCover(
              "Certifications",
              null,
              d.certifications.length,
              d.certifications.length === 1
                ? "certification"
                : "certifications",
            ),
          scrollable: false,
          cue: "Detail",
        },
        { build: certificationsDetail, scrollable: true, cueUp: "Overview" },
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
        { build: educationDetail, scrollable: true, cueUp: "Overview" },
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
        { build: awardsDetail, scrollable: true, cueUp: "Overview" },
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
        { build: volunteeringDetail, scrollable: true, cueUp: "Overview" },
      ],
    },
    {
      id: "gallery",
      label: "Gallery",
      cards: [
        {
          build: (d) =>
            countCover("Gallery", null, d.gallery.length, "moments"),
          scrollable: false,
          cue: "Detail",
        },
        { build: galleryDetail, scrollable: true, cueUp: "Overview" },
      ],
    },
  ];

  global.PORTFOLIO_REGISTRY = registry;
})(window);
