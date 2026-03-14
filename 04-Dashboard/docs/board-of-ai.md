# Board of AI — Multi-Agent Deliberation

## Overview

The Board of AI is GPO's multi-agent deliberation system. When a task is submitted, up to 4 AI agents collaborate through governed, privacy-scoped discussion to produce a plan.

## Agents

| Agent | Provider | Role | Privacy Scope |
|-------|----------|------|---------------|
| Chief of Staff | OpenAI | Interprets objective, synthesizes decision | Task-scoped, sees context, redacted |
| Strategist | Gemini | Challenges assumptions, proposes strategy | Task-scoped, no profile, redacted |
| Research Analyst | Perplexity | Verifies facts, provides fresh intel | Task-scoped, no context, redacted |
| Builder | Claude | Executes code when relevant | Instance-scoped, full file access, requires approval |

## Deliberation Phases

1. **Interpret** — Chief of Staff reads the task, context, and produces an interpretation
2. **Research** — Perplexity verifies assumptions and adds current intelligence
3. **Critique** — Gemini challenges the interpretation and proposes alternatives
4. **Synthesize** — Chief of Staff combines all inputs into a final recommendation

## Privacy Controls

Each agent has:
- **Execution boundary**: what it can read/write/execute
- **Privacy scope**: what context it can see (instance/mission/task)
- **Redaction**: whether content is redacted before sending
- **Provider allowlist**: must be in instance's allowed providers
- **Mission isolation**: respects mission-level data boundaries

## Output

A `BoardExchange` containing:
- All phases with individual agent voices
- Synthesized recommendation
- Risk level (green/yellow/red)
- Total cost and token usage
- Duration and participating agents

## Governance

- No agent can auto-execute without approval
- Builder (Claude) always requires approval for code changes
- The board's recommendation is presented to the operator for approval
- Budget limits are checked before calling each agent
