# GPO Privacy Model

## Principles

1. **Instance isolation** — All data is scoped to the current GPO instance
2. **Provider allowlist** — Only approved providers receive data
3. **Mission isolation** — Sensitive missions can be blocked from external providers
4. **Redaction** — Emails, API keys, and custom patterns are stripped before external calls
5. **Memory scope** — Context is always instance-scoped, never shared
6. **Secret scope** — API keys live in `.env`, never in state files
7. **Export control** — Instance data export is policy-gated

## Privacy Policy Fields

| Field | Purpose |
|-------|---------|
| `local_only` | If true, no external API calls allowed |
| `allowed_providers` | Which providers can receive data |
| `mission_isolation` | Domains blocked from external providers |
| `log_redaction_patterns` | Regex patterns to strip from logs/external calls |
| `sensitive_fields` | Object fields that must never appear in exports |
| `allow_export` / `allow_import` | Whether data can leave/enter the instance |
| `secret_scope` | Where secrets are stored (env/keychain/vault) |
| `memory_scope` | Always `instance` — context never crosses instances |

## Privacy Presets

| Preset | Providers | Export | Redaction | Use Case |
|--------|-----------|--------|-----------|----------|
| `open` | All | Yes | Basic | Development, testing |
| `balanced` | All | Yes | Email + API keys | Standard operation |
| `strict` | Claude only | No | Email + API keys + phone | Sensitive work |
| `local-only` | Claude only | No | Full | Maximum privacy |

## Agent Privacy Scopes

Each AI agent has a `AgentPrivacyScope` that controls:
- What missions it can see data from
- Whether it can see operator profile, decisions, artifacts
- Whether content is redacted before sending

Claude (local) has the broadest scope. External APIs have the narrowest.
