# Implementation Plan: Zoho Ecosystem Integration (Track: zoho_integration_20260205)

## Phase 1: Foundation & Authentication [checkpoint: pending]
- [ ] Task: Update Database Schema for Zoho Mapping
    - [ ] Add `zoho_crm_id` and `zoho_books_id` to `users`, `orders`, `products`, and `b2b_quotes` tables.
    - [ ] Create `zoho_sync_logs` table to track status, retries, and error messages.
- [ ] Task: Implement Zoho OAuth 2.0 Client
    - [ ] Create `src/lib/integrations/zoho/auth.ts` to handle token generation, storage (in Supabase), and refresh logic.
    - [ ] Write unit tests to verify token refresh and secure storage.
- [ ] Task: Conductor - User Manual Verification 'Foundation & Authentication' (Protocol in workflow.md)

## Phase 2: CRM Integration (Contacts & Leads) [checkpoint: pending]
- [ ] Task: Build Zoho CRM API Client
    - [ ] Implement `createContact`, `updateContact`, and `createLead` methods in `src/lib/integrations/zoho/crm.ts`.
- [ ] Task: Implement User & Inquiry Sync Logic
    - [ ] Write unit tests for data mapping between Supabase and CRM fields.
    - [ ] Implement service logic to trigger CRM sync on user registration and contact form submission.
- [ ] Task: Conductor - User Manual Verification 'CRM Integration' (Protocol in workflow.md)

## Phase 3: Books Integration (Invoices & Estimates) [checkpoint: pending]
- [ ] Task: Build Zoho Books API Client
    - [ ] Implement `createInvoice` and `createEstimate` methods in `src/lib/integrations/zoho/books.ts`.
- [ ] Task: Implement Order & Quote Sync Logic
    - [ ] Write unit tests for tax (GST) and line-item calculation mapping for Zoho Books.
    - [ ] Implement service logic to trigger invoice creation upon B2C payment and estimate creation for B2B quotes.
- [ ] Task: Conductor - User Manual Verification 'Books Integration' (Protocol in workflow.md)

## Phase 4: Bi-directional Inventory Sync [checkpoint: pending]
- [ ] Task: Implement Supabase-to-Zoho Inventory Push
    - [ ] Write tests for stock update triggers.
    - [ ] Implement logic to update Zoho Books item stock when Supabase inventory changes.
- [ ] Task: Implement Zoho-to-Supabase Inventory Pull
    - [ ] Create a Supabase Edge Function to receive webhooks from Zoho Books or a scheduled job to poll for stock changes.
    - [ ] Write unit tests to ensure Supabase inventory is updated correctly from Zoho data.
- [ ] Task: Conductor - User Manual Verification 'Inventory Sync' (Protocol in workflow.md)

## Phase 5: Reliability & Admin Dashboard [checkpoint: pending]
- [x] Task: Implement Background Sync Queue
    - [x] Set up a queue-based processing system with automatic retries and exponential backoff.
    - [x] Integrate existing sync tasks into this queue.
- [x] Task: Build Admin Sync Dashboard
    - [x] Create UI in the Admin App to view `zoho_sync_logs`.
    - [x] Add "Retry Sync" functionality for manual overrides.
- [x] Task: Final Integration Audit & Performance Check
    - [x] Verify API rate limit handling and log reliability under load.
- [ ] Task: Conductor - User Manual Verification 'Reliability & Dashboard' (Protocol in workflow.md)
