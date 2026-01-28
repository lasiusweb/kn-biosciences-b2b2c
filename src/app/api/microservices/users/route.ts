// User Service - Microservice for User Management
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface CreateUserRequest {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: "customer" | "b2b_client" | "admin" | "staff";
  company_name?: string;
  gst_number?: string;
}

interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: "customer" | "b2b_client" | "admin" | "staff";
  company_name?: string;
  gst_number?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");
    const role = searchParams.get("role");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    let query = supabase.from("users").select("*");

    if (userId) {
      query = query.eq("id", userId);
    }

    if (role) {
      query = query.eq("role", role);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    if (offset) {
      query = query.range(
        parseInt(offset),
        parseInt(offset) + (parseInt(limit) || 10) - 1,
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("User service GET error:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
      count: data?.length || 0,
    });
  } catch (error) {
    console.error("User service unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserRequest = await request.json();

    // Validate required fields
    if (!body.email || !body.first_name || !body.last_name || !body.role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", body.email)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 },
      );
    }

    // Create new user
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          email: body.email,
          first_name: body.first_name,
          last_name: body.last_name,
          phone: body.phone || null,
          role: body.role,
          company_name: body.company_name || null,
          gst_number: body.gst_number || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("User service POST error:", error);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("User service unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const body: UpdateUserRequest = await request.json();

    // Update user
    const { data, error } = await supabase
      .from("users")
      .update(body)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("User service PUT error:", error);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("User service unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Check if user has active orders
    const { data: activeOrders } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", userId)
      .in("status", ["pending", "confirmed", "processing", "shipped"]);

    if (activeOrders && activeOrders.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete user with active orders" },
        { status: 400 },
      );
    }

    // Delete user
    const { error } = await supabase.from("users").delete().eq("id", userId);

    if (error) {
      console.error("User service DELETE error:", error);
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("User service unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Health check endpoint
export async function PATCH() {
  try {
    const startTime = Date.now();

    // Test database connection
    const { error } = await supabase.from("users").select("id").limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      return NextResponse.json(
        {
          status: "unhealthy",
          service: "user-service",
          error: "Database connection failed",
          responseTime,
          timestamp: new Date().toISOString(),
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      status: "healthy",
      service: "user-service",
      responseTime,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        service: "user-service",
        error: "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
