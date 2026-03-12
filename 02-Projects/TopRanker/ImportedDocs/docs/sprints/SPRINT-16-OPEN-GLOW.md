# Sprint 16 — OPEN Badge Glow Effect

## Mission Alignment
TopRanker must feel like a live, premium platform — not a static directory. The OPEN badge with a green glow creates an immediate "this is happening NOW" signal. Real-time status is a trust signal: we know if this place is open right now.

## Team Discussion

### Rahul Pitta (CEO)
"When I open DoorDash, I immediately see what's open. When I open Yelp, I have to dig. We show OPEN status everywhere — on leaderboard cards, discover cards, hero card, and the business profile. The glow makes it impossible to miss."

### Elena Torres (VP Design)
"The PRD says 'OPEN badge: green with subtle glow effect.' I implemented this as a CSS box-shadow with green color, 0.4 opacity, 4px radius on cards and 6px on the hero. On the business profile, I upgraded from plain text to a proper badge with a green dot indicator + glow. Subtle but premium."

### Mei Lin (Mobile Architect)
"Shadow-based glow renders natively on iOS via `shadowColor`/`shadowOpacity`. On Android, we use `elevation` as a fallback — the glow won't be identical but the green badge is still clearly visible. On web, CSS box-shadow handles it perfectly."

### James Park (Frontend Architect)
"Applied consistently across 4 surfaces: hero card OPEN pill, ranked card status pill, discover card status pill, and business profile OPEN badge. Each uses the same green glow pattern but with size-appropriate shadow radius."

### Carlos Ruiz (QA Lead)
"TypeScript clean. Visual verification pending on Replit deployment."

## Changes
- `app/business/[id].tsx`: Upgraded OPEN text to badge with green dot + glow shadow
- `app/(tabs)/index.tsx`: Hero OPEN pill and ranked card OPEN pill — green glow shadow
- `app/(tabs)/search.tsx`: Discover card OPEN pill — green glow shadow
- New styles: `openBadge`, `openBadgeOpen`, `openBadgeClosed`, `openDot`, `openBadgeText`

## PRD Gaps Closed
- "OPEN badge: green with subtle glow effect"
