# Specification: User & Role Management (Track: user_management_20260131)

## Overview
Implement a comprehensive user management system within the Admin Super-App. This includes role-based access control (RBAC), user status management (active/suspended), and detailed user profile views for administration.

## Goals
- Provide admins with a central hub to manage all platform users.
- Enable secure role transitions (e.g., promoting a Customer to Staff).
- Streamline B2B client approval workflows.
- Enhance security by restricting sensitive role changes.

## Functional Requirements
### 1. User Directory (/admin/users)
- **Search:** Search by name, email, phone, or company.
- **Filtering:** Filter by role (Admin, Staff, Vendor, B2B Client, Customer) and status.
- **Pagination:** Server-side pagination for large user bases.

### 2. User Detail View
- **Profile Info:** Display name, contact, and company details.
- **Activity Summary:** Summary of total orders, quotes, and lifetime value (LTV).
- **Address Book:** View all saved addresses.

### 3. Role & Status Management
- **Role Update:** Change user roles with a confirmation modal.
- **Status Toggle:** Suspend/Activate user accounts.
- **Admin Protection:** Admins cannot change their own role or other Admin roles.

### 4. API Integration
- Utilize and extend `/api/admin/customers` to support all roles.
- Implement security checks in the API layer.

## Non-Functional Requirements
- **Security:** Strict JWT and role validation.
- **UX:** High-contrast theme consistent with the Admin Dashboard.
- **Performance:** Efficient queries using Supabase indexing.

## Acceptance Criteria
- [ ] Admin can view a paginated list of all users.
- [ ] Search and filter functionality works correctly.
- [ ] Admin can view detailed information for a specific user.
- [ ] Admin can change a user's role (e.g., Customer to Staff).
- [ ] Admin can suspend a user account, preventing login.
