# Sprint 30 — Stripe Payments & Challenger Entry Fee

## Mission Alignment
Revenue enables mission. The $99 Challenger entry fee is TopRanker's first revenue stream — it funds the trust infrastructure we're building. The payment flow must be premium, transparent, and trustworthy. Users paying $99 need to feel they're getting real value: 30 days of featured exposure, community engagement, and a fair shot at the #1 spot.

## Team Discussion

### Rahul Pitta (CEO)
"This is the moment TopRanker becomes a business, not just a product. The $99 entry fee funds everything — servers, team, marketing. But the flow has to feel premium. When a restaurant owner pays $99, they should feel like they're entering the arena, not filing a form. The hero card with the big '$99' in Playfair 900 — that's how you sell confidence."

### Rachel Wei (CFO)
"Revenue model activated. Challenger entry ($99) × 10 challenges/month = $990/mo from day one. With Business Pro ($49/mo) and Featured Placement ($199/week) also coded, we have three revenue streams ready to deploy. The mock payment mode lets us test the full flow without Stripe keys — we'll go live when we have a business bank account."

### Marcus Chen (CTO)
"The `server/payments.ts` module uses a dual-mode architecture: if `STRIPE_SECRET_KEY` is set, it calls Stripe's API. If not, it returns a mock success. This means the frontend works identically in dev and production. Zero code changes to go live — just add the env var."

### Priya Sharma (Backend Architect)
"Three payment functions: `createChallengerPayment` ($99), `createDashboardProPayment` ($49/mo), `createFeaturedPlacementPayment` ($199/week). Each includes typed metadata (type, businessId, userId) for reconciliation. All amounts in cents per Stripe convention."

### James Park (Frontend Architect)
"The payment screen has a navy gradient hero card with the price, a 3-step 'How It Works' section, benefits list, price breakdown, and a golden 'Pay $99' CTA. The security badge ('Secured by Stripe') and disclaimer build trust. Three states: auth guard, payment form, success confirmation."

### Olivia Hart (Head of Copy & Voice)
"Every word on the payment page serves a purpose. 'Enter Challenge' not 'Buy Challenge' — they're entering an arena. 'Community-weighted votes' — reinforces fairness. 'Your payment info is never stored on our servers' — security reassurance. 'Results cannot be influenced by payment' — the most important line on the page."

### Nadia Kaur (Cybersecurity Lead)
"Payment data never touches our servers — Stripe handles all PCI compliance. The mock mode returns a fake `pi_` ID that's clearly not a real payment. In production, we'll add webhook verification to confirm payment status server-side before activating the challenge."

### Elena Torres (VP Design)
"The payment hero card is our most premium design surface. Navy-to-dark gradient, the '$99' in Playfair 900 at 48px in amber — it looks like a luxury receipt. The amber CTA button is deliberately different from our navy CTAs — golden means 'pay,' navy means 'navigate.' This color coding prevents accidental purchases."

### Carlos Ruiz (QA Lead)
"Verified: Payment screen loads with correct business name from params. Auth guard redirects to login. Processing state shows 'Processing...' with disabled button. Success state shows flash icon and 'View Live Challenges' CTA. Mock payment completes in 1.5s. TypeScript clean across frontend and backend."

### Ben Kowalski (Partnerships)
"This is the pitch closer. When I talk to restaurant owners: 'For $99, you get 30 days of featured placement, community engagement, and a shot at dethroning the #1. If you win, you get a winner badge forever.' The payment page visualizes exactly what I tell them."

## Changes

### Backend
- `server/payments.ts` (NEW): Pluggable payment service
  - `createPaymentIntent()`: Stripe in production, mock in development
  - `createChallengerPayment()`: $99.00 Challenger entry
  - `createDashboardProPayment()`: $49.00/mo Business Dashboard Pro
  - `createFeaturedPlacementPayment()`: $199.00/week Featured Placement
  - Typed metadata for reconciliation

### Frontend
- `app/business/enter-challenger.tsx` (NEW): Full payment flow
  - Auth guard state
  - Navy gradient hero card with $99 price in Playfair 900
  - "How It Works" 3-step explainer
  - Benefits list (5 items with amber icons)
  - Price breakdown card
  - Golden "Pay $99" CTA button
  - Security badge ("Secured by Stripe")
  - Trust disclaimer
  - Success state with flash icon
- `app/_layout.tsx`: Added `business/enter-challenger` Stack.Screen

## Employee Performance

| Employee | Role | Contribution | Rating |
|----------|------|-------------|--------|
| James Park | Frontend Architect | Payment screen UI, 3-state flow, hero card | A+ |
| Priya Sharma | Backend Architect | Payment service module, Stripe integration architecture | A+ |
| Rachel Wei | CFO | Revenue model activation, three-stream pricing | A |
| Olivia Hart | Head of Copy & Voice | Payment page copy, trust messaging | A+ |
| Elena Torres | VP Design | Hero card design, amber CTA color coding | A |
| Nadia Kaur | Cybersecurity Lead | PCI compliance review, webhook spec | A |
| Ben Kowalski | Partnerships | Business pitch alignment, value proposition | A |
| Carlos Ruiz | QA Lead | Payment flow testing, mock payment verification | A |

## Sprint Velocity
- **Story Points Completed**: 13
- **Files Modified**: 2 (2 new)
- **Lines Changed**: ~300
- **Time to Complete**: 1 day
- **Blockers**: Stripe API key needed for production (set STRIPE_SECRET_KEY env var)

## Revenue Impact
- **Challenger Entry**: $99/challenge × est. 10/mo = $990/mo
- **Business Pro**: $49/mo × est. 5 businesses = $245/mo
- **Featured Placement**: $199/week × est. 2/week = $1,592/mo
- **Projected Monthly Revenue**: ~$2,827/mo at launch scale

## PRD Gaps Closed
- Stripe payments for Challenger entry fee ($99)
- Payment service supporting all three revenue streams
