# Deep Redaction Architecture

## Rule Sets
| Category | Fields | Action |
|----------|--------|--------|
| audit_evidence | source_scope, target_scope, linked_path_id, scope_id | mask/strip |
| memory_content | content, summary | strip/mask |
| tenant_data | api_key, secret, token, password | strip |
| compliance | violation_id, actor | mask |

## Actions
- **strip**: Delete the field entirely from the response
- **mask**: Replace value with `xx***yy` (first 2 + last 2 chars) or `***`
- **hash**: Replace with `[hash:N]`

## Integration
`http-response-guard.redactPayload()` now delegates to `deep-redaction.redactDeep()` when available, applying field-level stripping/masking before adding metadata markers.
