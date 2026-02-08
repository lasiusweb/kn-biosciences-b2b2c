// src/app/api/admin/zoho/sync-logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { zohoQueueService } from "@/lib/integrations/zoho/queue-service"; // For retry functionality

export async function GET(req: NextRequest) {
  try {
    // Implement authentication and authorization for admin/staff
    // For now, assume authorized if calling this API

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const statusFilter = searchParams.get("status");
    const entityTypeFilter = searchParams.get("entityType");
    const operationFilter = searchParams.get("operation");
    const searchTerm = searchParams.get("search"); // For error messages, entity IDs, etc.

    let query = supabaseAdmin
      .from("zoho_sync_logs")
      .select("*", { count: "exact" });

    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }
    if (entityTypeFilter && entityTypeFilter !== "all") {
      query = query.eq("entity_type", entityTypeFilter);
    }
    if (operationFilter && operationFilter !== "all") {
      query = query.eq("operation", operationFilter);
    }
    if (searchTerm) {
      query = query.or(
        `error_message.ilike.%${searchTerm}%,entity_id.ilike.%${searchTerm}%`
      );
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching Zoho sync logs:", error);
      return NextResponse.json(
        { error: "Failed to fetch sync logs" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      count,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("API /api/admin/zoho/sync-logs GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Implement authentication and authorization for admin/staff
    // For now, assume authorized if calling this API

    const { logId, action } = await req.json();

    if (!logId || !action) {
      return NextResponse.json({ error: "Log ID and action are required" }, { status: 400 });
    }

    if (action === "retry") {
      const { data: logEntry, error } = await supabaseAdmin
        .from("zoho_sync_logs")
        .select("*")
        .eq("id", logId)
        .single();

      if (error || !logEntry) {
        return NextResponse.json({ error: "Log entry not found" }, { status: 404 });
      }

      // Reset attempt count and status to retrying (or pending to trigger immediate retry)
      const { error: updateError } = await supabaseAdmin
        .from("zoho_sync_logs")
        .update({
          status: "retrying", // Will be picked up by the next queue processing run
          attempt_count: 0, // Reset attempts
          next_retry_at: new Date().toISOString(), // Immediate retry
          error_message: null,
          error_details: null,
          response_payload: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", logId);

      if (updateError) {
        console.error("Error updating log entry for retry:", updateError);
        return NextResponse.json({ error: "Failed to schedule retry" }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Task scheduled for retry" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("API /api/admin/zoho/sync-logs POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
