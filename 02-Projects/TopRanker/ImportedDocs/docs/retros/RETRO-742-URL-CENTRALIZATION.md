# Retrospective — Sprint 742

**Date:** 2026-03-12
**Duration:** 1 session
**Story Points:** 2
**Facilitator:** Sarah Nakamura

---

## What Went Well

**Sarah Nakamura:** "Clean separation: SHARE_BASE_URL for client, config.siteUrl for server. Both default to topranker.com, both are overridable. One source of truth per layer."

**Amir Patel:** "The server config pattern (config.ts with required/optional) has been serving us well since Sprint 198. Adding siteUrl was a natural extension."

**Jasmine Taylor:** "From a marketing perspective, domain flexibility matters. We can now A/B test topranker.com vs topranker.io for share links by changing one constant."

---

## What Could Improve

- **Email templates still have hardcoded URLs** — dozens of `https://topranker.com` in HTML strings. Need a template variable approach.
- **Dynamic import needed for test** — sprint226 test had to use async import because config.ts requires env vars at module load. Consider making config.ts lazy-load.

---

## Action Items

| Action | Owner | Deadline |
|--------|-------|----------|
| Email template URL centralization | Sarah | Post-beta |
| Consider lazy config.ts pattern for test compatibility | Amir | Post-beta |
| Continue hardening from audit findings | Team | Sprint 743 |

---

## Team Morale: 9/10

Steady. URL centralization is unglamorous but prevents real production bugs. The team appreciates that we're closing systemic issues, not just individual symptoms.
