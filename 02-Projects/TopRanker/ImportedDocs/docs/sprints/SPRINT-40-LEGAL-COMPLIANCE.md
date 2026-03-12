# Sprint 40 — Privacy & Legal Compliance

## Mission Alignment
Trust is our product — and trust starts with how we handle user data. TopRanker's trust score system is a first-of-its-kind credibility algorithm that we plan to scale across 13 apps globally. Getting the legal foundation right now — in Dallas, before India and global expansion — means we can move fast later without legal debt. This sprint is Victoria and Arjun's first major deliverable.

## Team Discussion

### Rahul Pitta (CEO)
"The trust score is TopRanker's backbone, but it's also our biggest legal surface area. We're not just rating restaurants — we're assigning algorithmic credibility to users. That's powerful, and it needs to be legally bulletproof. Victoria and Arjun: I need these Terms and Privacy Policy to hold up in Dallas, Mumbai, and everywhere we expand. This is day one of a 13-app legal foundation."

### Victoria Ashworth (VP of Legal)
"Three critical legal protections in this sprint. First, the Terms explicitly define Trust Scores as 'algorithmic opinions, not statements of fact' — this gives us Section 230 protection in the US and fair comment defense globally. Second, the Privacy Policy covers DPDPA 2023 compliance for India (right to erasure, grievance officer, 30-day response time). Third, the consent checkbox on signup creates an affirmative consent record — required under GDPR and best practice everywhere."

### Arjun Mehta (Senior Legal Counsel)
"For India expansion, we need three things: a designated Grievance Officer (I'll serve in this role), a Privacy Policy accessible in-app (not just a website link — DPDPA requirement), and compliance with the IT Rules 2021 intermediary guidelines. The Privacy Policy names me as India Grievance Officer with a dedicated email (india-privacy@topranker.com). We've also addressed cross-border data transfers — India's DPDPA allows transfers to non-restricted countries, and the US is currently not restricted."

### Marcus Chen (CTO)
"The legal screens are Expo Router screens at `/legal/terms` and `/legal/privacy`, registered as Stack routes. The signup flow now requires an explicit consent checkbox before account creation. The consent check happens client-side before the API call, so the server never receives a signup request without consent. We store the consent timestamp server-side (to be added to the users table)."

### James Park (Frontend Architect)
"Both legal screens use a consistent structure: back button, title, scrollable sections. The consent checkbox on signup uses Ionicons checkbox/square-outline with amber brand color for checked state. The Terms/Privacy links in the consent text are tappable and navigate directly to the legal screens. Profile now has a legal section between admin link and delete account."

### Olivia Hart (Head of Copy & Voice)
"Legal copy is usually cold and hostile. We kept it clear and honest while still being legally precise. 'Your Trust Score is not a measure of personal trustworthiness outside the App' — that's both legally protective and respectful to users. The Business Owner section explicitly says 'may NOT incentivize or coerce' — firm but not aggressive. Victoria and I worked together on every sentence."

### Jordan Blake (Head of Compliance)
"This sprint closes our biggest App Store compliance gap. Apple requires: Terms of Service, Privacy Policy accessible in-app, explicit consent at signup, and account deletion capability. We already had delete (Sprint 19). Now we have all four. Google Play requires the same plus a link to the Privacy Policy in the store listing — ready for submission."

### Carlos Ruiz (QA Lead)
"Verified: Both legal screens render all sections correctly with proper scrolling. Consent checkbox toggles correctly, blocks signup when unchecked with clear error message. Terms and Privacy links in consent text navigate to correct screens. Profile legal links navigate correctly. Back navigation works from all legal screens. TypeScript clean."

## Changes
- `app/legal/terms.tsx` (NEW): Terms of Service — 13 sections
  - Trust Score algorithmic opinion defense (Section 230 / fair comment)
  - Business owner rights and restrictions
  - Challenger non-refundable terms
  - Payment terms (Stripe, subscriptions)
  - Prohibited conduct (anti-manipulation)
  - Governing law: Texas + India + GDPR provisions
- `app/legal/privacy.tsx` (NEW): Privacy Policy — 12 sections
  - Data collection (account, rating, usage, location, device, push tokens)
  - Trust Score data transparency
  - No data sales commitment
  - Data retention policies (30-day deletion, anonymized ratings)
  - User rights: CCPA, DPDPA 2023, GDPR
  - International data transfers (SCCs for EU, DPDPA compliance for India)
  - India Grievance Officer: Arjun Mehta
  - DPO: Victoria Ashworth
- `app/auth/signup.tsx` (MODIFIED): Consent checkbox
  - "I agree to Terms of Service and Privacy Policy" checkbox
  - Blocks signup if unchecked
  - Tappable links to legal screens
- `app/(tabs)/profile.tsx` (MODIFIED): Legal links section
  - Terms of Service and Privacy Policy links
- `app/_layout.tsx` (MODIFIED): Added legal/terms and legal/privacy Stack routes

## Employee Performance

| Employee | Role | Contribution | Rating |
|----------|------|-------------|--------|
| Victoria Ashworth | VP of Legal | Terms of Service drafting, Section 230 defense strategy, GDPR/DPDPA compliance | A+ |
| Arjun Mehta | Senior Legal Counsel | India DPDPA compliance, Grievance Officer designation, cross-border transfer analysis | A+ |
| James Park | Frontend Architect | Legal screen components, consent checkbox, profile links | A |
| Marcus Chen | CTO | Legal route architecture, consent flow design | A |
| Olivia Hart | Head of Copy & Voice | Legal copy voice — clear, honest, legally precise | A |
| Jordan Blake | Head of Compliance | App Store compliance audit, submission readiness | A |
| Carlos Ruiz | QA Lead | Legal screen QA, consent flow testing, navigation verification | A |

## Sprint Velocity
- **Story Points Completed**: 8
- **Files Modified**: 5 (2 new, 3 modified)
- **Lines Changed**: ~500
- **Time to Complete**: 0.5 days
- **Blockers**: Server-side consent timestamp storage (users table migration); India entity registration for Grievance Officer role

## Legal Notes (from Victoria Ashworth)
1. Trust Score as "algorithmic opinion" is the strongest defense under US law. Yelp and Google Reviews use similar framing.
2. India's DPDPA 2023 requires a Consent Manager registration once we exceed thresholds (100 crore data principals). We're well below this for now.
3. The Privacy Policy must be translated to local languages for India expansion (Hindi minimum). Planned for Sprint 45+.
4. Cross-border data transfers from India are currently unrestricted to the US, but this could change with future government notifications. We should plan for data localization.
