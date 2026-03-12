# Retrospective — Sprint 741

**Date:** 2026-03-11
**Duration:** 1 session
**Story Points:** 2
**Facilitator:** Sarah Nakamura

---

## What Went Well

**Nadia Kaur:** "6 weak-RNG instances eliminated in one sprint. Every server-generated ID now uses cryptographic randomness. The claim verification code fix alone closes a real security gap — Math.random() has observable patterns."

**Amir Patel:** "The XSS fix in QR print was a legitimate stored XSS vector. Business names are user-supplied strings — injecting them raw into innerHTML could execute arbitrary JavaScript in the print window context."

**Marcus Chen:** "The empty catch block cleanup is underrated. During beta, those silent failures would have cost us hours of debugging. Now we have __DEV__ visibility on every non-critical failure path."

---

## What Could Improve

- **Should have caught these earlier** — Math.random() for IDs and empty catch blocks are patterns that should be flagged by a linting rule, not manual audit
- **No automated XSS scanning** — the QR print vulnerability was found by code review, not by tooling

---

## Action Items

| Action | Owner | Deadline |
|--------|-------|----------|
| Consider ESLint rule to ban Math.random() in server code | Nadia | Post-beta |
| Add empty-catch-block linting | Sarah | Post-beta |
| Continue hardening from audit findings | Team | Sprint 742 |

---

## Team Morale: 9/10

Strong confidence. The code freeze gave us space to do a proper security audit, and the findings were real — not busywork. The team feels good about closing genuine gaps rather than adding speculative features.
