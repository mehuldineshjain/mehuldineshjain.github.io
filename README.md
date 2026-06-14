# Portfolio — Neumorphic Design

A fully responsive neumorphic portfolio site built with plain HTML, CSS, and vanilla JavaScript. Sections include About, Experience, Education, Awards, and Volunteering & Leadership with scroll-animated timelines.

## Project Structure

```
portfolio/
├── index.html              # Main page
├── css/
│   └── style.css           # All styles (neumorphic tokens + layout)
├── js/
│   └── main.js             # Scroll animations, nav, hamburger
├── assets/                 # Add your images/icons here
├── .vscode/
│   ├── settings.json       # Editor config
│   └── extensions.json     # Recommended extensions
├── portfolio.code-workspace
├── .gitignore
└── README.md
```

## Getting Started

### 1. Open in VS Code

Double-click `portfolio.code-workspace` or run:
```bash
code portfolio.code-workspace
```

Install the recommended extensions when prompted (especially **Live Server**).

### 2. Preview Locally

Right-click `index.html` → **Open with Live Server** (or press `Alt+L Alt+O`).

### 3. Personalise

Open `index.html` and update:
- Your name, title, and tagline in the hero section
- About bio text and skill tags
- Work experience, education, awards, and volunteering entries
- Social links (GitHub, LinkedIn, email)

To change the accent colour, edit `--accent` in `:root` inside `css/style.css`.

---

## Push to GitHub Pages

```bash
# 1. Initialise git (skip if already done)
git init
git add .
git commit -m "Initial portfolio commit"

# 2. Create a repo on GitHub named:  <your-username>.github.io
#    Then add it as remote:
git remote add origin https://github.com/<your-username>/<your-username>.github.io.git

# 3. Push
git branch -M main
git push -u origin main
```

Your portfolio will be live at **https://\<your-username\>.github.io** within a minute or two.

> **Tip:** For a project repo (not a user pages repo), go to *Settings → Pages* and set the source to `main` / `/ (root)`.

---

## Design Notes

- **Style:** Neumorphism — soft-UI shadows on a `#e0e5ec` base using paired light (`#ffffff`) and dark (`#a3b1c6`) shadow layers.
- **Type:** [DM Sans](https://fonts.google.com/specimen/DM+Sans) + [DM Mono](https://fonts.google.com/specimen/DM+Mono) (Google Fonts, loaded via CDN).
- **Accent:** `#6c63ff` indigo-violet for experience, `#38b2ac` teal for education, `#ed8936` orange for volunteering.
- **Animations:** Intersection Observer–driven reveal; respects `prefers-reduced-motion`.
- **Responsive:** Fluid from 320 px to 1400 px+.
