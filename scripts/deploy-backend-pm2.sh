#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   bash scripts/deploy-backend-pm2.sh /var/www/mdpl-qa mdpl-qa-api

APP_ROOT="${1:-$(pwd)}"
PM2_NAME="${2:-mdpl-qa-api}"

cd "$APP_ROOT"
echo "==> App root: $APP_ROOT"

git pull --rebase

cd server
npm install
npx prisma generate
npx prisma migrate deploy

# Start if missing, restart if present.
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 restart "$PM2_NAME" --update-env
else
  pm2 start npm --name "$PM2_NAME" -- run start
fi

pm2 save
pm2 logs "$PM2_NAME" --lines 120
