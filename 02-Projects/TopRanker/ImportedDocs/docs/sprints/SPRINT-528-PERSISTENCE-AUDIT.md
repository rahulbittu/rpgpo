# Sprint 528: In-Memory Store Persistence Audit

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete
**Tests:** 16 new (9,786 total across 417 files)

## Mission

Audit all in-memory Map stores across server modules. Categorize by persistence criticality, add migration path comments, and document triggers for PostgreSQL migration.

## Team Discussion

**Amir Patel (Architecture):** "27 `new Map<>()` instances across server modules. 16 are ephemeral by design (rate limiters, caches, aggregation helpers). 4 are low-priority admin-seeded data. 6 are medium-priority but self-healing. Only 1 — the notification queue — has real user-impact risk."

**Marcus Chen (CTO):** "No PostgreSQL migration needed for the 500-user target. The decision is pragmatic: all users default to 'realtime' frequency, so the queue is empty in practice. The migration trigger is clear: when the first user sets a non-realtime preference."

**Sarah Nakamura (Lead Eng):** "Added PERSISTENCE-AUDIT comments to the 3 flagged modules with specific migration paths and priority levels. These serve as documentation for future engineers and as grep-able markers for the next audit."

**Rachel Wei (CFO):** "This sprint confirms the in-memory debt is manageable, not urgent. The tiered assessment prevents over-engineering while documenting exactly when migration becomes necessary."

**Nadia Kaur (Security):** "The push tokens Map in push-notifications.ts is already DB-backed via members.pushToken. The in-memory Map is just a cache layer. No security concern with the current approach."

## Changes

### New Files

| File | Purpose |
|------|---------|
| `docs/architecture/IN-MEMORY-STORE-AUDIT.md` | Comprehensive audit of all 27 in-memory Maps |
| `__tests__/sprint528-persistence-audit.test.ts` | 16 tests covering audit markers and documentation |

### Modified Files

| File | Change |
|------|--------|
| `server/push-ab-testing.ts` | Added PERSISTENCE-AUDIT comment (LOW priority) |
| `server/notification-templates.ts` | Added PERSISTENCE-AUDIT comment (MEDIUM priority) |
| `server/notification-frequency.ts` | Added PERSISTENCE-AUDIT comment (HIGH when batch activated) |

## Audit Findings

| Tier | Count | Action |
|------|-------|--------|
| Tier 1: Ephemeral | 16 | No action |
| Tier 2: Low Priority | 4 | Migrate when >100 entries |
| Tier 3: Medium Priority | 6 | Self-healing or already DB-backed |
| Tier 4: High Priority | 1 | Migrate when batch frequency activated |

## Test Summary

- `__tests__/sprint528-persistence-audit.test.ts` — 16 tests
  - PERSISTENCE-AUDIT markers: 6 tests (3 modules × presence + priority)
  - Audit document: 7 tests (summary, tiers, risk, decision, triggers, coverage, review)
  - Store inventory: 3 tests (verify Maps still exist)
