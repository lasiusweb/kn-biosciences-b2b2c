# Implementation Plan: Admin Super-App & Platform Foundation

This plan covers the development of the Admin Dashboard skeleton, core operational modules, marketing/CMS interfaces, and the technical documentation for platform-wide integrations.

## Phase 1: Infrastructure & Admin Foundation
- [x] Task: Create Admin Service Layer (99c1741)
    - [x] Define types for admin operations in `src/types/admin.ts`
    - [x] Implement `src/lib/admin-service.ts` with base Supabase/Hasura functions
    - [x] Write unit tests for the service layer in `src/lib/__tests__/admin-service.test.ts`
- [ ] Task: Admin Layout & Security Middleware
    - [ ] Create `src/app/admin/layout.tsx` with sidebar navigation and high-contrast theme
    - [ ] Implement RBAC middleware/check to restrict `/admin/*` to 'Admin' role
    - [ ] Write tests to verify unauthorized access is redirected to login
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure' (Protocol in workflow.md)

## Phase 2: Operations & Analytics Modules
- [ ] Task: Products Management & Bulk Import
    - [ ] Write tests for CSV/Excel parsing logic
    - [ ] Implement product CRUD and bulk upload in `src/app/admin/products/page.tsx`
    - [ ] Implement image upload integration with Supabase Storage
- [ ] Task: Orders & Inventory Management
    - [ ] Implement order list and processing workflow (status updates)
    - [ ] Build inventory tracking UI with batch assignment and low-stock indicators
    - [ ] Write tests for order status transitions and stock calculations
- [ ] Task: Analytics Dashboard
    - [ ] Implement `src/components/admin/analytics-dashboard.tsx` with revenue and performance charts
    - [ ] Write tests for data aggregation logic used by charts
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Operations' (Protocol in workflow.md)

## Phase 3: CMS & Marketing Management
- [ ] Task: Content Management (CMS)
    - [ ] Implement editor for `/about`, `/contact`, and Landing Pages
    - [ ] Build the Knowledge Center blog engine (CRUD for articles/tags)
    - [ ] Write tests for CMS content persistence and slug generation
- [ ] Task: Marketing & SEO Interface
    - [ ] Implement SEO metadata management (titles, keywords, OG tags)
    - [ ] Build UI for managing Coupon Codes, Banners, and Loyalty Config
    - [ ] Create Twilio WhatsApp template configuration interface
- [ ] Task: Conductor - User Manual Verification 'Phase 3: CMS & Marketing' (Protocol in workflow.md)

## Phase 4: Platform Strategy & Documentation
- [ ] Task: Project Roadmap & Integration Blueprints
    - [ ] Create `conductor/ROADMAP.md` with 2-phase strategy
    - [ ] Draft `conductor/integrations/zoho.md` and `conductor/integrations/delivery.md`
- [ ] Task: SEO, Polish & Asset Guides
    - [ ] Create `conductor/guides/seo-polish.md` covering JSON-LD, GSAP, Lottie, and Image Optimization
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Strategy' (Protocol in workflow.md)
