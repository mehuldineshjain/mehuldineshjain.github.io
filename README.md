# Mehul Jain — Portfolio

> A personal portfolio where sections are a **2D swipeable card deck** instead of a long vertical scroll.
> Built with plain HTML, CSS, and vanilla JavaScript — no build step, no framework, no dependencies.

**[Live Demo →](https://mehuldineshjain.github.io)**

![Portfolio preview](assets/images/preview.png)

---

## Features

- **2D card deck** — swipe left/right between sections; swipe up/down for detail within each section
- **3D stack animation** — leaving card recedes behind, incoming card rises into frame
- **Media gallery** — lightbox carousel for photos **and video**, with a dedicated tabbed Gallery section (Projects / Volunteering / Awards)
- **Photo badges** — a `📷 n` trigger on any item opens its carousel inline
- **Neumorphic design** — soft paired light/dark shadows on one base colour
- **Dark / light theme** — toggle in the nav; respects OS preference, persists to `localStorage`
- **Cyclical sections** — swipe past the last section and loop back to the first
- **Smart vertical scroll** — detail cards scroll internally; swipe up/down only changes cards at the scroll boundary
- **Keyboard & trackpad** — full navigation without touch (see Controls)
- **Accessible** — skip link, ARIA carousel semantics, focus-trapped lightbox, `prefers-reduced-motion` (crossfade, no drag)
- **Zero dependencies** — one HTML file, one CSS file, a handful of small JS modules; serve and done

---

## Controls

| Input | Action |
|-------|--------|
| **Swipe left / right** | Move between sections |
| **Swipe up / down** | Move between cover and detail card within a section |
| `←` `→` keys | Sections |
| `↑` `↓` keys | Scroll detail card; jump cards at the scroll edge |
| `Home` / `End` | First / last section |
| **Trackpad horizontal** | Sections |
| **Trackpad vertical** | Scroll detail, then change card at boundary |
| **Side arrows** (desktop) | Previous / next section |
| **Progress dots** | Jump to any section |
| **Nav prev / next labels** | Clickable section jump |
| **Lightbox** `←` `→` `Esc` | Step carousel media · close |

---

## Sections

Eight sections, in deck order:

| Section | Cover | Swipe down for… |
|---------|-------|-----------------|
| Home | Avatar, name, animated role, tagline, CTAs | About (bio + socials) → Skills |
| Experience | Role count | Timeline of roles |
| Projects | Project count | Project cards + media |
| Certifications | Cert count | Certification list |
| Education | Entry count | Education timeline |
| Awards | Award count | Award grid + media |
| Volunteering | Role count | Timeline + per-event photo/video galleries |
| Gallery | Moment count | Tabbed photo/video carousel across all media |

Sections are **cyclical** — horizontal wraps around. Vertical is bounded (rubber-bands at top/bottom).

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Markup | HTML5 — semantic, no templating engine |
| Styles | CSS3 — custom properties, `@keyframes`, `transform: preserve-3d` |
| Logic | Vanilla JS (ES5-compatible, no transpiler), modules namespaced under `PB` |
| Fonts | [DM Sans](https://fonts.google.com/specimen/DM+Sans) + [DM Mono](https://fonts.google.com/specimen/DM+Mono) via Google Fonts |
| Hosting | GitHub Pages (static, no server needed) |

---

## Run locally

No build step. Just serve the static files:

```bash
# Python (built into macOS / Linux)
python3 -m http.server 8099
# open http://localhost:8099
```

Or: right-click `index.html` in VS Code → **Open with Live Server**.

---

## Project structure

```
mehul-portfolio/
├── index.html              # Shell: nav, deck stage, dots, footer; loads scripts in order
├── css/
│   └── style.css           # Neumorphic tokens, dark theme, deck/cover/detail layout
├── js/
│   ├── data.js             # SINGLE SOURCE OF TRUTH — all copy (window.PORTFOLIO_DATA)
│   ├── registry.js         # Section order + which builder renders each card
│   ├── deck.js             # 2D/3D swipe engine (drag / wheel / keys / ARIA / cues)
│   ├── theme.js            # Dark / light toggle (OS preference + localStorage)
│   ├── main.js             # Bootstrap: wires deck, nav title, dots, footer year
│   ├── core/
│   │   ├── dom.js          # el() DOM helper (PB namespace)
│   │   └── icons.js        # inline SVG icon set
│   ├── builders/
│   │   ├── cards.js        # generic cover / count / heading primitives
│   │   ├── timeline.js     # timeline + project / cert item builders
│   │   └── gallery.js      # photo/video lightbox carousel + Gallery section
│   └── sections/
│       └── sections.js     # per-section covers & details (hero, about, skills, …)
└── assets/
    ├── favicon.svg
    ├── images/             # avatars, award & volunteering photos/video
    ├── resume/resume.pdf
    └── certificates/claude_code_101.pdf
```

**Builders namespace:** every card builder hangs off a shared global `PB` object so the no-build `<script>` setup can split logic across files. `core/` and `builders/` and `sections/` populate `PB`; `registry.js` references those builders by name.

**Script load order matters** (set in `index.html`):
`data.js` → `core/*` → `builders/*` → `sections/sections.js` → `registry.js` → `theme.js` → `deck.js` → `main.js`.
`PB` must be fully populated before `registry.js` reads from it.

**Data flow:** `data.js` (`PORTFOLIO_DATA`) → builders construct DOM → `registry.js` maps each section to its builders → `deck.js` renders the grid; `main.js` builds the nav title and dots from the **same** registry, so labels never drift.

---

## Personalise (fork this)

1. **Content** — edit `js/data.js`. All text (name, bio, roles, experience, projects, skills, awards, volunteering…) lives here. Nothing is hard-coded in markup.
2. **Media** — drop images/clips under `assets/images/` and reference them from `data.js`. Items take either a flat `images: [{ src, caption }]` list or nested `events: [{ name, date, media: [...] }]`; add `type: "video"` (+ optional `poster`) to a media entry for a clip.
3. **Colours** — edit the `:root` / `[data-theme="dark"]` token block in `css/style.css`.
4. **Add a section** — add a key to `js/data.js`, write a builder (or reuse one) in `js/sections/sections.js`, then add an entry to the `registry` array in `js/registry.js`. The deck, nav, and dots update automatically.

---

## Migration note (vanilla → React)

The architecture is deliberately framework-agnostic. `data.js` is a plain object reusable as-is, and `registry.js` keeps a stable section/card shape — to port, replace each builder's `build(data)` with a component; the deck maps over sections/cards identically.

---

## Deploy to GitHub Pages

```bash
git add .
git commit -m "Portfolio: swipeable card deck"
git remote add origin https://github.com/<your-username>/<your-username>.github.io.git
git branch -M main
git push -u origin main
```

For a project repo (not a user page): go to **Settings → Pages** and set source to `main` / `/ (root)`.

---

## License

MIT — feel free to fork, adapt, and build your own version.

---

## Author

**Mehul Jain** — Software Engineer & Product Thinker

[GitHub](https://github.com/mehuldineshjain) · [LinkedIn](https://linkedin.com/in/mehuldjain) · [Email](mailto:mehuldj999@gmail.com)
