# Sprint 798 — Health Check Endpoint Enhancements

**Date:** 2026-03-12
**Theme:** Production observability — add DB latency, push stats, and environment to health endpoints
**Story Points:** 1 (observability)

---

## Mission Alignment

- **Observability:** Health endpoints are the primary signal for production monitoring
- **Incident response:** DB latency and push stats surface problems before users see them

---

## Problem

The `/_ready` probe verified DB connectivity (pass/fail) but didn't measure latency. The `/api/health` endpoint reported process vitals but lacked environment context and push notification stats. For production monitoring, we need:
- DB latency to detect slow connections before they cause timeouts
- Push stats to verify the notification pipeline is healthy
- Environment tag to distinguish staging from production responses

## Fix

1. `/_ready`: Added `dbLatencyMs` field measuring `Date.now()` before/after `SELECT 1`
2. `/api/health`: Added `environment` from `config.nodeEnv`, `push` stats from `getPushStats()`
3. Push stats import is `try/catch` wrapped to handle the module being unavailable

---

## Team Discussion

**Amir Patel (Architecture):** "DB latency on /_ready is the most actionable addition. Railway's health probes call this endpoint. If latency spikes above 200ms, we know the PostgreSQL connection is degraded."

**Sarah Nakamura (Lead Eng):** "The push stats on /api/health give us a real-time view of token registration and message delivery without needing to query the database. Since it's an in-memory store, it's free."

**Marcus Chen (CTO):** "Once TestFlight is live, we'll be watching /api/health in Grafana. The environment field prevents confusion between staging and production dashboards."

**Derek Okonkwo (Mobile):** "For mobile, the /_ready probe with dbLatencyMs is the key indicator. If the server reports ready but DB latency is 500ms+, we know the user experience will be degraded."

**Rachel Wei (CFO):** "Monitoring before incidents is cheaper than debugging during them. These additions cost nearly zero in compute but save hours during outages."

**Nadia Kaur (Cybersecurity):** "The push stats don't expose any PII — just aggregate counts. The environment field could theoretically leak deployment info, but /api/health is already public and the info is not sensitive."

---

## Changes

| File | Change |
|------|--------|
| `server/routes.ts` | Enhanced /_ready with dbLatencyMs, /api/health with environment + push stats |
| `__tests__/sprint798-health-check-enhancements.test.ts` | 11 tests |

---

## Tests

- **New:** 11 tests in `__tests__/sprint798-health-check-enhancements.test.ts`
- **Total:** 13,420 tests across 600 files — all passing
- **Build:** 668.5kb (max 750kb)
