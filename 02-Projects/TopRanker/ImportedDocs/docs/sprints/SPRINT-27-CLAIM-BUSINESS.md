# Sprint 27 — Business Owner Claim Listing

## Mission Alignment
Trust is bilateral — users trust our rankings, AND businesses trust our platform. The Claim Business flow is the first step toward the Business Owner Dashboard. Verified owners get a badge, analytics, and review response tools. This is also the gateway to our $49/mo Business Dashboard Pro revenue stream.

## Team Discussion

### Rahul Pitta (CEO)
"Every restaurant owner in Dallas should want to claim their TopRanker listing. The verified badge tells diners 'this business takes their reputation seriously.' And once they're in the dashboard, we upsell them to Pro ($49/mo) and Challenger entries ($99). This is our B2B revenue engine."

### Rachel Wei (CFO)
"Claim-to-dashboard is our B2B conversion funnel. Free claim → verified badge → Pro dashboard ($49/mo) → Challenger entry ($99). If 10% of the 50 Dallas restaurants claim, that's 5 businesses. At $49/mo Pro + one Challenger entry, that's ~$3,500/yr from just 5 businesses. Scale to 500 businesses across Texas — that's $350K/yr."

### Ben Kowalski (Partnerships)
"I'll reach out to restaurant owners directly once this is live. The claim flow is clean — owner submits role + phone, we verify in 48 hours. The benefits card (analytics, review responses, verified badge) is exactly what I need to pitch. Owners care about data and reputation control."

### Jordan Blake (Head of Compliance)
"The verification process is critical — we need to confirm the claimant actually works at the business. Email domain matching is first pass, phone verification is backup. We should never auto-approve claims. The 48-hour review window gives us time for manual verification."

### James Park (Frontend Architect)
"Created `/app/business/claim.tsx` with Expo Router. Three states: sign-in required, claim form, and success confirmation. The form collects role and optional phone. The 'Own this business? Claim it' link sits at the bottom of the business profile — discoverable but not intrusive. Amber color makes it stand out from the gray report link."

### Elena Torres (VP Design)
"The claim page follows our form pattern: Playfair header, DM Sans body, rounded surface cards. The benefits card with amber icons creates immediate value proposition. The success state mirrors our signup welcome pattern — green checkmark, confirmation text, CTA back to business."

### Carlos Ruiz (QA Lead)
"Verified: Claim link appears on business profile. Tapping navigates to claim screen with correct business name. Form validates role is required. Success state shows after submit. Back navigation works. Not-logged-in state shows sign-in prompt. TypeScript clean across both files."

### Nadia Kaur (Cybersecurity Lead)
"The claim submission should eventually use a server-side endpoint with rate limiting to prevent claim spam. For now, it logs to console — acceptable for MVP. The verification email should go to a separate admin queue, not auto-approve. We need human review to prevent fraudulent claims."

## Changes

### New File
- `app/business/claim.tsx`: Full claim flow with 3 states
  - Auth guard (sign in required)
  - Claim form: role (required), phone (optional), benefits preview
  - Success state: green checkmark, 48-hour review messaging
  - Benefits card: analytics, review responses, verified badge, ranking tracking, Challenger entry
  - Verification info card: email domain matching + phone verification

### Modified File
- `app/business/[id].tsx`:
  - Added "Own this business? Claim it" link at bottom of profile
  - Amber text + shield icon, navigates to `/business/claim` with name/slug params
  - Styles: `claimLink`, `claimLinkText`

## Employee Performance

| Employee | Role | Contribution | Rating |
|----------|------|-------------|--------|
| James Park | Frontend Architect | Claim screen implementation, 3-state flow, routing | A+ |
| Elena Torres | VP Design | Claim page design, benefits card, success state | A |
| Ben Kowalski | Partnerships | Business owner pitch strategy, benefits spec | A |
| Rachel Wei | CFO | B2B revenue funnel modeling (claim → Pro → Challenger) | A |
| Jordan Blake | Head of Compliance | Verification process design, 48-hour review window | A |
| Nadia Kaur | Cybersecurity Lead | Anti-fraud claim review process spec | A |
| Carlos Ruiz | QA Lead | 3-state flow testing, navigation, form validation | A |

## Sprint Velocity
- **Story Points Completed**: 13
- **Files Modified**: 2 (1 new)
- **Lines Changed**: ~200
- **Time to Complete**: 1 day
- **Blockers**: Backend claim API endpoint (POST /api/business/claim) — to be built in future sprint

## PRD Gaps Closed
- Business owner claim listing flow (UI complete, backend API pending)
- "Own this business?" link on business profile
