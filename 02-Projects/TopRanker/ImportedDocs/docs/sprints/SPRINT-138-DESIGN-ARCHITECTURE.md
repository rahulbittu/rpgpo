# Sprint 138 — Design Polish + Architecture Cleanup

**Date**: 2026-03-08
**Theme**: Design Polish + Architecture Cleanup
**Story Points**: 15
**Sprint Lead**: Sarah Nakamura
**Tests Added**: 66 (1554 total across 70 files)

---

## Mission Alignment

The external critique scored Sprint 137 at 4/10 on core-loop delivery and flagged two structural
problems: credibility logic duplicated between client and server, and unguarded async route handlers
across 17 route files. This sprint attacks both. A shared credibility module creates one source of
truth for the math that converts votes into trust rankings — the single most important calculation
in the product. Meanwhile, a 4-sprint gap in design work threatened to make TopRanker feel like a
prototype. Six animation components, a haptic pattern library, and an audio engine bring the polish
that earns user trust before they ever cast a vote.

---

## Team Discussion

**Marcus Chen (CTO)**: "The shared credibility module is the most architecturally significant change
we've shipped in ten sprints. Logic drift between `lib/data.ts` and `server/storage/helpers.ts` was
a ticking time bomb — a tier threshold change on the server that didn't propagate to the client would
silently corrupt the user's perceived credibility. Now it's one file, one truth. My concern is Sprint
139 execution: we have 17 route files that need to adopt `wrapAsync`. I want Sarah to assign each
file to a specific engineer so nothing slips through."

**Amir Patel (Architecture)**: "The `shared/credibility.ts` pattern validates what I've been pushing
for since Sprint 110 — domain logic belongs in a shared layer, not in either client or server. The
`@shared` path alias in vitest.config.ts is clean. I'd suggest we add a `shared/index.ts` barrel
export so consumers can `import { getVoteWeight } from '@shared'` without knowing the internal file
structure. As we add more shared modules — and we will — the barrel keeps the import surface stable.
The `wrapAsync` utility is textbook Express middleware. Simple, correct, and it handles the
`headersSent` edge case that caused the X-Response-Time crash in Sprint 136."

**Sarah Nakamura (Lead Eng)**: "The animation component API came out well. `ScoreCountUp` uses
spring physics with configurable tension and friction — but I want to tune the defaults for different
score ranges. A score going from 0 to 95 needs different spring characteristics than 88 to 92.
`FadeInView` and `SlideUpView` are intentionally simple wrappers — they compose well when you stack
them. Test coverage at 66 new tests is solid: 24 for animations, 15 for haptics/audio, 27 for
transitions. All passing, all fast."

**Elena Rodriguez (Design)**: "Four sprints without meaningful design work was painful to watch. The
`RankMovementPulse` glow effect nails it — green for up, red for down, amber for new entries. That
amber glow on a new ranking entry is going to be the first thing users notice. `EmptyStateAnimation`
with category-aware floating particles means an empty search result for 'coffee' feels different from
'hotels'. Next sprint I need these wired into actual screens — components sitting in a folder aren't
design polish until users see them."

**Nadia Kaur (Cybersecurity)**: "I reviewed `wrapAsync` specifically for information leakage. The
wrapper catches thrown errors and passes them to Express's error handler without exposing stack traces
to the client. The `headersSent` guard prevents the double-response crash we fixed in Sprint 125 —
if headers are already sent, we log the error but don't try to write another response. This is
defense in depth for every route that adopts it. The audio engine's fallback path is also clean —
when `expo-av` isn't available, it degrades to haptics-only without throwing."

**David Kim (QA)**: "66 new tests, all green. The animation tests verify component mounting, prop
propagation, and fallback behavior — not pixel-perfect rendering, which would be brittle. Haptic
pattern tests confirm graceful degradation on platforms without `expo-haptics`. I'd like to add
integration tests next sprint that render animation components inside actual screen containers to
catch layout interaction bugs. The transition tests cover fade duration, navigation stack behavior,
and edge cases like rapid back-forward navigation."

**Jasmine Taylor (Marketing)**: "Animations and haptics are the difference between a prototype and a
product. When a user bookmarks a restaurant and feels a subtle haptic tap, that's trust signaling
through interaction design. The `tierPromotion` haptic pattern — a strong buzz followed by a light
confirmation — is the kind of micro-interaction that gets mentioned in App Store reviews. My question
is timing: when do these ship to real users? Components in a folder don't improve NPS."

**Jordan Blake (Compliance)**: "The shared credibility module is a compliance win I didn't expect.
Previously, auditing tier threshold logic meant reviewing two files in two different directories with
subtly different implementations. Now it's `shared/credibility.ts` — one file, one review, one sign-off.
When we go through SOC 2 readiness, single-source-of-truth for scoring logic reduces our audit surface
area significantly. The tier constants being exported means we can write compliance assertions that
verify thresholds haven't changed without authorization."

---

## Changes

### 1. Shared Credibility Module (Architecture Debt)
- **New file**: `shared/credibility.ts` — single source of truth for credibility logic
- Exports: `getVoteWeight`, `getCredibilityTier`, `getTierFromScore`, `getTemporalMultiplier`
- `lib/data.ts` now re-exports from `shared/credibility.ts` (client path)
- `server/storage/helpers.ts` now re-exports from `shared/credibility.ts` (server path)
- Eliminates logic drift between client and server tier calculations

### 2. wrapAsync Middleware (Architecture Debt)
- **New file**: `server/wrap-async.ts` — Express async route handler wrapper
- Catches rejected promises and forwards to error handler
- Guards against `headersSent` double-response crashes
- Error messages sanitized — no stack trace leakage to clients
- Will be applied to 17 route files in Sprint 139 (utility created this sprint)

### 3. Vitest Path Alias
- `vitest.config.ts` updated with `@shared` path alias
- Tests can import from `@shared/credibility` for shared module resolution

### 4. Animation Components (`components/animations/`)
- **ScoreCountUp.tsx** — Spring-physics animated counter for credibility scores
- **RankMovementPulse.tsx** — Glow pulse animation for rank changes (up=green, down=red, new=amber)
- **EmptyStateAnimation.tsx** — Category-aware animated empty states with floating particles
- **FadeInView.tsx** — Configurable fade-in wrapper with delay support
- **SlideUpView.tsx** — Slide-up entrance animation with configurable distance
- **LottieWrapper.tsx** — Lottie-compatible animation player with static fallback

### 5. Haptic Patterns (`lib/haptic-patterns.ts`)
- Named patterns: `bookmark`, `vote`, `tierPromotion`, `scoreReveal`, `challengeVote`, `error`, `success`, `tabSwitch`
- Built on `expo-haptics` with graceful fallback on unsupported platforms
- Each pattern has intensity and duration tuned to interaction semantics

### 6. Audio Engine (`lib/audio-engine.ts`)
- `expo-av` based sound playback for UI feedback events
- Preload/play/cleanup lifecycle management
- Falls back to haptics-only when audio unavailable
- No audio autoplay — triggered only by explicit user interaction

### 7. Interaction Hooks
- **`hooks/useInteraction.ts`** — Combined haptic + audio feedback hook
- **`hooks/useTabPressAnimation.ts`** — Tab bar bounce animation on press

### 8. Screen Transitions (`app/_layout.tsx`)
- Fade animation added to stack navigator screens
- Configurable transition duration
- Handles rapid back-forward navigation gracefully

---

## Files Changed

| File | Status | Description |
|------|--------|-------------|
| `shared/credibility.ts` | NEW | Single source of truth for credibility logic |
| `lib/data.ts` | MODIFIED | Re-exports from shared/credibility.ts |
| `server/storage/helpers.ts` | MODIFIED | Re-exports from shared/credibility.ts |
| `server/wrap-async.ts` | NEW | Express async route handler wrapper |
| `vitest.config.ts` | MODIFIED | Added @shared path alias |
| `components/animations/ScoreCountUp.tsx` | NEW | Spring-physics score counter |
| `components/animations/RankMovementPulse.tsx` | NEW | Rank change glow pulse |
| `components/animations/EmptyStateAnimation.tsx` | NEW | Category-aware empty states |
| `components/animations/FadeInView.tsx` | NEW | Fade-in wrapper |
| `components/animations/SlideUpView.tsx` | NEW | Slide-up entrance animation |
| `components/animations/LottieWrapper.tsx` | NEW | Lottie player with fallback |
| `lib/haptic-patterns.ts` | NEW | Named haptic feedback patterns |
| `lib/audio-engine.ts` | NEW | Audio playback engine with fallback |
| `hooks/useInteraction.ts` | NEW | Combined haptic + audio hook |
| `hooks/useTabPressAnimation.ts` | NEW | Tab bar bounce animation hook |
| `app/_layout.tsx` | MODIFIED | Fade screen transitions |
| `tests/sprint138-animations.test.ts` | NEW | 24 animation component tests |
| `tests/sprint138-haptics-audio.test.ts` | NEW | 15 haptic + audio tests |
| `tests/sprint138-transitions.test.ts` | NEW | 27 screen transition tests |

---

## Test Summary

**1554 tests across 70 files** (+66 new), all passing in <1.2s

| Test File | Count | Coverage |
|-----------|-------|----------|
| sprint138-animations.test.ts | 24 | ScoreCountUp, RankMovementPulse, EmptyState, FadeIn, SlideUp, Lottie |
| sprint138-haptics-audio.test.ts | 15 | Pattern triggers, platform fallback, audio lifecycle, cleanup |
| sprint138-transitions.test.ts | 27 | Fade duration, navigation stack, rapid nav, configurable timing |

---

## External Critique Response

Addressing the Sprint 137 external critique (4/10 core-loop score):

| Priority | Status | Evidence |
|----------|--------|----------|
| Activate confidence_tooltip experiment | ALREADY ACTIVE | Documented in Sprint 137 — experiment was active, critique missed it |
| Fix architecture debt (logic duplication) | CLOSED | `shared/credibility.ts` — single source of truth, both sides re-export |
| Fix architecture debt (unguarded async) | PARTIAL | `wrapAsync` utility created; application to 17 route files in Sprint 139 |
| Close data integrity gap (tier staleness) | OPEN | Tier staleness checks deferred to Sprint 139 |

---

## PRD Gaps Closed

- **Client/server credibility logic duplication** — CLOSED via shared module
- **Design polish gap (4 sprints without design work)** — ADDRESSED with 6 animation components, haptics, audio engine
- **Missing screen transitions** — CLOSED with fade animations in _layout.tsx

---

## Next Sprint Preview (Sprint 139)

1. **Apply wrapAsync to all 17 route files** — eliminate 75+ try/catch blocks
2. **Tier staleness checks** — detect and refresh stale credibility tiers on login
3. **Wire animation components into screens** — ScoreCountUp on profile, RankMovementPulse on rankings, EmptyStateAnimation on search
4. **Spring tension tuning** — optimize ScoreCountUp physics for different score ranges
5. **Integration tests** — animation components rendered inside actual screen containers
