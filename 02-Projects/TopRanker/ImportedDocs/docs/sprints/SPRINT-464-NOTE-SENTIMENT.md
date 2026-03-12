# Sprint 464: Rating Note Sentiment Indicators

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 2
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Add real-time sentiment indicators to the rating note input. As users type their note, a small badge shows whether the tone is positive, neutral/balanced, or critical. This is NOT moderation — it's UX guidance that helps users understand how their note reads. Purely client-side keyword analysis with no server component.

## Team Discussion

**Marcus Chen (CTO):** "This is a subtle nudge, not a gate. We never block or penalize based on sentiment. The indicator helps users self-regulate tone. If someone writes 'terrible disgusting waste,' seeing 'Critical tone' might prompt them to be more constructive. Or not — their choice."

**Amir Patel (Architect):** "Clean architecture: pure utility in lib/note-sentiment.ts, small component in NoteSentimentIndicator.tsx, 2-line integration in RatingExtrasStep. The analyzeSentiment function is memoized so it only recomputes when the note changes. No perf concerns for 160-char strings."

**Rachel Wei (CFO):** "Constructive notes are more useful for other users deciding where to eat. If sentiment indicators improve note quality even marginally, that's better content for everyone reading ratings. Low cost, potential upside."

**Sarah Nakamura (Lead Eng):** "The keyword lists are focused on restaurant-relevant terms: 'delicious', 'authentic', 'generous' (positive), 'bland', 'overcooked', 'rude' (negative). Generic sentiment would miss domain context. The 0.2 threshold means you need a clear lean — one positive word in a long note stays neutral."

**Nadia Kaur (Cybersecurity):** "Important that this is client-side only. We don't send sentiment data to the server or use it for any weighting. It's purely visual guidance. No privacy concerns since the analysis never leaves the device."

**Jasmine Taylor (Marketing):** "When we share example ratings in WhatsApp campaigns, the ones with positive constructive notes are the best examples. If this indicator helps more users write that way, it makes our marketing content pipeline better organically."

## Changes

### New: `lib/note-sentiment.ts` (~80 LOC)
- `SentimentType` = "positive" | "neutral" | "negative"
- `SentimentResult` interface: type, score (-1 to 1), label, icon, color
- `POSITIVE_WORDS` — 27 restaurant-relevant positive terms
- `NEGATIVE_WORDS` — 26 restaurant-relevant negative terms
- `analyzeSentiment(text)` — keyword-based classification
- Score calculation: (positive - negative) / total keywords found
- Thresholds: >0.2 positive, <-0.2 negative, else neutral
- Returns empty label for short/no-keyword text (indicator hidden)

### New: `components/rate/NoteSentimentIndicator.tsx` (~45 LOC)
- Small badge component: icon + label with sentiment color
- useMemo-wrapped analyzeSentiment call
- Returns null when no sentiment detected (hidden by default)
- Colors: green (#2D8F4E) positive, red (#C0392B) negative, gray (#8B8B8B) neutral

### Modified: `components/rate/RatingExtrasStep.tsx` (580→582 LOC)
- Added import of NoteSentimentIndicator
- Renders `<NoteSentimentIndicator note={note} />` below character counter

## Test Coverage
- 22 tests across 4 describe blocks
- Validates: utility, component, integration, docs
