# Sprint Critique Request — Sprints 186-189 External Critique

## Verified wins
- Security posture improved in auth flows:
  - Email verification and password reset fields were added to schema.
  - Reset tokens are one-time use with 1-hour expiry.
  - Password reset response avoids email enumeration.
- Restaurant onboarding moved from manual-only toward automation:
  - Google Places bulk import exists.
  - Dedup by `googlePlaceId` is defined.
  - Admin-only import endpoints were added.
- Referral tracking is no longer just conceptual:
  - A referrals table exists.
  - Signup reads a referral code and creates a referral record.
  - Activation is wired to first rating.
  - Referral API/validation endpoint exists.
- Redis integration is real, not aspirational:
  - `ioredis` added.
  - Cache-aside fail-open pattern implemented.
  - Cache invalidation is tied to `recalculateRanks()`.
  - Rate limiter can use Redis or memory.
  - Perf endpoint exposes cache hit/miss stats.
- Test volume is substantial across the four sprints: 78 + 36 + 44 + 41 new tests.

## Contradictions / drift
- Sprint grouping is broad and infrastructure-heavy, but the stated proposed next sprint is planning/audit/beta prep rather than closing obvious product and operational gaps. That is drift from “ship beta safely.”
- Referral system is backend-complete enough to track records, but the packet explicitly says client-side referral UI is not built. That means the feature is only partially usable for beta growth.
- Email verification was implemented, but the request still asks whether verification should be required before rating. That means the enforcement decision was deferred even after shipping the underlying mechanism.
- Redis caching was added, but no evidence is provided for cache correctness under stale data, invalidation coverage beyond `recalculateRanks()`, or observed performance need. This risks premature infra work relative to beta-readiness gaps like backups and production email.
- “Clean sprint streak” and morale are reported, but there has been no external critique since Sprint 164. Internal cleanliness claims have been unchallenged for 21 sprints.
- Search remains at 870 LOC and `108 as any` casts remain. Stable neglect is still neglect.

## Unclosed action items
- Decide and enforce whether email verification is required before rating, referral activation, or other core actions.
- Replace nodemailer-only setup with a production ESP before beta if real user email delivery matters.
- Implement automated DB backups. This is a direct beta-launch operational gap.
- Build the client-side referral UI or stop treating referral tracking as a meaningful beta acquisition lever.
- Break up `search.tsx` at 870 LOC; it is a known unresolved issue carried forward.
- Reduce or contain the 108 `as any` casts, especially around auth, referrals, caching, and admin import paths.
- Validate cache invalidation coverage outside `recalculateRanks()` and confirm TTL choices with actual usage patterns.
- Review referral lifecycle design; current `signed_up -> activated` flow is minimal and may be too coarse for abuse handling, reversals, or delayed qualification.

## Core-loop focus score
**6/10**

- Email verification/reset supports trust and recovery, which helps the loop indirectly.
- Restaurant import improves supply-side content availability, which can help the loop materially.
- Referral tracking is adjacent to growth, but without client UI it is incomplete for users.
- Redis caching improves performance, but this is support work unless there is proven user-facing latency pain.
- Too much of the work sits in platform/admin/backend layers while key beta-launch decisions remain open.
- Core-loop enforcement questions are still undecided after implementation work, especially around verified users and rating eligibility.

## Top 3 priorities for next sprint
1. **Close beta-readiness gaps before more platform work**
   - Production email delivery
   - Automated DB backups
   - Explicit auth/rating policy for email verification

2. **Finish or narrow referral scope**
   - Either ship the client referral UX for beta or stop spending on referral backend complexity until it is user-visible.

3. **Do a focused risk pass on correctness, not another feature sweep**
   - Verify cache invalidation coverage
   - Review referral abuse/state model
   - Audit the highest-risk `as any` and auth/admin paths

**Verdict:** These four sprints delivered real backend capability, but the portfolio is scattered: auth hardening, import automation, referrals, and caching all moved, while basic beta-launch readiness remains visibly incomplete. The biggest issue is not lack of output; it is unresolved product and operational decisions after implementation has already happened. You are closer to a technically interesting system than to a disciplined 100-user beta launch.
