# Implementation Plan: B2B Quote-to-Order & Approval Workflow (Track: b2b_approval_20260202)

## Phase 1: Schema & RBAC Extensions [checkpoint: f6536c5]
- [x] Task: Extend Roles and Database Schema [c47ed72]
    - [x] Update `public.users` role constraint to include `sales_manager` in `database/schema.sql`.
    - [x] Add `linked_order_id` (UUID) to `b2b_quotes` table.
    - [x] Update `src/types/index.ts` and `src/types/database.ts` with new role and field.
- [x] Task: Write RBAC Integration Tests [4c4c4eb]
    - [x] Verify that only `admin` and `sales_manager` can access the new quote management APIs.
- [x] Task: Conductor - User Manual Verification 'Schema & RBAC Extensions' (Protocol in workflow.md) [f6536c5]

## Phase 2: Sales Manager Quote Management [checkpoint: 852d9fc]
- [x] Task: Implement Admin Quote Directory [e3253bf]
    - [x] Create `src/app/admin/quotes/page.tsx` for Sales Managers.
    - [x] Build a filterable list of quotes (Submitted, Under Review, etc.).
- [x] Task: Implement Quote Review & Edit Interface [437cd9e]
    - [x] Create `src/components/admin/quote-review-modal.tsx`.
    - [x] Add functionality to modify unit prices and quantities with real-time total recalculation.
- [x] Task: Write Tests for Quote Management [e9a1ee7]
    - [x] Verify that Sales Managers can edit quote items and save notes.
- [x] Task: Conductor - User Manual Verification 'Sales Manager Quote Management' (Protocol in workflow.md) [852d9fc]

## Phase 3: Approval Logic & Order Conversion [checkpoint: 0d654fb]
- [x] Task: Implement Quote Approval API [d17e8fe]
    - [x] Create `/api/admin/quotes/approve` endpoint.
    - [x] Implement atomic transaction: Update Quote Status -> Create Order -> Link Order ID.
- [x] Task: Integrate Automated Payment Link [a15de11]
    - [x] Trigger Razorpay/Easebuzz payment link creation for the resulting order.
    - [x] Store the payment link URL in the `orders` table.
- [x] Task: Write Workflow Integration Tests [c718143]
    - [x] Verify full end-to-end flow: Review -> Edit -> Approve -> Order Created.
- [ ] Task: Conductor - User Manual Verification 'Approval Logic & Order Conversion' (Protocol in workflow.md)

## Phase 4: B2B Customer Portal Sync
- [x] Task: Update B2B Portal Quote View [f36bbe0]
    - [x] Display the linked Order Number and a "Pay Now" button for approved quotes.
- [ ] Task: Write UI Integration Tests
    - [ ] Verify that customers can see their finalized prices and access payment links.
- [ ] Task: Conductor - User Manual Verification 'B2B Approval Workflow' (Protocol in workflow.md)
