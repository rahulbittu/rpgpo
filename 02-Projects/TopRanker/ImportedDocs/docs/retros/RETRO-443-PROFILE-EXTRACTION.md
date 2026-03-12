# Retro 443: Profile Extraction — Rating History Section

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 2
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "Audit #46 flagged profile.tsx as WATCH at 87.4%. One sprint later, it's at 78.4%. This is exactly how the governance cycle should work: audit identifies risk, SLT prioritizes it, sprint resolves it. The extraction was clean — no functional changes, just structural improvement."

**Amir Patel:** "The component boundary was natural. Rating history has its own state (pagination), its own imports (HistoryRow, RatingExportButton, SlideUpView), and its own styles. That's the textbook signal for extraction. Profile.tsx dropped 72 lines and 3 imports."

**Sarah Nakamura:** "Two test files needed redirection — sprint384 and sprint433. Both were reading from profile.tsx for content that moved. Simple fix: change the readFile path. No test logic changes needed."

## What Could Improve

- **profile.tsx still has 627 LOC** — plenty of headroom now, but the savings/badges/payment sections could be candidates for future extraction if profile grows again.
- **No automated extraction tooling** — we extract manually and fix tests by hand. Consider a script that finds style references and reports unused ones after extraction.

## Action Items

- [ ] Begin Sprint 444 (Business page review summary cards) — **Owner: Sarah**
- [ ] Monitor profile.tsx LOC in Audit #47 — **Owner: Amir**
- [ ] Consider saved places section extraction if profile grows past 680 — **Owner: Sarah**

## Team Morale
**8/10** — Clean refactoring sprint. Resolving the only WATCH file feels good. The team appreciates that governance findings get actioned promptly.
