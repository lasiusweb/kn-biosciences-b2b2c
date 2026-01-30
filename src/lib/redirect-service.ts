import { supabase } from "./supabase";

export interface RedirectMapping {
  source_url: string;
  target_url: string;
  status_code: number;
}

const cache = new Map<string, RedirectMapping | null>();

export class RedirectService {
  /**
   * Retrieves a redirect mapping for a given source URL.
   * Uses an in-memory cache to minimize database hits.
   */
  static async getRedirect(sourceUrl: string): Promise<RedirectMapping | null> {
    // Normalize URL
    const normalizedUrl = sourceUrl.toLowerCase().split('?')[0];

    // Check cache
    if (cache.has(normalizedUrl)) {
      return cache.get(normalizedUrl) || null;
    }

    try {
      const { data, error } = await supabase
        .from("legacy_redirects")
        .select("source_url, target_url, status_code")
        .eq("source_url", normalizedUrl)
        .eq("is_active", true)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No match found
          cache.set(normalizedUrl, null);
          return null;
        }
        console.error("Error fetching redirect:", error);
        return null;
      }

      cache.set(normalizedUrl, data);
      return data;
    } catch (err) {
      console.error("Unexpected error in RedirectService:", err);
      return null;
    }
  }

  /**
   * Clears the redirect cache.
   */
  static clearCache(): void {
    cache.clear();
  }
}
