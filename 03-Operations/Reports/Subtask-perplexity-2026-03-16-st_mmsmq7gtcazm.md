# Subtask Output — Research data quality testing frameworks
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Great Expectations (GX)

Great Expectations is a Python-based open-source framework for data quality testing, featuring GX Core (free library for defining/validating expectations) and GX Cloud (managed platform for collaboration and observability). It uses declarative "Expectations" like `expect_column_values_to_not_be_null`, automated profiling for generating test suites, and Data Docs for human-readable reports. Ideal for integrating into dbt or Airflow pipelines, starting developer-first and scaling to enterprise governance.[1]

- **Recent mentions (2026 context):** Recommended in "The 12 Best Data Quality Tools for Trusted Insights in 2026" as the open-source standard; also embedded in AI data readiness frameworks for pipeline validation.[1][5]
- **Source:** https://www.trackingplan.com/blog/best-data-quality-tools[1]; https://www.nitorinfotech.com/blog/data-readiness-for-ai-a-2026-framework-for-ai-ready-organizations/[5]

## dbt Tests

dbt (data build tool) tests are SQL-based assertions integrated into transformation pipelines for validating data quality during ELT processes, such as checking for nulls, uniqueness, or relationships. No specific 2026 metrics or new releases found in results; commonly paired with Great Expectations for comprehensive testing in Airflow/dbt workflows.[1]

- **Use case:** Data teams integrate dbt tests directly into pipelines for development-stage validation.
- **Source:** https://www.trackingplan.com/blog/best-data-quality-tools[1] (no dedicated section, referenced in GX integration)

## Soda Core

Soda Core is an open-source data quality tool for automated validation, focusing on scans and checks embedded in pipelines for real-time monitoring. Mentioned alongside Great Expectations in 2026 AI data frameworks for enhancing data engineering pipelines, storage, and governance.[5]

- **Recent mentions (2026 context):** Included in "Data Readiness for AI: 2026 Framework" for automated validation in AI-ready organizations.
- **Source:** https://www.nitorinfotech.com/blog/data-readiness-for-ai-a-2026-framework-for-ai-ready-organizations/[5]

**Search notes:** Results from March 2026 sources emphasize GX most prominently in tool rankings and AI frameworks; dbt tests and Soda Core have lighter coverage, often as integrations. No pricing, user numbers, or GitHub stats (e.g., stars/releases) in top results—tried queries like "Great Expectations vs dbt tests vs Soda Core 2026 comparison", "Soda Core data quality updates 2026", "dbt tests framework metrics"—yielding no additional specifics beyond these.[1][5] For deeper metrics, check official docs: greatexpectations.io, getdbt.com, sodadata.com.
