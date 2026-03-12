# SLT + Architecture Meeting — Sprint 150 Boundary

**Date:** 2026-03-08
**Meeting Type:** SLT Backlog Prioritization (Every 5 Sprints)
**Attendees:** Marcus Chen (CTO), Rachel Wei (CFO), Amir Patel (Architecture), Sarah Nakamura (Lead Eng)
**Review Period:** Sprint 146-149
**Previous SLT:** Sprint 145
**Next SLT:** Sprint 155

---

## 1. Sprint 147-149 Review

**Marcus Chen:** "This cycle was a turning point. We broke through the 8-score ceiling that had been haunting us for over ten sprints. Sprint 149 landed a 9/10 external critique — our highest ever. The catalyst was straightforward: we stopped building infrastructure and started shipping user-visible features. Sprint 147 delivered critical user-facing bug fixes including search suggestions filtering and profile tier UI redesign. Sprint 148 introduced settings server sync so user preferences survive across devices with the notificationPrefs jsonb column. Sprint 149 shipped the edit profile screen with a real PUT /api/members/me endpoint, a proper updateMemberProfile storage function, and notification unification collapsing the confusing dual-toggle system. Test suite stands at 2049 across 88 files. That is a 168-test jump from the 1881 we had at Audit #13. Community reviews are confirmed functional with the existing API. The velocity is real."

**Sarah Nakamura:** "What changed was the sprint posture. Previous cycles were experiment pipelines, decomposition patterns, and HTTP freshness tests — all necessary but invisible to users. Sprint 147-149 flipped that: every sprint shipped something a user could see and interact with. The edit profile screen added PUT /api/members/me with cookie-based auth, Drizzle storage, and proper validation. The notification unification collapsed 3 profile keys and 6 settings keys into a single source of truth. Settings sync gives us cross-device persistence for the first time. The backend setup guide in docs/SETUP.md means a new contributor can stand up the full stack without hand-holding. Engineering capacity was well-utilized — 42 new tests per sprint average."

**Amir Patel:** "Architecturally, the new code is clean but introduces questions we need to resolve. PUT /api/members/me uses cookie-based auth with no user ID in the URL — correct pattern, consistent with our existing API. The notificationPrefs jsonb column on members is flexible but untyped at the database level — we rely entirely on application-layer validation to prevent malformed data. The edit-profile.tsx screen is well-structured with a placeholder avatar section rendering user initials. That is an explicit IOU: avatar upload needs a storage strategy decision this meeting. The SubComponents.tsx files from the Sprint 140-145 decomposition cycle remain monolithic — challenger at 531 LOC, search at 554 LOC, leaderboard at 503 LOC. Those need splitting."

**Rachel Wei:** "The 9/10 critique score is the strongest signal we have had for investor conversations. The narrative shift from 'we built robust infrastructure' to 'users can now manage their profile, sync settings, and get a consistent notification experience' is exactly what I needed for the board. On revenue: Challenger flow is still live, Business Pro subscription is active, but we still have not closed the experiment outcomes API that I escalated to P0 at Sprint 145. That pipeline is the bridge to proving trust features drive engagement. However — the user-visible feature push was the right call for critique scores and product quality. I am recalibrating the experiment timeline to Q2 rather than keeping it as an emergency P0."

---

## 2. Q2 Product Roadmap Priorities

**Marcus Chen:** "Three strategic lanes for the next 5 sprints."

### Lane 1: User Identity and Social (User-Facing)

| Feature | Priority | Effort | Dependency |
|---------|----------|--------|------------|
| Avatar upload (photo picker + cloud storage) | P0 | 2 sprints | Storage strategy decision (this meeting) |
| Push notification delivery (APNs/FCM) | P1 | 1 sprint | Server-side prefs done |
| Real-time ranking updates (client SSE subscription) | P1 | 1 sprint | SSE already implemented |
| Community reviews enhancement with Google Places data | P1 | 1 sprint | Setup guide delivered |

### Lane 2: Developer and Deployment Infrastructure

| Feature | Priority | Effort | Dependency |
|---------|----------|--------|------------|
| CD pipeline (GitHub Actions + Expo EAS) | P0 | 1 sprint | CI already done |
| Staging environment setup | P1 | 1 sprint | CD pipeline |
| App Store submission prep (iOS + Android) | P1 | 2 sprints | CD pipeline + staging |
| First TestFlight build | P1 | 1 sprint | App Store prep |

### Lane 3: Revenue and Analytics

| Feature | Priority | Effort | Dependency |
|---------|----------|--------|------------|
| Stripe payment flow completion (challenger + business pro) | P1 | 1 sprint | Webhook verification |
| Business Pro dashboard (owner-scoped analytics) | P1 | 2 sprints | Existing analytics endpoints |
| Experiment outcomes API completion | P1 | 1 sprint | Statistical engine exists |
| Featured Placement trust-impact validation | P2 | 2 sprints | Experiment outcomes API |

**Rachel Wei:** "Lane 1 is the critique score defender — we need to keep shipping user-visible features. Lane 2 is the launch prerequisite — we cannot submit to app stores without a CD pipeline and staging environment. Lane 3 is the revenue foundation. Revenue infrastructure is 70% there. The Stripe webhook verification and subscription management are the critical path. I'd recommend prioritizing those in Sprints 153-154 after avatar upload and CD pipeline."

---

## 3. Avatar Upload Strategy Decision

**Marcus Chen:** "First decision item. We need cloud storage for user avatars. Two options: AWS S3 or Cloudflare R2."

**Amir Patel:** "Tradeoff analysis."

| Criterion | AWS S3 | Cloudflare R2 |
|-----------|--------|---------------|
| Cost (egress) | $0.09/GB after free tier | $0.00/GB — zero egress fees |
| Cost (storage) | $0.023/GB/month | $0.015/GB/month |
| SDK maturity | Mature, well-documented | S3-compatible API, minor edge cases |
| CDN integration | CloudFront (separate config) | Built-in, automatic |
| Presigned URLs | Native support | S3-compatible support |
| Migration complexity | Low — standard S3 SDK | Low — same SDK with different endpoint |

**Amir Patel:** "My recommendation is Cloudflare R2. Zero egress fees eliminate the cost surprise that hits early-stage companies when user-generated content scales. The S3-compatible API means we use the same @aws-sdk/client-s3 package — the only difference is the endpoint URL. We get built-in CDN without configuring CloudFront. The risk is minor edge cases in S3 compatibility, but for our use case — presigned upload URLs for avatars with content-type validation — R2 is well-proven."

**Nadia Kaur (invited for security input):** "Either option works from a security standpoint. Requirements regardless of provider: presigned URLs with 5-minute expiry, content-type validation server-side for image/jpeg, image/png, and image/webp only, file size limit of 5MB, server-side EXIF metadata stripping before permanent storage, and a separate bucket for user uploads — never mix with application assets."

**Rachel Wei:** "R2's zero egress is compelling. If we scale to 100K users each with a 500KB avatar, that is 50GB of storage at $0.75/month on R2 versus $0.75 storage plus significant egress on S3. The egress difference becomes material when avatars are loaded on every profile view, business page, and review card. I need a budget review for R2 plus EAS Build costs by Sprint 151."

**Marcus Chen:** "Decision: Cloudflare R2 for avatar storage. Amir, spec the upload pipeline."

### Decision: Cloudflare R2 — APPROVED

**Implementation plan:**
1. Server: presigned upload URL endpoint (POST /api/upload/avatar)
2. Client: photo picker integration in edit-profile.tsx
3. Server: confirm upload, strip EXIF, generate thumbnail
4. Storage: update members table with avatarUrl column
5. Client: display avatar in profile, reviews, leaderboard

---

## 4. CD Pipeline Priority

**Sarah Nakamura:** "CI is done — we have test automation that catches regressions. What we lack is continuous deployment. Currently deployment is manual. This is not sustainable for app store submissions where we need reproducible builds."

**Marcus Chen:** "What is the minimum viable CD pipeline?"

**Sarah Nakamura:** "Three stages. First, GitHub Actions workflow triggered on merge to main — runs full test suite, lint, type check, and build. Second, on success, deploy to staging environment automatically. Third, manual promotion from staging to production via GitHub release tag. This gives us automated quality gates plus a human checkpoint before production. Estimated effort: 1 sprint. The workflow should also build the Expo bundle for iOS and Android via EAS Build so binaries are ready when we need them for app store submission."

**Amir Patel:** "CD after avatar upload is the right sequencing. Avatar needs the R2 infrastructure first, then CD automates the deployment of that and everything after it."

### Decision: CD Pipeline Sprint 152, After Avatar Upload — APPROVED

---

## 5. Technical Debt Assessment

### Resolved Since Last SLT (Sprint 145)
- Notification preference mismatch (3 vs 6 keys) — unified to single source of truth
- Settings not syncing to server — fixed with server persistence
- Missing edit profile screen — shipped with PUT endpoint
- Setup documentation gap — docs/SETUP.md delivered

### Active Debt

| Item | Priority | Age | Notes |
|------|----------|-----|-------|
| 5 unwrapped async handlers (wrapAsync) | P2 | 3 audit cycles | Trivial fix, repeatedly deprioritized |
| 4 redundant try/catch blocks in routes.ts | P2 | 3 audit cycles | Same — 20-minute fix |
| Dead dependencies (expo-google-fonts/inter, expo-symbols) | P2 | 2 audit cycles | 5-minute removal |
| CHANGELOG stale (last entry Sprint 136) | P2 | 14 sprints behind | Worsening each sprint |
| notificationPrefs jsonb untyped at DB level | P2 | New | Application-only validation |
| Avatar stored as base64 data URL | P1 | New | Needs CDN migration (R2) |
| No CD pipeline | P0 | Ongoing | Manual deployment |
| Email change flow not implemented | P3 | Ongoing | Edit profile shows read-only email |
| Version hardcoded to 1.0.0 | P3 | Ongoing | Should read from package.json |
| Profile.tsx unused notification state | P2 | New | Leftover from pre-unification |

**Marcus Chen:** "The 3-audit-cycle P2 items are unacceptable. wrapAsync wrapping and redundant try/catch have been open since Audit #12. They are not complex — they are just not prioritized. I want them closed in Sprint 151. No more carrying."

### Debt Reduction Plan
- Sprint 151: Close all carried P2 items (wrapAsync, try/catch, dead deps, CHANGELOG backfill), CDN avatar upload
- Sprint 152: CD pipeline + deployment automation, clean up notification state
- Sprint 153-154: Stripe payment flow completion
- Sprint 155: App Store prep

---

## 6. Revenue Readiness Status

**Rachel Wei:** "Updated revenue pipeline."

| Stream | Price Point | Status | Blocker |
|--------|-------------|--------|---------|
| Challenger | $99 one-time | UI complete, payment integration live | Stripe webhook verification |
| Business Pro Dashboard | $49/month | Dashboard complete, subscription flow live | Subscription management |
| Featured Placement | $199/week | API + UI complete | Payment flow testing |
| Premium API | Usage-based | Not started | After launch |

**Rachel Wei:** "Revenue infrastructure is 70% there. The Stripe webhook and subscription management are the critical path. I'd recommend prioritizing these in Sprints 153-154 after avatar upload and CD pipeline. The board wants revenue projections — we need to show at least one revenue stream end-to-end by the Q2 board meeting."

**Marcus Chen:** "Agreed. Every sprint from 151-155 must include at least one revenue-enabling task. The Business Pro dashboard is the fastest path — it is a scoped variant of our existing analytics endpoints. Stripe webhook verification is the other quick win."

**Amir Patel:** "The analytics funnel, admin dashboard endpoint, and member-scoped queries are all in place. The Business Pro dashboard is primarily a frontend build with a filtered API endpoint. I estimate 1.5 sprints of dedicated work."

### Decision: Mandatory Revenue Task Per Sprint 151-155 — APPROVED

---

## 7. Next User-Visible Features

**Marcus Chen:** "After edit profile, what ships next that users can see and interact with?"

**Sarah Nakamura:** "In priority order: avatar upload is the immediate next step since users are staring at initials. Push notification delivery connects the server-side preferences we just unified to actual device notifications via APNs and FCM. Real-time ranking updates let users see position changes without refreshing — SSE is already implemented server-side, we just need client subscription. Community reviews enhancement with real Google Places data is the next big content play."

**Amir Patel:** "I would add: the avatar upload pipeline we are building for R2 is a template for all future user-generated content — review photos, business claim documents, badge images. Building it right now means we do not retrofit later."

**Rachel Wei:** "From a market perspective, push notifications are the highest-impact feature for retention. Users who receive at least one push notification in their first week have 2x the 30-day retention rate. That is industry data we should not ignore."

### Decision: Avatar Upload, then Push Notifications, then Stripe Payment Completion — APPROVED

---

## 8. App Store Submission Timeline

**Marcus Chen:** "What is a realistic timeline?"

**Sarah Nakamura:** "The dependency chain is: CD pipeline with EAS Build integration (Sprint 152), staging environment (Sprint 153), app store metadata, screenshots, and privacy policy updates (Sprint 154-155), TestFlight beta and Google Play internal testing (Sprint 156-158), submission (Sprint 160)."

**Rachel Wei:** "Sprint 160 target for first TestFlight build. That gives us time to iterate on the beta before a public submission."

**Jasmine Taylor (invited for marketing input):** "App store metadata needs to be ready early. Name, description, keywords, category selection, screenshots for all device sizes, and the privacy nutrition label. I will start the metadata review at Sprint 155."

### Decision: Target Sprint 160 for First TestFlight Build — APPROVED

---

## 9. Key Decisions

| # | Decision | Status | Owner | Deadline |
|---|----------|--------|-------|----------|
| 1 | Cloudflare R2 for avatar storage. Zero egress, S3-compatible API. | **APPROVED** | Amir Patel | Sprint 152 |
| 2 | CD pipeline at Sprint 152. GitHub Actions + Expo EAS for mobile builds. | **APPROVED** | Sarah Nakamura | Sprint 152 |
| 3 | Next features after edit profile: avatar upload, push notifications, Stripe payment completion. | **APPROVED** | Marcus Chen | Sprint 151+ |
| 4 | App Store timeline: target Sprint 160 for first TestFlight build. | **APPROVED** | Marcus Chen | Sprint 160 |
| 5 | Mandatory revenue-enabling task in every sprint 151-155. | **APPROVED** | Rachel Wei | Ongoing |
| 6 | Close all 3-audit-cycle P2 debt items in Sprint 151. No further carrying. | **APPROVED** | Sarah Nakamura | Sprint 151 |
| 7 | Budget review for R2 + EAS costs. | **APPROVED** | Rachel Wei | Sprint 151 |
| 8 | Arch Audit #14 at Sprint 150 — focus on new endpoint security, notification schema, avatar readiness. | **APPROVED** | Amir Patel | Sprint 150 |

---

## 10. Action Items

| # | Priority | Item | Owner | Target | Status |
|---|----------|------|-------|--------|--------|
| 1 | P0 | Avatar upload with Cloudflare R2 — presigned URLs, content validation, EXIF stripping | Derek Olawale | Sprint 151 | NEW |
| 2 | P0 | CD pipeline spec and implementation — GitHub Actions + EAS Build | Amir Patel | Sprint 152 | NEW |
| 3 | P1 | Wrap 5 bare async handlers with wrapAsync | Sarah Nakamura | Sprint 151 | CARRYOVER (Audit #12, #13, #14) |
| 4 | P1 | Remove 4 redundant try/catch blocks in routes.ts | Sarah Nakamura | Sprint 151 | CARRYOVER (Audit #12, #13, #14) |
| 5 | P1 | Stripe webhook testing and verification | Sarah Nakamura | Sprint 153 | NEW |
| 6 | P1 | Business Pro owner-scoped analytics dashboard | Amir Patel | Sprint 154 | CARRYOVER (Sprint 145 SLT) |
| 7 | P1 | Experiment outcomes API — GET /api/experiments/:id/results | Sarah Nakamura | Sprint 153 | CARRYOVER (Sprint 145 SLT) |
| 8 | P2 | CHANGELOG backfill Sprints 137-149 | Priya Sharma | Sprint 151 | CARRYOVER (Audit #13) |
| 9 | P2 | Remove dead dependencies (expo-google-fonts/inter, expo-symbols) | Sarah Nakamura | Sprint 151 | CARRYOVER (Audit #13) |
| 10 | P2 | Clean up unused notification state in profile.tsx | Derek Olawale | Sprint 151 | NEW |
| 11 | P2 | Budget review for R2 + EAS Build costs | Rachel Wei | Sprint 151 | NEW |
| 12 | P1 | App Store metadata review — name, description, keywords, screenshots | Jasmine Taylor | Sprint 155 | NEW |
| 13 | P3 | Split SubComponents.tsx files into individual components | Amir Patel | Sprint 153 | CARRYOVER (Audit #13) |
| 14 | P3 | rate/[id].tsx decomposition (858 LOC) | Priya Sharma | Sprint 154 | CARRYOVER (Audit #13) |

---

## 11. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Cloudflare R2 S3-compatibility edge cases delay avatar upload | Low | Medium — feature slip by 1 sprint | Use standard S3 SDK patterns only; have S3 fallback config ready |
| CD pipeline setup blocks app store timeline | Medium | High — entire Q2 launch timeline shifts | Timebox to 1 sprint; use minimal viable config and iterate |
| Revenue tasks deprioritized again under user-feature pressure | Medium | Critical — board presentation lacks revenue data | CFO sign-off required to remove any revenue task from a sprint |
| App store review rejection on first submission | High | Medium — 1-2 week delay | Begin metadata prep early; review Apple/Google guidelines in Sprint 154 |
| P2 debt items carried into fourth audit cycle | Medium | Low — no runtime risk, but signals process failure | Hard mandate from CTO: close in Sprint 151 or escalate to P1 |

---

## Meeting Adjourned

**Marcus Chen:** "This was a strong cycle. The critique score breakthrough to 9/10 validates the strategy shift toward user-visible features. Sprint 147-149 delivered real user value: bug fixes, settings sync, edit profile, notification unification. The next cycle is about compounding that momentum while closing the deployment and revenue gaps. Avatar upload gives users identity. CD pipeline gives us deployment confidence. Stripe completion gives us revenue proof. Every sprint must advance all three lanes."

**Rachel Wei:** "The 9/10 critique score is the strongest signal we have had for investor conversations. But the board cares about revenue trajectory, not quality scores. The mandatory revenue task per sprint is non-negotiable. If we can demo end-to-end Stripe payment by the Q2 board meeting, that changes the funding conversation entirely."

**Amir Patel:** "The Cloudflare R2 decision simplifies our cloud story — zero egress means we do not need to budget for CDN costs scaling with user growth. The avatar pipeline is a template for all future user-generated content. The SubComponents.tsx splitting and wrapAsync debt need to close this cycle — three audit cycles is the absolute limit for P2 items."

**Sarah Nakamura:** "Engineering is in a good position. 2049 tests, 88 files, strong coverage. The CD pipeline is the biggest force multiplier in the backlog — once we have automated deployment, every sprint ships faster. I am committing to closing all carried P2 debt in Sprint 151 alongside the avatar upload backend. The team has bandwidth."

---

**Next SLT + Architecture Meeting:** Sprint 155
