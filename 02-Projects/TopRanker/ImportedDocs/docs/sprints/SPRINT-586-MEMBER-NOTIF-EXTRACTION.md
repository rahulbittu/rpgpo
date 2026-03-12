# Sprint 586: routes-members.ts Notification Extraction

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete

## Mission

Extract notification endpoints from routes-members.ts to a dedicated routes-member-notifications.ts. The file was at 294/300 LOC (98% utilization) — flagged in Audits #580 and #585.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "routes-members.ts dropped from 294 to 220 LOC — a 25% reduction. Five notification endpoints (push-token, preferences GET/PUT, frequency GET/PUT) moved to their own 95 LOC module. Clean separation of concerns."

**Amir Patel (Architecture):** "Notification preferences were the natural extraction boundary. They're self-contained — own imports, own storage functions, no dependency on member profile data. The remaining routes-members.ts is now purely about profile, identity, and impact."

**Marcus Chen (CTO):** "This was overdue — flagged at 98% for two audit cycles. Now at 73% utilization with room for future member endpoints."

**Nadia Kaur (Security):** "All notification endpoints maintain requireAuth middleware. The extraction doesn't change any auth boundaries."

## Changes

### New Files
- **`server/routes-member-notifications.ts`** (95 LOC)
  - `registerMemberNotificationRoutes(app)` — 5 endpoints
  - POST /api/members/me/push-token
  - GET/PUT /api/members/me/notification-preferences
  - GET/PUT /api/members/me/notification-frequency

### Modified Files
- **`server/routes-members.ts`** (294→220 LOC, -74)
  - Removed 5 notification endpoints
  - Updated header comment to list remaining endpoints
- **`server/routes.ts`** (+2 LOC)
  - Import and call `registerMemberNotificationRoutes(app)`

### Test Files
- **`__tests__/sprint586-member-notif-extraction.test.ts`** (16 tests)
- Updated 5 existing test files to read from routes-member-notifications.ts

### Threshold Updates
- `shared/thresholds.json`: tests 11116→11132, build 721.2→721.3kb

## Test Results
- **11,132 tests** across 474 files, all passing in ~6.0s
- Server build: 721.3kb
