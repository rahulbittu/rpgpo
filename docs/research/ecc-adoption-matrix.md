# ECC Selective Adoption Matrix for GPO

## Source

[Everything-Claude-Code](https://github.com/affaan-m/everything-claude-code) v1.8.0 — a comprehensive Claude Code configuration repository with hooks, commands, skills, agents, and eval harnesses.

## Evaluation Criteria

Each ECC pattern was evaluated against:
1. Does it solve a real GPO problem?
2. Does it preserve GPO's product identity (governed, privacy-first, operator-centered)?
3. Can it run on the current MacBook Pro without heavy infra?
4. Does it add maintenance burden disproportionate to value?
5. Does it risk feature sprawl or identity dilution?

## Adoption Decisions

### ADOPT NOW (2 patterns)

| Pattern | ECC Source | GPO Implementation | Priority |
|---|---|---|---|
| **Session lifecycle persistence** | `session-start.js`, `pre-compact.js`, `session-end.js` | Save/restore behavior context + active signals + routing stats on server start/stop | P1 |
| **Verification eval metrics** | `eval-harness/`, `commands/eval.md` | Track first-pass clean rate as running metric, add lightweight output quality scoring | P2 |

### EMULATE CONCEPTUALLY (3 patterns)

| Pattern | ECC Source | GPO-Native Approach | Priority |
|---|---|---|---|
| **Pattern extraction** | `evaluate-session.js`, `continuous-learning/` | Periodic batch analysis of completed tasks → workflow pattern signals (GPO already has structured events, not transcripts) | P2 |
| **Pre-execution safety checks** | `insaits-security-monitor.py` | Lightweight prompt validator in worker.js: check for credentials, excessive cost, anomalous patterns. No Python dependency. | P3 |
| **Structured instinct representation** | `instinct-*.md`, `learn.md` | Add `reinforced_count` and `last_contradicted` to BehaviorSignal. Keep JSON, don't adopt markdown format. | P3 |

### ADOPT LATER (2 patterns)

| Pattern | ECC Source | Why Later | Priority |
|---|---|---|---|
| **Formal hook registry** | `hooks.json`, 27 hook scripts | GPO's event system works. Formal hook registry adds complexity without immediate operator value. | P4 |
| **CI artifact validation** | `scripts/ci/validate-*.js` | Useful for artifact quality but not urgent. GPO's artifacts are currently manually reviewed. | P4 |

### AVOID (5 patterns)

| Pattern | ECC Source | Why Avoid |
|---|---|---|
| **Command sprawl** | 52+ slash commands | GPO uses natural language task submission, not slash commands. Would degrade product coherence. |
| **Multi-agent orchestration** | `multi-*.md`, 22 subagents | GPO's governed sequential pipeline is simpler and more reliable. Reliability beats autonomy theater. |
| **MCP server configs** | 14+ MCP configs | GPO has its own provider chain. MCP is for IDE integration, not GPO's runtime. |
| **Language-specific rules** | 7 language packs | GPO is a task platform, not a coding IDE. Irrelevant to 15-engine model. |
| **Cost tracking hooks** | `cost-tracker.js` | GPO already has costs.json. No additional adoption needed. |

## Key Insight

ECC is a developer harness toolkit. GPO is an operator product. The overlap is in **infrastructure patterns** (persistence, eval, safety), not in **workflow patterns** (commands, agents, language rules).

GPO should borrow ECC's discipline around session lifecycle and verification — not its identity as a code-assistant toolbox.

## Artifacts

- `artifacts/research/ecc-adoption-matrix.json` — Machine-readable matrix
- `artifacts/research/ecc-priority-backlog.json` — Implementation backlog
