# ECC Patterns Rejected for GPO

## Permanently Rejected

### 1. Command Registry Sprawl (52+ slash commands)

**Why rejected:** GPO accepts natural language task requests routed through the Board of AI. Slash commands are a developer-harness interaction model — the operator types "Create a guide to Roth conversions," not `/finance --topic roth --depth deep`.

**GPO principle violated:** "Users want pain relief and dependable outcomes, not hype." Adding 52 commands would create a learning curve that contradicts GPO's simplicity.

**Status: Permanently rejected.** GPO's task submission model is fundamentally different from a CLI command registry.

---

### 2. Multi-Agent Orchestration (22 subagents, PM2 worktrees)

**Why rejected:** GPO's single governed pipeline (Board → subtasks → sequential execution) is simpler, more predictable, and more auditable than parallel agent swarms. ECC's multi-agent model is designed for developer coding workflows where multiple files are edited simultaneously. GPO's tasks are research/writing/analysis — sequential execution is correct.

**GPO principle violated:** "Reliability beats autonomy theater." and "Fewer stronger systems beat many noisy agents."

**Status: Permanently rejected.** GPO's sequential pipeline is a product feature, not a limitation.

---

### 3. Language-Specific Rules (7 language packs)

**Why rejected:** GPO is a task execution platform across 15 engines (finance, travel, health, writing, etc.). Language-specific coding rules (TypeScript, Python, Go) are relevant only for the Code & Product Engineering engine, which uses Claude CLI for code tasks. The other 14 engines have no use for lint rules.

**GPO principle violated:** "Only automate what is understood." Importing language rules for engines that don't write code would create dead configuration.

**Status: Permanently rejected.**

---

### 4. Full InsAIts Python Security Dependency

**Why rejected:** InsAIts requires `pip install insa-its` — a Python dependency in a Node.js system. GPO's lightweight regex-based prompt validation achieves the core safety goal (credential leak detection) without a cross-language dependency.

**GPO principle violated:** Minimal dependency footprint. Adding Python runtime requirements to a Node.js system increases maintenance burden and attack surface.

**Status: Permanently rejected.** The conceptual pattern was adopted as a native Node.js implementation.

---

## Deferred (May Reconsider Later)

### 5. MCP Server Configurations (14+ configs)

**Why deferred, not rejected:** MCP is Anthropic's Model Context Protocol for tool integration. GPO currently uses direct API calls (OpenAI, Perplexity, Gemini) through its own provider chain. If GPO ever needs to integrate with external tools (calendar, email, file storage), MCP could be the right protocol — but that's a future product decision, not a current need.

**GPO principle to watch:** "Do not create plugin marketplace behavior." MCP adoption would need to go through GPO's private curated tools registry with explicit risk classification.

**Status: Deferred.** Reconsider when GPO needs external tool integration beyond its current 3 providers.

---

### 6. Formal Hook Registry Architecture

**Why deferred, not rejected:** ECC's 18-event-type hook system with matchers, exit codes, and runtime profiles is elegant engineering. GPO already has event broadcasting (SSE) and behavior event capture that cover the core need. A formal hook registry would add structure but also complexity.

**GPO principle to watch:** "Predictability is a product feature." A hook registry that allows arbitrary script execution on events could introduce unpredictable behavior.

**Status: Deferred.** Reconsider if GPO's event system needs formalization for external integrations.

---

### 7. CI Artifact Validation Scripts

**Why deferred, not rejected:** ECC's 8 validation scripts (schema checks, personal path detection, frontmatter validation) are good CI hygiene. GPO doesn't have a CI pipeline yet — artifacts are manually reviewed. When GPO gets CI, these patterns should be considered.

**Status: Deferred.** Adopt when GPO has automated CI/CD.

---

### 8. Cost Tracking Hooks

**Why deferred, not rejected:** GPO already has `costs.json` with per-API-call cost tracking. ECC's cost tracker adds session-level aggregation. GPO's existing system is sufficient; session-level cost tracking could be added if operator requests cost-per-session reporting.

**Status: Deferred.** Low priority — existing tracking is adequate.
