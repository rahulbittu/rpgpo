# Retrospective — Sprint 753

**Date:** 2026-03-12
**Duration:** 1 session
**Story Points:** 1
**Facilitator:** Sarah Nakamura

---

## What Went Well

**Nadia Kaur:** "Caught a production-blocking CORS issue before deployment. The expo-platform header was only allowed in dev — every Expo app request would have failed preflight in production."

**Amir Patel:** "The CSP connect-src was a ticking time bomb. The web app would load fine but every API call would be blocked by the browser's Content Security Policy."

**Sarah Nakamura:** "Three operational sprints (751-753) addressed the exact issues that would have caused a failed Railway deployment: missing health check, missing readiness probe, missing CORS headers."

---

## What Could Improve

- **These issues should have been caught during the Railway deployment attempt** — a local production-mode test would have surfaced the CORS mismatch.
- **Consider adding a pre-deploy checklist** that verifies CORS, CSP, and health endpoints locally before pushing to Railway.

---

## Action Items

| Action | Owner | Deadline |
|--------|-------|----------|
| Deploy to Railway — all 3 operational fixes in place | CEO | March 15 |
| Sprint 754: Beta readiness or feedback triage | Team | Next |

---

## Team Morale: 9/10

The team is confident that Railway deployment will now succeed. All common failure modes have been addressed.
