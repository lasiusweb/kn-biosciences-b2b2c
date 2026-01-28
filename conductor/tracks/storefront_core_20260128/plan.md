# Implementation Plan - Storefront Core and Product Catalog

## Phase 1: Data Model & API Setup [checkpoint: af9ce83]
- [x] Task: Define and verify Supabase types for Products and Categories [15e65bd]
    - [x] Create TypeScript interfaces matching the database schema
    - [x] Write unit tests to verify data parsing/validation
- [x] Task: Implement Product Data Fetching Service [054c2c8]
    - [x] Write tests for `getProducts`, `getProductsBySegment`, and `getProductBySlug`
    - [x] Implement the services using Supabase client
- [x] Task: Conductor - User Manual Verification 'Data Model & API Setup' (Protocol in workflow.md)

## Phase 2: Core Storefront Components
- [x] Task: Implement ProductCard Component [2deb598]
    - [ ] Write unit tests for rendering and price display logic
    - [ ] Implement component with Tailwind and Mint Green accents
- [x] Task: Implement ProductGrid Component [1efbb8e]
    - [ ] Write tests for responsive layout and empty states
    - [ ] Implement component with performance optimizations (Next.js Image)
- [x] Task: Implement ProductFilters Component [c4c5644]
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
