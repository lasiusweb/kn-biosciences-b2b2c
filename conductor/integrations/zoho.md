# Integration Blueprint: Zoho Ecosystem

## 1. Zoho CRM Integration
Sync customer data between the KN Biosciences platform and Zoho CRM to enable unified lead management and marketing.

### Data Mapping:
| Local Field | Zoho CRM Field | Notes |
|-------------|----------------|-------|
| first_name | First Name | |
| last_name | Last Name | |
| email | Email | Primary Key |
| phone | Phone | |
| company_name | Account Name | For B2B Clients |
| role | Customer Type | Map to Custom Dropdown |

### Workflow:
1. **Trigger:** New user registration or profile update.
2. **Action:** Call Zoho CRM API (`/Contacts` or `/Leads`).
3. **Upsert Logic:** Use Email as the duplicate check criteria.
4. **Error Handling:** Log failed syncs to `integration_logs` table; retry via cron job.

---

## 2. Zoho Books Integration
Automate financial operations including invoice generation and payment tracking.

### Workflow Triggers:
- **Order Confirmed:** Create a Sales Order in Zoho Books.
- **Payment Success:** Generate an Invoice and record a Payment.
- **Order Refunded:** Generate a Credit Note.

### Technical Implementation:
- **API Endpoints:** `/invoices`, `/customerpayments`.
- **Authentication:** OAuth 2.0 with refresh token rotation.
- **Template:** Use 'KN Biosciences Official' template ID in Zoho Books.

### Accounting Reconciliation:
- Sync daily sales totals to Zoho Books ledger.
- Export transaction logs weekly for manual audit.
