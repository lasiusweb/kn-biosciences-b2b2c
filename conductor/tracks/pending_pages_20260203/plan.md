# Implementation Plan: Pending Pages Design and Implementation (Track: pending_pages_20260203)

## Phase 1: Data Schema & API Setup [checkpoint: 013d9a2]
- [x] Task: Create Supabase Tables for CMS Content [013d9a2]
    - [x] Define and apply migration for `legal_content` table (id, slug, title, content, version, last_updated).
    - [x] Define and apply migration for `faqs` table (id, category, question, answer, order).
    - [x] Define and apply migration for `contact_submissions` table (id, name, email, phone, subject, message, status).
- [x] Task: Implement Content Fetching Services [013d9a2]
    - [x] Create `src/lib/cms-service.ts` for fetching legal and FAQ data.
    - [x] Write unit tests for content retrieval and error handling.
- [x] Task: Conductor - User Manual Verification 'Data Schema & API Setup' (Protocol in workflow.md) [013d9a2]

## Phase 2: Contact Us & About Us Implementation [checkpoint: dcde006]
- [x] Task: Build About Us Page [dcde006]
    - [x] Create `src/app/about/page.tsx` with Mission, Story, Team, and Sustainability sections.
    - [x] Implement responsive layout and animations using GSAP/Framer Motion.
- [x] Task: Build Contact Us Page & Integration [dcde006]
    - [x] Create `src/app/contact/page.tsx` with interactive form and location details.
    - [x] Implement `/api/contact/submit` to handle Supabase storage and email trigger.
    - [x] Integrate Zoho CRM lead sync logic.
- [x] Task: Write Tests for Contact Flow [dcde006]
    - [x] Write unit tests for form validation and API submission.
    - [x] Mock Zoho/Email services to verify integration logic.
- [x] Task: Conductor - User Manual Verification 'Contact & About Us' (Protocol in workflow.md) [dcde006]

## Phase 3: FAQ & Legal Pages [checkpoint: pending]
- [x] Task: Build FAQ Page [786583e]
    - [x] Create `src/app/faq/page.tsx` with accordion-style layout and categories.
    - [x] Implement client-side search functionality for FAQs.
- [x] Task: Build Dynamic Legal Pages [7a399cd]
    - [x] Create dynamic routes for `/privacy-policy`, `/terms-and-conditions`, and `/refund-policy`.
    - [x] Implement shared `LegalLayout` component for consistent typography.
- [x] Task: Write UI & Integration Tests [786583e, 7a399cd]
    - [x] Verify FAQ search and accordion interactions.
    - [x] Test dynamic loading of legal content from Supabase.
- [ ] Task: Conductor - User Manual Verification 'FAQ & Legal Pages' (Protocol in workflow.md)

## Phase 4: SEO & Final Polish [checkpoint: pending]
- [ ] Task: Implement Metadata & JSON-LD
    - [ ] Add optimized meta tags and structured data to all new pages.
    - [ ] Verify social sharing previews (Open Graph).
- [ ] Task: Final Quality Audit
    - [ ] Run accessibility audit (Lighthouse/Axe) on all new routes.
    - [ ] Verify mobile responsiveness and performance metrics.
- [ ] Task: Conductor - User Manual Verification 'SEO & Final Polish' (Protocol in workflow.md)