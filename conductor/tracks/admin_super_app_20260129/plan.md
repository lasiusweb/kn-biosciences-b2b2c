# Implementation Plan: Admin Super-App & Platform Foundation

This plan covers the development of the Admin Dashboard skeleton, core operational modules, marketing/CMS interfaces, and the technical documentation for platform-wide integrations.

## Phase 1: Infrastructure & Admin Foundation [checkpoint: d2b12db]
- [x] Task: Create Admin Service Layer (99c1741)
    - [x] Define types for admin operations in `src/types/admin.ts`
    - [x] Implement `src/lib/admin-service.ts` with base Supabase/Hasura functions
    - [x] Write unit tests for the service layer in `src/lib/__tests__/admin-service.test.ts`
- [x] Task: Admin Layout & Security Middleware (91574b9)
    - [x] Create `src/app/admin/layout.tsx` with sidebar navigation and high-contrast theme
    - [x] Implement RBAC middleware/check to restrict `/admin/*` to 'Admin' role
    - [x] Write tests to verify unauthorized access is redirected to login
- [x] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure' (Protocol in workflow.md) (d2b12db)

## Phase 2: Operations & Analytics Modules [checkpoint: a29b8dc]
- [x] Task: Products Management & Bulk Import (d86cea1)
    - [x] Write tests for CSV/Excel parsing logic
    - [x] Implement product CRUD and bulk upload in `src/app/admin/products/page.tsx`
    - [ ] Implement image upload integration with Supabase Storage
- [x] Task: Orders & Inventory Management (7af1426)
    - [x] Implement order list and processing workflow (status updates) (35f4467)
    - [x] Build inventory tracking UI with batch assignment and low-stock indicators (35f4467)
    - [x] Write tests for order status transitions and stock calculations (35f4467)
- [x] Task: Analytics Dashboard (2163dcc)
    - [x] Implement `src/components/admin/analytics-dashboard.tsx` with revenue and performance charts (2163dcc)
    - [x] Write tests for data aggregation logic used by charts (2163dcc)
- [x] Task: Conductor - User Manual Verification 'Phase 2: Operations' (Protocol in workflow.md) (a29b8dc)

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
