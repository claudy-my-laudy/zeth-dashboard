#!/bin/bash
# Quick wrapper to log a task to Zeth Dashboard
# Usage: log_task "Title" category tokens_in tokens_out duration_mins "model" "description"

TITLE="$1"
CATEGORY="${2:-other}"
TOKENS_IN="${3:-0}"
TOKENS_OUT="${4:-0}"
DURATION="${5:-0}"
MODEL="${6:-unknown}"
DESC="${7:-}"

node /home/ubuntu/.openclaw/workspace/zeth-dashboard/backend/log_task.js \
  --title "$TITLE" \
  --category "$CATEGORY" \
  --tokens_in "$TOKENS_IN" \
  --tokens_out "$TOKENS_OUT" \
  --duration "$DURATION" \
  --model "$MODEL" \
  --description "$DESC"
