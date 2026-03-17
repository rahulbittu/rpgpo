# Engine-Specific Quality Rubrics

## Purpose

Each GPO engine has different output expectations. Generic "did it complete" checks are insufficient. These rubrics define what "good enough" means per engine.

These are lightweight automated checks, not semantic quality judgments. They catch obvious structural problems but cannot evaluate whether advice is correct or writing is compelling.

## Rubrics by Engine

### Research & Analysis
- **Min length:** 1,000 chars
- **Requires structure:** Yes (## headings)
- **Requires sources:** Yes (URLs or "Source:" citations)
- **What "good" means:** Structured analysis with cited data, specific comparisons, concrete recommendations backed by evidence
- **What fails:** Short answers without citations, generic summaries, missing comparison data

### Personal Finance & Investing
- **Min length:** 1,000 chars
- **Requires structure:** Yes
- **Requires sources:** Yes
- **What "good" means:** Specific numbers (dollar amounts, percentages, tax brackets), cited regulations, actionable steps with timelines
- **What fails:** Generic financial advice without numbers, missing tax implications, no concrete first steps

### Learning & Tutoring
- **Min length:** 800 chars
- **Requires structure:** Yes
- **Requires sources:** No (explanations are self-contained)
- **What "good" means:** Clear progression from simple to complex, concrete examples, practice questions or exercises
- **What fails:** Jargon-heavy without explanation, no examples, missing the "so what" connection

### Career & Job Search
- **Min length:** 800 chars
- **Requires structure:** Yes
- **Requires sources:** No
- **What "good" means:** Actionable steps with timelines, specific scripts/templates, real company examples where applicable
- **What fails:** Generic career advice, missing action items, no specificity

### Health & Wellness
- **Min length:** 600 chars
- **Requires structure:** Yes
- **Requires sources:** No
- **What "good" means:** Evidence-based protocols with progressions, safety disclaimers, specific exercises/doses
- **What fails:** Generic health tips, missing progressions, no safety notes for physical protocols

### Travel & Relocation
- **Min length:** 800 chars
- **Requires structure:** Yes (day-by-day)
- **Requires sources:** No
- **What "good" means:** Day-by-day itinerary with specific venues, logistics, costs, alternatives
- **What fails:** Vague "visit the old town" without specifics, missing logistics, no budget info

### Writing & Documentation
- **Min length:** 500 chars
- **Requires structure:** No (depends on output type)
- **Requires sources:** No
- **What "good" means:** Complete document matching the requested format and tone, immediately usable
- **What fails:** Placeholder text, incomplete document, wrong tone for audience

### Screenwriting & Story Development
- **Min length:** 500 chars
- **Requires structure:** No
- **Requires sources:** No
- **What "good" means:** Complete creative concept with character depth, narrative structure, genre clarity
- **What fails:** Thin sketches without character motivation, incomplete narrative arcs

### Shopping & Buying
- **Min length:** 600 chars
- **Requires structure:** Yes (comparison format)
- **Requires sources:** Yes (product links, pricing)
- **What "good" means:** Side-by-side comparison with specs, prices, pros/cons, clear recommendation
- **What fails:** Missing prices, no comparison table, recommendation without reasoning

### News & Intelligence
- **Min length:** 400 chars
- **Requires structure:** Yes
- **Requires sources:** Yes (source URLs mandatory)
- **What "good" means:** Real headlines with dates, source attribution, relevance analysis
- **What fails:** Stale news, missing sources, generic summaries without specifics

### Scheduling & Life Operations
- **Min length:** 400 chars
- **Requires structure:** Yes
- **Requires sources:** No
- **What "good" means:** Specific plans with time blocks, implementation steps, review schedules
- **What fails:** Abstract productivity advice, missing concrete steps

### Code & Product Engineering / Startup & Business Builder
- **Min length:** 300-600 chars
- **Requires structure:** Varies
- **Requires sources:** No
- **What "good" means:** Architecturally sound, includes tradeoffs, practical to implement
- **What fails:** Theoretical without practical guidance, missing error handling, no cost/complexity analysis

### Film / Music
- **Min length:** 300-400 chars
- **Requires structure:** No
- **Requires sources:** No
- **What "good" means:** Creative completeness appropriate to the request
- **What fails:** Thin concepts without development

## Automated vs Human Quality

These rubrics enable **automated structural checks** — they catch obvious problems (too short, no citations in research, no structure in plans).

They do NOT evaluate **semantic quality** — whether financial advice is correct, whether creative writing is compelling, or whether a protocol is safe. Semantic quality requires human feedback (the `quality_feedback` event).

## Implementation

`behavior.ts` → `scoreOutputQuality(engine, output)` applies these thresholds and returns a detailed pass/fail per criterion.
