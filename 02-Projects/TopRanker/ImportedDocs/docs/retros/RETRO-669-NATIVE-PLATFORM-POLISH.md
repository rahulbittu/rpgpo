# Retro 669: Native Platform Polish

**Date:** 2026-03-11
**Duration:** 5 min
**Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well
- **Sarah Nakamura:** "Extracting modalOpts/cardOpts was the right call. 8 screens sharing one config means we change gesture behavior in one place."
- **Amir Patel:** "StatusBar was a one-liner fix but would have been the first thing noticed on a physical device test. Good catch before the EAS build."
- **Marcus Chen:** "Native polish like this is invisible when done right and painfully obvious when missing. This was necessary prep for iOS testing."

## What Could Improve
- Should have had StatusBar configured from Sprint 1. Basic native setup was overlooked because we developed web-first.
- Android ripple effect on touchable elements is still missing — Material Design feedback would make Android feel more native.
- No platform-specific modal presentation styles yet (iOS pageSheet vs Android fullscreen).

## Action Items
- [ ] Add android_ripple to primary touchable elements (Owner: Sarah, future sprint)
- [ ] Consider iOS pageSheet presentation for modals (Owner: Amir, future sprint)
- [ ] Test all gesture behaviors on physical device once EAS build is ready (Owner: Rahul)

## Team Morale
8/10 — Quick polish sprint that sets up the EAS preview build for success. Ready for real device testing.
