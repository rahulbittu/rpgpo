# Retro 387: Rating Edit/Delete Capability

**Date:** 2026-03-09
**Duration:** 1 sprint cycle
**Story Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "Clean connection to existing backend. Sprint 183 laid the foundation, Sprint 387 exposes it to users. Good example of incremental delivery."

**Amir Patel:** "No test cascade — HistoryRow was a small component (42 LOC) with no test dependencies. Clean enhancement."

**Jordan Blake:** "Delete confirmation with explicit warning text. Good pattern for destructive actions."

## What Could Improve

- **Edit flow is incomplete** — clicking Edit navigates to rate page but doesn't pre-fill with existing values. Need a follow-up sprint to handle `editRatingId` param in the rate page.
- **No undo for delete** — once confirmed, it's gone. Consider a soft-delete with 24h recovery window.

## Action Items

- [ ] Sprint 388+: Handle editRatingId param in rate page to pre-fill form — **Owner: Priya Sharma**
- [ ] Consider soft-delete recovery window — **Owner: Amir Patel (future sprint)**

## Team Morale
**8/10** — Users finally have agency over their ratings. The 48h edit window is a good balance.
