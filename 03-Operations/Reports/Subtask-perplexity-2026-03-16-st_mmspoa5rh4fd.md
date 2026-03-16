# Subtask Output — Research Flyway and Database Versioning
## Model: sonar
## Stage: report
## Date: 2026-03-16

## Flyway Conventions
Flyway uses a strict file naming convention for migrations placed in directories like `src/main/resources/db/migration/` or `db/migrations/`: versioned files start with `V{version}__{description}.sql` (e.g., `V1__create_users_table.sql`, `V2__create_orders_table.sql`) and run once; repeatable files start with `R__{description}.sql` (e.g., `R__refresh_product_view.sql`) and re-run on checksum changes.[1][2][4]  
One logical change per file is recommended, with commands like `flyway migrate` to apply pending migrations, `flyway info` for status, `flyway validate` for checksum checks, and `flyway repair` for fixing failed checksums.[4]  
Source: https://oneuptime.com/blog/post/2026-02-17-how-to-configure-flyway-database-migrations-for-cloud-sql-in-a-spring-boot-application-deployed-to-gke/view [1]; https://oneuptime.com/blog/post/2026-02-17-how-to-implement-database-schema-migrations-in-cicd-pipelines-for-cloud-sql-using-cloud-build/view [2]; https://www.pkgpulse.com/blog/best-database-migration-tools-nodejs-2026 [4].

## Backward Compatibility in Database Versioning
Migrations must be **backward compatible** to avoid errors during deployments, as old application versions continue running alongside new ones—e.g., never drop columns referenced by legacy code.[2]  
Flyway enforces this via versioned SQL files ordered by naming (e.g., `V001__...`), ensuring sequential application without arbitrary reordering.[3]  
Source: https://oneuptime.com/blog/post/2026-02-17-how-to-implement-database-schema-migrations-in-cicd-pipelines-for-cloud-sql-using-cloud-build/view [2]; https://www.bytebase.com/blog/flyway-vs-liquibase/ [3].

## Zero-Downtime Migration Techniques
Run migrations as separate Kubernetes Jobs before application rollouts in production with multiple replicas, using Cloud SQL Auth Proxy or Socket Factory for connectivity (e.g., `spring.flyway.connect-retries=5`, `spring.flyway.connect-retries-interval=10`).[1]  
In CI/CD with Cloud Build, sequence steps: start proxy, run `flyway migrate` (e.g., `flyway/flyway:10` image with `-baselineOnMigrate=true`), then build/deploy only after success; use dedicated `migration_user` with elevated permissions, separate from app runtime user.[2]  
Keep migrations small, test in staging mirroring production, and avoid destructive ops like `clean`.[1]  
Source: https://oneuptime.com/blog/post/2026-02-17-how-to-configure-flyway-database-migrations-for-cloud-sql-in-a-spring-boot-application-deployed-to-gke/view [1]; https://oneuptime.com/blog/post/2026-02-17-how-to-implement-database-schema-migrations-in-cicd-pipelines-for-cloud-sql-using-cloud-build/view [2].

## Rollback Safety Measures
Flyway uses a built-in lock table (`flyway_schema_history` by default) to prevent concurrent migrations across builds.[2]  
Enforce idempotent scripts with `IF EXISTS/IF NOT EXISTS`; never edit applied migrations (fixed checksums trigger `validate` failures); use `flyway baseline` to mark existing DBs at a version (e.g., `spring.flyway.baseline-version=0`, `spring.flyway.baseline-on-migrate=true`).[1][4][7]  
2025 Flyway Enterprise added backup-based baseline (restore from backup instead of long scripts) for shadow DBs, avoiding invalid objects.[3]  
Rollbacks: Manual via new undo migrations or tool-specific (e.g., Prisma via preview, but Flyway emphasizes upfront safety over auto-rollback).[4]  
Source: https://oneuptime.com/blog/post/2026-02-17-how-to-configure-flyway-database-migrations-for-cloud-sql-in-a-spring-boot-application-deployed-to-gke/view [1]; https://oneuptime.com/blog/post/2026-02-17-how-to-implement-database-schema-migrations-in-cicd-pipelines-for-cloud-sql-using-cloud-build/view [2]; https://www.pkgpulse.com/blog/best-database-migration-tools-nodejs-2026 [4]; https://www.bytebase.com/blog/flyway-vs-liquibase/ [3]; https://lobehub.com/skills/krushna-pro-max-ai-coding-agents-migration-script-generator [7].

**Next Steps**: Test a sample migration in a local PostgreSQL/MySQL instance using Flyway CLI (`flyway migrate` on `V1__test.sql`), then integrate into a Cloud Build pipeline as in [2] for GKE deploys. Validate with `flyway validate-on-migrate=true`.[1][2]
