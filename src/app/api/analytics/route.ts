import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Performance tracking interface
interface PageViewEvent {
  page: string;
  title?: string;
  referrer?: string;
  user_agent?: string;
  timestamp: string;
  user_id?: string;
  session_id: string;
  load_time?: number;
  metadata?: Record<string, any>;
}

interface SearchEvent {
  query: string;
  results_count: number;
  filters?: any;
  user_id?: string;
  session_id: string;
  timestamp: string;
  user_agent?: string;
  click_position?: number;
  selected_result?: string;
}

interface ProductInteractionEvent {
  product_id: string;
  interaction_type: 'view' | 'click' | 'add_to_cart' | 'wishlist' | 'purchase' | 'review' | 'share';
  user_id?: string;
  session_id: string;
  timestamp: string;
  value?: number;
  metadata?: Record<string, any>;
}

interface ConversionEvent {
  event_type: 'purchase' | 'signup' | 'quote_request' | 'contact_form_submit';
  user_id?: string;
  session_id: string;
  timestamp: string;
  value?: number;
  currency?: string;
  metadata?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const eventType = request.headers.get('x-event-type') || '';
    const eventData = await request.json();

    // Generate unique event ID
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get request metadata
    const requestMetadata = {
      ip: request.headers.get('x-forwarded-for') || 
           request.headers.get('x-real-ip') || 
           request.ip,
      user_agent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
      session_id: generateSessionId(),
      event_id: eventId,
    };

    let processedData: any = {};

    switch (eventType) {
      case 'page_view':
        processedData = processPageView(eventData, requestMetadata);
        break;
      case 'search':
        processedData = processSearchEvent(eventData, requestMetadata);
        break;
      case 'product_interaction':
        processedData = processProductInteraction(eventData, requestMetadata);
        break;
      case 'conversion':
        processedData = processConversion(eventData, requestMetadata);
        break;
      case 'recommendation':
        processedData = processRecommendation(eventData, requestMetadata);
        break;
      case 'performance':
        processedData = processPerformanceEvent(eventData, requestMetadata);
        break;
      default:
        console.warn('Unknown analytics event type:', eventType);
        return NextResponse.json(
          { error: 'Unknown event type' },
          { status: 400 }
        );
    }

    // Store analytics event
    await storeAnalyticsEvent(processedData);

    return NextResponse.json({
      success: true,
      event_id: eventId,
      processed_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Analytics processing error:', error);
    return NextResponse.json(
      { error: 'Analytics processing failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const userId = searchParams.get('user_id');

    // Handle different analytics reports
    switch (reportType) {
      case 'search_analytics':
        return await getSearchAnalytics(startDate, endDate, userId);
      case 'product_performance':
        return await getProductPerformance(startDate, endDate, userId);
      case 'user_behavior':
        return await getUserBehavior(userId);
      case 'conversion_funnel':
        return await getConversionFunnel(startDate, endDate, userId);
      case 'real_time_stats':
        return await getRealTimeStats();
      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Analytics report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

// Event processing functions
function processPageView(data: PageViewEvent, metadata: any): any {
  return {
    ...metadata,
    event_type: 'page_view',
    page: data.page,
    title: data.title,
    referrer: data.referrer,
    user_agent: data.user_agent,
    user_id: data.user_id,
    session_id: data.session_id,
    load_time: data.load_time,
  };
}

function processSearchEvent(data: SearchEvent, metadata: any): any {
  return {
    ...metadata,
    event_type: 'search',
    query: data.query,
    results_count: data.results_count,
    filters: data.filters,
    user_id: data.user_id,
    session_id: data.session_id,
    click_position: data.click_position,
    selected_result: data.selected_result,
  };
}

function processProductInteraction(data: ProductInteractionEvent, metadata: any): any {
  return {
    ...metadata,
    event_type: 'product_interaction',
    product_id: data.product_id,
    interaction_type: data.interaction_type,
    value: data.value,
    user_id: data.user_id,
    session_id: data.session_id,
    timestamp: new Date().toISOString(),
  };
}

function processConversion(data: ConversionEvent, metadata: any): any {
  return {
    ...metadata,
    event_type: 'conversion',
    event_type: data.event_type,
    user_id: data.user_id,
    session_id: data.session_id,
    value: data.value,
    currency: data.currency,
    timestamp: new Date().toISOString(),
  };
}

function processRecommendation(data: any, metadata: any): any {
  return {
    ...metadata,
    event_type: 'recommendation',
    algorithm: data.algorithm,
    recommendation_ids: data.recommendation_ids,
    user_id: data.user_id,
    session_id: data.session_id,
  };
}

function processPerformanceEvent(data: any, metadata: any): any {
  return {
    ...metadata,
    event_type: 'performance',
    metric: data.metric,
    value: data.value,
    user_id: data.user_id,
    session_id: data.session_id,
  };
}

// Storage functions
async function storeAnalyticsEvent(eventData: any): Promise<void> {
  try {
    // Store in primary analytics table
    await supabase.from('analytics_events').insert(eventData);
    
    // Also store in specific tables for better querying
    switch (eventData.event_type) {
      case 'page_view':
        await supabase.from('page_views').insert({
          page: eventData.page,
          title: eventData.title,
          referrer: eventData.referrer,
          user_agent: eventData.user_agent,
          user_id: eventData.user_id,
          session_id: eventData.session_id,
          timestamp: eventData.timestamp,
          load_time: eventData.load_time,
        });
        break;
      case 'search':
        await supabase.from('search_events').insert({
          query: eventData.query,
          results_count: eventData.results_count,
          filters: eventData.filters,
          user_id: eventData.user_id,
          session_id: eventData.session_id,
          click_position: eventData.click_position,
          selected_result: eventData.selected_result,
          timestamp: eventData.timestamp,
        });
        break;
      case 'product_interaction':
        await supabase.from('product_interactions').insert({
          product_id: eventData.product_id,
          interaction_type: eventData.interaction_type,
          value: eventData.value,
          user_id: eventData.user_id,
          session_id: eventData.session_id,
          timestamp: eventData.timestamp,
        });
        break;
      case 'conversion':
        await supabase.from('conversions').insert({
          event_type: eventData.event_type,
          value: eventData.value,
          currency: eventData.currency,
          user_id: eventData.user_id,
          session_id: eventData.session_id,
          timestamp: eventData.timestamp,
        });
        break;
    }
  } catch (error) {
    console.error('Error storing analytics event:', error);
  }
}

// Report generation functions
async function getSearchAnalytics(startDate?: string, endDate?: string, userId?: string): Promise<any> {
  const query = supabase
    .from('search_events')
    .select('query, results_count, click_position, selected_result, timestamp')
    .eq('user_id', userId)
    .gte('timestamp', startDate)
    .lte('timestamp', endDate)
    .order('timestamp', { ascending: false });

  const { data } = await query;
  
  // Calculate analytics metrics
  const totalSearches = data.length;
  const avgResultsPerSearch = totalSearches > 0 ? data.reduce((sum, event) => sum + (event.results_count || 1), 0) / totalSearches : 0;
  
  const topQueries = await getTopQueries(startDate, endDate, userId);
  
  const searchFunnel = await getSearchConversionFunnel(startDate, endDate, userId);

  return {
    summary: {
      total_searches: totalSearches,
      avg_results_per_search: Math.round(avgResultsPerSearch * 100) / 100,
      unique_queries: topQueries.length,
      date_range: { start: startDate, end: endDate }
    },
    detailed_searches: data.slice(0, 100),
    top_queries: topQueries,
    search_funnel: searchFunnel,
  };
}

async function getProductPerformance(startDate?: string, endDate?: string, userId?: string): Promise<any> {
  const query = supabase
    .from('product_analytics')
    .select('product_id, view_count, add_to_cart_count, purchase_count, average_rating, timestamp')
    .gte('timestamp', startDate)
    .lte('timestamp', endDate);

  const { data } = await query;
  
  // Calculate product metrics
  const topViewedProducts = await getTopViewedProducts(startDate, endDate);
  const topConvertedProducts = await getTopConvertedProducts(startDate, endDate);
  
  return {
    summary: {
      total_views: data.reduce((sum, event) => sum + (event.view_count || 0), 0),
      total_add_to_cart: data.reduce((sum, event) => sum + (event.add_to_cart_count || 0), 0),
      total_purchases: data.reduce((sum, event) => sum + (event.purchase_count || 0), 0),
      avg_rating: data.length > 0 ? data.reduce((sum, event) => sum + (event.average_rating || 0), 0) / data.length : 0,
      date_range: { start: startDate, end: endDate }
    },
    top_viewed_products: topViewedProducts,
    top_converted_products: topConvertedProducts,
    detailed_analytics: data.slice(0, 100),
  };
}

async function getUserBehavior(userId?: string): Promise<any> {
  if (!userId) return { behavior: [], preferences: {} };
  
  // Get user's interaction history and preferences
  const interactions = await supabase
    .from('product_interactions')
    .select('product_id, interaction_type, timestamp')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(50);

  const preferences = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  return {
    total_interactions: interactions.length,
    interaction_types: interactions.reduce((types, event) => {
      types[event.interaction_type] = (types[event.interaction_type] || 0) + 1
      return types;
    }, {}),
    preferences: preferences || {},
    last_activity: interactions[0]?.timestamp || new Date().toISOString(),
  };
}

async function getConversionFunnel(startDate?: string, endDate?: string, userId?: string): Promise<any> {
  const conversions = await supabase
    .from('conversions')
    .select('event_type, value, timestamp, user_id')
    .eq('user_id', userId)
    .gte('timestamp', startDate)
    .lte('timestamp', endDate)
    .order('timestamp', { ascending: false });

  const funnel = {
    page_views: await getFunnelStep('page_view', startDate, endDate, userId),
    searches: await getFunnelStep('search', startDate, endDate, userId),
    product_views: await getFunnelStep('product_interaction', startDate, endDate, userId),
    add_to_carts: await getFunnelStep('add_to_cart', startDate, endDate, userId),
    purchases: await getFunnelStep('purchase', startDate, endDate, userId),
      conversions: conversions.filter(c => c.event_type === 'purchase' || c.event_type === 'signup' || c.event_type === 'quote_request' || c.event_type === 'contact_form_submit'),
    };

  return funnel;
}

async function getTopQueries(startDate?: string, endDate?: string, userId?: string): Promise<any> {
  const query = supabase
    .from('search_events')
    .select('query')
    .eq('user_id', userId)
    .gte('timestamp', startDate)
    .lte('timestamp', endDate)
    .order('timestamp', { ascending: false });

  const queryCounts = query.reduce((counts, event) => {
    counts[event.query] = (counts[event.query] || 0) + 1;
      return counts;
    }, {});

  const topQueries = Object.entries(queryCounts)
    .sort(([,a], [,b]) => b[1] - a[1])
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }));

  return topQueries;
}

async function getTopViewedProducts(startDate?: string, endDate?: string, userId?: string): Promise<any> {
  const query = supabase
    .from('product_analytics')
    .select('product_id, view_count, timestamp')
    .eq('user_id', userId)
    .gte('timestamp', startDate)
    .lte('timestamp', endDate)
    .order('timestamp', { ascending: false });

  const productViews = query.reduce((views, event) => {
      views[event.product_id] = (views[event.product_id] || 0) + 1;
      return views;
    }, {});

  const topProducts = Object.entries(productViews)
    .sort(([,a], [,b]) => b[1] - a[1])
    .slice(0, 10)
    .map(([productId, count]) => ({ product_id: productId, view_count: count }));

  return topProducts;
}

async function getTopConvertedProducts(startDate?: string, endDate?: string, userId?: string): Promise<any> {
  const query = supabase
    .from('conversions')
    .select('metadata->>product_id, value, timestamp')
    .eq('user_id', userId)
    .eq('event_type', 'purchase')
    .gte('timestamp', startDate)
    .lte('timestamp', endDate)
    .order('timestamp', { ascending: false });

  const conversions = query.filter(c => c.value); // Assuming product_id is stored in metadata
  const conversionCounts = conversions.reduce((counts, c) => {
    const productId = c.metadata?.product_id;
    if (productId) {
      counts[productId] = (counts[productId] || 0) + 1;
    }
    return counts;
  }, {});

  const topConvertedProducts = Object.entries(conversionCounts)
    .sort(([,a], [,b]) => b[1] - a[1])
    .slice(0, 10)
    .map(([productId, count]) => ({ product_id: productId, conversion_count: count }));

  return topConvertedProducts;
}

async function getFunnelStep(step: string, startDate?: string, endDate?: string, userId?: string): Promise<number> {
  const query = supabase
    .from('analytics_events')
    .select('event_type')
    .eq('user_id', userId)
    .eq('timestamp', startDate)
    .lte('timestamp', endDate)
    .order('timestamp', { ascending: false });

  return query.length || 0;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default {
  POST,
  GET,
}