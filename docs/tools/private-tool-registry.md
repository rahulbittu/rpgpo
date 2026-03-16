# GPO Private Tool Registry

## What It Is

GPO maintains a private, curated registry of tools and capabilities. This is not a public marketplace — every tool is reviewed, risk-classified, and governed.

## Current Tools

| Tool | Type | Risk | Status | Approval |
|---|---|---|---|---|
| Perplexity Web Search | Internal | Low | Enabled | Auto |
| OpenAI Synthesis | Internal | Low | Enabled | Auto |
| Gemini Strategy | Internal | Low | Enabled | Auto |
| Markdown Export | Internal | Low | Enabled | Auto |
| JSON Export | Internal | Low | Enabled | Auto |

## Planned Tools

| Tool | Type | Risk | Status | Notes |
|---|---|---|---|---|
| Email Draft | Connector | Medium | Planned | Draft-only, no auto-send |
| Calendar Reader | Connector | Low | Planned | Read-only |
| Sandboxed Browser | Utility | Medium | Planned | No login, no form submission |

## Risk Classes

| Class | Description | Approval Policy |
|---|---|---|
| Low | Read-only, local file generation | Auto |
| Medium | Draft creation, sandboxed external access | Operator review on first use |
| High | Outbound communication, account modifications | Explicit per-action approval |
| Critical | Irreversible actions, data deletion | Double confirmation |

## Adding New Tools

1. Define tool manifest with permissions, risk class, and scope
2. Review against safety rules
3. Classify risk level
4. Test in sandbox if applicable
5. Add to registry with disabled state
6. Enable after operator approval

## Artifacts

- `artifacts/tools/tool-registry.json` — Complete tool definitions
- `artifacts/tools/tool-risk-policies.json` — Risk classification rules
