# Retro 547: Share Domain Alignment

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "Launch blocker removed. WhatsApp shares will now generate topranker.com deeplinks that correctly trigger in-app navigation. This was a 2-SLT-cycle ask that's finally resolved."

**Jasmine Taylor:** "I can now confidently send share links to WhatsApp groups knowing they'll open in the app. The 'Best biryani in Irving' controversy campaign can proceed."

**Amir Patel:** "The backwards-compatible deeplink parser is a nice touch. Any old topranker.app links that were shared before this fix will still resolve correctly. Zero broken links for existing users."

## What Could Improve

- **This should have been fixed in Sprint 539** when WhatsApp sharing was built. The domain mismatch was already known (SLT-540 flagged it) but not addressed. Two sprints of broken share links.
- **No automated check for domain consistency** — we should add a CI check that verifies all production URLs match the configured deeplink domain.

## Action Items

- [ ] Sprint 548: Rating photo carousel — **Owner: Sarah**
- [ ] Consider CI check for domain consistency across codebase — **Owner: Amir**

## Team Morale
**8/10** — Quick, focused fix resolving a launch blocker. Clean execution with backwards compatibility.
