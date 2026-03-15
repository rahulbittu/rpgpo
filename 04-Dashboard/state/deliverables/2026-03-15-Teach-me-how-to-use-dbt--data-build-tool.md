# Teach me how to use dbt (data build tool) from scratch. I know SQL and have used

**Domain:** learning | **Date:** 2026-03-15 | **Subtasks:** 2



## Research dbt learning resources
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

## Synthesize a progressive learning path for dbt
## Key Findings

1. **Comprehensive Official Documentation**: The dbt Developer Hub provides a structured learning path from basic to advanced topics, including installation, model creation, testing, documentation, and deployment. It is a primary resource for learning dbt, with detailed guides and examples.
   
2. **Practical Setup with BigQuery**: A tutorial focused on setting up a dbt project with BigQuery, covering essential components like `dbt_project.yml`, model creation, testing, and documentation. It emphasizes practical application through hands-on exercises.

3. **Advanced Testing and Deployment**: The documentation includes advanced topics such as testing frameworks (generic, singular, schema tests), CI/CD integration, and using dbt Cloud for deployment. This is crucial for scaling and maintaining data quality.

## Detailed Analysis

### Basic Model Creation
- **Resources**: Official dbt documentation (https://docs.getdbt.com/docs/introduction)
- **Topics**: Installation, setting up a project (`dbt init`), creating basic models (`SELECT` statements in `.sql` files), using `ref()` for model dependencies.
- **Hands-On Exercise**: Set up a simple dbt project with a basic model using a local database or BigQuery. Create a model file like `my_first_dbt_model.sql` and run it using `dbt run`.

### Testing
- **Resources**: Official dbt testing documentation (https://docs.getdbt.com/docs/building-a-dbt-project/tests)
- **Topics**: Implementing tests using `schema.yml` files, writing generic tests (`unique`, `not_null`), and creating custom singular tests.
- **Hands-On Exercise**: Add tests to your dbt project. Create a `schema.yml` file and define tests for your models. Run `dbt test` to validate data quality.

### Documentation
- **Resources**: dbt documentation on generating docs (https://docs.getdbt.com/docs/building-a-dbt-project/documentation)
- **Topics**: Using `dbt docs generate` to create documentation, adding descriptions to models and columns, viewing lineage graphs.
- **Hands-On Exercise**: Document your models by adding descriptions in `schema.yml`. Generate and view the documentation using `dbt docs serve`.

### Deployment
- **Resources**: dbt Cloud and CI/CD integration documentation (https://docs.getdbt.com/docs/dbt-cloud/cloud-overview)
- **Topics**: Setting up CI/CD pipelines, deploying to dbt Cloud, automating runs, and monitoring.
- **Hands-On Exercise**: Configure a CI/CD pipeline for your dbt project using GitHub Actions or another CI tool. Deploy your project to dbt Cloud and schedule regular runs.

## Recommended Actions

1. **Begin with Basics**:
   - **What to do**: Follow the official dbt documentation to set up your first project.
   - **Why**: Establish a solid foundation in dbt's core functionalities.
   - **Expected Outcome**: A functional dbt project with basic models and dependencies.
   - **First Step**: Install dbt and initialize a new project using `dbt init`.

2. **Implement Testing**:
   - **What to do**: Add tests to your models using `schema.yml`.
   - **Why**: Ensure data quality and integrity within your models.
   - **Expected Outcome**: A robust testing framework that catches data issues early.
   - **First Step**: Define and run basic tests using `dbt test`.

3. **Enhance Documentation**:
   - **What to do**: Use `dbt docs generate` to create comprehensive documentation.
   - **Why**: Improve project maintainability and facilitate team collaboration.
   - **Expected Outcome**: Easily accessible and understandable project documentation.
   - **First Step**: Add descriptions to your models and columns in `schema.yml`.

4. **Advance to Deployment**:
   - **What to do**: Set up CI/CD pipelines and deploy to dbt Cloud.
   - **Why**: Automate processes and ensure consistent project updates.
   - **Expected Outcome**: Streamlined deployment process with automated checks.
   - **First Step**: Integrate your dbt project with a CI/CD tool like GitHub Actions.

By following this structured learning path, you will progressively build expertise in dbt, from foundational skills to advanced deployment strategies.