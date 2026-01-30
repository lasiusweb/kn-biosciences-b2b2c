import { RedirectService } from "../../redirect-service";
import { supabase } from "../../supabase";

jest.mock("../../supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}));

describe("RedirectService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    RedirectService.clearCache();
  });

  it("should return a redirect mapping if source URL exists", async () => {
    const mockRedirect = {
      source_url: "/old-path",
      target_url: "/new-path",
      status_code: 301,
    };

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockRedirect, error: null }),
    });

    const result = await RedirectService.getRedirect("/old-path");
    expect(result).toEqual(mockRedirect);
  });

  it("should return null if source URL does not exist", async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
    });

    const result = await RedirectService.getRedirect("/non-existent");
    expect(result).toBeNull();
  });

  it("should cache redirect mappings", async () => {
    const mockRedirect = {
      source_url: "/cached-path",
      target_url: "/target-path",
      status_code: 301,
    };

    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({ data: mockRedirect, error: null });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    // First call - should hit DB
    await RedirectService.getRedirect("/cached-path");
    // Second call - should hit cache
    await RedirectService.getRedirect("/cached-path");

    expect(mockSingle).toHaveBeenCalledTimes(1);
  });
});
