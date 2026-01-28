# Specification - Storefront Core and Product Catalog

## Overview
Implement the foundational e-commerce storefront for KN Biosciences, including the product catalog, filtering systems, and initial routing.

## User Stories
- As a **Retail Customer**, I want to browse all products in a grid view so I can see what is available.
- As a **User**, I want to filter products by segments (Agriculture, Aquaculture, etc.) and crops to find relevant solutions.
- As a **User**, I want to click on a product to see detailed information, dosage, and variants.

## Functional Requirements
- **Product Grid:** Display products with images, names, and role-based prices.
- **Dynamic Routing:** 
  - `/shop` (All products)
  - `/shop/segment/[slug]` (Category filter)
  - `/shop/crop/[slug]` (Sub-category filter)
  - `/product/[slug]` (Detail page)
- **Filtering Logic:** Client-side and server-side filtering based on categories and attributes.
- **Responsive UI:** Mobile-first layout for farmers in the field.

## Technical Requirements
- Use **Next.js 14 App Router**.
- Fetch data from **Supabase/Hasura**.
- Implement **TDD** for all core components.
- Ensure **WCAG** accessibility compliance.
