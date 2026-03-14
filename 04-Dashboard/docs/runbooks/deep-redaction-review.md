# Runbook: Deep Redaction Review

## View Report
`GET /api/deep-redaction` — rule sets, recent executions, strip/mask totals

## Validate Redaction
`POST /api/deep-redaction/validate` — runs redaction on sample data, shows before/after

## Expected Behavior
- `api_key`, `secret`, `content`, `linked_path_id` → stripped (deleted)
- `source_scope`, `target_scope`, `actor` → masked (`xx***yy`)
- `normal_field` → preserved unchanged
- Response contains `_redacted: true`, `_redaction_depth: 'field_level'`

## Governance Tab
The Protection Coverage panel shows deep redaction status and a "Validate Redaction" button.
