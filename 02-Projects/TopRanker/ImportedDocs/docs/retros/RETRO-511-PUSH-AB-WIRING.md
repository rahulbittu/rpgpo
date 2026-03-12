# Retro 511: Wire Push A/B into Notification Triggers

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "All 4 notification categories now support A/B testing with zero behavioral change when no experiments are running. The fallback pattern — check variant, use it if present, else default — is simple and safe."

**Jasmine Taylor:** "Template variables make it possible to create a single variant definition that personalizes per user. '{firstName}' in weekly digest, '{business}' in ranking change. The marketing team can write copy without touching code."

**Amir Patel:** "The wiring adds ~28 LOC total across two files. Minimal surface area for a capability that affects every push notification. Good effort/impact ratio."

## What Could Improve

- **No admin UI yet** — experiments are API-only (POST /api/admin/push-experiments). Sprint 512 will add a dashboard card.
- **Template variable documentation** — each category supports different variables but this is only documented in sprint doc, not in the admin API response. Should return available variables with each experiment.

## Action Items

- [ ] Sprint 512: Admin push experiment UI card — **Owner: Sarah**
- [ ] Sprint 513: Claim evidence PostgreSQL persistence — **Owner: Sarah**
- [ ] Sprint 514: Notification preference granularity — **Owner: Sarah**
- [ ] Sprint 515: Governance (SLT-515 + Audit #61 + Critique) — **Owner: Sarah**

## Team Morale
**9/10** — Clean wiring sprint. Push A/B is now fully operational end-to-end: create experiment → assign variants → send with variant content → track opens as outcomes → Wilson CI dashboard.
