# Critique Request: Sprints 671-674 External Critique

## Verified wins
- Sprint 671 appears to have added materially useful Google Places fields, not just cosmetic enrichment: editorial summary, hours, price level, and service flags.
- The overwrite rule for descriptions is constrained: “only overwrites empty description.” That reduces obvious data-clobber risk.
- Sprint 672 added explicit deep-link screen validation via an allowlist/type guard. That is a real hardening step.
- Sprint 672 also replaced `as string` casts with `typeof` guards in data fields. That is a concrete improvement in runtime safety.
- Sprint 674 addresses a clear compliance gap: account deletion is now present in Settings and tied to Apple guideline 5.1.1(v).

## Contradictions / drift
- Sprint 671 says “Full Details Enrichment,” but the trigger condition described is mostly about hours staleness. The feature scope is broader than the refresh policy actually justifies. You are using a full-details fetch path to solve an hours freshness problem.
- Sprint 671 mixes two very different operational modes without a stated consistency policy: automatic enrichment on detail view and admin bulk enrichment. No evidence here that freshness, overwrite, and rate-limit behavior are aligned across both.
- Sprint 672 duplicates notification-channel mapping in `lib/notifications.ts` and `server/push.ts`. That is immediate configuration drift risk, and you already called it out yourself. This is not a hypothetical cleanup item; it is an active contradiction in a multi-channel notification system.
- Sprint 672 says channel importance and vibration are defined per channel, while server `push.ts` maps notification type to channelId. If the map diverges from client channel definitions, delivery semantics drift silently. The packet provides no guard against that.
- Sprint 674 claims “Full Apple compliance checklist verified,” but the same packet raises uncertainty about deletion UX messaging around the 30-day grace period. “Fully verified” is overstated if deletion semantics in UI are still ambiguous enough to ask follow-up questions.
- Sprint 673 is mostly layout polish. Across four sprints, this is the clearest drift away from core product loop compared with enrichment, notifications, and compliance.

## Unclosed action items
- Decide and document the cache/freshness policy for Google Places refreshes, especially `isOpenNow`. The current “>24h stale” trigger is acknowledged as unresolved.
- Remove duplicated notification-channel mapping by extracting a shared source of truth or otherwise enforcing parity between client and server.
- Decide whether unknown deep-link attempts should be logged/tracked instead of being silently dropped.
- Resolve deletion UX ambiguity: if server behavior includes a 30-day grace period, define whether UI needs exact timing, countdown, or confirmation email.
- Replace or centralize the hardcoded `-16` negative-margin layout constant if that pattern is intended to persist.

## Core-loop focus score
**6/10**

- S671 improves business-detail quality, which is close to the product loop if users depend on fresh place data.
- S672 improves notification delivery semantics and deep-link safety, which supports re-engagement, but much of it is infrastructure rather than user-visible loop improvement.
- S674 is necessary compliance work, but it is defensive maintenance, not loop acceleration.
- S673 is low-leverage polish relative to the rest of the packet and weakens overall focus.
- The packet shows multiple unresolved policy questions, which suggests shipping implementation before settling product/operational rules.
- There is too much “done” language around areas that still have obvious source-of-truth and behavior-definition gaps.

## Top 3 priorities for next sprint
1. **Unify notification channel configuration**
   - Eliminate duplicate channel/type mapping between client and server.
   - Add a parity check or shared module so channel semantics cannot drift silently.

2. **Define enrichment freshness and fetch policy**
   - Separate “hours freshness” from “full details enrichment” if they have different update cadences.
   - Set explicit TTLs and overwrite rules per field instead of one broad trigger on business detail view.

3. **Close the compliance and observability gaps**
   - Make account deletion messaging match actual server behavior precisely.
   - Add instrumentation for rejected/unknown deep links instead of silent drops.

**Verdict:** This was a mixed sprint block: one useful data-enrichment feature, one worthwhile hardening pass, one necessary compliance patch, and one low-value layout cleanup. The main problem is not lack of output; it is shipping around unresolved policy and source-of-truth issues, then describing the result as complete. The duplicated notification mapping and the vague enrichment refresh policy are the biggest signs of avoidable drift.
