# softether.app — Landing Website

This is the source code for [softether.app](https://softether.app), the official
landing website for **SoftEther App** — a self-managed, multi-platform SoftEther
VPN client built with Flutter, and its open-source Zig engine **SoftEtherZig**.

## Tech Stack

- **React 19** — UI framework
- **Vite 7** — build tool and dev server
- **TypeScript 5** — type safety
- **Hono 4** — lightweight API router
- **Cloudflare Workers** — edge deployment (assets + SPA fallback)

## Project Structure

```
src/
├── react-app/               # React SPA
│   ├── App.tsx              # Route switch (/, /library)
│   ├── App.css              # Component styles
│   ├── index.css            # Design tokens + base styles
│   ───── main.tsx             # Entry point
│   ├── components/
│   │   ├── Header.tsx       # Nav bar + theme toggle
│   │   └── Footer.tsx       # Footer + legal disclaimer
│   ├── Icon.tsx         # SVG icon system (Lucide + brand logos)
│   │   └── HeroIllustration.tsx  # Hero visual (app logo + rings)
│   └── pages/
│       ├── AppLanding.tsx   # Root page — SoftEther App landing
│       └── LibraryLanding.tsx  # /library page — SoftEtherZig engine
└── worker/
    └── index.ts             # Hono worker + SPA fallback
```

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | AppLanding | SoftEther App: hero, features, platforms, download |
| `/library` | LibraryLanding | SoftEtherZig: features, quick start, integration targets |

## Development

```bash
npm install
npm run dev        # Vite dev server at localhost:5173
```

## Build & Deploy

```bash
npm run build      # tsc -b && vite build (outputs dist/client/)
npm run deploy     # wrangler deploy
```

The `wrangler.json` configures static assets from `dist/client/` with SPA
fallback (`not_found_handling: single-page-application`) — so `/library` and
any client-side route serves `index.html`.

## Design System

- **Palette:** Indigo (#3F51B5 seed) + Teal accent
- **Mode:** Dark-first with light theme toggle (localStorage-persisted)
- **Icons:** Lucide (stroke-based) + Simple Icons / Ionicons (brand logos)
- **Layout tokens:** scale-based spacing (xs→4xl), consistent radii
- **Glass surface:** 14px blur with opacity tiers
