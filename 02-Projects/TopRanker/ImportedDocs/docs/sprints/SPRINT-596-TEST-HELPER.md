# Sprint 596: Test Helper for File Reads

**Date:** 2026-03-11
**Owner:** Sarah Nakamura (Lead Eng)
**Points:** 3
**Status:** Complete

## Mission

Create a shared test helper module (`__tests__/helpers/read-source.ts`) to reduce the 977 occurrences of duplicated `readFile` across 162 test files. Directly addresses external critique finding #3 (test churn from component extraction).

## Team Discussion

**Sarah Nakamura (Lead Eng):** "Every component extraction required updating 5-13 test files to redirect file reads. The new helper centralizes the read utilities: readFile, countLines, fileExists, fileSize, readJson, getThresholds. Future tests import from one place."

**Amir Patel (Architecture):** "The existing 162 test files keep their own readFile definitions — backward compatible. New tests use the helper. Migration of old tests is optional and can happen incrementally."

**Marcus Chen (CTO):** "This is the kind of small infrastructure investment that pays compounding returns. Each future extraction sprint saves 15-20 minutes of test redirect work."

**Nadia Kaur (Security):** "The getThresholds helper is particularly useful — every governance sprint needs it. Single import instead of copy-pasting JSON parse boilerplate."

## Changes

### New Files
- `__tests__/helpers/read-source.ts` (43 LOC) — Shared test helper: readFile, countLines, fileExists, fileSize, readJson, getThresholds
- `__tests__/sprint596-test-helper.test.ts` — 13 tests validating all helper functions

### Helper API

| Function | Purpose | Replaces |
|----------|---------|----------|
| `readFile(relPath)` | Read source file as string | Per-test `const readFile = (p) => fs.readFileSync(...)` |
| `countLines(relPath)` | Count lines in file | Per-test `src.split("\n").length` |
| `fileExists(relPath)` | Check file exists | Per-test `fs.existsSync(...)` |
| `fileSize(relPath)` | Get byte size | Per-test `Buffer.byteLength(...)` |
| `readJson<T>(relPath)` | Parse JSON file | Per-test `JSON.parse(readFile(...))` |
| `getThresholds()` | Get typed thresholds config | Per-test JSON parse + type cast |

## Metrics

- **Tests:** 11,320 passing (484 files) — +13 from Sprint 595
- **Server build:** 731.6kb / 750kb
- **Duplication addressed:** 977 readFile occurrences across 162 files
- **New tests can use helper:** Immediate. Old tests: optional migration.
