#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if [[ ! -d .venv ]]; then
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install -q -r backend/requirements.txt

if [[ ! -d frontend/node_modules ]]; then
  (cd frontend && npm install)
fi

(cd frontend && npm run build)

export PYTHONPATH="$ROOT/backend"
mkdir -p backend/data
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" --app-dir backend
