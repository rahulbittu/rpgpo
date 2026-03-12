# Sprint 42 Retrospective — Settings Screen

**Date:** March 7, 2026
**Sprint Duration:** 0.5 days
**Story Points:** 5
**Facilitator:** Sarah Nakamura (VP Engineering)

## What Went Well
- **Mei Lin**: "Switch components with amber brand theming look premium. The async toggle pattern (update state immediately, persist to AsyncStorage) gives instant feedback."
- **Victoria Ashworth**: "Granular notification toggles satisfy CAN-SPAM, GDPR, and DPDPA opt-out requirements. Marketing emails have their own toggle — this is legally important."
- **David Okonkwo**: "Grouped card-based sections follow iOS conventions. Users know how to navigate settings instinctively."

## What Could Improve
- **Marcus Chen**: "Notification preferences are client-side only. Server needs to know which notifications a user opted out of to avoid sending unwanted pushes."
- **Carlos Ruiz**: "City change should trigger a loading state while rankings refresh. Currently it just changes instantly — might confuse users if data takes a moment."

## Action Items
- [ ] Build notification preference sync endpoint — **Priya Sharma**
- [ ] Add loading state on city change in settings — **James Park**
- [ ] Add haptics toggle to settings (accessibility) — **Mei Lin**

## Team Morale: 8/10
Solid utility sprint. Settings screens aren't exciting but they're necessary.
