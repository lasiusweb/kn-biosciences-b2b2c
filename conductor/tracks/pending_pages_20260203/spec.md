# Specification: Pending Pages Design and Implementation (Track: pending_pages_20260203)

## Overview
Implement the remaining essential static and semi-dynamic pages for the KN Biosciences platform. This includes the 'About Us', 'Contact Us', 'FAQ', and 'Legal' pages (Privacy Policy, Terms & Conditions, Refund Policy). These pages are critical for establishing brand trust, providing customer support, and ensuring regulatory compliance.

## Goals
- Complete the storefront by adding necessary informational pages.
- Provide a professional and trustworthy presentation of the company.
- Implement functional contact methods and a categorized FAQ system.
- Ensure legal documents are easily manageable via the CMS.

## Functional Requirements
### 1. About Us Page (`/about`)
- **Sections:**
    - **Mission & Vision:** Clear statement of company purpose and future goals.
    - **Our Story:** Historical context and growth of KN Biosciences.
    - **Leadership Team:** Profiles of founders and key leadership.
    - **Certifications & Awards:** Showcase industry recognition and quality standards.
    - **Impact & Sustainability:** Highlight environmental and social contributions.

### 2. Contact Us Page (`/contact`)
- **Elements:**
    - Interactive Contact Form (Name, Email, Phone, Subject, Message).
    - Display of physical address, phone numbers, and email.
    - Embedded Google Map for location.
- **Logic:**
    - Form submissions must be stored in the Supabase `contact_submissions` table.
    - Trigger an automated email notification to the administrative team.
    - Synchronize the submission as a new lead in Zoho CRM.

### 3. FAQ Page (`/faq`)
- **Features:**
    - **Accordion Layout:** Interactive Q&A sections.
    - **Categorization:** Group FAQs by topics (e.g., Shipping, Payments, Product Usage).
    - **Search Functionality:** Real-time search to find specific answers.
    - **Support CTA:** Link to the contact page if the user's question is not answered.

### 4. Legal Pages (`/privacy-policy`, `/terms`, `/refund-policy`)
- **Management:**
    - Content must be fetched from a centralized Supabase table (e.g., `legal_content`) to allow updates without code redeployment.
    - Support for versioning or "Last Updated" dates.
- **Presentation:**
    - Clean, readable typography optimized for long-form legal text.
    - Simple navigation between different legal documents.

## Non-Functional Requirements
- **SEO:** Each page must have optimized meta tags and structured data (JSON-LD).
- **Performance:** Dynamic content (FAQ, Legal) should be cached or served via ISR for high performance.
- **Accessibility:** Ensure all interactive elements (accordions, forms) are fully accessible (WCAG compliant).
- **Responsive Design:** Seamless layout transitions across mobile, tablet, and desktop.

## Acceptance Criteria
- [ ] All pages (`/about`, `/contact`, `/faq`, `/privacy-policy`, `/terms`, `/refund-policy`) are accessible via the navigation.
- [ ] The Contact form successfully sends an email, stores in Supabase, and syncs to Zoho CRM.
- [ ] FAQs are categorized and searchable.
- [ ] Legal page content can be updated via the database/CMS and reflects immediately (or after cache revalidation).
- [ ] All pages pass basic accessibility and SEO audits.

## Out of Scope
- Detailed individual staff member pages (only leadership profiles).
- Live chat integration (Phase 2).
- Dynamic "Career" or "Job Posting" section.