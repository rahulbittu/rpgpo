# In-Memory Store Persistence Audit

**Date:** 2026-03-10
**Sprint:** 528
**Auditor:** Amir Patel (Architecture)

## Executive Summary

27 `new Map<>()` instances identified across server modules. Categorized into 4 tiers by persistence criticality. **No immediate PostgreSQL migration required** for the 500-user target. One module (notification queue) has a conditional trigger for migration.

## Tier 1: Ephemeral / Acceptable (No Migration Needed)

These Maps hold temporary, session-scoped, or easily-reconstructable data.

| Module | Map | Reason |
|--------|-----|--------|
| `rate-limiter.ts` | `windows` | Sliding window counters — ephemeral by design |
| `tiered-rate-limiter.ts` | `usage` | Rate limit usage records — reset on restart is correct behavior |
| `prerender.ts` | `cache` | SSR cache — auto-repopulates on demand |
| `reputation-v2.ts` | `reputationCache` | Cache only — source of truth is DB |
| `analytics.ts` | `buckets`, `activeUsers` | Analytics aggregation — writes to DB, Map is buffer |
| `alerting.ts` | `lastFired` | Dedup timestamps — restart resending one alert is acceptable |
| `websocket-manager.ts` | `connections`, `memberConnections` | WebSocket state — inherently ephemeral |
| `routes.ts` | `sseConnectionsByIp` | SSE connection counter — ephemeral |
| `rate-limit-dashboard.ts` | `ipCounts`, `pathCounts`, `ipData` | Dashboard aggregation — ephemeral |
| `business-analytics.ts` | `counts` | Local aggregation helper — not persistent state |
| `storage/dishes.ts` | `bizDishMap` | Local query helper — not persistent state |
| `experiment-tracker.ts` | `variantMap` | Dashboard computation helper |
| `routes-admin-claims-verification.ts` | `merged` | Local merge helper |

**Count: 16 Maps — no action required.**

## Tier 2: Low Priority (Admin-Seeded, Small Cardinality)

| Module | Map | Data | Impact of Loss | Migration Path |
|--------|-----|------|----------------|----------------|
| `push-ab-testing.ts` | `experiments` | <10 experiments | Admin re-seeds in 1 minute | `push_experiments` table |
| `email-id-mapping.ts` | `resendToTracking`, `trackingToResend` | Email tracking IDs | Lose email open tracking | `email_tracking` table |
| `outreach-history.ts` | `store` | Outreach dedup | May re-send outreach emails | `outreach_sent` table |

**Count: 4 Maps — migrate when admin operations become frequent or data exceeds 100 entries.**

## Tier 3: Medium Priority (Content That Requires Re-Creation)

| Module | Map | Data | Impact of Loss | Migration Path |
|--------|-----|------|----------------|----------------|
| `notification-templates.ts` | `templates` | Push templates | Must re-create all templates | `notification_templates` table |
| `claim-verification.ts` | `claims` | Pending claims | Lose claim state | Already have `claims` table |
| `claim-verification-v2.ts` | `evidenceStore` | Claim evidence | Lose evidence data | `claim_evidence` table |
| `search-suggestions.ts` | `suggestionIndex` | Search suggestions | Auto-rebuilds on next request | N/A (self-healing) |
| `city-health-monitor.ts` | `healthData` | City health metrics | Recomputes on next check | N/A (self-healing) |
| `rating-integrity.ts` | `claimedBusinesses` | Business claims | Should use DB claims table | Already in DB |

**Count: 6 Maps — migrate `notification-templates` when count > 20. Others are self-healing or DB-backed.**

## Tier 4: High Priority (Data Loss = User Impact)

| Module | Map | Data | Impact of Loss | Migration Path | Trigger |
|--------|-----|------|----------------|----------------|---------|
| `notification-frequency.ts` | `queue` | Queued notifications | Users miss batched notifications | `notification_queue` table | When ANY user sets non-realtime frequency |
| `notifications.ts` | `store` | Notification history | Users lose notification inbox | `notifications` table | When notification inbox is user-facing |
| `push-notifications.ts` | `tokens` | Push tokens | Can't send push notifications | Already in `members.pushToken` | N/A (DB-backed) |

**Count: 3 Maps — `notification-frequency.queue` is the only real risk. Currently mitigated by all users defaulting to "realtime".**

## Decision

**No PostgreSQL migration in Sprint 528.** The 500-user target does not justify the complexity. Instead:

1. Added `PERSISTENCE-AUDIT` comments to the 3 flagged modules with migration paths
2. Documented triggers for when migration becomes necessary
3. Categorized all 27 Maps for future reference

**Migration triggers:**
- Notification queue: first user sets non-realtime preference
- Templates: admin creates 20th template
- Experiments: if multi-day experiment tracking is needed

## Next Review

Sprint 535 (next audit cycle) — re-assess based on user adoption and feature velocity.
