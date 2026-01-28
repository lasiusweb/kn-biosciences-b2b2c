# GEMINI.md - KN Biosciences E-commerce Platform

This file serves as the primary instructional context for AI agents working on the KN Biosciences project.

## Project Overview

KN Biosciences is a comprehensive B2C/B2B e-commerce platform specializing in agricultural and aquaculture products (bio-fertilizers, pre-probiotics, etc.). It provides a unified sales channel for retail customers and wholesale distributors.

### Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **API:** Hasura GraphQL + Supabase Client
- **Authentication:** Supabase Auth
- **Animations:** GSAP, Lottie, Framer Motion
- **Testing:** Jest + React Testing Library

## Architecture

The project follows a modern serverless architecture:
- **Frontend:** Next.js App Router for server-side rendering and client-side interactivity.
- **Backend-as-a-Service:** Supabase for database, authentication, and file storage.
- **API Layer:** Hasura GraphQL provides a high-performance data access layer over Supabase.
- **Integrations:** Zoho CRM/Books for business operations, multiple payment gateways (Razorpay, PayU), and shipping APIs (Delhivery).

## Project Structure

```text
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── (auth)/            # Auth-related routes
│   ├── admin/             # Administrative dashboard
│   ├── b2b/               # Business-to-business portal
│   ├── shop/              # Retail storefront
│   └── api/               # Server-side API endpoints
├── components/            # React components
│   ├── ui/                # Base UI components (shadcn/ui)
│   ├── layout/            # Global layout components (Header, Footer)
│   ├── home/              # Homepage-specific components
│   └── ...                # Feature-specific components
├── lib/                   # Utility libraries & configurations
│   ├── supabase.ts        # Supabase client initialization
│   ├── apollo.ts          # Apollo Client configuration
│   └── utils.ts           # Shared utility functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript interfaces and definitions
│   ├── index.ts           # Core application types
│   └── database.ts        # Database schema types
└── utils/                 # General utility modules
database/
└── schema.sql             # SQL schema for Supabase/PostgreSQL
```

## Development Conventions

### Coding Standards
- **TypeScript:** Always use explicit types; avoid `any`. Use interfaces for object shapes.
- **Components:** Prefer functional components. Use `React.forwardRef` for reusable UI components.
- **Path Aliases:** Use `@/` to reference the `src/` directory (e.g., `@/components/ui/button`).
- **Imports:** Group imports by React/Next.js, third-party libraries, and internal modules.
- **Styling:** Use Tailwind CSS utility classes. Follow the brand color palette defined in `tailwind.config.js`.

### Brand Colors
- **Primary:** Organic Green (`#8BC34A`)
- **Secondary:** Earth Brown (`#795548`)
- **Background:** Beige (`#F5F5DC`)

### Animations
- Use GSAP for complex sequence-based animations.
- Use Framer Motion for simple layout transitions.
- Ensure all client-side animations are cleaned up in `useEffect` or `gsap.context()`.

## Building and Running

### Development
```bash
npm run dev          # Starts the development server at http://localhost:3000
```

### Quality Assurance
```bash
npm run lint         # Runs ESLint (currently set to echo in package.json)
npm run type-check   # Runs TypeScript compiler check without emitting files
npm run test         # Executes Jest tests
```

### Production
```bash
npm run build        # Generates an optimized production build
npm run start        # Starts the production server
```

## Critical Files
- `AGENTS.md`: Detailed development guidelines for AI agents.
- `IMPLEMENTATION_SUMMARY.md`: Current status of implemented features.
- `src/lib/supabase.ts`: Supabase client configuration.
- `src/types/index.ts`: Centralized type definitions.
- `database/schema.sql`: Source of truth for the database structure.

## Deployment
Recommended deployment platform is **Vercel**, integrated with Supabase and Hasura environment variables.
