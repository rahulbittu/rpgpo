# Sprint 221 — Alert Wiring + Deferred Debt Cleanup

**Date:** 2026-03-09
**Story Points:** 8
**Status:** Complete

## Mission Alignment

Sprint 221 resolves three deferred architectural concerns from Audit #26: wire alerting to perf-monitor for automatic threshold-based alerts, unify city configuration source of truth, and close the 3-audit Replit CORS deferral. This is the cleanup sprint that ensures no technical debt carries into the growth phase.

## Team Discussion

**Marcus Chen (CTO):** "Three deferred items closed in one sprint. The alerting wiring means we no longer need humans watching dashboards — the system tells us when something's wrong. The city unification means one config file, not two. The Replit removal means no dead code in our security layer."

**Sarah Nakamura (Lead Eng):** "The perf-monitor now auto-fires `slow_response` alerts when any request exceeds 500ms, and `high_memory` alerts when heap exceeds 512MB. Both use the cooldown system from Sprint 218 — no alert storms. The alerting module integrates cleanly because it was designed for exactly this use case."

**Amir Patel (Architecture):** "The city-context.tsx change is elegant: replace a hardcoded array with `getActiveCities()` from shared/city-config.ts. One source of truth. When we add Oklahoma City, we update one file and the entire app — client and server — picks it up. Type changes are backward-compatible."

**Nadia Kaur (Security):** "Removing the Replit CORS code eliminates dead environment variable checks from our security-critical middleware. The comment explains why: 'WON'T FIX — dead code post-Railway migration.' Clean, documented, auditable."

**Jordan Blake (Compliance):** "The escalation protocol worked exactly as designed. Replit CORS hit 3-audit deferral → escalated to HIGH → team reviewed → closed as WON'T FIX with documented rationale. This is how technical debt should be managed."

**Rachel Wei (CFO):** "These cleanup items have zero user-facing impact but high operational impact. Auto-alerting reduces incident response time. Unified city config reduces engineering overhead for expansion. Dead code removal simplifies security review. All three lower our operational cost."

**David Okonkwo (VP Product):** "The city config unification is the enabling step for city expansion. Next sprint, when we add Oklahoma City data, the app automatically shows it in the picker. No code changes needed beyond the config file."

**Leo Hernandez (Design):** "The alert wiring means the admin dashboard will eventually show real alerts triggered by production conditions — not just manually fired test alerts. That's the difference between a demo and a production tool."

## Deliverables

### Perf-Monitor Alert Wiring (`server/perf-monitor.ts`)
- Auto-fires `slow_response` alert when request exceeds 500ms threshold
- Auto-fires `high_memory` alert when heap exceeds 512MB
- Uses existing cooldown (300s for slow, 600s for memory)
- Metadata includes route name and duration/heap values
- +4 LOC to perf-monitor, +1 import

### City Config Unification (`lib/city-context.tsx`)
- Replaced hardcoded `SUPPORTED_CITIES` array with `getActiveCities()` from `shared/city-config.ts`
- `SupportedCity` type simplified to `string` (was union of literal types)
- Backward-compatible: all existing consumers work unchanged
- Single source of truth for city list across client and server

### Replit CORS Removal (`server/security-headers.ts`)
- Removed `REPLIT_DEV_DOMAIN` and `REPLIT_DOMAINS` environment variable checks
- Added WON'T FIX comment explaining rationale
- ~10 lines removed from security-critical middleware
- Closes 3-audit deferral (Audits #24, #25, #26)

### Deferred Items Closed
- `getBudgetReport` wiring → WON'T FIX (perf-monitor.getPerformanceValidation() used directly)
- Replit CORS → WON'T FIX (dead code post-Railway)
- City config dual source → FIXED (unified to shared/city-config.ts)
- Alerting not wired → FIXED (auto-fires from perf-monitor)

## Tests

- 25 new tests in `tests/sprint221-alert-wiring-cleanup.test.ts`
- Full suite: **4,018+ tests across 151 files, all passing**
