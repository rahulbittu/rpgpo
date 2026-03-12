# External Critique Request — Sprints 225-229

Date: 2026-03-09
Requesting: External review of 5-sprint block (225-229)

## Sprint Summaries

### Sprint 225: SLT Meeting + Audit #27
- SLT backlog meeting (Sprint 225 cycle)
- Architecture Audit #27: Grade A, 0 Critical, 0 High
- Backlog prioritization for Sprints 226-230
- 4,110 tests across 155 files

### Sprint 226: Email Tracking Wire + Signed Tokens
- Points: 5
- sendEmail() auto-generates tracking IDs for all outbound email
- HMAC-signed unsubscribe tokens (timing-safe verification)
- Beta badge helper utilities for city status display
- 12 new tests

### Sprint 227: Owner Outreach Scheduler + Enrichment
- Points: 8 (largest in block)
- Weekly outreach scheduler: auto-sends claim invites to unclaimed businesses
- Google Place enrichment module: fetches photos, hours, ratings from Google Places API
- CityBadge component for beta/active status display
- 30-day dedup on outreach emails
- 38 new tests

### Sprint 228: Email A/B Testing + Webhooks
- Points: 5
- A/B testing framework for email subject lines and content variants
- Resend webhook handler for open/click/bounce tracking
- Webhook signature verification with timing-safe comparison
- Experiment assignment with deterministic hashing
- 32 new tests

### Sprint 229: NOLA Seed + Outreach History
- Points: 5
- 10 New Orleans businesses seeded (restaurants, music venues, po-boys)
- NOLA added as beta city
- Outreach dedup history tracking (in-memory Map)
- Outreach history API endpoint
- 30 new tests

## Retro Summaries
- Sprint 225: Morale 8/10. SLT meeting productive. Audit grade A maintained.
- Sprint 226: Morale 8/10. Email tracking wired cleanly. HMAC tokens shipped same sprint.
- Sprint 227: Morale 9/10. Highest-point sprint in block. Outreach scheduler is a force multiplier.
- Sprint 228: Morale 8/10. A/B testing framework elegant. Webhook integration smooth.
- Sprint 229: Morale 9/10. Second beta city in two sprints. Expansion pattern validated.

## Audit #28 Summary (Sprint 230)
- Grade: A (5th consecutive A-range)
- 0 Critical, 0 High, 2 Medium, 2 Low
- Key findings: email module proliferation (7 files), in-memory store growth
- Recommendations: server/email/ directory, outreach history eviction

## Open Action Items from Retros
1. Consolidate email modules under server/email/ (P2)
2. Add MAX_HISTORY_ENTRIES to outreach-history.ts (P1)
3. Map Resend email_id to internal tracking IDs (P1)
4. Build A/B experiment admin UI (P1)
5. Define OKC/NOLA beta promotion criteria (P1)
6. Automate Google Place enrichment for beta cities (P3)
7. Consider unified scheduler registration pattern (P3)

## Changed Files (Sprints 226-229)
- server/email-tracking.ts (new)
- server/unsubscribe-tokens.ts (new)
- server/email-ab-testing.ts (new)
- server/routes-webhooks.ts (new)
- server/outreach-history.ts (new)
- server/google-place-enrichment.ts (new)
- server/outreach-scheduler.ts (new)
- server/email.ts (modified — tracking integration)
- server/email-drip.ts (modified — A/B variant support)
- server/email-owner-outreach.ts (modified — dedup + scheduler)
- server/routes.ts (modified — new endpoints)
- server/seed-nola.ts (new)
- components/CityBadge.tsx (new)
- shared/cities.ts (modified — OKC + NOLA)
- tests/email-tracking.test.ts (new)
- tests/unsubscribe-tokens.test.ts (new)
- tests/email-ab-testing.test.ts (new)
- tests/webhooks.test.ts (new)
- tests/outreach-history.test.ts (new)
- tests/outreach-scheduler.test.ts (new)
- tests/google-place-enrichment.test.ts (new)
- tests/seed-nola.test.ts (new)

## Known Contradictions / Risks
1. **Email module proliferation** — 7 email-related files in server/ root. Works but violates single-responsibility grouping. Audit recommends server/email/ directory.
2. **In-memory stores growing** — 4 in-memory stores (alerting, email-tracking, email-ab-testing, outreach-history). outreach-history has no size limit and will grow unbounded.
3. **Resend email_id gap** — Resend returns an email_id on send, but we don't map it to our internal tracking IDs. Webhook events reference Resend's ID, making correlation manual.
4. **Google Place enrichment is manual** — Requires CLI run. Beta city businesses don't auto-enrich. Could lead to sparse data in NOLA/OKC.
5. **No A/B experiment admin UI** — Experiments are created and managed via code. No dashboard to view results, stop experiments, or declare winners.
6. **Beta cities have no automated promotion gate** — OKC and NOLA are beta, but promotion to active is a manual decision. No engagement threshold triggers.
7. **Outreach history resets on server restart** — In-memory Map means all dedup history is lost on restart. Could cause duplicate outreach emails.
8. **4 schedulers with no unified framework** — Each scheduler implements its own start/stop/interval pattern. Not DRY, but each is simple enough that abstraction may be premature.

## Proposed Next Sprint (231)
- City engagement dashboard: per-city signup count, rating count, active users
- DB-backed outreach history: migrate from in-memory Map to PostgreSQL table
- Points: 8
- Rationale: Addresses risk #7 (outreach history persistence) and enables data-driven beta promotion decisions (risk #6)

## Questions for External Reviewer
1. Is the 5-sprint email pipeline build (tracking → outreach → A/B → webhooks → history) appropriately sequenced, or should any steps have been combined/reordered?
2. The in-memory store pattern has been flagged in 3 consecutive audits. At what point does "acceptable technical debt" become "architectural risk"?
3. With 7 cities and 4 schedulers, what failure modes should we be testing for? (e.g., scheduler overlap, timezone handling, rate limiting)
4. The expansion pattern (seed 10 → beta → monitor → promote) is lightweight by design. Is this sufficient, or do we need a more formal city launch checklist?
5. Email A/B testing currently uses deterministic hashing for assignment. Should we consider more sophisticated methods (multi-armed bandit, Bayesian optimization) at this scale?
