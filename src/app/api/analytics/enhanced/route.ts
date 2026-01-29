import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

async function checkAdminAuth(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return false;
  const {
    data: { user },
  } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  return user?.user_metadata?.role === "admin";
}

export async function GET(request: NextRequest) {
  try {
    if (!(await checkAdminAuth(request))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";
    const startDate = getStartDate(period);

    // Enhanced Sales Overview with payment tracking
    const { data: salesData, error: salesError } = await supabase
      .from("orders")
      .select(
        "total_amount, created_at, status, user_id, payment_status, subtotal, tax_amount, shipping_amount",
      )
      .gte("created_at", startDate)
      .in("status", ["confirmed", "processing", "shipped", "delivered"]);

    if (salesError) {
      console.error("Error fetching sales data:", salesError);
      return NextResponse.json(
        { error: "Failed to fetch sales data" },
        { status: 500 },
      );
    }

    // B2B Quotes Overview with detailed status tracking
    const { data: b2bData, error: b2bError } = await supabase
      .from("b2b_quotes")
      .select("total_amount, created_at, status, user_id, valid_until")
      .gte("created_at", startDate);

    if (b2bError) {
      console.error("Error fetching B2B data:", b2bError);
      return NextResponse.json(
        { error: "Failed to fetch B2B data" },
        { status: 500 },
      );
    }

    // Top Products with detailed performance metrics
    const { data: topProducts, error: productsError } = await supabase
      .from("order_items")
      .select(
        `
        quantity,
        total_price,
        unit_price,
        product_variants!inner (
          sku,
          stock_quantity,
          low_stock_threshold,
          track_inventory,
          products!inner (
            name,
            segment,
            featured
          )
        )
      `,
      )
      .gte("created_at", startDate)
      .order("total_price", { ascending: false })
      .limit(15);

    if (productsError) {
      console.error("Error fetching top products:", productsError);
      return NextResponse.json(
        { error: "Failed to fetch top products" },
        { status: 500 },
      );
    }

    // Customer Analytics with growth tracking
    const { data: customerData, error: customerError } = await supabase
      .from("users")
      .select("role, created_at, first_name, last_name, email, company_name")
      .gte("created_at", startDate);

    if (customerError) {
      console.error("Error fetching customer data:", customerError);
      return NextResponse.json(
        { error: "Failed to fetch customer data" },
        { status: 500 },
      );
    }

    // Customer retention and repeat purchase analysis
    const { data: retentionData, error: retentionError } = await supabase
      .from("orders")
      .select("user_id, created_at, total_amount")
      .gte("created_at", startDate);

    // Inventory Analytics with stock levels
    const { data: inventoryData, error: inventoryError } = await supabase
      .from("product_variants")
      .select(
        `
        sku,
        stock_quantity,
        low_stock_threshold,
        track_inventory,
        products!inner (
          name,
          segment,
          status
        )
      `,
      )
      .eq("track_inventory", true)
      .eq("products.status", "active");

    // Coupon usage analytics
    const { data: couponData, error: couponError } = await supabase
      .from("coupons")
      .select("*")
      .eq("status", "active");

    // Calculate comprehensive metrics
    const totalSales =
      salesData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const totalOrders = salesData?.length || 0;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    const totalB2BQuotes = b2bData?.length || 0;
    const totalB2BValue =
      b2bData?.reduce((sum, quote) => sum + quote.total_amount, 0) || 0;
    const approvedB2BQuotes =
      b2bData?.filter((quote) => quote.status === "approved").length || 0;

    // Advanced metrics
    const paidOrders =
      salesData?.filter((order) => order.payment_status === "paid") || [];
    const totalPaidSales = paidOrders.reduce(
      (sum, order) => sum + order.total_amount,
      0,
    );
    const paymentRate =
      totalOrders > 0 ? (paidOrders.length / totalOrders) * 100 : 0;

    // Customer retention calculation
    const uniqueCustomers = new Set(
      retentionData?.map((order) => order.user_id).filter(Boolean) || [],
    );
    const customerRetention =
      uniqueCustomers.size > 0 && retentionData
        ? (retentionData.filter(
            (order, index, arr) =>
              arr.findIndex((o) => o.user_id === order.user_id) === index,
          ).length /
            uniqueCustomers.size) *
          100
        : 0;

    // Inventory metrics
    const lowStockItems =
      inventoryData?.filter(
        (variant) => variant.stock_quantity <= variant.low_stock_threshold,
      ).length || 0;
    const totalInventoryValue =
      inventoryData?.reduce(
        (sum, variant) => sum + variant.stock_quantity * 100,
        0, // Using estimated cost
      ) || 0;

    const revenueByMonth = groupRevenueByMonth(salesData || [], period);
    const b2bRevenueByMonth = groupRevenueByMonth(b2bData || [], period);

    // Segment performance analysis
    const segmentPerformance = calculateSegmentPerformance(topProducts || []);

    // Customer growth tracking
    const customerGrowth = calculateCustomerGrowth(customerData || [], period);

    // Order status distribution
    const orderStatusDistribution = {
      confirmed:
        salesData?.filter((o: any) => o.status === "confirmed").length || 0,
      processing:
        salesData?.filter((o: any) => o.status === "processing").length || 0,
      shipped: salesData?.filter((o: any) => o.status === "shipped").length || 0,
      delivered:
        salesData?.filter((o: any) => o.status === "delivered").length || 0,
    };

    // B2B quote status distribution
    const b2bStatusDistribution = {
      draft: b2bData?.filter((q: any) => q.status === "draft").length || 0,
      submitted:
        b2bData?.filter((q: any) => q.status === "submitted").length || 0,
      under_review:
        b2bData?.filter((q: any) => q.status === "under_review").length || 0,
      approved: b2bData?.filter((q: any) => q.status === "approved").length || 0,
      rejected: b2bData?.filter((q: any) => q.status === "rejected").length || 0,
    };

    const analytics = {
      overview: {
        totalSales,
        totalOrders,
        averageOrderValue,
        totalB2BQuotes,
        totalB2BValue,
        b2bConversionRate:
          totalB2BQuotes > 0 ? (approvedB2BQuotes / totalB2BQuotes) * 100 : 0,
        paymentRate,
        customerRetentionRate: customerRetention,
        lowStockAlerts: lowStockItems,
        totalInventoryValue,
      },
      revenueByMonth,
      b2bRevenueByMonth,
      topProducts: (topProducts || []).map((item: any) => ({
        name: item.product_variants.products.name,
        sku: item.product_variants.sku,
        segment: item.product_variants.products.segment,
        totalRevenue: item.total_price,
        quantity: item.quantity,
        currentStock: item.product_variants.stock_quantity,
        unitPrice: item.unit_price,
        isLowStock:
          item.product_variants.stock_quantity <=
          item.product_variants.low_stock_threshold,
      })),
      customerSegments: {
        b2c:
          customerData?.filter((user: any) => user.role === "customer")
            .length || 0,
        b2b:
          customerData?.filter((user: any) => user.role === "b2b_client")
            .length || 0,
        other:
          customerData?.filter(
            (user: any) => !["customer", "b2b_client"].includes(user.role),
          ).length || 0,
      },
      segmentPerformance,
      customerGrowth,
      orderStatusDistribution,
      b2bStatusDistribution,
      inventoryAlerts: {
        lowStock: lowStockItems,
        totalValue: totalInventoryValue,
        outOfStock:
          inventoryData?.filter((v) => v.stock_quantity === 0).length || 0,
      },
      couponAnalytics: {
        activeCoupons: couponData?.length || 0,
        totalUsage:
          couponData?.reduce((sum, coupon) => sum + coupon.usage_count, 0) || 0,
      },
      period,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Enhanced Analytics GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

function getStartDate(period: string): string {
  const now = new Date();
  const startDate = new Date();

  switch (period) {
    case "7d":
      startDate.setDate(now.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(now.getDate() - 30);
      break;
    case "90d":
      startDate.setDate(now.getDate() - 90);
      break;
    case "1y":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 30);
  }

  return startDate.toISOString();
}

function groupRevenueByMonth(
  data: any[],
  period: string,
): Array<{ month: string; revenue: number }> {
  const revenueByMonth: { [key: string]: number } = {};

  data.forEach((item) => {
    const date = new Date(item.created_at);
    const monthKey = getMonthKey(date, period);
    revenueByMonth[monthKey] =
      (revenueByMonth[monthKey] || 0) + item.total_amount;
  });

  return Object.entries(revenueByMonth)
    .map(([month, revenue]) => ({
      month,
      revenue,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function getMonthKey(date: Date, period: string): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (period === "1y") {
    // Show month names for yearly view
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${monthNames[month - 1]} ${year}`;
  } else {
    // Show month numbers for shorter periods
    return `${year}-${month.toString().padStart(2, "0")}`;
  }
}

function calculateSegmentPerformance(
  topProducts: any[],
): Array<{ segment: string; revenue: number; quantity: number }> {
  const segmentMap: { [key: string]: { revenue: number; quantity: number } } =
    {};

  topProducts.forEach((item) => {
    const segment = item.product_variants.products.segment;
    if (!segmentMap[segment]) {
      segmentMap[segment] = { revenue: 0, quantity: 0 };
    }
    segmentMap[segment].revenue += item.total_price;
    segmentMap[segment].quantity += item.quantity;
  });

  return Object.entries(segmentMap).map(([segment, data]) => ({
    segment,
    revenue: data.revenue,
    quantity: data.quantity,
  }));
}

function calculateCustomerGrowth(
  customerData: any[],
  period: string,
): Array<{ month: string; newCustomers: number }> {
  const customerGrowth: { [key: string]: number } = {};

  customerData.forEach((customer) => {
    const date = new Date(customer.created_at);
    const monthKey = getMonthKey(date, period);
    customerGrowth[monthKey] = (customerGrowth[monthKey] || 0) + 1;
  });

  return Object.entries(customerGrowth)
    .map(([month, newCustomers]) => ({
      month,
      newCustomers,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}
