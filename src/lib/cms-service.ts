import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";

export type LegalContent = Database["public"]["Tables"]["legal_content"]["Row"];
export type FAQ = Database["public"]["Tables"]["faqs"]["Row"];

export const cmsService = {
  /**
   * Fetch legal content by its slug (e.g., 'privacy-policy')
   */
  async getLegalContent(slug: string): Promise<LegalContent | null> {
    const { data, error } = await supabase
      .from("legal_content")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      // In production, you might want to log this to a monitoring service
      console.error(`Error fetching legal content for slug: ${slug}`, error);
      return null;
    }

    return data;
  },

  /**
   * Fetch all active FAQs, ordered by display_order
   */
  async getFAQs(): Promise<FAQ[]> {
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching FAQs", error);
      return [];
    }

    return data;
  },
};
