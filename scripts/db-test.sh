#!/usr/bin/env bash
# Runs the pgTAP tests with psql against the local Supabase database (`pnpm db:start` first).
# Equivalent to `supabase test db`, without the pg_prove container. Fails on any "not ok" or SQL error.
set -euo pipefail
DB_URL="${DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"
DIR="$(cd "$(dirname "$0")/../supabase/tests/database" && pwd)"
status=0
for f in "$DIR"/*.test.sql; do
  out="$(psql "$DB_URL" -X -q -v ON_ERROR_STOP=1 -At -f "$f" 2>&1)" || { echo "✗ $(basename "$f")"; echo "$out"; status=1; continue; }
  if grep -qE '^not ok|# Looks like' <<<"$out"; then
    echo "✗ $(basename "$f")"; grep -E '^not ok|^#' <<<"$out"; status=1
  else
    echo "✓ $(basename "$f") ($(grep -c '^ok' <<<"$out") assertions)"
  fi
done
exit $status
