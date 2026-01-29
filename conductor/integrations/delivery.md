# Integration Blueprint: Logistics & Shipping (Delhivery)

## Objective
Enable real-time shipping rate calculation, automated AWB generation, and live order tracking.

## 1. Rate Calculation
- **Endpoint:** `/api/v1/packages/fetch/`
- **Inputs:** Destination Pincode, Package Weight, Order Value.
- **Output:** Estimated shipping cost and expected delivery date.

## 2. AWB Generation (Shipping Labels)
- **Workflow:** When admin marks order as 'Shipped'.
- **Action:** Request `POST /api/cmu/create.json`.
- **Response:** Store Delhivery AWB number in `shipments` table.
- **PDF Generation:** Trigger label download for warehouse staff.

## 3. Order Tracking
- **Polling:** Set up a webhook listener for Delhivery status updates.
- **Status Mapping:**
    - `In Transit` -> `Shipped`
    - `Out for Delivery` -> `Out for Delivery`
    - `Delivered` -> `Delivered`
- **Customer Notification:** Trigger WhatsApp/Email alert on status change.

---

## Technical Considerations
- **Pincode Serviceability:** Fetch serviceable pincodes daily and cache in Redis.
- **Authentication:** Token-based authentication via headers.
- **Performance:** Asynchronous AWB generation via background jobs to avoid blocking UI.
