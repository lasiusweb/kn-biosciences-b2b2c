# SEO, Polish & Asset Optimization Guide

## 1. Structured Data (JSON-LD)
Implement schemas to enhance search engine visibility and rich snippets.

### Organization Schema (Global):
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "KN Biosciences",
  "url": "https://knbiosciences.com",
  "logo": "https://knbiosciences.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-1800-XXX-XXXX",
    "contactType": "customer service"
  }
}
```

---

## 2. GSAP Animation Strategy
Use GSAP for performance-heavy, scroll-triggered sequences.

### Best Practices:
- **Clean up:** Always use `gsap.context()` inside `useEffect` or `useGSAP` hook.
- **ScrollTrigger:** Use for entry animations on sections (e.g., product reveal).
- **MatchMedia:** Responsive animations for different screen sizes.

---

## 3. Lottie Micro-interactions
Enhance UX with lightweight vector animations.

### Implementation:
- **Library:** `lottie-react`.
- **Optimization:** Compress JSON files; use 'lazy' loading for below-the-fold animations.
- **Usage:** Checkmarks for order success, subtle loading indicators, and hover effects on icons.

---

## 4. Image Optimization Workflow
- **Formats:** Prioritize `.webp` and `.avif`.
- **Next.js Image:** Use `next/image` for all assets to benefit from automatic resizing and lazy loading.
- **CDN:** All product and CMS images should be served via the Supabase Storage CDN with cache-control headers.

---

## 5. Meta-tag Strategy
- **Titles:** Max 60 characters; include primary keyword + Brand Name.
- **Descriptions:** Max 160 characters; include CTA.
- **OG Tags:** Ensure unique `og:image` for all product and blog pages.
