# SPRINT-676-679-REQUEST External Critique

## Verified wins
- Audit finding closure is plausibly addressed: the packet states a new `shared/notification-channels.ts` is now imported by both `lib/notifications.ts` and `server/push.ts`, which directly targets duplication in Audit #130 finding A130-L1.
- Test expansion is concrete: 66 new tests across 12 suites is a measurable increase, with stated coverage for enrichment contracts, deep link validation edge cases, and shared-channel import behavior.
- Service flags appear wired end-to-end in the packet: schema columns added, enrichment saves Google Places flags, and the business detail page conditionally renders chips when any flag is true.
- Rating reminder work is not just copy changes: the packet describes tiering logic, lookup of last-rated business, and a client-side `ratingReminder` template, indicating actual delivery of reminder infrastructure rather than only planning.

## Contradictions / drift
- Sprint scope is called “architecture cleanup, testing, UI features, and engagement infrastructure,” but there is no evidence of outcome validation for the engagement work. You built personalization logic, but provided no delivery metrics, no send counts, no CTR/open/rating conversion data, and no guardrail metrics. That is implementation completion, not product validation.
- Sprint 677 claims “integration tests verifying client and server both import from shared channels,” but the packet also says most new tests are “contract-based (reading file contents).” Reading imports from file contents is not runtime integration. That is a mismatch in terminology and overstates confidence.
- Sprint 676 frames `shared/` as “single source of truth,” but no evidence is provided that platform-specific drift is impossible now. Shared constants reduce duplication; they do not prove equivalent runtime behavior on Expo client and server push sender.
- Sprint 678 added 5 new business schema columns while simultaneously raising concern about schema file size at 911 LOC. That is continued schema sprawl during a period supposedly concerned with cleanup.
- The reminder logic tiers are overlapping as written: Tier 1 is “2–14 days inactive,” Tier 2 is “7+ days, no recent ratings.” Without a precise precedence rule, users in the 7–14 day range may qualify for both. The packet does not state tie-breaking.
- The “deep link to business” claim in Sprint 679 depends on last-rated business lookup, but no test evidence is cited for end-to-end deep link generation for personalized reminders. You tested `isValidDeepLinkScreen` edge cases in Sprint 677, which is adjacent, not proof this feature path works.

## Unclosed action items
- Resolve the tier overlap in rating reminders and document exact precedence/exclusion rules for 7–14 day inactive users.
- Replace or supplement file-content “contract” tests with runtime integration tests for shared notification channels and reminder payload generation.
- Decide whether business service flags stay as discrete booleans or move toward a more extensible structure before more flags are added.
- Set a schema split boundary now. At 911/950 LOC, waiting until after the file crosses the threshold is avoidable churn.
- Assess the per-user last-rated-business query pattern with actual batch cardinality data. The packet asks if N+1 is acceptable but gives no evidence either way.
- Validate reminder effectiveness and safety with production metrics or at minimum instrumentation: eligible users, sends, failures, opens, deep-link opens, rating conversions, opt-outs.

## Core-loop focus score
**6/10**

- Service flags on business pages are directly in the user-facing discovery/evaluation loop.
- Personalized rating reminders target re-engagement into the rating loop, but there is no evidence they were instrumented or validated.
- Shared notification channel cleanup is necessary maintenance, but it is not core-loop expansion.
- A large portion of the work is test and architecture hardening around previous features rather than new loop improvement.
- The sprint packet emphasizes implementation completeness over proving improved user behavior.
- The most core-loop-relevant item, reminders, is also the least evidenced in terms of actual impact.

## Top 3 priorities for next sprint
1. **Instrument and validate rating reminders.** Add eligibility, send, failure, open, deep-link-open, and rating-conversion tracking. Without this, Sprint 679 is unfinished from a product standpoint.
2. **Fix ambiguity and harden reminder logic.** Eliminate tier overlap, define precedence, and add runtime tests for payload selection and business deep links.
3. **Stop passive schema growth.** Set and execute a schema split plan, and make a deliberate decision on service-flag modeling before adding more columns.

**Verdict:** This packet shows solid implementation throughput, but it overclaims confidence in a few places and leaves the most important user-impacting work half-closed. The biggest issue is Sprint 679: you shipped personalization logic without proving it behaves correctly at boundaries or produces any measurable engagement. The testing story is also padded by calling file-inspection tests “integration.” Cleanup happened, but drift continues in schema growth and in mixing maintenance with unvalidated engagement work.
