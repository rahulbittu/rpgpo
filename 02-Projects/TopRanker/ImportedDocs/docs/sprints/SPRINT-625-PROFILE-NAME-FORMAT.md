# Sprint 625: Profile Name Format + First/Last Name Fields

**Date:** 2026-03-11
**Type:** Core Loop — CEO Feedback (Profile UX)
**Story Points:** 5
**Status:** COMPLETE

## Mission

Add firstName/lastName fields to the member system and display names as "First L." format (e.g., "Rahul P.") per CEO directive. Avatar upload already exists — verified and working.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The schema change was minimal — two nullable text columns. Drizzle ORM picks them up automatically in SELECT queries. The backward-compatible approach means existing users see their displayName until they set firstName/lastName."

**Amir Patel (Architecture):** "formatShortName() is exported from ProfileIdentityCard for reuse across the app. It handles three cases: firstName+lastName → 'First L.', firstName only → 'First', neither → fallback to displayName."

**Marcus Chen (CTO):** "The edit-profile form now has three name fields: First Name, Last Name, Display Name. The hint 'Shown as First L. on your profile' makes the format clear. Server validation caps each at 30 chars."

**Jordan Blake (Compliance):** "firstName/lastName are nullable, optional fields. No PII exposure — we show 'First L.' publicly, never the full last name. GDPR-compliant by design."

**Priya Sharma (Design):** "Avatar upload was already built in Sprint 584. We verified it works end-to-end: web file picker, mobile expo-image-picker, 2MB limit, preview + upload to R2. No Ghibli filter in V1 — that's a Phase 2 feature needing an AI image API."

## Changes

### Schema
- `shared/schema.ts` (+2 LOC) — Added `firstName` (text, nullable) and `lastName` (text, nullable) to members table

### Server
- `server/routes-members.ts` (+12 LOC) — PUT /api/members/me accepts firstName/lastName with 0-30 char validation
- `server/storage/members.ts` (+2 LOC) — updateMemberProfile handles firstName/lastName fields

### Client
- `components/profile/ProfileIdentityCard.tsx` (+14 LOC) — Added `formatShortName()`, firstName/lastName props, uses shortName in render
- `app/edit-profile.tsx` (+43 LOC) — First Name + Last Name form fields with "First L." hint
- `app/(tabs)/profile.tsx` (+2 LOC) — Passes firstName/lastName to ProfileIdentityCard

## Verification
- 11,547 tests passing across 494 files
- Server build: 628.1kb (< 750kb ceiling)
- 30 tracked files, 0 threshold violations
- schema.ts: 898/960 LOC (93.5%)
