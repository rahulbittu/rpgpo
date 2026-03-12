# Retro 636: OG Image Generation

**Date:** 2026-03-11
**Duration:** 25 min
**Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well
- **Marcus Chen:** "SVG generation is zero-dependency. No Sharp, no Canvas, no Puppeteer. Server stays lean."
- **Jasmine Taylor:** "The branded preview cards are exactly what we need for WhatsApp shares. This unlocks the controversy-driven engagement loop."
- **Amir Patel:** "Prerender + OG image separation is clean. Each concern has its own module."

## What Could Improve
- SVG text rendering can vary across platforms (fonts especially). We might need to test on WhatsApp, iMessage, Twitter, Facebook, and Discord.
- Some social platforms may not support SVG for OG images — may need to add PNG conversion later.

## Action Items
- [ ] Test OG image rendering on WhatsApp, iMessage, Twitter, Facebook (Owner: Jasmine)
- [ ] If SVG is rejected by platforms, add Resvg/Sharp PNG conversion fallback (Owner: Amir)
- [ ] Track OG image request volume for business analytics (Owner: Sarah)

## Team Morale
8/10 — Strong feature delivery. Social sharing previews are a multiplier for growth.
