/* ============================================================
   PORTFOLIO — sections/sections.js
   Per-section cover/detail builders. Each takes `data` and
   returns the card's root element. Pulled into the registry
   (registry.js) which defines deck order.
   ============================================================ */
(function (g) {
  "use strict";
  const PB = (g.PB = g.PB || {});
  const el = PB.el;
  const ICONS = PB.ICONS;
  const cover = PB.cover;
  const detail = PB.detail;
  const heading = PB.heading;
  const timelineItem = PB.timelineItem;
  const projectItem = PB.projectItem;
  const certItem = PB.certItem;

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
          // jumps to the Projects section (handled by main.js [data-goto])
          el(
            "a",
            {
              class: "btn-primary neu-raised",
              href: "#projects",
              "data-goto": "projects",
            },
            ["Explore My Work"],
          ),
          // drops to the About card below (holds the contact / email links)
          el(
            "a",
            {
              class: "btn-ghost neu-flat",
              href: "#home",
              "data-action": "down",
            },
            ["Get in Touch"],
          ),
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
        data.awards.map((a, i) =>
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
              a.images && a.images.length
                ? PB.photoBadge("award-" + i, a.images.length)
                : null,
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
        data.volunteering.map((e, i) => timelineItem(e, "vol-dot", "vol-" + i)),
      ),
    ]);
  }

  function projectsDetail(data) {
    return detail([
      heading("Projects"),
      el(
        "div",
        { class: "timeline" },
        data.projects.map((p, i) => projectItem(p, "proj-" + i)),
      ),
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

  PB.heroCover = heroCover;
  PB.aboutDetail = aboutDetail;
  PB.skillsCover = skillsCover;
  PB.experienceDetail = experienceDetail;
  PB.educationDetail = educationDetail;
  PB.awardsDetail = awardsDetail;
  PB.volunteeringDetail = volunteeringDetail;
  PB.projectsDetail = projectsDetail;
  PB.certificationsDetail = certificationsDetail;
})(window);
