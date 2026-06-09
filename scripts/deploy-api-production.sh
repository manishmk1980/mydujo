#!/usr/bin/env bash
set -euo pipefail

# Production API cutover helper (run over SSH on the server).
#
# Usage:
#   bash scripts/deploy-api-production.sh
#   bash scripts/deploy-api-production.sh /var/www/mdpl-api mdpl-api
#
# Prerequisites:
#   - .env on the server with DATABASE_URL, JWT secrets, SMTP_PASS, etc.
#   - SMTP_PASS must be set on the server only; never commit or upload it.

APP_ROOT="${1:-/var/www/mdpl-api}"
PM2_NAME="${2:-mdpl-api}"

cd "$APP_ROOT"
echo "==> App root: $APP_ROOT"
echo "==> PM2 name: $PM2_NAME"

if [[ ! -f .env ]]; then
  echo "ERROR: .env missing in $APP_ROOT"
  exit 1
fi

if ! grep -q '^SMTP_PASS=.\+' .env 2>/dev/null; then
  echo "WARN: SMTP_PASS is empty or missing in .env — email notifications will be skipped"
fi

git pull --rebase

npm install --omit=dev
npx prisma generate
npx prisma migrate deploy

if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 restart "$PM2_NAME" --update-env
else
  pm2 start npm --name "$PM2_NAME" --cwd "$APP_ROOT" -- run start
fi

pm2 save
pm2 flush
echo "==> API deployed. Tail logs with: pm2 logs $PM2_NAME --lines 80"
