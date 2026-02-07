# AGENTS.md - Development Guidelines for KN Biosciences

This file provides comprehensive guidance for agentic coding agents working in the KN Biosciences e-commerce platform repository.

## Essential Commands

### Core Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build with optimization
npm run start        # Start production server
```

### Testing (Jest + React Testing Library)
```bash
npm test             # Run all tests
npm test -- --testPathPattern=button.test.tsx  # Run single test file
npm run test:watch   # Watch mode during development
npm run test:integration # Integration tests
npm run test:e2e     # End-to-end tests with Playwright
npm run test:coverage   # Coverage reports
npm run test:ci       # CI mode (no watch)
```

### Database & Operations
```bash
npm run migrate      # Supabase database push
npm run migrate:reset # Supabase database reset  
npm run seed         # Database seeding
```

### Code Quality & Analysis
```bash
npm run lint         # Currently disabled - recommend enabling with npx eslint .
npm run type-check   # TypeScript type checking without emit
npm run security:audit # Security vulnerability check
npm run analyze      # Bundle size analysis
npm run performance:lighthouse # Lighthouse performance audits
```

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode enabled)  
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL) with Auth
- **Testing**: Jest + React Testing Library
- **Icons**: Lucide React
- **Animations**: GSAP

**Path Aliases**: `@/*` → `./src/*`

## Key Configuration Files

- **TypeScript**: `tsconfig.json` with strict mode enabled
- **ESLint**: Currently disabled (see `eslint.config.js`)  
- **Jest**: Configured with Next.js integration and module aliases
- **Testing Setup**: `jest.setup.js` for React Testing Library
- **Tailwind**: Configured with custom brand colors and shadcn/ui

## Code Style Guidelines

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

### Naming Conventions (Google Style Guide)
- **Classes/Interfaces/Types**: `UpperCamelCase`
- **Functions/Variables/Properties**: `lowerCamelCase` 
- **Constants**: `CONSTANT_CASE`
- **Files**: `kebab-case-with-dashes.js` or `snake_case_with_underscores.js`
- **No underscores** for private properties (use `private` keyword)
- **Prefer named exports** over default exports

### Component Pattern
```typescript
'use client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
interface ComponentProps {
  title: string; variant?: 'default' | 'secondary'; className?: string; children?: React.ReactNode;
}
export const ComponentName = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ title, variant = 'default', className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('base-styles', className)} {...props}>
        {title}{children}
      </div>
    )
  }
)
ComponentName.displayName = 'ComponentName'
```

### TypeScript Standards
```typescript
export interface User {
  id: string; email: string; first_name: string; last_name: string;
  phone?: string; role: "customer" | "b2b_client" | "admin" | "staff";
  created_at: string; updated_at: string;
}
export function createApiResult<T>(data: T, success: boolean = true) {
  return { data, success, timestamp: new Date().toISOString() };
}
// Type safety rules: No any types, use unknown instead, prefer interface over type
```

### File Naming Patterns
- **Components**: `kebab-case.tsx` (e.g., `payment-gateway-manager.tsx`)
- **Utilities**: `kebab-case.ts` (e.g., `import-parser.ts`)
- **Tests**: `component-name.test.tsx` or `service-name.test.ts`
- **Types**: Organized in `src/types/` with domain-specific files

### File Naming Patterns
- **Components**: `kebab-case.tsx` (e.g., `payment-gateway-manager.tsx`)
- **Utilities**: `kebab-case.ts` (e.g., `import-parser.ts`)
- **Tests**: `component-name.test.tsx` or `service-name.test.ts`
- **Types**: Organized in `src/types/` with domain-specific files

### Styling Conventions
```typescript
// Custom brand colors
<button className="bg-organic-500 hover:bg-organic-600 text-white px-4 py-2 rounded-md">Primary Action</button>
<div className="text-earth-800 font-medium">Secondary text</div>
// Mobile-first responsive design
<div className="container mx-auto px-4">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{/* Content */}</div>
</div>
```

## Key Development Patterns

### Authentication Hook
```typescript
import { supabase } from "@/lib/supabase";
import { User } from "@/types";
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null); setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  return { user, loading };
}
```

### Data Fetching Pattern
```typescript
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products").select("*").eq("status", "active")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
  return data || [];
}
```

### Error Handling & Animation Patterns
```typescript
// Error Handling
export async function apiCall<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw new Error(`Failed to fetch data. Please try again.`);
  }
}

// GSAP Animation Pattern
'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
export function AnimatedComponent() {
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.animate-element', { opacity: 0, y: 30, duration: 1, ease: 'power3.out' })
    }, containerRef)
    return () => ctx.revert()
  }, [])
  return (
    <div ref={containerRef}>
      <div className="animate-element">Animated content</div>
    </div>
  )
}
```

## Before Committing

1. **Run validation**: `npm run type-check` (and `npm run lint` when enabled)
2. **Test your changes**: Run relevant test files with `npm test -- --testPathPattern=...`
3. **Manual testing**: Test in development server `npm run dev`
4. **Performance**: Check bundle size with `npm run analyze` if needed

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── ui/                # shadcn/ui base components
│   ├── layout/            # Header, Footer, Navigation  
│   ├── auth/              # Authentication components
│   ├── admin/             # Admin dashboard components
│   ├── b2b/               # B2B portal components
│   ├── home/              # Homepage components
│   └── shop/              # E-commerce components
├── lib/                   # Utilities and configurations
├── types/                 # TypeScript type definitions
└── hooks/                 # Custom React hooks
```

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── ui/                # shadcn/ui base components
│   ├── layout/            # Header, Footer, Navigation  
│   ├── auth/              # Authentication components
│   ├── admin/             # Admin dashboard components
│   ├── b2b/               # B2B portal components
│   ├── home/              # Homepage components
│   └── shop/              # E-commerce components
├── lib/                   # Utilities and configurations
├── types/                 # TypeScript type definitions
└── hooks/                 # Custom React hooks
```

---

This AGENTS.md file provides essential guidance for development in the KN Biosciences codebase. Follow these patterns and conventions to maintain code quality and consistency across the project.