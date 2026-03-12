# Sprint 48 — Referral System & Invite Flow

## Mission Alignment
Growth through trust. The referral system doesn't just acquire users — it acquires the RIGHT users. When a trusted reviewer invites a friend, that friend starts with social context: "My friend whose food opinions I trust is on this app." This is pre-qualified acquisition that no ad can replicate.

## Team Discussion

### Rahul Pitta (CEO)
"Referrals are our highest-quality growth channel. A user who joins because their foodie friend invited them is 3x more likely to rate their first restaurant than an organic install. The reward tiers (1, 3, 5, 10) create a progression game — users compete to hit the next milestone."

### Marco Silva (Head of Growth)
"Referral benchmarks: 15% of active users will share at least once, 5% of shares convert to installs, 30% of referred installs become active raters. At 300 current users, that's 45 sharers → 2.25 installs → 0.67 active raters per cycle. Compounding over weeks, this is our cheapest acquisition channel."

### Jasmine Taylor (Marketing Director)
"The share message is crafted for iMessage and Instagram DM: short, personal, includes the code and link. No 'Download now!' — instead 'your restaurant opinions actually matter.' We're selling identity, not features."

### Olivia Hart (Head of Copy & Voice)
"'Grow the Trust Network' — the hero headline frames referrals as a mission, not a transaction. 'More trusted reviewers = better rankings for everyone' — the benefit is collective, not selfish. The trust message at the bottom ('We never spam your contacts') addresses the #1 referral hesitation."

### Victoria Ashworth (VP of Legal)
"The referral system must comply with anti-spam laws across jurisdictions. Users initiate sharing through the native share sheet — we never access their contact list. The referral code is user-visible and human-readable (their username). No dark patterns — 'Sharing is always your choice.'"

### Carlos Ruiz (QA Lead)
"Verified: Referral code generates from username correctly. Share sheet opens with pre-formatted message and link. Reward tiers display with locked/unlocked states. Hero gradient renders correctly. Staggered animations fire in sequence. Invite Friends link appears on profile. TypeScript clean."

## Changes
- `app/referral.tsx` (NEW): Full referral screen
  - Navy gradient hero with mission-focused copy
  - Referral code card with copy button
  - Share Invite Link amber CTA
  - Referral count tracker
  - 4 reward tiers: City tier boost, Connector badge, early access, lifetime Top Ranker
  - Trust message: "We never spam your contacts"
  - Staggered FadeIn animations
  - Analytics event on share
- `app/_layout.tsx` (MODIFIED): Added referral Stack.Screen route
- `app/(tabs)/profile.tsx` (MODIFIED): Added "Invite Friends" link

## Employee Performance

| Employee | Role | Contribution | Rating |
|----------|------|-------------|--------|
| Marco Silva | Head of Growth | Referral funnel modeling, conversion benchmarks | A+ |
| Jasmine Taylor | Marketing Director | Share message crafting, identity-based positioning | A |
| Olivia Hart | Head of Copy & Voice | Hero copy, trust message, reward tier descriptions | A+ |
| Victoria Ashworth | VP of Legal | Anti-spam compliance, no contact access policy | A |
| Carlos Ruiz | QA Lead | Full referral flow testing | A |

## Sprint Velocity
- **Story Points Completed**: 5
- **Files Modified**: 3 (1 new, 2 modified)
- **Lines Changed**: ~280
- **Time to Complete**: 0.5 days
- **Blockers**: Server-side referral tracking (needs referral_code column + referral_count), reward fulfillment logic
