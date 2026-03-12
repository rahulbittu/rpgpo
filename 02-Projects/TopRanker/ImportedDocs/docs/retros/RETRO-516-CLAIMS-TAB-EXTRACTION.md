# Retro 516: Admin Claims Tab Extraction

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Amir Patel:** "Clean extraction — 97 LOC component, 6 props, zero state migration. The parent still owns all queries and handlers. This is how you reduce file size without introducing complexity."

**Sarah Nakamura:** "The test redirect pattern worked well. When code moves between files, tests need to follow. We updated sprint509's claims wiring tests to read both admin/index.tsx and ClaimsTabContent.tsx, checking each for its own responsibilities."

**Marcus Chen:** "603→585 LOC. The watch file from Audit #61 is resolved in one sprint. That's the value of the audit cadence — flag early, fix immediately."

## What Could Improve

- **Test file coupling to source locations** — when we extract components, we have to manually redirect tests. A more resilient test strategy (integration tests that don't care about file boundaries) would reduce this maintenance.
- **QueueItem as a prop** — passing a component type as a prop works but isn't the most ergonomic pattern. If we extract more tabs, we should consider a shared component registry or context.

## Action Items

- [ ] Sprint 517: Push A/B weekly digest copy test — **Owner: Sarah**
- [ ] Sprint 518: Notification frequency settings — **Owner: Sarah**
- [ ] Sprint 519: Admin notification template editor — **Owner: Sarah**
- [ ] Sprint 520: Governance (SLT-520 + Audit #62 + Critique) — **Owner: Sarah**

## Team Morale
**8/10** — Straightforward extraction sprint. Resolved the audit watch file cleanly. Ready for the A/B copy testing work in Sprint 517.
