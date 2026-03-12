# Retro 517: Push A/B Weekly Digest Copy Test

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well

**Jasmine Taylor:** "Four distinct copy strategies with real psychological intent behind each one. This isn't random A/B testing — we're testing urgency vs. curiosity vs. social proof vs. neutral. The results will inform all our notification copy going forward."

**Amir Patel:** "The seed endpoint pattern is elegant. One POST creates a fully-configured 4-variant experiment. Admin doesn't need to manually construct JSON payloads with variant objects. And the status endpoint includes the Wilson CI dashboard for statistical significance tracking."

**Marcus Chen:** "Adding {city} personalization to the digest was the right call. 'Dallas is rating' is more compelling than 'Your city is rating.' Template variables are composable — we can combine {firstName} and {city} in any variant."

**Sarah Nakamura:** "30 tests for a module with clear boundaries. The digest-copy-variants module is self-contained at 99 LOC — copy definitions, seed logic, status checks. Clean separation from the A/B framework."

## What Could Improve

- **In-memory experiment storage** — still resets on server restart. Need to decide on persistence strategy before going to production with this test.
- **No scheduled auto-seed** — admin must manually trigger the seed endpoint. Could consider auto-seeding on server start for active experiments.
- **Metric definition** — we're tracking opens but not downstream actions (e.g., did the user actually rate something after opening the digest?). Funnel metrics would give richer signal.

## Action Items

- [ ] Sprint 518: Notification frequency settings — **Owner: Sarah**
- [ ] Sprint 519: Admin notification template editor — **Owner: Sarah**
- [ ] Sprint 520: Governance (SLT-520 + Audit #62 + Critique) — **Owner: Sarah**
- [ ] Track digest copy test results after 2 weekly cycles — **Owner: Jasmine**

## Team Morale
**9/10** — First real content experiment with clear hypotheses. The marketing team is energized to have data-driven copy decisions. Framework investment from Sprint 508 is paying off.
