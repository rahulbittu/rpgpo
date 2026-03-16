# Subtask Output — Research Multi-Tenancy Best Practices
## Model: sonar
## Stage: report
## Date: 2026-03-16

## Database Isolation Strategies

Three primary strategies for database isolation in multi-tenant SaaS applications, balancing security, cost, and scalability:

- **Shared Database, Shared Schema**: All tenants share one database and schema; isolation via **TenantId** column and **Row-Level Security (RLS)**. PostgreSQL RLS enforces tenant filtering at database level, preventing app bugs from leaking data (e.g., `WHERE TenantId = @currentTenant` enforced via policies).[3][2] Azure SQL example: Create table with TenantId index, apply FILTER/BLOCK predicates using SESSION_CONTEXT for automatic row filtering on SELECT/INSERT/UPDATE.[2]
- **Shared Database, Separate Schemas**: Each tenant gets a dedicated schema in one database instance; stronger logical separation with role-based access. Used when clients demand "separate" data without full DB overhead.[3][1]
- **Separate Databases (Silo) Per Tenant**: Full isolation per tenant database; ideal for regulated sectors like healthcare/finance (e.g., enterprise SaaS with 117 modules).[3][5] Highest security but max operational complexity; underutilizes resources unless tiered.[5]

**Recommendation**: Start with shared DB/shared schema + RLS (covers 80% SaaS cases); upgrade specific tenants to schemas/DBs for compliance.[3]

## Tenant Routing

- Inject **TenantId** into every query at app layer or connection level (e.g., set session context in Azure SQL via `EXEC sp_set_session_context @key=N'TenantId', @value=@tenantId;`).[2]
- Use **interleaved tables** in Google Cloud Spanner: TenantId as root primary key for data locality, auto-distribution, and hotspot mitigation in high-write loads.[4]
- Role-based grants: Create tenant-specific roles (e.g., `tenant_reader`) with SELECT on tenant tables only.[4]

## Data Separation Techniques

- **RLS Policies**: Non-negotiable safety net; PostgreSQL/Azure SQL filter rows by tenant identity.[3][2][6] Zendesk uses RLS + AES-256 encryption at rest/TLS 1.2+ in transit, plus SOC 2 audits.[6]
- **Partitioning/Sharding**: By TenantId at app or DB layer (e.g., TencentDB sharding).[1]
- **Encryption/Quotas**: Column-level per-tenant keys; resource quotas/throttling.[1]
- **Tier-Based**: Group tenants by usage/sensitivity for varied isolation levels (pool for cost, silo for finance).[5]

## Scaling Considerations

| Strategy | Pros | Cons | Scaling Limit | Example |
|----------|------|------|---------------|---------|
| Shared Schema + RLS | Cost-effective, easy pooling | "Noisy neighbor" risk | Single instance (e.g., PostgreSQL limits) | 80% SaaS; add dynamic allocation[3][1] |
| Separate Schemas | Balanced isolation/cost | Schema mgmt overhead | Dozens of tenants per DB | Sales-driven isolation[3] |
| Silo DBs | Max isolation | High ops cost/underuse | Manual sharding needed | Healthcare (117 modules)[3][5] |
| Cloud Spanner | Global scale/consistency | Schema complexity | Thousands of tenants, heavy writes[4] | Interleaved TenantId keys[4] |

- Mitigate noise: Dynamic CPU/memory allocation, separate storage/SSDs, query throttling.[1]
- Spanner excels over PostgreSQL for 1000s tenants/high writes via auto-sharding.[4]
- SAP CAP: Single microservice clusters with strict data isolation for multi-tenancy.[7]

## Real-World Examples

- **Zendesk (2026)**: Shared resources, RLS + strict controls/encryption; bug bounties/SOC 2 compliant.[6]
- **Healthcare SaaS**: 117 modules on separate DBs per org for compliance.[3]
- **Azure SQL SaaS**: Orders table with TenantId/RLS; integrates with Entity Framework.[2]
- **TencentDB/TDSQL**: Logical separation, quotas, sharding for MySQL/PostgreSQL.[1]
- **Cloud Spanner SaaS**: TenantId-rooted keys + roles for global apps.[4]

## Concrete Next Steps

1. Prototype shared PostgreSQL + RLS: `ALTER TABLE orders ENABLE ROW LEVEL SECURITY; CREATE POLICY tenant_policy ON orders USING (tenant_id = current_setting('app.current_tenant')::uuid);` – test with 10 fake tenants.[3]
2. Benchmark: Load test 100 tenants on Azure SQL (free tier) vs. Spanner emulator; measure query latency at 1k RPS.[2][4]
3. Migrate path: Use tools like Flyway for schema promotion; start one tenant on silo DB.[3]
4. Audit: Implement tenant context middleware (e.g., Express.js middleware sets TenantId).[2] Check compliance with SOC 2 template from Zendesk patterns.[6]
