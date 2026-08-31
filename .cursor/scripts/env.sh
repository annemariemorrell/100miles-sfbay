#!/usr/bin/env bash
# Shared configuration for the local Supabase-compatible dev backend.
# These are local-only development values (no real secrets).

set -euo pipefail

# Where local service state lives (owned by the agent user, survives in snapshots).
export LOCAL_ROOT="${LOCAL_ROOT:-$HOME/.local}"
export PGDATA="${PGDATA:-$LOCAL_ROOT/pgdata}"
export PGSOCK="${PGSOCK:-$LOCAL_ROOT/pgsock}"
export PGPORT="${PGPORT:-5432}"
export PGHOST_LOCAL="127.0.0.1"

# PostgREST + nginx wiring.
export POSTGREST_PORT="${POSTGREST_PORT:-3001}"
export SUPABASE_API_PORT="${SUPABASE_API_PORT:-54321}"

# Roles used by PostgREST.
export DB_SUPERUSER="ubuntu"
export DB_NAME="postgres"
export AUTHENTICATOR_ROLE="authenticator"
export AUTHENTICATOR_PW="authenticator_pw"
export ANON_ROLE="anon"

# Local JWT secret + matching long-lived anon key (role=anon). Local dev only.
export SUPABASE_JWT_SECRET="super-secret-jwt-token-with-at-least-32-characters-long"
export SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6IjEwMG1pbGVzLWxvY2FsIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjIwMDAwMDAwMDB9.0VMmHzdIBe4p77vxvCjA9wG643-WawBJ-yRl932j4YE"
export SUPABASE_URL="http://127.0.0.1:${SUPABASE_API_PORT}"

# Locate the installed PostgreSQL binaries (version-agnostic).
detect_pg_bin() {
  if command -v pg_ctl >/dev/null 2>&1; then
    dirname "$(command -v pg_ctl)"
    return
  fi
  local d
  for d in /usr/lib/postgresql/*/bin; do
    if [ -x "$d/pg_ctl" ]; then
      echo "$d"
      return
    fi
  done
  return 1
}

export PG_BIN="$(detect_pg_bin || true)"
if [ -n "${PG_BIN:-}" ]; then
  export PATH="$PG_BIN:$PATH"
fi

# True if a TCP port on localhost is accepting connections.
port_open() {
  local port="$1"
  (exec 3<>"/dev/tcp/127.0.0.1/${port}") 2>/dev/null && exec 3>&- && return 0
  return 1
}
