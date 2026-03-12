#!/bin/bash
set -euo pipefail

ROOT="/Users/rpgpo/Projects/RPGPO"
TR_URL="https://github.com/rahulbittu/topranker.git"
TR_LOCAL="$ROOT/02-Projects/TopRanker/source-repo"
TR_IMPORTED="$ROOT/02-Projects/TopRanker/ImportedDocs"
TR_NOTES="$ROOT/02-Projects/TopRanker/Notes"
TR_STATE="$ROOT/02-Projects/TopRanker/State"
TODAY="$(date +%F)"
NOW="$(date '+%F %H:%M:%S')"

echo
echo "======================================"
echo "RPGPO PHASE 6 — TOPRANKER INGEST"
echo "======================================"
echo

mkdir -p "$TR_IMPORTED" "$TR_NOTES" "$TR_STATE"
mkdir -p "$ROOT/03-Operations/Logs/AgentRuns"
mkdir -p "$ROOT/03-Operations/Reports"
mkdir -p "$ROOT/04-Dashboard/state"

echo "[1/9] Cloning or updating public TopRanker repo..."
if [ -d "$TR_LOCAL/.git" ]; then
  cd "$TR_LOCAL"
  git pull --ff-only
else
  git clone "$TR_URL" "$TR_LOCAL"
fi

echo "[2/9] Copying key docs into RPGPO child-office memory..."
rm -rf "$TR_IMPORTED"/*
for f in README.md CHANGELOG.md CONTRIBUTING.md package.json .env.example; do
  if [ -f "$TR_LOCAL/$f" ]; then
    cp "$TR_LOCAL/$f" "$TR_IMPORTED/"
  fi
done

if [ -d "$TR_LOCAL/docs" ]; then
  mkdir -p "$TR_IMPORTED/docs"
  rsync -av --exclude='.DS_Store' "$TR_LOCAL/docs/" "$TR_IMPORTED/docs/"
fi

echo "[3/9] Building repo inventory..."
{
  echo "# TopRanker Repo Inventory"
  echo
  echo "Generated: $NOW"
  echo
  echo "## Root"
  (cd "$TR_LOCAL" && find . -maxdepth 2 \
    -not -path '*/\.git/*' \
    -not -path './node_modules/*' \
    -not -path './dist/*' \
    -not -path './build/*' \
    | sort)
} > "$TR_NOTES/TopRanker-Repo-Inventory.md"

echo "[4/9] Extracting README summary seed..."
README_FILE="$TR_LOCAL/README.md"
ARCH_FILE="$TR_IMPORTED/docs/ARCHITECTURE.md"

APP_DESC="$(grep -m 1 '^Community-ranked' "$README_FILE" || true)"
QUICKSTART_LINE="$(grep -m 1 '^## Quick Start' "$README_FILE" || true)"
ARCH_LINE="$(grep -m 1 '^## Architecture' "$README_FILE" || true)"

cat > "$TR_NOTES/TopRanker-Synthesis.md" <<EOT
# TopRanker Synthesis

## Source
Public repo: $TR_URL

## Imported On
$NOW

## Role inside RPGPO
TopRanker is the flagship business mission and child office inside RPGPO.

## Repo Status
Imported into RPGPO successfully.

## High-Level Summary
${APP_DESC:-TopRanker summary not auto-detected.}

## Current RPGPO Interpretation
TopRanker appears to be a serious product codebase with:
- mobile app surfaces
- backend/API components
- shared schema/types
- test coverage
- documentation
- operational scripts
- growth and product potential as RPGPO's flagship mission

## Auto-Detected Signals
- README found: $( [ -f "$TR_LOCAL/README.md" ] && echo yes || echo no )
- docs folder found: $( [ -d "$TR_LOCAL/docs" ] && echo yes || echo no )
- architecture doc found: $( [ -f "$ARCH_FILE" ] && echo yes || echo no )
- tests folder found: $( [ -d "$TR_LOCAL/tests" ] && echo yes || echo no )
- package.json found: $( [ -f "$TR_LOCAL/package.json" ] && echo yes || echo no )

## Immediate Questions for RPGPO
- what are the most important current TopRanker priorities?
- what part of the existing constitution/docs should be treated as child-law?
- what growth experiment should happen first?
- what product bottleneck matters most right now?

## Next Step
Use imported docs plus the repo inventory to produce a stronger TopRanker operating summary and first weekly execution target.
EOT

echo "[5/9] Creating TopRanker child-office operating summary..."
cat > "$TR_STATE/TopRanker-Imported-State.md" <<EOT
# TopRanker Imported State

## Imported At
$NOW

## Source Repo
$TR_URL

## Local Repo Path
$TR_LOCAL

## Imported Docs Path
$TR_IMPORTED

## Status
TopRanker source and docs are now ingested into RPGPO.

## RPGPO Child-Office Rule
RPGPO global governance stays in force.
TopRanker's own product-specific constitution and documentation should be treated as child-law within the TopRanker domain.

## Immediate Follow-up
1. Review imported docs
2. Identify TopRanker-specific constitution/principles
3. Create first real TopRanker operating summary
4. Choose this week's highest-leverage execution target
EOT

echo "[6/9] Updating dashboard state..."
cat > "$ROOT/04-Dashboard/state/dashboard-state.json" <<EOT
{
  "system_name": "RPGPO",
  "primary_inbox": "toprankerapp@gmail.com",
  "workspace_root": "/Users/rpgpo/Projects/RPGPO",
  "top_priorities": [
    "Ingest and honor TopRanker child-office documentation",
    "Define the first real TopRanker weekly target",
    "Use RPGPO to drive flagship execution visibly"
  ],
  "missions": [
    {
      "name": "TopRanker",
      "status": "active",
      "focus": "repo imported + docs ingested",
      "next": "review synthesis and choose weekly target"
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
    "TopRanker public repo cloned into RPGPO",
    "TopRanker docs imported into child-office memory",
    "TopRanker synthesis seed created"
  ],
  "research_queue": [
    "TopRanker-Growth",
    "Career-Target-Roles",
    "Founder2Founder-First-Offer"
  ]
}
EOT

echo "[7/9] Writing run log..."
cat > "$ROOT/03-Operations/Logs/AgentRuns/$TODAY-TopRanker-Ingest.md" <<EOT
# Agent Run Log

## Timestamp
$NOW

## Agent
Chief of Staff

## Domain
TopRanker

## Task
Clone/update the public TopRanker repository, import its key documentation into RPGPO, and produce a first synthesis seed.

## Inputs Used
- public GitHub repo URL
- RPGPO governance
- TopRanker bridge rules

## Sources Used
- $TR_URL
- imported TopRanker repo files

## Risk Level
Green

## Result
Success

## Summary
TopRanker was ingested into RPGPO as a governed child office. Key docs were copied into ImportedDocs, a repo inventory was generated, and a first synthesis file was created.

## Follow-up Needed
Yes

## Notes
Next step is to review imported docs and promote TopRanker-specific rules into the child-office memory.
EOT

echo "[8/9] Printing a quick summary..."
echo
echo "Imported docs:"
ls -la "$TR_IMPORTED" || true
echo
echo "TopRanker notes:"
ls -la "$TR_NOTES" || true
echo
echo "Mission state:"
ls -la "$TR_STATE" || true

echo "[9/9] Opening visible files..."
open "$ROOT/04-Dashboard/app/index.html"
open "$TR_IMPORTED"
open "$TR_NOTES/TopRanker-Synthesis.md"
open "$TR_NOTES/TopRanker-Repo-Inventory.md"

echo
echo "======================================"
echo "PHASE 6 COMPLETE"
echo "======================================"
echo
echo "Next recommended command:"
echo "cd $ROOT && git add . && git commit -m \"Add phase 6 TopRanker ingest\" && git push"
echo
