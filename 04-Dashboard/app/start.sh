#!/bin/bash
# RPGPO Dashboard — Start Script
# Usage:
#   bash start.sh          — start with node (foreground)
#   bash start.sh pm2      — start with PM2 (background, always-on)
#   bash start.sh stop     — stop PM2 processes

cd "$(dirname "$0")"

echo ""
echo "  ┌──────────────────────────────────────┐"
echo "  │  RPGPO Command Center v2             │"
echo "  │  Always-On Private Office Dashboard  │"
echo "  └──────────────────────────────────────┘"
echo ""

# Refresh state
echo "Refreshing state..."
node scripts/refresh-state.js 2>&1 | tail -3
echo ""

if [ "$1" = "pm2" ]; then
  echo "Starting with PM2 (always-on mode)..."
  pm2 start ecosystem.config.js
  pm2 save
  echo ""
  echo "  Dashboard:  http://localhost:3200"
  echo "  PM2 status: pm2 status"
  echo "  PM2 logs:   pm2 logs"
  echo "  PM2 stop:   pm2 stop all"
  echo ""
elif [ "$1" = "stop" ]; then
  echo "Stopping PM2 processes..."
  pm2 stop rpgpo-server rpgpo-worker
  pm2 delete rpgpo-server rpgpo-worker
  echo "Stopped."
else
  echo "Starting server (foreground)..."
  echo "  Tip: Use 'bash start.sh pm2' for always-on mode"
  echo ""
  # Start worker in background, server in foreground
  node worker.js &
  WORKER_PID=$!
  trap "kill $WORKER_PID 2>/dev/null; exit" INT TERM
  node server.js
fi
