# Sprint 144 Retrospective: Live Experiments & MapView Extraction

**Date:** 2026-03-08
**Duration:** 1 sprint cycle
**Story Points:** 21 (experiment activation/wiring 8, MapView extraction 5, E2E tests 5, product tests 3)
**Facilitator:** Sarah Nakamura

---

## What Went Well

- **Marcus Chen (CTO):** "Activating experiments closes a two-sprint critique gap — we're finally running, not just building."
- **Sarah Nakamura (Lead Eng):** "E2E pipeline tests prove assignment through dashboard in one test file — strongest validation yet."
- **Priya Sharma (Frontend):** "MapView extraction was clean — 194 lines moved with zero regressions."

## What Could Improve

- HTTP-level freshness tests still not addressed — deferred for the third time. This is becoming a recurring gap that risks staleness bugs slipping through.
- `business/SubComponents.tsx` still at 997 LOC — the MapView extraction didn't decompose it further. The file remains a maintenance burden.
- Product validation tests needed post-extraction fixes due to a stale `DiscoverPhotoStrip` reference, indicating test imports weren't verified before the extraction landed.

## Action Items

| # | Action | Owner | Target |
|---|--------|-------|--------|
| 1 | Write HTTP-level integration tests for FRESH endpoints next sprint | Sarah Nakamura | Sprint 145 |
| 2 | Break `business/SubComponents.tsx` into individual component files | Priya Sharma | Sprint 145 |
| 3 | Add pre-extraction test impact analysis to checklist | Derek Williams | Sprint 145 |

## Team Morale

**8/10** — Strong momentum addressing critique priorities. The two-sprint experiment gap is finally closed. 1947 tests all green.
