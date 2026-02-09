import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { SafetyComplianceAnalyticsService } from '@/lib/safety-compliance-analytics-service';

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Check if user is authenticated and has admin privileges
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type');
    const periodStart = searchParams.get('periodStart');
    const periodEnd = searchParams.get('periodEnd');
    
    let result;
    
    switch(reportType) {
      case 'compliance-report':
        if (!periodStart || !periodEnd) {
          return Response.json({ error: 'periodStart and periodEnd are required for compliance report' }, { status: 400 });
        }
        result = await SafetyComplianceAnalyticsService.generateComplianceReport(
          periodStart,
          periodEnd,
          session.user.id
        );
        break;
        
      case 'by-segment':
        result = await SafetyComplianceAnalyticsService.getComplianceBySegment();
        break;
        
      case 'alerts':
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') || '20') : 20;
        result = await SafetyComplianceAnalyticsService.getSafetyAlerts(limit);
        break;
        
      default:
        // Default to getting general analytics
        result = await SafetyComplianceAnalyticsService.getAnalytics();
    }
    
    return Response.json({ 
      success: true, 
      data: result,
      message: 'Analytics retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in safety and compliance analytics API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Check if user is authenticated and has admin privileges
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { action, ...params } = body;
    
    let result;
    
    switch(action) {
      case 'generate-compliance-report':
        if (!params.periodStart || !params.periodEnd) {
          return Response.json({ error: 'periodStart and periodEnd are required for compliance report' }, { status: 400 });
        }
        result = await SafetyComplianceAnalyticsService.generateComplianceReport(
          params.periodStart,
          params.periodEnd,
          session.user.id
        );
        break;
        
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    return Response.json({ 
      success: true, 
      data: result,
      message: 'Action completed successfully' 
    });
  } catch (error) {
    console.error('Error in safety and compliance analytics API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}