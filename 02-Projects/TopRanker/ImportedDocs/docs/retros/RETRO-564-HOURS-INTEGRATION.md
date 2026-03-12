# Retro 564: Hours Integration End-to-End Test

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Sarah Nakamura:** "Finally. The hours pipeline has been building since Sprint 554 and we've had individual tests for each piece, but no single test that validates the full chain. The roundtrip tests are particularly satisfying — weekday_text → periods → weekday_text with zero data loss."

**Amir Patel:** "This is a real integration test — actual imports, actual function calls, actual assertions on return values. Not source-based. The computeOpenStatus tests use real CST timestamps to verify open/closed status. If the time zone logic or AM/PM parsing breaks, this test catches it immediately."

**Marcus Chen:** "First feature sprint in four. After three extractions (561-563), the team delivered a meaningful testing improvement. The hours pipeline is now the most thoroughly tested feature in the codebase."

## What Could Improve

- **No test for the HTTP roundtrip** — The integration test verifies function behavior and source wiring, but doesn't make an actual PUT request to the hours endpoint. Would need a test server for that.
- **computeOpenStatus timezone dependency** — The function uses `toLocaleString` with "America/Chicago", which works in Node but may behave differently in different environments. Consider extracting timezone to a parameter.
- **Missing test: what happens when owner edits hours that were originally from Google Places?** — The pre-fill fetches from the business record, but if that data came from Google, the weekday_text format might differ slightly from what our conversion expects.

## Action Items

- [ ] Sprint 565: Governance (SLT-565 + Audit #71 + Critique 561-564) — **Owner: Sarah**
- [ ] Consider timezone-parameterized computeOpenStatus — **Owner: Amir** (low priority)
- [ ] Test Google Places format compatibility — **Owner: Sarah** (future sprint)

## Team Morale
**9/10** — Runtime integration tests feel impactful. The hours pipeline is now the most battle-tested feature. Team is energized heading into the governance sprint.
