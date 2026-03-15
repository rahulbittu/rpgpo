Generate the next GPO/RPGPO architecture implementation prompt.

Important:
- Return a prompt only, not a design answer.
- Output exactly one paste-ready prompt.

Current baseline:
- Parts 19-78 being implemented. 130+ TS modules, ~905 API routes, ~610+ types, 218+ tests.
- Part 75: Persistent learning store
- Part 76: Conversational task refinement + task chaining
- Part 77: Smart templates + recurring task scheduler
- Part 78 (in progress): Multi-engine orchestration

Gap:
GPO needs a proper data export and backup system. All state is in JSON files with no backup, no versioning, no export/import capability beyond individual modules. If the state directory is lost, all learning, context, tasks, and deliverables are gone. The system also needs a way to snapshot the entire state for recovery, and export operator data for portability.

Requested part:
Part 79: State Management + Backup + Export/Import — Build a comprehensive state management layer with atomic snapshots, incremental backups, full export/import, state integrity verification, and recovery tools.

Output format:
Return exactly one code block containing the full prompt. No intro, no explanation, no notes.
