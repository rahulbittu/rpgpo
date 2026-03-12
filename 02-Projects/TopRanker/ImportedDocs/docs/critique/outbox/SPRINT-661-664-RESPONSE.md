# Sprints 661-664 External Critique

## Verified wins
- Sprint 661 closed a specific audit item with concrete scope: `claim.tsx` and `routes-claims.ts` added to `thresholds.json`; tracked files now 33; 15 test files updated.
- Sprint 662 added action-URL enrichment on business detail view using Google Places API, with DB caching to avoid repeated fetches.
- Sprint 663 added an admin bulk enrichment endpoint: `POST /api/admin/enrichment/action-urls`, with explicit batching and rate limiting.
- Sprint 664 implemented Apple Sign-In across client and server paths: client integration, server-side JWT handling, account create/link flow, and conditional iOS UI.

## Contradictions / drift
- The biggest issue is in Sprint 664: calling it “full Apple Sign-In implementation” conflicts with the open admission that JWT verification checks issuer only and not signature/JWKS. That is not full verification.
- “Required for App Store submission” is asserted, but auth parity is incomplete: Apple Sign-In exists on `login.tsx` and not `signup.tsx`. That leaves a likely compliance gap in the exact feature claimed to unblock submission.
- Sprint 662 says action URLs are “auto-populate[d]” but the implementation is mostly synthetic URL construction for DoorDash/Uber Eats search pages, not true business-specific action URLs. The label overstates precision.
- The enrichment design is split across lazy first-view fetch and manual admin batch trigger, but the open question about cron shows the loop is still operationally incomplete for newly added businesses.
- Sprint 661 is threshold-accounting work, not core user value. Across 4 sprints, 2 of the 12 points went to compliance tooling rather than product loop improvement.

## Unclosed action items
- Apple JWT signature verification via JWKS is not closed and is the highest-risk security gap in the packet.
- Apple Sign-In screen parity is not closed; `signup.tsx` remains unresolved.
- Action URL quality is not closed; DoorDash/Uber Eats currently land on search results, not destination business pages.
- Enrichment automation is not closed; there is no scheduled mechanism for new businesses outside first-view/manual admin runs.
- Build size is being tracked but there is no mitigation plan despite a stated ceiling and trend line.

## Core-loop focus score
**6/10**

- Apple Sign-In likely helps acquisition/conversion, but the implementation is incomplete on security and likely incomplete on UI parity.
- Action URL enrichment is adjacent to the user loop and can improve outbound action success, but current URL quality is weak for delivery platforms.
- Batch enrichment is mostly operator tooling, not direct user-value.
- Threshold tracking is governance/compliance work, not core-loop movement.
- Across 4 sprints, there was some user-path work, but too much of it is partial, mislabeled as complete, or operationally unfinished.

## Top 3 priorities for next sprint
1. **Finish Apple Sign-In properly**
   - Add JWKS signature verification.
   - Resolve login/signup parity so App Store review risk is not left to interpretation.
   - Stop describing auth as complete until both are done.

2. **Tighten action URL correctness**
   - Measure click-through and landing quality for constructed DoorDash/Uber Eats URLs.
   - If direct destination links are unavailable, explicitly treat these as fallback search links in product copy and code, not “auto-fetched action URLs.”

3. **Close the enrichment lifecycle**
   - Add automatic enrichment for newly created/imported businesses.
   - Define a single source of truth for when enrichment runs so coverage does not depend on first-view traffic or manual admin intervention.

**Verdict:** This sprint set shipped useful pieces, but the packet overclaims completion. The worst example is Apple Sign-In: it is presented as full and App-Store-ready while lacking signature verification and possibly UI parity. The action URL work also sounds more complete than it is; search-result links are not true action URLs. Too many items are “implemented” but still asking foundational questions, which means they are not actually closed.
