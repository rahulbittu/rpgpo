# Sprint 739 — Accessibility Polish + ErrorBoundary Network Awareness

**Date:** 2026-03-11
**Theme:** Accessibility + UX Polish
**Story Points:** 2

---

## Mission Alignment

App Store review checks accessibility compliance. This sprint adds proper accessibility labels to the 404 page, splash screen, and ErrorBoundary. The ErrorBoundary also now distinguishes between network errors ("Check your connection") and logic errors ("Don't worry, your data is safe"), giving users actionable context.

---

## Team Discussion

**Derek Liu (Mobile):** "The 404 page had zero accessibility attributes — screen reader users would hear nothing meaningful. Now the container has `role=alert`, the icon is hidden from screen readers, and the back link has `role=button` with a clear label."

**Sarah Nakamura (Lead Eng):** "The ErrorBoundary network awareness is simple: check if the error message contains 'network', 'fetch', 'timeout', or 'offline'. If so, show 'Looks like you're offline. Check your connection and try again.' This gives users actionable guidance instead of a generic message."

**Amir Patel (Architecture):** "The splash screen now announces 'TopRanker loading' to screen readers. This is important for VoiceOver users who otherwise hear nothing during the 1-2 second splash animation."

**Leo Hernandez (Frontend):** "The `accessibilityRole=\"header\"` on the ErrorBoundary title ensures VoiceOver treats 'Something went wrong' as a heading, improving navigation for screen reader users."

**Jordan Blake (Compliance):** "Apple's App Store review guidelines require apps to be usable with VoiceOver. These changes address the key accessibility gaps: splash state announcement, error state context, and 404 page navigation."

---

## Changes

| File | Change |
|------|--------|
| `app/+not-found.tsx` | Added accessibilityRole, accessibilityLabel, accessibilityElementsHidden |
| `components/ErrorBoundary.tsx` | Added isNetworkError() method, conditional messaging, accessibilityRole="header" |
| `app/_layout.tsx` | Added accessible + accessibilityLabel to splash container |
| `__tests__/sprint739-a11y-error-awareness.test.ts` | 21 tests: 404 a11y (5), error network awareness (8), splash a11y (2), existing features (5), loader (1) |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 663.0kb / 750kb (88.4%) |
| Tests | 12,746 pass / 548 files |

---

## What's Next (Sprint 740)

Governance sprint: SLT-740, Arch Audit #195, Critique 736-739.
