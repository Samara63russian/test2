#!/usr/bin/env bash
# Idempotent Cloud Agent bootstrap for swgoh_guild_webapp.
#
# The repo has two independent Python apps with conflicting pandas pins, so each
# gets its own virtualenv:
#   - streamlit_app         -> pandas 1.5.3 (frontend)
#   - swgoh_comlink_fetcher -> pandas 2.1.x (FastAPI backend)
# Both apps pin Python 3.11 in their Dockerfiles (pandas 1.5.3 has no 3.12 wheels
# and main.py uses typing.Self), so we install 3.11 explicitly.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# 1. Ensure Python 3.11 is available (default image ships 3.12).
if ! command -v python3.11 >/dev/null 2>&1; then
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq software-properties-common
  sudo add-apt-repository -y ppa:deadsnakes/ppa
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
    python3.11 python3.11-venv python3.11-dev
fi

# 2. Streamlit frontend virtualenv.
python3.11 -m venv .venv-streamlit
.venv-streamlit/bin/python -m pip install --upgrade pip
.venv-streamlit/bin/pip install -r streamlit_app/requirements.txt

# 3. Comlink fetcher backend virtualenv (kept isolated from the frontend).
python3.11 -m venv .venv-fetcher
.venv-fetcher/bin/python -m pip install --upgrade pip
.venv-fetcher/bin/pip install -r swgoh_comlink_fetcher/requirements.txt
.venv-fetcher/bin/pip install -e swgoh_comlink_fetcher

echo "install.sh completed successfully."
