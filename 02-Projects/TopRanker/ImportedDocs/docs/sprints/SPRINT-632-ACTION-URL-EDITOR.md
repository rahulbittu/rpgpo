# Sprint 632: Owner Dashboard Action URL Editor

**Date:** 2026-03-11
**Type:** Core Loop — Decision-to-Action (Phase 6 — Owner Self-Service)
**Story Points:** 3
**Status:** COMPLETE

## Mission

Add an Action URL Editor to the business owner dashboard so owners can self-service their menu, order, pickup, DoorDash, Uber Eats, and reservation URLs without admin intervention.

## Team Discussion

**Priya Sharma (Design):** "The editor follows the HoursEditor pattern — collapsed summary with pills showing active links, expandable edit mode with one TextInput per field. The amber save button matches our CTA color system."

**Sarah Nakamura (Lead Eng):** "158 LOC extracted component. Uses useMutation for the PUT call. URL validation is simple — must start with http. Empty strings are nullified. The filled count badge (3/6) gives owners instant feedback on completion."

**Amir Patel (Architecture):** "The PUT /api/businesses/:slug/actions endpoint was already built in Sprint 626. This is pure frontend wiring. The dashboard grew by 2 LOC — just an import and one JSX line."

**Marcus Chen (CTO):** "This closes the owner self-service loop. Business owners can now manage their own action CTAs through the dashboard. No admin bottleneck for data enrichment."

**Rachel Wei (CFO):** "This is the Business Pro feature pitch: 'Manage your action links, see how many customers click through.' Direct value for the $49/mo subscription."

## Changes

### New Files
- `components/dashboard/ActionUrlEditor.tsx` (158 LOC) — Edit/view toggle, 6 URL fields, useMutation save, summary pills
- `__tests__/sprint632-action-url-editor.test.ts` — 18 tests

### Modified Files
- `app/business/dashboard.tsx` (+2 LOC) — Import + render ActionUrlEditor
- `shared/thresholds.json` — Tests 11661→11679

## Also Fixed: Production Database Migration

Added missing columns to production Railway database that were in schema.ts but not yet pushed:
- `members.first_name`, `members.last_name` (Sprint 625)
- `businesses.menu_url`, `order_url`, `pickup_url`, `doordash_url`, `uber_eats_url`, `reservation_url` (Sprint 626)

Root cause: Schema changes in code weren't accompanied by `drizzle-kit push` to sync production DB.

## Verification
- 11,679 tests passing across 500 files
- Server build: 629.9kb (< 750kb ceiling)
- 30 tracked files, 0 threshold violations
