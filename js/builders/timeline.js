/* ============================================================
   PORTFOLIO — builders/timeline.js
   Item-level builders used inside detail cards:
     timelineItem — Experience / Education / Volunteering entry
     projectItem  — Projects entry (status dot + external link)
     certItem     — Certification card (reuses award-card styling)
   ============================================================ */
(function (g) {
  "use strict";
  const PB = (g.PB = g.PB || {});
  const el = PB.el;
  const ICONS = PB.ICONS;

  // a timeline entry (Experience / Education / Volunteering detail).
  // `carouselKey` (optional): when the entry has media (`events` or `images`),
  // renders a photo badge that opens the carousel for that key.
  function timelineItem(entry, dotClass, carouselKey) {
    const mediaCount = PB.mediaCount
      ? PB.mediaCount(entry)
      : entry.images
        ? entry.images.length
        : 0;
    const hasPhotos = carouselKey && mediaCount > 0;
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
        hasPhotos ? PB.photoBadge(carouselKey, mediaCount) : null,
      ]),
    ]);
  }

  // a project item (title-based, not timeline format).
  // `carouselKey` (optional): photo badge when the project has `images`.
  function projectItem(project, carouselKey) {
    const hasPhotos = carouselKey && project.images && project.images.length;
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

    const linkIcon = el("span", {
      class: "project-link-icon",
      html: ICONS.externalLink,
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
          hasPhotos ? PB.photoBadge(carouselKey, project.images.length) : null,
        ]),
      ],
    );
  }

  // a certification card (reuses the award-card styling)
  function certItem(c) {
    const linkIcon = el("span", {
      class: "cert-link-icon",
      html: ICONS.externalLink,
    });

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
              el(
                "a",
                {
                  href: c.link,
                  class: "award-link",
                  target: "_blank",
                  rel: "noopener",
                },
                [el("span", { text: c.title }), linkIcon],
              ),
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

  PB.timelineItem = timelineItem;
  PB.projectItem = projectItem;
  PB.certItem = certItem;
})(window);
