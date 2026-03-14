# Task Experience Architecture

## Lifecycle Stages
1. `request` — task submitted
2. `deliberation` — board interpreting
3. `plan` — subtasks planned
4. `approvals` — waiting for operator
5. `execution` — subtasks running
6. `result` — completed with output

## Experience Tracking
Each task is assessed for:
- Has board interpretation?
- Has plan (subtasks)?
- Has final result?
- Result surfaced in UI?

## Shippable Surface Assessment
Every major tab assessed as shippable or not, with specific reasons.
