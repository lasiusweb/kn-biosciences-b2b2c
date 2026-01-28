import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("product_variants")
      .select(
        `
        id,
        sku,
        price,
        cost_price,
        stock_quantity,
        weight,
        weight_unit,
        packing_type,
        form,
        products (
          id,
          name,
          segment,
          status
        )
      `,
      )
      .eq("products.status", "active")
      .order("sku");

    if (error) {
      console.error("Error fetching B2B products:", error);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 },
      );
    }

    // Calculate wholesale pricing based on volume tiers
    const productsWithWholesalePricing = data.map((product: any) => {
      const basePrice = product.price;
      const wholesalePricing = {
        bronze: Math.round(basePrice * 0.95), // 5% off
        silver: Math.round(basePrice * 0.9), // 10% off
        gold: Math.round(basePrice * 0.85), // 15% off
      };

      return {
        ...product,
        wholesale_pricing: wholesalePricing,
      };
    });

    return NextResponse.json(productsWithWholesalePricing);
  } catch (error) {
    console.error("B2B products GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
