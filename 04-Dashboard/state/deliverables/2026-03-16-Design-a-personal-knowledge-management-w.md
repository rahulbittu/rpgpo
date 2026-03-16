# Design a personal knowledge management workflow using Obsidian. Include daily no

**Domain:** personalops | **Date:** 2026-03-16 | **Subtasks:** 2



## Research Obsidian best practices
## Core Note Types and Strategies

Eric's PKM system in Obsidian uses **four core note types**: monthly bullet journals for daily logging, structured meeting notes, people dossiers, and project control towers, all interconnected via links for searchability and AI processing.[1] Yu-Wenhao's LYT (Linking Your Thinking) framework emphasizes **MOCs (Maps of Content)** as hubs to organize growing notes (5-10 per day with AI), replacing folder-based or pure Zettelkasten approaches; daily knowledge cards feed into MOCs via AI like Claude Code.[2]

- **Daily Notes**: Use monthly bullet journals to log activities; integrate with AI for sweeps that update from source material, reducing maintenance from 30-40% to <10% of time.[1] Ron Forbes automates daily briefs via OpenClaw AI: scans vault for active projects/goals, recent updates, and 3-5 priorities/deadlines, sent via Telegram at 7 AM.[5]
- **Project Notes**: Build "project control towers" as central linked hubs; AI agents handle maintenance and retrieval practice for context blocks.[1] LYT MOCs act as project overviews, with Claude Code filing notes/links automatically.[2]
- **Meeting Notes**: Structured templates link to people dossiers and projects; AI verifies/updates during sweeps, quoting originals.[1]
- **Book Notes**: Not directly detailed, but integrate into LYT knowledge cards/MOCs; Claude Code pulls from vault for research sessions, generating 5+ cards/day from articles/books vs. 1/week pre-AI.[2]

## Effective Linking Strategies

**LYT framework** structures links hierarchically: atomic notes link to MOCs, which map content without folders; AI builds/maintains links as notes grow past 100.[2] Obsidian's graph view connects ideas across notes (e.g., econ to psychology), supported by plugins like Dataview for dynamic queries (#final-exam tags).[4]

- Use **backlinks and embeds** for everything searchable; AI like Claude Code reads/writes Markdown to auto-file and connect.[2][3]
- **Vault maintenance**: Run /vault-review skill to scan notes, compare to sessions, propose updates/links before applying; update folder index.md on file changes.[3]
- Plugins enhance: Spaced Repetition for flashcards from notes, PDF++ for book highlight links, Canvas for visual maps.[4]

## AI Integration for Maintenance (2025-2026 Practices)

Pair Obsidian with **Claude Code** for local Markdown access: generates 5x notes/day, builds MOCs/links, reviews vaults.[2][3] OpenClaw automates heartbeats (every 4 hours: 11AM/3PM/7PM) for project progress checks, logging responses to daily notes.[5] Time Machine plugin provides advanced recovery beyond built-in File Recovery.[6]

**Next Steps**:
- Install LYT template pack from yu-wenhao.com (search "LYT Obsidian template").[2]
- Set up Claude Code vault access: prompt "Create /vault-review skill" per whytryai.com guide (Jan 2026).[3]
- Test Eric's sweep workflow: script AI to quote/update from sources, verify manually.[1]

**Sources**:
- [1] https://dspn.substack.com/p/how-i-built-a-personal-knowledge (Eric's Data Science Newsletter, 2025)
- [2] https://yu-wenhao.com/en/blog/lyt-framework-guide/ (Yu-Wenhao, 2025)
- [3] https://www.whytryai.com/p/claude-code-obsidian (Why Try AI, Jan 2026)
- [4] https://toolfinder.com/comparisons/notion-vs-obsidian-for-students (Tool Finder, 2026)
- [5] https://www.ronforbes.com/blog/openclaw-and-your-second-brain (Ron Forbes, 2025)
- [6] https://pkmjournal.com/never-lose-a-note-again-time-machine-plugin-for-obsidian-7ba6de48ae24 (PKM Journal, 2025)

## Synthesize Obsidian workflow
## Plan

### Objective
Utilize Obsidian for personal knowledge management by implementing structured note-taking strategies for daily notes, project notes, meeting notes, and book notes. Focus on effective linking strategies to enhance searchability and AI integration.

### Core Strategies
1. **Daily Notes**: Use monthly bullet journals to streamline daily logging and integrate AI for efficient updates.
2. **Project Notes**: Develop "project control towers" as central hubs for project management.
3. **Meeting Notes**: Employ structured templates that link meeting notes to relevant people and projects.
4. **Book Notes**: Incorporate book notes into MOCs using AI to automate and enhance the note-taking process.

## Implementation Steps

### 1. Daily Notes
- **Action**: Set up monthly bullet journals in Obsidian to log daily activities.
- **Why**: Reduces maintenance time and increases efficiency by integrating AI for updates.
- **Expected Outcome**: Decrease time spent on note maintenance from 30-40% to less than 10%.
- **First Step**: Create a template for monthly bullet journals and configure AI sweeps to update notes automatically.

### 2. Project Notes
- **Action**: Establish "project control towers" as the central nodes for each project.
- **Why**: Centralized project notes improve organization and retrieval practice.
- **Expected Outcome**: Enhanced ability to manage and retrieve project-related information efficiently.
- **First Step**: Design a standard template for project control towers and integrate with AI agents for maintenance.

### 3. Meeting Notes
- **Action**: Use structured templates for meeting notes that link to people dossiers and project notes.
- **Why**: Ensures all relevant information is interconnected and easily accessible.
- **Expected Outcome**: Improved meeting preparation and follow-up actions.
- **First Step**: Create a meeting note template and establish links to related dossiers and projects.

### 4. Book Notes
- **Action**: Integrate book notes into MOCs using AI to automate note-taking.
- **Why**: Increases the volume and quality of notes generated from reading materials.
- **Expected Outcome**: Generate over 5 knowledge cards per day from reading materials, compared to 1 per week without AI.
- **First Step**: Set up Claude Code to pull information from your vault and generate knowledge cards automatically.

## Tools/Resources

- **Obsidian**: For note-taking and linking strategies.
- **AI Tools**: Claude Code and OpenClaw AI for automating note updates and generating knowledge cards.
- **Templates**: Pre-designed templates for bullet journals, project control towers, and meeting notes.

## Review Schedule

- **Weekly Review**: Assess the effectiveness of the AI integration and adjust templates as needed.
- **Monthly Review**: Evaluate the organization and accessibility of notes, focusing on the efficiency of the linking strategies.
- **Quarterly Review**: Review overall productivity improvements and make strategic adjustments to the PKM system.

By following this detailed workflow, you can effectively manage your personal knowledge in Obsidian, leveraging AI to enhance productivity and organization.