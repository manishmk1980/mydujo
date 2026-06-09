#!/usr/bin/env bash
set -euo pipefail

# Toggle Apache static maintenance page at the web root.
#
# Usage:
#   bash scripts/maintenance-mode.sh on   # enable maintenance
#   bash scripts/maintenance-mode.sh off  # go live
#
# Optional:
#   HTML_DIR=/var/www/html

ACTION="${1:-}"
HTML_DIR="${HTML_DIR:-/var/www/html}"
MAINT_SRC="${MAINT_SRC:-$(dirname "$0")/maintenance.html}"

usage() {
  echo "Usage: $0 on|off"
  exit 1
}

[[ "$ACTION" == "on" || "$ACTION" == "off" ]] || usage

cd "$HTML_DIR"

case "$ACTION" in
  on)
    if [[ -f index.html && ! -f index.html.live ]]; then
      mv index.html index.html.live
    fi
    cp "$MAINT_SRC" index.html
    echo "Maintenance mode ON — $HTML_DIR/index.html replaced"
    ;;
  off)
    if [[ -f index.html.live ]]; then
      mv -f index.html.live index.html
      echo "Maintenance mode OFF — restored live index.html"
    else
      echo "No index.html.live backup found; remove maintenance index.html manually if needed"
    fi
    ;;
esac
