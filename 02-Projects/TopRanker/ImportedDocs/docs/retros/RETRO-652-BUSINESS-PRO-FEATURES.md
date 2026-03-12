# Retro 652: Business Pro Feature Set

**Date:** 2026-03-11
**Duration:** 15 min
**Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well
- **Marcus Chen:** "Revenue funnel is now visually complete. Free owners see exactly what they're missing — dimension breakdowns, full rating history, review notes — behind a single-tap upgrade button."
- **Rachel Wei:** "The Pro badge on business detail pages is a marketing multiplier. Other business owners will see it and ask 'how do I get that?' Classic B2B FOMO."
- **Amir Patel:** "Zero new endpoints. The server already returned isPro — we just needed the UI to respect it. Clean separation of concerns."
- **Sarah Nakamura:** "The insights tab Pro gate is elegant — lock icon, clear description of what's behind it, amber CTA button. Not aggressive, but clear."
- **Nadia Kaur:** "Data gating is server-side. Even if someone bypasses the UI lock, the API only returns truncated data for free users. Defense in depth."

## What Could Improve
- api.ts is at 98% ceiling (560/570). Next touch should trigger extraction of the mapping functions to a separate file.
- The Pro badge on business cards in search results isn't wired yet — only on the detail page. Should add to search result cards too.
- Priority support badge is visual-only — no actual priority routing exists yet for support requests.

## Action Items
- [ ] Wire Pro badge on search result BusinessCard components (Owner: Sarah)
- [ ] Build priority support routing when support system is built (Owner: TBD)
- [ ] Extract mapApiBusiness to lib/api-mappers.ts if api.ts approaches ceiling (Owner: Amir)

## Team Morale
9/10 — Revenue-aligned sprint with clear business impact. The team can see the path to first dollar: Pro features (done) → pricing page (Sprint 653) → Stripe wiring (Sprint 653).
