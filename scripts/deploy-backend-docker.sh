#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   bash scripts/deploy-backend-docker.sh /var/www/mdpl-qa mdpl-qa-api

APP_ROOT="${1:-$(pwd)}"
SERVICE_NAME="${2:-mdpl-qa-api}"

cd "$APP_ROOT"
echo "==> App root: $APP_ROOT"

git pull --rebase

cd server
npm install
npx prisma generate
npx prisma migrate deploy

cd "$APP_ROOT"
docker compose up -d --build "$SERVICE_NAME"
docker compose logs -f --tail=120 "$SERVICE_NAME"
