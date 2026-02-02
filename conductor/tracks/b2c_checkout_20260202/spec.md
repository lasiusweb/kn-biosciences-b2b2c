# Specification: B2C Checkout & Payment Lifecycle (Track: b2c_checkout_20260202)

## Overview
Finalize the retail (B2C) shopping experience by implementing a production-ready checkout lifecycle. This includes live payment integration with Easebuzz, automated post-payment fulfillment logic (inventory, cart, and Zoho triggers), and dedicated customer success/failure pages.

## Goals
- Provide a secure and reliable payment experience for retail customers.
- Automate the transition from 'Payment Success' to 'Fulfillment Ready'.
- Ensure data consistency between the storefront, inventory batches, and external ERP (Zoho).
- Maintain high customer trust through clear post-purchase communication and tracking.

## Functional Requirements
### 1. Easebuzz Integration (B2C Primary)
- **Hash Verification:** Implement robust SHA-512 hash calculation and verification for all Easebuzz transactions to prevent tampering.
- **Redirect Handling:** Process the callback from Easebuzz to update the order status in real-time.
- **Webhook Implementation:** Create a robust webhook listener to handle asynchronous payment status updates (e.g., if a user closes the browser before redirection).

### 2. Post-Payment Fulfillment Automation
- **FEFO Inventory Deduction:** Automatically deduct purchased quantities from `product_batches` using the "First Expired, First Out" (FEFO) logic.
- **Cart Clearance:** Atomically clear the user's active `cart_items` once the order is confirmed.
- **Zoho Books Queue:** Push order and customer data to the Zoho sync table for automated GST-compliant invoicing.
- **Notification Trigger:** Initiate WhatsApp and Email notifications containing the order summary and estimated delivery.

### 3. Customer Experience UI
- **Success Page (/checkout/success):**
    - Display Order Number and Detailed Summary.
    - Provide a button for PDF Invoice download.
    - Show live tracking link (Delhivery or Transport Godown link).
    - Integrated "Support via WhatsApp" button.
    - "Recommended for You" product carousel.
- **Failure Page (/checkout/failure):**
    - Display clear error reason (e.g., "Insufficent Funds", "Cancelled by User").
    - "Try Again" button which redirects back to the payment selection step.

## Non-Functional Requirements
- **Atomicity:** Inventory deduction and order status updates must occur within a database transaction or a coordinated RPC call to ensure consistency.
- **Security:** Ensure `EASEBUZZ_KEY` and `SALT` are never exposed to the client-side.
- **Performance:** Post-payment background tasks (Zoho sync, notifications) should not block the user's redirection to the success page.

## Acceptance Criteria
- [ ] A customer can successfully complete a transaction using the Easebuzz sandbox/production environment.
- [ ] Order status in the database changes from `pending` to `confirmed` automatically.
- [ ] Stock quantities in the correct batches are reduced immediately after success.
- [ ] The customer's cart is empty after returning to the storefront.
- [ ] The success page displays all required elements (tracking, invoice, recommendations).
- [ ] WhatsApp/Email notifications are triggered with correct order details.

## Out of Scope
- Map-based real-time driver tracking (Phase 2).
- International currency support (INR only).
