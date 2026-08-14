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
├── app/               # React SPA
│   ├── App.tsx              # Route table + layout selection
│   ├── layouts/             # Layout groups
│   │   ├── PublicLayout.tsx # Header + main + Footer (public pages)
│   │   ├── AuthLayout.tsx   # Centered card (login/register/…)
│   │   ├── AdminLayout.tsx  # Admin shell (authorized area)
│   │   └── EmptyLayout.tsx  # No chrome (404 / unauthorized)
│   ├── components/          # Header/Footer/Sidebar shells, Icon, ThemeToggle, …
│   ├── hooks/               # useScrollToHash
│   ├── auth/                # Mock session: AuthProvider, useAuth, RequireAuth
│   ├── lib/                 # constants, ReleaseNotes renderer + tokenizer
│   ├── index.css            # Design tokens + base styles
│   ├── main.tsx             # Entry point
│   └── pages/
│       ├── HomePage.tsx     # Root page — SoftEther App landing
│       ├── library/         # /library page — SoftEtherZig engine
│       ├── ChangelogPage.tsx / PrivacyPage.tsx / SecurityPage.tsx
│       ├── DownloadsPage.tsx / TermsPage.tsx
│       ├── docs/            # Documentation (scaffolded)
│       ├── NotFoundPage.tsx / UnauthorizedPage.tsx
│       ├── auth/            # Login / Register / ForgotPassword / ResetPassword
│       └── admin/           # Scoped area (auth-gated)
│           ├── dashboard/   # /admin dashboard
│           ├── analytics/   # /admin/analytics
│           ├── distribution/# /admin/distribution (release channels)
│           ├── access/      # /admin/access/* (users, roles, permissions)
│           ├── subscriptions/ # /admin/subscriptions
│           ├── plans/       # /admin/plans
│           ├── features/    # /admin/features (feature flags)
│           └── settings/    # /admin/settings
├── shared/
│   └── types.ts             # Types shared by frontend + worker
└── worker/
    └── index.ts             # Hono worker + SPA fallback
```

## Auth

Session handling is a **mock** for now (no backend): `AuthProvider` stores a
session in `localStorage`, `/login` and `/register` create one locally, and
`RequireAuth` guards `/admin/*` — unauthenticated visitors are redirected to
`/login` and returned to their intended page after signing in. Swap
`src/app/auth/session.ts` for a real token/API flow later.

## Pages

| Route | Page | Layout | Description |
|---|---|---|---|
| `/` | HomePage | Public | SoftEther App: hero, features, platforms, download |
| `/library` | LibraryPage | Public | SoftEtherZig: features, quick start, integration targets |
| `/changelog` | ChangelogPage | Public | Release history from the worker API |
| `/privacy` | PrivacyPage | Public | Privacy policy |
| `/security` | SecurityPage | Public | Security & trust page |
| `/download` | DownloadsPage | Public | Installers per platform (scaffold) |
| `/terms` | TermsPage | Public | Terms of service (scaffold) |
| `/docs` | DocsPage | Public | Documentation hub (scaffold) |
| `/login` | LoginPage | Auth | Sign in (mock session) |
| `/register` | RegisterPage | Auth | Create account (mock session) |
| `/forgot-password` | ForgotPasswordPage | Auth | Password reset (stub) |
| `/reset-password` | ResetPasswordPage | Auth | Set new password (stub) |
| `/admin` | DashboardPage | Admin | Admin dashboard (scaffold, auth-gated) |
| `/admin/analytics` | AnalyticsPage | Admin | Usage telemetry (scaffold, auth-gated) |
| `/admin/distribution` | DistributionPage | Admin | Release channels (scaffold, auth-gated) |
| `/admin/access/users` | UsersPage | Admin | User management (scaffold, auth-gated) |
| `/admin/access/roles` | RolesPage | Admin | Roles (scaffold, auth-gated) |
| `/admin/access/permissions` | PermissionsPage | Admin | Permissions (scaffold, auth-gated) |
| `/admin/subscriptions` | SubscriptionsPage | Admin | Billing overview (scaffold, auth-gated) |
| `/admin/plans` | PlansPage | Admin | Billing plans (scaffold, auth-gated) |
| `/admin/features` | FeaturesPage | Admin | Feature flags (scaffold, auth-gated) |
| `/admin/settings` | SettingsPage | Admin | Admin settings (scaffold, auth-gated) |
| `/unauthorized` | UnauthorizedPage | Empty | 403 fallback |
| `*` | NotFoundPage | Empty | 404 fallback |

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

## Database (D1 + Drizzle)

The worker uses **Cloudflare D1** with **Drizzle ORM**. Schema lives in
`src/worker/db/schema.ts`; generated SQL migrations live in `drizzle/` and are
applied via wrangler.

```bash
# One-time setup — create the remote database, then paste its ID into
# wrangler.json (d1_databases.database_id)
npx wrangler d1 create softether-app

# Local development — the local database is created automatically by wrangler
npx wrangler d1 migrations apply softether-app --local

# Seed baseline data (roles, permissions, plans, users, …)
npx wrangler d1 execute softether-app --local --file=scripts/seed.sql

# After changing src/worker/db/schema.ts
npx drizzle-kit generate                      # write a new migration
npx wrangler d1 migrations apply softether-app --local    # apply locally
npx wrangler d1 migrations apply softether-app --remote   # apply to production
```

Run `npx wrangler types` after changing bindings in `wrangler.json`. The
D1-backed admin API is served under `/api/admin/*` (stats, users, roles,
permissions, plans, subscriptions, features, activity).

## Design System

- **Palette:** Indigo (#3F51B5 seed) + Teal accent
- **Mode:** Dark-first with light theme toggle (localStorage-persisted)
- **Icons:** Lucide (stroke-based) + Simple Icons / Ionicons (brand logos)
- **Layout tokens:** scale-based spacing (xs→4xl), consistent radii
- **Glass surface:** 14px blur with opacity tiers
