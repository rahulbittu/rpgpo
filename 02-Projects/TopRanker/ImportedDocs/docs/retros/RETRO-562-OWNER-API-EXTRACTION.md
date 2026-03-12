# Retro 562: Owner API Extraction

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Amir Patel:** "The three-module API split is clean: api.ts for core read functions (leaderboard, search, business), api-admin.ts for admin operations, api-owner.ts for owner/member actions. Each file is now under 80% of its threshold."

**Sarah Nakamura:** "Six test redirections, all mechanical. The `readFile()` approach makes extractions predictable — just change the file path in the const declaration and all assertions cascade."

**Marcus Chen:** "Both Low findings from Audit #70 are now resolved. dashboard.tsx dropped from 97% to 96%, api.ts from 97% to 96%. The extraction roadmap is delivering exactly as planned."

## What Could Improve

- **api-owner.ts duplicates apiFetch** — The helper is copied from api.ts rather than shared. Considered exporting apiFetch from api.ts, but that would expose an internal. Acceptable duplication for now.
- **Re-export line count in api.ts** — 44 lines of re-exports (admin + owner). Not a problem today, but if a third extraction happens, consider whether re-exports still serve a purpose or if consumers should import directly.
- **No test for import path backward compatibility** — We assume re-exports work, but no test verifies `import { updateBusinessHours } from "@/lib/api"` still resolves correctly at runtime.

## Action Items

- [ ] Sprint 563: Photo carousel lift from CollapsibleReviews — **Owner: Sarah**
- [ ] Sprint 564: Hours integration end-to-end test — **Owner: Sarah**
- [ ] Consider exporting apiFetch as shared utility — **Owner: Amir** (low priority)

## Team Morale
**8/10** — Two back-to-back extractions complete. Team is executing the roadmap efficiently but ready for the feature work in Sprint 564.
