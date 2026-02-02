# Implementation Plan: B2B Quote-to-Order & Approval Workflow (Track: b2b_approval_20260202)

## Phase 1: Schema & RBAC Extensions [checkpoint: f6536c5]
- [x] Task: Extend Roles and Database Schema [c47ed72]
    - [x] Update `public.users` role constraint to include `sales_manager` in `database/schema.sql`.
    - [x] Add `linked_order_id` (UUID) to `b2b_quotes` table.
    - [x] Update `src/types/index.ts` and `src/types/database.ts` with new role and field.
- [x] Task: Write RBAC Integration Tests [4c4c4eb]
    - [x] Verify that only `admin` and `sales_manager` can access the new quote management APIs.
- [x] Task: Conductor - User Manual Verification 'Schema & RBAC Extensions' (Protocol in workflow.md) [f6536c5]

## Phase 2: Sales Manager Quote Management
- [x] Task: Implement Admin Quote Directory [e3253bf]
    - [ ] Create `src/app/admin/quotes/page.tsx` for Sales Managers.
    - [ ] Build a filterable list of quotes (Submitted, Under Review, etc.).
- [ ] Task: Implement Quote Review & Edit Interface
    - [ ] Create `src/components/admin/quote-review-modal.tsx`.
    - [ ] Add functionality to modify unit prices and quantities with real-time total recalculation.
- [ ] Task: Write Tests for Quote Management
    - [ ] Verify that Sales Managers can edit quote items and save notes.
- [ ] Task: Conductor - User Manual Verification 'Sales Manager Quote Management' (Protocol in workflow.md)

## Phase 3: Approval Logic & Order Conversion
- [ ] Task: Implement Quote Approval API
    - [ ] Create `/api/admin/quotes/approve` endpoint.
    - [ ] Implement atomic transaction: Update Quote Status -> Create Order -> Link Order ID.
- [ ] Task: Integrate Automated Payment Link
    - [ ] Trigger Razorpay/Easebuzz payment link creation for the resulting order.
    - [ ] Store the payment link URL in the `orders` table.
- [ ] Task: Write Workflow Integration Tests
    - [ ] Verify full end-to-end flow: Review -> Edit -> Approve -> Order Created.
- [ ] Task: Conductor - User Manual Verification 'Approval Logic & Order Conversion' (Protocol in workflow.md)

## Phase 4: B2B Customer Portal Sync
- [ ] Task: Update B2B Portal Quote View
    - [ ] Display the linked Order Number and a "Pay Now" button for approved quotes.
- [ ] Task: Write UI Integration Tests
    - [ ] Verify that customers can see their finalized prices and access payment links.
- [ ] Task: Conductor - User Manual Verification 'B2B Approval Workflow' (Protocol in workflow.md)
