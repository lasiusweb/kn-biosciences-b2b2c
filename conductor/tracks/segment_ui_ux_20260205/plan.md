# Implementation Plan: Shop by Segment UI/UX (Track: segment_ui_ux_20260205)

## Phase 1: Architecture & Data Fetching [checkpoint: da87c12]
- [x] Task: Extend API Services for Segment & Crop Discovery ca2e02f
    - [x] Write unit tests for segment-specific product fetching with Knowledge Center linkage.
    - [x] Implement optimized data fetching logic in `src/lib/product-service.ts`.
- [x] Task: Implement Dynamic SEO & Metadata Logic 2bb4481
    - [x] Write tests for dynamic metadata generation for segments and crops.
    - [x] Implement `generateMetadata` in the segment and crop route handlers.
- [x] Task: Conductor - User Manual Verification 'Architecture & Data Fetching' (Protocol in workflow.md)

## Phase 2: UI Foundation & GSAP Animations [checkpoint: 4d63881]
- [x] Task: Build Premium Segment Hub Layout (`/shop/segment/[slug]`) a23d4ea
    - [x] Create the layout structure with a high-impact hero section.
    - [x] Implement the "Crop Discovery Grid" with animated cards using GSAP.
- [x] Task: Implement Knowledge Center Integration Components a23d4ea
    - [x] Create the "Latest Articles" feed component.
    - [x] Implement logic to filter articles by segment tags.
- [x] Task: Conductor - User Manual Verification 'UI Foundation & GSAP Core' (Protocol in workflow.md)

## Phase 3: Discovery Funnel & Dynamic View [checkpoint: a3674b5]
- [x] Task: Implement Dynamic Crop View (`/shop/segment/[slug]/[crop]`) ca86c02
    - [x] Create the single-page interface feel for crop-specific exploration.
    - [x] Implement "In-Grid Educational Cards" mixed with products.
- [x] Task: Build Contextual Sidebar for Guidance 330686f
    - [x] Create the sidebar component for "Recommended Reading" and crop tips.
- [x] Task: Conductor - User Manual Verification 'Discovery Funnel & Dynamic View' (Protocol in workflow.md)

## Phase 4: Data Integration & Final Polish [checkpoint: pending]
- [x] Task: Integrate Real-time Stock & Catalogue Downloads 330686f
    - [x] Add live stock status badges to product and crop views.
    - [x] Implement the UI and logic for segment-specific PDF catalogue downloads.
- [x] Task: Final UI Audit & Accessibility Check a3674b5
    - [x] Run performance and accessibility audits on the new routes.
    - [x] Ensure full mobile responsiveness for all premium elements.
- [ ] Task: Conductor - User Manual Verification 'Data Integration & Final Polish' (Protocol in workflow.md)
