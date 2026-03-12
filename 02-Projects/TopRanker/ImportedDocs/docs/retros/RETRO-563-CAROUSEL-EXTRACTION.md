# Retro 563: Photo Carousel Extraction

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 2
**Facilitator:** Sarah Nakamura

## What Went Well

**Sarah Nakamura:** "Three for three on extractions. dashboard.tsx, api.ts, CollapsibleReviews.tsx — all resolved in sequential sprints. 299 total LOC freed across the three highest-pressure files."

**Amir Patel:** "PhotoCarouselModal at 70 LOC is the smallest extracted component yet. It's a clean leaf component with no external state dependencies — visible/photos/loading/onClose are the entire interface. This is the ideal extraction profile."

**Marcus Chen:** "The extraction roadmap is complete. Sprint 564 is finally a feature sprint — the hours integration test. The team earned it after three consecutive maintenance sprints."

## What Could Improve

- **Three extraction sprints in a row is monotonous** — The critique from Sprint 560 was right. Consider interleaving one feature sprint between extractions in future cycles.
- **PhotoCarouselModal still instantiated per-rating** — The extraction makes it easier to lift to a shared instance, but that refactor hasn't been done yet. A single modal at the CollapsibleReviews level would be more efficient.
- **Carousel doesn't preload adjacent photos** — FlatList with pagingEnabled loads one at a time. Not urgent, but windowed preloading would improve perceived performance.

## Action Items

- [ ] Sprint 564: Hours integration end-to-end test — **Owner: Sarah**
- [ ] Sprint 565: Governance (SLT-565 + Audit #71 + Critique) — **Owner: Sarah**
- [ ] Consider lifting PhotoCarouselModal to shared instance (future) — **Owner: Amir**

## Team Morale
**8/10** — Extraction roadmap complete. Three consecutive maintenance sprints delivered cleanly. Looking forward to Sprint 564's feature work.
