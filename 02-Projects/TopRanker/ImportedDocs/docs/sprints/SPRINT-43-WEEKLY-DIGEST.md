# Sprint 43 — Weekly Email Digest System

## Mission Alignment
The weekly digest is our primary retention email. It answers: "What happened on TopRanker this week?" Every Monday, users see their personal stats, ranking movements, live challenges, and new businesses. It creates a habit loop — users start expecting it, looking forward to it, and opening the app because of it.

## Team Discussion

### Rahul Pitta (CEO)
"The weekly digest is the email I want to open myself. My rating count, my tier progress, the biggest movers in Dallas, live Challenger battles. It should feel like a sports recap — who moved up, who moved down, what's happening this week. This is the email that turns occasional users into weekly users."

### Jasmine Taylor (Marketing Director)
"Weekly digest benchmarks: 25-30% open rate for personalized weekly emails in the restaurant/local category. Our subject line includes an emoji, the word 'Your' (personalization), and the city name. The 9 AM Monday send time catches the 'planning my week' mindset. We expect this to be our highest-performing recurring email."

### Chris Donovan (Ad Campaigns Manager)
"The digest doubles as a re-engagement tool. Users who haven't opened the app in 7 days still get the digest — it shows them what they're missing. The 'Open TopRanker' CTA button uses amber with white text, 24px radius. A/B test planned: CTA text 'Open TopRanker' vs 'See Your Rankings' vs 'What Changed This Week.'"

### Olivia Hart (Head of Copy & Voice)
"The greeting is 'Hey [Name]' with a wave emoji — warm and personal, not corporate. Stat cards use big numbers with tiny labels underneath. Ranking movers use green/red arrows — instant visual comprehension. Challenge rows show 'vs' battles with percent splits. New businesses use bullet points. Every section earns its space."

### Priya Sharma (Backend Architect)
"The `sendAllWeeklyDigests` function takes a data provider callback — it's decoupled from the database layer. In production, the cron job will call it with a function that queries active users, aggregates their weekly stats, and fetches city-level ranking changes. The batch sender processes sequentially to respect email API rate limits."

### Rachel Wei (CFO)
"Email retention directly impacts LTV. If the weekly digest improves weekly active retention by 5% (from 40% to 45%), that's 17 additional active users per month. At $12 projected LTV, that's $204/month in retained value. Email cost: $0.003 per email with Resend. ROI: ~60,000%."

### Victoria Ashworth (VP of Legal)
"The footer includes both 'Manage preferences' and 'Unsubscribe' links — required by CAN-SPAM (US), GDPR, and India's DPDPA. Manage preferences links to the in-app settings. Unsubscribe is a one-click opt-out. We must honor unsubscribe requests within 10 business days (CAN-SPAM requirement, though we should do it instantly)."

### Carlos Ruiz (QA Lead)
"Verified: Weekly digest HTML renders correctly in browser and email clients (Gmail, Apple Mail, Outlook tested). Stat cards display with correct tier colors. Ranking mover arrows show green/red correctly. Challenge rows render with percent splits. Footer unsubscribe link present. Personalization tokens populate correctly. TypeScript clean."

## Changes
- `server/email-weekly.ts` (NEW): Weekly digest email system
  - `sendWeeklyDigest()`: Send personalized digest to one user
  - `sendAllWeeklyDigests()`: Batch sender with error handling
  - `generateDigestHtml()`: Branded HTML template with:
    - Personal stats: ratings this week, total ratings, tier + progress bar
    - Top 5 ranking movers with direction arrows
    - Up to 3 live Challenger battles with vote splits
    - Up to 3 new businesses
    - "Open TopRanker" amber CTA button
    - Footer with manage preferences + unsubscribe links
  - Pluggable via `sendEmail()` from email.ts

## Employee Performance

| Employee | Role | Contribution | Rating |
|----------|------|-------------|--------|
| Olivia Hart | Head of Copy & Voice | Digest copy, greeting tone, section hierarchy | A+ |
| Jasmine Taylor | Marketing Director | Send timing strategy, open rate benchmarks, A/B plan | A |
| Chris Donovan | Ad Campaigns Manager | Re-engagement strategy, CTA optimization | A |
| Priya Sharma | Backend Architect | Batch sender architecture, data provider pattern | A |
| Rachel Wei | CFO | Email retention ROI analysis | A |
| Victoria Ashworth | VP of Legal | CAN-SPAM/GDPR/DPDPA footer compliance | A |
| Carlos Ruiz | QA Lead | Cross-client HTML rendering verification | A |

## Sprint Velocity
- **Story Points Completed**: 5
- **Files Modified**: 1 (new)
- **Lines Changed**: ~200
- **Time to Complete**: 0.5 days
- **Blockers**: Cron job scheduler for Monday 9 AM sends; user data aggregation query
