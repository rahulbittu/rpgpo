# Sprint 34 — Email Drip Sequence

## Mission Alignment
Retention is trust earned over time. The email drip sequence guides new users through their first 30 days on TopRanker — from exploration to rating to credibility building. Each email arrives at the exact moment it's most useful, creating a sense of progression and investment.

## Team Discussion

### Rahul Pitta (CEO)
"The drip sequence is our invisible hand guiding users from signup to power user. Day 2: 'explore your neighborhood.' Day 3: 'you can rate now!' Day 7: 'your first week stats.' Each email has one job: bring them back to the app. The Day 30 email celebrating their impact — that's how you create lifers."

### Chris Donovan (Ad Campaigns Manager)
"Email engagement is our cheapest re-engagement channel. Industry benchmarks: 20% open rate, 3% click rate. With our personalization (first name, city, tier, stats), we should hit 35%+ open rates. The Day 3 'unlock' email will have the highest CTR — users are waiting for it."

### Olivia Hart (Head of Copy & Voice)
"Every email follows the TopRanker voice: warm, empowering, specific. 'Your voice is unlocked' not 'You can now rate.' 'You've been shaping Dallas's rankings' not 'You rated some businesses.' 'Thank you for being part of the trust movement' — that's not just copy, it's a mission statement."

### Jasmine Taylor (Marketing Director)
"The 5-email drip sequence covers the critical 30-day retention window. Email timing aligns with user milestones: Day 2 (exploration), Day 3 (unlock), Day 7 (first week), Day 14 (challenges), Day 30 (celebration). After Day 30, we transition to the weekly newsletter."

### Rachel Wei (CFO)
"Email is our highest-ROI channel. Cost per email: ~$0.001 with Resend. If the drip sequence improves 30-day retention by just 5%, that's 17 more active users per 342 signups. At our projected LTV of $12/user, that's $204/mo in retained value for $0.34 in email costs."

### Priya Sharma (Backend Architect)
"The drip emails will be triggered by a daily cron job that checks user signup dates. For now, the functions are ready to be called. Each function is independent — they can be triggered from any scheduler: node-cron, cloud functions, or a job queue."

### Carlos Ruiz (QA Led)
"Verified: All 5 email functions generate valid HTML. Templates render correctly in browser. Brand header and footer are consistent across all emails. Personalization tokens (first name, city, stats) populate correctly. TypeScript clean."

## Changes
- `server/email-drip.ts` (NEW): 5-email drip sequence
  - `sendDay2Email()`: "Top 5 near you" — neighborhood exploration
  - `sendDay3Email()`: "Your voice is unlocked!" — rating unlock celebration
  - `sendDay7Email()`: "Your first week" — stats (ratings count, businesses rated)
  - `sendDay14Email()`: "Live challenges" — Challenger tab promotion
  - `sendDay30Email()`: "One month on TopRanker" — celebration with stats
  - All emails use brand template (navy header, amber accents, warm white)
  - Pluggable delivery (console log for now, Resend/SendGrid ready)

## Employee Performance

| Employee | Role | Contribution | Rating |
|----------|------|-------------|--------|
| Olivia Hart | Head of Copy & Voice | All email copy, voice consistency, milestone messaging | A+ |
| Jasmine Taylor | Marketing Director | Drip sequence timing, milestone alignment | A |
| Chris Donovan | Ad Campaigns Manager | Open rate projections, CTR optimization | A |
| Priya Sharma | Backend Architect | Email function architecture, scheduler spec | A |
| Rachel Wei | CFO | Email ROI analysis, retention modeling | A |
| Carlos Ruiz | QA Lead | HTML template verification, personalization testing | A |

## Sprint Velocity
- **Story Points Completed**: 5
- **Files Modified**: 1 (new)
- **Lines Changed**: ~170
- **Time to Complete**: 0.5 days
- **Blockers**: Email provider (Resend/SendGrid) and cron scheduler needed for production

## PRD Gaps Closed
- Email drip sequence (5 emails over 30 days)
