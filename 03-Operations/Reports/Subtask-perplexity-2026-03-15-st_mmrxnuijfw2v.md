# Subtask Output — Research Multi-Agent AI Systems
## Model: sonar
## Stage: audit
## Date: 2026-03-15

## Finding 1: Multi-Model Orchestration with Clarifai for Claude, GPT-5.2, Gemini 3.1 Pro
Clarifai platform routes requests across **Gemini 3.1 Pro** (1M context for summarization), **GPT-5.2** (thinking mode for equation reasoning), and Claude models, reducing subscription clutter and enabling cost-controlled multi-agent pipelines. Example: User uploads 300-page PDF; Gemini extracts outline, GPT-5.2 solves math problems, human reviews outputs—reported to cut process time while respecting privacy. Architecture decision: Use decision tree for task scoring (e.g., agentic benchmarks: Gemini APEX-Agents 33.5%, MCP Atlas 69.2%); GPT-5.2 collapses multi-agents into "mega-agent" calling 20+ tools. Lesson: No single model fits all—multi-model orchestration best; tune reasoning tokens in GPT-5.2 for cost/quality.  
**Source:** https://www.clarifai.com/blog/minimax-m2.5-vs-gpt-5.2-vs-claude-opus-4.6-vs-gemini-3.1-pro[1]

## Finding 2: Anthropic's Claude Code for Multi-Agent Coding Teams
**Claude Code** (preview with Opus 4.6/Sonnet 4.6, released alongside Opus 4.6) enables multiple Claude instances to collaborate in parallel on coding tasks, exchanging info for agentic workflows. Strengths: 1M-token context (Opus 4.6), constitutional safety reduces hallucinations; excels in judgment/code over multi-modal. Architecture: Massive context for entire codebases/regulatory docs; integrate via Slack bots. Lesson: Claude assembles safe agent teams; pair with MCP protocol (Anthropic Nov 2024 release, OpenAI adopted Mar 2025).  
**Source:** https://intuitionlabs.ai/articles/claude-vs-chatgpt-vs-copilot-vs-gemini-enterprise-comparison[2]

## Finding 3: Perplexity's Computer Agent with 19 Backend Models
**Perplexity Computer** (Max tier, newest 2026 agent) decomposes high-level objectives into subtasks, delegates to optimal model among 19 backends (including Claude, OpenAI, Gemini variants) for multi-agent coordination. Architecture: Multi-model backend optimizes reasoning/speed/cost; **Deep Research** agent pulls multi-source data with citations. Lesson: Single interface hides orchestration; better for info discovery than deep reasoning—use Emergent platform to combine Perplexity with Claude/GPT/Gemini in unified workflows, avoiding single-tool limits. Implementation: Intelligent model selection per task (e.g., Claude for step-by-step analysis).  
**Source:** https://emergent.sh/learn/perplexity-vs-claude[3]  
**Source:** https://felloai.com/best-ai-agents/[4]

## Finding 4: MCP Protocol as Universal Multi-Agent Standard Across Providers
**Model Context Protocol (MCP)** (Anthropic Nov 2024; OpenAI Mar 2025; Google Apr 2025; Linux Foundation Dec 2025) standardizes agent-to-tool/business system connections—97M monthly SDK downloads, 5,800+ servers by 2026. Architecture: Multi-agent teams (e.g., lead qualification → technical assessment → proposal gen → contract proc); humans approve decisions, cutting cycle times 70-80%. Supports Claude, OpenAI, Gemini agents. Lesson: Start simple, add complexity only if outcomes improve; design tools like prompts. Guides from Anthropic/Google emphasize human-in-loop.  
**Source:** https://codingscape.com/blog/build-production-ready-ai-agents-in-2026-without-deleting-your-database[5]

## Finding 5: Google Vertex AI Agent Builder for Gemini-Centric Systems
**Vertex AI Agent Builder** integrates **Gemini 3.1 Pro/Flash** (1M tokens) with RAG/search for custom agents; ties to Google Workspace for emails/docs/spreadsheets. Architecture: Reactive agents within ecosystem; less autonomous than Claude/ChatGPT. Implementation: Fine-tune on private data; pair with MCP for multi-provider. Lesson: Ideal for Google users/long docs; limitations outside ecosystem—use for 1,500-page analysis at competitive pricing.  
**Source:** https://felloai.com/best-ai-agents/[4]  
**Source:** https://intuitionlabs.ai/articles/claude-vs-chatgpt-vs-copilot-vs-gemini-enterprise-comparison[2]

**Next Steps:**  
- Test Clarifai free tier: Upload sample PDF, route Gemini→GPT-5.2 pipeline (setup <10min per [1]).  
- Install MCP SDK (97M downloads): Integrate Claude Code agents via Anthropic API (guide: codingscape.com[5]).  
- Prototype Perplexity Computer Max ($20/mo): Delegate coding task across 19 models (felloai.com[4]).  
- No direct Perplexity API for external multi-agent builds found; use via Emergent for orchestration (emergent.sh[3]).
