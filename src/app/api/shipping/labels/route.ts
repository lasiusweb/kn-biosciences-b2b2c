import { NextRequest, NextResponse } from "next/server";
import { delhiveryService } from "@/lib/shipping/delhivery";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const {
      order_id,
      waybill_format = "pdf",
      include_barcode = true,
    } = await request.json();

    if (!order_id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 },
      );
    }

    // Get order details from database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.shipping_waybill) {
      return NextResponse.json(
        { error: "No waybill available for this order" },
        { status: 404 },
      );
    }

    // Download waybill from Delhivery
    const waybillBuffer = await delhiveryService.downloadWaybill([
      order.shipping_waybill,
    ]);

    // Store waybill in database for future reference
    const waybillBase64 = waybillBuffer.toString("base64");

    await supabase
      .from("orders")
      .update({
        shipping_label_url: `/api/shipping/labels/${order_id}`,
        shipping_label_generated_at: new Date().toISOString(),
        shipping_label_format: waybill_format,
      })
      .eq("id", order_id);

    // Return waybill data
    const responseHeaders = new Headers({
      "Content-Type":
        waybill_format === "pdf" ? "application/pdf" : "image/png",
      "Content-Disposition": `attachment; filename="waybill_${order.shipping_waybill}.${waybill_format}"`,
      "Cache-Control": "public, max-age=3600",
    });

    return new NextResponse(waybillBuffer, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Waybill generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate shipping label",
        message: "Please try again or contact support",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Bulk waybill generation for multiple orders
export async function PUT(request: NextRequest) {
  try {
    const { order_ids, waybill_format = "pdf" } = await request.json();

    if (!Array.isArray(order_ids) || order_ids.length === 0) {
      return NextResponse.json(
        { error: "Valid order_ids array is required" },
        { status: 400 },
      );
    }

    // Get all orders with waybills
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, shipping_waybill, customer_email, total_amount")
      .in("id", order_ids)
      .not("shipping_waybill", "is", null);

    if (ordersError) {
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 },
      );
    }

    if (orders.length === 0) {
      return NextResponse.json(
        { error: "No orders with valid waybills found" },
        { status: 404 },
      );
    }

    // Generate waybills for all orders
    const waybills = orders
      .map((order) => order.shipping_waybill)
      .filter(Boolean);
    const waybillBuffer = await delhiveryService.downloadWaybill(waybills);

    // Update all orders with label URL
    await supabase
      .from("orders")
      .update({
        shipping_label_url: `/api/shipping/labels/bulk/${Date.now()}`,
        shipping_label_generated_at: new Date().toISOString(),
        shipping_label_format: waybill_format,
      })
      .in("id", order_ids);

    // Return bulk waybill
    const responseHeaders = new Headers({
      "Content-Type":
        waybill_format === "pdf" ? "application/pdf" : "image/png",
      "Content-Disposition": `attachment; filename="bulk_waybills_${Date.now()}.${waybill_format}"`,
      "Cache-Control": "public, max-age=3600",
    });

    return new NextResponse(waybillBuffer, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Bulk waybill generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate bulk waybills" },
      { status: 500 },
    );
  }
}

// Get waybill preview/image
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const order_id = searchParams.get("order_id");
    const preview = searchParams.get("preview") === "true";

    if (!order_id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 },
      );
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("shipping_waybill, shipping_label_generated_at")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.shipping_waybill) {
      return NextResponse.json(
        { error: "No waybill available for this order" },
        { status: 404 },
      );
    }

    // If preview requested and label already generated, return label info
    if (preview && order.shipping_label_generated_at) {
      return NextResponse.json({
        success: true,
        order_id,
        waybill: order.shipping_waybill,
        label_generated: true,
        label_url: `/api/shipping/labels/${order_id}`,
        generated_at: order.shipping_label_generated_at,
      });
    }

    // Generate waybill preview data
    const previewData = {
      order_id,
      waybill: order.shipping_waybill,
      label_url: `/api/shipping/labels/${order_id}`,
      download_url: `/api/shipping/labels/${order_id}?download=true`,
      generated_at: order.shipping_label_generated_at,
      available_formats: ["pdf", "png"],
      features: [
        "Barcoded tracking",
        "QR code support",
        "Professional layout",
        "KN Biosciences branding",
      ],
    };

    return NextResponse.json({
      success: true,
      preview: previewData,
    });
  } catch (error) {
    console.error("Waybill preview error:", error);
    return NextResponse.json(
      { error: "Failed to fetch waybill preview" },
      { status: 500 },
    );
  }
}

// Create shipment and generate waybill in one step
export async function POST_create(request: NextRequest) {
  try {
    const shipmentData = await request.json();

    // Validate shipment data
    if (!shipmentData.shipments || !Array.isArray(shipmentData.shipments)) {
      return NextResponse.json(
        { error: "Valid shipments array is required" },
        { status: 400 },
      );
    }

    // Create shipment with Delhivery
    const createResponse = await delhiveryService.createShipment(shipmentData);

    if (createResponse.success === false) {
      return NextResponse.json(
        {
          error: "Failed to create shipment",
          details: createResponse.reminder || "Unknown error",
        },
        { status: 400 },
      );
    }

    // Extract waybills from response
    const waybills =
      createResponse.packages?.map((pkg: any) => pkg.waybill) || [];

    if (waybills.length === 0) {
      return NextResponse.json(
        { error: "No waybills generated from shipment creation" },
        { status: 500 },
      );
    }

    // Download waybills
    const waybillBuffer = await delhiveryService.downloadWaybill(waybills);

    // Update orders with waybill information
    if (shipmentData.order_ids && Array.isArray(shipmentData.order_ids)) {
      const updates = shipmentData.order_ids.map(
        (orderId: string, index: number) => ({
          id: orderId,
          shipping_waybill: waybills[index],
          shipping_status: "manifested",
          shipping_manifested_at: new Date().toISOString(),
        }),
      );

      // Bulk update orders
      await Promise.all(
        updates.map(async (update) => {
          await supabase
            .from("orders")
            .update({
              shipping_waybill: update.shipping_waybill,
              shipping_status: update.shipping_status,
              shipping_manifested_at: update.shipping_manifested_at,
              updated_at: new Date().toISOString(),
            })
            .eq("id", update.id);
        }),
      );
    }

    // Return waybill
    const responseHeaders = new Headers({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="shipping_waybills_${Date.now()}.pdf"`,
    });

    return new NextResponse(waybillBuffer, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Create shipment and waybill error:", error);
    return NextResponse.json(
      {
        error: "Failed to create shipment and generate waybill",
        message: "Please check shipment data and try again",
      },
      { status: 500 },
    );
  }
}
