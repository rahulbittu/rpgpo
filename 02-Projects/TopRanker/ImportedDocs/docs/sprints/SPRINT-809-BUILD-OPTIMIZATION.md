# Sprint 809 — Build Size Optimization

**Date:** 2026-03-12
**Theme:** Recover build size headroom via esbuild syntax minification
**Story Points:** 1 (infrastructure)

---

## Mission Alignment

- **Build health:** Recovered 32.3kb headroom (721.2→688.9kb) within 750kb ceiling
- **No debuggability loss:** Syntax minification preserves variable names and formatting
- **Future-proofing:** 61.1kb headroom vs 28.8kb before optimization

---

## Problem

Config consolidation (Sprints 806-808) increased build size from 669.6kb to 721.2kb (+51.6kb) as config.ts imports pulled more modules into the bundle. Only 28.8kb headroom remained under 750kb ceiling.

## Fix

Added `--minify-syntax` to the esbuild server:build script. This eliminates dead code branches (e.g., `if (false) {}` from `--define:process.env.NODE_ENV="production"`), simplifies expressions, and removes unnecessary parentheses — without mangling variable names or removing whitespace formatting.

**Result:** 721.2kb → 688.9kb (saved 32.3kb, 4.5% reduction)

---

## Team Discussion

**Amir Patel (Architecture):** "--minify-syntax is the sweet spot. Dead branch elimination from the NODE_ENV=production define gives us the biggest win — all dev-only code paths get removed."

**Sarah Nakamura (Lead Eng):** "Stack traces stay readable, console output is still formatted. The only visible change is simpler expressions — ternaries instead of if/else where possible."

**Nadia Kaur (Cybersecurity):** "Dead code elimination is a security win too — dev-only routes and debug logging get stripped from the production bundle."

**Marcus Chen (CTO):** "61kb headroom is healthy. We can add 8-10 more sprints of code before hitting the ceiling again."

---

## Changes

| File | Change |
|------|--------|
| `package.json` | Added `--minify-syntax` to server:build esbuild command |
| `__tests__/sprint809-build-optimization.test.ts` | 5 new tests |

---

## Build Size History

| Sprint | Size | Change | Note |
|--------|------|--------|------|
| 805 | 669.6kb | — | Pre-config consolidation |
| 806 | 669.6kb | +0.0kb | Batch 1 (no import change) |
| 807 | 720.6kb | +51.0kb | Batch 2 (config imports) |
| 808 | 721.2kb | +0.6kb | Final audit |
| **809** | **688.9kb** | **-32.3kb** | **Syntax minification** |

---

## Tests

- **New:** 5 tests in `__tests__/sprint809-build-optimization.test.ts`
- **Total:** 13,536 tests across 608 files — all passing
- **Build:** 688.9kb (max 750kb) — 61.1kb headroom
