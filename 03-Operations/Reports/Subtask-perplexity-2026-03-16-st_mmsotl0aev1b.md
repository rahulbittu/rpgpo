# Subtask Output — Research API Gateway Patterns
## Model: sonar
## Stage: report
## Date: 2026-03-16

## Kong API Gateway Patterns

### Rate Limiting
Kong implements rate limiting via its **rate-limiting plugin**, configurable to limit requests per time window (e.g., 100 requests per minute) with policies like local storage or Redis/Cassandra backend. On limit exceed, it returns HTTP 429 status and exposes headers like X-RateLimit-Remaining.[1][2]
- **Configuration example** (from Kong 3.5 declarative YAML): `minute: 100`, `policy: local`, `header_by: X-Consumer-ID`.[1][2]
- **AI-specific extension** (Kong AI Gateway, version 3.8+): Combines with semantic caching using vector databases like Redis; cache hits reduce latency by up to 20x via embedding similarity matching.[5]

**Source**: https://codewithyoha.com/blogs/api-gateway-patterns-authentication-rate-limiting-and-traffic-management-demystified[1]; https://oneuptime.com/blog/post/2026-02-21-how-to-use-ansible-to-configure-api-gateways-kong/view[2]; https://dev.to/kuldeep_paul/top-ai-gateways-with-semantic-caching-and-dynamic-routing-2026-guide-4a0g[5]

### Authentication
Kong uses a **plugin-based architecture** for authentication, supporting API keys, JWT, OAuth, and custom headers (e.g., X-Consumer-ID from auth plugins). Plugins chain with rate limiting for consumer identification.[1][3]
- Integrates with enterprise RBAC, audit logging, and PII detection in Kong AI Gateway for AI workloads.[7]

**Source**: https://codewithyoha.com/blogs/api-gateway-patterns-authentication-rate-limiting-and-traffic-management-demystified[1]; https://www.digitalapi.ai/blogs/best-api-gateway[3]; https://www.getmaxim.ai/articles/top-5-enterprise-ai-gateways-in-2026-3/[7]

### Request Routing
Kong supports **weighted routing** for canary (e.g., 90% to v1, 10% to v2) and blue/green deployments, plus dynamic algorithms like round-robin, lowest-latency, consistent hashing, usage-based, and semantic routing (prompt analysis for AI models like OpenAI, AWS Bedrock).[1][5]
- **Declarative config example** (Kong 3.0+): Routes by paths (e.g., /api/v1/orders) to services with strip_path: true.[2]
- Kubernetes-native with multi-protocol (REST, gRPC, GraphQL) support.[3]

**Source**: https://codewithyoha.com/blogs/api-gateway-patterns-authentication-rate-limiting-and-traffic-management-demystified[1]; https://oneuptime.com/blog/post/2026-02-21-how-to-use-ansible-to-configure-api-gateways-kong/view[2]; https://dev.to/kuldeep_paul/top-ai-gateways-with-semantic-caching-and-dynamic-routing-2026-guide-4a0g[5]; https://www.digitalapi.ai/blogs/best-api-gateway[3]

### Response Caching
Kong AI Gateway (3.8+) provides **semantic caching** via AI plugin: Generates embeddings for prompts, stores in Redis vector DB, matches new requests within threshold to return cached responses (up to 20x latency reduction). Traditional caching via plugins, but no non-AI specifics in recent results.[5]

**Source**: https://dev.to/kuldeep_paul/top-ai-gateways-with-semantic-caching-and-dynamic-routing-2026-guide-4a0g[5]

## AWS API Gateway Patterns
No specific configurations, numbers, or examples for **rate limiting, authentication, request routing, or response caching** in AWS API Gateway from results (focus heavily on Kong). General patterns like weighted routing apply conceptually, but AWS details absent.[1]

**Next Steps**:
- Test Kong rate limiting: Deploy via Ansible (kong_version: "3.5", postgres on port 5432) using configs from [2].
- For AWS comparison: Search "AWS API Gateway rate limiting config 2026 examples" for service quotas (default 10,000 RPS) and caching (TTL up to 3600s, 0.5-1.5s min).

**Note**: Results skewed to Kong (8/9 sources); AWS info insufficient—live search yielded no direct matches for queried patterns in last 30 days.
