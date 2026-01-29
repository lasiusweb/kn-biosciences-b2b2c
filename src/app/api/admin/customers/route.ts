import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

async function checkAdminAuth(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return false;
  const {
    data: { user },
  } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  return user?.user_metadata?.role === "admin";
}

export async function GET(request: Request) {
  try {
    if (!(await checkAdminAuth(request))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const offset = (page - 1) * limit;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Internal server error: Admin client not initialized" },
        { status: 500 },
      );
    }

    let query = supabaseAdmin.from("users").select(
      `
        *,
        addresses(
          id,
          type,
          street_address,
          city,
          state,
          postal_code,
          country,
          is_default
        ),
        orders(
          id,
          order_number,
          total_amount,
          status,
          created_at
        ),
        b2b_quotes(
          id,
          quote_number,
          total_amount,
          status,
          created_at
        )
      `,
      { count: "exact" },
    );

    // Apply filters
    if (role && role !== "all") {
      query = query.eq("role", role);
    } else {
      // Exclude admin users from default view
      query = query.in("role", ["customer", "b2b_client"]);
    }

    if (search) {
      query = query.or(`
        first_name.ilike.%${search}%,
        last_name.ilike.%${search}%,
        email.ilike.%${search}%,
        company_name.ilike.%${search}%,
        phone.ilike.%${search}%
      `);
    }

    const {
      data: customers,
      error,
      count,
    } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching customers:", error);
      return NextResponse.json(
        { error: "Failed to fetch customers" },
        { status: 500 },
      );
    }

    // Calculate additional metrics for each customer
    const customersWithStats = customers?.map((customer) => ({
      ...customer,
      totalOrders: customer.orders?.length || 0,
      totalQuotes: customer.b2b_quotes?.length || 0,
      totalSpent:
        customer.orders?.reduce(
          (sum: number, order: any) =>
            order.status === "completed" ? sum + order.total_amount : sum,
          0,
        ) || 0,
      lastOrderDate: customer.orders?.[0]?.created_at || null,
    }));

    return NextResponse.json({
      customers: customersWithStats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error in customers API:", error);
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

    const { customerId, role, status, notes } = await request.json();

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 },
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (notes) updateData.admin_notes = notes;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Internal server error: Admin client not initialized" },
        { status: 500 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .update(updateData)
      .eq("id", customerId)
      .select()
      .single();

    if (error) {
      console.error("Error updating customer:", error);
      return NextResponse.json(
        { error: "Failed to update customer" },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in customers PATCH API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
