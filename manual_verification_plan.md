# Manual Verification Steps for Phase 1: Architecture & Data Fetching

**Objective:** Verify that the backend API extensions and dynamic SEO metadata for segment pages are functioning correctly.

## Automated Tests Status:
- `src/lib/__tests__/product-service-extended.test.ts`: Passed (100% coverage for `src/lib/product-service.ts`)
- `src/app/shop/segment/__tests__/metadata.test.ts`: Failed (persistent Jest mocking issues, manual verification required for `generateMetadata`)

## 1. Prerequisites:
*   Ensure the development server is running: `npm run dev`
*   Ensure your Supabase instance is populated with sample data for products, segments, crops, and problem solutions, including `meta_title` and `meta_description` fields for some products.
*   Ensure a product exists for at least one segment (e.g., 'agriculture') and has its `meta_title` and `meta_description` fields populated.
*   Ensure a product exists for a crop (e.g., 'paddy') and a problem (e.g., 'dry-soil') for future testing of those endpoints.

## 2. Verify API Endpoint for Segment Products (through server-side logs):
*   **Action:** Temporarily add a `console.log` in `src/app/shop/segment/[slug]/page.tsx` within the `SegmentPage` component, e.g., `console.log('Products for segment:', products);`.
*   **Action:** Navigate to `http://localhost:3000/shop/segment/agriculture` (or another populated segment slug).
*   **Expected Outcome:** Observe the server-side console logs (where `npm run dev` is running) to confirm that `getProductsBySegment('agriculture')` successfully fetches and logs an array of products for that segment. This confirms the data fetching logic works.

## 3. Verify Dynamic SEO Metadata for Segment Pages:
*   **Action:** Open your browser and navigate to `http://localhost:3000/shop/segment/agriculture`.
*   **Action:** Open your browser's developer tools (usually F12), go to the "Elements" tab, and inspect the `<head>` section of the HTML.
*   **Expected Outcome:**
    *   Confirm the `<title>` tag content matches the `meta_title` of the first product in the 'agriculture' segment (e.g., "Organic Fertilizer for Agriculture"). If no product meta_title is set, it should fallback to "Shop Agriculture Solutions - KN Biosciences".
    *   Confirm the `<meta name="description" ...>` content matches the `meta_description` of the first product in the 'agriculture' segment. If no product meta_description is set, it should fallback to "Explore our comprehensive range of agriculture products and solutions."
    *   Verify the `og:title`, `og:description`, `og:url`, `twitter:title`, `twitter:description`, `twitter:card` (should be `summary_large_image`), and `og:image`/`twitter:image` (if an image URL is present in the product data).

## 4. Verify Default Metadata for Nonexistent/Empty Segments:
*   **Action:** Navigate to `http://localhost:3000/shop/segment/nonexistent-segment` (use a slug for which no products exist).
*   **Action:** Open your browser's developer tools and inspect the `<head>` section.
*   **Expected Outcome:**
    *   Confirm the `<title>` tag content is "Shop Products - KN Biosciences".
    *   Confirm the `<meta name="description" ...>` content is "Explore the wide range of agricultural and aquaculture products by KN Biosciences."
    *   Verify `og:title`, `og:description`, `og:url` (should be `/shop`), `twitter:title`, `twitter:description`.

Does this meet your expectations? Please confirm with yes or provide feedback on what needs to be changed.
