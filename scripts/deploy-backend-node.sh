#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   bash scripts/deploy-backend-node.sh /var/www/mdpl-qa 4000

APP_ROOT="${1:-$(pwd)}"
PORT="${2:-4000}"

cd "$APP_ROOT"
echo "==> App root: $APP_ROOT"

git pull --rebase

cd server
npm install
npx prisma generate
npx prisma migrate deploy

# Stop any running server.js process on the same host user.
pkill -f "node src/server.js" || true

# Start app in background and log to server logs file.
mkdir -p ../logs
nohup env PORT="$PORT" npm run start > ../logs/backend.out.log 2>&1 &

echo "==> Backend restarted on port $PORT"
echo "==> Tailing logs..."
tail -n 120 -f ../logs/backend.out.log
