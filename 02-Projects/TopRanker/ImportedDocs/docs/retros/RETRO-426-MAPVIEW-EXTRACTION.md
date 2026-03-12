# Retro 426: MapView Extraction

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Amir Patel:** "40% LOC reduction in SubComponents (660→396). The re-export pattern ensures backward compatibility — no consumer imports needed updating. Clean separation with self-contained styles."

**Sarah Nakamura:** "4 test files updated, 19 test assertions redirected, zero functional changes. The extraction pattern is well-established. This is the cleanest structural sprint we've done."

**Marcus Chen:** "Closes Audit #43 M1 finding immediately. SubComponents now has ~304 LOC of headroom before the 700 threshold. We won't revisit this for a long time."

## What Could Improve

- **Removed unused imports from SubComponents but not all** — `useRef` and `useEffect` are still imported but no longer needed after MapView extraction. Minor cleanup opportunity.
- **Re-export creates an extra hop** — Direct imports from MapView.tsx would be cleaner, but changing consumer imports across the codebase adds risk for no functional benefit.

## Action Items

- [ ] Clean up remaining unused imports in SubComponents.tsx — **Owner: Sarah (next sprint if touched)**
- [ ] Begin Sprint 427 (`as any` reduction) — **Owner: Amir**

## Team Morale
**9/10** — Satisfying structural improvement. The 40% reduction is visible and meaningful.
