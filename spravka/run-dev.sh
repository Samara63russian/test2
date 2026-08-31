#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT/backend"
python3 -m pip install -q -r requirements.txt
export PYTHONPATH="$ROOT/backend"
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
API_PID=$!
cd "$ROOT/frontend"
npm install
npx vite --host 0.0.0.0 --port 5173
kill "$API_PID" 2>/dev/null || true
