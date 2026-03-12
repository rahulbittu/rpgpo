# External Critique Request: Sprints 616-619

**Date:** 2026-03-11
**Requesting Team:** TopRanker Engineering
**Scope:** Time-on-page indicator, just-rated feed, WhatsApp landing, build pruning

## Context

4-sprint cohort: 2 core-loop (616, 617), 1 viral growth (618), 1 infrastructure (619).

Major milestone: WhatsApp viral loop is now complete end-to-end (Rate → Share → Landing → Rate/Explore). Build recovered 109kb via seed exclusion.

Current state: 11,415 tests, 625.7kb build, 28 tracked files, 0 violations.

## Questions for External Review

### 1. Time Plausibility Visibility Trade-off
Sprint 616 makes the 30-second time plausibility boost visible to users with a progress bar and "+5%" badge. **Does revealing the mechanic risk gaming?** A user could just leave the page open for 30 seconds and submit a garbage rating. Counter-argument: the 5% boost is small enough that it's not worth gaming, and the timer creates a natural "slow down and think" nudge.

### 2. Just-Rated Feed — Recency vs. Quality
Sprint 617 shows businesses that received ratings in the last 24 hours. **Should we weight this by rating quality?** Currently, ANY rating (including low-weight/low-credibility ones) triggers a business appearing in the feed. Should we filter to only show businesses that received high-quality ratings (e.g., credibility > 0.5)?

### 3. WhatsApp Landing Conversion Optimization
Sprint 618's landing page has two CTAs: "Rate This Restaurant" (primary) and "View Full Details" (secondary). **Is this the right hierarchy?** For a new user who's never used TopRanker, "Rate" is a high-friction action. Should "Explore" be primary for new users and "Rate" for existing users?

### 4. Build Define — Correctness Concern
Sprint 619 adds `--define:process.env.NODE_ENV="production"` to the esbuild command. This replaces ALL `process.env.NODE_ENV` at build time. **Are there cases where runtime NODE_ENV should differ from build-time?** For example, running the production build locally for debugging — the build would still say "production" even in a dev environment.

### 5. Viral Loop Attribution Gap
The WhatsApp share → landing → rate flow has analytics at each step, but **there's no attribution chain connecting them.** We track `share_whatsapp_tap(slug, "confirmation")` and `share_landing_view(slug)` separately. How should we link a specific share event to its downstream landing view? UTM params? A share ID?

## Previous Batches Status
- Sprints 611-614: Pending watcher response
- Sprints 606-609: Pending watcher response
- Sprints 601-604: Pending watcher response
- Sprints 596-599: Pending watcher response
- Sprints 591-594: Response received and incorporated
