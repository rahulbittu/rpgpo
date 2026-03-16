# Subtask Output — Research Multi-Tenant SaaS Data Isolation
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Schema-per-Tenant vs Shared-Schema Approaches

**Shared database, shared schema** uses a single database and tables with a `tenant_id` column for logical isolation, offering lowest cost and simplest operations but requiring robust row-level security (RLS) to prevent data leaks.[1][3][4] **Schema-per-tenant** (shared database, separate schemas) assigns each tenant a unique schema in one database, providing stronger isolation than shared schema while avoiding full database separation; migrations must run across all schemas, becoming risky at 200+ tenants.[1][2][5] **Separate databases per tenant** delivers maximum isolation for compliance but increases costs and management complexity, used in healthcare SaaS with 117 feature modules.[1][4]

| Approach | Pros | Cons | Example Use Cases |
|----------|------|------|-------------------|
| Shared Schema | Cheapest, easiest updates/migrations, scales for uniform features | Weakest isolation, compliance risks without RLS | IT asset management B2B SaaS with 6 roles[1]; Zendesk's logical partitioning[4] |
| Schema-per-Tenant | Better isolation than shared schema, single DB management | Migration overhead at scale (e.g., 10-200 schemas) | Platforms emphasizing data separation in sales[1]; Neon Postgres schema-per-user[5] |
| Separate DBs | Strongest isolation, tenant-specific optimization | High ops complexity/cost, inefficient resources | Healthcare SaaS for HIPAA[1][3]; Premium tenants in Terraform setups[6] |

Recommendation from sources: Start with shared schema + RLS for 80% of cases, upgrade specific tenants to schemas/DBs for compliance.[1][3]

## Row-Level Security in PostgreSQL

PostgreSQL RLS enforces tenant isolation in shared schemas via policies on tables, filtering rows by `tenant_id` or session context (e.g., `current_setting('app.current_tenant')`).[1][5] Implement with `CREATE POLICY` statements tied to user roles; all queries auto-apply filters if enabled on tables.[5] Neon docs example schema uses RLS with `users`, `projects`, `tasks` tables in shared setup, recommending against it long-term vs. DB-per-tenant for scaling/compliance.[5] Zelifcam mandates RLS from day one in shared schema for B2B SaaS.[1]

**Concrete steps**: Enable RLS with `ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;`, then `CREATE POLICY tenant_isolation ON your_table USING (tenant_id = current_setting('app.current_tenant')::uuid);` set session var in app middleware.[5]

## Connection Routing

Route connections dynamically by tenant ID to correct schema/DB using Postgres extensions like Citus or app-level proxies (e.g., PgBouncer with tenant-aware pooling).[5][6] In Neon, provision DB-per-tenant via API, routing via Drizzle ORM configs per tenant (`drizzle.config.ts`).[5] Terraform example uses per-tenant DBs for premium, shared ECS cluster routes via Cognito tenant context.[6] Zendesk likely uses app-layer routing for multi-DB patterns.[4]

## Tenant-Aware Caching

Enforce tenant context in caches (e.g., Redis) by prefixing keys with `tenant_id` (e.g., `cache:tenant_123:user_456`) to avoid cross-tenant leaks.[1][6] S3 storage uses tenant prefixes + bucket policies for isolation.[6] No shared-schema examples detail caching, but RLS-integrated queries reduce cache needs; scale with tenant-scoped invalidation on migrations.[1]

## Compliance Considerations

**HIPAA/SOC 2/GDPR**: Mandate separate DBs/schemas for strict isolation; shared schema viable only with RLS + audits.[1][3][4] Healthcare SaaS used DB-per-tenant for 117 modules to satisfy auditors.[1] Zendesk offers dedicated resources for enterprises needing GDPR/HIPAA.[4] Hybrid: Shared for standard, isolated DBs for premium (e.g., OneUptime Terraform).[6] Start shared + RLS, migrate regulated tenants.[1][3]

**Real Examples**:
- **Zelifcam IT SaaS**: Shared schema + `tenant_id` + RLS, scales for uniform B2B.[1] Source: https://www.zelifcam.net/blog/the-zelifcam-difference-1/building-multi-tenant-saas-architecture-decisions-that-scale-49
- **Neon Postgres**: Schema-per-user or DB-per-tenant with Drizzle; GitHub schema.ts/sql.[5] Source: https://neon.com/docs/guides/multitenancy
- **Zendesk**: Logical isolation (likely shared schema) + multi-DB for enterprises.[4] Source: https://www.eesel.ai/blog/zendesk-saas-multi-tenant
- **OneUptime Terraform**: Shared ECS/S3 prefixes, per-tenant DBs premium + Cognito.[6] Source: https://oneuptime.com/blog/post/2026-02-23-how-to-build-a-multi-tenant-saas-infrastructure-with-terraform/view

**Next Steps**: Audit tenant count/compliance needs; prototype shared schema + Postgres RLS in Neon (free tier); test migrations at 50 schemas; use Terraform for hybrid scaling.[1][5][6]
