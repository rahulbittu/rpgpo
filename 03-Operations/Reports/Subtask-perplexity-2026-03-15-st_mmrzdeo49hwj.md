# Subtask Output — Research dbt learning resources
## Model: sonar
## Stage: research
## Date: 2026-03-15

## Finding 1: Official dbt Developer Hub Documentation
Official dbt docs provide a comprehensive, free resource starting from basics like installation and model creation, progressing to advanced topics including testing (generic, singular, schema tests), documentation (via `dbt docs generate`), and deployment (CI/CD integration, dbt Cloud platform). Covers dbt framework (language for SQL models, Jinja templating, ref() for dependencies) and engines (dbt Core for basic execution, dbt Fusion for advanced static analysis and LSP features). Structure: introduction → build models → run/test → deploy/monitor.

- **Progression**: Basics (models, sources, seeds); Advanced (testing frameworks, snapshots for SCD, macros, analyses, lineage).
- **Authors**: dbt Labs team.
- **Publication/Update**: Core docs ongoing; Fusion engine features highlighted in recent updates (as of 2026).
- **URLs**: https://docs.getdbt.com/docs/introduction[4]; https://docs.getdbt.com/docs/local/install-dbt (installation, VS Code extension for local dev with IntelliSense, refactoring)[7].
- **Source**: https://docs.getdbt.com/docs/introduction

## Finding 2: dbt with BigQuery Setup Tutorial
Step-by-step guide to basic dbt project setup (dbt_project.yml, models folder with example SQL files like my_first_dbt_model.sql), progressing to schema.yml for documentation/tests, ref() dependencies, staging/marts pattern, incremental models, snapshots, and macros. Emphasizes testing for data quality and scaling to production.

- **Progression**: Project init → basic models → tests/docs → advanced (incremental, snapshots).
- **Authors**: OneUptime blog team.
- **Publication Date**: February 17, 2026.
- **URL**: https://oneuptime.com/blog/post/2026-02-17-how-to-set-up-a-dbt-project-with-bigquery-as-the-data-warehouse-backend/view[6].
- **Source**: https://oneuptime.com/blog/post/2026-02-17-how-to-set-up-a-dbt-project-with-bigquery-as-the-data-warehouse-backend/view

## Finding 3: YouTube Tutorial on dbt Sources
Video tutorial focused on creating sources in dbt (basic data ingestion step before models), part of a "2026 Full Guide" series on DBT data transformation, open-source tools, covering SQL-based workflows.

- **Progression**: Sources (basic) as entry to full transformations/testing.
- **Authors**: Not specified in snippet (channel likely DBT-focused).
- **Publication Date**: 2026 (titled as such).
- **URL**: https://www.youtube.com/watch?v=GPbKEKxEJcc[5].
- **Source**: https://www.youtube.com/watch?v=GPbKEKxEJcc

No additional high-quality, structured learning paths (e.g., full courses from Udemy/Coursera, recent blogs) matching exact progression from basics to advanced testing/docs/deployment found in last 30 days (Feb 13 - Mar 15, 2026). Other results mention dbt briefly as a tool but lack tutorials[1]. Refined search suggestion: "dbt tutorial 2026 full course basics to deployment".
