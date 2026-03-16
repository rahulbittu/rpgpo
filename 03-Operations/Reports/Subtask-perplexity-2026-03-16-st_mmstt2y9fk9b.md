# Subtask Output — Research Obsidian Knowledge Management Best Practices
## Model: sonar
## Stage: audit
## Date: 2026-03-16

## Vault Structure
Obsidian vaults are folders of Markdown files, with best practices emphasizing simple, numbered hierarchies over complex folders to separate contexts like personal and work while sharing infrastructure.[1][4]

- **Dual-context single vault**: Use one vault with workspaces for personal (PARA method: Projects, Areas, Resources, Archives) and work (OKRs + deliverables). Structure: `00-system/` (templates, preferences), `01-shared-space/` (insights, books, reads, resources), `10-personal/`, `20-work/`. Prefix folders numerically (e.g., `10.01-projects`) for sorting.[1]
- **CEO's approach**: Avoid deep folders; rely on links and searches instead of rigid hierarchy.[4]
- **Hybrid organization**: Combine folders/tags for navigation, avoiding unsorted notes.[6]
- **Project-specific**: For writing, use `ProjectName/Scenes/`, `Codex/` (characters/locations), `Exports/` via plugins like StoryLine.[5]

**Next step**: Create a new vault, add folders `00-system`, `01-shared-space`, `10-personal`, `20-work`; test with Obsidian's workspace feature (Settings > Workspaces).[1]

## Essential Plugins
Search results highlight plugins for structure and AI integration, but no exhaustive "essential" list from recent sources; focus on these for PKM:

- **StoryLine**: For writers; auto-creates project folders (`Codex/`, `Scenes/`), supports YAML frontmatter, custom categories (e.g., factions).[5] Install: Download from forum, copy to `.obsidian/plugins/`, reload in Settings.[5]
- **Claude Code integration**: AI plugin to auto-populate vaults, create index.md files per folder, run `/vault-review` for updates/links.[2][3]

**Next step**: Install StoryLine from Obsidian forum (search "StoryLine plugin"); test Claude Code by opening in vault and prompting "Create index.md for each folder".[2][5]

## Daily Notes Templates
Use YAML frontmatter in every note for metadata (e.g., required fields like tags, dates); store templates in `00-system/`.[1]

- **Structure**: Every note starts with YAML block; clone from `00-system/templates/` for consistency across note types.[1]
- **AI-assisted**: Prompt Claude Code for "vault review" to suggest template updates based on sessions.[2]

**Next step**: In `00-system/templates/`, create `Daily-Note.md` with YAML: `--- date: {{date}} tags: [daily] --- # {{date}} ## Tasks ...`; set as default in Settings > Daily Notes.[1]

## Zettelkasten Method
No direct recent results on Zettelkasten in Obsidian (tried queries: "Obsidian Zettelkasten best practices 2026", "Obsidian PKM Zettelkasten vault 2025-2026"); core idea aligns with linking notes for relationships, not folders.[3]

- **Implementation**: Obsidian vaults enable inter-note links (e.g., [[Note]]), visualizing connections as graphs; build atomic notes in `01-shared-space/insights/`.[1][3]
- **AI enhancement**: Claude Code traces relationships across vault, builds vocabulary maps from linked files.[3]

**Next step**: Create 5 atomic notes in `01.01-insights/` (e.g., single idea per note), link via `[[Related Insight]]`; view graph (Graph View panel).[3] Source: [no recent URL; from general Obsidian docs, last checked 2026].

## Anki Integration
No current (2025-2026) results found for Obsidian-Anki best practices (queries: "Obsidian Anki integration 2026", "Obsidian flashcards Anki PKM"); older plugins like Obsidian_AnkiSync exist but unmentioned here.

**Next step**: Search Obsidian plugin directory for "Anki"; if using, install Spaced Repetition plugin as alternative for in-app flashcards. Source: [no URL available; plugin directory obsidian.md/plugins].

## Publishing Workflows
Limited details; focus on exports from structured vaults.

- **Exports folder**: Use `Exports/` for compiled Markdown/PDF via plugins like StoryLine; share via Obsidian Publish (paid) or GitHub sync.[5]
- **AI vault management**: Maintain vault as "source of truth" for delegation; update notes, not agents.[3]

**Next step**: Enable Obsidian Publish (Settings > Community Plugins > search "Publish"); test exporting `01-shared-space/` folder. Source: https://obsidian.md/publish (general, verified 2026).
