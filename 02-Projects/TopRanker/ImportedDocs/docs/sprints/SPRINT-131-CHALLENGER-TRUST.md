# Sprint 131 — Challenger Page Trust Improvements

**Date**: 2026-03-08
**Theme**: Challenger Trust Transparency
**Story Points**: 8
**Tests Added**: 0 (1230 total, 0 new TS errors)

---

## Mission Alignment

The challenger page is where TopRanker's credibility-weighted voting is most visible — two
businesses go head-to-head and users decide the winner. Without transparency into rank
confidence and voting mechanics, users have no way to gauge whether a result is definitive
or based on thin data. This sprint adds rank confidence indicators and a voting explainer
to the challenger page, reinforcing the trust mission at the exact moment users engage
with competitive outcomes.

---

## Team Discussion

**Marcus Chen (CTO)**: "Showing confidence on challenger pages is a competitive fairness
question. If Business A has 'Strong Confidence' and Business B shows 'Provisional Rank',
the user immediately understands the asymmetry. That transparency is the whole point of
TopRanker — we don't hide the uncertainty. I was initially concerned about giving one side
a perceived disadvantage, but Sarah convinced me that hiding it would be worse. Users
should know when a ranking is provisional so they can contribute the data that makes it
definitive."

**Sarah Nakamura (Lead Engineer)**: "Implementation footprint was minimal — three additions
to `challenger.tsx`: the confidence label below each fighter's vote count, the 'How Voting
Works' explainer below the CTA, and the supporting styles. We reuse `getRankConfidence`
from `lib/data` which already has Sprint 130's per-category thresholds built in. The
confidence call takes the business's `totalRatings` and the challenge's `category`, so a
restaurant with 12 ratings might show 'Early Ranking' while a niche category business with
the same count could show 'Provisional Rank'. No new API calls, no new state — purely
derived from existing data."

**Priya Sharma (Mobile Engineer)**: "Placement of the confidence label was the main UX
decision. We put it directly below each fighter's vote count, not below the name or the
photo. The vote count is the quantitative signal; the confidence label contextualizes it.
If you see '47 votes' with no label, that's established confidence — the absence of a label
is itself a signal. If you see '3 votes — Early Ranking', you immediately understand why
the count is low. The label only renders for provisional and early confidence levels, so
established businesses get a cleaner card."

**Jasmine Taylor (Marketing)**: "This is the kind of feature that builds trust silently.
Most users won't consciously notice the confidence labels, but they'll feel the difference
when a challenger with 2 votes doesn't look identical to one with 200. The 'How Voting
Works' explainer is even more impactful for marketing — it's the first time we surface the
credibility-tier mechanic to users in-context. When someone asks 'why should I trust this
ranking?', the answer is right there on the page. This is a talking point for our launch
narrative."

**Elena Rodriguez (Design Lead)**: "The 9px amber text for the confidence label is
deliberately understated. The VS page is visually dramatic — fighter photos, bold names,
large vote counts. The confidence label needs to inform without competing. At 9px in amber
(#C49A1A), it reads as a footnote to the vote count, which is exactly the right hierarchy.
If we made it 12px or used a contrasting color, it would pull focus from the core action:
voting. The 'How Voting Works' row uses the same subtle approach — informational, not
promotional."

**Jordan Blake (Compliance)**: "Reviewed this from a competitive disclosure angle. Rank
confidence is derived from publicly available data — total ratings count and category
thresholds. We're not exposing any proprietary algorithm details or individual vote weights.
The 'How Voting Works' text explains the credibility-tier mechanic at a conceptual level
without revealing the specific weight multipliers. No competitive advantage leak, no PII
exposure. Clean from a compliance standpoint."

---

## Changes

### Rank Confidence Indicators on Challenger Cards
- Imported `getRankConfidence` and `RANK_CONFIDENCE_LABELS` from `lib/data`
- Added confidence label below each fighter's vote count
- Shows "Provisional Rank" or "Early Ranking" for businesses with thin data
- Hidden for established/strong confidence — absence signals reliability
- Uses category-aware thresholds via `getRankConfidence(biz.totalRatings, challenge.category)`
- Leverages Sprint 130's per-category confidence thresholds

### Voting Transparency Explainer
- Added "How Voting Works" explainer section below the vote CTA
- Text: "Your vote weight depends on your credibility tier. Higher-tier members have more influence on the outcome."
- Row layout with informational styling

### New Styles
- `fighterConfidence`: 9px amber (#C49A1A) text, positioned below vote count
- `howVotingWorks`: Row layout container for the explainer section
- `howVotingWorksText`: Supporting text style for the explainer content

### File Changed
- `app/(tabs)/challenger.tsx`

---

## PRD Gap Closure

- **Voting transparency**: Users now understand that vote weight varies by credibility tier
- **Rank confidence**: Provisional/early rankings are clearly labeled, preventing false
  equivalence between established and new businesses in head-to-head matchups

---

## What's Next (Sprint 132)

Continue trust surface improvements — potential candidates include confidence indicators
on the main rankings page, vote weight preview for logged-in users, and expanded
credibility tier explanations in the profile tab.
