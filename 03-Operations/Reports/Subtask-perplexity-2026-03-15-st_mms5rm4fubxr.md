# Subtask Output — Research Best Practices for Second Brain in Obsidian
## Model: sonar
## Stage: audit
## Date: 2026-03-15

# Building a Second Brain with Obsidian: Current Best Practices (2026)

## Folder Structure & Organization

The most effective 2026 approach moves away from rigid hierarchical folders toward **flexible, multi-dimensional organization**. Here's what's working:

**ACE Framework (Top-Level Structure)**
The ACE system divides your vault into three "mental spaces" rather than forcing notes into single categories[4]. This solves the problem where a note about "remote work" belongs in multiple folders simultaneously — it can appear in both "team management" and "productivity" MOCs without duplication[4].

**Atomic Notes + Descriptive Naming**
Structure each note around **one concept per note** rather than lengthy documents[1]. Use descriptive file names that AI can parse for dates, topics, and types[1]. This precision retrieval matters when Claude Code accesses your vault — it finds exactly the relevant note instead of a 5000-word dump[1].

**Index Files for Navigation**
Create an `index.md` file in each main folder describing what's inside and listing key files[2]. This becomes your navigation layer and helps Claude Code understand folder purpose at a glance[2].

## Linking Strategies: MOCs Over Folders

**Maps of Content (MOCs) Replace Traditional Folders**
The critical 2026 insight: **a note can appear in multiple MOCs**, but only one folder[4]. For example, `[[Claude Code]]` lives in both an "AI MOC" and a "PKM MOC" because it's both an AI tool and knowledge management infrastructure[4].

This solves the Zettelkasten breakdown problem — when AI generates 5-10 notes daily, pure freeform linking creates chaos without higher-level structure[4]. MOCs provide that structure while maintaining flexibility[4].

**Explicit Linking with YAML Frontmatter**
Use rich metadata in YAML frontmatter at the top of each note[1]. AI plugins parse this metadata for precise retrieval[1]. This structured approach lets Claude Code navigate your project structure logically, find relevant meetings for specific projects, and pull research notes when generating plans[1].

## Daily Note Templates & Workflows

**Vault Review Workflow**
Run a `/vault-review` command on past sessions whenever needed — nothing gets lost and everything stays properly filed[2]. This prevents the "archive and forget" problem that killed PARA-based systems[4].

**Maintenance Protocol**
Every time you create or delete a file, update the `index.md` in that folder[2]. This keeps your navigation layer current without manual reorganization overhead[2].

**Setup Prompt for Claude Code**
Use this prompt to align your system with Claude's capabilities:

> "I want to use Obsidian to help you and me better manage our context. The Obsidian Vault is here [FOLDER LINK]. Ask me about my goals, tasks, preferences, etc. to get this right. Ask one question at a time. If my answers lead to more questions, ask those one at a time as well. Continue until we are fully aligned. Look up best practices and guides for Obsidian + Claude Code that fit our specific needs. Once everything is clear, propose a new folder structure and starter files for me to approve. Then execute, creating new files and moving existing ones as needed."[2]

This eliminates the maintenance problem entirely — Claude handles reorganization as your system evolves[2].

## AI Integration: The 2026 Game-Changer

**Local-First Architecture = AI Flexibility**
Your notes are plain Markdown files on your device, meaning[1]:
- Any AI can access them — no vendor lock-in
- Local models work natively (Ollama, LM Studio for fully private AI)
- MCP integration allows Claude Code and other agents to read/write directly
- Your data never leaves your machine unless you choose

**How It Works in Practice**
The Obsidian MCP Server exposes your vault's files via the Model Context Protocol[1]. Claude Code connects to this server and can read notes, search across your vault, create new notes, and modify existing ones[1]. Claude opens the same folder you work in and reads the same files in the same format — no API overhead, no format translation[5].

## Real-World Example: Knowledge Compounding

When using AI to generate 5-10 notes daily, the LYT (Linking Your Thinking) framework with MOCs prevents note chaos[4]. Instead of notes piling up in an archive folder after projects end, MOCs create persistent connection points. A note about "remote work" stays discoverable through multiple MOCs (team management, productivity, work-life balance) rather than buried in a project folder[4].

## Why This Matters for Your Workflow

**The Maintenance Problem is Solved**
Traditional second brain systems fail because setup overhead (templates, naming conventions, tag taxonomies, folder hierarchies) exceeds thinking time[5]. Claude Code eliminates this — it handles reorganization, index updates, and structural changes automatically[2][5].

**Graph View Mirrors How Your Brain Works**
Your brain thinks in associative connections, not hierarchical folders[5]. Graph View makes those connections visible — one note leads to three others, and new connections surface as you navigate[5]. When writing a newsletter or book, you open Graph View, navigate through concepts, and the ideas are already connected[5].

**No Vendor Lock-In**
Unlike Notion or other proprietary platforms, Obsidian's plain Markdown files mean you can switch AI providers (Claude, GPT, Gemini, local models) without data migration[1][5].

---

**Source:** https://www.nxcode.io/resources/news/obsidian-ai-second-brain-complete-guide-2026[1]
**Source:** https://www.whytryai.com/p/claude-code-obsidian[2]
**Source:** https://yu-wenhao.com/en/blog/lyt-framework-guide/[4]
**Source:** https://noahvnct.substack.com/p/stop-notion-heres-why-obsidian-is[5]
