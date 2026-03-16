# Subtask Output — Research Best Practices for dbt Data Pipelines
## Model: sonar
## Stage: report
## Date: 2026-03-16

## Project Structure
dbt projects enforce a top-level structure including `dbt_project.yml`, `models/`, and `snapshots/` directories, with flexible organization inside to suit workflows like command selection, navigation, and model configuration[6]. Use consistent folder structures reflecting data flow: `staging/` (source-system subdirs like `stripe/`, `snowplow/`), `intermediate/` (business-group subdirs), and `marts/` (avoid subdirs until >10 models)[2][5]. For large-scale, split into multiple projects via dbt Mesh: map teams to projects (e.g., hub for foundations, spokes for marketing/finance), using separate Git repos with public models for dependencies[1][3][4].

- **Example split**: Core repo for raw standardization (public access on stable models), consumer repos (e.g., finance) depending on core; run producers first to avoid cycles[1][4].
- **Next step**: Diagram your teams' data flows, declare existing project as hub, create spoke repos; test with `dbt deps`[1].

## Model Layering Strategy
Layer models as staging (atomic source prep), intermediate (business transformations), marts (consumer-ready): staging by source systems (e.g., `staging.stripe+` selector), intermediate by business areas (e.g., `intermediate/marketing/`), marts simplified (4-6 entities per model, no early subdirs)[2][5]. Split for modularity: horizontal (team pace/data sources) or vertical (foundations upstream); combine in Mesh for governance[1][3].

| Layer | Folder Strategy | Example Selector | Rationale |
|-------|-----------------|------------------|-----------|
| Staging | Source subdirs (e.g., `stripe/`, `internal_db/`) | `dbt build --select staging.stripe+` | Single source of truth, easy ops on similar loads[2] |
| Intermediate | Business subdirs | `intermediate.finance.orders_summary` | Structural simplification (e.g., 2 joins vs. 10)[5] |
| Marts | Flat until scale | N/A | UX for warehouse schemas/views[5] |

- **Next step**: Refactor staging to source subdirs; validate with `dbt ls --select staging`[2].

## Testing Frameworks
dbt docs emphasize built-in tests (e.g., schema, uniqueness) via `schema.yml`; apply at directory level for bulk config[3][6]. No specific 2026 frameworks detailed; integrate generic tests in staging/intermediate for atomic validation.

- **Next step**: Add `tests: { +schema, +unique }` to staging YAML; run `dbt test`[3].

## Documentation Generation
Folder structure and DAG encode the knowledge graph; generate docs with `dbt docs generate` for Studio/docs site navigation[2][5][6]. Document deviations from conventions (e.g., custom splits) in team README; expose only stable public models in Mesh[1][4].

- **Next step**: Run `dbt docs generate && dbt docs serve`; review in IDE[6].

## CI/CD Integration
Use separate Git repos per project for lifecycle ownership/code review; configure producers with `access: public` on shared models[4]. dbt Cloud or GitHub Actions for stepwise deploys (producers before consumers); selectors enable partial builds (e.g., `--select staging.stripe+`)[1][2].

- **Example workflow**: Producer repo → public models → consumer `dbt deps && dbt build`[1][4].
- **Next step**: Set up GitHub repo per domain, add `dbt_project.yml` with `dependencies: [core-repo]`, trigger CI on PRs[4].
