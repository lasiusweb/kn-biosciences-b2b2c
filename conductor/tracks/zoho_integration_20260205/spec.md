# Specification: Zoho Ecosystem Integration (Track: zoho_integration_20260205)

## Overview
Implement a comprehensive, bi-directional integration between the KN Biosciences platform and the Zoho Ecosystem (CRM and Books). This integration will automate lead management, financial documentation, and inventory synchronization, ensuring that the storefront and the back-office business systems remain perfectly aligned.

## Goals
- Automate lead and customer synchronization from the storefront to Zoho CRM.
- Streamline financial operations by syncing orders and quotes to Zoho Books.
- Maintain consistent inventory levels across both systems via a bi-directional sync.
- Ensure high reliability and observability of the integration via a background queue and admin dashboard.

## Functional Requirements

### 1. Zoho CRM Integration (Leads & Contacts)
- **User Registration:** Automatically create/update a **Contact** in Zoho CRM when a user registers or updates their profile on the storefront.
- **Inquiry Management:** Sync "Contact Us" form submissions and B2B "Quote Requests" as **Leads** in Zoho CRM.
- **Data Mapping:** Map storefront fields (Name, Email, Phone, Company, GST) to corresponding Zoho CRM fields.

### 2. Zoho Books Integration (Invoices & Estimates)
- **B2C Invoicing:** Generate and sync a **Sales Invoice** in Zoho Books immediately after a B2C order payment is confirmed.
- **B2B Estimates:** Sync approved B2B quotes from the storefront as **Estimates/Quotes** in Zoho Books.
- **Tax Compliance:** Ensure GST details are correctly passed to Zoho Books for compliant invoice generation.

### 3. Bi-directional Inventory Sync
- **Stock Alignment:** Any change in stock levels in the Supabase database (via storefront sales or Admin App edits) must be pushed to Zoho Books.
- **Zoho-to-Storefront Sync:** The storefront must listen for or periodically poll for inventory updates from Zoho Books (to account for offline sales or manual adjustments in Zoho) and update Supabase accordingly.

### 4. Integration Management & Reliability
- **Background Sync Queue:** Use a queue-based system (e.g., Supabase Edge Functions with a "retry" logic) to process Zoho API calls asynchronously.
- **Retry Logic:** Failed sync attempts must automatically retry with exponential backoff (up to 5 times).
- **Admin Dashboard:**
    - **Sync Logs:** View a history of all sync operations with statuses (Success, Pending, Failed).
    - **Manual Overrides:** Allow admins to manually trigger a sync for a specific record.
    - **Alerting:** Notify admins via system alerts/email if a critical sync fails permanently.

## Technical Requirements
- **Authentication:** Use Zoho OAuth 2.0 for secure API communication.
- **API Clients:** Implement robust Zoho CRM and Zoho Books API clients in `src/lib/integrations/zoho/`.
- **Database Tracking:** Add `zoho_crm_id` and `zoho_books_id` fields to relevant tables (users, orders, products) for mapping.

## Acceptance Criteria
- [ ] Users registered on the storefront appear as Contacts in Zoho CRM.
- [ ] Storefront orders generate corresponding Invoices in Zoho Books with correct tax and item details.
- [ ] Stock updates in the Admin dashboard reflect in Zoho Books within 5 minutes.
- [ ] Stock updates made directly in Zoho Books reflect on the storefront.
- [ ] Admin dashboard displays a real-time log of Zoho sync activities.
- [ ] Manual sync trigger successfully re-processes a failed record.

## Out of Scope
- Integration with Zoho Inventory's advanced warehouse/multi-location features (unless covered by basic Books inventory).
- Synchronization of historical data prior to the integration launch.
- Complex Zoho CRM blueprint or workflow automation (to be managed within Zoho).
