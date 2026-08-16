# Development Strategy

The canonical development workflow for the **SoftEther App** organization — applies
to every repository in the org (SoftEther-App, SoftEther-Web, libsoftether,
SoftEtherZig). This document is the referring standard: planning, branching,
worktrees, pull requests, CI, and releases all follow the rules below.

## 1. Principles

1. **Everything waits behind `develop`** — `master` is the only production branch
   and moves exclusively through release pull requests.
2. **One issue → one branch → one PR.** Every unit of work is traceable end to
   end (issue number appears in branch name, PR title, and merge commit).
3. **Plan first, code second.** Each cycle starts as a locally drafted plan,
   is finalized into GitHub issues/sub-issues, and only then does implementation
   begin.
4. **Parallel work is free** — development happens in dedicated worktrees, so
   multiple branches are never blocked by a dirty working tree.
5. **CI is the gate.** Nothing merges without lint, typecheck, build, and the
   repository's scripted tests passing on the PR.

## 2. Branch topology

```
master                 production — protected; only via release PR from develop
└── develop            THE integration gate — protected; all work accumulates here
    ├── fixes           accumulator for corrective work (bugs, regressions, hotfixes)
    │   └── fix/<issue#>-<slug>
    ├── features        accumulator for product work (features, improvements)
    │   └── feat/<issue#>-<slug>
    ├── chores          accumulator for maintenance (deps, CI, refactors, tooling)
    │   └── chore/<issue#>-<slug>
    └── docs            accumulator for documentation (guides, strategy, policies)
        └── docs/<issue#>-<slug>
```

> Git branch names cannot end in `/` — accumulators are slash-free (`fixes`,
> `features`, ...) while implementation branches carry the slash prefix
> (`fix/…`, `feat/…`, `chore/…`, `docs/…`).

### Branch rules

| Rule | Detail |
|---|---|
| Source | Every implementation branch is created **from its accumulator branch**, never from `master` or `develop` directly |
| Naming | `feat/123-profile-page`, `fix/45-header-spacing`, `chore/67-ci-triggers`, `docs/12-strategy` — slug is kebab-case, issue number first |
| Freshness | Before creating a new branch, merge `develop` into the accumulator (accumulators must never drift behind `develop`) |
| Lifecycle | Implementation branches are short-lived (hours–days). Accumulator branches live for a cycle. `develop` is permanent. `master` is permanent |
| Protection | `master` and `develop` require PR review + green CI; direct pushes are rejected |

## 3. Issue lifecycle (GitHub)

```
Draft (local) → Finalize (GitHub) → Assign (labels + milestone) → Implement → Review → Close
```

| Phase | What happens |
|---|---|
| **Draft** | Planning rounds happen in discussion first. Each draft is categorized (feature / fix / chore / refactor / docs) and recorded under `docs/planning/` (one file per cycle) |
| **Finalize** | The finalized breakdown becomes GitHub issues. Large work becomes an **epic** (parent) with native **sub-issues**; each sub-issue is independently branchable |
| **Label taxonomy** | `feature` · `fix` · `chore` · `refactor` · `docs` · `tech-debt` · `release` |
| **Milestones** | One milestone per release cycle (e.g. `v0.10`). Every issue in the cycle is attached to it. Milestone closes = release ships |
| **Estimation** | Keep issues small — any issue that cannot be described in a few sentences or finished in days is split into sub-issues |

### Definition of Done (every issue)

- [ ] Implementation branch created from the correct accumulator, linked to the issue
- [ ] Code follows repo conventions (linter clean, typed, no dead code)
- [ ] Scripted tests relevant to the change pass locally (and in CI)
- [ ] PR opened against the accumulator with `Closes #<issue>` in the description
- [ ] CI green on the PR; reviewed and approved before merge
- [ ] Issue closed automatically by the merged PR; sub-issues closed as they land

## 4. Local workflow (worktrees)

Implementation never happens on `master` or `develop` directly.

```bash
# 1. Fresh accumulator, then branch for the issue
git switch develop && git pull
git switch fixes && git merge develop && git push

# 2. Create the implementation branch in its own worktree
git worktree add ../SoftEther-Web.fix-123 fix/123-header-spacing

# 3. Work in the worktree — other worktrees stay untouched
cd ../SoftEther-Web.fix-123
```

- One worktree per active branch → **parallel tasks never need stashing**.
- Worktrees live as siblings of the checkout (`../<repo>.<issue#>-<slug>`).
- Each worktree builds and tests independently.
- Remove the worktree after the branch merges: `git worktree remove <path>` then delete the branch.

## 5. Pull requests & merge protocol

### Merge style

| Merge into | Style | Why |
|---|---|---|
| Implementation → accumulator | **Squash** | One clean, conventional-commit message per issue; the accumulator history reads as a changelog |
| Accumulator → `develop` | **Merge commit** | The batch lands as a visible unit; easy to revert a whole batch |
| `develop` → `master` | **Merge commit + tag** | Release unit; tagged with the version |

### Squash message convention (Conventional Commits)

```
feat(profile): add profile page                     # type(scope): subject
fix(header): fix top spacing under fixed header
chore(ci): retarget workflows to master/develop
docs(strategy): add development strategy
```

Types: `feat` · `fix` · `chore` · `refactor` · `docs` · `ci` · `test` · `perf` ·
`build` · `revert`. The PR title must equal the intended squash message.

### PR checklist (every PR)

- [ ] Description references the issue: `Closes #123`
- [ ] Title is the final squash message (Conventional Commits)
- [ ] CI green (lint → typecheck → build → scripted tests)
- [ ] Reviewed and approved
- [ ] Scope contained — no unrelated changes, no secret material, no lockfile churn

## 6. CI gates

| Gate | Runs on | Blocks |
|---|---|---|
| lint | every PR + push to accumulators/develop | merge |
| typecheck | every PR + push to accumulators/develop | merge |
| build | every PR + push to accumulators/develop | merge |
| scripted tests (`test:*` package scripts) | every PR + push to accumulators/develop | merge |
| deploy | push to `master` (post-release) | — |

Workflow triggers must match the repo's real default branch (see per-repo table).
A workflow triggered on a branch that does not exist is a silent CI outage.

## 7. Release process

1. All cycle issues are merged into `develop`; milestone shows 100% complete.
2. A **release PR** `develop → master` is prepared with:
   - Version bump (conventional commit `chore: release vX.Y.Z`)
   - Changelog summary (collected from squash messages of the cycle)
3. **A human reviews and merges** the release PR — releases are never automated end to end.
4. The merge is tagged `vX.Y.Z` and the milestone is closed.
5. Accumulators are rebased onto the new `master`/`develop` state so the next
   cycle starts clean.

## 8. Guardrails (common failure modes)

| Failure mode | Prevention |
|---|---|
| Accumulator drift | Merge `develop` into the accumulator before every branch + after every batch |
| Long-lived implementation branches | Issues are small; branches live hours–days; stale branches get closed |
| CI not running | Workflows must trigger on the real default branch (check the per-repo table) |
| Lockfile churn / unrelated edits | PR checklist; build only on CI-verified platforms |
| Secrets in commits | PR review gate + never commit keys/tokens (env vars only) |
| Releases without a human gate | Release PRs are reviewed and merged by a person |

## 9. Per-repository mapping

| Repository | Stack | Default branch | Accumulators | CI trigger |
|---|---|---|---|---|
| **SoftEther-App** | Flutter + Zig (libsoftether) | `master` | `fixes/` `features/` `chores/` `docs/` | `master` + PRs |
| **SoftEther-Web** | React + Vite + Hono + Cloudflare Workers | `master` | `fixes/` `features/` `chores/` `docs/` | `master` + PRs |
| **libsoftether** | Zig | `master` | `fixes/` `features/` | `master` + PRs |

> Note: legacy branches named `fix/…`, `feat/…` and `develop` exist in history;
> they are pre-strategy. All new work follows this document.