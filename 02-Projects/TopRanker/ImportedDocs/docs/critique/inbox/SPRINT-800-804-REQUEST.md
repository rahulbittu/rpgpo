# Critique Request — Sprints 800-804

**Date:** 2026-03-12
**Scope:** Governance milestone + config consolidation + observability + extraction
**Requestor:** TopRanker Engineering

---

## Context

Sprint 800 was a milestone (24 hardening sprints complete). Sprints 801-804 continued with config consolidation, observability additions, and a proactive extraction of health routes.

## Changes for Review

### Sprint 801 — Resend Config Consolidation
- email.ts RESEND_API_KEY → config.resendApiKey
- routes-webhooks.ts RESEND_WEBHOOK_SECRET → config.resendWebhookSecret

### Sprint 802 — SSE Health Tracking
- Added sseClients field to /api/health via getClientCount()

### Sprint 803 — Rate Limiter Health Stats
- Added getRateLimitStats() returning activeWindows + storeType
- Changed MemoryStore.windows from private to readonly

### Sprint 804 — Health Route Extraction
- Created server/routes-health.ts (52 LOC)
- routes.ts reduced 414→374 LOC
- Updated 9 test files

---

## Questions for External Review

1. **Config consolidation strategy:** We're centralizing all process.env to config.ts. About 15 direct accesses remain across server/. Should we batch these in 2-3 sprints or do them opportunistically as we touch each file?

2. **MemoryStore.windows readonly:** Changed from private to readonly to expose for stats. Is this acceptable, or should we add a proper getter method to avoid exposing the Map interface?

3. **Health route extraction threshold:** We extracted at 414/420 LOC. Is our 420 LOC threshold too low for a routing file? Should we raise it now that health routes are separated?

4. **Source-reading test pattern:** Our tests read .ts files as strings and check for patterns. This is brittle to refactoring (9 tests broke during extraction). Should we invest in integration tests that make real HTTP requests to health endpoints?

5. **Public health endpoint detail level:** /api/health now exposes: memory, push stats, log error counts, SSE clients, rate limiter windows, environment. Any of these a security concern for a public endpoint?

---

## Metrics

- **Tests:** 13,463 across 604 files (all passing)
- **Build:** 669.6kb (max 750kb)
- **Security Score:** 98/100
- **Audit Grade:** A (9+ consecutive)
