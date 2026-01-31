# Implementation Plan: User & Role Management (Track: user_management_20260131)

## Phase 1: API & Types
- [x] Task: Extend User Types and API [52c6ba1]
    - [x] Update `src/types/admin.ts` with `AdminUser` and related interfaces.
    - [x] Create `/api/admin/users/route.ts` (based on customers API but role-agnostic).
    - [x] Implement robust RBAC checks in the API.
- [x] Task: Write Tests for User API [52c6ba1]
    - [x] Verify role filtering, search, and update logic in `src/app/api/admin/users/route.test.ts`.

## Phase 2: User Directory UI
- [ ] Task: Implement User Directory Page
    - [ ] Create `src/app/admin/users/page.tsx`.
    - [ ] Build the searchable/filterable user table using shadcn/ui.
    - [ ] Implement pagination controls.
- [ ] Task: Write Tests for User Directory
    - [ ] Verify rendering and search behavior in `src/app/admin/users/page.test.tsx`.

## Phase 3: User Details & Management
- [ ] Task: Implement User Detail Modal/View
    - [ ] Build the detailed profile view with stats and addresses.
- [ ] Task: Implement Role/Status Update Logic
    - [ ] Create confirmation modals for sensitive changes.
    - [ ] Integrate with the PATCH API.
- [ ] Task: Write Integration Tests
    - [ ] Verify the full end-to-end flow of updating a user role.

## Phase 4: Final Verification
- [ ] Task: Conductor - User Manual Verification 'User Management'
