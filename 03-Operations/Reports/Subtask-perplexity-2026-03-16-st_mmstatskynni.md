# Subtask Output — Research Schema Stitching vs Federation v2
## Model: sonar
## Stage: report
## Date: 2026-03-16

## Schema Stitching vs Federation v2 Key Differences

**Schema stitching configures type relationships centrally at the GraphQL gateway level, while Federation v2 (Apollo spec v2.7) distributes ownership and resolution logic to individual subgraphs using directives like @key and @link, enabling independent schema generation and scaling.**[1][2]

### Core Comparison
| Aspect | Schema Stitching | Federation v2 |
|--------|------------------|---------------|
| **Configuration Location** | Centralized at gateway (links services manually) | Distributed across subgraphs (directives on types like @key(fields: "id"))[1][2] |
| **Entity Ownership** | Gateway-managed | Every subgraph defining an entity is an owner (relaxed from v1)[2] |
| **Schema Generation** | Requires gateway stitching config | Each service generates valid standalone schema via toFederatedSchema() with FederatedSchemaGeneratorConfig[1][2] |
| **Example Schema Output** | N/A (gateway stitches) | Includes _entities, _Entity union, _Service with SDL[1][2] |
| **Use Case Scaling** | Monolithic server bottlenecks | API gateway + subgraphs for team scaling (e.g., Expedia Group)[1] |

### Real-World Implementations (2026 Data)
## Finding 1: Apollo Federation v2.7 Schema Example
- Generated schema (from graphql-kotlin-federation library): Features @key(fields: "id", resolvable: true) on User type, _entities resolver, union _Entity = User, scalar FieldSet/_Any/link__Import.
- Date: Docs for version 10.x.x (active as of 2026).
- Source: https://opensource.expediagroup.com/graphql-kotlin/docs/10.x.x/schema-generator/federation/apollo-federation/[1]

## Finding 2: Federation v2 Subgraph Example (Product Type)
- Code: Product @key(fields: "id"), resolver via ProductResolver.resolve(), hooks=FederatedSchemaGeneratorHooks.
- Supports packages like org.example; generates Query with _entities/_service.
- Date: Current docs (graphql-kotlin-federation extends schema-generator).
- Source: https://expediagroup.github.io/graphql-kotlin/docs/schema-generator/federation/federated-schemas[2]

## Finding 3: Fast.io REST-to-Federation Stitching (2026 Tutorial)
- Wraps REST API (e.g., GET /current/workspace/{id}/storage/list) as subgraph with __resolveReference for entity resolution.
- Free tier: 50GB storage; integrates with Apollo Router/Gateway.
- Mentions stitching alternatives but favors federation for gateways.
- Published: 2026.
- Source: https://fast.io/resources/fastio-api-graphql-federation-tutorial/[3]

## Finding 4: graphql-architect Skill Recommends Both
- Prescribes Apollo Federation v2 + schema stitching alternatives for modular schemas.
- Version 1.0.1 by saeed-vayghan; focuses on type safety, query optimization.
- No specific numbers; lists as alternatives.
- Date: Active marketplace entry (2026).
- Source: https://lobehub.com/skills/saeed-vayghan-gemini-agent-skills-graphql-architect[4]

### Actionable Next Steps
- **Test Federation v2**: Clone Expedia's graphql-kotlin repo, run toFederatedSchema(config) with @key on a type; deploy subgraph[1][2].
- **Benchmark Routers**: Compare Hive Router (Rust-based, OTLP tracing) vs Apollo; see full perf audit[5].
- **Build Hybrid**: Start with stitching for legacy REST (e.g., Fast.io), migrate to v2 subgraphs[3].
- No market size/revenue data found in last 30 days (searched "graphql federation v2 vs stitching 2026 benchmarks", "apollo federation adoption stats 2026"); results emphasize implementation over metrics.
