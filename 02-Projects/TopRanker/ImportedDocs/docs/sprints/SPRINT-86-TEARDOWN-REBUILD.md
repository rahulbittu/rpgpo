# Sprint 86 — Ruthless Teardown & Rebuild

**Date:** March 8, 2026
**Sprint Type:** Infrastructure + Quality
**Story Points:** 21
**Phases Completed:** 1 (Tier Fix), 2 (Photo Audit), 7 (Retro Action Items), 8 (Architect Self-Review)

---

## Mission

Close all overdue retro action items, fix hardcoded colors, verify the photo pipeline, and add missing infrastructure (onboarding persistence, push token storage, audio asset scaffolding).

---

## Team Discussion

**Sarah Nakamura (CTO):** "This sprint is about paying down infrastructure debt. The hasSeenOnboarding flag has been missing since we built the onboarding screen — every cold launch potentially shows onboarding again. That's a UX regression we should've caught sooner."

**Carlos Ruiz (Mobile Lead):** "Push token registration was half-done — we get the Expo token on the client but never POST it to the backend. The `members.pushToken` column has been empty since day one. Now we have the full pipeline: register -> POST /api/members/me/push-token -> store in DB."

**Liam O'Brien (Audio/UX):** "Audio assets are still pending from Sprint 39. I've documented the exact 5 files we need in `assets/audio/AUDIO-ASSETS.md` with specs: duration, trigger context, format requirements. The haptic patterns are solid — audio layers on top when files arrive."

**Mei Lin (Frontend):** "The photo pipeline audit was reassuring. PhotoMosaic for HeroCard, PhotoStrip for RankedCard, DiscoverPhotoStrip for search cards, FighterPhoto for challenger — all properly use SafeImage with amber gradient fallbacks. No broken icon placeholders anywhere."

**Jordan Blake (Compliance):** "Push token storage endpoint now requires auth (`requireAuth` middleware). We're not over-collecting — only storing the token when the user is authenticated. That's GDPR-compliant for notification consent."

**Nadia Kaur (Security):** "The push token endpoint validates input type before storing. Good. I'd like to see token rotation handling in a future sprint — invalidating old tokens when a new one registers."

**Kai Nakamura (Design):** "The hardcoded color audit caught `#FFFBF0` and `#FFD700` in badge-leaderboard and profile — both now use `Colors.goldFaint` and `Colors.gold`. Every pixel should reference the brand system, not magic hex values."

**Rachel Wei (CFO):** "Infrastructure sprints like this don't generate revenue features, but they prevent the kind of bugs that erode user trust. A broken onboarding flow or missing push notifications directly impact retention metrics."

---

## Changes

### Phase 1 — Credibility Tier Fix (completed in prior context)
- Fixed tier names and weights in docs, emails, and email-drip templates
- Aligned all documentation to match code: New Member (0.10x), Regular (0.35x), Trusted (0.70x), Top Judge (1.00x)

### Phase 2 — Photo Pipeline Audit
- **Result:** All clear. No changes needed.
- PhotoMosaic: 0/1/2/3 photo layouts with amber gradient fallback
- PhotoStrip: Swipeable with dots, amber gradient fallback
- FighterPhoto: Image + amber gradient on error
- Business detail: Paginated ScrollView hero carousel
- All components use `photoUrls || [photoUrl] || []` source priority
- SafeImage fallback: amber gradient + initial letter, never icons

### Phase 7 — Close Overdue Retro Action Items

#### 7a. Database Indexes — Already Complete
- 13+ indexes across 8 tables including composite indexes for leaderboard queries
- No action needed

#### 7b. hasSeenOnboarding Flag — IMPLEMENTED
- **`app/onboarding.tsx`**: Added AsyncStorage persistence via `ONBOARDING_KEY`
- Both `goNext` (last slide) and `skip` now call `AsyncStorage.setItem(ONBOARDING_KEY, "true")`
- **`app/_layout.tsx`**: After splash animation, checks `AsyncStorage.getItem(ONBOARDING_KEY)`
- If not seen, navigates to `/onboarding`; otherwise stays on tabs
- Exported `ONBOARDING_KEY` constant for shared access

#### 7c. Push Token Storage — IMPLEMENTED
- **`server/storage/members.ts`**: Added `updatePushToken(memberId, pushToken)` function
- **`server/storage/index.ts`**: Exported `updatePushToken` from barrel
- **`server/routes.ts`**: Added `POST /api/members/me/push-token` endpoint with:
  - `requireAuth` middleware
  - Input validation (string type check)
  - Dynamic import pattern matching existing routes
- **`app/_layout.tsx`**: After token registration, calls `savePushToken(token)` which POSTs to backend

#### 7d. Audio Asset Scaffolding — IMPLEMENTED
- Created `assets/audio/` directory
- Created `assets/audio/AUDIO-ASSETS.md` with:
  - 5 required audio files with specs (duration, trigger, format)
  - Sound design guidelines (warm, organic, -14 LUFS)
  - Integration instructions for `lib/audio.ts`

### Phase 8 — Architect Self-Review

#### Background colors — PASS
All screens use `Colors.background`, no hardcoded hex values

#### Font consistency — PASS
All text uses DMSans or PlayfairDisplay fontFamily

#### Raw slug display — PASS
Slugs used only for routing, never displayed to users

#### Amber color consistency — FIXED
- `badge-leaderboard.tsx`: `#FFFBF0` -> `Colors.goldFaint`
- `profile.tsx`: `#FFD700` (3 instances) -> `Colors.gold`
- Gradient navy variants in challenger.tsx noted as acceptable (darkened brand navy)

#### Loading states — PASS
All 5 main screens have skeleton loading + error states with retry buttons

---

## Quality Gates

| Check | Result |
|-------|--------|
| TypeScript (`tsc --noEmit`) | 0 errors |
| Tests (Vitest) | 231 passed, 0 failed |
| Test execution time | 478ms |

---

## Files Changed

| File | Change |
|------|--------|
| `app/onboarding.tsx` | Added AsyncStorage onboarding persistence |
| `app/_layout.tsx` | Added onboarding check, push token storage |
| `server/routes.ts` | Added POST /api/members/me/push-token |
| `server/storage/members.ts` | Added updatePushToken function |
| `server/storage/index.ts` | Exported updatePushToken |
| `assets/audio/AUDIO-ASSETS.md` | Audio asset specifications |
| `app/badge-leaderboard.tsx` | Fixed hardcoded color to Colors.goldFaint |
| `app/(tabs)/profile.tsx` | Fixed hardcoded gold colors to Colors.gold |

---

## PRD Gap Closures

- [x] Onboarding shown only once (hasSeenOnboarding flag)
- [x] Push token persisted to backend for notification delivery
- [x] Audio asset pipeline documented and directory scaffolded
- [x] Brand color system enforced (no hardcoded amber/gold hex values)
