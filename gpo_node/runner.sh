#!/bin/bash

LOG="$HOME/gpo_node/logs/claude.log"
STATUS="$HOME/gpo_node/logs/status.json"
QUEUE="$HOME/gpo_node/queue"

echo '{"status":"idle"}' > "$STATUS"

caffeinate -dimsu &

while true
do
  for TASK in "$QUEUE"/*.task
  do
    [ -e "$TASK" ] || continue

    PROMPT=$(cat "$TASK")

    echo "Running $(basename "$TASK")" >> "$LOG"
    echo "{\"status\":\"running\"}" > "$STATUS"

    echo "$PROMPT" | claude >> "$LOG" 2>&1

    mv "$TASK" "$TASK.done"
    echo '{"status":"idle"}' > "$STATUS"
  done

  sleep 3
done
