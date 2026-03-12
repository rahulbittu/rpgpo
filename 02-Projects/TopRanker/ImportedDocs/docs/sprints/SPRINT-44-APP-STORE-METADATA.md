# Sprint 44 — App Store Metadata & Submission Preparation

## Mission Alignment
All the features we've built mean nothing if they're not in users' hands. App Store submission is the bridge between code and customers. The metadata, screenshots, description, and keywords determine discoverability and conversion. This sprint prepares everything Apple and Google need to approve and feature TopRanker.

## Team Discussion

### Rahul Pitta (CEO)
"The App Store listing is our storefront. Someone searching 'Dallas restaurants' or 'restaurant rankings' should find us and immediately understand why we're different. The subtitle — 'Trust-Weighted Restaurant Rankings' — says it all in five words. Every screenshot tells one story. Every word of the description earns its place."

### Jasmine Taylor (Marketing Director)
"App Store Optimization strategy: our primary keywords are 'restaurant rankings,' 'Dallas food,' 'restaurant reviews,' and 'trust.' Our competitive advantage in the listing is 'trust-weighted' — no other app uses this language. The screenshots follow the Apple 6.7" format with text overlays. Each screenshot highlights one feature: Rankings, Trust Score, Challenger, Rate, and Profile."

### Sofia Morales (Sr Visual Designer)
"Screenshot design spec: 1290x2796px (iPhone 6.7"). Navy top bar with amber headline text (Playfair 900). Phone mockup centered showing the actual app screen. White bottom strip with DM Sans feature description. Five screenshots: (1) Rankings with trust badges, (2) Business detail with weighted score, (3) Challenger battle card, (4) Rating flow with star selector, (5) Profile with tier progress."

### Olivia Hart (Head of Copy & Voice)
"The long description follows Apple's best practice: hook in the first line, features as benefit statements, social proof, and a mission closer. 'Stop guessing. Start trusting.' opens with the pain point. Each feature starts with what the user gets, not what we built: 'See rankings you can trust' not 'We use a weighted algorithm.'"

### Victoria Ashworth (VP of Legal)
"App Store compliance checklist: Privacy Policy URL (topranker.com/privacy), age rating 12+ (user-generated content), data collection disclosure (name, email, location, photos), no gambling elements in Challenger (it's skill/reputation-based, not chance). Apple and Google both require the Privacy Policy to be accessible via URL before submission."

### Arjun Mehta (Senior Legal Counsel)
"For India App Store (when we expand): India requires apps handling personal data to register with a Data Protection Board under DPDPA 2023 if user count exceeds threshold. We're well below this for V1. Google Play India will require a physical address in India for the store listing — we'll need a registered agent."

### David Okonkwo (VP Product)
"App Store review notes: we should proactively explain the trust score system in the review notes. Reviewers may flag it as discriminatory — we need to explain it's based on activity and consistency, not personal characteristics. Include a demo account for reviewers: reviewer@topranker.com / Review2026!"

### Carlos Ruiz (QA Lead)
"Pre-submission testing checklist completed: all screens render on iPhone SE (small), iPhone 15 Pro (standard), and iPhone 15 Pro Max (large). Tab navigation works. All modals present and dismiss correctly. Deep links route correctly. No crashes on cold start. Network error states display correctly. Rate gating works at 3 days."

## App Store Metadata

### Basic Info
- **App Name**: TopRanker
- **Subtitle**: Trust-Weighted Restaurant Rankings
- **Category**: Food & Drink (Primary), Lifestyle (Secondary)
- **Age Rating**: 12+ (Infrequent/Mild User Generated Content)
- **Price**: Free
- **In-App Purchases**: Challenger Entry ($99), Dashboard Pro ($49/mo), Featured ($199/wk)

### Keywords (100 characters max)
`restaurant rankings,dallas food,trust reviews,best restaurants,food ratings,local dining,top rated`

### Description (4000 characters max)
Stop guessing. Start trusting.

TopRanker is the first restaurant ranking app where every rating is weighted by the reviewer's credibility. No more fake reviews. No more pay-to-play. Just honest rankings shaped by people who actually know their city's food.

TRUST-WEIGHTED RANKINGS
Not all opinions are equal. TopRanker's proprietary algorithm weights each rating by the reviewer's credibility tier — from Community to Top Ranker. Consistent, honest reviewers have more influence. The result? Rankings that reflect real quality, not manipulation.

EARN YOUR VOICE
Start as a Community member and climb through four credibility tiers: Community, City, Trusted, and Top Ranker. Rate honestly and consistently to increase your influence. Your credibility grows with every thoughtful review.

LIVE CHALLENGER BATTLES
Watch restaurants compete in 30-day head-to-head challenges. Your weighted vote decides the winner. Follow the drama, share the results, and shape your city's dining scene in real-time.

YOUR IMPACT MATTERS
See exactly how your ratings move the rankings. Track your credibility growth, rating history, and community impact. Every voice counts — especially yours.

BUSINESS OWNERS WELCOME
Claim your listing, access analytics, respond to ratings, and see how your business ranks. Dashboard Pro ($49/mo) unlocks advanced insights and verified owner status.

Currently serving Dallas, TX — expanding soon.

Built by the community. Trusted by the community.

### Promotional Text (170 characters)
Live Challenger battles are here! Watch Dallas's best restaurants compete head-to-head. Your trust-weighted vote decides the winner. Rate now.

### What's New (V1.0.0)
Welcome to TopRanker! The first trust-weighted restaurant ranking app.

- Trust-weighted rankings powered by reviewer credibility
- Four credibility tiers: Community, City, Trusted, Top Ranker
- Live 30-day Challenger battles between restaurants
- Near Me discovery with GPS-based distance sorting
- Business owner dashboards with analytics
- Share challenge results as beautiful image cards
- Cinematic splash screen and celebration animations

### Review Notes
TopRanker uses a trust-weighted ranking system where each user's rating is weighted by their algorithmic credibility tier. This tier is based on activity, consistency, and account age — NOT personal characteristics.

Demo account: reviewer@topranker.com / Review2026!

The app requires network access for ratings and rankings. Mock data is served as fallback if the server is unreachable.

### Privacy URL
https://topranker.com/privacy

### Support URL
https://topranker.com/support

### Marketing URL
https://topranker.com

## Screenshot Descriptions
1. "Rankings you can trust" — Leaderboard with trust badges and weighted scores
2. "Every detail matters" — Business page with score breakdown and ratings
3. "Head-to-head battles" — Challenger card with vote bars and countdown
4. "Your voice, weighted" — Rating flow with star selector and review
5. "Track your impact" — Profile with tier progress and rating history

## Google Play Specific
- **Short Description (80 chars)**: Trust-weighted restaurant rankings. Real reviews from real locals.
- **Feature Graphic**: 1024x500, navy background, TopRanker logo, amber "Trust the rankings" text
- **Content Rating**: IARC — Everyone

## Changes
- `docs/SPRINT-44-APP-STORE-METADATA.md` (NEW): Complete App Store metadata document
  - App name, subtitle, keywords, description
  - Screenshot specs and descriptions
  - Review notes with demo account
  - Google Play specific metadata
  - Legal compliance checklist

## Employee Performance

| Employee | Role | Contribution | Rating |
|----------|------|-------------|--------|
| Jasmine Taylor | Marketing Director | ASO keyword strategy, screenshot sequencing, description structure | A+ |
| Olivia Hart | Head of Copy & Voice | App Store description, promotional text, What's New | A+ |
| Sofia Morales | Sr Visual Designer | Screenshot design spec (1290x2796), feature graphic spec | A |
| Victoria Ashworth | VP of Legal | App Store compliance checklist, age rating, privacy URL | A |
| Arjun Mehta | Senior Legal Counsel | India App Store requirements, data protection board registration | A |
| David Okonkwo | VP Product | Review notes strategy, demo account, trust score explanation | A |
| Carlos Ruiz | QA Lead | Pre-submission device testing across 3 iPhone sizes | A |

## Sprint Velocity
- **Story Points Completed**: 3
- **Files Modified**: 1 (new doc)
- **Lines Changed**: ~150
- **Time to Complete**: 0.5 days
- **Blockers**: Screenshot image generation (Sofia's deliverable), Apple Developer account enrollment ($99/year), demo account creation on production server
