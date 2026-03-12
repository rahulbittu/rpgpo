# External Critique Request — Sprints 220-224

**Date:** 2026-03-09
**Sprints covered:** 220 (SLT Post-Launch Review), 221 (Alert Wiring + Deferred Debt), 222 (Email Drip Integration), 223 (Owner Outreach + Drip Scheduler + Unsubscribe), 224 (OKC Seed + Email Tracking)
**Test count:** 4,088 across 154 files
**Audit grade:** A (4th consecutive, Audit #27)

## Sprint Summaries

### Sprint 220 — SLT Post-Launch Review + Audit #26
- SLT meeting reviewing Sprints 216-219
- Architecture Audit #26 (Grade: A)
- Critique request for 215-219

### Sprint 221 — Alert Wiring + Deferred Debt Cleanup
- Perf-monitor auto-fires alerts (slow_response, high_memory)
- City config unification (city-context.tsx imports from shared/city-config.ts)
- Replit CORS dead code removal + WON'T FIX documentation
- 3 deferred items resolved in one sprint

### Sprint 222 — Email Drip Campaign Integration
- Wired email-drip.ts to real Resend API sender
- DRIP_SEQUENCE export: 5 steps (day 2/3/7/14/30)
- getDripStepForDay() and getDripStepNames() helpers

### Sprint 223 — Owner Outreach + Drip Scheduler + Unsubscribe
- Drip scheduler: daily at 9am UTC, processes all members by signup age
- Unsubscribe/resubscribe endpoints: CAN-SPAM compliant, type-specific
- 3 owner outreach templates: claim invite, Pro upgrade, weekly digest

### Sprint 224 — OKC Seed + Email Tracking
- 10 Oklahoma City businesses seeded (first out-of-state expansion)
- OKC promoted from "planned" to "beta" in city-config.ts
- Email delivery tracking module (sent/opened/clicked/bounced/failed)

## Retro Summaries
- Sprint 220: 8/10 morale, clean SLT review
- Sprint 221: 9/10, 3 deferred items resolved
- Sprint 222: 9/10, retention pipeline wired
- Sprint 223: 9/10, three modules shipped
- Sprint 224: 8/10, first out-of-state expansion

## Audit Summary (Audit #27)
- Grade: A (4th consecutive A-range)
- 0 Critical, 0 High, 2 Medium (email module proliferation, in-memory stores), 1 Low (unsigned unsubscribe tokens)
- All new modules under 100 LOC (except email-owner-outreach at 238 LOC — HTML templates)

## Open Action Items
| Item | Owner | Target |
|------|-------|--------|
| Wire email tracking into sendEmail | Sarah Nakamura | Sprint 226 |
| Beta badge UI in city picker | Jasmine Taylor | Sprint 226 |
| Signed unsubscribe tokens | Nadia Kaur | Sprint 226 |
| OKC Google Place ID enrichment | David Okonkwo | Sprint 226 |

## Changed Files (Sprints 220-224)
- `server/perf-monitor.ts` — auto-alert firing
- `lib/city-context.tsx` — imports from shared/city-config
- `server/security-headers.ts` — Replit CORS removal
- `server/email-drip.ts` — real sender, DRIP_SEQUENCE, helpers
- `server/drip-scheduler.ts` — NEW: daily drip scheduler
- `server/routes-unsubscribe.ts` — NEW: unsubscribe/resubscribe endpoints
- `server/email-owner-outreach.ts` — NEW: 3 owner outreach templates
- `server/email-tracking.ts` — NEW: email delivery tracking
- `server/seed-cities.ts` — OKC businesses added
- `shared/city-config.ts` — OKC promoted to beta
- `server/routes.ts` — unsubscribe routes registered
- `server/index.ts` — drip scheduler wired + graceful shutdown

## Known Contradictions / Risks
1. **Email module proliferation**: 5 email-related modules in server/ — audit flags for future directory restructure
2. **In-memory stores growing**: alerting (200), email-tracking (1000), analytics buffer — combined ~1300 objects
3. **Unsigned unsubscribe tokens**: member IDs in URL — low risk for unsubscribe but should migrate to HMAC
4. **OKC in beta without engagement monitoring**: no automated threshold check to promote/demote
5. **Email tracking not yet wired**: module exists but sendEmail doesn't call trackEmailSent yet
6. **Owner outreach templates callable but not auto-triggered**: no scheduler for claim invites on business milestones
7. **No email delivery webhooks**: tracking relies on manual/API calls, not Resend webhook integration

## Proposed Next Sprint (226)
- Wire email tracking into sendEmail pipeline
- Beta badge UI in city picker
- Signed unsubscribe tokens (HMAC)
- OKC Google Place ID enrichment

## Questions for External Reviewer
1. Is the email module proliferation pattern (5 modules) acceptable, or should we consolidate before adding more?
2. Should OKC beta have an automated promotion gate, or is manual review sufficient?
3. Is the in-memory store pattern (alerting + tracking + analytics) a scaling risk, or acceptable for our current stage?
4. Should owner outreach auto-triggering (Sprint 227) be prioritized over email tracking wire (Sprint 226)?
5. Are we moving too fast on geographic expansion vs deepening engagement in existing Texas cities?
