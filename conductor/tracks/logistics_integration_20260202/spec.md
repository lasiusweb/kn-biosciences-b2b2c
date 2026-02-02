# Specification: Logistics Integration & Serviceability (Track: logistics_integration_20260202)

## Overview
Implement a dual-stream logistics system. Integrate standard courier services via Delhivery API for home delivery and provide a fallback "Transport Godown Delivery" for unserviceable or bulk orders using regional carriers (Navata, VRL, etc.).

## Goals
- Provide real-time serviceability checks on product and checkout pages.
- Automate shipping rate calculation for courier deliveries.
- Implement a hybrid "To-Pay" model for transport godown deliveries.
- Streamline tracking and fulfillment status across all logistics types.

## Functional Requirements
### 1. Serviceability Engine
- **Delhivery Integration:** Check pincode serviceability via Delhivery API.
- **Estimated Delivery Date (EDD):** Display estimated delivery windows for courier shipments.
- **Fallback Logic:** If a pincode is unserviceable by Delhivery, automatically offer "Transport Godown Delivery" options.

### 2. Transport Godown Selection
- **Carrier List:** Support initial list: Navata, Kranthi, VRL Logistics, TCI Freight, TSRTC, APSRTC.
- **User Selection:** Users select their preferred carrier during checkout.
- **Fulfillment:** Backend team identifies the nearest godown location based on the shipping address.

### 3. Shipping Rates & Payments
- **Courier Rates:** Real-time weight/distance-based calculation via Delhivery.
- **Godown Hybrid Model:**
  - **Upfront:** Collect a fixed "Handling/Handling-to-Transport" fee.
  - **On-Delivery:** Freight charges are "To-Pay" at the destination godown.

### 4. Order Management
- **Labels:** Generate labels with specific instructions (e.g., "Godown Delivery - [Carrier Name]").
- **Tracking:** Integrate Delhivery tracking IDs; provide manual status updates for transport carriers.

## Non-Functional Requirements
- **Performance:** Cache pincode serviceability results for 24 hours to reduce API latency.
- **Reliability:** Graceful failure if Delhivery API is down (default to manual verification or Godown fallback).

## Acceptance Criteria
- [ ] User can enter a pincode and see if Delhivery can deliver.
- [ ] User can see an estimated delivery date for courier-supported areas.
- [ ] If unserviceable, user can choose a "Transport Godown" carrier from the list.
- [ ] Checkout correctly calculates "Delhivery Shipping" vs "Transport Handling Fee".
- [ ] Admin dashboard displays the selected logistics type and carrier for fulfillment.

## Out of Scope
- Automated tracking integration for Godown Carriers (Manual status updates only).
- Return logistics (RTO) for Godown deliveries in Phase 1.
