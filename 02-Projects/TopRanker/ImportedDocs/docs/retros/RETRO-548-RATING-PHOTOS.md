# Retro 548: Rating Photo Indicators

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "Rating integrity becomes tangible. Users can now see which ratings are backed by evidence. This is the visual layer of our 'amplify high-quality signals' philosophy — photo-verified ratings look more credible because they are more credible."

**Amir Patel:** "Minimal server change (2 fields added to select query) enables a full client-side feature. The RatingPhotoData type + fetchRatingPhotos function sets up the photo carousel for the next sprint without adding complexity now."

**Nadia Kaur:** "Receipt verification badges are a trust signal that no competitor has. Yelp can't show 'Receipt Verified' because they don't collect receipts. This is genuine differentiation."

## What Could Improve

- **No photo carousel yet** — Sprint 548 shows badges but not actual photos. The fetchRatingPhotos API is ready but unused. V2 should add expand-to-view functionality.
- **Server build at 705.8kb** — Minimal increase from +2 fields, but continuing to monitor.
- **api.ts at 670 LOC** — Approaching the 680 threshold. May need extraction if another sprint adds API functions.

## Action Items

- [ ] Sprint 549: Leaderboard filters (neighborhood + price) — **Owner: Sarah**
- [ ] V2: Rating photo carousel using fetchRatingPhotos — **Owner: Sarah**

## Team Morale
**8/10** — Good feature sprint advancing the rating integrity visual layer. Clean execution with minimal server-side changes.
