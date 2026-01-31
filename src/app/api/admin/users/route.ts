import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

async function checkAdminAuth(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return false;
  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
  } = await supabase.auth.getUser(token);
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
    const status = searchParams.get("status");
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
    }

    if (status && status !== "all") {
      query = query.eq("status", status);
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
      data: users,
      error,
      count,
    } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 },
      );
    }

    // Calculate additional metrics for each user
    const usersWithStats = users?.map((user) => ({
      ...user,
      totalOrders: user.orders?.length || 0,
      totalQuotes: user.b2b_quotes?.length || 0,
      totalSpent:
        user.orders?.reduce(
          (sum: number, order: any) =>
            order.status === "completed" ? sum + order.total_amount : sum,
          0,
        ) || 0,
      lastOrderDate: user.orders?.[0]?.created_at || null,
    }));

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error in users API:", error);
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

    const { userId, role, status, notes } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Security: Get current user to ensure an admin doesn't demote themselves accidentally
    // (Optional: Implement more complex rules here)

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
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in users PATCH API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
