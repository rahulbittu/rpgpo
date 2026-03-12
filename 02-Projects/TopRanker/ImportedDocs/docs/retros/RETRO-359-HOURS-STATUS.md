# Retrospective — Sprint 359

**Date:** March 9, 2026
**Duration:** 1 session
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "The closing-soon warning is the kind of real-time context that differentiates Best In from static directories. Constitution principle #5 — live, not static."

**Amir Patel:** "Component grew from 63 to 131 LOC. Most of the growth is the two utility functions (parseTime, getTodayStatus). The display logic is minimal. Clean architecture."

**Priya Sharma:** "30 new tests bring us to 6,619. Edge cases for 12 AM/PM and time zone handling are covered in the parsing function tests."

## What Could Improve

- **Time parsing is brittle** — Relies on Google's "H:MM AM/PM" format. International hours formats (24h, localized day names) would break it.
- **No timezone awareness** — Uses device local time. A user in a different timezone from the business might see incorrect status.
- **Closing soon threshold is fixed** — 60 minutes might be too long for fast food, too short for fine dining.

## Action Items
- [ ] Sprint 360: SLT Review + Arch Audit #54 (governance)
- [ ] Future: Add timezone-aware status using business timezone data
- [ ] Future: Make closing-soon threshold configurable

## Team Morale: 9/10
Real-time hours status adds genuine user value. Clean parsing utilities.
