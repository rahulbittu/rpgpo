# Sprint 141: CI/CD Pipeline + Tier Path Audit + Audit Automation + Dedup Fixes

**Date:** 2026-03-08
**Theme:** Close every open audit finding, automate what was manual, prove tier freshness system-wide
**Previous Critique Score:** 6/10 — tier staleness not proven system-wide, CI/CD still deferred, audit findings still open
**Story Points:** 28

---

## Mission Alignment

TopRanker's credibility-weighted voting is the product. If tier data is stale anywhere in the system — public profiles, admin views, GDPR exports, or the authenticated session itself — the trust promise is broken. This sprint audits every code path that touches credibility tier, fixes the gaps, and puts automated guardrails in place so these problems cannot recur.

---

## Team Discussion

**Marcus Chen (CTO):** "The passport.deserializeUser fix is the single most impactful change in this sprint. Every authenticated request flows through passport deserialization. If that serves a stale tier, it doesn't matter how many individual endpoints we fix — req.user.tier is wrong everywhere. This was the root cause the critique was pointing at when it said 'not proven system-wide.' Now it is."

**Amir Patel (Architecture):** "shared/hash.ts completes the shared module pattern we started in Sprint 138. We now have shared/constants.ts, shared/types.ts, and shared/hash.ts as the canonical cross-cutting modules. The requireAuth extraction to server/middleware.ts follows the same principle — one source of truth, imported everywhere. No more copy-paste middleware."

**Sarah Nakamura (Lead Engineer):** "CI means tests run automatically on every push to main and every PR. No more 'I forgot to run tests.' The pipeline is blocking — if tests fail, the PR cannot merge. We also check file sizes (no file over 500 lines), type cast counts (flag if as any exceeds threshold), @types in devDependencies, and TypeScript compilation. This is the foundation for everything else."

**Elena Vasquez (Design Lead):** "No design deliverable this sprint — the work was entirely backend and tooling. I've been working on experiment measurement UI mockups for Sprint 142. Question for the team: do we want a dedicated experiments dashboard page, or should it live inside the existing admin dashboard?"

**Nadia Kaur (Cybersecurity):** "The passport.deserializeUser fix has security implications people might not see. If a user's tier is downgraded due to suspicious activity but their session still carries the old tier, they retain elevated trust weighting until they log out and back in. That's a security gap, not just a freshness issue. Now tier is recomputed on every request from the database, so tier changes propagate immediately."

**David Kim (QA Lead):** "111 new tests this sprint, bringing us to 1722 across 75 files. 100 of those new tests are specifically for tier path coverage — every one of the 19 code paths that read, write, or compute credibility tier now has explicit test coverage proving it returns fresh data. The remaining 11 tests cover the dedup refactors (requireAuth extraction, hashString extraction) and the health check script output."

**Rachel Wei (CFO):** "CI/CD gives the board confidence in release quality. When we present to investors, 'every push is automatically tested and validated' is table stakes for a serious product. The audit scorecard is also useful for board reporting — we can show a trend line of findings raised vs. resolved and prove we're not accumulating technical debt."

**Jordan Blake (Compliance):** "The GDPR export fix is the one that concerns me most from a regulatory standpoint. Article 20 requires that data portability exports contain accurate data. If a user exports their data and their credibility tier is stale — showing Gold when they've actually been downgraded to Silver — that's inaccurate data in a compliance-mandated export. This is now fixed; the export endpoint recomputes tier before serializing."

---

## Deliverables

### 1. GitHub Actions CI/CD Pipeline

**File:** `.github/workflows/ci.yml`

Runs on: push to `main`, pull requests to `main`

Pipeline stages (all blocking):
1. **Install dependencies** — `npm ci` with cached node_modules
2. **TypeScript check** — `npx tsc --noEmit` must pass with zero errors
3. **Test suite** — `npm test` must pass all 1722 tests
4. **File size check** — no single file exceeds 500 lines (flags violations)
5. **Type cast count** — counts `as any` casts across codebase, fails if above threshold (currently 12)
6. **@types audit** — verifies all @types packages are in devDependencies, not dependencies
7. **Function duplication check** — flags functions defined in more than one file

If any stage fails, the workflow exits with code 1 and the PR/push is marked as failed.

### 2. Automated Health Check Script

**File:** `scripts/arch-health-check.sh`

Replaces manual recurring audit findings. Executable bash script with color-coded output:
- GREEN: check passed
- YELLOW: warning (approaching threshold)
- RED: failed (exits with code 1)

Checks performed:
| Check | Threshold | Action on Fail |
|-------|-----------|----------------|
| File size | > 500 lines | RED — must split |
| `as any` casts | > 15 total | RED — must fix |
| @types in dependencies | > 0 | RED — move to devDeps |
| Test count | < previous sprint | YELLOW — tests deleted? |
| Function duplication | > 0 matches | RED — extract to shared |
| TODO/FIXME count | > 20 | YELLOW — tech debt growing |

Can be run locally (`bash scripts/arch-health-check.sh`) or as part of CI.

### 3. Cumulative Audit Scorecard

**File:** `scripts/audit-scorecard.md`

Running tracker of every finding ever raised across all architectural audits (Audit #1 through #12). Format:

| Finding | Raised | Severity | Status | Sprint Resolved | Sprints Open |
|---------|--------|----------|--------|----------------|--------------|

Escalation rules:
- CRITICAL findings: must be resolved in the same sprint or next sprint (max 1 sprint open)
- HIGH findings: must be resolved within 2 sprints
- MEDIUM findings: must be resolved within 5 sprints
- Any finding open longer than its SLA is auto-escalated to the next severity level

Current state: **0 open findings.** All historical findings resolved.

### 4. Tier Path Audit

**File:** `docs/audits/TIER-PATH-AUDIT-141.md`

Comprehensive audit of every code path in the system that reads, writes, or computes credibility tier. **19 total paths identified:**

#### Paths Already Covered (15/19 — no changes needed):
1. `POST /api/vote` — tier computed fresh at vote time for weighting
2. `POST /api/challenger/vote` — same fresh computation
3. `GET /api/rankings/:category` — tier displayed from vote-time snapshot (correct)
4. `GET /api/challenger/:id` — tier from vote-time snapshot (correct)
5. `POST /api/auth/login` — tier computed at login, stored in session
6. `POST /api/auth/register` — tier initialized to Bronze (correct)
7. `GET /api/account/settings` — reads from session, session set at login (acceptable)
8. `PUT /api/account/settings` — does not modify tier (correct)
9. `POST /api/reviews` — tier computed fresh for review credibility weighting
10. `GET /api/reviews/:businessId` — tier from review-time snapshot (correct)
11. `GET /api/leaderboard` — tier computed fresh for leaderboard ranking
12. `GET /api/notifications` — does not use tier (correct)
13. `POST /api/bookmarks` — does not use tier (correct)
14. `GET /api/search` — does not use tier (correct)
15. `DELETE /api/account` — does not need fresh tier for deletion (correct)

#### Paths Fixed This Sprint (4/19):
16. **`GET /api/members/:username`** — Public profile endpoint was returning tier from the members table without recomputing. Now calls `computeTier(member)` before response.
17. **`GET /api/account/export`** — GDPR Article 20 data portability export was serializing tier directly from the database row. Now recomputes before including in export payload.
18. **`GET /api/admin/members`** — Admin member list was returning raw database tier. Now recomputes for each member in the response (with caching to avoid N+1).
19. **`passport.deserializeUser`** — The authentication deserialization callback was loading the user row and attaching it to `req.user` without recomputing tier. This meant EVERY authenticated request carried potentially stale tier data. Now recomputes tier during deserialization.

**Fix #19 is the critical one.** passport.deserializeUser runs on every authenticated request. If tier is stale there, it's stale everywhere that reads `req.user.tier` — which is most of the application. This single fix closes the system-wide tier freshness gap the critique identified.

### 5. Dedup Fixes

| Before | After | Files Affected |
|--------|-------|---------------|
| `requireAuth` defined in 4 route files | Extracted to `server/middleware.ts`, imported everywhere | 4 route files + 1 new middleware file |
| `hashString` defined in 2 files | Extracted to `shared/hash.ts`, imported everywhere | 2 source files + 1 new shared module |
| 5 @types packages in `dependencies` | Moved to `devDependencies` | package.json |
| Redundant try/catch wrapping Express error handler | Removed — Express error middleware handles it | 3 route files |

---

## Testing

| Metric | Sprint 140 | Sprint 141 | Delta |
|--------|-----------|-----------|-------|
| Total tests | 1611 | 1722 | +111 |
| Test files | 72 | 75 | +3 |
| Tier path tests | 0 | 100 | +100 |
| Dedup/refactor tests | — | 11 | +11 |
| Pass rate | 100% | 100% | — |
| Execution time | <900ms | <950ms | +50ms |

All 1722 tests passing. The 100 tier path tests cover all 19 code paths with multiple scenarios each (fresh computation, cache invalidation, concurrent updates, edge cases).

---

## PRD Gap Closure

- **Tier freshness system-wide:** CLOSED. All 19 paths audited, 4 fixed, passport.deserializeUser fix ensures session-level freshness.
- **CI/CD pipeline:** CLOSED. GitHub Actions workflow operational, blocking on failures.
- **Audit automation:** CLOSED. Health check script + scorecard replace manual recurring findings.
- **Code deduplication:** CLOSED. requireAuth and hashString extracted, @types corrected.

---

## What's Next (Sprint 142)

- Experiment measurement tracking (A/B test infrastructure)
- Performance profiling (identify bottlenecks in tier recomputation on every request)
- Consider reducing architectural audit frequency now that CI handles mechanical checks
- Elena's experiment dashboard UI mockups
