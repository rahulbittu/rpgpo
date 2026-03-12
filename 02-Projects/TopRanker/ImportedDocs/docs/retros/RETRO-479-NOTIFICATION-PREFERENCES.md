# Retro 479: Notification Preferences UI

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Sarah Nakamura:** "Clean replacement of a navigation link with an inline card. The expand/collapse pattern keeps Profile tab compact while giving users full control. No component got larger — we just swapped one small component for another slightly larger one."

**Amir Patel:** "No migration needed for 3 new notification categories — the JSONB column in members table handles arbitrary key/value pairs. Server changes were minimal — just adding keys to the defaults and destructuring."

**Jordan Blake:** "Compliance-friendly pattern: server sync on every toggle change, AsyncStorage fallback for offline, marketing emails still default false (CAN-SPAM), all other categories default true with easy opt-out."

## What Could Improve

- **Triggers not yet built** — We have the preferences infrastructure for rankingChanges, savedBusinessAlerts, and cityAlerts, but no trigger functions that actually send these pushes yet. Need to prioritize in upcoming sprints.
- **Settings page duplication** — Both Settings and Profile now have notification toggles. Should consider whether Settings should link to the Profile card or vice versa to avoid drift.

## Action Items

- [ ] Sprint 480: Governance (SLT-480 + Audit #54 + Critique) — **Owner: Sarah**
- [ ] Future: Ranking change push triggers — **Owner: TBD**
- [ ] Future: Saved business alert push triggers — **Owner: TBD**

## Team Morale
**8/10** — Good feature sprint. Users now have granular notification control without leaving Profile. Ready for governance sprint 480.
