import { cmsService } from "../cms-service";
import { supabase } from "@/lib/supabase";

// Mock the supabase client
jest.mock("@/lib/supabase", () => {
  const mockSelect = jest.fn().mockReturnThis();
  const mockEq = jest.fn().mockReturnThis();
  const mockSingle = jest.fn();
  const mockOrder = jest.fn();
  const mockFrom = jest.fn().mockReturnValue({
    select: mockSelect,
    eq: mockEq,
    single: mockSingle,
    order: mockOrder,
  });

  return {
    supabase: {
      from: mockFrom,
    },
  };
});

describe("cmsService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getLegalContent", () => {
    it("should return data when fetch is successful", async () => {
      const mockData = { id: "1", slug: "terms", title: "Terms", content: "..." };
      // Access the mock functions through the imported module, casting to any or specific mock type
      const mockSingle = (supabase.from("legal_content").select("*").eq("slug", "terms").single as jest.Mock);
      mockSingle.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await cmsService.getLegalContent("terms");
      expect(result).toEqual(mockData);
      
      expect(supabase.from).toHaveBeenCalledWith("legal_content");
      // Note: testing the chain is implicit by the mock setup, but we can verify calls
    });

    it("should return null when fetch fails", async () => {
      const mockSingle = (supabase.from("legal_content").select("*").eq("slug", "terms").single as jest.Mock);
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: "Not found" },
      });

      const result = await cmsService.getLegalContent("invalid-slug");
      expect(result).toBeNull();
    });
  });

  describe("getFAQs", () => {
    it("should return array of FAQs when fetch is successful", async () => {
      const mockData = [{ id: "1", question: "Q1", answer: "A1" }];
      const mockOrder = (supabase.from("faqs").select("*").eq("is_active", true).order as jest.Mock);
      mockOrder.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await cmsService.getFAQs();
      expect(result).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith("faqs");
    });

    it("should return empty array when fetch fails", async () => {
      const mockOrder = (supabase.from("faqs").select("*").eq("is_active", true).order as jest.Mock);
      mockOrder.mockResolvedValue({
        data: null,
        error: { message: "Error" },
      });

      const result = await cmsService.getFAQs();
      expect(result).toEqual([]);
    });
  });
});
