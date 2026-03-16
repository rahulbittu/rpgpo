# Subtask Output — Research API Design Best Practices
## Model: sonar
## Stage: audit
## Date: 2026-03-16

## API Design Best Practices Overview
Current best practices for API design emphasize **consistency**, **simplicity**, **security**, **performance**, and standardized handling of errors, versioning, pagination, rate limiting, caching, and idempotency. These apply universally but can expose **health** (e.g., endpoint monitoring via status checks), **finance** (e.g., transaction metrics with idempotency), and **productivity** (e.g., paginated task lists) metrics through dedicated endpoints like `/health`, `/metrics/finance`, or `/tasks`.[1][2][4]

## Key Design Principles with Examples
- **Consistency**: Use uniform naming (e.g., camelCase endpoints like `/userMetrics`) and HTTP methods (GET for reads, POST for creates). Example: All error responses follow one JSON structure: `{"error": {"code": "INVALID_INPUT", "message": "Details here", "request_id": "uuid"}}`.[1][2]
- **Simplicity**: Limit to core use cases; design intuitive paths like `/health` for system status or `/finance/transactions` for balance queries without docs.[1]
- **Security**: Mandate authentication (OAuth/API keys), input validation, and rate limiting. Differentiate limits: 1000/min for `/health` reads vs. 100/min for `/finance/transfers`.[3][4]
- **Performance**: Paginate lists (cursor-based for `/productivity/tasks`: `?cursor=abc&limit=50`), cache frequent reads (e.g., Redis for `/health/metrics`), minimize payloads.[1][2][4]

## Technologies and Patterns
| Pattern/Technology | Use Case | Example Implementation |
|--------------------|----------|------------------------|
| **Rate Limiting** | Prevent overload on metric endpoints | Headers: `X-RateLimit-Limit: 1000`, `X-RateLimit-Remaining: 850`, `X-RateLimit-Reset: 1699123200`. Stricter for finance writes.[4] |
| **Error Handling** | Standardized responses for all metrics | Python: `error_response("RATE_EXCEEDED", "Too many requests", status=429)` with request_id.[2] |
| **Versioning** | Evolve `/v1/health` to `/v2/metrics` without breaks | URL path: `/v1/finance/balances`.[2][4] |
| **Pagination** | Large productivity/finance datasets | Cursor: `GET /productivity/tasks?cursor=eyJ...&limit=20`; offset for simple lists.[2] |
| **Caching** | Speed up health/finance reads | Store `/health` responses in cache for 30s; reduces DB hits by 80% in high-traffic APIs.[4] |
| **Idempotency/Circuit Breaker** | Finance transactions; resilience for productivity syncs | Key-based duplicates prevention; break on >50% failures to `/finance` upstream.[4] |
| **Monitoring** | Health metrics exposure | Tools like OneUptime track `/health` response times, error rates; alert on >5% spikes.[2] |

## Design Considerations for Metrics Endpoints
- **Health**: `GET /health` returns `{"status": "healthy", "uptime": "99.9%", "metrics": {"cpu": 45}}`; check via liveness/readiness probes.[2]
- **Finance**: `GET /finance/metrics?date=2026-03-01` with idempotent `POST /finance/transactions` (idempotency-key header); version as `/v1`.[2][4]
- **Productivity**: `GET /productivity/metrics?userId=123&period=day` paginated; cache user summaries.[1][2]
- Process: Start contract-first (OpenAPI spec), top-down from requirements (e.g., "Expose daily finance totals").[1][5]

## Concrete Next Steps
- Define OpenAPI spec for your metrics API using R-CRUD framework: List requirements (e.g., "GET finance daily totals"), core resources (`/metrics/health`), URIs/methods, schemas.[5]
- Implement rate limiting with Nginx or API Gateway; test with 1000 req/min load.
- Deploy health endpoint first: `curl https://yourapi.com/health` expecting <200ms response; monitor with Prometheus.[2]
- Version immediately: `/v1/metrics`; plan `/v2` for schema changes.[2]
