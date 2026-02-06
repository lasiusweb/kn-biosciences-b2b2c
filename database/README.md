# Database Migration Guide

This document explains how to apply the complete database migration for the KN Biosciences e-commerce platform.

## Overview

The migration adds all the missing tables that are referenced in the codebase but don't exist in the database yet. This ensures that all API routes and features work properly.

## Tables Added

### Core E-commerce Tables
- `contact_submissions` - For contact form submissions
- `legal_content` - For legal pages (terms, privacy policy, etc.)
- `faqs` - For frequently asked questions

### Analytics & Tracking Tables
- `user_interactions` - For recommendation engine user behavior tracking
- `recommendation_logs` - For recommendation request logging
- `recommendation_analytics` - For recommendation performance analytics
- `search_analytics` - For search query tracking
- `product_analytics` - For product interaction tracking
- `page_views` - For page view analytics
- `product_interactions` - For product-specific interactions
- `conversions` - For conversion tracking

### Shipping & Logistics Tables
- `shipping_pickups` - For pickup scheduling and management

## Migration Methods

### Method 1: Using Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Apply the migration**:
   ```bash
   supabase db push
   ```

### Method 2: Using SQL Migration File

1. **Access your Supabase project dashboard**
2. **Go to the SQL Editor**
3. **Run the migration SQL**:
   ```sql
   -- Copy the contents from database/migration.sql
   -- Or run the file directly if your SQL client supports it
   ```

### Method 3: Using the Migration Script

1. **Run the migration script**:
   ```bash
   ./scripts/migrate-database.sh
   ```

## Post-Migration Steps

After applying the migration:

1. **Verify the tables were created**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN (
     'contact_submissions', 'legal_content', 'faqs', 
     'shipping_pickups', 'user_interactions', 
     'recommendation_logs', 'recommendation_analytics',
     'search_analytics', 'product_analytics', 
     'page_views', 'product_interactions', 'conversions'
   );
   ```

2. **Test the API endpoints** that use these tables:
   - Contact form: `POST /api/contact/submit`
   - Wishlist: `GET/POST/DELETE /api/wishlist`
   - User profile: `GET/PUT /api/users/profile`
   - Product reviews: `GET/POST /api/products/[slug]/reviews`

3. **Update your environment variables** if needed for analytics tracking

## TypeScript Types

The migration includes updated TypeScript database types in `src/types/database.ts`. This ensures type safety when working with the new tables.

## Rollback Plan

If you need to rollback the migration:

1. **Drop the new tables**:
   ```sql
   DROP TABLE IF EXISTS conversions;
   DROP TABLE IF EXISTS product_interactions;
   DROP TABLE IF EXISTS page_views;
   DROP TABLE IF EXISTS product_analytics;
   DROP TABLE IF EXISTS search_analytics;
   DROP TABLE IF EXISTS recommendation_analytics;
   DROP TABLE IF EXISTS recommendation_logs;
   DROP TABLE IF EXISTS user_interactions;
   DROP TABLE IF EXISTS shipping_pickups;
   DROP TABLE IF EXISTS faqs;
   DROP TABLE IF EXISTS legal_content;
   DROP TABLE IF EXISTS contact_submissions;
   ```

2. **Restore the previous database types** if you have a backup

## Troubleshooting

### Common Issues

1. **Permission errors**: Make sure your Supabase user has the necessary permissions
2. **Foreign key errors**: Ensure the referenced tables exist before creating the new ones
3. **Type errors**: Restart your development server to pick up the new TypeScript types

### Getting Help

If you encounter issues during migration:

1. Check the Supabase logs for detailed error messages
2. Verify your database connection settings
3. Make sure you're using the correct project URL and API keys

## Next Steps

After completing the migration:

1. Test all the new API endpoints
2. Verify the analytics tracking is working
3. Update any documentation that references the new tables
4. Consider setting up proper monitoring for the new analytics tables

## Security Considerations

- The new tables include proper foreign key constraints
- Row Level Security (RLS) policies should be reviewed for the new tables
- Analytics tables may contain sensitive user data - ensure proper access controls