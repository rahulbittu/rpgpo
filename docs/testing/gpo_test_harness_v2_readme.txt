GPO Test Harness V2 package

Files:
- gpo_test_harness_v2.xlsx
- gpo_test_harness_v2_cases.csv
- gpo_test_harness_v2_cases.json
- gpo_test_harness_v2_schema.json

Recommended Claude Code flow:
1. Read the JSON or CSV first.
2. Parse cases by engine and batch.
3. Execute Batch 1 first, then Batch 2.
4. Write results back to the XLSX or a separate results JSON file.
5. Only add new development when failing cases justify it.

Status values:
UNTESTED, PASS, PARTIAL, FAIL, BLOCKED_PROVIDER, BLOCKED_UX, BLOCKED_MEMORY, BLOCKED_GOVERNANCE, BLOCKED_TOOLING, BLOCKED_ROUTING
