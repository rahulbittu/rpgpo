# SLT Backlog Meeting — Sprint 670

**Date:** 2026-03-11
**Facilitator:** Marcus Chen (CTO)
**Attendees:** Marcus Chen (CTO), Rachel Wei (CFO), Amir Patel (Architecture), Sarah Nakamura (Lead Eng)

---

## Sprint 666–669 Review

| Sprint | Deliverable | Points | Status |
|--------|-------------|--------|--------|
| 666 | Apple Sign-In on signup + JWKS verification | 3 | Done |
| 667 | Offline rating queue (AsyncStorage + sync) | 5 | Done |
| 668 | EAS preview build config — iOS testing setup | 3 | Done |
| 669 | Native platform polish (StatusBar, gestures, shared configs) | 3 | Done |

**Velocity:** 14 points / 4 sprints (3.5 pts/sprint avg)

---

## Architecture Health

- **Build:** 655.5kb / 750kb (87.4% ceiling)
- **Tests:** 11,697 pass across 501 files
- **Tracked files:** 33, 0 violations
- **Auth:** Google + Apple + email/password (all three flows complete)
- **New modules:** Offline sync service, EAS preview config, native gesture system

---

## CEO Feedback Integration

1. **iOS testing setup** — EAS preview build configured in Sprint 668. Awaiting Expo account login (npm permissions issue being resolved by CEO).
2. **Dev/UAT/Prod environments** — Comprehensive plan written at `docs/plans/ENVIRONMENT-SETUP-DEV-UAT-PROD.md`. Awaiting CEO Railway setup for dev and UAT instances.
3. **Progress bar** — 95.6% to App Store ready. Remaining: environment setup, legal review, App Store metadata.

---

## Discussion

**Marcus Chen (CTO):** Four clean sprints. The offline queue was the heaviest lift at 5 points and it landed well. Apple Sign-In completes our auth surface — we now support all three major auth methods. The native polish sprint was smart — gesture handling and StatusBar are the kind of details that matter for App Store review.

**Rachel Wei (CFO):** Revenue pipeline update: we have 3 Pro customers in active conversation. The App Store timeline at Sprint 685 gives us roughly 15 sprints. I want the privacy policy and ToS done well before submission — Jordan should start now, not at Sprint 674.

**Amir Patel (Architecture):** The offline sync service is clean at 85 LOC. My concern is the preview build pointing to production API. Once we have UAT, we should redirect preview builds there. The audit flagged this as medium — the EAS project ID is still a placeholder. CEO needs to run `eas init` to get the real UUID.

**Sarah Nakamura (Lead Eng):** Testing coverage held through all four sprints. The gesture system extraction was a good pattern — shared configs reduce per-screen boilerplate. For the next block, menu data from Google Places is the most complex piece. We need to handle rate limits and caching carefully.

---

## Sprint 671–675 Roadmap

| Sprint | Deliverable | Points | Owner |
|--------|-------------|--------|-------|
| 671 | Menu data from Google Places API + menu tab on business page | 5 | Amir |
| 672 | Push notification deep linking QA + Android channels | 3 | Sarah |
| 673 | App Store metadata prep (screenshots, description, keywords) | 3 | Jasmine/Sarah |
| 674 | Privacy policy + Terms of Service compliance review | 3 | Jordan/Victoria |
| 675 | Governance: SLT-675, Audit #130, critique 671–674 | 2 | Team |

**Projected velocity:** 16 points / 5 sprints

---

## Key Decisions

1. **App Store submission target: Sprint 685.** Environment setup (dev/UAT/prod) is the prerequisite. Legal review must be complete by Sprint 680.
2. **Menu data from Google Places:** Pull menu items and photos into business profile. Enhances core value prop — users see what a restaurant serves before rating.
3. **Legal review:** Privacy policy and ToS need Jordan Blake sign-off before App Store submission. Rachel recommends starting earlier than Sprint 674.
4. **Android Play Store:** Defer to Sprint 690+. iOS first, prove the store presence, then port.

---

## Action Items

| Action | Owner | Due |
|--------|-------|-----|
| Fix npm cache permissions and complete `eas init` + EAS login | CEO | Sprint 671 |
| Set up Railway dev/UAT environments per plan doc | CEO | Sprint 672 |
| Continue Pro customer outreach — close at least 1 before App Store | Rachel | Sprint 680 |
| Begin App Store compliance review (privacy, data collection disclosures) | Jordan | Sprint 672 |
| Google Places API key scoping and rate limit analysis | Amir | Sprint 671 |

---

**Next SLT meeting:** Sprint 675
