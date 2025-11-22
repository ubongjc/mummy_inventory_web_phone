#!/bin/bash
set -e

echo "🔍 Checking for failed migrations..."

# Try to resolve any failed migrations as rolled back
# The specific migration that's failing
FAILED_MIGRATION="20251122033407_add_plan_to_subscription"

# Check if DATABASE_URL_UNPOOLED is set, otherwise use DATABASE_URL
DB_URL="${DATABASE_URL_UNPOOLED:-$DATABASE_URL}"

if [ -z "$DB_URL" ]; then
  echo "❌ Error: DATABASE_URL or DATABASE_URL_UNPOOLED must be set"
  exit 1
fi

# Try to resolve the failed migration
echo "🔧 Attempting to resolve failed migration: $FAILED_MIGRATION"
DATABASE_URL="$DB_URL" npx prisma migrate resolve --rolled-back "$FAILED_MIGRATION" 2>&1 || {
  echo "⚠️  Migration resolve failed or migration doesn't exist in DB (this is okay if it was already resolved)"
}

# Now run the actual migration deploy
echo "🚀 Running migration deploy..."
DATABASE_URL="$DB_URL" npx prisma migrate deploy

echo "✅ Migrations completed successfully"
