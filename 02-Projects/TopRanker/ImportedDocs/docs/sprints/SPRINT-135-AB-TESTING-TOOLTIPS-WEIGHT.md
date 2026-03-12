# Sprint 135: A/B Testing Framework, Confidence Tooltips, Personalized Vote Weight

**Date:** 2026-03-08
**Story Points:** 10
**Sprint Lead:** Sarah Nakamura

---

## Team Discussion

### Marcus Chen (CTO)
"The A/B testing question comes down to where we do assignment. Client-side deterministic hashing gives us zero-latency bucketing and works offline, which matters for our React Native story. The tradeoff is that a savvy user could inspect their assignment before seeing the variant. For trust features that's low-risk — we're not testing pricing or gating. I'd say ship client-side now, build the server-side endpoint in Sprint 137 when we need it for higher-stakes experiments."

### Sarah Nakamura (Lead Eng)
"I implemented DJB2 hashing on the concatenation of userId and experimentId. It's deterministic — same user always lands in the same bucket for a given experiment. The hash output gets modded by 100 to produce a percentile, then we check against the experiment's traffic allocation. We have override support so QA can force any variant. The whole module is pure functions with no side effects, which made testing straightforward — 34 tests covering edge cases like missing userId fallback to anonymous bucketing."

### Elena Rodriguez (Design)
"For the confidence tooltips, I went with a 12px information-circle-outline icon placed 4px to the right of the confidence indicator. Tapping it toggles the tooltip inline — no modal, no popover that could get clipped. The tooltip text comes from RANK_CONFIDENCE_LABELS so it stays in sync with the confidence system. Styling is intentionally subtle: 11px DM Sans, muted background at 8% opacity of the brand navy, 6px padding, 4px border radius. It shouldn't compete with the score itself."

### Priya Sharma (Frontend)
"Integration into SubComponents was clean because we already had the confidence indicator as its own sub-component. I wrapped the existing indicator and the new info icon in a row container, and the tooltip renders conditionally below. The state is local — each card manages its own tooltip visibility. On the leaderboard side it was the same pattern. One thing to watch: on smaller screens the tooltip text can push content down. I added a maxWidth of 200px to keep it contained."

### Amir Patel (Architecture)
"The experiment definition pattern uses a typed registry — each experiment has an id, description, variants array, default variant, traffic percentage, and active flag. All experiments start inactive, which means the framework is inert until we explicitly flip them on. This is important for compliance and for staged rollouts. The registry is extensible — adding a new experiment is one object addition. Down the road we'll want to pull definitions from the server, but the local registry is the right starting point."

### Liam O'Brien (Analytics)
"Every time a user is bucketed into an experiment, we fire an `experiment_exposure` event with the experiment ID, variant, user ID, and timestamp. This is the standard exposure event pattern used by Statsig, LaunchDarkly, and others. It lets us join experiment assignment with downstream conversion events in our analytics pipeline. I also added a deduplication guard — we only fire the exposure event once per session per experiment to avoid inflating counts."

### Jordan Blake (Compliance)
"A/B testing has consent implications under GDPR Article 22 — automated decision-making that significantly affects users requires disclosure. Our trust feature experiments are low-impact UX variations, not pricing or access decisions, so we're in safe territory. That said, I've flagged that we need to add A/B testing to our privacy policy's data processing section before we activate any experiments. I'll have the updated language ready for Sprint 136."

---

## Changes

### 1. A/B Testing Framework — `lib/ab-testing.ts` (NEW)

Client-side deterministic hash-based bucketing framework.

- **DJB2 hash function** — hashes `userId:experimentId` string to produce consistent numeric output
- **Percentile bucketing** — hash output mod 100 maps user to a 0-99 percentile
- **Experiment registry** — typed definitions with id, description, variants, default, trafficPercent, and active flag
- **3 initial experiments:**
  - `confidence_tooltip` — controls visibility of confidence tooltips (control: hidden, variant: visible)
  - `trust_signal_style` — tests compact vs expanded trust signal display
  - `personalized_weight` — tests showing personalized vote weight vs static text
- **All experiments inactive by default** — no user impact until explicitly activated
- **QA override support** — `setExperimentOverride(experimentId, variant)` forces a specific variant
- **Analytics integration** — fires `experiment_exposure` event on first bucketing per session
- **Deduplication** — session-level guard prevents duplicate exposure events
- **Pure functions** — no side effects, fully testable
- **34 new tests** in `tests/sprint135-ab-testing.test.ts`

### 2. Confidence Tooltips — `components/search/SubComponents.tsx`, `components/leaderboard/SubComponents.tsx`

Added info icon and toggleable tooltip next to confidence indicators.

- **Info icon** — `information-circle-outline` from Ionicons, 12px, positioned 4px right of confidence indicator
- **Toggle behavior** — tap to show/hide, local state per card instance
- **Tooltip content** — pulls description from `RANK_CONFIDENCE_LABELS` mapping
- **Styling** — 11px DM Sans, muted background (navy at 8% opacity), 6px padding, 4px border radius, maxWidth 200px
- **Applied to both search cards and leaderboard items** — consistent experience across surfaces

### 3. Personalized Vote Weight — `app/(tabs)/challenger.tsx`

"How Voting Works" section now shows personalized tier influence for logged-in users.

- **Tier influence label** — displays user's current tier name and influence weight percentage
- **Motivational prompt** — for non-max tiers, shows encouragement to level up (e.g., "Rate 5 more to reach Silver")
- **Logged-out fallback** — shows static "All votes count, but consistent raters earn more influence" text
- **Data source** — reads from AuthProvider context for tier info

---

## Files Changed

| File | Status | Description |
|------|--------|-------------|
| `lib/ab-testing.ts` | NEW | A/B testing framework with DJB2 hashing and experiment registry |
| `tests/sprint135-ab-testing.test.ts` | NEW | 34 tests for A/B framework |
| `components/search/SubComponents.tsx` | MODIFIED | Added confidence tooltip to search cards |
| `components/leaderboard/SubComponents.tsx` | MODIFIED | Added confidence tooltip to leaderboard items |
| `app/(tabs)/challenger.tsx` | MODIFIED | Personalized vote weight in How Voting Works |

---

## Test Summary

- **34 new tests** added (A/B testing framework)
- **All existing tests passing** — no regressions
- **Total test count:** 847 tests across 50 files
- **Execution time:** <850ms

---

## PRD Gap Impact

- **A/B Testing** — NEW capability, not in original PRD but essential for measuring trust feature effectiveness
- **Confidence Tooltips** — Closes transparency gap: users can now understand what confidence scores mean
- **Personalized Weight** — Closes motivation gap: users see their tier's impact on rankings
