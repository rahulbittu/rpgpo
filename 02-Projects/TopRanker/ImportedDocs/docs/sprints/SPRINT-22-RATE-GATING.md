# Sprint 22 — Rate Gating (3-Day Active Requirement)

## Mission Alignment
Trust requires earned credibility. Rate gating prevents drive-by spam accounts from flooding our rankings. By requiring 3+ days of active membership before rating, we ensure that only committed community members influence business scores — this is anti-fraud 101.

## Team Discussion

### Rahul Pitta (CEO)
"If you can rate on day one, spam rings can flood us with fake reviews in hours. The 3-day gate is the sweet spot — short enough that real users aren't frustrated, long enough that spam bots can't blast us. Combined with low initial credibility weight, we're protected without punishing genuine users."

### Nadia Kaur (Cybersecurity Lead)
"The 3-day rating gate plus 0.10x community tier weight means spam accounts are nearly powerless. A coordinated attack needs to: (1) create accounts, (2) wait 3 days, (3) maintain active status, (4) still only get 0.10x weight. The credibility tier system is the real defense — the gate is just the first barrier."

### Jordan Blake (Head of Compliance)
"Rate gating also helps with content moderation. The 3-day window gives us time to detect problematic patterns before users can submit ratings. It's a compliance buffer without being overly restrictive."

### Priya Sharma (Backend Architect)
"The `daysActive` field comes from the member profile endpoint — already cached by React Query. No additional API calls needed. The server computes daysActive from the account creation date and login frequency. Future enhancement: we could make the gate dynamic based on risk signals."

### James Park (Frontend Architect)
"Rate gating checks `profile.daysActive >= 3` before showing the Rate button. If gated, users see a friendly message: 'Build your reviewer credibility to rate this business' with a countdown: 'X more days active to unlock rating.' Three days is short enough that users stay engaged."

### Derek Chan (UI/UX Designer)
"The gated state uses muted styling — gray text with a subtle border. It doesn't feel like an error, it feels like a milestone to unlock. The countdown creates anticipation: 'You're 3 days away from rating.' This gamifies the wait period."

### Carlos Ruiz (QA Lead)
"Tested with demo profile (daysActive: 42) — rate button shows normally. Modified mock to daysActive: 1 — gating message appears correctly with '2 more days' countdown. Edge case: daysActive exactly 3 — rate button unlocks. TypeScript clean."

### Aisha Fernandez (Community Manager)
"We'll message new users about the 3-day unlock in the welcome flow. 'Your voice matters — explore TopRanker for a few days, then share your expertise.' Three days feels achievable — users won't abandon the app waiting."

## Changes
- `app/business/[id].tsx`: Rate button gated to 3+ days active
- Added `fetchMemberProfile` import and query
- Member profile query: `useQuery({ queryKey: ["profile", user?.id], queryFn: fetchMemberProfile })`
- Gating logic: `const canRate = (profile?.daysActive ?? 0) >= 3`
- Gated UI: "Build your reviewer credibility to rate this business" + "X more days active to unlock rating"
- Styles: `rateGated`, `rateGatedText`, `rateGatedSubtext`

## Employee Performance

| Employee | Role | Contribution | Rating |
|----------|------|-------------|--------|
| James Park | Frontend Architect | Implemented gating logic, React Query integration | A |
| Priya Sharma | Backend Architect | daysActive field design, caching strategy | A |
| Derek Chan | UI/UX Designer | Gated state design, countdown UX, milestone framing | A |
| Nadia Kaur | Cybersecurity Lead | Anti-spam strategy, defense-in-depth analysis | A+ |
| Carlos Ruiz | QA Lead | Edge case testing, mock data verification | A |
| Aisha Fernandez | Community Manager | User messaging strategy for gated users | A- |
| Jordan Blake | Head of Compliance | Compliance buffer analysis, policy implications | A |

## Sprint Velocity
- **Story Points Completed**: 8
- **Files Modified**: 1
- **Lines Changed**: ~40
- **Time to Complete**: 0.5 days
- **Blockers**: None

## PRD Gaps Closed
- "Rate This Place" gating — active after 3+ days (reduced from 7 per CEO direction)
