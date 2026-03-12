#!/bin/bash
# Start the RPGPO Dashboard
# Usage: bash start.sh

cd "$(dirname "$0")"

echo ""
echo "  ┌──────────────────────────────────────┐"
echo "  │  RPGPO Command Center                │"
echo "  │  Governed Private Office Dashboard   │"
echo "  └──────────────────────────────────────┘"
echo ""

# Refresh state before starting
echo "Refreshing state..."
bash scripts/refresh-state.sh 2>&1 | tail -3
echo ""

echo "Starting server..."
node server.js
