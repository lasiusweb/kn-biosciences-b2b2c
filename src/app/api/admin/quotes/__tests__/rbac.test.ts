/**
 * @jest-environment node
 */
import { GET } from "../route";
import { supabase, supabaseAdmin } from "@/lib/supabase";

// Mock Supabase
jest.mock("@/lib/supabase", () => {
  const mockSupabaseAdmin = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  };
  return {
    supabase: {
      auth: {
        getUser: jest.fn(),
      },
    },
    supabaseAdmin: mockSupabaseAdmin,
  };
});

// Mock next/server
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      status: init?.status || 200,
      json: async () => data,
    })),
  },
}));

describe("Quotes Admin RBAC", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).Request = class {
      url: string;
      headers: Map<string, string>;
      constructor(url: string, init?: any) {
        this.url = url;
        this.headers = new Map(Object.entries(init?.headers || {}));
      }
    };
  });

  it("should allow admin access", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { user_metadata: { role: "admin" } } },
    });

    (supabaseAdmin!.range as jest.Mock).mockResolvedValue({
      data: [],
      count: 0,
      error: null,
    });

    const req = new Request("http://localhost/api/admin/quotes", {
      headers: { Authorization: "Bearer admin-token" },
    });
    const res = await GET(req as any);
    expect(res.status).toBe(200);
  });

  it("should allow sales_manager access", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { user_metadata: { role: "sales_manager" } } },
    });

    (supabaseAdmin!.range as jest.Mock).mockResolvedValue({
      data: [],
      count: 0,
      error: null,
    });

    const req = new Request("http://localhost/api/admin/quotes", {
      headers: { Authorization: "Bearer sales-token" },
    });
    const res = await GET(req as any);
    
    // This is the RED phase: currently it returns 403 because sales_manager is not in route.ts
    expect(res.status).toBe(200);
  });

  it("should deny customer access", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { user_metadata: { role: "customer" } } },
    });

    const req = new Request("http://localhost/api/admin/quotes", {
      headers: { Authorization: "Bearer customer-token" },
    });
    const res = await GET(req as any);
    expect(res.status).toBe(403);
  });
});
