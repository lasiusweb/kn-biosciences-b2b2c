// Delhivery Shipping API Integration
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

// Delhivery API Configuration
const DELHIVERY_API_BASE_URL =
  process.env.DELHIVERY_API_BASE_URL || "https://track.delhivery.com/api/";
const DELHIVERY_API_TOKEN = process.env.DELHIVERY_API_TOKEN || "";
const DELHIVERY_WAYBILL_URL =
  process.env.DELHIVERY_WAYBILL_URL || "https://waybill.delhivery.com/";
const IS_TEST_MODE = process.env.DELHIVERY_TEST_MODE === "true";

// Delhivery API Endpoints
const DELHIVERY_ENDPOINTS = {
  // Order Management
  CREATE_ORDER: "cmu/create.json",
  EDIT_ORDER: "p/edit",
  CANCEL_ORDER: "p/cancel",

  // Pickup Management
  SCHEDULE_PICKUP: "fm/request/pickup",

  // Tracking
  TRACK_SHIPMENT: "v1/packages/json/",

  // Waybill
  DOWNLOAD_WAYBILL: "package/pdf/",

  // Service Availability
  SERVICE_AVAILABILITY: "kinko/v1/courier/serviceability/",
  GET_PINCODE_DETAILS: "c/api/pin-codes/json/",

  // Rate Calculation
  GET_RATES: "kinko/v1/fetch/rates/",
};

export interface DelhiveryAddress {
  name: string;
  phone: string;
  address: string;
  pin: string;
  city: string;
  state: string;
  country: string;
  address_type: string;
}

export interface DelhiveryPackage {
  name: string;
  order_id: string;
  quantity: number;
  price: number;
  sku: string;
  weight: number;
  length: number;
  breadth: number;
  height: number;
}

export interface DelhiveryShipment {
  shipments: {
    name: string;
    order_id: string;
    add: DelhiveryAddress;
    country_id?: string;
    payment_mode: string;
    order_date: string;
    total_amount: number;
    selling_price?: number;
    cod_amount?: number;
    quantity: number;
    weight: number;
    consignment_charge?: number;
    discount?: number;
    tax_amount?: number;
    order_type: string;
    shipping_method: string;
    seller_add?: DelhiveryAddress;
    shipping_charges?: number;
    waybill?: string;
    notification_url?: string;
    extra_parameters?: {
      return_location?: string;
      new_packaging?: string;
      shipping_charges?: number;
      partial_shipping_allowed?: boolean;
    };
  }[];
  pickup_location?: {
    name: string;
    add: DelhiveryAddress;
  };
}

export interface DelhiveryRate {
  courier_name: string;
  courier_id: string;
  estimated_delivery_days: number;
  rate: number;
  service_type: string;
  cod_surcharge?: number;
  freight_charge: number;
  cod_charge: number;
  total_charge: number;
  etd: string;
}

export interface DelhiveryTrackingInfo {
  waybill: string;
  status: string;
  delivered_at?: string;
  expected_delivery_date?: string;
  current_location: string;
  scan_datetime?: string;
  scans: Array<{
    scan_datetime: string;
    scan_status: string;
    scan_location: string;
    instructions: string;
  }>;
}

class DelhiveryService {
  private headers: Record<string, string>;

  constructor() {
    this.headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${DELHIVERY_API_TOKEN}`,
      Accept: "application/json",
    };
  }

  // Generic API request method
  private async makeRequest<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    data?: any,
    baseUrl: string = DELHIVERY_API_BASE_URL,
  ): Promise<T> {
    try {
      const url = `${baseUrl}${endpoint}`;
      const config: RequestInit = {
        method,
        headers: this.headers,
      };

      if (data && method !== "GET") {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(url, config);

      if (!response || !response.ok) {
        const errorData = response ? await response.json().catch(() => ({})) : { message: "No response from server" };
        throw new Error(
          `Delhivery API Error: ${response ? response.status : 'No Response'} - ${JSON.stringify(errorData)}`,
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      console.error("Delhivery API request failed:", error);
      throw error;
    }
  }

  // Create new shipment
  async createShipment(shipment: DelhiveryShipment): Promise<any> {
    return this.makeRequest("cmu/create.json", "POST", shipment);
  }

  // Edit existing shipment
  async editShipment(
    waybill: string,
    updates: Partial<DelhiveryShipment>,
  ): Promise<any> {
    return this.makeRequest(`p/edit?waybill=${waybill}`, "POST", updates);
  }

  // Cancel shipment
  async cancelShipment(
    waybill: string,
    cancellationReason: string = "",
  ): Promise<any> {
    const data = {
      waybill,
      cancellation: cancellationReason,
    };
    return this.makeRequest("p/cancel", "POST", data);
  }

  // Schedule pickup
  async schedulePickup(pickupData: {
    pickup_date: string;
    pickup_time: string;
    pickup_location: DelhiveryAddress;
    expected_package_count: number;
    remark?: string;
  }): Promise<any> {
    return this.makeRequest("fm/request/pickup", "POST", pickupData);
  }

  // Track shipment
  async trackShipment(waybills: string[]): Promise<DelhiveryTrackingInfo[]> {
    const waybillString = waybills.join(",");
    const trackingData = await this.makeRequest<DelhiveryTrackingInfo[]>(
      `v1/packages/json/?waybill=${waybillString}`,
      "GET",
    );

    // Handle different response formats
    if (Array.isArray(trackingData)) {
      return trackingData;
    } else if (trackingData && typeof trackingData === "object") {
      // Some endpoints return object with shipments array
      return trackingData.packages || trackingData.shipments || [trackingData];
    }

    return [];
  }

  // Get shipping rates
  async getRates(rateData: {
    origin_pin: string;
    destination_pin: string;
    weight: number;
    cod?: boolean;
    declared_value?: number;
    length?: number;
    breadth?: number;
    height?: number;
  }): Promise<DelhiveryRate[]> {
    const params = new URLSearchParams({
      md: rateData.cod ? "C" : "P", // C for COD, P for Prepaid
      origin_pin: rateData.origin_pin,
      dest_pin: rateData.destination_pin,
      weight: rateData.weight.toString(),
      ...(rateData.declared_value && {
        cod_amount: rateData.declared_value.toString(),
      }),
      ...(rateData.length && { l: rateData.length.toString() }),
      ...(rateData.breadth && { b: rateData.breadth.toString() }),
      ...(rateData.height && { h: rateData.height.toString() }),
    });

    const response = await this.makeRequest(
      `kinko/v1/fetch/rates/?${params}`,
      "GET",
    );

    // Handle response format
    if (response.rates && Array.isArray(response.rates)) {
      return response.rates;
    } else if (Array.isArray(response)) {
      return response;
    }

    return [];
  }

  // Check service availability
  async checkServiceAvailability(pincode: string): Promise<any> {
    return this.makeRequest(
      `kinko/v1/courier/serviceability/?filter=${pincode}`,
      "GET",
    );
  }

  // Get pincode details
  async getPincodeDetails(pincode: string): Promise<any> {
    return this.makeRequest(
      `c/api/pin-codes/json/?filter_pincode=${pincode}`,
      "GET",
    );
  }

  // Download waybill/label
  async downloadWaybill(waybills: string[]): Promise<Buffer> {
    const waybillString = waybills.join(",");
    const url = `${DELHIVERY_WAYBILL_URL}package/pdf/${waybillString}/`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Token ${DELHIVERY_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download waybill: ${response.status}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  // Bulk operations
  async bulkCreateShipments(shipments: DelhiveryShipment[]): Promise<any> {
    const bulkData = {
      shipments: shipments.flatMap((s) => s.shipments),
    };
    return this.makeRequest("cmu/create.json", "POST", bulkData);
  }

  // Get pickup locations
  async getPickupLocations(): Promise<any> {
    return this.makeRequest("fm/pickup/locations", "GET");
  }

  // Handle webhook events
  async handleWebhook(webhookData: any): Promise<void> {
    try {
      console.log("Delhivery webhook received:", webhookData);

      const { waybill, status, scans } = webhookData;

      // Update order status in database based on webhook
      if (waybill) {
        await this.updateOrderTracking(waybill, webhookData);
      }
    } catch (error) {
      console.error("Error processing Delhivery webhook:", error);
      throw error;
    }
  }

  // Update order tracking in database
  private async updateOrderTracking(
    waybill: string,
    trackingData: any,
  ): Promise<void> {
    // This would integrate with your database to update order tracking
    // Implementation would depend on your database structure
    console.log(`Updating tracking for waybill ${waybill}:`, trackingData);
  }

  // Validate address format for Delhivery
  validateAddress(address: Partial<DelhiveryAddress>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!address.name || address.name.trim().length < 3) {
      errors.push(
        "Recipient name is required and must be at least 3 characters",
      );
    }

    if (
      !address.phone ||
      !/^[6-9]\d{9}$/.test(address.phone.replace(/\D/g, ""))
    ) {
      errors.push("Valid Indian mobile number is required");
    }

    if (!address.pin || !/^[1-9][0-9]{5}$/.test(address.pin)) {
      errors.push("Valid 6-digit Indian pincode is required");
    }

    if (!address.address || address.address.trim().length < 10) {
      errors.push("Address is required and must be at least 10 characters");
    }

    if (!address.city || address.city.trim().length < 2) {
      errors.push("City is required");
    }

    if (!address.state || address.state.trim().length < 2) {
      errors.push("State is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Calculate package dimensions
  calculatePackageDimensions(
    items: Array<{
      weight: number;
      length?: number;
      breadth?: number;
      height?: number;
      quantity?: number;
    }>,
  ): {
    totalWeight: number;
    volumetricWeight: number;
    chargeableWeight: number;
    dimensions: {
      length: number;
      breadth: number;
      height: number;
    };
  } {
    const totalWeight = items.reduce(
      (sum, item) => sum + item.weight * (item.quantity || 1),
      0,
    );

    // Calculate volumetric weight (L*B*H/5000 for Delhivery)
    const totalVolume = items.reduce((sum, item) => {
      const l = item.length || 0;
      const b = item.breadth || 0;
      const h = item.height || 0;
      const quantity = item.quantity || 1;
      return sum + l * b * h * quantity;
    }, 0);

    const volumetricWeight = totalVolume / 5000;
    const chargeableWeight = Math.max(totalWeight, volumetricWeight);

    // Calculate consolidated dimensions (simplified)
    const totalLength = items.reduce(
      (sum, item) => Math.max(sum, item.length || 0),
      0,
    );
    const totalBreadth = items.reduce(
      (sum, item) => sum + (item.breadth || 0) * (item.quantity || 1),
      0,
    );
    const totalHeight = items.reduce(
      (sum, item) => sum + (item.height || 0) * (item.quantity || 1),
      0,
    );

    return {
      totalWeight,
      volumetricWeight,
      chargeableWeight,
      dimensions: {
        length: totalLength,
        breadth: totalBreadth,
        height: totalHeight,
      },
    };
  }
}

export const delhiveryService = new DelhiveryService();
export default delhiveryService;
