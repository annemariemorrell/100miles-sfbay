#!/usr/bin/env bash
# Idempotent repository + system bootstrap for the 100 Miles SF Bay dev environment.
# Safe to run repeatedly. Installs system packages only when missing, then refreshes
# Node dependencies and writes the local .env.local pointing at the local backend.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/env.sh"

POSTGREST_VERSION="v14.16"

need_apt=0
command -v psql   >/dev/null 2>&1 || need_apt=1
command -v nginx  >/dev/null 2>&1 || need_apt=1
command -v jq     >/dev/null 2>&1 || need_apt=1
command -v curl   >/dev/null 2>&1 || need_apt=1

if [ "$need_apt" = "1" ]; then
  echo "[install] Installing system packages (postgresql, nginx, jq, curl)..."
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
    postgresql postgresql-contrib nginx curl jq
else
  echo "[install] System packages already present; skipping apt."
fi

if ! command -v postgrest >/dev/null 2>&1; then
  echo "[install] Installing PostgREST ${POSTGREST_VERSION}..."
  tmpd="$(mktemp -d)"
  curl -sL -o "$tmpd/postgrest.tar.xz" \
    "https://github.com/PostgREST/postgrest/releases/download/${POSTGREST_VERSION}/postgrest-${POSTGREST_VERSION}-linux-static-x86-64.tar.xz"
  tar -xf "$tmpd/postgrest.tar.xz" -C "$tmpd"
  sudo mv "$tmpd/postgrest" /usr/local/bin/postgrest
  sudo chmod +x /usr/local/bin/postgrest
  rm -rf "$tmpd"
else
  echo "[install] PostgREST already present; skipping download."
fi

echo "[install] Installing Node dependencies (npm ci)..."
cd "$REPO_ROOT"
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

echo "[install] Writing .env.local for the local Supabase-compatible backend..."
cat > "$REPO_ROOT/.env.local" <<ENV
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
ENV

echo "[install] Done."
