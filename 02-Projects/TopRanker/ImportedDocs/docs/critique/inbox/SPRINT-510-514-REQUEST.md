# Critique Request: Sprints 510–514

**Date:** 2026-03-10
**Requesting Team:** TopRanker Engineering
**Scope:** Governance, push A/B wiring, experiment UI, claim evidence persistence, notification preference granularity

## What We Built

### Sprint 510: Governance
- SLT-510 meeting + Audit #60 (60th A-grade) + Critique request 506-509
- Zero critical/high findings, 2 medium (in-memory stores)

### Sprint 511: Push A/B Trigger Wiring
- All 4 notification triggers check for active A/B experiments
- Template variable system: {firstName}, {business}, {emoji}, {direction}, etc.
- Fallback to default copy when no experiment active

### Sprint 512: Push Experiment Admin UI
- PushExperimentsCard component with recommendation badges and variant stats
- Renders in admin dashboard overview tab alongside notification insights

### Sprint 513: Claim Evidence PostgreSQL Persistence
- New claimEvidence table (33rd in schema) with jsonb documents, match fields, score
- Storage module with upsert pattern (onConflictDoUpdate)
- Dual-write: in-memory cache + PostgreSQL fire-and-forget
- Admin routes: DB fallback for evidence reads

### Sprint 514: Notification Preference Granularity
- 2 new preference toggles: claimUpdates, newRatings (8 → 10 total)
- onClaimDecision now checks claimUpdates preference
- onNewRatingForBusiness uses newRatings with backward compat fallback

## Questions for Critique

1. **Dual-write pattern** — claim-verification-v2.ts writes to both in-memory Map and PostgreSQL with fire-and-forget DB writes. Is this an acceptable transitional pattern, or should we go DB-only immediately and accept the latency?

2. **Notification system complexity** — 23 sprints (492→514) for the notification subsystem. Is this proportional to value delivered, or have we over-invested in a meta-system at the expense of the core rating loop?

3. **admin/index.tsx over threshold** — at 603 LOC, this is the first watch file in 15 sprints. Is the claims tab extraction (Sprint 516) the right approach, or should we restructure the entire admin dashboard with a tab-component pattern?

4. **10 notification toggles** — is this the right granularity? Too few and users can't customize. Too many and the settings screen overwhelms. Should we add a "Mute All" toggle?

5. **Template variables in push A/B** — the variant body uses string replacement ({firstName}, {business}). Is this sufficient, or should we use a proper template engine to prevent injection?

## Metrics

- **9,478 tests** across 403 files
- **676.7kb** server build
- **33 DB tables** (was 32)
- **10 notification preference toggles**
- **61st consecutive A-grade** architectural audit
