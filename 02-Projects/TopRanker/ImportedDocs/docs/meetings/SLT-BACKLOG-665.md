# SLT Backlog Meeting — Sprint 665

**Date:** 2026-03-11
**Attendees:** Marcus Chen (CTO), Rachel Wei (CFO), Amir Patel (Architecture), Sarah Nakamura (Lead Eng)

## Sprint 661-664 Review

| Sprint | Deliverable | Points | Status |
|--------|------------|--------|--------|
| 661 | Threshold tracking for new files (Audit L1/L2) | 2 | Done |
| 662 | Auto-fetch action URLs from Google Places | 3 | Done |
| 663 | Batch action URL enrichment | 2 | Done |
| 664 | Apple Sign-In (#1 App Store blocker) | 5 | Done |

**Velocity:** 12 points / 4 sprints. Major App Store blocker resolved.

## Architecture Health

- **Build:** 654.3kb / 750kb (87%)
- **Tests:** 11,697 pass (501 files)
- **Tracked files:** 33, 0 violations
- **Auth:** Google + Apple + email/password (full coverage for iOS)

## CEO Feedback Integration

**Rahul (CEO) requested:**
1. ~~DoorDash/Uber Eats integration~~ → Done (Sprint 662-663, auto-enrichment)
2. ~~iOS testing setup~~ → EAS config exists, needs first build
3. ~~Progress bar to App Store~~ → ~86% complete, ~16 sprints remaining
4. ~~Pull menus from API~~ → Done (Sprint 662, website URL as menu fallback)

## Sprint 666-670 Roadmap

| Sprint | Deliverable | Points | Owner |
|--------|------------|--------|-------|
| 666 | Apple Sign-In on signup + JWKS verification | 3 | Nadia |
| 667 | Offline rating queue (AsyncStorage + sync) | 5 | Amir |
| 668 | iOS/Android UI parity — safe area + fonts | 3 | Sarah |
| 669 | EAS preview build + OTA update workflow | 3 | Sarah |
| 670 | Governance: SLT-670, Audit #125, critique 666-669 | 2 | Team |

## Key Decisions

1. **App Store timeline:** Target Sprint 680 for submission. 16 sprints at current velocity = ~4 days.
2. **iOS testing priority:** Sprint 669 sets up EAS preview builds so CEO can test on physical iPhone.
3. **Offline queue:** Critical for restaurant visits with poor cell service. 5-pointer may split across 2 sprints.
4. **UI parity:** iOS/Android have different safe area, font rendering, and scroll behavior. Sprint 668 addresses top issues.

## Action Items
- [ ] Rachel: First Pro customer outreach to claimed business owners (Owner: Rachel)
- [ ] Jasmine: WhatsApp campaign for "Best biryani in Irving" (Owner: Jasmine)
- [ ] Marcus: Schedule Apple Developer account setup with Rahul (Owner: Marcus)
