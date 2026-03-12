# Retro 668: EAS Preview Build + iOS Testing Setup

**Date:** 2026-03-11
**Duration:** 5 min
**Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well
- **Amir Patel:** "The eas.json was already scaffolded from early sprints. We just needed to wire the API URL and fix the npm cache permissions issue."
- **Sarah Nakamura:** "Preview profile with internal distribution is the right pattern. No TestFlight approval delays — direct install via QR code."
- **Marcus Chen:** "Finally addressing the CEO's top request. Native testing has been blocked for too long."

## What Could Improve
- Should have prioritized this earlier — CEO asked multiple times before it was addressed.
- The npm cache permission issue (EACCES) is a local env problem that should be fixed with sudo chown.
- Need Apple Developer account ($99/year) for ad-hoc provisioning if not already set up.

## Action Items
- [ ] CEO to create Expo account and run `eas login` (Owner: CEO)
- [ ] CEO to run `eas init` to link project (Owner: CEO)
- [ ] Trigger first preview build once logged in (Owner: Sarah)
- [ ] Fix npm cache permissions: `sudo chown -R $(whoami) ~/.npm` (Owner: CEO)

## Team Morale
7/10 — Overdue but necessary. The team recognizes this should have been Sprint 1 priority. Moving forward, native testing will be part of the standard sprint loop.
