import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

async function checkAdminAuth(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return false;
  const {
    data: { user },
  } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  const role = user?.user_metadata?.role;
  return role === "admin" || role === "sales_manager";
}

export async function GET(request: Request) {
  try {
    if (!(await checkAdminAuth(request))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Internal server error: Admin client not initialized" },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const offset = (page - 1) * limit;

    let query = supabaseAdmin.from("b2b_quotes").select(
      `
        *,
        users!inner(
          first_name,
          last_name,
          email,
          phone,
          company_name
        ),
        b2b_quote_items(
          id,
          quantity,
          unit_price,
          total_price,
          product_variants(
            id,
            sku,
            products(
              name,
              images
            )
          )
        )
      `,
      { count: "exact" },
    );

    // Apply filters
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(`
        quote_number.ilike.%${search}%,
        users.first_name.ilike.%${search}%,
        users.last_name.ilike.%${search}%,
        users.email.ilike.%${search}%,
        users.company_name.ilike.%${search}%
      `);
    }

    const {
      data: quotes,
      error,
      count,
    } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching quotes:", error);
      return NextResponse.json(
        { error: "Failed to fetch quotes" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      quotes,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error in quotes API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await checkAdminAuth(request))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Internal server error: Admin client not initialized" },
        { status: 500 },
      );
    }

    const { quoteId, status, approvedAmount, notes } = await request.json();

    if (!quoteId) {
      return NextResponse.json(
        { error: "Quote ID is required" },
        { status: 400 },
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;

      // Set appropriate timestamps based on status
      if (status === "approved") {
        updateData.approved_at = new Date().toISOString();
      } else if (status === "rejected") {
        updateData.rejected_at = new Date().toISOString();
      } else if (status === "expired") {
        updateData.expired_at = new Date().toISOString();
      }
    }

    if (approvedAmount) updateData.approved_amount = approvedAmount;
    if (notes) updateData.admin_notes = notes;

    const { data, error } = await supabaseAdmin
      .from("b2b_quotes")
      .update(updateData)
      .eq("id", quoteId)
      .select()
      .single();

    if (error) {
      console.error("Error updating quote:", error);
      return NextResponse.json(
        { error: "Failed to update quote" },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in quotes PATCH API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
