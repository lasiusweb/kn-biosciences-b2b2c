# AGENTS.md - Development Guidelines for KN Biosciences

This file provides comprehensive guidance for agentic coding agents working in the KN Biosciences e-commerce platform repository.

## Development Commands

### Core Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build with optimization
npm run start        # Start production server
npm run lint         # ESLint code quality check
npm run type-check   # TypeScript type checking without emit
```

### Testing Commands

```bash
# Note: Testing framework detected but test runner not configured
# Recommended setup: Add Jest or Vitest configuration
npm test             # Run all tests (when configured)
npm test -- --testPathPattern=button.test.tsx  # Run single test
npm run test:watch   # Watch mode during development
```

### Pre-commit Validation

Always run before committing:

```bash
npm run lint         # Ensure code quality
npm run type-check   # Ensure type safety
```

## Project Architecture

### Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **GraphQL**: Hasura (optional)
- **Animations**: GSAP for complex animations
- **Icons**: Lucide React

### Path Aliases

```typescript
@/* → ./src/*
```

Examples:

- `@/components/ui/button` → `src/components/ui/button`
- `@/lib/supabase` → `src/lib/supabase`
- `@/types/index` → `src/types/index`

## Code Style Guidelines

### Import Organization

```typescript
// 1. React/Next.js imports
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

// 2. Third-party libraries
import { Button } from "@/components/ui/button";
import { Search, Menu, ShoppingCart, User } from "lucide-react";
import { gsap } from "gsap";

// 3. Internal imports (path aliases)
import { User, Product, Order } from "@/types";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
```

### Component Patterns

#### Function Component Structure

```typescript
'use client' // Add for client-side interactivity

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ComponentProps {
  // Define props with TypeScript
  title: string
  variant?: 'default' | 'secondary'
  className?: string
  children?: React.ReactNode
}

export const ComponentName = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ title, variant = 'default', className, children, ...props }, ref) => {
    // Component logic here

    return (
      <div ref={ref} className={cn('base-styles', className)} {...props}>
        {title}
        {children}
      </div>
    )
  }
)

ComponentName.displayName = 'ComponentName'
```

#### shadcn/ui Component Pattern

```typescript
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
```

### Styling Conventions

#### Tailwind CSS Usage

```typescript
// Use semantic class names with Tailwind utilities
<div className="flex items-center justify-between p-4 bg-white shadow-sm border-b">

// Custom brand colors (from tailwind.config.js)
<button className="bg-organic-500 hover:bg-organic-600 text-white px-4 py-2 rounded-md">
  Primary Action
</button>

<div className="text-earth-800 font-medium">
  Secondary text
</div>
```

#### Brand Colors

```typescript
// Primary brand colors
'organic-500': '#8BC34A'    // Primary green
'earth-500': '#795548'      // Secondary brown

// Use semantic color scales
bg-organic-50 hover:bg-organic-100  // Light backgrounds
text-organic-600 hover:text-organic-700  // Text colors
```

#### Responsive Design

```typescript
// Mobile-first approach
<div className="container mx-auto px-4">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Content */}
  </div>
</div>

// Breakpoints
// sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
```

### TypeScript Standards

#### Interface Definitions

```typescript
// Use interfaces for object shapes
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: "customer" | "b2b_client" | "admin" | "staff";
  created_at: string;
  updated_at: string;
}

// Use generics for utility functions
export function createApiResult<T>(data: T, success: boolean = true) {
  return { data, success, timestamp: new Date().toISOString() };
}
```

#### Type Safety Rules

- No `any` types - use proper typing
- Use `unknown` instead of `any` when type is uncertain
- Prefer interface over type for object shapes
- Use proper generic typing
- Always type function parameters and return values

## File Organization

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   ├── globals.css        # Global styles
│   ├── (auth)/            # Authentication routes
│   ├── admin/             # Admin dashboard
│   ├── b2b/               # B2B portal
│   ├── shop/              # E-commerce store
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui base components
│   ├── layout/            # Header, Footer, Navigation
│   ├── auth/              # Authentication components
│   ├── admin/             # Admin dashboard components
│   ├── b2b/               # B2B portal components
│   ├── home/              # Homepage components
│   └── shop/              # E-commerce components
├── lib/
│   ├── supabase.ts        # Supabase client configuration
│   ├── apollo.ts          # Apollo GraphQL client
│   ├── utils.ts           # Utility functions (cn helper)
│   └── utils/             # Additional utility modules
├── types/
│   ├── index.ts           # Main type definitions
│   └── database.ts        # Database schema types
└── hooks/                 # Custom React hooks
```

### Component Organization

- Group components by feature/domain
- Keep UI components separate from business logic
- Use index files for clean imports
- Follow consistent naming conventions

## Key Development Patterns

### Authentication Pattern

```typescript
import { supabase } from "@/lib/supabase";
import { User } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
    .from("products")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }

  return data || [];
}
```

### Error Handling Pattern

```typescript
export async function apiCall<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw new Error(`Failed to fetch data. Please try again.`);
  }
}
```

### GSAP Animation Pattern

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function AnimatedComponent() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.animate-element', {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'power3.out'
      })
    }, containerRef)

    return () => ctx.revert() // Cleanup
  }, [])

  return (
    <div ref={containerRef}>
      <div className="animate-element">
        Animated content
      </div>
    </div>
  )
}
```

## Critical Setup Requirements

### Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_HASURA_URL=your_hasura_url
NEXT_PUBLIC_HASURA_ADMIN_SECRET=your_hasura_admin_secret
```

### Database Setup

1. Create Supabase project
2. Run schema from `database/schema.sql`
3. Enable Row Level Security (RLS)
4. Set up authentication providers

### Testing Setup (Recommended)

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev @types/jest
```

Create `jest.config.js`:

```javascript
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};

module.exports = createJestConfig(customJestConfig);
```

## Development Workflow

### Before Committing

1. Run `npm run lint` - fix any linting errors
2. Run `npm run type-check` - ensure type safety
3. Test your changes manually
4. Update documentation if needed

### Code Review Checklist

- [ ] TypeScript types are correct
- [ ] Components follow established patterns
- [ ] Responsive design implemented
- [ ] Error handling is proper
- [ ] Accessibility considerations met
- [ ] Performance optimizations applied

### Best Practices

- Use semantic HTML elements
- Implement proper loading states
- Add accessibility attributes (ARIA labels)
- Optimize images with Next.js Image component
- Use React.memo for expensive components
- Implement proper cleanup in useEffect

---

This AGENTS.md file provides comprehensive guidance for development in the KN Biosciences codebase. Follow these patterns and conventions to maintain code quality and consistency across the project.
