# Part 61: Merge Pipeline + Merge-Time Enforcement + Strategy Registry

## Module: deliverable-merge.ts
Contract-aware merge of scaffold/fragments into canonical deliverable content.

## 5 Merge Strategies
| Strategy | Behavior |
|----------|----------|
| replace | Incoming overwrites existing |
| append | Concatenate arrays/strings |
| union_dedupe | Union arrays, deduplicate by content hash |
| pick_best | Choose whichever has more content |
| structural_merge | Deep merge objects, concatenate strings with separator |

## Default Policies per Variant
Each variant has per-field strategy mappings (e.g., newsroom.rankedItems → union_dedupe, document.sections → append)

## Merge-Time Enforcement
After merge, validates content against engine contract. Checks required fields, variant-specific constraints (headlines non-empty, file paths present, times valid).

## Provenance
Each field contribution tracked with: subtaskId, stepType, fieldHash (sha256-12chars)

## Diff
Field-by-field comparison between any two deliverable versions.
