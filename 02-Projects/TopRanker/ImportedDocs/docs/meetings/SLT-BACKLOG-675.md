# SLT Backlog Meeting — Sprint 675

**Date:** 2026-03-11
**Facilitator:** Marcus Chen (CTO)
**Attendees:** Marcus Chen (CTO), Rachel Wei (CFO), Amir Patel (Architecture), Sarah Nakamura (Lead Eng)

---

## Sprint 671–674 Review

| Sprint | Deliverable | Points | Status |
|--------|-------------|--------|--------|
| 671 | Google Places full details enrichment (hours, description, price) | 5 | Done |
| 672 | Multi-channel Android notifications + deep link validation | 3 | Done |
| 673 | Leaderboard layout refinements (card padding, full-bleed chips) | 2 | Done |
| 674 | App Store compliance (account deletion in Settings) | 2 | Done |

**Velocity:** 12 points / 4 sprints (3.0 pts/sprint avg)

**Also committed between sprints:**
- Real Expo project ID (30a52864) wired into app.json, notifications, OTA
- expo-updates package installed for OTA update support
- Comprehensive dev/UAT/prod environment setup plan written

---

## Architecture Health

- **Build:** 659.9kb / 750kb (88.0% ceiling)
- **Tests:** 11,697 pass across 501 files
- **Tracked files:** 33, 0 violations
- **Channels:** 5 Android notification channels (from 1)
- **Enrichment:** Auto-enrichment of hours/description/price from Google Places
- **App Store:** Privacy policy, terms, account deletion, encryption disclosure all ready

---

## CEO Status

1. **iOS testing** — EAS build configured but BLOCKED on Apple Developer Program enrollment ($99/year). No iOS builds until this is done.
2. **Dev/UAT/Prod** — Plan written at `docs/plans/ENVIRONMENT-SETUP-DEV-UAT-PROD.md`. Awaiting Railway setup for dev and UAT instances.
3. **Expo account** — Logged in, project linked (ID: 30a52864-563f-440f-baf2-842c37fb757c).
4. **npm cache** — Fixed with sudo chown. No longer blocking.

---

## Discussion

**Marcus Chen (CTO):** Solid block of work. The Google Places enrichment in Sprint 671 is the standout — fire-and-forget pattern for pulling hours, descriptions, and price levels is clean and cost-effective. At $17 per 1,000 requests, this is one of the cheapest feature improvements we've shipped. The account deletion in Sprint 674 checks the last major App Store compliance box. We are now feature-complete for submission, pending Apple Developer enrollment.

**Rachel Wei (CFO):** The cost analysis on Google Places enrichment is encouraging. At current volume, we're looking at under $5/month. My concern remains the Apple Developer Program — that $99/year enrollment is the single bottleneck for the entire iOS launch timeline. Every sprint that passes without enrollment pushes App Store submission further out. I want a hard commitment from the CEO on this by end of week.

**Amir Patel (Architecture):** The notification channel expansion from 1 to 5 channels is the right architecture. Users can now independently control tier upgrades, challenger alerts, digests, and reminders. The deep link validation with allowlist is a good security pattern — we reject unknown screens silently rather than crashing. One concern: `google-places.ts` is at 466 LOC and approaching our extraction threshold. I flagged it as low in the audit but we should watch it.

**Sarah Nakamura (Lead Eng):** The leaderboard layout refinements in Sprint 673 were small but impactful — the full-bleed negative margin pattern for chips gives us 32px more horizontal space. Testing held at 11,697 across all four sprints. For the next block, I want to focus on App Store readiness: service flags display, EAS production builds, and Play Store metadata. Sprint 679's rating reminder notification is the most complex piece — we need to track visit timestamps to trigger "rate it" reminders.

---

## Sprint 676–680 Roadmap

| Sprint | Deliverable | Points | Owner |
|--------|-------------|--------|-------|
| 676 | Service flags display on business page (breakfast/lunch/dinner/beer/wine) | 3 | Sarah |
| 677 | EAS production build + App Store Connect metadata upload | 3 | Sarah/Marcus |
| 678 | Play Store metadata + Android adaptive icon verification | 3 | Amir |
| 679 | Rating reminder notification — "You visited X yesterday, rate it!" | 5 | Amir |
| 680 | Governance: SLT-680, Audit #135, critique 676–679 | 2 | Team |

**Projected velocity:** 16 points / 5 sprints

---

## Key Decisions

1. **App Store submission target remains Sprint 685**, contingent on Apple Developer enrollment completing before Sprint 677.
2. **Android Play Store submission at Sprint 690+.** iOS first, prove the store presence, then port metadata.
3. **Google Places enrichment is fire-and-forget** — very cost effective ($17/1,000 requests). No architecture changes needed.
4. **BLOCKING: Apple Developer Program enrollment ($99/year)** — no iOS builds, no TestFlight, no App Store submission until this is done. This is the single highest-priority action item.

---

## Action Items

| Action | Owner | Due |
|--------|-------|-----|
| Enroll in Apple Developer Program IMMEDIATELY | CEO | Sprint 676 |
| Set up Railway dev/UAT per plan doc | CEO | Sprint 677 |
| Close first Pro customer ($49/mo) | Rachel | Sprint 680 |
| Full App Store Review Guidelines walkthrough | Jordan | Sprint 677 |
| Monitor google-places.ts LOC — extract if >500 | Amir | Sprint 680 |

---

**Next SLT meeting:** Sprint 680
