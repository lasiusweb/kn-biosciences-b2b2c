# Implementation Plan: 404 & Displaced Pages (Track: 404_pages_20260130)

This plan follows the project's TDD-first methodology and incorporates the Hybrid Smart Redirect System and high-animation UI components.

## Phase 1: Database & Middleware Infrastructure
Focuses on the backend and routing logic for the Hybrid Smart Redirect System.

- [x] Task: Create Supabase migration for `legacy_redirects` table [d4a3e2a]
    - [x] Define schema: `id`, `source_url`, `target_url`, `status_code` (default 301), `is_active`, `created_at`, `updated_at`.
    - [x] Add RLS policies (read-only for public, full access for admin).
- [x] Task: Implement Redirect Management Service [8083b68]
    - [x] Create `src/lib/redirect-service.ts` to handle URL lookups.
    - [x] Implement caching logic for redirect lookups to minimize DB hits.
- [x] Task: Write Tests for Redirect Middleware [8083b68]
    - [x] Write tests in `src/__tests__/middleware.test.ts` to verify redirect logic (logic extracted to `src/lib/middleware-logic.ts`).
- [x] Task: Implement Next.js Middleware for Redirects [5bd882c]
    - [x] Update `src/middleware.ts` to intercept requests and check against `legacy_redirects`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Database & Middleware Infrastructure' (Protocol in workflow.md)

## Phase 2: Core Error Pages (UX & SEO)
Implementation of the specialized "Category Not Found" and the animated 404 page.

- [ ] Task: Create Specialized Category Not Found Page
    - [ ] Write tests for `src/app/shop/category-not-found/page.tsx`.
    - [ ] Implement page with Search API integration and AI recommendations.
- [ ] Task: Write Tests for Experimental 404 Page
    - [ ] Create `src/app/not-found.test.tsx`.
- [ ] Task: Implement Animated 404 Page
    - [ ] Create `src/app/not-found.tsx`.
    - [ ] Implement GSAP/Framer Motion animations for the "Experimental" layout.
- [ ] Task: Implement Fuzzy-Matching Fallback Logic
    - [ ] Integrate Search API into the 404 page to suggest potential matches based on the invalid URL slug.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Core Error Pages' (Protocol in workflow.md)

## Phase 3: Legal & Policy Documentation
Implementation of static content routes and layouts.

- [ ] Task: Create Base Policy Layout and Components
    - [ ] Implement a reusable `PolicyLayout` component for legal pages.
- [ ] Task: Implement Legal Routes
    - [ ] Create pages for `/privacy-policy`, `/terms-and-conditions`, `/refund-policy`, `/shipping-policy`, and `/disclaimer`.
    - [ ] Ensure WCAG 2.1 AA compliance and mobile responsiveness.
- [ ] Task: Write Tests for Legal Pages
    - [ ] Verify accessibility and routing for all five legal paths.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Legal & Policy Documentation' (Protocol in workflow.md)

## Phase 4: Final Verification & SEO Audit
Ensures all systems work together and meet quality gates.

- [ ] Task: End-to-End Redirect & Error Flow Test
    - [ ] Verify legacy URL -> New Target flow.
    - [ ] Verify broken category -> AI recommendation flow.
- [ ] Task: Run Performance and Accessibility Audit
    - [ ] Execute Lighthouse/Core Web Vitals check on 404 and Legal pages.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Final Verification & SEO Audit' (Protocol in workflow.md)
