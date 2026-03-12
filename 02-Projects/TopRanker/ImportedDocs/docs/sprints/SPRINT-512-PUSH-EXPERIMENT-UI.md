# Sprint 512: Admin Push Experiment UI Card

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Add a PushExperimentsCard component to the admin dashboard showing active push notification A/B experiments with variant details, exposure counts, conversion rates, and Wilson CI recommendation badges.

## Team Discussion

**Marcus Chen (CTO):** "The push A/B system is now fully visible. Create an experiment via API, see it in the dashboard with live stats. Treatment winning? Insufficient data? The recommendation badge tells admins at a glance."

**Rachel Wei (CFO):** "The conversion rate color-coding (green >= 20%, red < 20%) matches our NotificationInsightsCard pattern. Consistency in admin tooling means faster decision-making."

**Amir Patel (Architect):** "Built as an external component (PushExperimentsCard) to keep admin/index.tsx from crossing the 600 LOC threshold flagged in Audit #60. The dashboard adds only a useQuery + one render line. Component carries its own styles and types."

**Sarah Nakamura (Lead Eng):** "The card shows all experiments with per-variant breakdown: sent count, opened count, conversion rate, and the Wilson CI recommendation. Empty state guides admins to the API endpoint for experiment creation."

**Jasmine Taylor (Marketing):** "I can see at a glance whether our weekly digest copy test is getting enough data for a decision. 'INSUFFICIENT DATA' tells me to wait. 'TREATMENT WINNING' tells me to ship the new copy."

## Changes

### New: `components/admin/PushExperimentsCard.tsx` (214 LOC)
- PushExperimentData, PushExperimentVariant, PushExperimentDashboard types
- RecommendationBadge: color-coded badge (green=treatment winning, blue=control, amber=promising, gray=inconclusive)
- VariantRow: per-variant stats (name, sent, opened, conversion rate)
- Empty state when no experiments
- Experiment block: description, category, active status, total exposures, variant rows

### Modified: `app/admin/index.tsx` (587→603 LOC)
- Added import: PushExperimentsCard, PushExperimentData
- Added useQuery for admin-push-experiments (staleTime 60s)
- Rendered PushExperimentsCard in overview tab after notification insights

### New: `__tests__/sprint512-push-experiment-ui.test.ts` (16 tests)

## Test Coverage
- 16 new tests, all passing
- Full suite: 9,441 tests across 401 files, all passing in ~5.1s
- Server build: 672.8kb
