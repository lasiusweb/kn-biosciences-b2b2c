import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user || user.user_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Internal server error: Admin client not initialized" },
        { status: 500 },
      );
    }

    const supabaseAdminClient = supabaseAdmin;

    // Get basic stats
    const [
      { count: totalOrders },
      { count: totalCustomers },
      { count: totalProducts },
      { count: pendingQuotes },
      recentOrders,
      monthlyRevenue,
    ] = await Promise.all([
      // Total orders count
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed"),

      // Total customers count
      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .in("role", ["customer", "b2b_client"]),

      // Total products count
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"),

      // Pending quotes count
      supabase
        .from("b2b_quotes")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),

      // Recent orders
      supabase
        .from("orders")
        .select(
          `
          id,
          order_number,
          total_amount,
          status,
          created_at,
          users!inner(
            first_name,
            last_name,
            email
          )
        `,
        )
        .order("created_at", { ascending: false })
        .limit(5),

      // Monthly revenue (last 30 days)
      supabase
        .from("orders")
        .select("total_amount")
        .eq("status", "completed")
        .gte(
          "created_at",
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        ),
    ]);

    // Calculate monthly revenue
    const revenue =
      monthlyRevenue?.data?.reduce(
        (sum: number, order: any) => sum + order.total_amount,
        0,
      ) || 0;

    const stats = {
      totalOrders: totalOrders || 0,
      totalCustomers: totalCustomers || 0,
      totalProducts: totalProducts || 0,
      pendingQuotes: pendingQuotes || 0,
      monthlyRevenue: revenue,
      recentOrders: recentOrders?.data || [],
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin statistics" },
      { status: 500 },
    );
  }
}
