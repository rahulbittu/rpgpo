# Sprint 181: Profile SubComponents Decomposition

**Date:** 2026-03-09
**Story Points:** 5
**Focus:** Decompose profile/SubComponents.tsx (863 LOC) into 11 individual component files per Audit A18-1

---

## Mission Alignment
Core Values #13 (one source of truth) requires that code organization reflects domain boundaries. A monolithic 863-line component file obscures ownership and makes changes risky. This decomposition aligns with Core Values #17 (clarity over cleverness) — each component is now independently navigable, testable, and maintainable. This unblocks future profile feature work without cascade risk.

---

## Team Discussion

**Marcus Chen (CTO):** "This resolves the last HIGH finding from Audit #18. Profile SubComponents.tsx has been flagged since Audit #17 at Sprint 175. Same pattern we used for business/SubComponents in Sprint 145 — individual files with a barrel re-export. Zero runtime change, zero import changes."

**Sarah Nakamura (Lead Eng):** "Eleven files, each self-contained with imports and StyleSheet. The barrel is 15 lines. Existing import path `@/components/profile/SubComponents` works unchanged — profile.tsx doesn't need a single edit."

**Amir Patel (Architecture):** "The largest individual file is CredibilityJourney.tsx (the horizontal stepper) — still well under 300 lines including styles. LoggedOutView is the next largest with the full sign-in form. Both are self-contained. This should push the audit grade from A- to A."

**Priya Sharma (Design):** "Having each component in its own file makes design iteration faster. When we update the credibility journey stepper or the login form, there's no risk of accidentally breaking payment history or the impact card."

**Rachel Wei (CFO):** "Technical debt repayment. This doesn't add revenue features, but it reduces the cost of future profile changes — which we'll need for push deep links (Sprint 182) and notification center."

**Jordan Blake (Compliance):** "The LegalLinksSection is now isolated — terms, privacy, accessibility, and delete account button in one file. Makes it easy to find and update when legal requirements change."

---

## Changes

### New Files (11 components)
| File | Lines | Purpose |
|------|-------|---------|
| `components/profile/TierBadge.tsx` | ~30 | Tier badge with icon + colored label |
| `components/profile/HistoryRow.tsx` | ~45 | Rating history row |
| `components/profile/BreakdownRow.tsx` | ~25 | Credibility breakdown row |
| `components/profile/SavedRow.tsx` | ~40 | Saved/bookmarked business row |
| `components/profile/ImpactCard.tsx` | ~65 | "Your Impact" pride card |
| `components/profile/PaymentHistoryRow.tsx` | ~55 | Payment history row |
| `components/profile/CredibilityJourney.tsx` | ~175 | Horizontal tier stepper |
| `components/profile/TierRewardsSection.tsx` | ~80 | Perks grid + next tier preview |
| `components/profile/NotificationSettingsLink.tsx` | ~30 | Settings link card |
| `components/profile/LegalLinksSection.tsx` | ~80 | Legal links + delete account |
| `components/profile/LoggedOutView.tsx` | ~170 | Full sign-in form |

### Modified Files
| File | Change |
|------|--------|
| `components/profile/SubComponents.tsx` | 863 LOC → 15-line barrel export |
| `tests/sprint149-edit-profile.test.ts` | Updated to read from individual files |

### Metrics
| Metric | Before | After |
|--------|--------|-------|
| SubComponents.tsx | 863 lines | 15 lines (barrel) |
| Individual files | 0 | 11 |
| Largest file | 863 | ~175 (CredibilityJourney) |
| Import changes | 0 | 0 (barrel preserves API) |

---

## Test Results
- **52 new tests** for profile decomposition
- Full suite: **2,782 tests** across 114 files — all passing, <1.8s
