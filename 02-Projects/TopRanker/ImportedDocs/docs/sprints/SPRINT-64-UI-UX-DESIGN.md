# Sprint 64 — UI/UX Design Sprint: Splash, Favicon, Brand Identity

## Mission Alignment
Sprint 64 is a design-focused sprint responding to CEO feedback: "UI/UX is looking very old, splash screen is laughable, no custom favicons despite having a design team." This sprint upgrades the visual identity across every touchpoint: animated splash screen, web favicon, app metadata, onboarding, and platform config. The brand system (Amber #C49A1A, Navy #0D1B2A, Playfair Display, DM Sans) must be consistently applied everywhere — not just in the main app, but in splash screens, favicons, and meta tags.

## Backlog Refinement (Pre-Sprint)
**Attendees**: Rahul (CEO), Marcus (CTO), James (Frontend), Suki (Design Lead), Carlos (QA)

**Selected**:
- Animated splash screen overhaul (3 pts)
- Custom SVG favicon + web metadata (2 pts)
- Onboarding visual upgrade (1 pt)
- Platform config alignment (navy backgrounds) (1 pt)

**Total**: 7 story points

## Team Discussion

### Rahul Pitta (CEO)
"This is embarrassing. We have a full brand system — amber, navy, Playfair Display, the LeaderboardMark SVG logo — and the splash screen is using a 👑 emoji? The favicon is the default blue Expo chevron? The splash background is cream (#F7F6F3) when it should be navy (#0D1B2A)? The design team needs to own every pixel. No more generic assets."

### Suki (Design Lead)
"I take full responsibility. The splash screen was a placeholder from Sprint 42 that never got updated. Here's what we changed:

1. **Animated splash**: Replaced the emoji crown with the actual `LeaderboardMark` SVG component. Added 'TOP' wordmark above 'Ranker' for hierarchy. Logo is now white on navy with amber accent — matches our brand guidelines. Tagline uses `BRAND.tagline` instead of hardcoded text. Changed 'Dallas, TX' to 'Texas' since we're multi-city.

2. **Favicon**: Created an SVG favicon with the LeaderboardMark on a navy (#0D1B2A) rounded rectangle. SVG favicons are supported by all modern browsers and stay crisp at any size. Added as primary with PNG fallback.

3. **Web metadata**: Updated title to 'TopRanker - Trust-Weighted Restaurant Rankings'. Description is now multi-city focused. Theme color changed from amber to navy for browser chrome. OG tags updated.

4. **Platform config**: Splash background → navy. Android adaptive icon background → navy. Consistent dark brand identity across all platform integration points."

### James Park (Frontend Architect)
"The onboarding screen got a subtle upgrade too — the first slide now uses the `LeaderboardMark` SVG instead of the 👑 emoji, wrapped in a gradient circle. This creates visual consistency: the first thing users see in the splash is the mark, and it reappears in onboarding. Brand recognition starts at first launch."

### Marcus Chen (CTO)
"The `+html.tsx` changes are important for SEO and link previews. When someone shares a TopRanker link on Slack, Twitter, or iMessage, the OG tags now show our actual brand messaging instead of 'Dallas Restaurant Rankings.' The SVG favicon shows the mark at any resolution — no more pixelated 16x16 PNGs."

### Carlos Ruiz (QA Lead)
"114 tests pass. Zero TypeScript errors. The changes are visual-only — no logic changes. I verified the SVG favicon renders correctly, the splash animation plays with the new components, and the onboarding shows the mark on slide 1."

### Nadia Kaur (VP Security)
"No security implications. The meta tag changes are cosmetic. The SVG favicon is static and doesn't introduce any XSS surface."

## Changes

### New Files
- `assets/images/favicon.svg` — Custom SVG favicon: LeaderboardMark on navy rounded rect

### Modified Files
- `app/_layout.tsx` — Splash screen overhaul
  - Replaced 👑 emoji with `LeaderboardMark` SVG (size 64, amber fill)
  - Added "TOP" wordmark above "Ranker" for two-line brand hierarchy
  - Logo text now white (#FFFFFF) on navy background
  - Tagline uses `BRAND.tagline` instead of hardcoded string
  - Changed "Dallas, TX" to "Texas" for multi-city
- `app/+html.tsx` — Web metadata overhaul
  - SVG favicon as primary, PNG as fallback
  - Apple touch icon → app icon (not favicon)
  - Title: "TopRanker - Trust-Weighted Restaurant Rankings"
  - Description: multi-city focused
  - Theme color: #0D1B2A (navy)
  - OG title/description updated
- `app/onboarding.tsx` — Visual upgrade
  - First slide uses `LeaderboardMark` SVG instead of emoji
  - Emoji circles wrapped in `LinearGradient` for depth
- `app.json` — Platform config alignment
  - Splash background: #F7F6F3 → #0D1B2A (navy)
  - Android adaptive icon background: #F7F6F3 → #0D1B2A
  - Web favicon: PNG → SVG

## Visual Identity Audit
| Touchpoint | Before | After |
|------------|--------|-------|
| Animated splash | 👑 emoji, cream bg | LeaderboardMark SVG, navy bg |
| Splash text | "TopRanker" single line | "TOP" + "Ranker" hierarchy |
| Splash tagline | "Dallas, TX" | "Texas" (multi-city) |
| Web favicon | Blue Expo chevron | Custom SVG LeaderboardMark |
| Web title | "Dallas Restaurant Rankings" | "Trust-Weighted Restaurant Rankings" |
| Theme color | #C49A1A (amber) | #0D1B2A (navy) |
| Android bg | #F7F6F3 (cream) | #0D1B2A (navy) |
| Onboarding slide 1 | 👑 emoji | LeaderboardMark SVG |

## Test Results
```
114 tests | 9 test files | 231ms
TypeScript: 0 errors
```

## Employee Performance

| Employee | Role | Contribution | Rating |
|----------|------|-------------|--------|
| Suki | Design Lead | Splash overhaul, favicon creation, brand consistency audit | A+ |
| James Park | Frontend Architect | Onboarding visual upgrade, splash implementation | A |
| Marcus Chen | CTO | SEO metadata review, OG tag guidance | A |
| Carlos Ruiz | QA Lead | Visual regression testing | A |
| Nadia Kaur | VP Security | Security review of asset changes | B+ |

## Sprint Velocity
- **Story Points Completed**: 7
- **Files Created**: 1 (favicon.svg)
- **Files Modified**: 4 (layout, html, onboarding, app.json)
- **Tests**: 114 (no change — visual sprint)
- **TypeScript Errors**: 0
