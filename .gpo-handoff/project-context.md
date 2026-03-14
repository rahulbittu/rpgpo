# Project Context — GPO/RPGPO

**Last updated:** 2026-03-14
**Source of truth:** Repository at /Users/rpgpo/Projects/RPGPO

## What is GPO

GPO (Govern Private Office) is a privacy-first AI operating system. RPGPO is Rahul Pitta's configured instance. It is a multi-agent governed platform with Board of AI deliberation, Chief of Staff orchestration, engine-based task execution, and operator-facing dashboard.

## Repository Structure

```
00-Governance/    — Governance policies and rules
01-Inbox/         — Incoming work items
02-Projects/      — Project repos (TopRanker, etc.)
03-Operations/    — Reports, logs, decisions
04-Dashboard/     — Main application (server, UI, 62+ TS modules)
05-Comms/         — Communications
06-Learning/      — Learning materials
07-FinanceResearch/ — Finance research
08-Archive/       — Archive
```

## Dashboard Application (04-Dashboard/app/)

- **Server:** `server.js` (3242 lines, ~739 route matches, raw Node.js HTTP)
- **Types:** `lib/types.ts` (6141 lines, ~350+ typed interfaces)
- **Chief of Staff:** `lib/chief-of-staff.ts` (1693 lines, ~120 exported functions)
- **TS Modules:** 62 in `lib/` (Parts 19-58)
- **State:** 36 JSON files in `state/`
- **Docs:** 377 files (architecture, contracts, runbooks, ADRs)
- **UI:** `index.html`, `app.js`, `operator.js`, `style.css`, `operator.css`

## Implementation Status (Parts 19-58 Complete)

### Core Architecture (19-30)
Board of AI, Chief of Staff, execution graphs, approval gates, provider governance, autonomy budgets, enforcement engine, override ledger, cross-project isolation, cost/latency governance.

### Governance & Compliance (31-40)
Artifact registry, evidence chain, traceability, audit hub, compliance export, human approval workspace, release orchestration, multi-agent collaboration, security hardening, observability, SLO/SLA, skill packs, engine templates, marketplace, extensions.

### UX & Activation (41-49)
UI surface completion, workflow activation, runtime enforcement, operator UX polish, real telemetry, tenant isolation hardening, runtime capability activation, production readiness closure, ship blocker closure, middleware enforcement, operator workflow completion.

### Ship Readiness (50-56)
Go-live closure, readiness reconciliation, protected path validation, middleware truth, HTTP validation, final blocker reconciliation, final ship decision, network validation, reliability closure, clean-state verification, live server proof, go authorization, inline route guards, route protection expansion (22/25 guarded), mutation guards (10/10), deep redaction (field-level strip/mask).

### Product UX (57-58)
Product shell consolidation (14/18 shippable), final output surfacing (20/20 visible), task experience tracking, 15-engine catalog, output contracts, 150-scenario mission acceptance suite.

## Key Metrics

| Metric | Value |
|--------|-------|
| TS Modules | 62 |
| API Routes | ~739 |
| Types | ~350+ |
| Engines | 15 |
| Output Contracts | 15 |
| Acceptance Cases | 150 (seeded) |
| Workflows | 13/13 usable |
| Route Protection | 22/25 (100% guardable) |
| Mutation Guards | 10/10 |
| Middleware Truth | 100% |
| Output Surfacing | 20/20 (good) |
| Shell Shippable | 14/18 |
| Docs | 377 files |

## Architecture Patterns

- **CommonJS modules** with TypeScript (compiled via tsc)
- **Raw Node.js HTTP** server (no Express)
- **JSON file-based state** persistence in `state/`
- **Chief of Staff pattern:** central orchestration delegating to ~62 modules
- **Privacy-first:** tenant isolation, project isolation, data boundaries, secret governance
- **Multi-agent:** Claude (builder), OpenAI (reasoner), Gemini (critic), Perplexity (researcher)
- **Governance layers:** policies → budgets → escalation → enforcement → overrides → promotion control
- **Inline route guards:** `http-response-guard.ts` wired into server.js handlers
- **Deep redaction:** field-level strip/mask via `deep-redaction.ts`
