#!/bin/bash

tmux new-session -d -s gpo_runner "bash ~/Projects/RPGPO/gpo_node/runner.sh"
tmux new-session -d -s gpo_server "python3 ~/Projects/RPGPO/gpo_node/server.py"

echo "GPO node started"
