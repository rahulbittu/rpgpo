# SLT Backlog Meeting — Sprint 680

**Date:** 2026-03-11
**Facilitator:** Marcus Chen (CTO)
**Attendees:** Marcus Chen (CTO), Rachel Wei (CFO), Amir Patel (Architecture), Sarah Nakamura (Lead Eng)

---

## Sprint 676–679 Review

| Sprint | Deliverable | Points | Status |
|--------|-------------|--------|--------|
| 676 | Shared notification channel extraction (A130-L1) | 3 | Done |
| 677 | Enrichment + deep link + channel tests (66 tests) | 3 | Done |
| 678 | Service flags display on business page | 3 | Done |
| 679 | Personalized rating reminder — "How was [Business]?" | 5 | Done |

**Velocity:** 14 points / 4 sprints (3.5 pts/sprint avg) — up from 3.0 in previous block

**Also committed between sprints:**
- Apple Developer Program enrollment completed ($99/year)
- Apple account activation pending (24-48h processing)

---

## Architecture Health

- **Build:** 662.3kb / 750kb (88.3% ceiling)
- **Tests:** 11,763 pass across 502 files (+66 from Sprint 677)
- **Schema:** 911 / 950 LOC (+5 service flag columns)
- **Tracked files:** 33, 0 violations
- **`as any` count:** 114 (threshold: 130)
- **Audit findings resolved:** A130-L1 (channel map duplication)

---

## CEO Status

1. **Apple Developer** — $99 paid, activation pending (24-48h). Once active, run `npx eas-cli@latest build --profile preview --platform ios`.
2. **Expo Go testing** — Available now via `npx expo start` + QR code scan. Auto-reload works over WiFi.
3. **Dev/UAT/Prod** — Plan at `docs/plans/ENVIRONMENT-SETUP-DEV-UAT-PROD.md`. Still awaiting Railway setup.
4. **Schema migration** — 5 new service flag columns need `drizzle-kit push` on Railway.

---

## Discussion

**Marcus Chen (CTO):** "Strong block. Velocity recovered to 3.5 from 3.0. Four sprints, four domains: architecture cleanup, test coverage, UI features, and engagement infrastructure. The personalized reminder in Sprint 679 is the highest-impact engagement feature we've built since the weekly digest. With Apple Developer enrollment done, we're unblocked for iOS builds."

**Rachel Wei (CFO):** "The personalized reminder is a revenue signal — engaged users become Pro customers. If the 'How was [Business]?' push drives even 15% higher re-engagement than generic, that's material. For the next block, I want us to finalize App Store metadata and screenshots. Every sprint without a store presence is a sprint without organic discovery."

**Amir Patel (Architecture):** "Build size crept 2.4kb this block (660.2→662.3kb). Still comfortably under 750kb. Schema at 911/950 — the 5 service flag columns used most of our remaining budget. We should be very selective about future schema additions. notification-triggers.ts at 306 LOC needs watching — if we add more trigger types, split personalized reminders to their own file."

**Sarah Nakamura (Lead Eng):** "Test coverage jumped from 11,697 to 11,763 — 66 new tests covering enrichment, deep links, and channels. The service flags display completes the enrichment pipeline end-to-end. For the next block, I want to focus on App Store readiness: production EAS builds, screenshots, and metadata. Sprint 681 should be our first real iOS build."

---

## Sprint 681–685 Roadmap

| Sprint | Deliverable | Points | Owner |
|--------|-------------|--------|-------|
| 681 | EAS production build + iOS preview testing | 3 | Sarah/Marcus |
| 682 | App Store Connect metadata + screenshots | 3 | Sarah/Jasmine |
| 683 | Play Store metadata + Android build | 3 | Amir |
| 684 | TestFlight beta distribution | 3 | Sarah |
| 685 | Governance: SLT-685, Audit #140, critique 681–684 | 2 | Team |

**Projected velocity:** 14 points / 5 sprints

---

## Key Decisions

1. **App Store submission target: Sprint 690.** iOS build in 681, metadata in 682, TestFlight in 684, submission after governance review in 685.
2. **Android Play Store submission: Sprint 695.** iOS proves the process, then port to Android.
3. **Schema at 911/950** — be very selective about future additions. Consider archived columns or table splits if approaching 940.
4. **Personalized reminder A/B test** in Sprint 681+ — measure engagement lift vs. generic.

---

## Action Items

| Action | Owner | Due |
|--------|-------|-----|
| Retry iOS build once Apple activates account | CEO | Sprint 681 |
| Run drizzle-kit push for service flag columns | CEO | Sprint 681 |
| Set up Railway dev/UAT environments | CEO | Sprint 682 |
| Close first Pro customer ($49/mo) | Rachel | Sprint 685 |
| App Store Review Guidelines walkthrough | Jordan | Sprint 681 |
| Monitor notification-triggers.ts LOC (306, threshold 320) | Amir | Sprint 685 |

---

**Next SLT meeting:** Sprint 685
