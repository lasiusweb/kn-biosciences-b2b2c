import { NextRequest, NextResponse } from "next/server";
import { delhiveryService } from "@/lib/shipping/delhivery";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const rateRequest = await request.json();

    // Validate required fields
    if (
      !rateRequest.origin_pin ||
      !rateRequest.destination_pin ||
      !rateRequest.weight
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields: origin_pin, destination_pin, weight",
        },
        { status: 400 },
      );
    }

    // Get shipping rates from Delhivery
    const rates = await delhiveryService.getRates({
      origin_pin: rateRequest.origin_pin,
      destination_pin: rateRequest.destination_pin,
      weight: rateRequest.weight,
      cod: rateRequest.cod || false,
      declared_value: rateRequest.declared_value,
      length: rateRequest.length,
      breadth: rateRequest.breadth,
      height: rateRequest.height,
    });

    // If no rates available, check service availability
    if (rates.length === 0) {
      const originAvailability =
        await delhiveryService.checkServiceAvailability(rateRequest.origin_pin);
      const destAvailability = await delhiveryService.checkServiceAvailability(
        rateRequest.destination_pin,
      );

      return NextResponse.json(
        {
          success: false,
          message: "No shipping rates available",
          origin_serviceable: originAvailability.serviceable || false,
          destination_serviceable: destAvailability.serviceable || false,
          suggestions: [
            "Check if both pin codes are correct",
            "Try different shipping method",
            "Contact support for assistance",
          ],
        },
        { status: 404 },
      );
    }

    // Process and enhance rates with additional information
    const processedRates = rates.map((rate) => ({
      ...rate,
      service_type: rate.service_type || "Standard",
      estimated_delivery: `${rate.estimated_delivery_days || 3 - 7} business days`,
      features: getServiceFeatures(rate.service_type, rate.courier_name),
      is_recommended: rate.courier_name.toLowerCase().includes("delhivery"),
      // Add KN Biosciences specific markup/discounts
      final_rate: calculateFinalRate(
        rate.rate,
        rate.cod_surcharge,
        rate.courier_name,
      ),
    }));

    // Sort by final rate and recommended status
    processedRates.sort((a, b) => {
      if (a.is_recommended && !b.is_recommended) return -1;
      if (!a.is_recommended && b.is_recommended) return 1;
      return a.final_rate - b.final_rate;
    });

    return NextResponse.json({
      success: true,
      rates: processedRates,
      metadata: {
        origin_pin: rateRequest.origin_pin,
        destination_pin: rateRequest.destination_pin,
        weight: rateRequest.weight,
        cod: rateRequest.cod || false,
        total_rates: rates.length,
        calculated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Shipping rate calculation error:", error);
    return NextResponse.json(
      {
        error: "Failed to calculate shipping rates",
        message: "Please try again later or contact support",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const origin_pin = searchParams.get("origin_pin");
    const destination_pin = searchParams.get("destination_pin");
    const weight = searchParams.get("weight");

    if (!origin_pin || !destination_pin || !weight) {
      return NextResponse.json(
        { error: "Missing required query parameters" },
        { status: 400 },
      );
    }

    // Get origin and destination details for better user experience
    const [originDetails, destDetails] = await Promise.all([
      delhiveryService.getPincodeDetails(origin_pin),
      delhiveryService.getPincodeDetails(destination_pin),
    ]);

    const rates = await delhiveryService.getRates({
      origin_pin,
      destination_pin,
      weight: parseFloat(weight),
    });

    return NextResponse.json({
      success: true,
      origin: originDetails,
      destination: destDetails,
      rates: rates.map((rate) => ({
        ...rate,
        final_rate: calculateFinalRate(
          rate.rate,
          rate.cod_surcharge,
          rate.courier_name,
        ),
      })),
    });
  } catch (error) {
    console.error("GET shipping rates error:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipping information" },
      { status: 500 },
    );
  }
}

// Helper functions
function getServiceFeatures(
  serviceType: string,
  courierName: string,
): string[] {
  const features: string[] = [];

  if (courierName.toLowerCase().includes("delhivery")) {
    features.push("Real-time tracking", "Free pickup", "Insurance coverage");
  }

  switch (serviceType?.toLowerCase()) {
    case "express":
    case "expedited":
      features.push("Fast delivery", "Priority handling");
      break;
    case "surface":
      features.push("Cost-effective", "Ground shipping");
      break;
    case "cargo":
      features.push("Heavy parcels", "Large items");
      break;
    default:
      features.push("Standard delivery", "Regular handling");
  }

  return features;
}

function calculateFinalRate(
  baseRate: number,
  codSurcharge: number = 0,
  courierName: string,
): number {
  // Apply KN Biosciences business logic
  let finalRate = baseRate;

  // Add COD surcharge if applicable
  finalRate += codSurcharge;

  // Apply bulk discounts for KN Biosciences customers
  if (courierName.toLowerCase().includes("delhivery")) {
    finalRate *= 0.95; // 5% discount on preferred courier
  }

  // Apply minimum shipping charge
  finalRate = Math.max(finalRate, 45); // Minimum ₹45 for standard shipping

  // Round to 2 decimal places
  return Math.round(finalRate * 100) / 100;
}

// Bulk rate calculation for multiple orders
export async function POST_bulk(request: NextRequest) {
  try {
    const { orders } = await request.json();

    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json(
        { error: "Invalid bulk request" },
        { status: 400 },
      );
    }

    const bulkRates = await Promise.all(
      orders.map(async (order) => {
        try {
          const rates = await delhiveryService.getRates({
            origin_pin: order.origin_pin,
            destination_pin: order.destination_pin,
            weight: order.weight,
            cod: order.cod,
            declared_value: order.declared_value,
          });

          return {
            order_id: order.order_id,
            rates: rates.map((rate) => ({
              ...rate,
              final_rate: calculateFinalRate(
                rate.rate,
                rate.cod_surcharge,
                rate.courier_name,
              ),
            })),
          };
        } catch (error) {
          return {
            order_id: order.order_id,
            error: "Failed to calculate rates",
            details: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }),
    );

    return NextResponse.json({
      success: true,
      bulk_rates: bulkRates,
      processed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Bulk rate calculation error:", error);
    return NextResponse.json(
      { error: "Failed to process bulk rate calculation" },
      { status: 500 },
    );
  }
}
