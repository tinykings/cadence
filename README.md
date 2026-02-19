<p align="center">
<img src="icons/icon.png" alt="Cadence Logo" width="120" />
<h1 align="center">Cadence</h1>
<h3 align="center">A lightweight time tracking PWA hosted on GitHub Pages.</h3>
<h4 align="center">https://tinykings.github.io/cadence/</h4>
</p>

---

Cadence is a calendar-based time tracker built for tracking hours toward an annual goal — particularly useful for academic years or any fixed-period commitment. It runs entirely in the browser with no backend or account required.

## Features

- **Daily logging** — log hours and credit hours for any day via a calendar picker
- **Year goal tracking** — set a target (default 600 hrs) with a live progress ring
- **Pace indicators** — see how many hours/month and hours/week you need to stay on track
- **Academic year support** — configurable year start/end months (default: September – August)
- **Previous months & years** — expandable history with per-month breakdowns
- **8 color themes** — amber, blue, emerald, violet, rose, cyan, orange, lime
- **Export / Import** — back up and restore data as JSON
- **PWA** — installable, works offline, auto-refreshes when the date changes

## Storage

All data is stored in browser `localStorage`. Nothing is sent to a server. Use the Export button in Settings to create a JSON backup, and Import to restore it on another device.

## Tech Stack

| Layer | Detail |
|-------|--------|
| Frontend | Vanilla JS, HTML, CSS — no frameworks |
| Build | [esbuild](https://esbuild.github.io/) via `build.js` |
| Lint | ESLint |
| Deploy | GitHub Actions → GitHub Pages |

## Development

```bash
# Install dev dependencies
npm install

# Build (bundles app.js with esbuild)
npm run build
```

The app can be run directly by opening `index.html` in a browser — no build step required for development.

## Data Format

Hours are stored keyed by date in `localStorage` under `cadence-data`:

```json
{
  "goal": 600,
  "settings": { "startMonth": 8, "endMonth": 7 },
  "hours": {
    "2025-09-15": { "hours": 3.5, "credit": 1 }
  }
}
```

- `startMonth` / `endMonth` are 0-indexed (0 = January, 8 = September)
- `hours` = direct hours worked; `credit` = additional credited hours
- Both count toward the year total and goal progress
