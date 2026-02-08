# Technology Stack

## Frontend
- **Framework:** Next.js 16+ (App Router with Turbopack) - Latest high-performance framework for server-side rendering.
- **Language:** TypeScript - Ensures type safety and improves developer productivity.
- **Styling:** Tailwind CSS v4 + shadcn/ui - Modern utility-first CSS using native CSS theme tokens for deep integration.
- **PostCSS:** @tailwindcss/postcss - Required for v4 compatibility.
- **Animations:** GSAP, Lottie, Framer Motion - Robust libraries for creating complex and smooth user interactions.

## Backend & Data
- **Database:** Supabase (PostgreSQL)
- **API Layer:** Hasura GraphQL + Supabase SDK
- **Authentication:** Supabase Auth (Email/Password, Phone OTP)
- **Roles:** Admin, Staff, Sales Manager, Vendor, B2B Client, Customer (default)
- **RBAC:** Server-side JWT validation and role-based route protection.

## Informational & CMS
- **Routes:** `/about`, `/contact`, `/faq`, `/privacy-policy`, `/terms-and-conditions`, `/refund-policy`.
- **CMS:** Dynamic content management for Legal and FAQ sections via Supabase tables (`legal_content`, `faqs`).

## Phase 3: Storefront Core
- **Routing:** `/shop`, `/shop/segment/[slug]`, `/shop/segment/[slug]/[crop]`, `/product/[slug]`, `/cart`.
- **Components:** ProductCard, ProductFilters, ProductDetail, CartDrawer, SegmentHubLayout, CropEnvironmentView, KnowledgeSidebar.
- **Features:** Responsive design, optimized grid rendering, WCAG compliance.

## Phase 4: B2B Portal
- **Routes:** `/dealer/register`, `/dealer/dashboard`, `/dealer/pricing`.
- **Features:** Tiered pricing display, MOQ enforcement, Credit terms, Order approval workflow.

## Checkout & Payments
- **Gateway:** Easebuzz (Main), Razorpay (B2B Payment Links).
- **Serviceability:** Pincode validation with delivery date estimation.
- **Documents:** Automated PDF invoices with Zoho Books sync.

 ## Integrations & Strategy (Blueprints)
 - **Zoho Integration:** Zoho CRM for leads and contacts, Zoho Books for invoices, estimates, and bi-directional inventory sync. Includes an Admin Dashboard for managing sync logs and retries.
 - **Logistics:** Dual-stream integration with Delhivery API (Courier) and Regional Transport (Godown Delivery via Navata, VRL, etc.).- **Shipping Calculation:** Automated fallback logic based on weight (>=5kg) and pincode serviceability.
- **SEO:** Structured JSON-LD schemas for Organization, Product, LocalBusiness, FAQPage, Article, AboutPage, and ContactPage.
- **Communications:** Twilio WhatsApp Business API for automated transaction notifications.

## Infrastructure & Quality
- **Deployment:** Vercel
- **Testing:** Jest + React Testing Library
- **Quality Assurance:** ESLint + Prettier
