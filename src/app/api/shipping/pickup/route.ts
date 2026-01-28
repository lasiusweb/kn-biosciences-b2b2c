import { NextRequest, NextResponse } from "next/server";
import { delhiveryService } from "@/lib/shipping/delhivery";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const pickupData = await request.json();

    // Validate required fields
    if (
      !pickupData.pickup_date ||
      !pickupData.pickup_time ||
      !pickupData.pickup_location
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required_fields: ["pickup_date", "pickup_time", "pickup_location"],
        },
        { status: 400 },
      );
    }

    // Validate pickup location
    const locationValidation = delhiveryService.validateAddress(
      pickupData.pickup_location,
    );
    if (!locationValidation.isValid) {
      return NextResponse.json(
        {
          error: "Invalid pickup location",
          details: locationValidation.errors,
        },
        { status: 400 },
      );
    }

    // Validate pickup date (should not be in past or too far in future)
    const pickupDate = new Date(pickupData.pickup_date);
    const today = new Date();
    const maxFutureDate = new Date();
    maxFutureDate.setDate(today.getDate() + 7); // Max 7 days ahead

    if (pickupDate < today.setHours(0, 0, 0, 0)) {
      return NextResponse.json(
        { error: "Pickup date cannot be in the past" },
        { status: 400 },
      );
    }

    if (pickupDate > maxFutureDate) {
      return NextResponse.json(
        { error: "Pickup date cannot be more than 7 days in advance" },
        { status: 400 },
      );
    }

    // Validate pickup time (business hours)
    const [hours, minutes] = pickupData.pickup_time.split(":").map(Number);
    if (hours < 10 || hours > 18 || (hours === 18 && minutes > 0)) {
      return NextResponse.json(
        {
          error: "Invalid pickup time",
          message: "Pickup time must be between 10:00 AM and 6:00 PM",
        },
        { status: 400 },
      );
    }

    // Prepare pickup request for Delhivery
    const delhiveryPickupData = {
      pickup_date: pickupData.pickup_date,
      pickup_time: pickupData.pickup_time,
      pickup_location: {
        ...pickupData.pickup_location,
        address_type: "origin",
      },
      expected_package_count: pickupData.expected_package_count || 1,
      remark: pickupData.remark || "Regular pickup request",
      // Add additional metadata for KN Biosciences
      extra_parameters: {
        business_name: "KN Biosciences",
        contact_person: pickupData.contact_person || "Warehouse Manager",
        contact_phone: pickupData.contact_phone || "",
        special_instructions: pickupData.special_instructions || "",
      },
    };

    // Schedule pickup with Delhivery
    const pickupResponse =
      await delhiveryService.schedulePickup(delhiveryPickupData);

    if (pickupResponse.success === false) {
      return NextResponse.json(
        {
          error: "Failed to schedule pickup",
          details: pickupResponse.reminder || "Unknown error from Delhivery",
          pickup_id: pickupResponse.pickup_id,
        },
        { status: 400 },
      );
    }

    // Save pickup request to database
    const pickupRecord = {
      pickup_id: pickupResponse.pickup_id,
      pickup_date: pickupData.pickup_date,
      pickup_time: pickupData.pickup_time,
      pickup_location: pickupData.pickup_location,
      expected_package_count: pickupData.expected_package_count || 1,
      status: "scheduled",
      remark: pickupData.remark || "",
      order_ids: pickupData.order_ids || [],
      created_at: new Date().toISOString(),
      response_data: pickupResponse,
    };

    const { data: savedPickup, error: saveError } = await supabase
      .from("shipping_pickups")
      .insert(pickupRecord)
      .select()
      .single();

    if (saveError) {
      console.error("Error saving pickup request:", saveError);
      // Don't fail the request if database save fails, but log it
    }

    // Update orders with pickup information
    if (pickupData.order_ids && Array.isArray(pickupData.order_ids)) {
      await supabase
        .from("orders")
        .update({
          pickup_id: pickupResponse.pickup_id,
          pickup_status: "scheduled",
          pickup_date: pickupData.pickup_date,
          updated_at: new Date().toISOString(),
        })
        .in("id", pickupData.order_ids);
    }

    return NextResponse.json({
      success: true,
      message: "Pickup scheduled successfully",
      pickup: {
        id: pickupResponse.pickup_id,
        date: pickupData.pickup_date,
        time: pickupData.pickup_time,
        location: pickupData.pickup_location,
        expected_package_count: pickupData.expected_package_count || 1,
        status: "scheduled",
        confirmation_number: pickupResponse.confirmation_number,
        instructions: getPickupInstructions(pickupResponse),
      },
      database_record: savedPickup,
    });
  } catch (error) {
    console.error("Pickup scheduling error:", error);
    return NextResponse.json(
      {
        error: "Failed to schedule pickup",
        message: "Please try again later or contact support",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pickup_id = searchParams.get("pickup_id");
    const date = searchParams.get("date");
    const status = searchParams.get("status");

    if (pickup_id) {
      // Get specific pickup details
      const { data: pickup, error: pickupError } = await supabase
        .from("shipping_pickups")
        .select("*")
        .eq("pickup_id", pickup_id)
        .single();

      if (pickupError || !pickup) {
        return NextResponse.json(
          { error: "Pickup not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        pickup,
      });
    }

    // Get pickups list with optional filters
    let query = supabase
      .from("shipping_pickups")
      .select("*")
      .order("created_at", { ascending: false });

    if (date) {
      query = query.gte("pickup_date", date).lte("pickup_date", date);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data: pickups, error: pickupsError } = await query.limit(50);

    if (pickupsError) {
      return NextResponse.json(
        { error: "Failed to fetch pickups" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      pickups: pickups || [],
      filters: {
        date,
        status,
        total: pickups?.length || 0,
      },
    });
  } catch (error) {
    console.error("Get pickups error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pickup information" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { pickup_id, status, remark, reason } = await request.json();

    if (!pickup_id || !status) {
      return NextResponse.json(
        { error: "Pickup ID and status are required" },
        { status: 400 },
      );
    }

    // Validate status
    const validStatuses = [
      "scheduled",
      "confirmed",
      "in_progress",
      "completed",
      "cancelled",
      "failed",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid status",
          valid_statuses: validStatuses,
        },
        { status: 400 },
      );
    }

    // Update pickup in database
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (remark) updateData.remark = remark;
    if (reason) updateData.cancellation_reason = reason;

    const { data: updatedPickup, error: updateError } = await supabase
      .from("shipping_pickups")
      .update(updateData)
      .eq("pickup_id", pickup_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update pickup" },
        { status: 500 },
      );
    }

    // Update related orders if pickup is completed or cancelled
    if (status === "completed" || status === "cancelled") {
      await supabase
        .from("orders")
        .update({
          pickup_status: status === "completed" ? "completed" : "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("pickup_id", pickup_id);
    }

    // Send notifications based on status change
    await sendPickupStatusNotification(updatedPickup, status, reason);

    return NextResponse.json({
      success: true,
      message: "Pickup updated successfully",
      pickup: updatedPickup,
    });
  } catch (error) {
    console.error("Update pickup error:", error);
    return NextResponse.json(
      { error: "Failed to update pickup" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { pickup_id, reason } = await request.json();

    if (!pickup_id) {
      return NextResponse.json(
        { error: "Pickup ID is required" },
        { status: 400 },
      );
    }

    // Get pickup details before cancellation
    const { data: pickup, error: fetchError } = await supabase
      .from("shipping_pickups")
      .select("*")
      .eq("pickup_id", pickup_id)
      .single();

    if (fetchError || !pickup) {
      return NextResponse.json({ error: "Pickup not found" }, { status: 404 });
    }

    // Check if pickup can be cancelled
    const now = new Date();
    const pickupDateTime = new Date(
      `${pickup.pickup_date}T${pickup.pickup_time}`,
    );
    const hoursUntilPickup =
      (pickupDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilPickup < 2) {
      return NextResponse.json(
        {
          error: "Cannot cancel pickup",
          message:
            "Pickup can only be cancelled at least 2 hours before scheduled time",
        },
        { status: 400 },
      );
    }

    // Cancel pickup with Delhivery (if possible)
    try {
      // Note: Delhivery may not have a direct cancellation API
      // This would typically involve contacting support
      console.log("Pickup cancellation requested for:", pickup_id);
    } catch (error) {
      console.error("Error cancelling pickup with Delhivery:", error);
    }

    // Update database
    const { error: updateError } = await supabase
      .from("shipping_pickups")
      .update({
        status: "cancelled",
        cancellation_reason: reason || "Customer requested cancellation",
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("pickup_id", pickup_id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to cancel pickup" },
        { status: 500 },
      );
    }

    // Update related orders
    await supabase
      .from("orders")
      .update({
        pickup_id: null,
        pickup_status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("pickup_id", pickup_id);

    // Send cancellation notification
    await sendPickupStatusNotification(
      { ...pickup, status: "cancelled" },
      "cancelled",
      reason,
    );

    return NextResponse.json({
      success: true,
      message: "Pickup cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel pickup error:", error);
    return NextResponse.json(
      { error: "Failed to cancel pickup" },
      { status: 500 },
    );
  }
}

// Helper functions
function getPickupInstructions(pickupResponse: any): string[] {
  const instructions: string[] = [];

  instructions.push("Prepare packages for pickup");
  instructions.push("Ensure all packages are properly sealed and labeled");

  if (pickupResponse.pickup_time) {
    instructions.push(`Have packages ready by ${pickupResponse.pickup_time}`);
  }

  instructions.push("Keep tracking numbers ready for pickup agent");
  instructions.push("Take photos of packages before pickup");

  return instructions;
}

async function sendPickupStatusNotification(
  pickup: any,
  status: string,
  reason?: string,
): Promise<void> {
  try {
    console.log(
      `Pickup ${status} notification for pickup ${pickup.pickup_id}:`,
      reason,
    );

    // TODO: Implement email/SMS notifications
    // This would integrate with your notification service
  } catch (error) {
    console.error("Error sending pickup notification:", error);
  }
}
