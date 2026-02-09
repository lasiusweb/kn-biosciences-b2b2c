import { supabase } from '@/lib/supabase';

export interface SearchAnalyticsData {
  id: string;
  query: string;
  filters: Record<string, any>;
  result_count: number;
  user_id?: string;
  session_id: string;
  ip_address?: string;
  user_agent?: string;
  clicked_results?: string[]; // IDs of products that were clicked
  position_clicks?: { [productId: string]: number }; // Position where product was clicked
  timestamp: string;
}

export interface SearchTrend {
  query: string;
  count: number;
  trend: 'rising' | 'falling' | 'stable';
}

export interface PopularSearch {
  query: string;
  count: number;
  conversion_rate: number;
}

export interface SearchAnalyticsReport {
  total_searches: number;
  unique_searches: number;
  top_queries: SearchTrend[];
  popular_searches: PopularSearch[];
  conversion_by_query: { [query: string]: number };
  search_trends: { date: string; count: number }[];
}

export class SearchAnalyticsService {
  /**
   * Records a search event
   */
  static async recordSearch(data: Omit<SearchAnalyticsData, 'id' | 'timestamp'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('search_analytics')
        .insert({
          ...data,
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('Error recording search analytics:', error);
      }
    } catch (error) {
      console.error('Error recording search analytics:', error);
    }
  }

  /**
   * Records a click on a search result
   */
  static async recordResultClick(searchId: string, productId: string, position: number): Promise<void> {
    try {
      // First, get the current search record
      const { data: searchRecord, error: fetchError } = await supabase
        .from('search_analytics')
        .select('clicked_results, position_clicks')
        .eq('id', searchId)
        .single();

      if (fetchError) {
        console.error('Error fetching search record:', fetchError);
        return;
      }

      // Update the clicked results and position clicks
      const updatedClickedResults = [...(searchRecord.clicked_results || []), productId];
      const updatedPositionClicks = {
        ...(searchRecord.position_clicks || {}),
        [productId]: position
      };

      const { error: updateError } = await supabase
        .from('search_analytics')
        .update({
          clicked_results: updatedClickedResults,
          position_clicks: updatedPositionClicks
        })
        .eq('id', searchId);

      if (updateError) {
        console.error('Error updating search record with click:', updateError);
      }
    } catch (error) {
      console.error('Error recording result click:', error);
    }
  }

  /**
   * Gets search analytics report
   */
  static async getAnalyticsReport(
    startDate?: string, 
    endDate?: string,
    limit: number = 10
  ): Promise<SearchAnalyticsReport> {
    try {
      // Get total searches
      let totalQuery = supabase
        .from('search_analytics')
        .select('*', { count: 'exact', head: true });

      if (startDate) {
        totalQuery = totalQuery.gte('timestamp', startDate);
      }
      if (endDate) {
        totalQuery = totalQuery.lte('timestamp', endDate);
      }

      const { count: totalSearches, error: totalError } = await totalQuery;

      if (totalError) {
        console.error('Error getting total searches:', totalError);
        throw totalError;
      }

      // Get unique searches (distinct queries)
      let uniqueQuery = supabase
        .from('search_analytics')
        .select('query', { count: 'exact', head: true })
        .neq('query', '');

      if (startDate) {
        uniqueQuery = uniqueQuery.gte('timestamp', startDate);
      }
      if (endDate) {
        uniqueQuery = uniqueQuery.lte('timestamp', endDate);
      }

      const { count: uniqueSearches, error: uniqueError } = await uniqueQuery;

      if (uniqueError) {
        console.error('Error getting unique searches:', uniqueError);
        throw uniqueError;
      }

      // Get top queries
      let topQueriesQuery = supabase
        .from('search_analytics')
        .select('query')
        .neq('query', '')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (startDate) {
        topQueriesQuery = topQueriesQuery.gte('timestamp', startDate);
      }
      if (endDate) {
        topQueriesQuery = topQueriesQuery.lte('timestamp', endDate);
      }

      const { data: topQueryData, error: topQueryError } = await topQueriesQuery;

      if (topQueryError) {
        console.error('Error getting top queries:', topQueryError);
        throw topQueryError;
      }

      // Process top queries data
      const queryCounts: Record<string, number> = {};
      topQueryData?.forEach(item => {
        if (item.query) {
          queryCounts[item.query] = (queryCounts[item.query] || 0) + 1;
        }
      });

      const topQueries: SearchTrend[] = Object.entries(queryCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([query, count]) => ({
          query,
          count,
          trend: 'stable' // In a real implementation, this would be calculated based on historical data
        }));

      // Get popular searches with conversion rates
      // This is a simplified implementation - in a real system, you'd need to join with order data
      const popularSearches: PopularSearch[] = topQueries.map(query => ({
        query: query.query,
        count: query.count,
        conversion_rate: Math.random() * 0.15 // Random conversion rate for demo
      }));

      // Get search trends over time
      // This is a simplified implementation
      const searchTrends = [
        { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], count: Math.floor(Math.random() * 100) },
        { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], count: Math.floor(Math.random() * 100) },
        { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], count: Math.floor(Math.random() * 100) },
        { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], count: Math.floor(Math.random() * 100) },
        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], count: Math.floor(Math.random() * 100) },
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], count: Math.floor(Math.random() * 100) },
        { date: new Date().toISOString().split('T')[0], count: Math.floor(Math.random() * 100) }
      ];

      return {
        total_searches: totalSearches || 0,
        unique_searches: uniqueSearches || 0,
        top_queries: topQueries,
        popular_searches: popularSearches,
        conversion_by_query: {}, // In a real implementation, this would be calculated from order data
        search_trends: searchTrends
      };
    } catch (error) {
      console.error('Error getting search analytics report:', error);
      throw error;
    }
  }

  /**
   * Gets search suggestions based on popular searches
   */
  static async getSearchSuggestions(limit: number = 5): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('search_analytics')
        .select('query')
        .neq('query', '')
        .order('timestamp', { ascending: false })
        .limit(limit * 2); // Get more than needed to filter duplicates

      if (error) {
        console.error('Error getting search suggestions:', error);
        return [];
      }

      // Filter duplicates while preserving order
      const suggestions = Array.from(
        new Set(data?.map(item => item.query).filter(query => query) as string[])
      ).slice(0, limit);

      return suggestions;
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  /**
   * Gets related searches for a given query
   */
  static async getRelatedSearches(query: string, limit: number = 5): Promise<string[]> {
    try {
      // This is a simplified implementation
      // In a real system, you'd use more sophisticated algorithms
      const { data, error } = await supabase
        .from('search_analytics')
        .select('query')
        .ilike('query', `%${query}%`)
        .neq('query', query)
        .order('timestamp', { ascending: false })
        .limit(limit * 2);

      if (error) {
        console.error('Error getting related searches:', error);
        return [];
      }

      // Filter duplicates while preserving order
      const related = Array.from(
        new Set(data?.map(item => item.query).filter(query => query) as string[])
      ).slice(0, limit);

      return related;
    } catch (error) {
      console.error('Error getting related searches:', error);
      return [];
    }
  }

  /**
   * Gets search performance metrics for a specific query
   */
  static async getQueryPerformance(query: string): Promise<{
    impressions: number;
    clicks: number;
    ctr: number; // Click-through rate
    avg_position: number;
  }> {
    try {
      // Get all searches for this query
      const { data: searches, error: searchError } = await supabase
        .from('search_analytics')
        .select('*')
        .ilike('query', query);

      if (searchError) {
        console.error('Error getting query performance:', searchError);
        return { impressions: 0, clicks: 0, ctr: 0, avg_position: 0 };
      }

      if (!searches || searches.length === 0) {
        return { impressions: 0, clicks: 0, ctr: 0, avg_position: 0 };
      }

      const impressions = searches.length;
      const allClicks = searches.flatMap(search => search.clicked_results || []);
      const clicks = allClicks.length;

      // Calculate average position of clicked results
      let totalPosition = 0;
      let positionCount = 0;
      
      searches.forEach(search => {
        if (search.position_clicks) {
          Object.values(search.position_clicks).forEach(pos => {
            totalPosition += pos as number;
            positionCount++;
          });
        }
      });

      const avgPosition = positionCount > 0 ? totalPosition / positionCount : 0;
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

      return {
        impressions,
        clicks,
        ctr,
        avg_position: avgPosition
      };
    } catch (error) {
      console.error('Error getting query performance:', error);
      return { impressions: 0, clicks: 0, ctr: 0, avg_position: 0 };
    }
  }
}