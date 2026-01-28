# Technology Stack

## Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Animations:** GSAP, Lottie, Framer Motion

## Backend & Data
- **Database:** Supabase (PostgreSQL)
- **API Layer:** Hasura GraphQL + Supabase SDK
- **Authentication:** Supabase Auth (Email/Password, Phone OTP)
- **Roles:** Customer (default), Dealer, Distributor, Admin

## Phase 3: Storefront Core
- **Routing:** `/shop`, `/shop/segment/[slug]`, `/shop/crop/[slug]`, `/product/[slug]`, `/cart`.
- **Components:** ProductCard, ProductFilters, ProductDetail, CartDrawer.
- **Features:** Responsive design, optimized grid rendering, WCAG compliance.

## Phase 4: B2B Portal
- **Routes:** `/dealer/register`, `/dealer/dashboard`, `/dealer/pricing`.
- **Features:** Tiered pricing display, MOQ enforcement, Credit terms, Order approval workflow.

## Checkout & Payments
- **Gateway:** Easebuzz (SHA-512 Hash verification).
- **Serviceability:** Pincode validation with delivery date estimation.
- **Documents:** Automated PDF invoices with Zoho Books sync.

## Infrastructure & Quality
- **Deployment:** Vercel
- **Testing:** Jest + React Testing Library
- **Quality Assurance:** ESLint + Prettier
