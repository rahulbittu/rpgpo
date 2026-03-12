# Sprint 144: Live Experiments Activation + MapView Extraction

**Date:** 2026-03-08
**Sprint Goal:** Activate all A/B experiments with real UI wiring, extract MapView from search.tsx, and prove the full experiment pipeline end-to-end with integration and product validation tests.
**Previous Critique Score:** 7/10 (Sprint 143)

---

## Mission Reminder

TopRanker exists to become the go-to platform for trustworthy rankings — free from spam, fake reviews, and pay-to-play. Credibility-weighted voting is the product. Every sprint must serve the trust mission.

---

## Team Discussion

**Marcus Chen (CTO):** Finally running real experiments — this is what the infrastructure was built for. We spent three sprints building experiment tracking, dashboards, Wilson score intervals, and automated recommendations. None of that matters if experiments sit dormant with `active: false`. Activating all three and wiring two new ones into actual UI paths means we are generating real data for product decisions. This is the inflection point from infrastructure investment to product intelligence.

**Sarah Nakamura (Lead Engineer):** The E2E pipeline tests prove the full loop works, not just individual pieces. We validated assignment through exposure through outcome through dashboard through recommendation — the entire lifecycle. Twenty-four tests covering statistical correctness and cross-component integration give us confidence that the experiment system is production-grade. Combined with the product validation tests, we have 48 new tests proving both the pipeline and the feature integrations.

**Amir Patel (Architecture):** The MapView extraction keeps search.tsx manageable — 907 down to 713 LOC is a 21% reduction. Moving MapView (~160 lines), CITY_COORDS, and Google Maps imports into components/search/SubComponents.tsx follows the same SubComponents pattern we established in Sprint 143 for challenger and business detail. Consistent extraction patterns across the codebase reduce cognitive load for any engineer touching these files.

**Jasmine Taylor (Marketing):** Two new experiments give us real A/B data for product decisions. The `trust_signal_style` experiment (text labels vs icon-only) directly tests how users respond to trust communication — this is core to our brand promise. The `personalized_weight` experiment shows tier-specific vote weight to treatment users, which could drive tier progression engagement. Both experiments feed into the dashboard we built last sprint, so we will have automated recommendations within weeks.

**Priya Sharma (Frontend):** The useExperiment hook makes variant-conditional rendering clean and simple. In challenger.tsx, the treatment group sees their personalized vote weight based on tier while control sees generic "How Voting Works" — it is a one-line hook call and a ternary. Same pattern in SubComponents.tsx for trust signal styles. This proves the experiment system is developer-friendly, not just statistically rigorous.

**Derek Williams (QA):** Forty-eight new tests this sprint including full lifecycle and statistical correctness validation. The E2E pipeline tests (24) cover the complete experiment flow from user assignment to dashboard recommendation output. The product validation tests (24) verify experiment integration in the UI, file size compliance after extraction, component extraction integrity, and search page regression. We are now at 1947 tests across 83 files, all green under 1.5 seconds.

**Nadia Kaur (Cybersecurity):** Experiment assignment is deterministic via hash — no randomness vulnerabilities. The assignment function uses a consistent hash of user ID and experiment name, which means the same user always gets the same variant. No PRNG state to leak, no timing attacks on assignment. The personalized weight display only shows the user their own tier data, so there is no information disclosure risk.

**Jordan Blake (Compliance):** A/B testing respects our existing consent framework per privacy policy Section 13. Experiment enrollment is tracked at the aggregate level for dashboard metrics. The personalized weight display uses data the user already has access to (their own tier). Trust signal style variants are purely presentational — no data collection difference between control and treatment. All compliant.

---

## Deliverables

### 1. Activated All 3 A/B Experiments (`lib/ab-testing.ts`)
All three experiments set to `active: true`:
- **confidence_tooltip** — already active from previous sprint, continues running
- **trust_signal_style** (NEW activation) — treatment shows text labels ("Verified", "Established") for trust signals; control keeps icon-only display
- **personalized_weight** (NEW activation) — treatment sees personalized vote weight based on their credibility tier; control sees generic "How Voting Works"

This directly addresses Sprint 143 critique priority #1: "Run one live experiment or delete the experiment dashboard code."

### 2. Personalized Weight Experiment — Challenger Page (`app/(tabs)/challenger.tsx`)
Wired `personalized_weight` experiment into the challenger page using the `useExperiment` hook:
- **Treatment group:** Sees personalized vote weight based on their credibility tier, reinforcing the tier progression system
- **Control group:** Sees generic "How Voting Works" explainer
- Clean integration via variant-conditional rendering with a single hook call

### 3. Trust Signal Style Experiment — Business Detail (`components/business/SubComponents.tsx`)
Wired `trust_signal_style` experiment into the business detail trust signals:
- **Treatment group:** Sees text labels ("Verified", "Established") alongside trust signal icons
- **Control group:** Keeps icon-only trust signal display
- Tests how explicit trust communication impacts user confidence in rankings

### 4. MapView Extraction from Search Page
`app/(tabs)/search.tsx` reduced from **907 → 713 LOC** (-21%) by extracting:
- **MapView component** (~160 lines) moved to `components/search/SubComponents.tsx`
- **CITY_COORDS** constant and Google Maps imports relocated
- `components/search/SubComponents.tsx` grew from 357 → 554 LOC
- Follows the same SubComponents pattern used for challenger and business detail extractions

### 5. E2E Experiment Pipeline Tests (24 tests)
Full pipeline validation proving the experiment system works end-to-end:

| Category | Count | What It Proves |
|---|---|---|
| Assignment → Exposure → Outcome | 6 | Complete user journey through experiment lifecycle |
| Dashboard computation from live data | 6 | Dashboard accurately reflects experiment state |
| Recommendation generation | 4 | Automated recommendations match statistical reality |
| Statistical correctness | 4 | Wilson score intervals and sample size calculations hold |
| Cross-component integration | 4 | Experiment state consistent across hook, tracker, and dashboard |

### 6. Product Validation Tests (24 tests)
Feature integration and regression tests:

| Category | Count | What It Proves |
|---|---|---|
| Experiment UI integration | 8 | useExperiment hook correctly drives variant rendering in challenger and business detail |
| File size compliance | 4 | Extracted files stay within target LOC bounds |
| Component extraction integrity | 6 | MapView extraction preserves all functionality and props |
| Search page regression | 6 | Search page behavior unchanged after extraction |

---

## Testing

| Metric | Value |
|---|---|
| Total Tests | 1947 |
| Test Files | 83 |
| New Tests | +48 |
| Pass Rate | 100% |
| Execution Time | <1.5s |

New test breakdown:
- E2E experiment pipeline tests: 24
- Product validation tests: 24

---

## Critique Response Alignment

Sprint 143 external critique (7/10) identified three priorities:

| Critique Priority | Sprint 144 Response | Status |
|---|---|---|
| **1. Run one live experiment or delete the dashboard code** | All 3 experiments activated (`active: true`), two NEW experiments wired into actual UI (challenger + business detail) with useExperiment hook | **Addressed** |
| **2. HTTP-level freshness tests** | Not addressed this sprint — deferred to Sprint 145 | **Deferred** |
| **3. Break up oversized SubComponents + extract search.tsx** | search.tsx reduced 907→713 LOC via MapView extraction; business SubComponents still 997 LOC (partially addressed) | **Partial** |

### What Remains from Critique
- HTTP-level freshness tests (cache headers, ETags, 304 responses) — scheduled for Sprint 145
- Business SubComponents.tsx (997 LOC) needs further extraction — candidate for next component extraction pass

---

## PRD Alignment
- **Credibility-weighted voting:** Personalized weight experiment directly tests whether showing users their tier-based vote weight drives engagement with the credibility system
- **Trustworthy rankings:** Trust signal style experiment measures how explicit trust communication affects user confidence
- **Data-driven decisions:** All three experiments now generating real data feeding into the Wilson score dashboard and automated recommendations
- **Code quality:** MapView extraction continues the systematic reduction of oversized files, keeping the codebase maintainable

## Next Sprint (145)
- HTTP-level freshness tests (cache headers, ETags, 304 responses) — critique priority carried forward
- Business SubComponents.tsx further extraction (997 LOC target reduction)
- DB persistence for experiment data (replace in-memory store)
- Design deliverable (overdue since Sprint 142)
- Experiment data analysis from first live results
