# Sprint 37 — Shareable Challenge Image Card

## Mission Alignment
The viral loop depends on beautiful, shareable content. When a Challenger ends, the winner should be able to share a branded image card to Instagram, Twitter, iMessage — anywhere. Text links get ignored; images get engagement. This is the difference between "tell your friends" and "show your friends."

## Team Discussion

### Rahul Pitta (CEO)
"When someone wins a Challenger, the share moment is everything. They screenshot our winner card and post it everywhere. But a screenshot is messy — cropped wrong, status bar showing, low quality. A generated share card is pixel-perfect every time: navy background, gold trophy, winner stats, TopRanker branding. This is free marketing that looks intentional."

### Marcus Chen (CTO)
"react-native-view-shot captures any React Native view as a PNG at native resolution. We render the share card offscreen (positioned at -9999), capture it to a temp file, then hand it to expo-sharing which opens the native share sheet. The whole flow is: tap button -> haptic feedback -> capture PNG -> share sheet. No server needed."

### James Park (Frontend Architect)
"The ShareCardView is a pure component that renders a 390x520 card with the challenge result. It takes all the winner data as props. The useShareCard hook returns the ref and capture function — keeps the component stateless and the logic reusable. The card is rendered offscreen so it doesn't affect layout."

### Kai Nakamura (Animation Architect)
"The 'Share as Image' button enters with FadeInUp delay 1000ms — it appears last in the winner reveal sequence, after the stats and defeat text. The button has an amber glow border on the navy gradient. The haptic fires on press before the capture begins, giving immediate tactile feedback."

### Zara Mitchell (Senior Animator)
"The share card itself is designed as a static composition — no animations, because it's captured as a still image. But the visual hierarchy is dynamic: trophy large and centered, winner name in white 28pt, stats in amber, defeated text in muted italic. The brand mark 'TOPRANKER' at top with 4px letter spacing anchors the brand."

### Liam O'Brien (Animation Lead)
"The role badge ('DEFENDED #1' vs 'UPSET VICTORY') adds narrative. It tells a story in a single image. The footer with the decorative amber line and 'topranker.com' ensures every shared image drives traffic back. Consistent with our splash screen visual language."

### Olivia Hart (Head of Copy & Voice)
"The share card copy is minimal by design. 'WINNER' not 'The Winner Is.' 'defeated' in italic, lowercase — understated, elegant. The role badge copy creates two narratives: defending champions ('DEFENDED #1') feel validated, upsets ('UPSET VICTORY') feel exciting. Both are share-worthy stories."

### Carlos Ruiz (QA Lead)
"Verified: ViewShot captures the offscreen card at full resolution. expo-sharing opens native share sheet on iOS and Android. Image quality is crisp at 1x PNG. All props flow correctly from challenge data. Button appears only when countdown.ended is true. Haptic fires on press. TypeScript clean (pre-existing rate timer issue only)."

## Changes
- `components/ShareCard.tsx` (NEW): Shareable image card component
  - `ShareCardView`: 390x520 branded card rendered offscreen
    - Navy background, amber accents, trophy, winner stats
    - Category + city header, role badge, footer with branding
  - `useShareCard()` hook: ref + captureAndShare function
    - Uses `react-native-view-shot` for PNG capture
    - Uses `expo-sharing` for native share sheet
- `app/(tabs)/challenger.tsx` (MODIFIED): Integrated share image flow
  - Added "Share as Image" button in winner reveal section
  - Button enters with FadeInUp.delay(1000) animation
  - Haptic feedback on press
  - Offscreen ShareCardView rendered with challenge data
- `package.json` (MODIFIED): Added `react-native-view-shot`, `expo-sharing`

## Employee Performance

| Employee | Role | Contribution | Rating |
|----------|------|-------------|--------|
| James Park | Frontend Architect | ShareCard component architecture, useShareCard hook | A+ |
| Marcus Chen | CTO | View-shot + sharing integration, offscreen rendering approach | A |
| Kai Nakamura | Animation Architect | Share button entrance animation, haptic feedback timing | A |
| Zara Mitchell | Senior Animator | Share card visual composition and hierarchy | A |
| Liam O'Brien | Animation Lead | Role badge narrative design, brand consistency review | A |
| Olivia Hart | Head of Copy & Voice | Share card copy, role badge narratives | A |
| Carlos Ruiz | QA Lead | Cross-platform capture/sharing verification | A |

## Sprint Velocity
- **Story Points Completed**: 5
- **Files Modified**: 3 (1 new, 1 modified, 1 package.json)
- **Lines Changed**: ~200
- **Time to Complete**: 0.5 days
- **Blockers**: None — react-native-view-shot works offline, no server dependency
