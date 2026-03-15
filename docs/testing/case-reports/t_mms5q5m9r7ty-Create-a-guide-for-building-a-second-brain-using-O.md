# Create a guide for building a second brain using Obsidian. Include folder struct

## Phase 1: User Context
- **Task ID**: `t_mms5q5m9r7ty`
- **Engine**: personalops
### Request
> Create a guide for building a second brain using Obsidian. Include folder structure, linking strategy, daily note template, and review workflow.

## Phase 2: Board Deliberation
**Objective**: Create a detailed guide for building a second brain using Obsidian.
**Strategy**: Research best practices for setting up a second brain in Obsidian, then synthesize this information into a structured guide. Include practical examples and templates for immediate use. Ensure the guide aligns with Rahul's productivity and personal development goals.

## Phase 3: Execution

### Step 1: Research Best Practices for Second Brain in Obsidian [perplexity]
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

> "I want to use Obsidian to help you and me better manage our context. The Obsidian Vault is here [FOLDER LINK]. Ask me about my goals, tasks, preferences, etc. to get this right. Ask one question at a time. If my answers lead to more questions, ask those one at a time as well. Continue until we are fully aligned. Look up best practices and guides for Obsidian

### Step 2: Synthesize Guide for Building a Second Brain [openai]
## Key Findings

1. **ACE Framework for Folder Structure**: Utilize the ACE (Areas, Categories, and Entries) framework to organize your Obsidian vault into three mental spaces, allowing for flexible, multi-dimensional organization without duplicating notes [4].

2. **Atomic Notes and Descriptive Naming**: Create notes centered around a single concept with descriptive file names. This aids in precise retrieval and enhances AI parsing capabilities [1].

3. **Maps of Content (MOCs) for Linking**: Replace traditional folder structures with Maps of Content (MOCs), allowing notes to appear in multiple contexts without duplication. This enhances navigability and contextual relevance [4].

4. **Index Files for Navigation**: Implement `index.md` files in each main folder to describe contents and list key files, facilitating easier navigation and understanding of folder purposes [2].

5. **Daily Note Template and Review Workflow**: Develop a structured daily note template and review workflow to maintain consistency and ensure regular updates and reflections.

## Detailed Analysis

### Folder Structure & Organization

- **ACE Framework**: 
  - **Areas**: Broad domains of life or work (e.g., Personal, Professional).
  - **Categories**: Specific topics within each area (e.g., Projects, Learning).
  - **Entries**: Individual notes or documents related to each category.

- **Atomic Notes**: 
  - Focus on creating concise notes, each dedicated to a single idea or concept.
  - Use clear, descriptive titles for easy retrieval and AI parsing.

### Linking Strategies

- **Maps of Content (MOCs)**:
  - Use MOCs to create thematic collections of notes.
  - Example: A note on "Remote Work" can be linked in both a "Team Management MOC" and a "Productivity MOC".

- **Index Files**:
  - Place an `index.md` in each folder to summarize contents and list important notes.
  - This serves as a quick reference guide and aids AI tools in understanding the folder's purpose.

### Daily Note Template & Review Workflow

- **Daily Note Template**:
  ```markdown
  # Daily Note - YYYY-MM-DD

  ## Morning Reflection
  - Thoughts:
  - Goals for the day:

  ## Tasks
  - [ ] Task 1
  - [ ] Task 2

  ## Notes
  - Key insights:
  - Meeting summaries:

  ## Evening Review
  - Achievements:
  - Lessons learned:
  ```

- **Review Workflow**:
  - **Weekly Review**: Summarize key insights from daily notes, update MOCs, and adjust goals.
  - **Monthly Review**: Reflect on progress in each ACE area, refine strategies, and set new objectives.

## Recommended Actions

1. **Implement the ACE Framework**:
   - **What to Do**: Organize your Obsidian vault using the ACE framework.
   - **Why**: Provides a flexible, multi-dimensional structure without duplicating notes.
   - **Expected Outcome**: Enhanced organization and retrieval efficiency.
   - **First Step**: Create top-level folders for Areas and start categorizing existing notes.

2. **Adopt Atomic Note-Taking**:
   - **What to Do**: Break down not

## Phase 4: Deliverable
- /api/intake/task/t_mms5q5m9r7ty/export?fmt=md
