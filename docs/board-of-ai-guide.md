# Board of AI Guide

## What Is the Board?

The Board of AI is GPO's deliberation engine. Before any task is executed, the Board analyzes it from three perspectives to produce a plan.

## Three Perspectives

### 1. Chief of Staff
- Interprets the objective
- Assesses feasibility
- Identifies what needs operator decision

### 2. Critic
- Challenges assumptions
- Identifies risks and unknowns
- Spots failure modes

### 3. Domain Specialist
- Proposes the technical/strategic approach
- Selects the right providers for each subtask
- Defines the execution stages

## Output

The Board produces:
- **Interpreted Objective**: One clear sentence
- **Recommended Strategy**: 2-3 sentence approach
- **Risk Level**: green/yellow/red
- **Subtask Plan**: Ordered list with assigned providers

## Provider Selection Rules

- **Perplexity**: Always for web search / current information
- **OpenAI**: For synthesis, analysis, report compilation
- **Gemini**: For strategy, comparison, pros/cons analysis
- **Claude**: Only for code implementation tasks

## Context Injection

The Board receives:
- Operator profile (name, role, priorities, output preferences)
- Domain context (engine description, governed loop stages)
- Recent completed work in the same domain
- Knowledge from prior task enrichment

## Traceability

Every deliberation is stored in the task's `board_deliberation` field with:
- `interpreted_objective`
- `recommended_strategy`
- `risk_level`
- `subtasks` array with title, stage, model, prompt
- `key_unknowns`
- `approval_points`
