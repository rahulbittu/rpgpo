# SLT Backlog Prioritization Meeting — Sprint 175

**Date:** 2026-03-09
**Attendees:** Marcus Chen (CTO), Rachel Wei (CFO), Amir Patel (Architecture), Sarah Nakamura (Lead Eng)
**Facilitator:** Marcus Chen
**Previous Meeting:** Sprint 170

---

## Sprint 171-175 Retrospective

### Delivered
| Sprint | Feature | Story Points | Status |
|--------|---------|--------------|--------|
| 171 | routes.ts splitting (961→324 LOC) | 5 | SHIPPED |
| 172 | rate/[id].tsx decomposition (898→450 LOC) | 5 | SHIPPED |
| 173 | Business claim verification flow | 5 | SHIPPED |
| 174 | SEO for dish leaderboard pages | 5 | SHIPPED |
| 175 | Push notification triggers + SLT + Audit | 5 | SHIPPING |

### Metrics
- **Tests:** 2,520 across 108 files (up from 2,409 at Sprint 170)
- **Test speed:** <1.8s (stable)
- **Team morale:** 9/10 (four consecutive clean sprints)
- **Critique scores:** Pending for 173-175

---

## Review: Sprint 171-175 Themes

**Marcus Chen:** "This block had two themes: reduce technical debt (171-172) and unlock revenue (173-175). Routes.ts and rate/[id].tsx were the two recurring audit findings since Sprint 140 — both resolved. Claims verification unblocks Business Pro subscriptions. SEO creates our first organic acquisition channel. Push notifications activate the engagement loop."

**Rachel Wei:** "Business claim flow is the gatekeeper to our $49/mo dashboard tier. Without verified ownership, we can't sell dashboard access. Sprint 173 unblocked this. I want to see the first Business Pro subscription live by Sprint 180."

**Amir Patel:** "Architecture is clean. Ten route modules, no file over 900 LOC in source code, notification triggers follow the same pattern as everything else. The SEO module was a new surface area — I want to make sure we don't add more server-rendered endpoints without a caching strategy."

**Sarah Nakamura:** "Engineering velocity is high. Each sprint is 5 story points with tight scope. The technical debt window (171-172) paid off — we haven't had a single cascade failure from route changes since the split."

---

## Backlog Prioritization: Sprints 176-180

### P0 — Must Ship
| Sprint | Feature | Owner | Points | Rationale |
|--------|---------|-------|--------|-----------|
| 176 | Business Pro subscription flow | Sarah + Rachel | 5 | Revenue — Stripe integration for $49/mo dashboard tier |
| 177 | Owner dashboard response to ratings | Sarah + Priya | 5 | Feature required for Business Pro value prop |

### P1 — High Priority
| Sprint | Feature | Owner | Points | Rationale |
|--------|---------|-------|--------|-----------|
| 178 | QR code generation for businesses | Amir + Sage | 5 | In-venue rating capture, reduces cold-start friction |
| 179 | Challenger notifications + social sharing | Sarah + Jasmine | 5 | Engagement + virality for challenger feature |

### P2 — Important
| Sprint | Feature | Owner | Points | Rationale |
|--------|---------|-------|--------|-----------|
| 180 | SSR prerendering for SEO pages + SLT meeting | Amir | 5 | SEO pages need server rendering for faster indexing |

---

## Revenue Pipeline Status

**Rachel Wei:** "Three revenue streams are in different stages:"

| Stream | Status | Monthly Target | Blocker |
|--------|--------|----------------|---------|
| Challenger Entry ($99) | LIVE | $990/mo (10 entries) | Need more active challengers |
| Business Pro ($49/mo) | BLOCKED | $490/mo (10 subs) | Need payment flow (Sprint 176) |
| Featured Placement | NOT STARTED | TBD | Requires Business Pro adoption first |
| Premium API | NOT STARTED | TBD | Defer until user base >1000 |

---

## Architecture Concerns

**Amir Patel:**
1. "Profile SubComponents.tsx at 863 lines needs the same decomposition treatment we gave business/SubComponents.tsx in Sprint 145. Mark it for the next technical debt window."
2. "lib/badges.ts at 886 lines is complex but functional. Not urgent but should be on the radar."
3. "SEO routes add server-side rendering surface area. If we add SSR prerendering in Sprint 180, we need a caching layer — Redis or in-memory LRU."

---

## Action Items
- [ ] **Sprint 176:** Business Pro subscription — Stripe checkout + dashboard tier gating
- [ ] **Sprint 177:** Owner dashboard rating response UI
- [ ] **Sprint 178:** QR code generation for businesses
- [ ] **Sprint 179:** Challenger push notifications + social sharing
- [ ] **Sprint 180:** SSR prerendering + SLT meeting + Audit #18
- [ ] **Future:** Profile SubComponents.tsx decomposition
- [ ] **Future:** Redis caching for SEO endpoints

---

## Next SLT Meeting: Sprint 180
