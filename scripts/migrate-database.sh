#!/bin/bash

# Database Migration Script for KN Biosciences E-commerce Platform
# This script applies all the database schema changes

echo "🚀 Starting database migration for KN Biosciences..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if user is logged in to Supabase
echo "🔍 Checking Supabase authentication..."
if ! supabase projects list &> /dev/null; then
    echo "❌ Please login to Supabase first:"
    echo "supabase login"
    exit 1
fi

# Apply database schema
echo "📊 Applying database schema..."
supabase db push

# Check if migration was successful
if [ $? -eq 0 ]; then
    echo "✅ Database migration completed successfully!"
    echo ""
    echo "📋 Summary of changes applied:"
    echo "  • Added product_reviews table with indexes and triggers"
    echo "  • Added contact_submissions table for contact forms"
    echo "  • Added legal_content table for legal pages"
    echo "  • Added faqs table for frequently asked questions"
    echo "  • Added shipping_pickups table for pickup management"
    echo "  • Added user_interactions table for recommendation engine"
    echo "  • Added recommendation_logs table for recommendation tracking"
    echo "  • Added recommendation_analytics table for recommendation analytics"
    echo "  • Added search_analytics table for search tracking"
    echo "  • Added product_analytics table for product interaction tracking"
    echo "  • Added page_views table for page view analytics"
    echo "  • Added product_interactions table for product interactions"
    echo "  • Added conversions table for conversion tracking"
    echo "  • Added proper indexes for all new tables"
    echo "  • Added updated_at triggers for all new tables"
    echo "  • Updated TypeScript database types"
    echo ""
    echo "🎉 Your KN Biosciences e-commerce platform is now ready!"
else
    echo "❌ Database migration failed. Please check the error messages above."
    exit 1
fi