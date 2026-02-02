# Implementation Plan: B2C Checkout & Payment Lifecycle (Track: b2c_checkout_20260202)

## Phase 1: Easebuzz Core Integration [checkpoint: ccdaf7f]
- [x] Task: Implement Secure Hash Generator [61e44cd]
    - [x] Create `src/lib/payments/easebuzz.ts` with SHA-512 hash logic.
    - [x] Implement server-side verification for Easebuzz responses.
- [x] Task: Create Payment Initiation API [fcdcb43]
    - [x] Create `/api/payments/easebuzz/initiate` to handle payload creation.
    - [x] Integrate with existing `CheckoutFlow` component to trigger Easebuzz.
- [x] Task: Write Tests for Payment Logic [e5c693b]
    - [x] Verify hash calculation accuracy against Easebuzz documentation.
    - [x] Test API response handling for various payment scenarios (Success, Failure, User Cancelled).
- [ ] Task: Conductor - User Manual Verification 'Easebuzz Core Integration' (Protocol in workflow.md)

## Phase 2: Post-Payment Fulfillment Engine [checkpoint: 5eccc4a]
- [x] Task: Implement Atomic Fulfillment Transaction [687fcb4]
    - [x] Create a Supabase RPC or server-side transaction for:
        - [x] FEFO Batch Inventory Deduction.
        - [x] Order Status Update (Confirmed).
        - [x] Cart Clearance.
- [x] Task: Create Webhook Handler [08eb8bb]
    - [x] Implement `/api/payments/easebuzz/webhook` for async status updates.
    - [x] Add idempotency checks to prevent duplicate processing.
- [x] Task: Write Integration Tests for Fulfillment [ce9c3f6]
    - [x] Mock Easebuzz webhook and verify inventory deduction logic.
    - [x] Confirm cart is cleared only after successful confirmation.
- [ ] Task: Conductor - User Manual Verification 'Post-Payment Fulfillment Engine' (Protocol in workflow.md)

## Phase 3: Customer Success/Failure Experience [checkpoint: ]
- [ ] Task: Build Success & Failure Pages
    - [ ] Create `src/app/checkout/success/page.tsx` with summary, tracking, and recommendations.
    - [ ] Create `src/app/checkout/failure/page.tsx` with error details and retry logic.
- [ ] Task: Implement Document & Notification Triggers
    - [ ] Integrate PDF invoice generation trigger on Success page load or via webhook.
    - [ ] Implement WhatsApp/Email notification queueing after payment confirmation.
- [ ] Task: Write UI Integration Tests
    - [ ] Verify routing logic from payment callback to correct success/failure pages.
    - [ ] Test the "Retry" button functionality on the failure page.
- [ ] Task: Conductor - User Manual Verification 'B2C Checkout Experience' (Protocol in workflow.md)
