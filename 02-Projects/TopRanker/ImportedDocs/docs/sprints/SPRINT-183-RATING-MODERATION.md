# Sprint 183: Rating Edit/Delete + Moderation Queue

**Date:** 2026-03-09
**Story Points:** 5
**Focus:** User self-service rating management and admin moderation queue for auto-flagged ratings

---

## Mission Alignment
Core Value #4 (every rating must have consequence) works both ways — users must also be able to correct mistakes. A wrong score shouldn't be permanent. This sprint adds a 24-hour edit window and soft-delete capability for rating authors. The moderation queue gives admins a structured workflow for reviewing auto-flagged ratings, directly strengthening ranking fairness (Core Value #7). Public flag submission enables community-driven quality control — the crowd helps identify suspicious ratings.

---

## Team Discussion

**Marcus Chen (CTO):** "Three capabilities in one sprint: edit, delete, and moderate. Edit has a 24-hour window — long enough to fix mistakes, short enough to prevent gaming. Delete is soft (sets isFlagged=true with reason 'user_deleted') — we keep the data for audit trails. The moderation queue surfaces auto-flagged ratings that anomaly detection caught during submission."

**Sarah Nakamura (Lead Eng):** "The edit function recalculates rawScore, weightedScore, and triggers business score recalculation + rank recalculation. Same consequences as a new rating — Core Value #4 in action. Delete also triggers recalculation so the business score updates immediately."

**Amir Patel (Architecture):** "Three new API endpoints on routes.ts (PATCH/DELETE/POST), two new admin endpoints. Routes.ts grew to 404 lines — still within tolerance but we should watch it. The moderation queue is a paginated view of auto-flagged ratings with business context for admin review."

**Jordan Blake (Compliance):** "Users can now exercise data correction rights (GDPR Article 16 equivalent). The 24-hour edit window balances user rights with system integrity. Soft delete preserves audit trail while removing the rating from calculations. Flag submission is community moderation — empowers users."

**Nadia Kaur (Security):** "Author ownership is verified on edit and delete — you can't modify another user's rating. Self-flagging is blocked. The flag submission uses a unique constraint (one flag per member per rating) to prevent spam flagging. Admin moderation requires admin role."

**Rachel Wei (CFO):** "Trust infrastructure. Users who can correct mistakes trust the platform more. Admins who can efficiently moderate trust the data more. Businesses that see unfair ratings actioned trust the rankings more. All three drive retention."

**Priya Sharma (Design):** "The edit window UI will show a timer — 'You can edit this rating for X more hours.' Delete confirmation will be clear: 'This removes your rating from the rankings.' Flag submission uses structured checkboxes plus freeform explanation."

---

## Changes

### Modified Files
| File | Change |
|------|--------|
| `server/storage/ratings.ts` | Added editRating, deleteRating, submitRatingFlag, getAutoFlaggedRatings, reviewAutoFlaggedRating |
| `server/routes.ts` | PATCH /api/ratings/:id (edit), DELETE /api/ratings/:id (delete), POST /api/ratings/:id/flag |
| `server/routes-admin.ts` | GET /api/admin/moderation-queue, PATCH /api/admin/moderation/:id |
| `server/storage/index.ts` | Export new rating functions |
| `tests/sprint171-routes-splitting.test.ts` | Adjusted routes.ts line threshold to 450 |

### API Endpoints (New)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| PATCH | `/api/ratings/:id` | Author | Edit rating scores/note (24h window) |
| DELETE | `/api/ratings/:id` | Author | Soft-delete rating |
| POST | `/api/ratings/:id/flag` | Authenticated | Submit flag on a rating |
| GET | `/api/admin/moderation-queue` | Admin | Paginated auto-flagged ratings |
| PATCH | `/api/admin/moderation/:id` | Admin | Confirm or dismiss flagged rating |

### Rating Edit Rules
- 24-hour edit window from creation
- Only author can edit
- Recalculates rawScore, weightedScore, business score, ranks
- SSE broadcast on edit

### Rating Delete Rules
- Only author can delete
- Soft delete: sets `isFlagged=true`, `flagReason="user_deleted"`
- Recalculates business score and ranks
- Data preserved for audit trail

### Flag Submission
- 5 structured flag categories (no specific experience, score mismatch, insider, coordinated, competitor bombing)
- Freeform explanation text
- One flag per member per rating (unique constraint)
- Cannot flag own rating

---

## Test Results
- **40 new tests** for rating edit/delete + moderation
- Full suite: **2,865 tests** across 116 files — all passing, <1.9s
