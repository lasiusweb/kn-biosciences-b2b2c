# KN Biosciences E-commerce Platform - Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Performance Optimizations](#performance-optimizations)
3. [Security Measures](#security-measures)
4. [Caching Strategy](#caching-strategy)
5. [Monitoring & Analytics](#monitoring--analytics)
6. [API Reference](#api-reference)
7. [Deployment Guide](#deployment-guide)
8. [Troubleshooting](#troubleshooting)

## Architecture Overview

### Technology Stack
- **Frontend**: Next.js 16 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Hooks, Apollo Client for GraphQL
- **Backend**: Supabase (PostgreSQL) with Hasura GraphQL Engine
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Payment Gateways**: Razorpay, PayU, Easebuzz
- **Shipping**: Delhivery API
- **CRM/Accounting**: Zoho CRM and Books

### Project Structure
```
kn-biosciences/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication routes
│   │   ├── admin/             # Admin dashboard
│   │   ├── b2b/               # B2B portal
│   │   ├── shop/              # E-commerce store
│   │   └── api/               # API routes
│   ├── components/            # Reusable components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── auth/              # Authentication components
│   │   ├── admin/             # Admin components
│   │   ├── b2b/               # B2B components
│   │   ├── home/              # Homepage components
│   │   ├── layout/            # Layout components
│   │   └── shop/              # Shop components
│   ├── lib/                   # Utility libraries
│   │   ├── supabase.ts        # Supabase client
│   │   ├── apollo.ts          # Apollo GraphQL client
│   │   ├── utils.ts           # Helper functions
│   │   ├── perf-utils.ts      # Performance utilities
│   │   ├── cache-manager.ts   # Caching utilities
│   │   ├── security-manager.ts # Security utilities
│   │   ├── logger.ts          # Logging utilities
│   │   └── performance-monitoring.ts # Performance monitoring
│   ├── types/                 # TypeScript type definitions
│   ├── hooks/                 # Custom React hooks
│   └── middleware.ts          # Next.js middleware
├── database/
│   └── schema.sql             # Database schema
├── public/                    # Static assets
└── docs/                      # Documentation
```

## Performance Optimizations

### Implemented Optimizations

1. **Caching Strategy**
   - Distributed caching using Vercel KV
   - Cache-aside pattern with TTL and stale-while-revalidate
   - Specific caching for products, categories, search results, and user carts
   - Cache invalidation mechanisms for data updates

2. **Database Query Optimization**
   - Optimized cart functionality to fetch only needed variants
   - Combined related data retrieval to reduce queries
   - Proper indexing strategies (see database/indexes.sql)

3. **Asset Optimization**
   - Image optimization with responsive loading
   - CSS and JavaScript minification
   - Resource hinting for performance
   - SVG optimization

4. **Performance Utilities**
   - Memoization for expensive computations
   - Debouncing and throttling for frequent operations
   - Virtual scrolling for large lists
   - Lazy loading for heavy components
   - Batch processing for database operations

5. **Performance Monitoring**
   - Comprehensive performance tracking
   - Response time and throughput monitoring
   - Error rate tracking
   - Database query performance monitoring

### Performance Monitoring Dashboard
A comprehensive dashboard is available in the admin panel to monitor:
- Response times and throughput
- Error rates and distribution
- System resource usage (CPU, memory)
- Database metrics
- Cache performance
- Service health status

## Security Measures

### Implemented Security Features

1. **Input Validation & Sanitization**
   - Comprehensive validation for all user inputs
   - XSS prevention through input sanitization
   - SQL injection detection patterns
   - Email and phone validation

2. **Authentication & Authorization**
   - Supabase Auth integration
   - JWT token-based authentication
   - Role-based access control
   - Session management

3. **CSRF Protection**
   - Token-based CSRF protection
   - Validation of requests
   - Automatic token generation and validation

4. **Rate Limiting**
   - Per-endpoint rate limiting
   - IP-based blocking
   - Account lockout mechanisms

5. **Security Headers**
   - X-Frame-Options to prevent clickjacking
   - X-Content-Type-Options to prevent MIME type sniffing
   - X-XSS-Protection for cross-site scripting protection
   - Strict-Transport-Security for HTTPS enforcement
   - Content-Security-Policy for resource loading control

6. **Password Security**
   - Secure password hashing
   - Password strength validation
   - Secure password verification

### Security Best Practices
- Never expose sensitive data in client-side code
- Use environment variables for API keys and secrets
- Implement proper error handling to avoid information disclosure
- Regular security audits and penetration testing

## Caching Strategy

### Cache Layers
1. **Application Level Caching**: Using Vercel KV for distributed caching
2. **CDN Caching**: For static assets and images
3. **Browser Caching**: For frequently accessed resources

### Cache Keys Convention
```
kn_bio_cache:{entity}:{identifier}:{parameters}
```
Example: `kn_bio_cache:products:segment:agriculture:limit:20`

### Cache Invalidation
- Automatic invalidation when data is updated
- Time-based expiration (TTL)
- Manual invalidation for critical updates

### Cacheable Entities
- Product listings by segment/category
- Individual product details
- User cart data
- Search results
- Category listings

## Monitoring & Analytics

### Performance Metrics Tracked
- Response time by service and endpoint
- Throughput (requests per minute)
- Error rates by service
- Database query performance
- Cache hit/miss ratios
- System resource usage (CPU, memory)

### Error Tracking
- Automatic error reporting
- Severity assessment
- Error correlation with user sessions
- Error resolution tracking

### Analytics Events
- Page views and user journeys
- Search queries and results
- Product interactions
- Conversion tracking
- User behavior analysis

## API Reference

### Product APIs
#### GET /api/products
Get all products with filtering and pagination
- Query Parameters:
  - `segment`: Filter by product segment
  - `category`: Filter by category
  - `limit`: Number of results (max 100)
  - `offset`: Offset for pagination
  - `sortBy`: Sort by field (name, price, created_at)
  - `sortOrder`: Sort order (asc, desc)

#### GET /api/products/:slug
Get product by slug
- Response: Product details with variants

#### GET /api/products/search?q={query}
Search products
- Query Parameters:
  - `q`: Search query
  - `segment`: Filter by segment
  - `minPrice`: Minimum price filter
  - `maxPrice`: Maximum price filter

### Cart APIs
#### GET /api/cart
Get user's cart
- Requires authentication
- Response: Cart items with product details

#### POST /api/cart/items
Add item to cart
- Body: `{ variantId: string, quantity: number }`
- Requires authentication

#### PATCH /api/cart/items/:itemId
Update cart item quantity
- Body: `{ quantity: number }`
- Requires authentication

#### DELETE /api/cart/items/:itemId
Remove item from cart
- Requires authentication

### Order APIs
#### GET /api/orders
Get user's orders
- Requires authentication
- Response: List of orders with status

#### POST /api/orders
Create new order
- Body: Order details
- Requires authentication

### Authentication APIs
#### POST /api/auth/login
User login
- Body: `{ email: string, password: string }`

#### POST /api/auth/register
User registration
- Body: `{ email: string, password: string, firstName: string, lastName: string, ... }`

#### POST /api/auth/logout
User logout
- Requires authentication

## Deployment Guide

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Hasura account (optional)
- Vercel account for deployment

### Environment Variables
Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Hasura GraphQL (Optional)
NEXT_PUBLIC_HASURA_URL=https://your-project.hasura.app/v1/graphql
NEXT_PUBLIC_HASURA_ADMIN_SECRET=your_hasura_admin_secret

# Payment Gateway Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

PAYU_MERCHANT_KEY=your_payu_merchant_key
PAYU_SALT=your_payu_salt

EASEBUZZ_KEY=your_easebuzz_key
EASEBUZZ_SALT=your_easebuzz_salt

# Shipping Configuration
DELHIVERY_API_KEY=your_delhivery_api_key
DELHIVERY_API_SECRET=your_delhivery_api_secret

# Zoho Integration
ZOHO_CLIENT_ID=your_zoho_client_id
ZOHO_CLIENT_SECRET=your_zoho_client_secret
ZOHO_REFRESH_TOKEN=your_zoho_refresh_token

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Security
SESSION_SECRET=your-super-secret-session-key-here
NEXTAUTH_SECRET=your-nextauth-secret-here

# Vercel KV (for caching)
KV_URL=your_kv_url
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
KV_PREVIEW_REST_API_URL=your_preview_kv_rest_api_url
KV_PREVIEW_REST_API_TOKEN=your_preview_kv_rest_api_token
```

### Build and Deploy
1. Install dependencies: `npm install`
2. Build the application: `npm run build`
3. Deploy to Vercel: `vercel --prod`

### Database Setup
1. Create a new Supabase project
2. Run the SQL schema from `database/schema.sql`
3. Enable Row Level Security (RLS) policies
4. Set up authentication providers

## Troubleshooting

### Common Issues

#### 1. Authentication Issues
- Ensure Supabase environment variables are correctly set
- Verify that authentication providers are enabled in Supabase dashboard
- Check that RLS policies are properly configured

#### 2. Database Connection Issues
- Verify Supabase URL and keys are correct
- Check that the database schema has been applied
- Ensure RLS policies are not too restrictive

#### 3. Performance Issues
- Monitor the performance dashboard for bottlenecks
- Check cache hit rates
- Review database query performance
- Optimize images and assets

#### 4. Payment Gateway Issues
- Verify payment gateway credentials are correct
- Check that webhook endpoints are accessible
- Ensure proper error handling for payment failures

### Debugging Tips
- Enable detailed logging in development
- Use the performance monitoring dashboard to identify bottlenecks
- Check browser console for client-side errors
- Monitor server logs for backend issues
- Use Supabase dashboard to monitor database performance

### Support
For additional support:
- Check the GitHub issues page
- Contact the development team
- Review the documentation
- Look at the example implementations in the codebase