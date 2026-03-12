# Critique Request — Sprints 771-774

**Date:** 2026-03-12
**Requesting:** External review of domain migration approach

---

## What We Did

Migrated all user-facing URLs from `topranker.com` to `topranker.io` across 4 sprints:

1. **Sprint 771:** API base URLs in `lib/app-env.ts`
2. **Sprint 772:** AASA endpoint — replaced `res.sendFile()` with inline `res.json()` because Railway's Nixpacks changes cwd at runtime
3. **Sprint 773:** Email CTAs, sharing URLs, QR codes, OG images (29+ replacements across 8 server files)
4. **Sprint 774:** Expo Router origin in `app.json`

We kept `topranker.com` in:
- `SHARE_DOMAINS` array (backwards-compatible URL parsing)
- iOS `associatedDomains` and Android `intentFilters` (deep linking)
- CORS/CSP origins (defense in depth)
- Email FROM address (`noreply@topranker.com` — email domain is separate)

## Questions for Reviewer

1. Is there a risk in serving AASA inline instead of as a static file? Apple docs mention caching behavior differences.
2. Should we set up a redirect from topranker.com → topranker.io rather than leaving .com as a dead domain?
3. Email templates still hardcode URLs. Is it worth refactoring to use `config.siteUrl` given we're in feature freeze?
4. Any security implications of having both .com and .io in CORS origins when only .io is live?
