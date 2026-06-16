/* ============================================================
   PORTFOLIO — builders/cards.js
   Generic card wrappers shared across sections:
     cover     — fixed, centered, never scrolls (row 0)
     detail    — scrollable region (row 1+)
     heading   — section <h2> with optional accent word
     countCover— overview cover: big title + "<n> <noun>"
   ============================================================ */
(function (g) {
  "use strict";
  const PB = (g.PB = g.PB || {});
  const el = PB.el;

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

  PB.cover = cover;
  PB.detail = detail;
  PB.heading = heading;
  PB.countCover = countCover;
})(window);
