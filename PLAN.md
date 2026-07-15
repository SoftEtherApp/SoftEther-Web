# SoftEther-Web — Improvement Plan (Revised)

> **Generated:** 2026-07-15 | **Status:** Reviewed & Validated
> **Project size:** ~860 CSS lines, ~1,100 TS/TSX lines, 2 pages, 1 worker
> **Principle:** Every item validated against actual codebase. Premature complexity rejected.

---

## Legend

| Icon | Priority |
|------|----------|
| 🔴 | **High** — real risk or significant user-facing impact |
| 🟡 | **Medium** — meaningful improvement, right-sized for project |
| 🟢 | **Low** — polish / nice-to-have / when project grows |

---

## 🔴 High Priority

### H1. Add SEO essentials (robots.txt + sitemap.xml + JSON-LD)

**Why:** Zero SEO artifacts exist. Search engines can't properly index the site. A VPN product with no robots.txt or sitemap is invisible to discovery.

**What:**
- Create `public/robots.txt`
- Create `public/sitemap.xml` with both page URLs
- Add `SoftwareApplication` + `WebSite` JSON-LD schemas in `index.html`
- Create a purpose-built 1200×630 OG image (`public/og-image.png`)

**Files:** 3 new files, 1 edit | **Est:** 30 min

---

### H2. Add error boundary + API failure UI

**Why:** The entire app has zero error boundaries. If any component throws or the release API fails, the user gets a white screen or confusing "Coming soon" labels.

**What:**
- Create `src/react-app/components/ErrorBoundary.tsx` with fallback UI
- Add error state to `DownloadSection` — clear message + retry button on API failure

**Files:** 2 new, 2 edits | **Est:** 45 min

---

### H3. Add skip-to-content link

**Why:** Users tabbing through the page must tab through the entire 56px header (5+ focusable elements) before reaching main content. WCAG 2.4.1 failure.

**What:** Place a `.skip-link` element at the top of each page / in `index.html`.

**Files:** 2 edits | **Est:** 15 min

---

### H4. Fix muted text color contrast

**Why:** `--text-muted: #787890` on `--surface-900: #0f0f13` = **~4.2:1 contrast ratio** — below WCAG AA (4.5:1). Affects every `footer-copy`, `download-meta`, `feature-desc`, `section-desc`.

**What:** Change `--text-muted` to `#9090aa`.

**Files:** 1 edit | **Est:** 5 min

---

### H5. Add CI workflow

**Why:** No CI means lint/type/build breakage goes unnoticed until deploy.

**What:** Create `.github/workflows/ci.yml` — runs lint + type-check + build on push/PR.

**Files:** 1 new | **Est:** 15 min

---

### H6. Fix KV preview namespace

**Why:** `preview_id === id` in `wrangler.json`, meaning dev/preview shares production KV data.

**What:** Create separate KV namespace for preview and update `preview_id`.

**Files:** 1 edit + CF Dashboard | **Est:** 10 min

---

### H7. Shared types between worker and frontend

**Why:** `Release`, `ReleaseAsset`, `AppEnv` interfaces are duplicated in `src/worker/index.ts` and `src/react-app/pages/AppLanding.tsx`. Drift causes silent bugs.

**What:** Create `src/shared/types.ts`, import in both. Update tsconfig includes.

**Files:** 1 new, 4 edits | **Est:** 30 min

---

### H8. Security headers on worker responses

**Why:** API responses have no CSP, HSTS, XFO, or X-Content-Type-Options headers.

**What:** Add Hono middleware setting: CSP, HSTS, `nosniff`, `DENY`, `Referrer-Policy`.

**Files:** 1 edit | **Est:** 20 min

---

## 🟡 Medium Priority

### M1. Split monolithic App.css into focused files

**Why:** 860 lines in one file is manageable today but grows. Separation of concerns.

**What:** Extract to `Header.css`, `Footer.css`, `Hero.css`, `DownloadSection.css`, `LibraryPages.css`. Keep design tokens in `index.css`, shared components in `shared.css`.

**Files:** 7 new, 3 edits | **Est:** 1 hr

---

### M2. Display release notes from API data

**Why:** The worker fetches `release.body` (changelog) and stores it in KV, but the frontend discards it — data that costs nothing to show is hidden.

**What:** Add expandable release notes section + version history toggle.

**Files:** 1 edit | **Est:** 45 min

---

### M3. Add quick-start / setup guide to landing page

**Why:** The landing page drives downloads but offers zero guidance on *what to do next*.

**What:** Add a "Get Connected" section with 3 simple steps after downloads.

**Files:** 1 edit | **Est:** 30 min

---

### M4. Fix KV download URL generation

**Why:** Webhook stores `r2Key: asset.name` (filename only) instead of the full path `${tag}/${asset.name}`. Works today but will break if metadata is ever used directly.

**What:** Store full R2 key in `r2Key`.

**Files:** 1 edit | **Est:** 5 min

---

### M5. Add deploy workflow

**Why:** Automate `wrangler deploy` on push to main.

**What:** Create `.github/workflows/deploy.yml`.

**Files:** 1 new | **Est:** 15 min

---

### M6. Replace manual SVG icons with lucide-react

**Why:** `Icon.tsx` is 260 lines of hand-copied SVG paths. Fragile, won't auto-update.

**Trade-off:** Adds ~5KB gzipped dependency but eliminates 260 lines of manual maintenance.

**What:** Install `lucide-react`, replace icon imports, keep brand logos as small local set (~50 lines).

**Files:** 1 new, 4 edits | **Est:** 1 hr

---

### M7. Fix focus indicators + aria-labels

**Why:** Download cards, platform chips, and icon-only links lack visible focus outlines or accessible labels.

**What:** Add `:focus-visible` styles, add `aria-label` to icon-only links.

**Files:** 1 edit | **Est:** 15 min

---

### M8. Add `fetchpriority="high"` to hero preload

**Why:** Hero image is LCP element but preload lacks priority hint.

**What:** `<link rel="preload" fetchpriority="high" ...>`.

**Files:** 1 edit | **Est:** 2 min

---

### M9. Client-side caching for release API

**Why:** `/api/releases/latest` called on every page load. ~20 lines of code vs 15KB dependency (React Query).

**What:** Simple localStorage cache with 5-min TTL.

**Files:** 1 edit | **Est:** 20 min

---

## 🟢 Low Priority (Nice-to-Have / Future)

| ID | Item | Why Now? | Est. |
|----|------|----------|------|
| L1 | Extract `useScrollToHash` hook | Duplicated `useEffect` in 2 pages (~8 lines each) | 15 min |
| L2 | Replace inline styles with CSS classes | 3 unnecessary inline margin styles in `LibraryLanding.tsx` (remaining 5 in `HeroIllustration.tsx` are legitimate SVG sizing) | 20 min |
| L3 | Firefox scrollbar styling | `scrollbar-color` + `scrollbar-width` for cross-browser | 5 min |
| L4 | Skeleton loading for download cards | Polished loading state instead of "Checking for releases..." text | 30 min |
| L5 | Animated page transitions | Subtle fade between `/` and `/library` | 30 min |
| L6 | Add `/api/health` endpoint | Monitor KV + R2 binding availability | 15 min |
| L7 | Rate limiting for API endpoints | In-worker per-IP via KV or Cloudflare WAF | 30 min |
| L8 | Environment variable validation | Warn if `WEBHOOK_SECRET` missing at startup | 10 min |
| L9 | Privacy & Terms pages | Legal/trust — content-dependent | varies |

---

## ❌ Rejected Items (with rationale)

| Item | Rejection Reason |
|------|------------------|
| Replace custom SPA router | 2 pages don't need react-router-dom (~30KB). Hand-rolled router is adequate. |
| TypeScript path aliases | Max import depth `../`. Zero benefit at this scale. |
| Extract reusable UI primitives | Premature abstraction. Only 2 variants each. CSS is already DRY. |
| Critical CSS inlining | 860 lines not render-blocking enough to justify complexity. |
| Lazy-load sections | Sections are lightweight HTML+CSS. No measurable perf gain. |
| Comparison table | Content marketing — write when there's content. |
| Blog | No content exists. Premature infrastructure. |
| PWA / manifest.json | Marketing site doesn't need PWA. |
| Service worker | Cloudflare edge caching handles this. |
| Sentry / error tracking | Overkill. Cloudflare observability already enabled. |
| i18n | No content to translate yet. Premature. |

---

## Quick Wins (Under 30 min)

| Prio | Task | Est. | Impact Area |
|------|------|------|-------------|
| 🔴 | `robots.txt` + `sitemap.xml` | 15 min | SEO |
| 🔴 | Fix muted text contrast | 5 min | WCAG AA |
| 🔴 | `fetchpriority="high"` on hero | 2 min | LCP |
| 🔴 | Fix KV `r2Key` in webhook | 5 min | Data correctness |
| 🔴 | CI workflow | 15 min | Reliability |
| 🔴 | Fix KV `preview_id` | 10 min | Dev/prod isolation |
| 🔴 | Skip-to-content link | 15 min | WCAG 2.4.1 |
| 🔴 | Security headers middleware | 20 min | Security |
| 🟡 | Shared types | 30 min | Type safety |
| 🟡 | API cache layer | 20 min | Performance |
| 🟡 | Focus indicators + aria-labels | 15 min | Keyboard a11y |
| 🟢 | Firefox scrollbar | 5 min | Cross-browser |
| 🟢 | Inline styles → CSS classes | 20 min | Code hygiene |

---

## Phased Roadmap

| Phase | Focus | Items | Est. |
|-------|-------|-------|------|
| **1: Foundation** | SEO, security, CI, correctness | H1, H5, H6, H7, H8, M4 | 1–2 days |
| **2: Accessibility** | Skip-link, contrast, errors, focus | H2, H3, H4, M7 | 1 day |
| **3: Performance** | Hero preload, API cache | M8, M9 | 0.5 day |
| **4: Maintainability** | CSS split, lucide-react, hooks | M1, M6, L1, L2, L3 | 2–3 days |
| **5: Features** | Release notes, quick-start guides | M2, M3 | 1–2 days |
| **6: Polish** | Skeletons, transitions, rate limiting | L4, L5, L7, L8, L9 | 2–3 days |
