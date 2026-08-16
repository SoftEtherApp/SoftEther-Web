# Cycle 1 — Web Platform Hardening (milestone: v0.10)

Draft phase: planning rounds summarized here; finalized as GitHub issues under the
`v0.10 — Cycle 1` milestone. See `docs/DEVELOPMENT_STRATEGY.md` for the process.

## Runtime findings (re-validated)

1. CI/deploy workflows trigger on `main` — repo default is `master`. Silent CI outage.
2. No admin page calls the D1-backed `/api/admin/*` endpoints — all pages render
   placeholder data.
3. `/terms` and `/docs` are "coming soon" scaffolds.
4. Dependency audit: Hono pinned at `4.11.1` below advisory fixes (`4.13.2`);
   Dependabot reports 74 advisories on the default branch.
5. GitHub Actions secrets unset in both repos (`CF_API_TOKEN` in Web;
   `WEBHOOK_URL`/`WEBHOOK_SECRET` in App) — deploy and release-sync would fail.
6. Webhook auth guard in the worker is **fail-open** when `WEBHOOK_SECRET` is unset.
7. `/api/admin/*` endpoints are unauthenticated on a public worker — exposes
   user/subscription data.
8. Remote D1 had no tables (migration unapplied) — applied during cycle setup.
9. Both repos private (free plan) → no branch protection/rulesets enforceable by API.
10. `develop` was stale behind `master`; accumulator branches did not exist —
    topology created during cycle setup.

## Breakdown

### Epic #17 — CI workflows
- #29 ci.yml retarget → master/develop + all PRs
- #30 deploy.yml retarget → master
- #31 wire `test:responsive` into CI

### Epic #16 — Admin pages ↔ D1 API
- #20 users · #21 dashboard (stats+activity) · #22 roles · #23 permissions
- #24 plans · #25 subscriptions · #26 features · #27 write endpoints · #28 analytics/distribution scope

### Epic #18 — Missing public pages
- #32 `/terms` full content · #33 `/docs` hub

### Chore
- #19 dependency audit

### Cycle-setup items (done directly, tracked for history)
- `develop` synced to `master`; accumulators `fixes/` `features/` `chores/` `docs/` created
- D1 migration `0000_mixed_karnak` applied to remote
- This draft file

## Open decisions

- Repo visibility: keep private vs. make public (unblocks branch protection + rulesets)
- Whether to seed remote D1 with demo data (roles/plans/users) for the admin UI
- Distribution/analytics pages: new data model + endpoints, or defer
