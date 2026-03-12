# Sprint 721 — Release Hardening (Privacy Manifest + ErrorUtils + Device Model)

**Date:** 2026-03-11
**Theme:** Critique-Driven Beta Readiness
**Story Points:** 2

---

## Mission Alignment

The external critique (716–719 response) identified three unresolved release blockers: incomplete privacy manifest, unproven ErrorUtils safety, and missing device model in feedback. This sprint closes all three. Every change directly addresses a specific critique finding.

---

## Team Discussion

**Nadia Kaur (Security):** "The privacy manifest was only declaring UserDefaults. expo-image uses file timestamps for cache management, expo-device accesses system boot time, and several packages check disk space. Apple requires all four API categories to be declared. This was the most likely App Store rejection risk."

**Amir Patel (Architecture):** "The four required API categories are: UserDefaults (CA92.1), FileTimestamp (DDA9.1 — app functionality), SystemBootTime (35F9.1 — measure elapsed time), and DiskSpace (E174.1 — check available space). Each has a single, appropriate reason code."

**Sarah Nakamura (Lead Eng):** "The ErrorUtils mount guard was the right call. React's StrictMode in dev double-mounts effects, and if a parent component re-renders causing _layout to remount, we'd install a second handler wrapping the first. The useRef guard prevents that entirely."

**Derek Liu (Mobile):** "Device model is critical for beta triage. 'Crashes on scroll' means completely different things on an iPhone 12 Mini vs an iPhone 15 Pro Max. Now we'll know exactly which hardware is affected."

**Jordan Blake (Compliance):** "The updated pre-submit-check.sh now validates that exactly 4 API types are declared. If someone accidentally removes one, the check catches it before submission."

**Marcus Chen (CTO):** "This is exactly what critique is for — catching blind spots before Apple does. Three real issues found, three real issues fixed, one sprint."

---

## Changes

| File | Change |
|------|--------|
| `app.json` | Added FileTimestamp (DDA9.1), SystemBootTime (35F9.1), DiskSpace (E174.1) to privacy manifest |
| `app/_layout.tsx` | Added useRef mount guard to prevent ErrorUtils handler chain corruption on re-mount |
| `app/feedback.tsx` | Added Device.modelName and Device.brand to feedback device context |
| `scripts/pre-submit-check.sh` | Added privacy manifest API type count validation (expects 4) |
| `__tests__/sprint717-crash-analytics.test.ts` | Updated cleanup assertion for new mount guard pattern |
| `__tests__/sprint721-release-hardening.test.ts` | 18 tests: privacy manifest (7), ErrorUtils guard (6), device model (4), pre-submit (1) |

---

## Critique Items Closed

| Critique Finding | Status |
|------------------|--------|
| Privacy manifest may be incomplete (only UserDefaults) | ✅ All 4 API types declared |
| ErrorUtils handler chain corruption risk | ✅ Mount guard prevents double-install |
| Should capture device model for hardware-specific bugs | ✅ Device.modelName + Device.brand added |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.3kb / 750kb (88.3%) |
| Tests | 12,457 pass / 533 files |

---

## What's Next (Sprint 722)

Reduced motion accessibility + app lifecycle analytics events (remaining critique items).
