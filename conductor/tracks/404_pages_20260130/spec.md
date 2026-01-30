# Specification: 404 & Displaced Pages (Track: 404_pages_20260130)

## Overview
This track addresses the "displaced" areas of the storefront by implementing a branded 404 experience, a smart "Category Not Found" system, a hybrid redirect mechanism for legacy URLs, and the core legal/policy documentation required for compliance and user trust.

## Goals
- Minimize user drop-off from broken or legacy links.
- Maintain SEO equity through smart redirects.
- Ensure legal compliance for payments and data privacy.
- Provide a memorable, high-quality brand experience even on error pages.

## Functional Requirements

### 1. Branded "Experimental" 404 Page
- **Visuals:** A high-animation layout using GSAP and Framer Motion (e.g., an organic growing vine animation or 3D primitive interaction).
- **Navigation:** Clear "Return Home" and "Continue Shopping" calls to action.
- **Search Integration:** Search bar to help users find what they were looking for.

### 2. Specialized "Category Not Found" Page
- **Contextual Awareness:** Detects the invalid category slug from the URL.
- **Smart Fallbacks:** 
    - Displays breadcrumbs to the nearest valid parent category.
    - Integrates the Search API to show results related to the missing slug.
    - Uses the AI Recommendation Engine (`/api/recommendations`) to suggest trending products.

### 3. Hybrid Smart Redirect System
- **Precision Mapping:** A Supabase table `public.legacy_redirects` (source_url, target_url, status_code).
- **Middleware Integration:** Next.js middleware checks the Supabase cache for an exact match before rendering a 404.
- **Fuzzy Fallback:** If no match is found, the system performs a search-based lookup to suggest the most likely destination.

### 4. Legal & Policy Infrastructure
- Implementation of dedicated routes for:
    - `/privacy-policy` (Data privacy & Supabase Auth transparency).
    - `/terms-and-conditions` (B2B/Wholesale focus).
    - `/refund-policy` (Payment gateway compliance).
    - `/shipping-policy` (Delivery expectations).
    - `/disclaimer` (Agricultural & product application advice).

## Non-Functional Requirements
- **Performance:** Redirect lookups must be cached to avoid database overhead on every 404.
- **SEO:** Use 301 redirects for known legacy mappings and 404 status codes only when no match is found.
- **Accessibility:** All new pages must be WCAG 2.1 AA compliant.

## Acceptance Criteria
- [ ] Navigating to a non-existent URL triggers the animated 404 page.
- [ ] Navigating to a broken category link shows the "Category Not Found" page with relevant AI recommendations.
- [ ] Legacy URLs defined in the Supabase table redirect correctly to their new targets.
- [ ] All five legal pages are accessible and styled consistently with the brand.
- [ ] No layout shifts or performance regressions on error pages.

## Out of Scope
- Migrating actual product data from legacy systems (this track handles URL routing only).
- Creating content for the legal pages (placeholder text will be used for approval).
