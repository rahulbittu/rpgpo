# Test Structure Policy

**Created:** Sprint 816 (2026-03-12)
**Purpose:** Define when to add, merge, or consolidate test files

---

## Test File Types

### 1. Source-Reading Tests (`readFile` + `toContain`)
- **Use for:** Verifying code patterns, import presence, config usage
- **Location:** `__tests__/sprint{N}-*.test.ts`
- **Consolidation rule:** If a new sprint modifies the same file as an existing test, ADD assertions to the existing test file instead of creating a new file
- **Exception:** New files or new modules always get a new test file

### 2. Functional Tests (import + invoke)
- **Use for:** Behavioral verification, edge cases, data flow
- **Location:** `__tests__/sprint{N}-*.test.ts` or `tests/sprint{N}-*.test.ts`
- **Consolidation rule:** Same as source-reading — extend existing files when testing the same module

### 3. Governance Tests (file existence + structure)
- **Use for:** Sprint docs, retros, audit docs, SLT meetings
- **Location:** `__tests__/sprint{N}-governance.test.ts`
- **Consolidation rule:** One file per governance sprint

---

## When to Create a New Test File
- New module or feature
- New architectural pattern (e.g., first use of shared helpers)
- Governance sprint (SLT + Audit + Critique)

## When to Extend an Existing Test File
- Modifying a module that already has a test file
- Adding assertions about the same file/pattern
- Updating thresholds or config values

## When to Delete/Merge Test Files
- If a test file has < 3 assertions and tests the same module as another file
- If a refactor makes two test files redundant
- During governance sprints (every 5th), review test file count and identify merge candidates

---

## Source-Reading Test Guidelines

### Acceptable Patterns
```typescript
// Check that a file imports a module
expect(src).toContain('import { config } from "./config"');

// Check that a file uses a config property
expect(src).toContain("config.stripeSecretKey");

// Check that a file does NOT have a pattern
expect(src).not.toContain("process.env.STRIPE_SECRET_KEY");
```

### Fragile Patterns (Avoid)
```typescript
// Avoid: index-based slicing of source code
const idx = src.indexOf("/api/health");
const section = src.slice(idx, idx + 800);

// Avoid: exact multi-line string matching
expect(src).toContain("const x = 1;\nconst y = 2;");

// Avoid: regex on code structure
expect(src).toMatch(/function\s+\w+\(.*\)/);
```

### Cross-Cutting Refactors
When a refactor touches multiple files (like config consolidation):
1. Use shared assertion helpers (`__tests__/helpers/`)
2. Update the helper, not 17 individual test files
3. Create one sprint test file for new assertions

---

## Metrics

| Metric | Current | Policy |
|--------|---------|--------|
| Test files | 614 | No hard cap; review during governance |
| Tests per file (avg) | ~22 | No minimum; aim for meaningful assertions |
| Source-reading test files | ~200 | Consolidate when modifying same module |
| Shared helpers | 1 (`config-assertions.ts`) | Add more as cross-cutting patterns emerge |
