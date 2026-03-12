# Sprint 209 — Marketing Site Prep, PR Strategy, Extended Export

**Date:** 2026-03-09
**Story Points:** 5
**Status:** Complete

## Mission Alignment

Final preparation sprint before the SLT-210 GO/NO-GO decision. PR strategy defines how we tell the trust-weighted ranking story to the world. Extended analytics export gives Rachel the per-event-type data for conversion analysis. OG image tags ensure social shares look professional.

## Team Discussion

**Marcus Chen (CTO):** "Sprint 210 is the decision point. Everything in this sprint is about readiness: PR narrative ready, analytics deep enough for the CFO, social sharing optimized for virality."

**Jasmine Taylor (Marketing):** "The PR strategy covers pre-launch, launch week, and post-launch. Core narrative: 'Rankings you can trust.' Target three audiences: food-conscious consumers, food influencers, and restaurant owners. Each gets a different angle."

**Rachel Wei (CFO):** "Extended CSV export with per-event-type breakdown is what I need. I can now see daily counts for beta_invite_sent, beta_signup_completed, beta_first_rating separately. That's the conversion funnel in spreadsheet form."

**Leo Hernandez (Frontend):** "OG image tags at 1200x630 — the standard for social media previews. Twitter card set to summary_large_image for maximum visual impact when shared."

**Sarah Nakamura (Lead Eng):** "getPersistedDailyStatsExtended groups by date AND event type. Same query pattern as the basic version, just with an additional groupBy column. The export endpoint uses `?detailed=true` to opt in."

**Nadia Kaur (Security):** "OG image URL points to topranker.com — we'll need the actual image asset created before launch. No security concerns with the new export parameter."

## Deliverables

### Extended Analytics Export (`server/routes-admin.ts`, `server/storage/analytics.ts`)
- `getPersistedDailyStatsExtended(days)` — daily stats grouped by event type
- `?detailed=true` parameter on export endpoint
- Extended CSV: `date,event,count` format
- Extended JSON: `{ detailed: true, stats: [...] }`

### PR Strategy (`docs/PR-STRATEGY.md`)
- Core narrative and elevator pitch
- Three target audiences with tailored angles
- Pre-launch, launch week, post-launch media plan
- Key media targets: tech press, food press, local press
- Press kit contents list
- Success metrics

### Social Sharing Meta Tags (`app/+html.tsx`)
- `og:image` with 1200x630 dimensions
- `twitter:image` for Twitter card preview
- Consistent URLs pointing to topranker.com

## Tests

- 29 new tests in `tests/sprint209-marketing-pr-export.test.ts`
- Full suite: **3,678+ tests across 139 files, all passing**
