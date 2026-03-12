# Sprint 14 — Trust Explainer Card + Report Suspicious Activity

## Mission Alignment
Every ranking must earn trust through transparency. Users need to understand WHY our rankings are different from Yelp or Google. Sprint 14 adds two PRD-required features that make our anti-manipulation engine visible.

## Team Discussion

### Rahul Pitta (CEO)
"This is exactly what separates TopRanker from every other review platform. When someone looks at a score and sees 'weighted by credibility tier,' they immediately understand this isn't some manipulable number. The trust explainer card IS our sales pitch — right there on the business profile. And the Report button tells users we're serious about policing fraud."

### David Okonkwo (VP Product)
"The PRD explicitly calls for 'Report Suspicious Activity link — always visible.' This isn't something we hide in a menu. It's a constant signal: we invite scrutiny. The trust explainer card closes the gap between our algorithm and user understanding. If they can see how many weighted ratings contribute, they trust the number more."

### Elena Torres (VP Design)
"I designed the trust card with a subtle green border and shield icon. Green communicates safety and verification. The card sits between the score and the ratings to create a narrative: here's the score, here's WHY you can trust it, and here are the actual ratings. Report link is at the very bottom — always visible but not aggressive."

### James Park (Frontend Architect)
"The trust card is a pure presentational component — no extra API calls. It uses data already fetched (ratingCount, weightedScore, wouldReturn percentage). Zero performance cost. Report link uses native Alert on mobile, window.alert on web."

### Priya Sharma (Backend Architect)
"No backend changes needed for Sprint 14. The report submission is a placeholder alert for now. In Sprint N+1 we'll add a proper `/api/reports` endpoint with moderation queue. The anti-fraud detection system (6 anomaly flags) already runs server-side on every rating."

### Carlos Ruiz (QA Lead)
"Verified the trust card renders correctly with 0 ratings, 1 rating, and 100+ ratings. Report link fires on both web and native. Accessibility labels present on all interactive elements."

## Changes
- `app/business/[id].tsx`: Added "About This Ranking" trust explainer card with shield icon, explanation text, and trust stats (weighted ratings, community score, would return %)
- `app/business/[id].tsx`: Added "Report Suspicious Activity" link at bottom of business profile — always visible per PRD
- Styles: `trustCard`, `trustCardHeader`, `trustCardTitle`, `trustCardBody`, `trustCardStats`, `trustStat`, `trustStatValue`, `trustStatLabel`, `reportLink`, `reportLinkText`

## PRD Gaps Closed
- Report Suspicious Activity link — always visible
- Trust explanation visible to users
