import { ShippingRate } from "@/types";

const DELHI_VERY_API_URL = process.env.DELHIVERY_API_URL || "https://track.delhivery.com";
const DELHI_VERY_API_TOKEN = process.env.DELHIVERY_API_TOKEN;

export interface DelhiveryServiceabilityResponse {
  delivery_codes: {
    postal_code: {
      pk: number;
      pickup: string;
      delivery: string;
      pre_paid: string;
      cash: string;
      repl: string;
      cod: string;
      is_oda: string;
      state: string;
      district: string;
      city: string;
    };
  }[];
}

export class DelhiveryClient {
  private token: string;

  constructor(token?: string) {
    this.token = token || DELHI_VERY_API_TOKEN || "";
  }

  /**
   * Check if a pincode is serviceable by Delhivery
   */
  async checkServiceability(pincode: string): Promise<boolean> {
    if (!this.token) {
      console.warn("Delhivery API Token is missing");
      return false;
    }

    try {
      const response = await fetch(
        `${DELHI_VERY_API_URL}/c/api/pin-codes/json/?filter_codes=${pincode}`,
        {
          headers: {
            Authorization: `Token ${this.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Delhivery API error: ${response.statusText}`);
      }

      const data: DelhiveryServiceabilityResponse = await response.json();
      
      // If delivery_codes is not empty, it's serviceable
      return data.delivery_codes && data.delivery_codes.length > 0;
    } catch (error) {
      console.error("Error checking Delhivery serviceability:", error);
      return false;
    }
  }

  /**
   * Calculate shipping rates based on weight and destination
   */
  async calculateRate(pincode: string, weightGrams: number): Promise<ShippingRate | null> {
    const isServiceable = await this.checkServiceability(pincode);
    
    if (!isServiceable) return null;

    // TODO: Implement actual Delhivery rate calculation API call
    const baseRate = 100;
    const weightKg = weightGrams / 1000;
    const calculatedCost = baseRate + Math.ceil(weightKg) * 50;

    return {
      type: "COURIER",
      carrier_name: "Delhivery",
      cost: calculatedCost,
      handling_fee: 0,
      estimated_delivery_days: 5,
      is_serviceable: true,
      description: "Standard Home Delivery",
    };
  }
}

export const delhiveryClient = new DelhiveryClient();

/**
 * Unified utility to calculate all available shipping options for a given destination and weight.
 */
export async function calculateShippingOptions(
  pincode: string,
  weightGrams: number,
  client: DelhiveryClient = delhiveryClient
): Promise<ShippingRate[]> {
  const options: ShippingRate[] = [];

  // 1. Check Delhivery (Courier)
  const courierRate = await client.calculateRate(pincode, weightGrams);
  if (courierRate) {
    options.push(courierRate);
  }

  // 2. Always offer Transport Godown if Weight > 5kg or if Courier is unserviceable
  if (!courierRate || weightGrams >= 5000) {
    options.push({
      type: "TRANSPORT",
      carrier_name: "Regional Transport (Godown Delivery)",
      cost: 0, // Freight is To-Pay at godown
      handling_fee: 150, // Flat handling/loading fee for platform
      is_serviceable: true,
      description: "Pay freight at Godown. Carriers: Navata, VRL, Kranthi, etc.",
    });
  }

  return options;
}