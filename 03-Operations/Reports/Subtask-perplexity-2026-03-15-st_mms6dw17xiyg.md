# Subtask Output — Research Database Migration Strategies
## Model: sonar
## Stage: report
## Date: 2026-03-15

## Finding 1: Incremental/Delta Migration as Zero-Downtime Strategy (Closest to Rolling Migrations)
Lumitech's 2026 guide describes **incremental/delta migration** for database schema changes: initial bulk load of data followed by continuous syncing of changes until cutover. This reduces downtime to near-zero, supports large-scale cloud migrations, but requires robust change tracking and conflict handling. Used in cloud database migrations with examples like MySQL to PostgreSQL or on-prem to managed services.[1]  
**Source:** https://lumitech.co/insights/data-migration-guide

## Finding 2: Big Bang vs. Phased Migrations (Related to Blue-Green Cutovers)
Lumitech outlines **big bang migration** (all data moves at once with one switchover) for smaller systems: pros include faster timeline (e.g., cleaner cutover), cons include higher risk and larger downtime. **Phased migration** rolls out by module/business unit over time, reducing risk but complicating integrations—common in ERP migrations.[1]  
No explicit blue-green deployment details found.  
**Source:** https://lumitech.co/insights/data-migration-guide

## Finding 3: Liquibase 2025 Enhancements for Complex Schema Orchestration (Feature Flag-Like Logic)
Bytebase's 2026 comparison notes Liquibase's 2025 updates added **Flow conditionals** and variables for sophisticated migration logic, enabling conditional schema changes (similar to feature flags). Supports 50+ databases; use `diff-changelog` for schema sync and Drift Report for ongoing changes. Flyway (alternative) uses numbered SQL files for order but lacks advanced conditionals.[3]  
**Next step:** Test Liquibase Flow for schema flags in a staging DB via free trial at liquibase.com.  
**Source:** https://www.bytebase.com/blog/flyway-vs-liquibase/

## Finding 4: Google Cloud Database Migration Service for Schema-Aware Transfers
DigitalOcean's 2026 tools list highlights Google Cloud's **Database Migration Service** (DMS): serverless transfers keep source DBs live during moves, auto-converts legacy SQL schemas/code for cloud-native DBs like BigQuery. Handles high-volume schema changes without reformatting; pairs with Storage Transfer for mass data.[2]  
**Metrics:** Supports large-scale warehouse migrations; precise resource translation avoids overprovisioning.  
**Source:** https://www.digitalocean.com/resources/articles/cloud-migration-tools

No direct results found for "blue-green deployments database schema," "rolling migrations schema changes," or "feature flags schema changes" in last 30 days (post-2026-02-13). Refined search suggestion: "zero-downtime database schema migration 2026 blue-green." Tools like Azure Migrate handle DB transitions but lack strategy specifics.[2][4]
