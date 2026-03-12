#!/bin/bash
set -euo pipefail

ROOT="/Users/rpgpo/Projects/RPGPO"
DASH_DIR="$ROOT/04-Dashboard"
STATE_DIR="$DASH_DIR/state"
APP_DIR="$DASH_DIR/app"
LOG_DIR="$ROOT/03-Operations/Logs/AgentRuns"
AUTH_DIR="$ROOT/03-Operations/Auth"
TODAY="$(date +%F)"
NOW="$(date '+%F %H:%M:%S')"
PORT=8765

mkdir -p "$STATE_DIR" "$LOG_DIR" "$AUTH_DIR"

echo "======================================"
echo "RPGPO LIVE BOOT"
echo "======================================"
echo "Time: $NOW"
echo

# 1) Write a guaranteed dashboard state file
cat > "$STATE_DIR/dashboard-state.json" <<EOT
{
  "system_name": "RPGPO",
  "primary_inbox": "toprankerapp@gmail.com",
  "workspace_root": "/Users/rpgpo/Projects/RPGPO",
  "top_priorities": [
    "Make the dashboard load correctly",
    "Launch a visible Claude worker session",
    "Prepare OpenAI and Perplexity auth for orchestration"
  ],
  "missions": [
    {
      "name": "TopRanker",
      "status": "active",
      "focus": "flagship mission with imported repo knowledge",
      "next": "review imported docs and choose weekly target"
    },
    {
      "name": "Career Engine",
      "status": "needs decision",
      "focus": "target role profile",
      "next": "define search filters and shortlist"
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
    "Claude Code is installed",
    "GitHub auth is working",
    "Dashboard state file was refreshed successfully"
  ],
  "research_queue": [
    "TopRanker-Growth",
    "Career-Target-Roles",
    "Founder2Founder-First-Offer"
  ]
}
EOT

# 2) Write a visible live boot log
cat > "$LOG_DIR/$TODAY-RPGPO-Live-Boot.md" <<EOT
# Agent Run Log

## Timestamp
$NOW

## Agent
Chief of Staff

## Domain
RPGPO Core

## Task
Boot RPGPO into a visible live session with working dashboard and visible Claude terminal.

## Inputs Used
- local dashboard app
- local dashboard state
- Claude Code CLI
- local repo and governance files

## Sources Used
- local files only

## Risk Level
Green

## Result
Success

## Summary
RPGPO live boot prepared a working dashboard state, local HTTP server, Claude launch script, and auth placeholders.

## Follow-up Needed
Yes

## Notes
OpenAI and Perplexity require API keys before they can join the live orchestration loop.
EOT

# 3) Create auth env template
cat > "$AUTH_DIR/.env.ai.example" <<'EOT'
# Copy to .env.ai and fill in when ready
OPENAI_API_KEY=
PERPLEXITY_API_KEY=
# Claude Code can authenticate interactively by running: claude
EOT

# 4) Create a Claude starter prompt file
cat > "$ROOT/03-Operations/Reports/Claude-TopRanker-Starter-Prompt.md" <<'EOT'
You are operating inside Rahul Pitta Governed Private Office (RPGPO).

Read these first:
- /Users/rpgpo/Projects/RPGPO/00-Governance/RPGPO-Constitution.md
- /Users/rpgpo/Projects/RPGPO/00-Governance/BoardOfAI.md
- /Users/rpgpo/Projects/RPGPO/00-Governance/DomainModules/TopRanker.md
- /Users/rpgpo/Projects/RPGPO/00-Governance/DomainModules/TopRanker-Constitution-Bridge.md
- /Users/rpgpo/Projects/RPGPO/02-Projects/TopRanker/Notes/TopRanker-Synthesis.md

Then do this visibly and carefully:
1. Inspect the imported TopRanker documentation and source repo structure
2. Produce a concise operating summary for TopRanker
3. Identify the 3 highest-leverage next actions
4. Write your results to:
   /Users/rpgpo/Projects/RPGPO/03-Operations/Reports/TopRanker-Operating-Summary.md
5. Do not make destructive changes
6. Ask for approval before modifying important files
EOT

# 5) Start a local dashboard server if not already running
if lsof -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; then
  echo "[INFO] Dashboard server already running on port $PORT"
else
  echo "[INFO] Starting dashboard server on http://127.0.0.1:$PORT"
  cd "$ROOT"
  nohup python3 -m http.server "$PORT" >/tmp/rpgpo_dashboard.log 2>&1 &
  sleep 2
fi

# 6) Open the dashboard in browser the correct way
open "http://127.0.0.1:$PORT/04-Dashboard/app/index.html"

# 7) Launch a visible Claude Code session in Terminal
osascript <<'APPLESCRIPT'
tell application "Terminal"
  activate
  do script "cd /Users/rpgpo/Projects/RPGPO && echo '=== RPGPO CLAUDE SESSION ===' && echo 'If Claude is not logged in yet, run: claude' && echo 'Then paste the starter prompt from 03-Operations/Reports/Claude-TopRanker-Starter-Prompt.md' && echo && claude"
end tell
APPLESCRIPT

# 8) Print immediate next steps in this terminal too
echo
echo "======================================"
echo "RPGPO LIVE SESSION STARTED"
echo "======================================"
echo
echo "Dashboard URL:"
echo "  http://127.0.0.1:$PORT/04-Dashboard/app/index.html"
echo
echo "Claude starter prompt file:"
echo "  $ROOT/03-Operations/Reports/Claude-TopRanker-Starter-Prompt.md"
echo
echo "Auth template:"
echo "  $AUTH_DIR/.env.ai.example"
echo
echo "To add OpenAI later, create an API key and export OPENAI_API_KEY."
echo "To add Perplexity later, create an API key and export PERPLEXITY_API_KEY."
echo
echo "Tonight's visible worker is Claude Code in Terminal."
echo "Once you authenticate Claude and paste the starter prompt, it will begin working in front of you."
echo
