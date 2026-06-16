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

   Card builders now live in:
     js/builders/*  (cards, timeline, gallery)
     js/sections/sections.js  (per-section covers/details)
   …all exposed on the PB namespace, loaded BEFORE this file.

   deck.js renders this grid; nav + dots read the same array.

   MIGRATION NOTE (vanilla -> React):
   Keep this shape. Replace each `build(data)` with a component;
   the deck maps over sections/cards identically. data.js unchanged.
   ============================================================ */
(function (global) {
  "use strict";

  const PB = global.PB || {};

  // ── the registry (sections) ─────────────────────────────────
  // `cue` = label of the card directly below; drives the "↓ <label>"
  // down-swipe affordance shown by the deck on the front card.
  const registry = [
    {
      id: "home",
      label: "Home",
      cards: [
        { build: PB.heroCover, scrollable: false, cue: "About" },
        { build: PB.aboutDetail, scrollable: true, cue: "Skills", cueUp: "Top" },
        { build: PB.skillsCover, scrollable: false, cueUp: "About" },
      ],
    },
    {
      id: "experience",
      label: "Experience",
      cards: [
        {
          build: (d) =>
            PB.countCover(
              "Work Experience",
              "Experience",
              d.experience.length,
              "roles",
            ),
          scrollable: false,
          cue: "Detail",
        },
        { build: PB.experienceDetail, scrollable: true, cueUp: "Overview" },
      ],
    },
    {
      id: "projects",
      label: "Projects",
      cards: [
        {
          build: (d) =>
            PB.countCover("Projects", null, d.projects.length, "projects"),
          scrollable: false,
          cue: "Detail",
        },
        { build: PB.projectsDetail, scrollable: true, cueUp: "Overview" },
      ],
    },
    {
      id: "certifications",
      label: "Certifications",
      cards: [
        {
          build: (d) =>
            PB.countCover(
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
        { build: PB.certificationsDetail, scrollable: true, cueUp: "Overview" },
      ],
    },
    {
      id: "education",
      label: "Education",
      cards: [
        {
          build: (d) =>
            PB.countCover("Education", null, d.education.length, "entries"),
          scrollable: false,
          cue: "Detail",
        },
        { build: PB.educationDetail, scrollable: true, cueUp: "Overview" },
      ],
    },
    {
      id: "awards",
      label: "Awards",
      cards: [
        {
          build: (d) =>
            PB.countCover(
              "Awards & Recognition",
              "Recognition",
              d.awards.length,
              "awards",
            ),
          scrollable: false,
          cue: "Detail",
        },
        { build: PB.awardsDetail, scrollable: true, cueUp: "Overview" },
      ],
    },
    {
      id: "volunteering",
      label: "Volunteering",
      cards: [
        {
          build: (d) =>
            PB.countCover(
              "Volunteering & Leadership",
              "Leadership",
              d.volunteering.length,
              "roles",
            ),
          scrollable: false,
          cue: "Detail",
        },
        { build: PB.volunteeringDetail, scrollable: true, cueUp: "Overview" },
      ],
    },
    {
      id: "gallery",
      label: "Gallery",
      cards: [
        {
          build: (d) =>
            PB.countCover("Gallery", null, PB.galleryItemCount(d), "moments"),
          scrollable: false,
          cue: "Detail",
        },
        { build: PB.galleryDetail, scrollable: true, cueUp: "Overview" },
      ],
    },
  ];

  global.PORTFOLIO_REGISTRY = registry;
})(window);
