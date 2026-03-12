# Retro 462: Visit-Type-Aware Receipt Prompts

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 1
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "The visit-type prompt pattern is now complete across the rating flow. Dimensions, photos, receipts — all context-aware. This is the kind of polish that makes users feel the product understands their experience."

**Nadia Kaur:** "From a verification perspective, this is important groundwork. When we build automated receipt parsing, knowing whether to expect a delivery app screenshot vs. a paper bill is the first step in choosing the right OCR strategy."

**Rachel Wei:** "Simple change, high leverage. Clearer prompts → higher receipt upload rates → stronger verification signals → better credibility weighting. The compounding effect of these small UX touches is real."

## What Could Improve

- **RatingExtrasStep at 96.7% (580/600)** — This is the new CRITICAL file. The photo prompt section (Sprint 459) and receipt hint (Sprint 462) each added ~15 LOC. Further additions will require extraction of the photo/receipt prompt helpers to a separate file.
- **No A/B testing infrastructure** — We claim these prompts improve upload rates but have no way to measure. Would need analytics integration to prove the hypothesis.
- **Receipt section still generic buttons** — The Gallery/Camera button labels for receipts are still generic. Could be "Upload from [App Name]" for delivery, but that's over-engineering for now.

## Action Items

- [ ] Begin Sprint 463 (Admin enrichment hours bulk update) — **Owner: Sarah**
- [ ] Flag RatingExtrasStep for extraction at Audit #51 — **Owner: Amir**
- [ ] Consider extracting photo/receipt prompts to a sub-file if any additions needed — **Owner: Sarah**

## Team Morale
**8/10** — Clean completion of the visit-type prompt pattern. Team is aware of the RatingExtrasStep threshold proximity and ready to extract if needed.
