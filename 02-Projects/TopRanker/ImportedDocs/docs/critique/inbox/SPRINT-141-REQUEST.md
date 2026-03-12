# Sprint 141 Critique Request

**Previous Score:** 6/10
**Previous Feedback:** Tier staleness not proven system-wide, CI/CD still deferred, audit findings still open.

---

## Deliverables for Review

### 1. Tier Path Audit — 19 Paths Enumerated

We audited every code path in the system that reads, writes, or computes credibility tier. 19 total paths were identified:

**Already Covered (15/19):**
1. POST /api/vote — tier computed fresh at vote time
2. POST /api/challenger/vote — tier computed fresh at vote time
3. GET /api/rankings/:category — tier from vote-time snapshot (correct by design)
4. GET /api/challenger/:id — tier from vote-time snapshot (correct by design)
5. POST /api/auth/login — tier computed at login
6. POST /api/auth/register — tier initialized to Bronze
7. GET /api/account/settings — reads session tier (set at login)
8. PUT /api/account/settings — does not modify tier
9. POST /api/reviews — tier computed fresh for review weighting
10. GET /api/reviews/:businessId — tier from review-time snapshot (correct by design)
11. GET /api/leaderboard — tier computed fresh
12. GET /api/notifications — does not use tier
13. POST /api/bookmarks — does not use tier
14. GET /api/search — does not use tier
15. DELETE /api/account — does not need fresh tier

**Fixed This Sprint (4/19):**
16. GET /api/members/:username — was serving stale tier from DB row, now recomputes
17. GET /api/account/export — GDPR Art. 20 export was serializing stale tier, now recomputes
18. GET /api/admin/members — admin list was returning raw DB tier, now recomputes (with cache)
19. passport.deserializeUser — EVERY authenticated request was carrying stale tier in req.user, now recomputes during deserialization

**Key question:** Does the passport.deserializeUser fix (#19) close the system-wide tier freshness gap? This single fix ensures that req.user.tier is fresh on every authenticated request, meaning any endpoint that reads req.user.tier (which is most of them) now gets current data.

### 2. GitHub Actions CI/CD Pipeline

File: `.github/workflows/ci.yml`
Triggers: push to main, PRs to main
Stages (all blocking):
- npm ci with cached dependencies
- TypeScript compilation check (tsc --noEmit)
- Full test suite (1722 tests)
- File size check (no file > 500 lines)
- Type cast count (as any threshold)
- @types audit (must be in devDependencies)
- Function duplication check

**Key question:** Is this CI/CD pipeline sufficient to replace the mechanical findings that recur in architectural audits (file sizes, type casts, @types placement)?

### 3. Automated Health Check Script

File: `scripts/arch-health-check.sh`
Color-coded output, exit code 1 on failure.
Checks: file sizes, type casts, @types, test count, function duplication, TODO/FIXME count.

### 4. Cumulative Audit Scorecard

File: `scripts/audit-scorecard.md`
Tracks every finding from Audit #1 through #12. Current state: 0 open findings.
Escalation rules by severity with sprint SLAs.

### 5. Dedup Fixes

- requireAuth extracted to server/middleware.ts (was in 4 files)
- hashString extracted to shared/hash.ts (was in 2 files)
- 5 @types moved to devDependencies
- Redundant try/catch removed from 3 route files

### 6. Testing

- 1722 tests across 75 files (+111 new)
- 100 tests specifically covering all 19 tier paths
- 11 tests for dedup/refactor changes
- 100% pass rate, <950ms execution

---

## Questions for the Critic

1. Does the passport.deserializeUser fix close the system-wide tier freshness gap that was flagged in the previous critique?
2. Is the CI/CD pipeline sufficient to replace mechanical audit findings, potentially allowing us to reduce audit frequency?
3. Is 100 tier path tests overengineered, or is it justified given the criticality of tier freshness to the product?
4. With zero open audit findings and automated checks in place, what should the next improvement focus be?
5. Does this sprint warrant a score increase from the previous 6/10?
