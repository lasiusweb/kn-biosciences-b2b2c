import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { data: quote, error } = await supabase
      .from("b2b_quotes")
      .select(
        `
        *,
        users (
          email,
          first_name,
          last_name,
          company_name,
          phone
        ),
        b2b_quote_items (
          id,
          variant_id,
          quantity,
          unit_price,
          total_price,
          product_variants (
            sku,
            weight,
            weight_unit,
            packing_type,
            form,
            products (
              name,
              description
            )
          )
        )
      `,
      )
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("Error fetching B2B quote:", error);
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error("B2B quote GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const { status, notes, admin_notes } = body;

    // Validate status
    const validStatuses = [
      "draft",
      "submitted",
      "under_review",
      "approved",
      "rejected",
      "expired",
    ];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes;
    updateData.updated_at = new Date().toISOString();

    const { data: quote, error } = await supabase
      .from("b2b_quotes")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating B2B quote:", error);
      return NextResponse.json(
        { error: "Failed to update quote" },
        { status: 500 },
      );
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error("B2B quote PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Check if quote can be deleted (only draft or rejected quotes)
    const { data: quote, error: fetchError } = await supabase
      .from("b2b_quotes")
      .select("status")
      .eq("id", params.id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    if (!["draft", "rejected"].includes(quote.status)) {
      return NextResponse.json(
        { error: "Cannot delete quote in current status" },
        { status: 400 },
      );
    }

    // Delete quote items first
    await supabase.from("b2b_quote_items").delete().eq("quote_id", params.id);

    // Delete quote
    const { error: deleteError } = await supabase
      .from("b2b_quotes")
      .delete()
      .eq("id", params.id);

    if (deleteError) {
      console.error("Error deleting B2B quote:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete quote" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("B2B quote DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
