# Part 58: Engine Catalog + Output Contracts + Mission Acceptance Suite

## Problem
Tasks could complete internally without surfacing a visible deliverable. The Newsroom example: "get top 10 news in Hyderabad India" ran subtasks but failed to show the ranked result in the UI. This is unacceptable.

## Solution

### 15 Core Engines
Newsroom, Shopping, Startup, Legal, Screenwriting, Music, Calendar, Chief of Staff, Career, Health, Finance, Travel, Research, Home, Communications — each with icon, capabilities, default output type, and approval model.

### Output Contracts
Each engine has required visible output fields:
- Newsroom: ranked_items, summaries, source_links
- Shopping: ranked_products, price_vendor, pros_cons (approval required)
- Startup: implementation_plan, changed_files, diff_preview (approval required)
- etc.

### Deliverable-First Closure
Tasks must resolve to one of: `final_deliverable_visible`, `awaiting_operator_approval`, `blocked_with_remediation`, `action_executed_with_proof`, `failed_with_reason`. "All subtasks completed" is not a valid closure if no deliverable is visible.

### Mission Acceptance Suite
150 seeded scenarios (10 per engine) covering real-world requests with expected deliverables, approval gates, and failure conditions.

### Newsroom Fix
For "get top 10 Hyderabad news": the system must show ranked news directly in the task UI via Part 57's Final Result block, with source links and summaries. If compile/store fails, the best available synthesized answer from prior subtasks is surfaced with a remediation note.

## Results
- 15 engines with full output contracts
- 150 acceptance cases seeded
- 30/30 deliverables visible in existing tasks
- Intake selector updated to 15 engines with contract hints
