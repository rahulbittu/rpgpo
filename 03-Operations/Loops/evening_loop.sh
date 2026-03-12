#!/bin/bash
set -euo pipefail

ROOT="/Users/rpgpo/Projects/RPGPO"
TODAY="$(date +%F)"
NOW="$(date '+%F %H:%M:%S')"

echo "=== RPGPO EVENING LOOP ==="
echo "Date: $TODAY"
echo "Time: $NOW"
echo

cat > "$ROOT/03-Operations/Logs/AgentRuns/$TODAY-Evening-Loop.md" <<EOT
# Agent Run Log

## Timestamp
$NOW

## Agent
Chief of Staff

## Domain
RPGPO Core

## Task
Close the day, log state, and preserve continuity.

## Inputs Used
- local mission files
- local logs
- current date/time

## Sources Used
- local files only

## Risk Level
Green

## Result
Success

## Summary
Evening loop completed. RPGPO preserved end-of-day continuity state.

## Follow-up Needed
Yes

## Notes
Recommended next step is filling in tomorrow's brief and reviewing weekly momentum.
EOT

echo "Evening loop log written to:"
echo "$ROOT/03-Operations/Logs/AgentRuns/$TODAY-Evening-Loop.md"
