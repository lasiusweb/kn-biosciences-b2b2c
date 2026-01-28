import { NextRequest, NextResponse } from "next/server";
import { delhiveryService } from "@/lib/shipping/delhivery";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const waybill = searchParams.get("waybill");
    const order_id = searchParams.get("order_id");

    if (!waybill && !order_id) {
      return NextResponse.json(
        { error: "Missing tracking identifier (waybill or order_id)" },
        { status: 400 },
      );
    }

    // If order_id provided, get waybill from database first
    let trackingWaybills: string[] = [];

    if (waybill) {
      trackingWaybills = [waybill];
    } else if (order_id) {
      // Get waybill(s) from order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("shipping_waybill, tracking_info")
        .eq("id", order_id)
        .single();

      if (orderError || !order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (order.shipping_waybill) {
        trackingWaybills = order.shipping_waybill
          .split(",")
          .map((w) => w.trim());
      } else {
        return NextResponse.json(
          { error: "No tracking information available for this order" },
          { status: 404 },
        );
      }
    }

    // Get tracking data from Delhivery
    const trackingData = await delhiveryService.trackShipment(trackingWaybills);

    if (trackingData.length === 0) {
      return NextResponse.json(
        { error: "No tracking information found" },
        { status: 404 },
      );
    }

    // Enhance tracking data with additional information
    const enhancedTracking = trackingData.map((tracking) => {
      const statusInfo = getTrackingStatusInfo(tracking.status);
      const timeline = buildTrackingTimeline(tracking.scans || []);

      return {
        ...tracking,
        status_info: statusInfo,
        timeline,
        estimated_delivery: getEstimatedDelivery(tracking),
        current_stage: getCurrentStage(tracking.status),
        is_delivered: tracking.status.toLowerCase().includes("delivered"),
        has_issues:
          tracking.status.toLowerCase().includes("rto") ||
          tracking.status.toLowerCase().includes("lost"),
      };
    });

    // Update database with latest tracking info
    if (order_id) {
      await updateOrderTracking(order_id, enhancedTracking[0]);
    }

    return NextResponse.json({
      success: true,
      tracking: enhancedTracking,
      requested_at: new Date().toISOString(),
      total_packages: trackingData.length,
    });
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch tracking information",
        message: "Please try again later or contact support",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { waybills, order_ids } = await request.json();

    if (!waybills && !order_ids) {
      return NextResponse.json(
        { error: "Either waybills or order_ids array is required" },
        { status: 400 },
      );
    }

    let trackingWaybills: string[] = [];

    if (waybills) {
      trackingWaybills = Array.isArray(waybills) ? waybills : [waybills];
    } else if (order_ids) {
      // Get waybills from database for multiple orders
      const { data: orders } = await supabase
        .from("orders")
        .select("id, shipping_waybill")
        .in("id", Array.isArray(order_ids) ? order_ids : [order_ids]);

      trackingWaybills = orders
        .filter((order) => order.shipping_waybill)
        .flatMap((order) =>
          order.shipping_waybill.split(",").map((w) => w.trim()),
        );
    }

    if (trackingWaybills.length === 0) {
      return NextResponse.json(
        { error: "No valid waybills found for tracking" },
        { status: 400 },
      );
    }

    // Get tracking data for all waybills
    const trackingData = await delhiveryService.trackShipment(trackingWaybills);

    const bulkTracking = trackingData.map((tracking) => ({
      ...tracking,
      status_info: getTrackingStatusInfo(tracking.status),
      timeline: buildTrackingTimeline(tracking.scans || []),
      current_stage: getCurrentStage(tracking.status),
    }));

    return NextResponse.json({
      success: true,
      tracking: bulkTracking,
      requested_at: new Date().toISOString(),
      total_waybills: trackingWaybills.length,
      total_tracked: trackingData.length,
    });
  } catch (error) {
    console.error("Bulk tracking error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bulk tracking information" },
      { status: 500 },
    );
  }
}

// Webhook endpoint for tracking updates
export async function PUT(request: NextRequest) {
  try {
    const trackingUpdate = await request.json();

    // Validate webhook data
    if (!trackingUpdate.waybill) {
      return NextResponse.json(
        { error: "Invalid webhook data: missing waybill" },
        { status: 400 },
      );
    }

    // Process webhook update
    await delhiveryService.handleWebhook(trackingUpdate);

    return NextResponse.json({
      success: true,
      message: "Tracking update processed successfully",
    });
  } catch (error) {
    console.error("Tracking webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process tracking update" },
      { status: 500 },
    );
  }
}

// Helper functions
function getTrackingStatusInfo(status: string) {
  const statusMap: Record<
    string,
    {
      label: string;
      description: string;
      color: string;
      icon: string;
    }
  > = {
    manifested: {
      label: "Order Manifested",
      description: "Order has been registered with the courier",
      color: "blue",
      icon: "package",
    },
    picked: {
      label: "Picked Up",
      description: "Package has been collected from seller",
      color: "orange",
      icon: "truck",
    },
    "in-transit": {
      label: "In Transit",
      description: "Package is on the way to destination",
      color: "purple",
      icon: "truck-moving",
    },
    "out-for-delivery": {
      label: "Out for Delivery",
      description: "Package is with delivery executive",
      color: "green",
      icon: "user-check",
    },
    delivered: {
      label: "Delivered",
      description: "Package has been delivered successfully",
      color: "green",
      icon: "check-circle",
    },
    rto: {
      label: "Return to Origin",
      description: "Package is being returned to sender",
      color: "red",
      icon: "arrow-left",
    },
    lost: {
      label: "Lost",
      description: "Package has been reported as lost",
      color: "red",
      icon: "alert-circle",
    },
    cancelled: {
      label: "Cancelled",
      description: "Shipment has been cancelled",
      color: "gray",
      icon: "x-circle",
    },
  };

  return (
    statusMap[status.toLowerCase()] || {
      label: "Unknown Status",
      description: "Status information not available",
      color: "gray",
      icon: "help-circle",
    }
  );
}

function buildTrackingTimeline(scans: Array<any>) {
  if (!scans || scans.length === 0) {
    return [];
  }

  return scans
    .map((scan, index) => ({
      id: `scan_${index}`,
      timestamp: scan.scan_datetime,
      status: scan.scan_status,
      location: scan.scan_location,
      description: scan.instructions || scan.scan_status,
      date: new Date(scan.scan_datetime).toLocaleDateString(),
      time: new Date(scan.scan_datetime).toLocaleTimeString(),
      is_current: index === scans.length - 1,
    }))
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
}

function getCurrentStage(status: string): string {
  const statusLower = status.toLowerCase();

  if (statusLower.includes("delivered")) return "delivered";
  if (statusLower.includes("out-for-delivery")) return "out_for_delivery";
  if (statusLower.includes("in-transit")) return "in_transit";
  if (statusLower.includes("picked")) return "picked_up";
  if (statusLower.includes("manifested")) return "manifested";
  if (statusLower.includes("rto")) return "return";
  if (statusLower.includes("lost")) return "lost";

  return "unknown";
}

function getEstimatedDelivery(tracking: any): string | null {
  if (tracking.expected_delivery_date) {
    return tracking.expected_delivery_date;
  }

  // Fallback to last scan if it has delivery estimate
  const scans = tracking.scans || [];
  const lastScan = scans[scans.length - 1];

  if (
    lastScan &&
    lastScan.instructions &&
    lastScan.instructions.toLowerCase().includes("delivery")
  ) {
    // Extract delivery date from instructions
    const dateMatch = lastScan.instructions.match(
      /(\d{4}-\d{2}-\d{2}|\d{2}-\d{2}-\d{4})/,
    );
    return dateMatch ? dateMatch[0] : null;
  }

  return null;
}

async function updateOrderTracking(
  orderId: string,
  trackingData: any,
): Promise<void> {
  try {
    await supabase
      .from("orders")
      .update({
        tracking_info: trackingData,
        shipping_status: getCurrentStage(trackingData.status),
        expected_delivery_date: getEstimatedDelivery(trackingData),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    // Update shipping status in related tables if needed
    if (trackingData.status.toLowerCase().includes("delivered")) {
      await supabase
        .from("orders")
        .update({
          status: "completed",
          delivered_at: new Date().toISOString(),
        })
        .eq("id", orderId);
    }
  } catch (error) {
    console.error("Error updating order tracking:", error);
  }
}
