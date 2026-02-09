# KN Biosciences E-commerce Platform - Optimized Edition

[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=kn-biosciences&metric=security_rating)](https://sonarcloud.io/dashboard?id=kn-biosciences)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=kn-biosciences&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=kn-biosciences)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=kn-biosciences&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=kn-biosciences)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=kn-biosciences&metric=ncloc)](https://sonarcloud.io/dashboard?id=kn-biosciences)

## Overview

This is the optimized edition of the KN Biosciences e-commerce platform - a comprehensive B2C/B2B e-commerce solution for agricultural and aquaculture products including bio-fertilizers and pre-probiotics. This platform serves both individual farmers (B2C) and business distributors (B2B) with a complete range of agricultural and aquaculture solutions.

## Key Improvements

### 🔐 Enhanced Security
- **Multi-layered Security**: Input validation, sanitization, CSRF protection, and rate limiting
- **Authentication Hardening**: Enhanced JWT validation and secure session management
- **SQL Injection Prevention**: Parameterized queries and input sanitization
- **Security Headers**: Comprehensive security headers implementation
- **Vulnerability Management**: Automated scanning and patch management

### ⚡ Performance Optimizations
- **Caching Strategy**: Distributed caching using Vercel KV with cache-aside pattern
- **Database Optimization**: Query optimization and connection pooling
- **Asset Optimization**: Image optimization with responsive loading
- **Performance Utilities**: Memoization, debouncing, and virtual scrolling
- **Bundle Optimization**: Tree-shaking and code splitting improvements

### 📊 Comprehensive Monitoring
- **Real-time Metrics**: Response time, throughput, error rates, and resource usage
- **Alerting System**: Automated alerts with severity levels and notification channels
- **Performance Dashboard**: Visual representation of key performance indicators
- **Health Checks**: Comprehensive system health monitoring
- **Audit Logging**: Detailed security and operational event logging

### 🛠️ Robust Operations
- **CI/CD Pipelines**: Automated testing, building, and deployment
- **Maintenance Procedures**: Daily, weekly, and monthly operational tasks
- **Incident Response**: Structured response procedures for security and operational incidents
- **Backup and Recovery**: Comprehensive backup strategies and recovery procedures
- **Change Management**: Controlled process for system modifications

### ♿ Accessibility Improvements
- **ARIA Labels**: Proper ARIA attributes for screen readers
- **Keyboard Navigation**: Full keyboard operability
- **Focus Management**: Proper focus handling and focus traps
- **Semantic HTML**: Proper heading hierarchy and semantic elements
- **Screen Reader Support**: Proper announcements and navigation

## Tech Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS with shadcn/ui components
- **Animations**: GSAP, Lottie, Framer Motion
- **State Management**: React Hooks, Apollo Client (GraphQL)

### Backend & Database
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth
- **API**: Hasura GraphQL Engine
- **File Storage**: Supabase Storage

### Integrations
- **Payment Gateways**: Razorpay, PayU, Easebuzz
- **Shipping**: Delhivery API
- **CRM/Accounting**: Zoho CRM and Books
- **Email**: Nodemailer with SMTP

## Project Structure

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
│   │   ├── security-enhancements.ts # Security utilities
│   │   ├── monitoring-system.ts # Monitoring utilities
│   │   └── accessibility.tsx  # Accessibility utilities
│   ├── types/                 # TypeScript type definitions
│   │   ├── index.ts           # Main types
│   │   └── database.ts        # Database types
│   ├── hooks/                 # Custom React hooks
│   └── middleware.ts          # Next.js middleware
├── database/
│   └── schema.sql             # Database schema
├── docs/                      # Documentation
│   ├── security-procedures.md # Security procedures
│   ├── testing-strategy.md    # Testing strategy
│   ├── maintenance-procedures.md # Maintenance procedures
│   ├── ci-cd-best-practices.md # CI/CD best practices
│   ├── backup-recovery-procedures.md # Backup & recovery procedures
│   └── optimization-summary.md # Complete optimization summary
├── public/                    # Static assets
└── scripts/                   # Build and deployment scripts
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Hasura account (optional, for GraphQL)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kn-biosciences
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

The application requires several environment variables for proper operation:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Hasura GraphQL (Optional)
NEXT_PUBLIC_HASURA_URL=your_hasura_url
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
KV_URL=redis://localhost:6379
KV_REST_API_URL=http://localhost:6379
KV_REST_API_TOKEN=your_redis_token
```

## Key Features

### 🛍️ Unified Sales Channels
- **B2C Storefront**: Retail purchases with dynamic catalog
- **B2B Portal**: Bulk orders with approval workflow and wholesale pricing
- **Admin Dashboard**: Complete management interface

### 📦 Product Management
- **Variant System**: Weight (g/kg/ml), Packing (Box/Drum/Bag), Form (Powder/Liquid/Granules)
- **Batch Tracking**: Lot number, expiry date management
- **Inventory Management**: Stock levels, low stock alerts, traceability

### 🧭 Navigation Structure
- **Main Navigation**: Home, About Us, Knowledge Center, Contact, Shop
- **Shop By Segment**: Agriculture, Aquaculture, Poultry Healthcare, Animal Healthcare, Bioremediation, Seeds, Organic Farming, Farm Equipment, Testing Lab, Oilpalm
- **Landing Pages**: Segment-specific and crop-specific landing pages

### 💼 Operations & Integrations
- **Zoho Integration**: Customer sync, invoicing
- **Shipping**: Multiple carrier support with tracking
- **Payments**: Multi-gateway support with secure processing

### 📈 Marketing & Engagement
- **Discounts & Coupons**: Flexible promotion system
- **Wishlist**: Save favorite products
- **Abandoned Cart Recovery**: Automated recovery emails
- **Blog/Knowledge Center**: Content marketing hub
- **WhatsApp Integration**: Customer support and notifications

## Security Features

### Authentication & Authorization
- Supabase Auth integration
- JWT token-based authentication
- Row Level Security (RLS)
- Protected API routes
- Secure payment processing

### Security Measures
- Input validation and sanitization
- CSRF protection
- Rate limiting
- SQL injection prevention
- XSS protection
- Security headers
- Regular security audits

### User Roles
- **customer**: Individual B2C shoppers
- **b2b_client**: Business customers with wholesale pricing
- **admin**: Full administrative access
- **staff**: Limited administrative access

## Performance Optimizations

### Caching Strategy
- Distributed caching using Vercel KV
- Cache-aside pattern with TTL and stale-while-revalidate
- Specific caching for products, categories, search results, and user carts
- Cache invalidation mechanisms for data updates

### Database Optimizations
- Comprehensive indexing for performance
- Query optimization
- Connection pooling
- Caching strategies

### Asset Optimizations
- Image optimization with responsive loading
- Bundle size analysis
- Code splitting
- Resource hinting

## Monitoring & Analytics

### Performance Metrics
- Response time tracking
- Throughput monitoring
- Error rate analysis
- Database query performance
- Cache hit/miss ratios
- System resource usage

### Alerting System
- Automated alerts with severity levels
- Email and webhook notifications
- Performance threshold monitoring
- Error rate tracking
- System health monitoring

## Testing Strategy

### Test Types
- Unit tests for components and utilities
- Integration tests for API routes and database interactions
- End-to-end tests for critical user journeys
- Performance tests for load and stress scenarios
- Security tests for vulnerabilities
- Accessibility tests for WCAG compliance

### Quality Gates
- Test coverage minimum of 80%
- All tests must pass before merging
- Performance benchmarks met
- Security scans clear

## Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Docker
```bash
docker build -t kn-biosciences .
docker run -p 3000:3000 kn-biosciences
```

### Environment Variables
Ensure all required environment variables are set in your deployment environment.

## Development Guidelines

### Code Style
- TypeScript for type safety (strict mode enabled)
- ESLint for code quality
- Prettier for formatting
- Conventional commits
- Google Style Guide naming conventions

### Component Guidelines
- Reusable UI components
- Proper TypeScript typing
- Accessibility compliance
- Mobile-responsive design
- Prefer functional components

### Git Workflow
- Feature branches
- Pull requests
- Code reviews
- Automated testing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For support and questions:
- Documentation: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Optimization Summary

This optimized edition of the KN Biosciences platform includes comprehensive improvements across security, performance, maintainability, and operations. The platform now features:

- **Enhanced Security**: Multiple layers of security controls including input validation, authentication hardening, and monitoring
- **Improved Performance**: Significant performance gains through caching, optimization, and efficient resource usage
- **Robust Operations**: Well-defined procedures for maintenance, incident response, and system management
- **Better Maintainability**: Improved architecture, documentation, and code quality
- **Compliance Ready**: Framework for regulatory compliance and security standards

The platform is now well-positioned to handle increased traffic, protect against security threats, and provide an excellent user experience while maintaining high standards of data protection and operational excellence.