# Implementation Plan: B2C Checkout & Payment Lifecycle (Track: b2c_checkout_20260202)

## Phase 1: Easebuzz Core Integration [checkpoint: ]
- [x] Task: Implement Secure Hash Generator [61e44cd]
    - [x] Create `src/lib/payments/easebuzz.ts` with SHA-512 hash logic.
    - [x] Implement server-side verification for Easebuzz responses.
- [ ] Task: Create Payment Initiation API
    - [ ] Create `/api/payments/easebuzz/initiate` to handle payload creation.
    - [ ] Integrate with existing `CheckoutFlow` component to trigger Easebuzz.
- [ ] Task: Write Tests for Payment Logic
    - [ ] Verify hash calculation accuracy against Easebuzz documentation.
    - [ ] Test API response handling for various payment scenarios (Success, Failure, User Cancelled).
- [ ] Task: Conductor - User Manual Verification 'Easebuzz Core Integration' (Protocol in workflow.md)

## Phase 2: Post-Payment Fulfillment Engine [checkpoint: ]
- [ ] Task: Implement Atomic Fulfillment Transaction
    - [ ] Create a Supabase RPC or server-side transaction for:
        - [ ] FEFO Batch Inventory Deduction.
        - [ ] Order Status Update (Confirmed).
        - [ ] Cart Clearance.
- [ ] Task: Create Webhook Handler
    - [ ] Implement `/api/payments/easebuzz/webhook` for async status updates.
    - [ ] Add idempotency checks to prevent duplicate processing.
- [ ] Task: Write Integration Tests for Fulfillment
    - [ ] Mock Easebuzz webhook and verify inventory deduction logic.
    - [ ] Confirm cart is cleared only after successful confirmation.
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
