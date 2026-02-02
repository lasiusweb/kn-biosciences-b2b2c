# Specification: B2B Quote-to-Order & Approval Workflow (Track: b2b_approval_20260202)

## Overview
Expand the B2B portal to include a full approval lifecycle for quote requests. This involves introducing a 'Sales Manager' role, a dedicated review interface, and automated order creation upon approval.

## Goals
- Empower Sales Managers to review and modify B2B quote requests.
- Streamline the transition from a 'Submitted' quote to a 'Confirmed' order.
- Automate the payment process for B2B clients via automated payment links.
- Enhance communication between the sales team and B2B clients through custom notes.

## Functional Requirements
### 1. Sales Manager Role & RBAC
- **New Role:** Define 'Sales Manager' in the system with permissions to view, edit, and approve/reject quotes.
- **Access Control:** Sales Managers can access `/admin/quotes` (a new administrative view).

### 2. Quote Review Interface (Admin)
- **Edit Capabilities:** Sales Managers can adjust unit prices, modify quantities, and apply custom discounts to a submitted quote.
- **Communication:** Add fields for 'Internal Notes' (private) and 'Customer Comments' (visible to the user).
- **Expiration:** Set or extend the 'Valid Until' date during approval.

### 3. Automated Order Conversion
- **Trigger:** When a Sales Manager clicks 'Approve', the system must:
    1. Update quote status to 'Approved'.
    2. Create a new entry in the `orders` table with status 'Confirmed'.
    3. Generate a PDF invoice based on the finalized quote details.
- **Linking:** Maintain a database reference between the original `quote_id` and the resulting `order_id`.

### 4. Payment & Notifications
- **Payment Link:** Automatically trigger an email/notification to the B2B client with a payment link (Razorpay/Easebuzz) for the finalized total.
- **Status Sync:** If the quote is rejected, notify the customer with the provided reason.

## Non-Functional Requirements
- **Audit Trail:** Log all changes made by Sales Managers to unit prices or quantities for accountability.
- **Consistency:** Ensure totals are recalculated in real-time within the review interface when items are modified.

## Acceptance Criteria
- [ ] Sales Manager can view a list of all submitted quotes.
- [ ] Sales Manager can successfully modify a quote and save changes.
- [ ] Clicking 'Approve' creates a matching order in the database.
- [ ] The customer can see their approved quote and the resulting order in their portal.
- [ ] System generates a valid payment link for the new B2B order.

## Out of Scope
- Automated credit limit checks (Phase 2).
- Inventory reservation during the 'Under Review' status (Stock is only reserved upon Order creation).
