#!/bin/bash
set -euo pipefail

ROOT="/Users/rpgpo/Projects/RPGPO"
TODAY="$(date +%F)"
NOW="$(date '+%F %H:%M:%S')"

mkdir -p "$ROOT/03-Operations/DailyBriefs"
mkdir -p "$ROOT/03-Operations/Logs/AgentRuns"
mkdir -p "$ROOT/04-Dashboard/state"

if [ ! -f "$ROOT/03-Operations/DailyBriefs/$TODAY-DailyBrief.md" ]; then
  cat > "$ROOT/03-Operations/DailyBriefs/$TODAY-DailyBrief.md" <<EOT
# RPGPO Daily Brief

## Date
$TODAY

## Executive Summary
Daily brief created automatically. Update with the most important priorities and decisions.

## Top Priorities
1. [Priority]
2. [Priority]
3. [Priority]

## Decisions Needed
- [Decision]

## Pending Approvals
- [Approval]

## Recommended Next Actions
- [Action]
EOT
fi

cat > "$ROOT/03-Operations/Logs/AgentRuns/$TODAY-State-Refresh.md" <<EOT
# Agent Run Log

## Timestamp
$NOW

## Agent
Chief of Staff

## Domain
RPGPO Core

## Task
Refresh daily operational state files.

## Inputs Used
- existing operations folders
- current system date
- local dashboard state

## Sources Used
- local files only

## Risk Level
Green

## Result
Success

## Summary
Refreshed RPGPO daily state scaffolding.

## Follow-up Needed
Yes

## Notes
Update the daily brief and dashboard state with actual mission progress.
EOT

echo "RPGPO state refreshed for $TODAY"
