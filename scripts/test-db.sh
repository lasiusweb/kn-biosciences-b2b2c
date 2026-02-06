#!/bin/bash

# Database Testing Script for KN Biosciences
# Usage: npm run test:db

echo "🗄️  Setting up test database..."

# Wait for database to be ready
echo "Waiting for PostgreSQL to be ready..."
while ! pg_isready -h localhost -p 5432; do
  sleep 1
done

echo "✅ PostgreSQL is ready!"

# Run database migrations
echo "🔄 Running database migrations..."
npx supabase db push || {
  echo "❌ Migration failed!"
  exit 1
}

# Seed test data
echo "🌱 Seeding test data..."
node scripts/seed-test-data.js || {
  echo "❌ Test data seeding failed!"
  exit 1
}

# Run integration tests
echo "🧪 Running integration tests..."
npm run test:integration || {
  echo "❌ Integration tests failed!"
  exit 1
}

echo "✅ Database setup completed successfully!"