import { NextRequest, NextResponse } from "next/server";
import { apiGateway } from "@/lib/enterprise/api-gateway";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const options = {
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      startTime: searchParams.get('startTime') ? parseInt(searchParams.get('startTime')!) : undefined,
      endTime: searchParams.get('endTime') ? parseInt(searchParams.get('endTime')!) : undefined,
      statusCodes: searchParams.get('statusCodes') 
        ? searchParams.get('statusCodes')!.split(',').map(code => parseInt(code.trim()))
        : undefined,
      paths: searchParams.get('paths') 
        ? searchParams.get('paths')!.split(',').map(path => path.trim())
        : undefined,
    };

    // Return metrics from API gateway
    return apiGateway.getMetrics(options);
  } catch (error) {
    console.error('Metrics API Error:', error);
    
    return NextResponse.json(
      {
        error: "Failed to fetch metrics",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}