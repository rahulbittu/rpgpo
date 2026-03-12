# Sprint 669: Native Platform Polish

**Date:** 2026-03-11
**Points:** 3
**Focus:** iOS/Android native UX polish — StatusBar, gesture navigation, screen transitions

## Mission

With EAS preview builds about to enable physical device testing (Sprint 668), this sprint polishes the native platform experience. StatusBar was unconfigured (defaulting to dark text on dark background — unreadable on iOS). Modal screens lacked swipe-to-dismiss gestures. Card screens lacked swipe-back. These are table-stakes for native app UX.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "StatusBar was never explicitly set — on iOS that means dark text on our navy background. Invisible. One `<StatusBar barStyle='light-content' />` in `_layout.tsx` fixes every screen."

**Amir Patel (Architecture):** "I extracted shared `modalOpts` and `cardOpts` objects. All 8 modals now get `gestureEnabled + fullScreenGestureEnabled` from one place. Consistency without repetition."

**Marcus Chen (CTO):** "When Rahul tests on his iPhone for the first time, these details matter. Swipe-to-dismiss is expected behavior on iOS. Missing it feels broken."

**Nadia Kaur (Cybersecurity):** "No security implications. All changes are client-side presentation layer. StatusBar backgroundColor for Android sets the system bar to navy — matches our brand."

## Changes

### `app/_layout.tsx` (+20 LOC, net)
- Added `<StatusBar barStyle="light-content" backgroundColor={navy} />` (native only)
- Extracted `modalOpts` shared config: presentation modal, slide_from_bottom, gestureEnabled, fullScreenGestureEnabled
- Extracted `cardOpts` shared config: presentation card, slide_from_right, gestureEnabled
- All 8 modal screens and 2 card screens now use shared configs
- Added `gestureEnabled: true` to all non-modal screen options

### `tests/sprint138-transitions.test.ts` (+6 LOC)
- Updated 3 assertions to account for extracted `modalOpts`/`cardOpts` pattern

### `__tests__/sprint623-bestIn-links-google-fallback.test.ts` (+3 LOC)
- Updated dish/[slug] animation assertion to check `cardOpts` reference

## Health
- **Tests:** 11,697 pass (501 files)
- **Build:** 655.5kb (server unchanged — client-only changes)
