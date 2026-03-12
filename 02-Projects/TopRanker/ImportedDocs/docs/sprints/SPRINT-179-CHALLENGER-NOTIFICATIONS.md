# Sprint 179: Challenger Push Notifications + Social Sharing

**Date:** 2026-03-09
**Story Points:** 8
**Focus:** Wire challenger lifecycle notifications (new + result) and social share previews for challenges

---

## Mission Alignment
Challenges are a $99 revenue feature — but without notification loops, they're invisible after creation. This sprint closes the gap: city members get notified when new challenges launch and when they end, driving engagement and return behavior. Social share previews make challenge links useful when shared on social media. This directly strengthens **rate -> consequence -> ranking** by making consequences more visible.

---

## Team Discussion

**Marcus Chen (CTO):** "Two dead-code paths finally come alive. `notifyNewChallenger` has existed since Sprint 38, never called. `notifyChallengerResult` existed too. We wired both into actual business logic — new challenge creation and challenge expiration. The `createChallenge` function also fills a production gap: challenger records were only created in seed data, never from the Stripe webhook."

**Sarah Nakamura (Lead Eng):** "The webhook wiring is the highest-value change. When a `challenger_entry` payment succeeds, we now: (1) resolve the defender from the leaderboard's #1 spot, (2) create the challenge record, (3) notify city members. The defender resolution uses `getLeaderboard` — same source of truth as the rankings page."

**Amir Patel (Architecture):** "The social share endpoint at `/api/seo/challenger/:id` returns Open Graph metadata for client rendering. It handles three states: active (days left), completed (winner), draw. This follows the pattern from Sprint 174's dish SEO — JSON data endpoint, client renders the meta tags. Route file stayed under 180 lines."

**Rachel Wei (CFO):** "$99 challenger entries are our highest-margin product. But conversion requires visibility. Push notifications to 500 city members per challenge means every $99 entry gets organic reach. The notification → engagement → rating loop should increase challenger purchases."

**Priya Sharma (Design):** "The share preview shows VS format — challenger name vs defender name with category. Active challenges show days remaining. Completed challenges show the winner. The OG image falls back to business photos or our default. Clean, shareable, drives traffic back."

**Nadia Kaur (Security):** "The push notification to city members is capped at 500 per batch — prevents runaway notification volume. Both `notifyNewChallenger` and `notifyChallengerResult` check user notification preferences before sending. The social share endpoint is public (no auth required) since it only exposes business names and challenge status — no PII."

**Jasmine Taylor (Marketing):** "Shared challenge links with proper OG previews are free marketing. When a user shares 'Vote in the best tacos in Dallas challenge' on Instagram or Twitter, the preview card does the selling. This is our first organic growth loop beyond SEO."

**Jordan Blake (Compliance):** "Push notifications respect user opt-out preferences (`newChallengers` and `challengerResults` pref keys). CAN-SPAM doesn't apply to push, but TCPA best practices require opt-out capability — we have it. The notification content is factual and non-deceptive."

---

## Changes

### Modified Files
| File | Change |
|------|--------|
| `server/storage/challengers.ts` | Added `createChallenge()` with notifyNewChallenger wiring; `closeExpiredChallenges()` now sends result push notifications |
| `server/storage/members.ts` | Added `getMembersWithPushTokenByCity()` for city-scoped push targeting |
| `server/storage/index.ts` | Exported `createChallenge`, `closeExpiredChallenges`, `getMembersWithPushTokenByCity` |
| `server/routes-seo.ts` | Added `GET /api/seo/challenger/:id` social share preview endpoint |
| `server/stripe-webhook.ts` | Wired `createChallenge` into `payment_intent.succeeded` for `challenger_entry` type |

### API Endpoints (New)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/seo/challenger/:id` | Public | Social share preview data (OG metadata) |

### Push Notification Triggers (Newly Wired)
| Trigger | When | Recipients |
|---------|------|------------|
| `notifyNewChallenger` | Challenge record created after payment | City members with push tokens (up to 500) |
| `notifyChallengerResult` | Challenge expires in batch job | City members with push tokens (up to 500) |

### Storage Functions (New)
| Function | Location | Purpose |
|----------|----------|---------|
| `createChallenge()` | `server/storage/challengers.ts` | Create challenge record + trigger notification |
| `getMembersWithPushTokenByCity()` | `server/storage/members.ts` | Query members with push tokens in a city |

---

## Test Results
- **43 new tests** for challenger notifications + social sharing
- Full suite: **2,679 tests** across 112 files — all passing, <1.9s
