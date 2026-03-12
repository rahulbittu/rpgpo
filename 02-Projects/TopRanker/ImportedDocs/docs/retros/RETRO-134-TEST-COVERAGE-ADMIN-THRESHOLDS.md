# Retrospective — Sprint 134: Test Coverage, Admin Thresholds & Critical Bugfixes

**Date:** 2026-03-08
**Duration:** ~2 hours
**Story Points:** 8
**Facilitator:** Sarah Nakamura

---

## What Went Well

**Sarah Nakamura (Lead Eng):** "We closed ALL test coverage gaps from seven sprints in a single batch. Going from 1230 to 1277 tests with zero flaky additions — every test is deterministic and covers a real trust surface. This is the kind of debt paydown that compounds."

**Marcus Chen (CTO):** "Parallel execution was flawless this sprint. Three workstreams running simultaneously — test writing, admin endpoint development, and tech debt documentation — with no merge conflicts and no stepping on each other. That's the operating model working as designed."

**Elena Rodriguez (Design):** "The false offline banner was reported by users and fixed within the same sprint. We didn't defer it, we didn't put it in the backlog for 'next time.' Same-day fix for a trust-damaging UX bug. That's how it should work every time."

**Liam O'Brien (Analytics):** "The test coverage now includes the exact data paths that feed our trust scores — tier influence labels, rank confidence labels, rating mappers. These are the paths where a silent regression would be invisible to error monitoring but devastating to user trust. Having deterministic tests on them changes our deployment risk profile."

---

## What Could Improve

- **CSP should have been updated when Google Maps was first integrated (Sprint 82).** We shipped a Maps integration without updating Content-Security-Policy, and it took 52 sprints to catch it. This is a process failure, not an oversight.
- **External URL pings for connectivity should have been flagged during code review.** Fetching `clients3.google.com/generate_204` from a web context is a known CORS risk pattern. Code review should have caught this when NetworkBanner was originally implemented.
- **Test coverage should not accumulate 7 sprints of debt.** We tracked the gap in retros but didn't prioritize closing it until it became a blocker. Coverage debt should be addressed incrementally each sprint, not batched.

---

## Action Items

| # | Action | Owner | Target Sprint |
|---|--------|-------|---------------|
| 1 | Add CSP review to PR checklist when adding external service integrations | Nadia Kaur | Sprint 135 |
| 2 | Investigate @react-native-community/netinfo for native offline detection | Priya Sharma | Sprint 136 |
| 3 | Build admin UI for confidence threshold tuning (PUT endpoint) | Marcus Chen | Sprint 136 |

---

## Team Morale

**9/10** — Fixing user-reported bugs same-day combined with a massive test coverage jump (47 tests) boosted team confidence significantly. The parallel execution model proved its value again. The only deduction is the lingering frustration that the CSP and connectivity bugs existed for as long as they did — but the speed of resolution once identified was excellent.
