# Specification: Admin Super-App & Platform Foundation

## Overview
Implement a comprehensive Administrative "Super-App" and technical foundation for KN Biosciences. This track covers the core management dashboard, public CMS, marketing engine configuration, and the creation of the long-term project roadmap and integration blueprints.

## Scope
- **Route:** `/admin/*` (Protected by Admin RBAC)
- **Technical Deliverables:** Project Roadmap, Integration Plans (Zoho/Delivery), SEO & Animation Guides.
- **Theme:** shadcn/ui Dark Mode (Sleek black/white aesthetic).

## Functional Requirements

### 1. Operations & Analytics Module
- **Products:** CRUD, Bulk Import (CSV/Excel), Image Upload.
- **Orders:** Workflow management, Manual batch/traceability assignment.
- **Inventory:** Stock tracking, batch management, expiry alerts.
- **Users:** Role management, Dealer/Distributor approval workflow.
- **Analytics:** Revenue, Top Products, B2B/B2C split, Inventory health metrics.

### 2. Marketing & Communication Module
- **Promotions:** CRUD for Banners, Coupon Codes, and Loyalty Config.
- **Communication:** Newsletter subscriber management, Twilio WhatsApp template/config interface.
- **SEO Management:** Global and per-page SEO (Title, Keywords, Tags, OG Metadata).

### 3. CMS & Content Module
- **Core Pages:** Management of `/about`, `/contact`, and specialized `/for-*-champions` landing pages.
- **Knowledge Center:** Full blog engine with tagging and SEO-friendly slugs.

### 4. Technical Documentation & Roadmap (Deliverables)
- **Project Roadmap:** A 2-phase implementation strategy for the entire platform.
- **Integration Blueprints:** Detailed plans for Zoho CRM, Zoho Books, and Delivery API (Mapping, API endpoints, error handling).
- **SEO & Polish Guides:** 
    - JSON-LD schema markup examples (Organization, Product, LocalBusiness).
    - GSAP & Lottie implementation plans (scroll effects, micro-interactions).
    - Image Optimization & Meta-tag strategies.

## Non-Functional Requirements
- **Security:** Strict Admin-only access; secure API key management for Twilio/Zoho.
- **Performance:** Fast loading for admin lists via pagination; SEO-friendly SSR for CMS content.
- **Usability:** High-contrast design; intuitive UI for complex configurations.

## Acceptance Criteria
- [ ] Admin dashboard is restricted to authenticated 'Admin' users.
- [ ] All 6 modules (Operations, Analytics, Marketing, CMS, SEO, Integrations) are functional.
- [ ] Roadmap and Integration documents are created in `conductor/`.
- [ ] Bulk import correctly processes complex Excel/CSV files.
- [ ] CMS content renders correctly with valid SEO metadata.
