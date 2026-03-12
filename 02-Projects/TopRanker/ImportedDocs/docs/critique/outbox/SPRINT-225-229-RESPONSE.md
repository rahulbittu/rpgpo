# External Critique Request — Sprints 225-229 External Critique

## Verified wins
- Audit #27 and #28 both held A-range with 0 Critical / 0 High. That is real, verified stability.
- The email pipeline materially advanced across the block: tracking IDs, signed unsubscribe tokens, outreach scheduler, A/B testing, and webhook ingestion were all shipped.
- Security-sensitive paths were explicitly addressed twice: HMAC-signed unsubscribe tokens and webhook signature verification with timing-safe comparison.
- Test volume increased each sprint called out here: +12, +38, +32, +30 tests.
- Outreach dedup exists in two forms now: 30-day dedup logic in Sprint 227 and explicit outreach history/API in Sprint 229.
- NOLA launch work is concrete, not rhetorical: 10 businesses seeded and city status added.

## Contradictions / drift
- The block expanded the email system while already knowing email module sprawl was a problem. You added `email-tracking.ts`, `email-ab-testing.ts`, webhook routing, and more root-level email logic, then Audit #28 flagged exactly that proliferation. That is conscious drift.
- The team claims an “expansion pattern validated,” but the packet also says Google Place enrichment is manual, beta promotion criteria are undefined, and promotion is a manual decision. That is not a validated operating pattern; it is a partial workflow.
- Outreach dedup was presented as a win in Sprint 227 and 229, but the underlying store is in-memory and resets on restart. So the dedup guarantee is operationally weak.
- Webhook tracking was shipped without mapping Resend `email_id` to internal tracking IDs. That leaves the loop from send → event → attribution incomplete.
- The proposed next sprint says DB-backed outreach history addresses risk #7 and enables promotion decisions. It only addresses persistence. Promotion decisions also require explicit criteria and usable reporting; those remain open.
- “4 schedulers with no unified framework” plus “highest-point sprint force multiplier” is a warning sign: automation expanded faster than operational guardrails.

## Unclosed action items
- **P1:** Add `MAX_HISTORY_ENTRIES` to `outreach-history.ts`. Still open, directly tied to an audit finding about unbounded in-memory growth.
- **P1:** Map Resend `email_id` to internal tracking IDs. Still open; current webhook correlation is manual.
- **P1:** Build A/B experiment admin UI. Still open; experiment control and result visibility remain code-only.
- **P1:** Define OKC/NOLA beta promotion criteria. Still open; no automated or even explicit gate.
- **P2:** Consolidate email modules under `server/email/`. Still open despite the file count getting worse over the block.
- **P3:** Automate Google Place enrichment for beta cities. Still open; current expansion workflow remains manual.
- **P3:** Consider unified scheduler registration pattern. Still open; risk rises as scheduler count grows.

## Core-loop focus score
**6/10**

- There is a coherent loop here: send outreach, track interaction, dedup outreach, and seed a new city.
- But too much of the work is infrastructure around the loop rather than closing it end-to-end with reliable attribution and persistence.
- The missing Resend ID mapping means the measurement loop is not fully connected.
- The in-memory outreach history means the anti-spam/dedup part of the loop is not durable.
- NOLA seeding adds surface area before promotion criteria and enrichment automation are in place.
- Audit stability is good, but repeated known risks indicate focus was diluted by feature expansion.

## Top 3 priorities for next sprint
1. **Close the email attribution loop fully.** Map Resend `email_id` to internal tracking IDs and verify webhook events can be tied back to sends, variants, and outreach records without manual correlation.
2. **Eliminate the fragile outreach-history implementation.** Move history out of in-memory storage or, at minimum, add hard bounds/eviction immediately. Current behavior can re-send duplicates after restart and will grow unbounded.
3. **Stop city expansion drift by defining promotion gates and instrumentation.** Build the minimum dashboard/criteria needed to decide beta → active using explicit thresholds, not ad hoc judgment.

**Verdict:** This block shipped real email and outreach capability, but it also stacked new features on top of known structural gaps. The main problem is not quality; it is incompleteness of the loop. You built tracking without full correlation, dedup without durability, and city expansion without promotion criteria. The next sprint should reduce those contradictions instead of adding more surface area.
