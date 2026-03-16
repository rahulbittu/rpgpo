# Subtask Output — Research Database Migration Tools
## Model: sonar
## Stage: research
## Date: 2026-03-16

I'll search for current information on these PostgreSQL migration tools with specific details on pricing, community support, CI/CD integration, and rollback capabilities.

## Finding 1: Flyway - Core Capabilities and 2025 Updates

**Flyway** is a **SQL-first schema migration tool** that supports 22+ SQL databases including PostgreSQL, with expanded support in 2025 for MongoDB (preview), SinglestoreDB, Google Cloud Spanner, EnterpriseDB, and TimescaleDB[1]. 

Key technical details:
- **Change execution**: SQL scripts executed via CLI or Flyway Desktop[1]
- **Change orchestration**: File numbering system for execution order[1]
- **Configuration**: Unified flyway.toml in 2025[1]
- **CI/CD integration**: Supports Cloud Build pipelines with Docker image `flyway/flyway:10`[2]
- **Transaction handling**: Works with PostgreSQL's DDL transaction wrapping for clean rollbacks on failure[2]

**Pricing**: The search results do not contain specific pricing information for Flyway.

**Community support**: Flyway offers a Community version with full database compatibility without age restrictions[1], but specific community metrics are not provided in the search results.

Source: https://www.bytebase.com/blog/flyway-vs-liquibase/
Source: https://oneuptime.com/blog/post/2026-02-17-how-to-implement-database-schema-migrations-in-cicd-pipelines-for-cloud-sql-using-cloud-build/view

---

## Finding 2: Liquibase - Core Capabilities and 2025 Enhancements

**Liquibase** supports **50+ SQL and NoSQL databases** with enhanced support in 2025 for Google BigQuery (including DATABASECHANGELOGHISTORY table support) and continued MongoDB support[1].

Key technical details:
- **Change execution**: Changelog format (SQL, XML, JSON, YAML) + CLI[1]
- **Change orchestration**: Changelog + Flow with enhanced 2025 capabilities including conditionals and advanced orchestration[1]
- **Configuration**: Python-based Custom Policy Checks for Pro users in 2025[1]
- **CI/CD integration**: Kubernetes Job integration with Flux CD using image `liquibase/liquibase:4.25`[3]
- **Transaction handling**: Requires careful handling with MySQL (no DDL transaction wrapping), but works cleanly with PostgreSQL[2]

**Pricing**: The search results do not contain specific pricing information for Liquibase.

**Community support**: Liquibase offers both open-source and Pro versions, with Pro users gaining access to advanced policy checks[1], but specific community metrics are not provided.

Source: https://www.bytebase.com/blog/flyway-vs-liquibase/
Source: https://oneuptime.com/blog/post/2026-03-06-implement-database-migrations-flux-cd/view

---

## Finding 3: golang-migrate - Mentioned but Limited Details

**golang-migrate** is referenced as a viable PostgreSQL migration tool alternative in CI/CD pipelines[2], but the search results do not provide specific details on pricing, database support, community size, rollback capabilities, or configuration methods.

Source: https://oneuptime.com/blog/post/2026-02-17-how-to-implement-database-schema-migrations-in-cicd-pipelines-for-cloud-sql-using-cloud-build/view

---

## Comparison Summary: Rollback & CI/CD Integration

| Aspect | Flyway | Liquibase |
|--------|--------|-----------|
| **Rollback approach** | SQL script-based; relies on database transaction support (PostgreSQL: automatic DDL wrapping)[2] | Changelog-based; relies on database transaction support[2] |
| **CI/CD platforms** | Google Cloud Build (Docker image available)[2] | Kubernetes/Flux CD (Docker image available)[3] |
| **Complexity** | Simpler, developer-friendly SQL-first approach[1] | More flexible with advanced orchestration (2025 Flow enhancements)[1] |

---

## Data Gaps

The search results **do not include**:
- Specific pricing tiers or costs for either tool
- Community size metrics (GitHub stars, active contributors, forum activity)
- Detailed rollback failure scenarios or recovery procedures
- golang-migrate technical specifications or pricing

To obtain this information, you would need to visit official documentation sites (flyway.db, liquibase.org, golang-migrate.readthedocs.io) or GitHub repositories directly.
