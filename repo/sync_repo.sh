#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${1:-https://github.com/rahulbittu/rpgpo.git}"
COMMIT_MSG="${2:-Update RPGPO docs}"
SOURCE_DIR="${3:-$HOME/RPGPO}"
TARGET_DIR="$HOME/rpgpo-repo-sync"

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "Source dir not found: $SOURCE_DIR"
  exit 1
fi

if [[ ! -d "$TARGET_DIR/.git" ]]; then
  git clone "$REPO_URL" "$TARGET_DIR"
else
  git -C "$TARGET_DIR" pull --rebase
fi

rsync -av --delete \
  --exclude '.git' \
  "$SOURCE_DIR/" "$TARGET_DIR/"

git -C "$TARGET_DIR" add .
if git -C "$TARGET_DIR" diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

git -C "$TARGET_DIR" commit -m "$COMMIT_MSG"
git -C "$TARGET_DIR" push origin main

echo "Sync complete: $REPO_URL"
