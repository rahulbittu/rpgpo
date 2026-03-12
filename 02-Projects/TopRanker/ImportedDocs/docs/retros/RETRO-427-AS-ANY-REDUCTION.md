# Retro 427: `as any` Cast Reduction

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 2
**Facilitator:** Sarah Nakamura

## What Went Well

**Amir Patel:** "21 total casts removed, 23 client-side. The IoniconsName pattern is elegant — one type alias per file, same syntax, full type safety. Reusable pattern for any future icon casting needs."

**Sarah Nakamura:** "15 files touched, zero functional changes, zero test failures. The pct() helper from lib/style-helpers is now used consistently for all percentage dimensions. No more `'100%' as any` scattered around."

**Nadia Kaur:** "The remaining 12 client-side casts are all legitimate — web DOM refs, window API access, file input refs. These can't be eliminated without breaking web compatibility. The Ionicons and percentage casts were the real low-hanging fruit."

## What Could Improve

- **Test regex counts comment mentions** — The `as any` count test uses a simple regex that matches comments mentioning `as any`. This inflates the count by ~6. Could use AST-based counting instead.
- **IoniconsName type alias repeated** — Each file adds the same `type IoniconsName = ...` line. Could be a shared type export from a constants file.

## Action Items

- [ ] Consider shared IoniconsName export in constants/ — **Owner: Amir (future)**
- [ ] Begin Sprint 428 (challenger vote animations) — **Owner: Sarah**

## Team Morale
**8/10** — Clean reduction sprint. Type safety improved measurably. Headroom restored for next feature cycle.
