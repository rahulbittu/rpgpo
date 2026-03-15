# GPO Product Positioning — Current Truth (2026-03-15)

## What GPO IS today
A privacy-first governed personal AI operating system that coordinates multiple AI providers to execute structured tasks through a governed lifecycle. File-backed, single-user, locally-run.

## What GPO IS NOT yet
- Not an autonomous agent that runs without operator involvement
- Not a real-time data platform (no live feeds, APIs, or scraping)
- Not a code deployment pipeline (has builder but no CI/CD)
- Not a multi-user platform (single-operator: Rahul)

## Primary User Value
Rahul uses GPO to:
1. Break complex requests into structured AI subtasks
2. Route subtasks to the best AI provider (OpenAI/Perplexity/Gemini)
3. Get structured reports and analysis back
4. Track costs, decisions, and context across sessions
5. Eventually: run semi-autonomously with governance guardrails

## Current Strongest Engines (by actual usability)
1. **Research/Synthesis** — Can call Perplexity for research + OpenAI for synthesis
2. **Planning/Chief of Staff** — Generates briefs, next-best-actions, prioritized work
3. **TopRanker (Flagship)** — Has repo, context, build adapter, contracts
4. **Newsroom** — News gathering via Perplexity + synthesis

## Biggest Value Gap
The pipeline works (intake → deliberate → execute → output) but outputs are often **generic templates** rather than **rich, actionable content** because:
- Operator context is thin (5 priorities, minimal domain depth)
- Worker subtasks don't deeply use context when calling providers
- No real-time data integration
- Reports sit on disk with no proactive delivery
