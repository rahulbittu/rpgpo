# Critique Request: Sprints 805-809

**Date:** 2026-03-12
**Submitted by:** Sarah Nakamura (Lead Eng)
**Scope:** Config consolidation initiative + build optimization

---

## Summary

Sprints 806-808 completed a full config.ts consolidation initiative:
- 14 server files migrated from direct process.env to config.ts
- 24+ direct process.env accesses eliminated
- 27 total config fields established
- 3 bootstrap exemptions documented (db.ts, logger.ts, index.ts)

Sprint 809 added esbuild `--minify-syntax` to recover 32.3kb of build headroom.

---

## Questions for External Review

1. **Config.ts at 27 fields** — Should we consider splitting into config groups (e.g., `config.stripe.*`, `config.r2.*`) or is flat structure acceptable at this scale?

2. **Bootstrap exemptions** — db.ts, logger.ts, and index.ts are exempt from config consolidation because they load before config and adding config would create cascading required-var failures. Is this the right trade-off, or should we consider a lazy-init pattern for config.ts?

3. **Syntax minification** — We use `--minify-syntax` without `--minify-identifiers` or `--minify-whitespace` to preserve debuggability. Is this the right balance for a production Node.js server?

4. **Build size trajectory** — Net +19kb over 4 sprints (669→689kb) within 750kb ceiling. Should the ceiling be raised, or should we invest in more aggressive optimizations?

5. **Test cascade pattern** — Config migrations required updating 17 existing test files that use the source-reading pattern. Is this maintenance cost acceptable, or should we consider a different testing approach for cross-cutting concerns like config?

---

## Files Changed

- `server/config.ts` — 27 fields (from 17)
- 14 migrated server files (payments, stripe-webhook, photos, deploy, security-headers, wrap-async, routes-admin, google-place-enrichment, unsubscribe-tokens, error-tracking, push, redis, rate-limiter, file-storage)
- `package.json` — esbuild --minify-syntax
- 4 new test files, 17 updated test files
- 4 sprint docs, 4 retros

---

## Awaiting Response

External critique response expected in: `docs/critique/outbox/SPRINT-805-809-RESPONSE.md`
