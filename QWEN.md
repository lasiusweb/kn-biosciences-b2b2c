# KN Biosciences E-commerce Platform - Development Context

## Project Overview

KN Biosciences is a comprehensive B2C/B2B e-commerce platform for agricultural and aquaculture products including bio-fertilizers and pre-probiotics. Built with Next.js, React, TypeScript, and Tailwind CSS, it serves both individual farmers (B2C) and business distributors (B2B) with a complete range of agricultural and aquaculture solutions.

### Tech Stack
- **Framework**: Next.js 16 with App Router (Next.js 14+)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Animations**: GSAP, Lottie, Framer Motion
- **State Management**: React Hooks, Apollo Client (GraphQL)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Hasura GraphQL Engine
- **File Storage**: Supabase Storage
- **Integrations**: Razorpay, PayU, Easebuzz (payments), Delhivery (shipping), Zoho CRM/Books
- **Icons**: Lucide React
- **Testing**: Jest + React Testing Library

### Key Features
- Unified B2C/B2B sales channels
- Advanced product management with variants (weight, packing, form)
- Batch tracking with lot numbers and expiry dates
- Inventory management with low stock alerts
- Segment-specific navigation (Agriculture, Aquaculture, Poultry Healthcare, etc.)
- Zoho CRM/Books integration
- Multi-carrier shipping support
- Flexible discount and coupon system
- Wishlist and abandoned cart recovery
- Knowledge center/blog functionality
- Advanced search with faceted navigation
- AI-powered recommendations
- SEO-optimized product pages with structured data
- Product comparison functionality
- Comprehensive analytics and tracking

## Project Structure

```
kn-biosciences/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication routes
│   │   ├── admin/             # Admin dashboard
│   │   ├── b2b/               # B2B portal
│   │   ├── shop/              # E-commerce store
│   │   ├── (knowledge)/       # Knowledge center
│   │   ├── (legal)/           # Legal pages
│   │   ├── (shop)/            # Shop-specific routes
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
│   │   └── enhanced-product-service.ts # Extended product service
│   ├── types/                 # TypeScript type definitions
│   │   ├── index.ts           # Main types
│   │   └── database.ts        # Database types
│   ├── hooks/                 # Custom React hooks
│   ├── utils/                 # Utility functions
│   └── middleware.ts          # Next.js middleware
├── database/
│   └── schema.sql             # Database schema
├── public/                    # Static assets
├── docs/                      # Documentation
├── __tests__                  # Test files
└── scripts/                   # Build and deployment scripts
```

## Building and Running

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Hasura account (optional, for GraphQL)

### Installation Steps
1. Clone and install dependencies:
```bash
npm install
```

2. Create a `.env.local` file with the required environment variables (see `.env.example`)

3. Set up Supabase project and run the database schema from `database/schema.sql`

4. Run the development server:
```bash
npm run dev
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:integration` - Run integration tests
- `npm run test:e2e` - Run end-to-end tests with Playwright
- `npm run test:coverage` - Generate coverage reports
- `npm run test:ci` - Run tests in CI mode
- `npm run migrate` - Push database migrations
- `npm run migrate:reset` - Reset database
- `npm run seed` - Seed database with sample data
- `npm run type-check` - Run TypeScript type checking
- `npm run security:audit` - Run security vulnerability check
- `npm run analyze` - Bundle size analysis
- `npm run performance:lighthouse` - Lighthouse performance audits

## Database Schema

The database uses PostgreSQL with Supabase and includes tables for:
- Users and authentication with role-based access
- Product catalog with categories, variants, and batch tracking
- Shopping cart and wishlist functionality
- Order management with status tracking
- B2B quote system
- Address management
- Coupons and promotions
- Blog and content management
- Zoho integration tables
- Analytics and recommendation systems
- Search analytics
- Product interactions
- Page views
- Conversions

The schema implements Row Level Security (RLS) for data protection and includes comprehensive indexing for performance.

## Architecture

```
Next.js Frontend → Hasura GraphQL → Supabase Database
                    ↓
Next.js Frontend → Supabase Auth
                    ↓
Hasura → Zoho CRM/Books, Payment Gateways, Shipping APIs
```

## Development Guidelines

### Code Style
- TypeScript for type safety (strict mode enabled)
- ESLint for code quality (currently disabled in config)
- Prettier for formatting
- Conventional commits
- Google Style Guide naming conventions:
  - Classes/Interfaces/Types: `UpperCamelCase`
  - Functions/Variables/Properties: `lowerCamelCase`
  - Constants: `CONSTANT_CASE`
  - Files: `kebab-case-with-dashes.js` or `snake_case_with_underscores.js`

### Path Aliases
- Use `@/*` to reference the `src/` directory (e.g., `@/components/ui/button`)

### Component Guidelines
- Reusable UI components
- Proper TypeScript typing
- Accessibility compliance
- Mobile-responsive design
- Prefer functional components
- Use `React.forwardRef` for reusable UI components
- Follow shadcn/ui patterns

### Import Organization
```typescript
// 1. React/Next.js imports
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

// 2. Third-party libraries
import { Button } from "@/components/ui/button";
import { Search, Menu, ShoppingCart, User } from "lucide-react";
import { gsap } from "gsap";

// 3. Internal imports (path aliases)
import { User, Product, Order } from "@/types";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
```

### Git Workflow
- Feature branches
- Pull requests
- Code reviews
- Automated testing

## Key Technologies Used

### Frontend
- **Next.js 16**: Framework with App Router
- **React 19**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling framework
- **shadcn/ui**: Pre-built accessible components
- **Lucide React**: Icon library
- **Apollo Client**: GraphQL state management
- **GSAP/Lottie/Framer Motion**: Animation libraries

### Backend & Database
- **Supabase**: Backend-as-a-Service with PostgreSQL
- **Hasura**: GraphQL engine
- **Row Level Security**: Fine-grained access control

### Integrations
- **Payment Gateways**: Razorpay, PayU, Easebuzz
- **Shipping**: Delhivery API
- **CRM/Accounting**: Zoho CRM and Books
- **Email**: Nodemailer with SMTP

### Search & SEO
- **Advanced Search API**: Complex search with multiple filters
- **AI-Powered Recommendations**: Content-based, collaborative filtering
- **SEO Optimization**: Dynamic metadata, structured data (JSON-LD)
- **Faceted Search Navigation**: Filter components with real-time counts
- **Product Comparison**: Side-by-side product analysis

## Testing Strategy

- Unit tests with Jest
- Integration tests
- End-to-end tests with Playwright
- Database testing scripts
- React Testing Library for component testing
- Mocking for external services

## Performance Optimization

- Next.js automatic code splitting
- Image optimization with next/image
- Font optimization
- Static generation where possible
- Database query optimization
- Caching strategies
- Lazy loading components
- Bundle size analysis
- Core Web Vitals optimization

## Security Features

- Supabase Auth integration
- JWT token-based authentication
- Row Level Security (RLS)
- Protected API routes
- Secure payment processing
- Input validation and sanitization
- HTTPS enforcement
- GDPR compliance

## Responsive Design

- Mobile-first approach
- Responsive breakpoints:
  - Mobile: 320px - 768px
  - Tablet: 768px - 1024px
  - Desktop: 1024px - 1280px
  - Large Desktop: 1280px+
- Touch-friendly interfaces
- Optimized navigation
- Progressive enhancement

## Brand Identity

### Color Palette
- **Primary**: Organic Green (`#8BC34A`)
- **Secondary**: Earth Brown (`#795548`)
- **Background**: Beige (`#F5F5DC`)
- **Font**: Montserrat sans-serif

### Voice & Tone
- Professional, trustworthy, expert
- Natural, informative, educational

## Deployment

- Recommended: Vercel
- Alternative: Docker deployment
- Environment variables required for production
- CI/CD pipelines ready

## Specialized Features

### Enhanced Product Service
- Segment-specific product fetching
- Crop-specific product discovery
- Knowledge Center integration
- Advanced search capabilities
- Comprehensive filtering and pagination

### AI-Powered Recommendations
- Content-based similarity matching
- Collaborative filtering
- Trending products analysis
- Personalized recommendations based on user behavior
- Cross-sell and up-sell suggestions

### Analytics & Tracking
- Comprehensive events: Page views, searches, interactions, conversions
- Real-time processing: Event pipeline for analytics
- Multiple report types: Search, product performance, user behavior
- Database storage: Optimized for large-scale analytics
- Dashboard integration: Analytics admin dashboard

### Search & SEO Enhancement
- Advanced search API with complex filters
- Real-time search with loading states
- Search suggestions and auto-complete
- Dynamic SEO metadata generation
- JSON-LD structured data for enhanced visibility
- Open Graph and Twitter Card optimization
- Breadcrumbs and navigation trails
- FAQ schemas and review schema markup