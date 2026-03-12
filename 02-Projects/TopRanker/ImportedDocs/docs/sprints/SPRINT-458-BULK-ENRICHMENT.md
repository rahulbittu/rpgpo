# Sprint 458: Admin Enrichment Bulk Operations

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 2
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Add bulk dietary tagging operations to the admin enrichment API. Currently ops must tag businesses one at a time via PUT /api/admin/dietary/:businessId. This sprint adds two bulk endpoints: tag by business IDs (explicit) and tag by cuisine (pattern-based).

## Team Discussion

**Marcus Chen (CTO):** "One-at-a-time tagging doesn't scale. When we onboard 50 Indian restaurants in Irving, the ops team needs to tag all of them as vegetarian in one action. The by-cuisine endpoint is the power tool — 'tag all Indian as vegetarian' with dry run preview."

**Rachel Wei (CFO):** "The dry run mode is critical for ops confidence. Before committing bulk changes, the team can preview what would be affected. This reduces risk of accidental mass-tagging mistakes."

**Amir Patel (Architect):** "Good safety constraints: 100-business batch limit, tag whitelist validation, merge/replace modes, dry run, and response capping at 50 entries. The by-cuisine endpoint filters case-insensitively and supports city scoping for targeted operations."

**Sarah Nakamura (Lead Eng):** "Both endpoints return detailed results — previous tags, new tags, business names. This gives ops full audit trail for what changed. The merge mode (default) adds tags without removing existing ones. Replace mode overwrites completely."

**Jasmine Taylor (Marketing):** "This is the workflow I need before WhatsApp campaigns. Step 1: run enrichment dashboard to check coverage. Step 2: use bulk-dietary-by-cuisine with dryRun to preview. Step 3: run again without dryRun to apply. Step 4: verify with dashboard. Clean pipeline."

## Changes

### Modified: `server/routes-admin-enrichment.ts` (199→310 LOC)
- POST /api/admin/enrichment/bulk-dietary — tag multiple businesses by IDs
  - Accepts businessIds[], tags[], mode (merge/replace)
  - 100-business batch limit
  - Returns previous/new tags per business
- POST /api/admin/enrichment/bulk-dietary-by-cuisine — tag all businesses matching a cuisine
  - Accepts cuisine, tags[], city (optional), dryRun (default true)
  - Case-insensitive cuisine matching
  - Skips businesses with no tag changes
  - Caps response at 50 entries

## Test Coverage
- 22 tests across 4 describe blocks
- Validates: bulk by IDs, bulk by cuisine, validation, docs
