#!/usr/bin/env bash
# Idempotent per-boot startup for the 100 Miles SF Bay dev environment.
# Brings up: PostgreSQL -> roles/schema -> PostgREST -> nginx (/rest/v1 proxy) -> Next.js dev.
# Tolerates restarts (reuses running services), waits for readiness, then returns.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/env.sh"

LOG_DIR="$LOCAL_ROOT/logs"
mkdir -p "$LOG_DIR" "$PGSOCK"

wait_for() { # <description> <command...>
  local desc="$1"; shift
  local i
  for i in $(seq 1 60); do
    if "$@" >/dev/null 2>&1; then
      echo "[start] $desc ready."
      return 0
    fi
    sleep 1
  done
  echo "[start] ERROR: timed out waiting for $desc" >&2
  return 1
}

########################################
# 1. PostgreSQL
########################################
if [ -z "${PG_BIN:-}" ]; then
  echo "[start] ERROR: PostgreSQL binaries not found." >&2
  exit 1
fi

if [ ! -f "$PGDATA/PG_VERSION" ]; then
  echo "[start] Initializing PostgreSQL cluster at $PGDATA..."
  initdb -D "$PGDATA" -U "$DB_SUPERUSER" --auth=trust >"$LOG_DIR/initdb.log" 2>&1
fi

# Ensure connection + socket settings (idempotent).
set_conf() { # <key> <value>
  local key="$1" val="$2"
  if grep -qE "^[[:space:]]*#?[[:space:]]*${key}[[:space:]]*=" "$PGDATA/postgresql.conf"; then
    sed -i "s|^[[:space:]]*#\?[[:space:]]*${key}[[:space:]]*=.*|${key} = ${val}|" "$PGDATA/postgresql.conf"
  else
    echo "${key} = ${val}" >> "$PGDATA/postgresql.conf"
  fi
}
set_conf "listen_addresses" "'localhost'"
set_conf "port" "$PGPORT"
set_conf "unix_socket_directories" "'$PGSOCK'"

if ! pg_ctl -D "$PGDATA" status >/dev/null 2>&1; then
  echo "[start] Starting PostgreSQL..."
  pg_ctl -D "$PGDATA" -l "$LOG_DIR/postgres.log" -o "-p $PGPORT" -w start
else
  echo "[start] PostgreSQL already running."
fi

wait_for "PostgreSQL" pg_isready -h "$PGHOST_LOCAL" -p "$PGPORT"

########################################
# 2. Roles + schema (idempotent)
########################################
echo "[start] Ensuring roles..."
psql -h "$PGHOST_LOCAL" -p "$PGPORT" -U "$DB_SUPERUSER" -d "$DB_NAME" -v ON_ERROR_STOP=1 <<SQL
DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='${ANON_ROLE}') THEN
    CREATE ROLE ${ANON_ROLE} NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='${AUTHENTICATOR_ROLE}') THEN
    CREATE ROLE ${AUTHENTICATOR_ROLE} LOGIN NOINHERIT PASSWORD '${AUTHENTICATOR_PW}';
  END IF;
END \$\$;
GRANT ${ANON_ROLE} TO ${AUTHENTICATOR_ROLE};
SQL

echo "[start] Applying database schema..."
psql -h "$PGHOST_LOCAL" -p "$PGPORT" -U "$DB_SUPERUSER" -d "$DB_NAME" -v ON_ERROR_STOP=1 \
  -f "$REPO_ROOT/supabase/schema.sql" >"$LOG_DIR/schema.log" 2>&1

########################################
# 3. PostgREST
########################################
if ! port_open "$POSTGREST_PORT"; then
  echo "[start] Starting PostgREST on :$POSTGREST_PORT..."
  PGRST_DB_URI="postgres://${AUTHENTICATOR_ROLE}:${AUTHENTICATOR_PW}@${PGHOST_LOCAL}:${PGPORT}/${DB_NAME}" \
  PGRST_DB_SCHEMAS="public" \
  PGRST_DB_ANON_ROLE="$ANON_ROLE" \
  PGRST_JWT_SECRET="$SUPABASE_JWT_SECRET" \
  PGRST_SERVER_HOST="$PGHOST_LOCAL" \
  PGRST_SERVER_PORT="$POSTGREST_PORT" \
    nohup postgrest >"$LOG_DIR/postgrest.log" 2>&1 &
  disown || true
else
  echo "[start] PostgREST already running."
fi
wait_for "PostgREST" bash -c "curl -sf http://${PGHOST_LOCAL}:${POSTGREST_PORT}/ -o /dev/null"

########################################
# 4. nginx (exposes Supabase-style /rest/v1 on :$SUPABASE_API_PORT)
########################################
NGX="$LOCAL_ROOT/nginx"
mkdir -p "$NGX/body" "$NGX/proxy" "$NGX/fastcgi" "$NGX/uwsgi" "$NGX/scgi"
cat > "$NGX/nginx.conf" <<CONF
worker_processes 1;
error_log ${NGX}/error.log warn;
pid ${NGX}/nginx.pid;
events { worker_connections 128; }
http {
  access_log ${NGX}/access.log;
  client_body_temp_path ${NGX}/body;
  proxy_temp_path ${NGX}/proxy;
  fastcgi_temp_path ${NGX}/fastcgi;
  uwsgi_temp_path ${NGX}/uwsgi;
  scgi_temp_path ${NGX}/scgi;
  server {
    listen ${PGHOST_LOCAL}:${SUPABASE_API_PORT};
    location = /health { return 200 'ok'; }
    location /rest/v1/ {
      proxy_pass http://${PGHOST_LOCAL}:${POSTGREST_PORT}/;
      proxy_set_header Host \$host;
    }
  }
}
CONF

if [ -f "$NGX/nginx.pid" ] && kill -0 "$(cat "$NGX/nginx.pid" 2>/dev/null)" 2>/dev/null; then
  echo "[start] Reloading nginx..."
  nginx -c "$NGX/nginx.conf" -p "$NGX" -s reload
elif port_open "$SUPABASE_API_PORT"; then
  echo "[start] Port $SUPABASE_API_PORT already served; skipping nginx start."
else
  echo "[start] Starting nginx proxy on :$SUPABASE_API_PORT..."
  nginx -c "$NGX/nginx.conf" -p "$NGX"
fi
wait_for "Supabase REST proxy" bash -c "curl -sf http://${PGHOST_LOCAL}:${SUPABASE_API_PORT}/health -o /dev/null"

echo "[start] Backend ready:"
echo "  - PostgreSQL   127.0.0.1:${PGPORT}"
echo "  - PostgREST    127.0.0.1:${POSTGREST_PORT}"
echo "  - Supabase API ${SUPABASE_URL} (/rest/v1 -> PostgREST)"

########################################
# 5. Next.js dev server (foreground)
########################################
# Runs attached so the pod's start process stays alive as the app for the
# lifetime of the container. Postgres and nginx daemonize; PostgREST runs
# detached above. A fresh boot has nothing on :3000, so we exec the dev server.
cd "$REPO_ROOT"
if port_open 3000; then
  echo "[start] Next.js already running on :3000; leaving it in place."
else
  echo "[start] Starting Next.js dev server on :3000 (foreground)..."
  exec npm run dev
fi
