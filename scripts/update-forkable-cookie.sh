#!/bin/bash
# Forkable Cookie Update Script
# Called by Claude after extracting cookie via Chrome DevTools MCP
#
# Usage: ./scripts/update-forkable-cookie.sh <cookie-value>

set -e

COOKIE="$1"

if [ -z "$COOKIE" ]; then
  echo "Usage: $0 <cookie-value>"
  echo ""
  echo "This script is meant to be called by Claude after extracting"
  echo "the cookie via Chrome DevTools MCP."
  echo ""
  echo "To refresh the cookie, ask Claude:"
  echo "  'refresh the forkable cookie'"
  exit 1
fi

echo "Updating FORKABLE_SESSION_COOKIE..."

# Update .env.local
cd "$(dirname "$0")/.."
if grep -q "FORKABLE_SESSION_COOKIE" .env.local 2>/dev/null; then
  sed -i '' "s/FORKABLE_SESSION_COOKIE=.*/FORKABLE_SESSION_COOKIE=\"$COOKIE\"/" .env.local
  echo "✓ Updated .env.local"
else
  echo "" >> .env.local
  echo "# Forkable Integration" >> .env.local
  echo "FORKABLE_SESSION_COOKIE=\"$COOKIE\"" >> .env.local
  echo "✓ Added to .env.local"
fi

# Update Vercel env vars
echo "Updating Vercel environment variables..."

for env in production preview development; do
  vercel env rm FORKABLE_SESSION_COOKIE $env --yes 2>/dev/null || true
  echo "$COOKIE" | vercel env add FORKABLE_SESSION_COOKIE $env
  echo "✓ Updated $env"
done

echo ""
echo "✓ Done! Cookie updated everywhere."
