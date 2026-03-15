# Subtask Output — Research Data Engineering Portfolios
## Model: sonar
## Stage: research
## Date: 2026-03-15

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
- **Documentation quality**: README > code alone; recruiters check GitHub pre-interview[2].
- **Repo hygiene**: 3-5 projects, recent updates (sort GitHub by updated asc for active examples)[3].

No 2026-specific hiring surveys in results (focus post-2025-12-15); top repos emphasize open-source stacks like Dagster/Open Data Stack for remote DE roles.

**Next steps**:
1. Build 1 pipeline (e.g., Cloud Cost Analyzer) this week: ingest AWS costs via dlt, dbt models, Metabase dashboard; target 200+ stars potential via blog share.
2. Profile: github.com/rahul-[username]/data-eng-portfolio with pinned 3 repos.
3. Apply to 5 roles listing these tools (e.g., search "remote data engineer dagster" on LinkedIn).

No additional README templates found beyond workflow/docs emphasis[2]. Refine search: "data engineering github readme template 2026".
