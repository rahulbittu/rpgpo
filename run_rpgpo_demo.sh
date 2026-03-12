#!/bin/bash
set -euo pipefail

ROOT="/Users/rpgpo/Projects/RPGPO"

echo
echo "======================================"
echo "RPGPO DEMO START"
echo "======================================"
echo

echo "[Step 1] Running morning loop..."
"$ROOT/03-Operations/Loops/morning_loop.sh"
sleep 2

echo
echo "[Step 2] Printing today's daily brief..."
echo "--------------------------------------"
cat "$ROOT/03-Operations/DailyBriefs/$(date +%F)-DailyBrief.md"
sleep 2

echo
echo "[Step 3] Printing mission status summaries..."
echo "--------------------------------------"
for f in "$ROOT"/03-Operations/MissionStatus/*.md; do
  echo
  echo ">>> $(basename "$f")"
  sed -n '1,120p' "$f"
done
sleep 2

echo
echo "[Step 4] Listing pending approvals..."
echo "--------------------------------------"
ls -1 "$ROOT/03-Operations/Approvals/Pending" || true
sleep 2

echo
echo "[Step 5] Listing research queue..."
echo "--------------------------------------"
ls -1 "$ROOT/03-Operations/ResearchQueue" || true
sleep 2

echo
echo "[Step 6] Opening dashboard..."
echo "--------------------------------------"
open "$ROOT/04-Dashboard/app/index.html"

echo
echo "======================================"
echo "RPGPO DEMO COMPLETE"
echo "======================================"
echo
echo "Now import TopRanker docs into:"
echo "$ROOT/02-Projects/TopRanker/ImportedDocs/"
echo
echo "Then we can make RPGPO synthesize TopRanker properly."
