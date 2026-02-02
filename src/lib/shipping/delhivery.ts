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
   * Note: This is a simplified version. Real implementation would use Delhivery's 'Fetch Waybill' or 'Calculate Rate' API.
   * For Phase 1, we might use a logic based on their rate chart if dynamic API is complex.
   */
  async calculateRate(pincode: string, weightGrams: number): Promise<ShippingRate | null> {
    const isServiceable = await this.checkServiceability(pincode);
    
    if (!isServiceable) return null;

    // TODO: Implement actual Delhivery rate calculation API call
    // For now, using a placeholder calculation: Base ₹100 + ₹50 per kg
    const baseRate = 100;
    const weightKg = weightGrams / 1000;
    const calculatedCost = baseRate + Math.ceil(weightKg) * 50;

    return {
      type: "COURIER",
      carrier_name: "Delhivery",
      cost: calculatedCost,
      handling_fee: 0,
      estimated_delivery_days: 5, // Placeholder
      is_serviceable: true,
      description: "Standard Home Delivery",
    };
  }
}

export const delhiveryClient = new DelhiveryClient();`n/**`n * Unified utility to calculate all available shipping options for a given destination and weight.`n */`nexport async function calculateShippingOptions(`n  pincode: string,`n  weightGrams: number`n): Promise<ShippingRate[]> {`n  const options: ShippingRate[] = [];`n`n  // 1. Check Delhivery (Courier)`n  const courierRate = await delhiveryClient.calculateRate(pincode, weightGrams);`n  if (courierRate) {`n    options.push(courierRate);`n  }`n`n  // 2. Always offer Transport Godown if Weight > 5kg or if Courier is unserviceable`n  // This provides users with more economical options for bulk, even if courier is available.`n  if (!courierRate || weightGrams >= 5000) {`n    options.push({`n      type: \"TRANSPORT\",`n      carrier_name: \"Regional Transport (Godown Delivery)\",`n      cost: 0, // Freight is To-Pay at godown`n      handling_fee: 150, // Flat handling/loading fee for platform`n      is_serviceable: true,`n      description: \"Pay freight at Godown. Carriers: Navata, VRL, Kranthi, etc.\",`n    });`n  }`n`n  return options;`n}
