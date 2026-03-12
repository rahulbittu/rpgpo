#!/bin/bash
set -euo pipefail

ROOT="/Users/rpgpo/Projects/RPGPO"
REPORT="$ROOT/03-Operations/Reports/TopRanker-Operating-Summary.md"
MISSION="$ROOT/03-Operations/MissionStatus/TopRanker.md"
APPROVAL="$ROOT/03-Operations/Approvals/Pending/TopRanker-Weekly-Execution-Target.md"
BRIEF="$ROOT/03-Operations/DailyBriefs/$(date +%F)-DailyBrief.md"
STATE="$ROOT/04-Dashboard/state/dashboard-state.json"
LOG="$ROOT/03-Operations/Logs/AgentRuns/$(date +%F)-Promote-TopRanker-Summary.md"
NOW="$(date '+%F %H:%M:%S')"

if [ ! -f "$REPORT" ]; then
  echo "Missing report: $REPORT"
  exit 1
fi

cat > "$MISSION" <<EOT
# Mission Status

## Mission
TopRanker

## Current Objective
Convert TopRanker's existing product depth and infrastructure into focused weekly execution, tracked visibly inside RPGPO.

## Current Status
Active

## Key Metrics
- weekly execution target defined
- growth experiment running
- technical health snapshot completed
- product momentum visible inside RPGPO

## Recent Progress
- Claude inspected TopRanker and produced an operating summary
- TopRanker confirmed as a production-grade flagship mission
- RPGPO now has a real decision-quality view of TopRanker

## Blockers
- no active weekly execution target tracked inside RPGPO
- no RPGPO-tracked growth experiment currently running
- no fresh technical health snapshot committed into RPGPO

## Risks
- massive capability without focused weekly motion
- infrastructure depth masking current execution bottlenecks
- growth constraints in live/beta city expansion not being tracked tightly enough

## Next Recommended Actions
1. define one explicit weekly execution target
2. choose and launch the first TopRanker growth experiment
3. produce a technical health snapshot and deployment-readiness summary

## Owner / Domain
Product and Startup Domain
EOT

cat > "$APPROVAL" <<EOT
# RPGPO Approval Packet

## Proposed Action
Adopt "Define the Weekly Execution Target" as the immediate TopRanker priority for this week.

## Domain
TopRanker

## Why This Action Is Recommended
Claude's operating summary found that TopRanker has massive depth and documentation but lacks an explicit weekly target inside RPGPO. A weekly target is the fastest way to convert capability into motion.

## Evidence Summary
- TopRanker is production-grade and deeply documented
- no active sprint or weekly target is being tracked inside RPGPO
- growth and technical actions are both available, but need sequencing

## Expected Upside
- clearer execution focus
- better coordination between RPGPO and TopRanker
- easier prioritization of growth vs technical work
- reduced drift

## Possible Downside
- choosing the wrong weekly target may waste a few days
- over-focusing on structure instead of shipping if target is vague

## Risk Level
Yellow

## Draft / Artifact / Screenshot
See: 03-Operations/Reports/TopRanker-Operating-Summary.md

## Rollback / Fallback
Revise the weekly target within 24 hours if it proves low leverage.

## Approval Requested
Approve / Reject / Revise
EOT

if [ -f "$BRIEF" ]; then
  cat >> "$BRIEF" <<EOT

## TopRanker Update
Claude completed the first real TopRanker operating review.
TopRanker is confirmed as a large, production-grade flagship mission with deep internal documentation and significant infrastructure.
The most important immediate move is to define and track one weekly execution target inside RPGPO.
EOT
fi

cat > "$STATE" <<EOT
{
  "system_name": "RPGPO",
  "primary_inbox": "toprankerapp@gmail.com",
  "workspace_root": "/Users/rpgpo/Projects/RPGPO",
  "top_priorities": [
    "Approve the first TopRanker weekly execution target",
    "Launch the first TopRanker growth experiment",
    "Generate a TopRanker technical health snapshot"
  ],
  "missions": [
    {
      "name": "TopRanker",
      "status": "active",
      "focus": "weekly execution target + growth + technical health",
      "next": "approve the immediate weekly target"
    },
    {
      "name": "Career Engine",
      "status": "needs decision",
      "focus": "target role profile",
      "next": "define filters and shortlist"
    },
    {
      "name": "Founder2Founder",
      "status": "active",
      "focus": "first monetizable offer",
      "next": "choose first offer and sample output"
    },
    {
      "name": "Wealth Research",
      "status": "research-only",
      "focus": "tracked categories",
      "next": "define first watchlist"
    }
  ],
  "pending_approvals": [
    "TopRanker-Weekly-Execution-Target.md"
  ],
  "recent_wins": [
    "Claude produced the first TopRanker operating summary",
    "TopRanker confirmed as flagship mission with deep product maturity",
    "RPGPO promoted Claude's output into live mission state"
  ],
  "research_queue": [
    "TopRanker-Growth",
    "Career-Target-Roles",
    "Founder2Founder-First-Offer"
  ]
}
EOT

cat > "$LOG" <<EOT
# Agent Run Log

## Timestamp
$NOW

## Agent
Chief of Staff

## Domain
TopRanker

## Task
Promote Claude's TopRanker operating summary into live RPGPO mission state, approvals, and dashboard state.

## Inputs Used
- TopRanker-Operating-Summary.md
- existing mission files
- existing dashboard state

## Sources Used
- local files only

## Risk Level
Green

## Result
Success

## Summary
Claude's report was promoted into TopRanker mission status, dashboard priorities, and a pending approval packet for the weekly execution target.

## Follow-up Needed
Yes

## Notes
Next step is choosing the actual weekly execution target.
EOT

open "http://127.0.0.1:8765/04-Dashboard/app/index.html"
open "$MISSION"
open "$APPROVAL"

echo
echo "Phase 7 complete."
echo "Open these next:"
echo "  $MISSION"
echo "  $APPROVAL"
echo "Then decide the weekly execution target."
