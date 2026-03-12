# Retro 162: TypeScript Strict Mode — Zero Server Errors

**Date:** 2026-03-09
**Duration:** 1 sprint
**Story Points:** 5
**Facilitator:** Sarah Nakamura

---

## What Went Well
- **Sarah Nakamura:** "11 server errors to zero. The rating sanitization was the scariest — `parsed.data.score` didn't even exist on the type. Production was likely hitting the fallback value (3) for every rating."
- **Amir Patel:** "Tier staleness id type was `number` when schema uses `string`. This fix prevents a class of silent failures in credibility recalculation."
- **Marcus Chen:** "Clean TypeScript means we can enable stricter CI checks in the future."

## What Could Improve
- ~130 TS errors remain in test files and React Native types — these are lower priority but should be tracked
- The `parsed.data.score` bug was live — we should add a test for the sanitization output
- Rating score validation should be end-to-end tested (submit rating → verify q1/q2/q3 are in [1,5])

## Action Items
- [ ] **Sprint 163+:** Add end-to-end rating sanitization test
- [ ] **Ongoing:** Track lib/test TS errors in audit scorecard
- [ ] **Consider:** Enabling `tsc --noEmit` in CI for server/ directory only

## Team Morale
**9/10** — Eight consecutive forward-progress sprints. Zero server TS errors is a milestone. Team is in flow.
