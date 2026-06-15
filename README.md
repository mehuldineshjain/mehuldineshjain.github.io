# Mehul Jain — Portfolio

> A personal portfolio where sections are a **2D swipeable card deck** instead of a long vertical scroll.
> Built with plain HTML, CSS, and vanilla JavaScript — no build step, no framework, no dependencies.

**[Live Demo →](https://mehulj999.github.io)**

![Portfolio preview](assets/images/preview.png)
<!-- Replace with a screenshot or screen-recording GIF of the card deck in action -->

---

## Features

- **2D card deck** — swipe left/right between sections; swipe up/down for detail within each section
- **3D stack animation** — leaving card recedes behind, incoming card rises into frame
- **Neumorphic design** — soft paired light/dark shadows on one base colour
- **Dark / light theme** — toggle in the nav; respects OS preference, persists to `localStorage`
- **Cyclical sections** — swipe past the last section and loop back to the first
- **Smart vertical scroll** — detail cards scroll internally; swipe up/down only changes cards at the scroll boundary
- **Keyboard & trackpad** — full navigation without touch (see Controls)
- **Accessible** — ARIA carousel semantics, `prefers-reduced-motion` (crossfade, no drag)
- **Zero dependencies** — one HTML file, one CSS file, five JS files; serve and done

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

---

## Sections

| Section | Cover | Swipe down for… |
|---------|-------|-----------------|
| Home | Avatar, name, animated role, tagline, CTAs | About (bio + social) → Skills |
| Experience | Role count | Full timeline |
| Education | Entry count | Full timeline |
| Awards | Award count | Full grid |
| Volunteering | Role count | Full timeline |

Sections are **cyclical** — horizontal wraps around. Vertical is bounded (rubber-bands at top/bottom).

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Markup | HTML5 — semantic, no templating engine |
| Styles | CSS3 — custom properties, `@keyframes`, `transform: preserve-3d` |
| Logic | Vanilla JS (ES5-compatible, no transpiler) |
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
├── index.html          # Shell: nav, deck stage, dots, hint, footer
├── css/
│   └── style.css       # Neumorphic tokens, dark theme, deck/cover/detail layout
├── js/
│   ├── data.js         # All copy lives here — edit to personalise
│   ├── registry.js     # Section order, labels, and card builders
│   ├── deck.js         # 2D swipe engine (drag / wheel / ARIA / cues)
│   ├── theme.js        # Dark/light toggle
│   └── main.js         # Bootstrap: wires all pieces together
└── assets/images/
```

**Data flow:** `data.js` → `registry.js` → `deck.js` renders the grid; `main.js` builds the nav title and dots from the same registry so labels never drift.

---

## Personalise (fork this)

1. **Content** — edit `js/data.js`. All text (name, bio, roles, experience, skills…) lives here. Nothing is hard-coded in markup.
2. **Colours** — edit the `:root` / `[data-theme="dark"]` token block in `css/style.css`.
3. **Add a section** — add a key to `js/data.js`, then add an entry to the `registry` array in `js/registry.js`. The deck, nav, and dots update automatically.

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
See [LICENSE](LICENSE) for the full text.

---

## Author

**Mehul Jain** — Software Engineer & Product Thinker

[GitHub](https://github.com/mehulj999) · [LinkedIn](https://linkedin.com/in/mehuldjain) · [Email](mailto:mehuldj999@gmail.com)
