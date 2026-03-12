# Sprint 682 — App Store Connect Metadata & Screenshots

**Date:** 2026-03-11
**Theme:** App Store Submission Preparation
**Story Points:** 3

---

## Mission Alignment

With the iOS build running on EAS, this sprint prepares everything needed for App Store Connect: screenshot mapping, step-by-step App Store Connect setup checklist, notification icon creation, and data privacy disclosures. The goal is zero blockers between build completion and submission.

---

## Team Discussion

**Marcus Chen (CTO):** "The App Store Connect checklist is the kind of operational documentation that prevents last-minute scrambles. Every field, every value, every step documented. When Rahul opens App Store Connect, he follows the checklist and submits."

**Rachel Wei (CFO):** "Keywords are strategically targeted: 'best restaurants,' 'biryani,' 'Indian food,' 'Dallas restaurants.' These match our Phase 1 market perfectly. We're not trying to rank for 'restaurant finder' against Yelp — we're dominating the niche."

**Jasmine Taylor (Marketing):** "The screenshot mapping to store slots is smart. Five screens that tell the story: Rankings → Business Detail → Rating Flow → Discover → Challenger. The captions are concise and benefit-focused: 'Live rankings. Every rating counts.'"

**Jordan Blake (Compliance):** "The privacy disclosures are accurate — we collect email, name, location, photos, ratings, and usage data. Linked to user where appropriate. No tracking. Encryption is non-exempt. This matches our privacy policy."

**Sarah Nakamura (Lead Eng):** "The notification icon is now in place — copied from the favicon at 192px. For production, we should create a proper 96×96 white silhouette, but this works for the initial submission."

---

## Changes

### New Files

| File | Purpose |
|------|---------|
| `docs/app-store/SCREENSHOT-MAPPING.md` | Maps existing screenshots to App Store slots, capture checklist |
| `docs/app-store/APP-STORE-CONNECT-CHECKLIST.md` | Step-by-step App Store Connect setup guide with all field values |
| `assets/images/notification-icon.png` | Android notification icon (from favicon-192) |

---

## App Store Readiness Status

| Requirement | Status |
|-------------|--------|
| App name & subtitle | Ready |
| Description & keywords | Ready |
| Privacy policy URL | Ready |
| Terms of service URL | Ready |
| Age rating | Ready (4+) |
| Encryption disclosure | Ready (non-exempt) |
| Data privacy disclosures | Ready |
| Review notes + test account | Ready |
| Screenshots | Mapped, need device capture |
| App Store Connect app created | CEO action needed |
| Notification icon | Created |
| iOS build | Building on EAS |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.3kb / 750kb (88.3%) |
| Tests | 11,808 pass / 503 files |
| Schema | 911 / 950 LOC |

---

## What's Next (Sprint 683)

Android build configuration + Play Store metadata.
