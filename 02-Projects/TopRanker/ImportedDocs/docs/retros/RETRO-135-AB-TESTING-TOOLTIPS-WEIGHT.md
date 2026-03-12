# Sprint 135 Retrospective: A/B Testing Framework, Confidence Tooltips, Personalized Vote Weight

**Date:** 2026-03-08
**Duration:** ~2.5 hours
**Story Points:** 10
**Facilitator:** Sarah Nakamura

---

## What Went Well

**Sarah Nakamura (Lead Eng):**
"The A/B framework came together fast because we kept it pure — no async, no server calls, just deterministic math. Writing 34 tests for it took less time than I budgeted because every function is a pure input-output mapping. This is how we should build more infrastructure."

**Priya Sharma (Frontend):**
"Tooltips slotted into SubComponents with zero refactoring. The fact that we already had confidence indicators as isolated sub-components meant I just wrapped them in a row and added the icon. The pattern we set up in Sprint 130 for modular card parts is paying dividends."

**Liam O'Brien (Analytics):**
"Having the experiment_exposure event schema locked down from day one means we won't have to backfill or migrate when we start analyzing results. The deduplication guard was a quick add that saves us from noisy data. This is a solid foundation for experiment analysis."

**Marcus Chen (CTO):**
"Three parallel streams — framework, tooltips, personalized weight — all landed without conflicts. The team's ability to divide and execute independently keeps improving. Also, closing the A/B testing action item that's been sitting in backlog since Sprint 131 feels overdue but good."

---

## What Could Improve

- **Client-side experiment assignment can leak variants.** A motivated user could inspect the hash logic and determine their bucket before seeing the UI. For trust features this is low risk, but for any revenue or access experiments we'll need server-side assignment. This is planned for Sprint 137 but should be treated as a hard prerequisite before activating high-stakes experiments.

- **Tooltip accessibility on mobile needs testing.** The tap-to-toggle pattern works for sighted touch users, but we haven't verified screen reader behavior. The info icon needs an accessibility label, and the tooltip content needs to be announced. Elena flagged this during the sprint and we deferred it — it needs to land in Sprint 136.

- **Personalized weight section relies on AuthProvider tier data being fresh.** If tier data is stale (e.g., user leveled up but cache hasn't invalidated), the motivational prompt could show incorrect information. We should add a staleness check or tie it to the same refresh cycle as the profile page.

---

## Action Items

| # | Action | Owner | Target Sprint |
|---|--------|-------|---------------|
| 1 | Wire A/B experiments into confidence_tooltip feature — activate experiment, connect variant to tooltip visibility | Priya Sharma | Sprint 136 |
| 2 | Server-side experiment assignment endpoint — `/api/experiments/assign` with same DJB2 logic server-side | Marcus Chen | Sprint 137 |
| 3 | Accessibility audit of tooltip interactions — screen reader labels, focus management, announcement | Elena Rodriguez | Sprint 136 |
| 4 | Add A/B testing disclosure to privacy policy data processing section | Jordan Blake | Sprint 136 |
| 5 | Tier data staleness check for personalized weight display | Sarah Nakamura | Sprint 137 |

---

## Team Morale

**9/10** — Closing the A/B testing backlog item that had been carried since Sprint 131 felt like a real win. The team executed three parallel streams cleanly with no merge conflicts. The confidence tooltips add visible user value, and the personalized weight feature makes the tier system tangible. Energy is high heading into the SLT boundary meeting and the next sprint cycle.
