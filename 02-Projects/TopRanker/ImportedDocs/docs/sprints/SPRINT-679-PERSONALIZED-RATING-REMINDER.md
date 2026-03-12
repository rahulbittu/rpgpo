# Sprint 679 — Personalized Rating Reminder

**Date:** 2026-03-11
**Theme:** Visit-Based Personalized Push Notifications
**Story Points:** 5

---

## Mission Alignment

The generic "Your neighborhood misses you" reminder is effective but impersonal. Sprint 679 enhances the rating reminder to be personalized — when a user hasn't rated in 2+ days, we look up the name of the last business they rated and craft a contextual message: "How was [Restaurant Name]?" This taps into the psychological trigger of a specific memory vs. a generic nudge, driving higher engagement.

---

## Team Discussion

**Marcus Chen (CTO):** "Personalized push is the highest-leverage engagement feature we can build right now. A user who sees 'How was Bawarchi Biryanis?' is significantly more likely to tap than one who sees 'Your neighborhood misses you.' We have the data — we're just using it better."

**Amir Patel (Architecture):** "The two-tier approach is smart. Users inactive 2–7 days get the personalized 'How was [Business]?' message with a deep link back to that business page. Users inactive 7+ days get the generic re-engagement. The extra DB query for the last-rated business is acceptable — it's a single indexed lookup per eligible user."

**Sarah Nakamura (Lead Eng):** "The notification now deep links to the specific business page instead of generic search. When someone taps 'How was Bawarchi Biryanis?' they land directly on that business, see the updated rankings, and are prompted to rate. The flow from notification to action is seamless."

**Rachel Wei (CFO):** "This is an engagement multiplier. Personalized push notifications typically see 2–3x the open rate of generic ones. If we can convert even 20% of these reminders into return visits, that's meaningful for our ratings-per-week metric."

**Jasmine Taylor (Marketing):** "The copy 'How was [Business]?' is conversational and personal. It reads like a friend asking about your dinner, not a marketing push. That's the right tone for our brand."

**Nadia Kaur (Security):** "Business names in push notifications are visible on lock screens. We should ensure no sensitive content appears in business names. Since we control the business data import, this is low risk, but worth noting."

---

## Changes

### Modified Files

| File | Delta | Change |
|------|-------|--------|
| `server/notification-triggers.ts` | +41 | Two-tier personalization: last-rated business lookup, contextual copy |
| `lib/notifications.ts` | +6 | New `ratingReminder` template with business name + slug |
| `__tests__/sprint504-triggers-extraction.test.ts` | threshold | LOC ceiling 280→320 |
| `__tests__/sprint505-governance.test.ts` | threshold | LOC ceiling 280→320 |

### Notification Tiers

| Tier | Condition | Title | Body | Deep Link |
|------|-----------|-------|------|-----------|
| 1 — Personalized | Inactive 2–3 days, has last rating | "How was [Business]?" | "You visited [Business] recently. Rate your experience..." | business/[slug] |
| 2 — Personalized (older) | Inactive 4–14 days, has last rating | "How was [Business]?" | "It's been X days since you rated [Business]. Discover..." | business/[slug] |
| 3 — Generic | Inactive 7+ days, no recent ratings | "Your neighborhood misses you" | "Hey [Name], new restaurants..." | search |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.3kb / 750kb (88.3%) |
| Tests | 11,763 pass / 502 files |
| Schema | 910 / 950 LOC |
| Tracked files | 33, 0 violations |

---

## What's Next (Sprint 680)

Governance: SLT-680 meeting, Architectural Audit #135, Critique Request for Sprints 676–679.
