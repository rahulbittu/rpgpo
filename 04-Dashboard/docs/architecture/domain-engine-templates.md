# Domain-Specific Engine Templates

## 4 Built-in Templates
| Template | Domain | Provider Strategy |
|----------|--------|------------------|
| Startup | startup | Claude primary, Gemini critique |
| Research | research | Perplexity primary, OpenAI synthesis |
| Creative Writing | creative | Claude primary, OpenAI feedback |
| Operations | operations | OpenAI primary |

## Template Fields
mission_defaults, default_projects, recommended_skill_packs, provider_strategy, governance_defaults, approval_defaults, docs_starters

## API
- `GET /api/engine-templates` — Template catalog
- `POST /api/engine-templates/:id/instantiate` — Instantiate for tenant/engine
