import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { B2BQuote, B2BQuoteItem } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const status = searchParams.get("status");

    let query = supabase
      .from("b2b_quotes")
      .select(
        `
        *,
        b2b_quote_items (
          id,
          variant_id,
          quantity,
          unit_price,
          total_price,
          product_variants (
            sku,
            product_id,
            products (
              name
            )
          )
        ),
        order:orders!linked_order_id (
          id,
          order_number,
          payment_link_url
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching B2B quotes:", error);
      return NextResponse.json(
        { error: "Failed to fetch quotes" },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("B2B quotes GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      items,
      notes,
      valid_until,
      subtotal,
      tax_amount,
      total_amount,
    } = body;

    // Validate required fields
    if (!user_id || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate each item
    for (const item of items) {
      if (!item.variant_id || !item.quantity || !item.unit_price) {
        return NextResponse.json(
          { error: "Invalid item data" },
          { status: 400 },
        );
      }
    }

    // Start a Supabase transaction
    const { data: quote, error: quoteError } = await supabase
      .from("b2b_quotes")
      .insert({
        user_id,
        status: "submitted",
        valid_until:
          valid_until ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        subtotal,
        tax_amount,
        total_amount,
        notes,
      })
      .select()
      .single();

    if (quoteError) {
      console.error("Error creating B2B quote:", quoteError);
      return NextResponse.json(
        { error: "Failed to create quote" },
        { status: 500 },
      );
    }

    // Insert quote items
    const quoteItems = items.map((item: any) => ({
      quote_id: quote.id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price || item.quantity * item.unit_price,
    }));

    const { error: itemsError } = await supabase
      .from("b2b_quote_items")
      .insert(quoteItems);

    if (itemsError) {
      console.error("Error creating B2B quote items:", itemsError);
      // Rollback quote creation
      await supabase.from("b2b_quotes").delete().eq("id", quote.id);
      return NextResponse.json(
        { error: "Failed to create quote items" },
        { status: 500 },
      );
    }

    // Update quote with items count
    const { data: completeQuote, error: updateError } = await supabase
      .from("b2b_quotes")
      .select(
        `
        *,
        b2b_quote_items (
          id,
          variant_id,
          quantity,
          unit_price,
          total_price
        )
      `,
      )
      .eq("id", quote.id)
      .single();

    if (updateError) {
      console.error("Error fetching complete quote:", updateError);
    }

    return NextResponse.json(completeQuote, { status: 201 });
  } catch (error) {
    console.error("B2B quotes POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
