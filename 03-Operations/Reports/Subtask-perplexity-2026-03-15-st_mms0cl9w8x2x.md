# Subtask Output — Research AI Coding Assistants in 2026
## Model: sonar
## Stage: research
## Date: 2026-03-15

## GitHub Copilot Overview (2026)
GitHub Copilot is an IDE extension priced at $10/mo, excelling in Microsoft/GitHub ecosystem integration with deep Git features and Copilot Workspace for multi-file edits. It supports GPT-4o models with 128K-1M token context, but lacks offline models and has good-but-not-best multi-file editing.[1][3][5]

- **Strengths**: Easiest MCP installation (button-click), accessible in multiple IDEs, GitHub web app integration for issue assignment via phone; recent support for Claude Code and Codex via GH subscription.[5]
- **Weaknesses**: Slower autocomplete than Cursor's Supermaven, less powerful agent mode than Claude Code, context limited to open files/immediate codebase.[4][6]
- **Market**: $2B+ estimated ARR; 9% developer love score, overtaken in usage by Claude Code.[1][7]
- **Source**: https://www.tldl.io/resources/ai-coding-tools-2026[1]; https://digidai.github.io/2026/03/14/cursor-vs-github-copilot-ai-coding-tools-deep-comparison/[3]

## Cursor Overview (2026)
Cursor is a VS Code fork IDE at $16/mo Pro, leading in UX for general dev work with excellent Composer multi-file editing, Supermaven autocomplete, and full project context up to 1M tokens using GPT-4o/Claude models. It supports offline via API, low learning curve.[1][2][4]

- **Strengths**: AI-first design preferred over Copilot for multi-file changes and speed; agent skills in .claude/skills for discoverability; enterprise features like SCIM, audit logs.[3][5]
- **Weaknesses**: Token limits lead some to switch; rules/skills migration ongoing but active (v2.4 changelog).[5]
- **Market**: $500M+ estimated ARR; 19% developer love score, #2 most-used after Claude Code.[1][7]
- **Source**: https://www.tldl.io/resources/ai-coding-tools-2026[1]; https://lushbinary.com/blog/ai-coding-agents-comparison-cursor-windsurf-claude-copilot-kiro-2026/[2]

## Claude Code Overview (2026)
Claude Code is a CLI agent at $17/mo Pro (up to $100-200/mo Max for Opus 4.6), dominating terminal workflows with native Git auto-commits, 1M token full-project context, and top reasoning for complex refactors/bugs. Anthropic-only models, no inline autocomplete.[1][2][4]

- **Strengths**: Most loved (46%) and most-used tool; agent teams for parallel sub-agents; handles architecture/unfamiliar codebases better than others.[4][6][7]
- **Weaknesses**: Terminal-only (no IDE), usage-based costs scale high; no multi-model choice.[4]
- **Market**: Part of Anthropic (N/A standalone ARR); overtakes Copilot/Cursor in usage 8 months post-release.[7]
- **Source**: https://www.tldl.io/resources/ai-coding-tools-2026[1]; https://newsletter.pragmaticengineer.com/p/ai-tooling-2026[7]

## Other Top AI Coding Tools (2026)
- **Windsurf**: Free for individuals ($100M+ ARR), VS Code fork with Cascade multi-file edits, multiple models, some offline support; best for budget devs.[1][2]
- **Antigravity (Google)**: Multi-agent with built-in browser, up to 1M tokens, Gemini/Claude/GPT support.[2]
- **Codex (OpenAI)**: Cloud sandbox agents, 1M tokens, OpenAI-only; strong multi-agent app.[2][5]
- **Kiro**: AWS models, MCP support, 1M tokens.[2]
- **Codegen**: #1 ranked agent by some, powered by ClickUp.[6]
- **OpenCode**: Cost-efficient with DeepSeek, high control/transparency.[4]

| Tool | Price | Context | Best For | ARR Est. |
|------|--------|---------|----------|-----------|
| GitHub Copilot | $10/mo | 128K-1M | GitHub teams | $2B+[1] |
| Cursor | $16/mo | 1M | General editing | $500M+[1] |
| Claude Code | $17/mo+ | 1M | Terminal/complex tasks | N/A[1] |
| Windsurf | Free | 1M | Budget | $100M+[1] |

**Next Steps**: Test Cursor Pro + Claude Code combo for complementary IDE/CLI (many devs do this).[1] For enterprise, audit GitHub governance maturity vs Cursor's AI-native controls.[3] Trial free Windsurf for solo projects.[1]
