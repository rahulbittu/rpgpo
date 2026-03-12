# Sprint 150 — Avatar Upload & Edit Profile Polish (Cadence Sprint)

**Date**: 2026-03-08
**Theme**: Avatar Upload, Profile UX, SLT Meeting + Arch Audit #14
**Story Points**: 13
**Tests Added**: 20 (2,067 total across 89 files)

---

## Mission Alignment

A profile without a face is a profile without trust. Avatar upload gives members visual
identity in the credibility system, and the edit profile polish removes friction from
the save flow. This cadence sprint also includes the SLT Backlog Meeting (Q2 roadmap)
and Architectural Audit #14 — both on schedule at the 5-sprint mark.

---

## External Critique

Sprint 149 received a **9/10** from external review — the first time we have broken
through the plateau. The feedback cited consistent test discipline, clean architecture,
and production-grade error handling as differentiators. The team is energized heading
into this cadence sprint.

---

## Team Discussion

**Marcus Chen (CTO)**: "The SLT meeting covered three pillars for Q2: revenue readiness,
avatar infrastructure, and notification cleanup. Revenue-wise, we are green on Challenger
($99) and Business Pro ($49/mo) — Jasmine's funnel numbers confirm conversion is tracking.
The R2 decision for avatar storage is the right call: Cloudflare R2 gives us S3-compatible
object storage at zero egress cost. Base64 inline is fine for MVP but we need CDN-backed
URLs before we hit 10k members. That is a P1 from the audit and I agree with it."

**Sarah Nakamura (Lead Engineer)**: "Avatar upload endpoint is POST /api/members/me/avatar
with a 2MB limit enforced via multer middleware. The handler calls updateMemberAvatar which
writes to local storage for now and returns the URL. On the client side, the edit profile
screen now has three distinct states: loading (ActivityIndicator in place of the save
button), success (green check + toast), and error (inline red message with retry). The
save button is disabled during submission to prevent double-tap. 20 new tests cover the
full lifecycle — upload validation, size rejection, state transitions, and the photo
picker base64 preview."

**Amir Patel (Architecture)**: "Audit #14 came back A-minus. Two P1 findings: first,
avatar images are stored as base64 blobs in the database row, which balloons row size
and kills query performance at scale — we need to move to R2 object storage with CDN
URLs within 2 sprints. Second, the profile notification state is not cleaned up on
unmount, leading to stale toast messages if the user navigates away mid-save. Both are
addressable without architectural changes. Everything else — API versioning, error
boundaries, GDPR compliance, security headers — rated ALL CLEAR."

**Derek Olawale (Frontend)**: "Photo picker implementation is platform-aware. On web,
we render a hidden file input with accept='image/*' and trigger it from the avatar
touchable. On native, we would use expo-image-picker but web-first means the file
input path is what ships today. Selected image is read as base64 via FileReader, set
as the preview URI immediately, then sent to the upload endpoint on save. The instant
preview makes it feel responsive even before the network round-trip completes."

**Priya Sharma (Design)**: "The edit profile screen needed visual hierarchy work. The
avatar is now 96px with a camera overlay badge, the form fields have consistent 16px
vertical spacing, and the save button uses our amber primary with a white ActivityIndicator
that matches the button height so there is no layout shift during loading. Error state
is a 12px red caption below the button — not a modal, not an alert, just inline text
that respects the user's attention."

**Jasmine Taylor (Marketing)**: "From a growth perspective, profiles with avatars get
3x more engagement on trust-based platforms. We are seeing similar patterns in our early
cohort data. Q2 marketing push will lean into 'put a face to your credibility' messaging.
The SLT meeting confirmed budget for a referral program tied to profile completion —
avatar upload is a key gate in that funnel."

**Nadia Kaur (Security)**: "The 2MB limit is enforced server-side via multer, not just
client-side validation. We also validate MIME type (image/jpeg, image/png, image/webp)
and reject anything else with a 415 response. Base64 storage is a temporary concern —
it is not a security risk per se, but oversized blobs increase attack surface for
denial-of-service via repeated uploads. Rate limiting on the avatar endpoint is already
in place at 5 requests per minute per authenticated user."

**Rachel Wei (CFO)**: "Q2 budget is locked. R2 storage costs are negligible at our
current scale — under $5/month for the first 10GB. The real cost question is CDN:
Cloudflare's free tier covers us through launch, but if we hit the premium API tier
we need to budget $20/month for cache purge APIs. SLT approved the spend. Revenue
projections for Challenger and Business Pro are on track — we are not burning runway
on infrastructure we cannot afford."

---

## Changes

### Avatar Upload Endpoint
- `POST /api/members/me/avatar` — multer middleware with 2MB fileSize limit
- MIME validation: jpeg, png, webp only (415 on rejection)
- `updateMemberAvatar` storage function writes file, returns URL
- Rate limited at 5 req/min per authenticated user

### Edit Profile Polish
- **Loading state**: ActivityIndicator replaces save button text during submission
- **Success state**: Green check icon + toast notification on successful save
- **Error state**: Inline red caption below save button with retry affordance
- Save button disabled during submission to prevent double-tap

### Photo Picker (Web)
- Hidden file input with `accept="image/*"` triggered from avatar touchable
- FileReader converts selected image to base64 for instant preview
- Base64 payload sent to upload endpoint on form save
- Camera overlay badge (24px) on avatar circle indicates editability

### SLT Backlog Meeting — Q2 Roadmap
- Output: `/docs/meetings/SLT-BACKLOG-150.md`
- Q2 pillars: revenue readiness, avatar CDN migration, notification cleanup
- R2 object storage approved for avatar images (replaces base64 inline)
- Referral program tied to profile completion approved for marketing
- Next SLT meeting: Sprint 155

### Architectural Audit #14
- Output: `/docs/audits/ARCH-AUDIT-150.md`
- **Grade: A-**
- P1: Avatar base64 storage needs CDN migration (target: Sprint 152)
- P1: Profile notification state not cleaned on unmount (target: Sprint 151)
- ALL CLEAR: API versioning, error boundaries, GDPR, security headers, test coverage
- Next audit: Sprint 155

### Tests
- 20 new tests across avatar upload, edit profile states, and photo picker
- **2,067 total tests across 89 files**, all passing

---

## What's Next (Sprint 151)

- P1 fix: Clean up profile notification state on unmount
- Begin R2 avatar storage migration (P1 from Audit #14)
- Profile completion progress bar (tied to referral funnel)
