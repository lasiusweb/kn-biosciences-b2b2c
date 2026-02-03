# Implementation Plan: Pending Pages Design and Implementation (Track: pending_pages_20260203)

## Phase 1: Data Schema & API Setup [checkpoint: pending]
- [~] Task: Create Supabase Tables for CMS Content
    - [ ] Define and apply migration for `legal_content` table (id, slug, title, content, version, last_updated).
    - [ ] Define and apply migration for `faqs` table (id, category, question, answer, order).
    - [ ] Define and apply migration for `contact_submissions` table (id, name, email, phone, subject, message, status).
- [ ] Task: Implement Content Fetching Services
    - [ ] Create `src/lib/cms-service.ts` for fetching legal and FAQ data.
    - [ ] Write unit tests for content retrieval and error handling.
- [ ] Task: Conductor - User Manual Verification 'Data Schema & API Setup' (Protocol in workflow.md)

## Phase 2: Contact Us & About Us Implementation [checkpoint: pending]
- [ ] Task: Build About Us Page
    - [ ] Create `src/app/about/page.tsx` with Mission, Story, Team, and Sustainability sections.
    - [ ] Implement responsive layout and animations using GSAP/Framer Motion.
- [ ] Task: Build Contact Us Page & Integration
    - [ ] Create `src/app/contact/page.tsx` with interactive form and location details.
    - [ ] Implement `/api/contact/submit` to handle Supabase storage and email trigger.
    - [ ] Integrate Zoho CRM lead sync logic.
- [ ] Task: Write Tests for Contact Flow
    - [ ] Write unit tests for form validation and API submission.
    - [ ] Mock Zoho/Email services to verify integration logic.
- [ ] Task: Conductor - User Manual Verification 'Contact & About Us' (Protocol in workflow.md)

## Phase 3: FAQ & Legal Pages [checkpoint: pending]
- [ ] Task: Build FAQ Page
    - [ ] Create `src/app/faq/page.tsx` with accordion-style layout and categories.
    - [ ] Implement client-side search functionality for FAQs.
- [ ] Task: Build Dynamic Legal Pages
    - [ ] Create dynamic routes for `/privacy-policy`, `/terms-and-conditions`, and `/refund-policy`.
    - [ ] Implement shared `LegalLayout` component for consistent typography.
- [ ] Task: Write UI & Integration Tests
    - [ ] Verify FAQ search and accordion interactions.
    - [ ] Test dynamic loading of legal content from Supabase.
- [ ] Task: Conductor - User Manual Verification 'FAQ & Legal Pages' (Protocol in workflow.md)

## Phase 4: SEO & Final Polish [checkpoint: pending]
- [ ] Task: Implement Metadata & JSON-LD
    - [ ] Add optimized meta tags and structured data to all new pages.
    - [ ] Verify social sharing previews (Open Graph).
- [ ] Task: Final Quality Audit
    - [ ] Run accessibility audit (Lighthouse/Axe) on all new routes.
    - [ ] Verify mobile responsiveness and performance metrics.
- [ ] Task: Conductor - User Manual Verification 'SEO & Final Polish' (Protocol in workflow.md)