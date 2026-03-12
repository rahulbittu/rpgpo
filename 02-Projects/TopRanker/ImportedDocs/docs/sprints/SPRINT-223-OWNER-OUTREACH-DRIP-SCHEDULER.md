# Sprint 223 — Restaurant Owner Outreach, Drip Scheduler, Unsubscribe

**Date:** 2026-03-09
**Story Points:** 8
**Status:** Complete

---

## Mission Alignment

Sprint 223 closes the drip loop. The scheduler auto-triggers emails based on signup age. Unsubscribe compliance protects user trust. Owner outreach drives the B2B revenue funnel — claim invites → Pro upgrades → weekly engagement.

---

## Team Discussion

**Sarah Nakamura (Lead Eng):** Drip scheduler follows the setInterval pattern from notification-triggers.ts. Daily at 9am UTC, iterates members, checks signup age, fires the right template. Per-user error isolation so one bad email doesn't block 100 good ones.

**Jordan Blake (Compliance):** Unsubscribe endpoint is GDPR/CAN-SPAM compliant. One-click unsubscribe via GET with token, type-specific opt-out (drip, weekly, all), re-subscribe option. No auth required — links work from email.

**David Okonkwo (VP Product):** Owner outreach is the B2B engine. Claim invite → free, shows rank. Pro upgrade → $49/mo, shows ratings + score. Weekly digest → retention. Each email educates owners on trust-weighted rankings.

**Jasmine Taylor (Marketing):** The claim invite email is the first touchpoint with restaurant owners. Leading with "You're ranked #X" creates immediate value. The free claim CTA has no friction.

**Rachel Wei (CFO):** Owner outreach drives Pro subscriptions. At $49/mo, 20 claimed businesses upgrading = $980 MRR. The weekly digest keeps them engaged post-conversion.

**Marcus Chen (CTO):** Three new modules, clean separation. Scheduler in drip-scheduler.ts, compliance in routes-unsubscribe.ts, B2B emails in email-owner-outreach.ts. All wired into index.ts and routes.ts.

**Nadia Kaur (Security):** Unsubscribe tokens are member IDs — acceptable for unsubscribe-only actions. No PII exposure beyond confirming an account exists. sanitizeString on all query params.

---

## Deliverables

### Drip Scheduler (`server/drip-scheduler.ts`)
- Daily at 9am UTC, processes all members
- Calculates daysSinceSignup, matches to DRIP_SEQUENCE
- Respects emailDrip notification preference
- Per-user error isolation
- Wired into index.ts with graceful shutdown cleanup

### Unsubscribe Routes (`server/routes-unsubscribe.ts`)
- GET /api/unsubscribe?token=&type= — one-click unsubscribe
- GET /api/resubscribe?token=&type= — re-subscribe
- Supports drip, weekly, all types
- Branded HTML response pages
- Registered in routes.ts

### Owner Outreach Emails (`server/email-owner-outreach.ts`)
- sendOwnerClaimInviteEmail — unclaimed business invitation
- sendOwnerProUpgradeEmail — Pro tier upsell ($49/mo)
- sendOwnerWeeklyDigestEmail — weekly metrics for claimed owners
- OWNER_OUTREACH_TEMPLATES export for tracking

---

## Tests

- 26 new tests in sprint223-owner-outreach-scheduler.test.ts
- Full suite: 4,059+ tests across 153 files, all passing
