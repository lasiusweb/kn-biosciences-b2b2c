# Implementation Plan - Storefront Core and Product Catalog

## Phase 1: Data Model & API Setup
- [x] Task: Define and verify Supabase types for Products and Categories [15e65bd]
    - [ ] Create TypeScript interfaces matching the database schema
    - [ ] Write unit tests to verify data parsing/validation
- [ ] Task: Implement Product Data Fetching Service
    - [ ] Write tests for `getProducts`, `getProductsBySegment`, and `getProductBySlug`
    - [ ] Implement the services using Supabase client
- [ ] Task: Conductor - User Manual Verification 'Data Model & API Setup' (Protocol in workflow.md)

## Phase 2: Core Storefront Components
- [ ] Task: Implement ProductCard Component
    - [ ] Write unit tests for rendering and price display logic
    - [ ] Implement component with Tailwind and Mint Green accents
- [ ] Task: Implement ProductGrid Component
    - [ ] Write tests for responsive layout and empty states
    - [ ] Implement component with performance optimizations (Next.js Image)
- [ ] Task: Implement ProductFilters Component
    - [ ] Write tests for filter selection and state management
    - [ ] Implement sidebar/top bar filter UI
- [ ] Task: Conductor - User Manual Verification 'Core Storefront Components' (Protocol in workflow.md)

## Phase 3: Routing & Pages
- [ ] Task: Implement Main Shop Page (`/shop`)
    - [ ] Write integration tests for page data loading
    - [ ] Implement `app/shop/page.tsx`
- [ ] Task: Implement Dynamic Segment and Crop Pages
    - [ ] Write tests for route parameter handling
    - [ ] Implement `app/shop/segment/[slug]/page.tsx` and `app/shop/crop/[slug]/page.tsx`
- [ ] Task: Implement Product Detail Page (`/product/[slug]`)
    - [ ] Write tests for detail rendering and variant selection
    - [ ] Implement `app/product/[slug]/page.tsx`
- [ ] Task: Conductor - User Manual Verification 'Routing & Pages' (Protocol in workflow.md)
