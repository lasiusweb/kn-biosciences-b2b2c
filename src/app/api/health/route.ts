import { NextRequest, NextResponse } from "next/server";
import { apiGateway } from "@/lib/enterprise/api-gateway";

export async function GET(request: NextRequest) {
  try {
    return apiGateway.healthCheck();
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}