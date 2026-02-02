# Implementation Plan: Logistics Integration & Serviceability (Track: logistics_integration_20260202)

## Phase 1: API Integration & Data Layer
- [x] Task: Define Logistics Types and Interfaces [7f4c932]
    - [ ] Update `src/types/index.ts` with `LogisticsType` (COURIER, TRANSPORT) and `ShippingRate` interfaces.
    - [ ] Add constants for Transport Carriers (Navata, VRL, etc.).
- [ ] Task: Implement Delhivery API Client
    - [ ] Create `src/lib/shipping/delhivery.ts` for serviceability and rate calculation.
    - [ ] Add environment variables for Delhivery API keys.
- [ ] Task: Create Shipping Calculation Logic
    - [ ] Implement a unified utility `calculateShippingOptions(pincode, weight)` that handles the Delhivery-to-Transport fallback logic.
- [ ] Task: Write Tests for Shipping Logic
    - [ ] Verify courier rates, godown fallback, and handling fee calculations in `src/lib/shipping/__tests__/delhivery.test.ts`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: API Integration & Data Layer' (Protocol in workflow.md)

## Phase 2: Storefront UI Enhancements
- [ ] Task: Build Serviceability Checker Component
    - [ ] Create a reusable `ServiceabilityChecker` component for product pages.
    - [ ] Implement caching for pincode checks in local storage/session.
- [ ] Task: Implement Shipping Step in Checkout
    - [ ] Update the checkout flow to display the calculated shipping methods.
    - [ ] Build the "Transport Godown" selection UI (dropdown for carriers).
- [ ] Task: Write UI Component Tests
    - [ ] Verify the serviceability display and carrier selection logic in `src/components/shop/__tests__/checkout-flow.test.tsx`.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Storefront UI Enhancements' (Protocol in workflow.md)

## Phase 3: Admin & Order Management
- [ ] Task: Update Admin Order Detail View
    - [ ] Modify `src/app/admin/orders/[id]/page.tsx` to show logistics type and selected carrier.
    - [ ] Add fields for manual tracking updates for Godown deliveries.
- [ ] Task: Integrate Shipping with Order Creation
    - [ ] Ensure the handling fee or shipping cost is correctly saved to the database during checkout.
- [ ] Task: Write Integration Tests
    - [ ] Verify the full flow from pincode entry to order fulfillment data storage.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Admin & Order Management' (Protocol in workflow.md)
