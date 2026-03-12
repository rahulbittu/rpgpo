#!/bin/bash
set -euo pipefail

ROOT="/Users/rpgpo/Projects/RPGPO"
TODAY="$(date +%F)"
NOW="$(date '+%F %H:%M:%S')"

echo "=== RPGPO MORNING LOOP ==="
echo "Date: $TODAY"
echo "Time: $NOW"
echo

"$ROOT/03-Operations/update_rpgpo_state.sh"

echo "[1/5] Refreshing dashboard state..."
cat > "$ROOT/04-Dashboard/state/dashboard-state.json" <<EOT
{
  "system_name": "RPGPO",
  "primary_inbox": "toprankerapp@gmail.com",
  "workspace_root": "/Users/rpgpo/Projects/RPGPO",
  "top_priorities": [
    "Advance TopRanker as flagship mission",
    "Review mission status files",
    "Decide today's highest-leverage move"
  ],
  "missions": [
    {
      "name": "TopRanker",
      "status": "active",
      "focus": "product + growth + imported domain knowledge",
      "next": "import TopRanker docs and synthesize operating summary"
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
    "Example-TopRanker-Growth-Experiment.md"
  ],
  "recent_wins": [
    "RPGPO repo is live",
    "Dashboard is wired to JSON",
    "Morning loop executed successfully"
  ],
  "research_queue": [
    "TopRanker-Growth",
    "Career-Target-Roles",
    "Founder2Founder-First-Offer"
  ]
}
EOT

echo "[2/5] Logging run..."
cat > "$ROOT/03-Operations/Logs/AgentRuns/$TODAY-Morning-Loop.md" <<EOT
# Agent Run Log

## Timestamp
$NOW

## Agent
Chief of Staff

## Domain
RPGPO Core

## Task
Run morning loop and refresh visible operating state.

## Inputs Used
- dashboard state template
- operations folders
- current date/time

## Sources Used
- local files only

## Risk Level
Green

## Result
Success

## Summary
Morning loop completed. Dashboard state refreshed. Daily files are in place.

## Follow-up Needed
Yes

## Notes
Next human step: review TopRanker, Career Engine, and Founder2Founder priorities.
EOT

echo "[3/5] Opening dashboard..."
open "$ROOT/04-Dashboard/app/index.html"

echo "[4/5] Showing mission files..."
ls -1 "$ROOT/03-Operations/MissionStatus"

echo "[5/5] Done."
echo "RPGPO is live for today's session."
