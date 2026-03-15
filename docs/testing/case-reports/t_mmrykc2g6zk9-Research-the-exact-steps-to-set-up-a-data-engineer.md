# Research the exact steps to set up a data engineering portfolio on GitHub that d

## Phase 1: User Context

- **Task ID**: `t_mmrykc2g6zk9`
- **Engine**: careeregine
- **Urgency**: normal
- **Created**: 2026-03-15T16:17:43

### Operator Context (auto-injected)
- Rahul, Senior Data Engineer / Entrepreneur, Austin TX
- Output style: Specific, actionable, cited. No generic frameworks.

### Request
> Research the exact steps to set up a data engineering portfolio on GitHub that demonstrates real skills. Include project ideas, README templates, and what hiring managers actually look for.

## Phase 2: Board of AI Deliberation

**Chief of Staff**: "Identify and outline the exact steps to create a data engineering portfolio on GitHub that effectively demonstrates real skills."

**Strategy**: First, conduct a web search to gather current information on data engineering portfolios, focusing on project ideas, README templates, and hiring manager preferences. Then, synthesize these findings into a structured guide. Finally, compile the report into a markdown file for reference.

**Risk**: green | **Code Task**: No

**Execution Plan**:

| Step | Task | Model | Stage |
|------|------|-------|-------|
| 1 | Research Data Engineering Portfolios | perplexity | research |
| 2 | Synthesize Portfolio Setup Guide | openai | report |

## Phase 3: Execution

### Step 1: Research Data Engineering Portfolios [perplexity]

**Status**: done | **Stage**: research

## Project Ideas for Data Engineering Portfolios

- **Real estate Dagster pipeline**: Processes real estate data end-to-end; includes a blog on building it in 20 minutes. GitHub repo via ssp.sh projects list[1].
- **Airbyte Monitoring with dbt and Metabase**: Monitors Airbyte connectors using dbt for transformations and Metabase for visualization. Direct GitHub code linked[1].
- **Open Enterprise Data Platform**: Integrates dbt, Airflow, and Superset on Postgres for enterprise-grade pipelines. Focuses on unified open-source tooling[1].
- **Airflow KubernetesPodOperator + dbt example**: Downloads 150 CSVs, loads to Postgres, runs dbt; runnable via Astro CLI for local/production testing[1].
- **Kestra + dlt + Snowflake pipeline**: Builds enterprise pipelines with orchestration, data loading, secrets management, git sync, and AI integration[1].
- **Cloud Cost Analyzer**: Multi-cloud cost tracking framework, extendable with dlt loader; includes companion blog[1].
- **Spark/PySpark/Delta Lake/Unity Catalog workflows**: Real-world analytics pipelines for learning/portfolio; covers Spark, SQL on GitHub topic repos updated recently[3].

**Next step**: Fork 2-3 repos (e.g., Airbyte Monitoring, Dagster real estate), customize with your data source, deploy to free tier (Dagster Cloud free tier supports 1 deployment), commit changes by March 20, 2026.

Source: https://www.ssp.sh/brain/open-source-data-engineering-projects/[1]; https://github.com/topics/data-engineering-project?o=asc&s=updated[3]

## README Best Practices from Hiring Managers

Hiring managers prioritize repos showing **full workflow** (raw data to clean results) and **clear documentation**. A README must explain: what you did, data sources, findings. Undocumented repos signal poor communication—many skip interviews without it. Aim for 3-5 projects demonstrating tool range (e.g., Python/SQL + orchestration)[2].

**Template structure** (adapt from Dataquest guidelines):
- Project title and 1-sentence overview.
- Tools/tech stack (e.g., Dagster, dbt, Postgres).
- Data source + business problem.
- Step-by-step workflow (code snippets, diagrams).
- Results/insights (metrics, visuals).
- Challenges solved + improvements.
- Run instructions (docker-compose up).

**Next step**: Clone a project like Airflow dbt example, add README.md with above sections, include Jupyter notebook for EDA; push to public repo named "rahul-de-portfolio-1" today.

Source: https://www.dataquest.io/blog/data-analyst-projects-for-beginners/[2]

## What Hiring Managers Look For (Specifics)

- **End-to-end pipelines**: Raw ingestion to production-ready output (e.g., Dagster assets used by Dagster team at high-growth startups)[1].
- **Real tools in context**: Airflow Kubernetes ops, dbt transforms, Airbyte EL, not isolated scripts[1][3].
- **Business impact**: EDA answering questions (e.g., app profitability analysis: 4-6 hours Python project on App Store data)[2].
- **Documentation quality**: README > code alone; recruiters ch

*... truncated (3780 chars total)*

### Step 2: Synthesize Portfolio Setup Guide [openai]

**Status**: done | **Stage**: report

## Key Findings

1. **Project Variety and Complexity**: A diverse range of projects, such as real estate data pipelines, Airbyte monitoring, and multi-cloud cost analysis, can showcase your ability to handle various data engineering challenges. These projects also demonstrate proficiency with popular tools like Dagster, dbt, Airflow, and Spark.

2. **Tool Proficiency**: Utilizing tools like Dagster, Airbyte, dbt, Metabase, and KubernetesPodOperator in your projects highlights your technical skills and familiarity with industry-standard technologies, which are crucial for data engineering roles.

3. **Deployment and Customization**: Deploying projects on platforms like Dagster Cloud and customizing them with your data sources can demonstrate your ability to adapt and implement solutions in real-world scenarios, a skill highly valued by hiring managers.

4. **Documentation and Presentation**: A well-structured README file is essential. It should clearly explain the project, its purpose, the tools used, and how to set it up. This not only aids in understanding but also reflects your communication skills.

5. **Real-World Relevance**: Projects like the Cloud Cost Analyzer and Spark workflows are directly applicable to real-world business problems, making them attractive to employers looking for practical and impactful solutions.

## Detailed Analysis

- **Real Estate Dagster Pipeline**: This project involves building an end-to-end data processing pipeline for real estate data, showcasing skills in data ingestion, transformation, and orchestration using Dagster. The associated blog can also demonstrate your ability to communicate complex processes clearly.

- **Airbyte Monitoring with dbt and Metabase**: This project monitors data pipelines, a crucial task in maintaining data integrity and performance. Using dbt for transformations and Metabase for visualization shows your capability to handle data at different stages.

- **Open Enterprise Data Platform**: Integrating multiple tools like dbt, Airflow, and Superset on Postgres demonstrates your ability to create comprehensive data solutions that can scale with enterprise needs.

- **Cloud Cost Analyzer**: This project addresses a common business need—tracking and optimizing cloud costs. Its relevance to financial management makes it a standout project.

- **Spark/PySpark/Delta Lake Workflows**: These workflows are critical for large-scale data processing and analytics, showcasing your ability to manage and analyze big data.

## Recommended Actions

1. **Select and Customize Projects**:
   - **What to do**: Fork and customize 2-3 projects from the list, such as the Airbyte Monitoring and Dagster real estate pipeline.
   - **Why**: Customization with your data sources demonstrates your ability to adapt and personalize solutions.
   - **Expected Outcome**: A personalized portfolio that reflects your technical skills and problem-solving abilities.
   - **First Step**: Fork the repositories and start by int

*... truncated (4734 chars total)*

## Phase 4: Deliverable

- **Status**: done
- **Subtasks**: 2/2 completed
- **Download MD**: /api/intake/task/t_mmrykc2g6zk9/export?fmt=md
- **Download JSON**: /api/intake/task/t_mmrykc2g6zk9/export?fmt=json
