#!/usr/bin/env bash
set -euo pipefail

# Create rollback snapshots before production cutover.
#
# Usage (on the production server):
#   sudo bash scripts/pre-deploy-backup.sh
#
# Optional env:
#   BACKUP_ROOT=/var/backups/mdpl
#   HTML_DIR=/var/www/html
#   API_DIR=/var/www/mdpl-api
#   DB_NAME=mdpl_db

BACKUP_ROOT="${BACKUP_ROOT:-/var/backups/mdpl}"
HTML_DIR="${HTML_DIR:-/var/www/html}"
API_DIR="${API_DIR:-/var/www/mdpl-api}"
DB_NAME="${DB_NAME:-mdpl_db}"
STAMP="$(date +%Y%m%d-%H%M%S)"
DEST="${BACKUP_ROOT}/${STAMP}"

mkdir -p "$DEST"

echo "==> Backup destination: $DEST"

if [[ -d "$HTML_DIR" ]]; then
  echo "==> Archiving $HTML_DIR"
  tar -czf "${DEST}/html.tar.gz" -C "$(dirname "$HTML_DIR")" "$(basename "$HTML_DIR")"
else
  echo "WARN: $HTML_DIR not found, skipping frontend archive"
fi

if [[ -d "$API_DIR" ]]; then
  echo "==> Archiving $API_DIR (excluding node_modules)"
  tar -czf "${DEST}/mdpl-api.tar.gz" \
    --exclude='node_modules' \
    --exclude='logs' \
    -C "$(dirname "$API_DIR")" "$(basename "$API_DIR")"
else
  echo "WARN: $API_DIR not found, skipping API archive"
fi

if command -v mysqldump >/dev/null 2>&1; then
  ENV_FILE="${API_DIR}/.env"
  if [[ -f "$ENV_FILE" ]]; then
    # shellcheck disable=SC1090
    set -a && source "$ENV_FILE" && set +a
  fi
  if [[ -n "${DATABASE_URL:-}" ]]; then
    echo "==> Dumping ${DB_NAME} via DATABASE_URL"
  # Prisma-style URL: mysql://user:pass@host:3306/dbname
    if [[ "$DATABASE_URL" =~ mysql://([^:/]+):([^@]+)@([^:/]+):?([0-9]*)/([^?]+) ]]; then
      DB_USER="${BASH_REMATCH[1]}"
      DB_PASS="${BASH_REMATCH[2]}"
      DB_HOST="${BASH_REMATCH[3]}"
      DB_PORT="${BASH_REMATCH[4]:-3306}"
      DB_SCHEMA="${BASH_REMATCH[5]}"
      MYSQL_PWD="$DB_PASS" mysqldump \
        --single-transaction --routines --triggers \
        -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_SCHEMA" \
        > "${DEST}/${DB_NAME}.sql"
    else
      echo "WARN: Could not parse DATABASE_URL; run mysqldump manually"
    fi
  else
    echo "WARN: DATABASE_URL not set; run mysqldump manually"
  fi
else
  echo "WARN: mysqldump not found; take a manual DB dump"
fi

ln -sfn "$DEST" "${BACKUP_ROOT}/last-known-good"
echo "==> Done. Last known good: ${BACKUP_ROOT}/last-known-good"
