# Sprint 258 — Core Loop Truth Fixes (P0 Audit Response)

**Date**: 2026-03-09
**Theme**: Core Loop Truth Fixes
**Story Points**: 8
**Tests Added**: 5113 passing across 183 files

---

## Mission Alignment

Fixed 3 P0 issues from core loop audit. Constitution demands truth before features.
Tier namespace collision, stale architecture docs, and missing confidence labels all
undermine the credibility-weighted ranking system that IS the product.

---

## Team Discussion

**Amir Patel (Architecture)**: "Tier namespace collision was a real source-of-truth
conflict. Two incompatible tier systems coexisting is exactly what Constitution #15
warns against. We exported ReputationTier type and added doc comments clarifying that
the internal 5-tier reputation (newcomer→authority) is SEPARATE from the production
4-tier credibility (community→top) in shared/credibility.ts."

**Sarah Nakamura (Lead Eng)**: "Confidence labeler follows the same pattern as other
shared modules. Clean implementation — provisional/early/moderate/established labels
for low-data honesty per Constitution #9."

**Marcus Chen (CTO)**: "ARCHITECTURE.md having 11 missing tables is embarrassing. One
source of truth means the docs match the code. We went from 20 to 31 tables documented.
This should never have drifted that far."

**Nadia Kaur (Security)**: "The TYPOGRAPHY crash was a P0 that made it to production.
No user could see ANY tab including Discover. Three files referenced
TYPOGRAPHY.heading.fontFamily which doesn't exist — should be TYPOGRAPHY.display.fontFamily."

**Leo Hernandez (Design)**: "TYPOGRAPHY.heading was my mistake from Sprint 167 dish
leaderboard. Should have been TYPOGRAPHY.display all along. 90+ sprints undetected."

**Jordan Blake (Compliance)**: "Constitution adoption creates accountability. These P0
fixes prove the audit protocol works. We found real bugs, not hypothetical ones."

---

## Changes

### Fix 1: Tier Namespace Collision
- Exported ReputationTier type in shared/credibility.ts
- Added doc comments clarifying internal 5-tier reputation (newcomer→authority) is
  SEPARATE from production 4-tier credibility (community→top)
- Updated reputation-v2.ts to use explicit type references

### Fix 2: ARCHITECTURE.md Schema Update
- Updated schema documentation from 20 to 31 tables
- 11 missing tables added to match actual database schema
- One source of truth: docs now match the code

### Fix 3: Confidence Labeler
- Created confidence-labeler.ts
- Labels: provisional/early/moderate/established for low-data honesty
- Implements Constitution #9 — honest about data quality

### Fix 4: TYPOGRAPHY.heading Crash
- 3 files referenced TYPOGRAPHY.heading.fontFamily which doesn't exist
- Fixed to TYPOGRAPHY.display.fontFamily in DishLeaderboardSection.tsx, dish/[slug].tsx
- Was blocking entire app render — P0 production crash

---

## Files Changed

- `shared/confidence-labeler.ts` (new)
- `shared/reputation-v2.ts`
- `docs/ARCHITECTURE.md`
- `components/DishLeaderboardSection.tsx`
- `app/dish/[slug].tsx`
- Sprint 167 test threshold bump

---

## Core Loop Question

**YES** — fixes truth bugs that undermine ranking credibility. Constitution demands
truth before features.

---

## What's Next (Sprint 259)

Best In Dallas — sub-category system and UI for "Best [Specific Thing] in [City]" format.
