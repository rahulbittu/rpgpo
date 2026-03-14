# External Integrations Governance

## Categories
provider_api, storage, docs_knowledge, messaging, deployment, observability

## 4 Default Integrations
OpenAI API (verified), Gemini API (verified), Perplexity API (verified), Local Filesystem (official)

## Access Decisions
allow — authorized tenant + enabled + trusted
deny — disabled or unauthorized
require_approval — untrusted integration

## API
- `GET /api/integrations` — All connectors
- `POST /api/integrations/:id/evaluate` — Access check
- `POST /api/integrations/:id/toggle` — Enable/disable
