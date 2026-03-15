# Teach me how to use dbt (data build tool) from scratch. I know SQL and have used

## Phase 1: User Context

- **Task ID**: `t_mmrzd877m6jc`
- **Engine**: general
- **Urgency**: normal
- **Created**: 2026-03-15T16:40:11

### Operator Context (auto-injected)
- Rahul, Senior Data Engineer / Entrepreneur, Austin TX
- Output style: Specific, actionable, cited. No generic frameworks.

### Request
> Teach me how to use dbt (data build tool) from scratch. I know SQL and have used Airflow. Create a progressive learning path with hands-on exercises. Start with basic models and work up to testing, documentation, and deployment patterns.

## Phase 2: Board of AI Deliberation

**Chief of Staff**: "Create a progressive learning path for dbt, starting from basics to advanced concepts."

**Strategy**: Develop a structured learning path that introduces dbt concepts progressively. Start with basic model creation and gradually introduce more complex topics like testing, documentation, and deployment. Include hands-on exercises to reinforce learning. Tailor the content to assume familiarity with SQL and Airflow, leveraging these skills to ease the transition to dbt.

**Risk**: green | **Code Task**: No

**Execution Plan**:

| Step | Task | Model | Stage |
|------|------|-------|-------|
| 1 | Research dbt learning resources | perplexity | research |
| 2 | Synthesize a progressive learning path for dbt | openai | report |

## Phase 3: Execution

### Step 1: Research dbt learning resources [perplexity]

**Status**: done | **Stage**: research

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

### Step 2: Synthesize a progressive learning path for dbt [openai]

**Status**: done | **Stage**: report

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
   - **What to do**: A

*... truncated (4120 chars total)*

## Phase 4: Deliverable

- **Status**: done
- **Subtasks**: 2/2 completed
- **Download MD**: /api/intake/task/t_mmrzd877m6jc/export?fmt=md
- **Download JSON**: /api/intake/task/t_mmrzd877m6jc/export?fmt=json
