# Manual Testing Instructions - Zoho Integration

## 🎯 Ready for Manual Verification

### Prerequisites
1. Zoho Developer Account
2. Zoho CRM and Books access
3. OAuth application set up in Zoho
4. Environment variables configured

### Environment Setup
Add these to your `.env.local`:

```bash
# Zoho OAuth Configuration
ZOHO_CLIENT_ID=your_zoho_client_id
ZOHO_CLIENT_SECRET=your_zoho_client_secret
ZOHO_REDIRECT_URI=https://localhost:3000/api/zoho/callback
ZOHO_ACCOUNTS_DOMAIN=https://accounts.zoho.in
```

### Testing Checklist

#### 1. Database Migration
```bash
npm run migrate
```
✅ Verify new tables exist:
- `zoho_tokens`
- `zoho_sync_logs` 
- `zoho_crm_id` and `zoho_books_id` columns in users, products, orders, b2b_quotes

#### 2. OAuth Flow Testing
1. Visit `/api/zoho/auth` to initiate OAuth flow
2. Complete authorization in Zoho
3. Verify tokens are stored in `zoho_tokens` table
4. Test token refresh functionality

#### 3. CRM Sync Testing
1. **User Registration Sync:**
   ```typescript
   // Test with a new user registration
   const result = await zohoSyncService.syncUserRegistration('user-id');
   ```

2. **Contact Form Sync:**
   ```typescript
   // Test with a contact form submission
   const result = await zohoSyncService.syncContactSubmission('submission-id');
   ```

3. **B2B Quote Sync:**
   ```typescript
   // Test with a B2B quote
   const result = await zohoSyncService.syncB2BQuote('quote-id');
   ```

#### 4. Verify in Zoho CRM
- Check Contacts tab for synced users
- Check Leads tab for form submissions and quote requests
- Verify data mapping accuracy (names, emails, phone numbers, company info)

#### 5. Error Handling Test
1. Disable internet connection
2. Test sync operations - should handle gracefully
3. Check `zoho_sync_logs` table for error entries
4. Test retry logic by re-enabling connection

## 🔍 Expected Results

### Successful Sync
- ✅ Users appear as Contacts in Zoho CRM
- ✅ Contact forms create Leads with proper categorization
- ✅ B2B quotes create Leads with company and quote details
- ✅ All sync operations logged with status
- ✅ Error handling works without crashing

### Data Verification
- ✅ First/Last names split correctly
- ✅ Email addresses mapped accurately
- ✅ Phone numbers formatted properly
- ✅ Company names and GST numbers included
- ✅ Lead sources categorized correctly

## 🐛 Troubleshooting

### Common Issues
1. **OAuth Flow Fails**
   - Check redirect URI matches Zoho app settings
   - Verify client ID and secret are correct
   - Ensure proper HTTPS (or localhost) setup

2. **API Calls Fail**
   - Check token is valid and not expired
   - Verify API scopes include CRM access
   - Check rate limits and permissions

3. **Data Not Syncing**
   - Verify database migrations ran
   - Check logs for error messages
   - Ensure Supabase connection is working

### Debug Information
Check these logs:
```bash
# Zoho Auth logs
[Zoho Auth] Successfully obtained and stored tokens
[Zoho Auth] Token expired or expiring soon, refreshing...

# CRM Sync logs  
[Zoho CRM] Creating contact for email: user@example.com
[Zoho CRM] Successfully created contact with ID: 123456789

# Sync Service logs
[Zoho Sync] Syncing user registration: user@example.com
[Zoho Sync] Successfully synced user: user@example.com -> Zoho Contact ID: 123456789
```

## 📋 Manual Verification Steps for Conductor

Once manual testing is complete, update the conductor status:

1. **Phase 1 - Foundation & Authentication:** Mark as ✅ if:
   - OAuth flow works end-to-end
   - Tokens stored and refresh automatically
   - Auth client handles errors gracefully

2. **Phase 2 - CRM Integration:** Mark as ✅ if:
   - User registrations sync to Contacts
   - Contact forms sync to Leads  
   - B2B quotes sync to Leads
   - All operations are logged properly

## 🚀 Next Steps After Manual Verification

If Phase 1 & 2 are verified complete, proceed to:

### Phase 3 - Books Integration (Invoices & Estimates)
- Build Zoho Books API client
- Implement invoice creation for B2C orders
- Implement estimate creation for B2B quotes  
- Add GST tax calculation logic
- Test financial data mapping

This testing phase ensures the foundation is solid before moving to financial integration.