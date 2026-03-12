# Sprint 748 — Pre-Submit Script Hardening

**Date:** 2026-03-12
**Theme:** Add Sprint 741-747 security checks to pre-submission validation
**Story Points:** 1

---

## Mission Alignment

- **Pre-submit validation (Constitution #15):** The pre-submit script is the last gate before App Store submission. It must verify every hardening item from Sprints 741-747.

---

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The pre-submit script now validates 22+ checks including all the hardening work from 741-747. If any regression sneaks in — a Math.random() reintroduced, an empty catch added, SHARE_BASE_URL removed — the script catches it before submission."

**Nadia Kaur (Cybersecurity):** "The security checks are now part of the deployment gate: no Math.random() IDs, no empty catches, isReceipt validation, URL protocol validation. These aren't just tests — they're deployment prerequisites."

**Marcus Chen (CTO):** "This closes the loop. We harden the code (741-747), then we harden the gate that checks the code (748). Defense in depth for the deployment pipeline itself."

---

## Changes

| File | Change |
|------|--------|
| `scripts/pre-submit-check.sh` | Added 7 new security checks covering Sprints 741-747 |

### New Pre-Submit Checks

| Check | Sprint | What It Validates |
|-------|--------|-------------------|
| No Math.random() in server IDs | 741 | Crypto RNG standardization |
| SHARE_BASE_URL exported | 742 | URL centralization (client) |
| config.siteUrl defined | 742 | URL centralization (server) |
| No empty catch blocks | 743 | Error handling coverage |
| isReceipt strictly validated | 746 | Receipt flag boolean validation |
| URL protocol validation | 746 | Business action URL XSS prevention |

---

## Tests

- **New:** 10 tests in `__tests__/sprint748-pre-submit-hardening.test.ts`
- **Total:** 12,908 tests across 555 files — all passing

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 664.3kb / 750kb (88.6%) |
| Tests | 12,908 / 555 files |
| Pre-submit checks | 22+ (was 15) |
