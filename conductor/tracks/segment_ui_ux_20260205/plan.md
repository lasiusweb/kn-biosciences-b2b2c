# Implementation Plan: Shop by Segment UI/UX (Track: segment_ui_ux_20260205)

## Phase 1: Architecture & Data Fetching [checkpoint: pending]
- [x] Task: Extend API Services for Segment & Crop Discovery ca2e02f
    - [ ] Write unit tests for segment-specific product fetching with Knowledge Center linkage.
    - [ ] Implement optimized data fetching logic in `src/lib/product-service.ts`.
- [x] Task: Implement Dynamic SEO & Metadata Logic 2bb4481
    - [ ] Write tests for dynamic metadata generation for segments and crops.
    - [ ] Implement `generateMetadata` in the segment and crop route handlers.
- [ ] Task: Conductor - User Manual Verification 'Architecture & Data Fetching' (Protocol in workflow.md)

## Phase 2: UI Foundation & GSAP Animations [checkpoint: pending]
- [ ] Task: Build Premium Segment Hub Layout (`/shop/segment/[slug]`)
    - [ ] Create the layout structure with a high-impact hero section.
    - [ ] Implement the "Crop Discovery Grid" with animated cards using GSAP.
- [ ] Task: Implement Knowledge Center Integration Components
    - [ ] Create the "Latest Articles" feed component.
    - [ ] Implement logic to filter articles by segment tags.
- [ ] Task: Conductor - User Manual Verification 'UI Foundation & GSAP Core' (Protocol in workflow.md)

## Phase 3: Discovery Funnel & Dynamic View [checkpoint: pending]
- [ ] Task: Implement Dynamic Crop View (`/shop/segment/[slug]/[crop]`)
    - [ ] Create the single-page interface feel for crop-specific exploration.
    - [ ] Implement "In-Grid Educational Cards" mixed with products.
- [ ] Task: Build Contextual Sidebar for Guidance
    - [ ] Create the sidebar component for "Recommended Reading" and crop tips.
- [ ] Task: Conductor - User Manual Verification 'Discovery Funnel & Dynamic View' (Protocol in workflow.md)

## Phase 4: Data Integration & Final Polish [checkpoint: pending]
- [ ] Task: Integrate Real-time Stock & Catalogue Downloads
    - [ ] Add live stock status badges to product and crop views.
    - [ ] Implement the UI and logic for segment-specific PDF catalogue downloads.
- [ ] Task: Final UI Audit & Accessibility Check
    - [ ] Run performance and accessibility audits on the new routes.
    - [ ] Ensure full mobile responsiveness for all premium elements.
- [ ] Task: Conductor - User Manual Verification 'Data Integration & Final Polish' (Protocol in workflow.md)
