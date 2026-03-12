# Sprint 757 — Pre-Submit Script Railway Checks

**Date:** 2026-03-12
**Theme:** Add Railway deployment readiness checks to pre-submission validation
**Story Points:** 1

---

## Mission Alignment

- **Pre-submit validation (Constitution #15):** The pre-submit script must verify Railway deployment readiness — health endpoints, CORS, and CSP — before App Store submission.

---

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The pre-submit script now validates 26+ checks including the Railway deployment readiness work from 751-753. If someone removes the /_health endpoint or breaks CORS, the script catches it."

**Nadia Kaur (Cybersecurity):** "The CORS and CSP checks are deployment prerequisites now. If the expo-platform header is missing from production CORS, the entire Expo app would fail. The pre-submit script prevents that regression."

**Marcus Chen (CTO):** "Defense in depth continues. We harden the code, then harden the gate that checks the code. Now the gate also checks the deployment config."

---

## Changes

| File | Change |
|------|--------|
| `scripts/pre-submit-check.sh` | Added 4 Railway deployment checks: /_health, /_ready, CORS expo-platform, CSP Railway domains |

### New Pre-Submit Checks

| Check | Sprint | What It Validates |
|-------|--------|-------------------|
| /_health endpoint exists | 751 | Railway load balancer liveness probe |
| /_ready endpoint exists | 752 | Database connectivity readiness probe |
| CORS expo-platform in production | 753 | Expo app preflight won't fail |
| CSP includes Railway domains | 753 | Browser won't block API requests |

---

## Tests

- **New:** 19 tests in `__tests__/sprint757-pre-submit-railway.test.ts`
- **Total:** 13,086 tests across 564 files — all passing

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 664.9kb / 750kb (88.7%) |
| Tests | 13,086 / 564 files |
| Pre-submit checks | 26+ (was 22) |
