# Retro 171: routes.ts Domain Splitting

**Date:** 2026-03-09
**Duration:** 1 sprint
**Story Points:** 5
**Facilitator:** Sarah Nakamura

---

## What Went Well
- **Marcus Chen:** "6-audit recurring finding closed permanently. routes.ts is 324 lines — never touching the 1000 LOC CI limit again."
- **Amir Patel:** "The extraction pattern (registerXRoutes) is now proven across 8 route modules. New domains get their own file by default."
- **Sarah Nakamura:** "11 test file updates and zero logic changes — every test assertion stayed the same, just pointed at the right file. That's a clean refactor."
- **Jordan Blake:** "All GDPR endpoints in one file (routes-auth.ts) makes compliance auditing dramatically simpler."

## What Could Improve
- Should have done this 3 audits ago — the recurring finding was a sign of procrastination
- tier-staleness.ts had hardcoded file paths in TIER_SEMANTICS — these were brittle and broke during extraction
- No automated check that verifies all endpoints are still registered after extraction

## Action Items
- [ ] **Sprint 172:** rate/[id].tsx decomposition (P0 — next technical debt item)
- [ ] **Future:** Consider automated endpoint registration verification in CI
- [ ] **Future:** Remove hardcoded file paths from TIER_SEMANTICS — use route registration validation instead

## Team Morale
**9/10** — Closing a 6-audit recurring finding feels good. The codebase is materially cleaner. Ready for the revenue features in Sprints 173-174.
