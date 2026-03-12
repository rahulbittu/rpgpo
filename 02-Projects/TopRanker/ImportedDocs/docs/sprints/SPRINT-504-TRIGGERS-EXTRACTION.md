# Sprint 504: notification-triggers.ts Extraction

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Extract event-driven notification triggers from notification-triggers.ts (402 LOC, 89.3% of threshold) to a new notification-triggers-events.ts module. This was the only "watch" file in Arch Audit #58.

## Team Discussion

**Marcus Chen (CTO):** "This extraction follows the same proven pattern from Sprint 491 (routes) and Sprint 498 (storage). Move functions to a new file, re-export for backward compatibility, redirect tests."

**Amir Patel (Architect):** "Clean domain split: core triggers (tier upgrade, claim decision, weekly digest) stay in the original file. Event-driven triggers (ranking change, new rating, city highlights) move to the events file. Each file has a clear purpose."

**Rachel Wei (CFO):** "notification-triggers.ts goes from 89.3% to 36.9% of threshold. That's comfortable headroom for several sprints of feature additions."

**Sarah Nakamura (Lead Eng):** "Three test files needed redirecting (sprint481, sprint488, sprint492). The re-export from notification-triggers.ts means server/index.ts imports don't need to change."

**Nadia Kaur (Cybersecurity):** "No security surface changes. Same triggers, same behavior, different file locations. The extraction is purely organizational."

## Changes

### Modified: `server/notification-triggers.ts` (402 → 166 LOC, -58.7%)
- Removed onRankingChange, onNewRatingForBusiness, sendCityHighlightsPush, startCityHighlightsScheduler
- Added re-export line for backward compatibility
- Retains: onTierUpgrade, onClaimDecision, sendWeeklyDigestPush, startWeeklyDigestScheduler

### New: `server/notification-triggers-events.ts` (250 LOC)
- `onRankingChange` — notifies raters when business rank changes significantly
- `onNewRatingForBusiness` — notifies other raters when new rating submitted
- `sendCityHighlightsPush` — weekly city-level ranking summary push
- `startCityHighlightsScheduler` — Monday 11am UTC scheduler

### Modified test files (3 redirected):
- `__tests__/sprint481-push-triggers.test.ts` — reads events file
- `__tests__/sprint488-push-trigger-wiring.test.ts` — reads events file for scheduler
- `__tests__/sprint492-push-analytics.test.ts` — reads events file for delivery recording

### New: `__tests__/sprint504-triggers-extraction.test.ts` (11 tests)

## Test Coverage
- 11 new tests, all passing
- 3 test files redirected
- Full suite: 9,296 tests across 393 files, all passing in ~5.0s
- Server build: 667.0kb
