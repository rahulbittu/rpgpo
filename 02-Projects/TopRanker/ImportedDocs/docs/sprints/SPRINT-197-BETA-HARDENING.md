# Sprint 197 — Beta Hardening: Bug Fixes + Invite Tracking

**Date:** 2026-03-09
**Story Points:** 8
**Status:** Complete

## Mission Alignment

Pre-launch hardening sprint. Fixes real bugs that would hit beta users on day one, adds invite tracking so the team can see who joined, and consolidates a long-standing query inefficiency. Every change directly serves the beta launch.

## Team Discussion

**Marcus Chen (CTO):** "Three bugs found, three bugs fixed. Password validation mismatch would have caused frustration for every single beta user — server rejects at 8 chars while client allows 6. That's the kind of issue that kills trust on day one."

**Amir Patel (Architecture):** "The updateMemberStats consolidation closes a critique item carried since Sprint 164. Four sequential queries → three parallel queries with countDistinct. It's not glamorous but it's the right thing to do before inviting real users."

**Sarah Nakamura (Lead Eng):** "Beta invite tracking is essential for wave management. Now admin can see who was invited, who joined, who's still pending. The batch endpoint prevents duplicates at both the member and invite level."

**Nadia Kaur (Cybersecurity):** "Hiding demo credentials behind `__DEV__` is a critical fix. Displaying `alex@demo.com / demo123` on the production login page is literally handing credentials to anyone who visits. Even though it's a seed account, it signals amateur security posture."

**Rachel Wei (CFO):** "Invite tracking gives us conversion metrics: how many of 25 invites → actual signups. That's the number we need for the SLT Sprint 200 meeting."

**Jasmine Taylor (Marketing):** "Duplicate invite prevention is smart. I can confidently send batch invites without worrying about annoying people with repeat emails."

**Jordan Blake (Compliance):** "The invite tracking table stores invitedBy (admin email), creating an audit trail of who authorized each beta invitation. Good for compliance."

## Deliverables

### Bug Fix: Password Validation Mismatch (`app/auth/signup.tsx`)
- **Before:** Client validated 6+ chars, server required 8+ chars with digit → guaranteed 400 error
- **After:** Client validates 8+ chars with digit, matching server exactly
- Clear error messages for both length and digit requirements

### Bug Fix: Demo Credentials in Production (`app/auth/login.tsx`)
- **Before:** `Demo: alex@demo.com / demo123` visible to all users
- **After:** Gated behind `__DEV__` — only shows in development builds

### Performance: updateMemberStats Consolidation (`server/storage/members.ts`)
- **Before:** 4 sequential queries (count, category join, distinct biz, raw scores)
- **After:** 3 parallel queries using Promise.all + countDistinct
- Addresses critique feedback from Sprint 164 and 186-189

### Beta Invite Tracking (`shared/schema.ts`, `server/storage/beta-invites.ts`)
- New `beta_invites` table: email, displayName, referralCode, invitedBy, status, sentAt, joinedAt, memberId
- Storage functions: createBetaInvite, getBetaInviteByEmail, markBetaInviteJoined, getBetaInviteStats
- `GET /api/admin/beta-invites` — stats endpoint (total, joined, pending, full list)

### Invite → Signup Linkage (`server/routes-auth.ts`, `server/routes-admin.ts`)
- Admin invite endpoints now record to beta_invites table
- Duplicate invite prevention (single + batch)
- Signup auto-marks beta invite as "joined" with member ID linkage

## Tests

- 38 new tests in `tests/sprint197-beta-hardening.test.ts`
- 1 test updated in `tests/sprint146-freshness-boundary-audit.test.ts` (range expansion)
- Full suite: **3,334 tests across 128 files, all passing in <2s**
