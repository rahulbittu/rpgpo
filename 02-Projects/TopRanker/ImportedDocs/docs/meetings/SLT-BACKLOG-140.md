# SLT + Architecture Meeting — Sprint 140 Boundary

**Date:** 2026-03-08
**Meeting Type:** SLT Backlog Prioritization (Every 5 Sprints)
**Attendees:** Marcus Chen (CTO), Rachel Wei (CFO), Amir Patel (Architecture), Sarah Nakamura (Lead Eng)

---

## 1. Sprint 135-139 Review

**Marcus Chen:** "Review the arc: Sprint 135 established A/B testing, Sprint 136 fixed core-loop N+1 queries and rank recalc, Sprint 137 closed P1 audit items, Sprint 138 created shared credibility module + design system, Sprint 139 deployed wrapAsync across all routes + tier staleness + animation integration. External critique scores: 2, 6, 4, 3, 5. The upward trend from 3 to 5 is positive but we need to break through to 7+."

**Sarah Nakamura:** "Test suite grew from 847 (Sprint 135) to 1570 (Sprint 139). Zero regressions. wrapAsync eliminated 60+ catch blocks. The route layer is the cleanest it's been."

**Amir Patel:** "The shared credibility module is the most important architectural win. Logic duplication was a ticking time bomb for trust correctness. But the tier staleness module is still standalone — it exists but doesn't affect the live recalculation path. That's the #1 gap."

**Rachel Wei:** "The external critique is right — marking tier staleness as 'closed' when it's not integrated is a credibility problem for our own process. What's the revenue impact? If tier data is stale, vote weights are wrong, rankings are wrong, and our entire value proposition degrades."

---

## 2. Revenue Alignment

**Rachel Wei:** "We have 4 revenue streams: Challenger ($99), Dashboard Pro ($49/mo), Featured Placement ($199/week), Premium API. The trust thesis says better rankings lead to more users lead to more businesses willing to pay for visibility. But we can't prove that yet because we haven't activated and measured the confidence_tooltip experiment."

**Marcus Chen:** "The experiment is active in code — DJB2 bucketing assigns users to control/treatment. But we haven't collected engagement data to measure it. We need to close the measurement loop."

**Rachel Wei:** "I want engagement metrics flowing by Sprint 145. That means: experiment exposure tracking, outcome metrics (ratings per user, session duration), and a dashboard to view results."

---

## 3. Technical Debt Review

**Amir Patel:** "Current TECH-DEBT items. The biggest resolved items: TD-013 (leaderboard pagination), and the route error handling duplication. Active items:"

- **TD-007:** `as any` casts (22 remaining, most are RN platform limitation)
- **TD-009:** AsyncStorage migration path (medium priority)
- **NEW:** Tier staleness integration into recalculation flow
- **NEW:** Audio assets for audio engine (or cut scope)

**Sarah Nakamura:** "I'd also flag that we're approaching 1600 tests but have no CI/CD pipeline running them automatically. That's a process gap. Tests only run when a developer remembers."

---

## 4. Architectural Audit #12 Scope

**Amir Patel:** "Audit #12 should focus on:"

1. Route handler consistency after wrapAsync migration — verify no error handling regressions
2. Shared module pattern adoption — are there other areas where client/server logic diverges?
3. Animation/interaction performance — do the new animations cause jank on lower-end devices?
4. Test coverage gaps — what production paths still lack tests?
5. Dependency hygiene — stale deps, unused packages

---

## 5. Next 5 Sprints (140-145) Priorities

### Sprint 140 (Current)
- Integrate tier staleness into credibility recalculation flow (MUST — external critique #1)
- Arch Audit #12
- Write wrapAsync error propagation tests (external critique #2)

### Sprint 141
- Experiment measurement: exposure tracking + outcome collection
- Audio assets (or scope cut decision)
- CI/CD pipeline foundation (GitHub Actions)

### Sprint 142
- Experiment results dashboard
- Performance profiling (animation jank, API response times)
- Business detail page extraction (still at 934 LOC)

### Sprint 143
- Revenue attribution: can we correlate trust features with Business Pro conversion?
- Challenger flow improvements based on any A/B data
- Accessibility audit #2

### Sprint 144
- City expansion preparation (beyond Texas)
- Data localization assessment (DPDPA compliance)
- Photo CDN evaluation

### Sprint 145
- SLT Meeting — review Sprint 140-145 arc
- External critique target: 7+/10 core-loop score
- Revenue metrics dashboard for board presentation

---

## 6. Key Decisions

| # | Decision | Status | Target |
|---|----------|--------|--------|
| 1 | Tier staleness is NOT closed until integrated into recalculation. Standalone utilities don't count. | APPROVED | Sprint 140 |
| 2 | Pause animation/audio expansion until core trust pipeline is verified. (External critique priority #3) | APPROVED | Immediate |
| 3 | CI/CD pipeline is Sprint 141 priority. Tests without automation is process debt. | APPROVED | Sprint 141 |
| 4 | Experiment measurement by Sprint 145 or the confidence_tooltip experiment is cut. | APPROVED | Sprint 145 |

---

**Next SLT + Architecture Meeting:** Sprint 145
