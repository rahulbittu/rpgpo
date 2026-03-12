# Sprint 185: Real User Onboarding + SLT Meeting + Arch Audit #19

**Date:** 2026-03-09
**Story Points:** 5
**Focus:** Onboarding checklist for new users, SLT-185 backlog meeting, Architectural Audit #19

---

## Mission Alignment
Core Value #9 (new user experience must be honest) — new users need a clear path from signup to their first meaningful interaction. The onboarding checklist tracks 7 milestones: account creation, city selection, avatar upload, 3-day waiting period, first rating, 3 ratings, and tier upgrade. Each step strengthens the core loop: rate → consequence → ranking. No vanity metrics — only steps that lead to real engagement.

---

## Team Discussion

**Marcus Chen (CTO):** "This is the milestone sprint. SLT-185 sets the roadmap for beta launch (186-190). The onboarding checklist is server-computed from existing member data — no schema changes, no migrations. We derive progress from joinedAt, avatarUrl, totalRatings, and credibilityTier."

**Sarah Nakamura (Lead Eng):** "The getOnboardingProgress function is a single query to the members table. It calculates days active, checks each milestone, and returns a structured response. The client component auto-hides when all steps are complete — no dismiss button needed, the checklist disappears naturally."

**Amir Patel (Architecture):** "Audit #19 maintains A-. No new HIGH findings. search.tsx is the only growth concern at 870 LOC — hook extraction planned for Sprint 188-189. Route files are all healthy. The test health is excellent: 2,942 tests in <1.9s."

**Rachel Wei (CFO):** "SLT-185 roadmap is the path to revenue. Sprint 186 (email verification) is the security gate. Sprint 188 (social sharing + referrals) is the growth gate. Both must land before beta. Zero revenue with zero users — the product is ready, distribution isn't."

**Jordan Blake (Compliance):** "Onboarding checklist data is derived entirely from existing member fields. No new data collection. The progress endpoint requires authentication — users can only see their own onboarding state."

**Priya Sharma (Design):** "The checklist card sits between the profile header and credibility score — prime real estate for new users. Progress bar with amber fill, checkmark icons for completed steps, detail text for context. It disappears when complete so returning users see a clean profile."

---

## Changes

### Modified Files
| File | Change |
|------|--------|
| `server/storage/members.ts` | Added getOnboardingProgress (7-step milestone tracker) |
| `server/routes-members.ts` | GET /api/members/me/onboarding |
| `server/storage/index.ts` | Export getOnboardingProgress |
| `lib/api.ts` | fetchOnboardingProgress, OnboardingStep type, OnboardingProgress type |
| `app/(tabs)/profile.tsx` | Added OnboardingChecklist component |

### New Files
| File | Purpose |
|------|---------|
| `components/profile/OnboardingChecklist.tsx` | Checklist card with progress bar and step rows |
| `docs/meetings/SLT-BACKLOG-185.md` | SLT meeting — Sprint 186-190 roadmap |
| `docs/audits/ARCH-AUDIT-185.md` | Arch Audit #19 — Grade A- |

### API Endpoints (New)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/members/me/onboarding` | Required | Onboarding progress checklist |

### Onboarding Milestones (7 steps)
1. **Create account** — always complete (you're logged in)
2. **Choose your city** — city field is set
3. **Add profile photo** — avatarUrl is set
4. **Complete 3-day waiting period** — daysActive >= 3
5. **Submit first rating** — totalRatings > 0
6. **Rate 3 different restaurants** — totalRatings >= 3
7. **Earn first tier upgrade** — credibilityTier !== "community"

---

## Test Results
- **29 new tests** for onboarding checklist
- Full suite: **2,942 tests** across 118 files — all passing, <1.9s
