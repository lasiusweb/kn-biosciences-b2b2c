# KN Biosciences E-commerce Platform

A comprehensive B2C/B2B e-commerce platform for agricultural and aquaculture products including bio-fertilizers and pre-probiotics.

## 🌱 Project Overview

KN Biosciences is a modern e-commerce platform built with Next.js, React, TypeScript, and Tailwind CSS. It serves both individual farmers (B2C) and business distributors (B2B) with a complete range of agricultural and aquaculture solutions.

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Animations**: GSAP, Lottie, Framer Motion
- **State Management**: React Hooks, Apollo Client (GraphQL)

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Hasura GraphQL Engine
- **File Storage**: Supabase Storage

### Integrations
- **Payments**: Razorpay, PayU, Easebuzz
- **Shipping**: Delhivery API
- **CRM**: Zoho CRM
- **Accounting**: Zoho Books

## 📦 Features

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

## 🎨 Design Specifications

### Visual Identity
- **Voice**: Professional, trustworthy, expert
- **Colors**: 
  - Primary: Organic Green (#8BC34A)
  - Secondary: Earth Brown (#795548)
  - Background: Beige (#F5F5DC)
- **Typography**: Montserrat sans-serif
- **Layout**: Three-column dashboards, grid galleries, hero sections

### Animations
- **Libraries**: GSAP for complex animations, Lottie for illustrated animations
- **Effects**: Scale, rotate, translate transitions
- **Interactions**: Hover states, loading animations, micro-interactions

## 🏗️ Architecture

```
Next.js Frontend → Hasura GraphQL → Supabase Database
                    ↓
Next.js Frontend → Supabase Auth
                    ↓
Hasura → Zoho CRM/Books, Payment Gateways, Shipping APIs
```

## 📁 Project Structure

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
│   │   └── utils.ts           # Helper functions
│   ├── types/                 # TypeScript type definitions
│   │   ├── index.ts           # Main types
│   │   └── database.ts        # Database types
│   └── hooks/                 # Custom React hooks
├── database/
│   └── schema.sql             # Database schema
├── public/                    # Static assets
└── docs/                      # Documentation
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Hasura account (optional, for GraphQL)

### 1. Clone and Install
```bash
git clone <repository-url>
cd kn-biosciences
npm install
```

### 2. Environment Setup
Create a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Hasura (optional)
NEXT_PUBLIC_HASURA_URL=your_hasura_url
NEXT_PUBLIC_HASURA_ADMIN_SECRET=your_hasura_admin_secret

# Payment Gateways
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
PAYU_MERCHANT_KEY=your_payu_merchant_key
PAYU_SALT=your_payu_salt

# Shipping
DELHIVERY_API_KEY=your_delhivery_api_key
DELHIVERY_API_SECRET=your_delhivery_api_secret

# Zoho Integration
ZOHO_CLIENT_ID=your_zoho_client_id
ZOHO_CLIENT_SECRET=your_zoho_client_secret
ZOHO_REFRESH_TOKEN=your_zoho_refresh_token

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup
1. Create a new Supabase project
2. Run the SQL schema from `database/schema.sql`
3. Enable Row Level Security (RLS) policies
4. Set up authentication providers

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

### Core Tables
- **users**: Customer and user management
- **products**: Product catalog
- **product_variants**: Product variants with pricing
- **product_batches**: Batch tracking and expiry
- **orders**: Order management
- **b2b_quotes**: B2B quote requests
- **carts/cart_items**: Shopping cart functionality
- **addresses**: Customer addresses
- **coupons**: Discount and promotion management

### Features
- Row Level Security (RLS) for data protection
- Automatic timestamps with triggers
- Comprehensive indexing for performance
- JSON fields for flexible data storage

## 🔐 Authentication & Authorization

### User Roles
- **customer**: Individual B2C shoppers
- **b2b_client**: Business customers with wholesale pricing
- **admin**: Full administrative access
- **staff**: Limited administrative access

### Security Features
- Supabase Auth integration
- JWT token-based authentication
- Row Level Security (RLS)
- Protected API routes
- Secure payment processing

## 📱 Responsive Design

### Breakpoints
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px - 1280px
- Large Desktop: 1280px+

### Mobile-First Approach
- Touch-friendly interfaces
- Optimized navigation
- Progressive enhancement
- Performance optimization

## 🚀 Deployment

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
Ensure all environment variables are set in your hosting platform.

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## 📊 Performance Optimization

### Next.js Optimizations
- Automatic code splitting
- Image optimization with next/image
- Font optimization
- Static generation where possible

### Database Optimizations
- Comprehensive indexing
- Query optimization
- Connection pooling
- Caching strategies

## 🔧 Development Guidelines

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits

### Component Guidelines
- Reusable UI components
- Proper TypeScript typing
- Accessibility compliance
- Mobile-responsive design

### Git Workflow
- Feature branches
- Pull requests
- Code reviews
- Automated testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Email: info@knbiosciences.com
- Phone: 1800-XXX-XXXX
- Documentation: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

## 🌟 Future Roadmap

### Phase 1: Core Platform ✅
- [x] Basic e-commerce functionality
- [x] User authentication
- [x] Product catalog
- [x] Shopping cart
- [x] Order management

### Phase 2: Advanced Features
- [ ] B2B portal with quote management
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-vendor marketplace
- [ ] AI-powered recommendations

### Phase 3: Scale & Optimization
- [ ] Microservices architecture
- [ ] Advanced caching strategies
- [ ] CDN implementation
- [ ] Load balancing
- [ ] International expansion

---

Built with ❤️ for sustainable agriculture and aquaculture.