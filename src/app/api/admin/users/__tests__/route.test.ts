/**
 * @jest-environment node
 */
import { GET, PATCH } from "../route";
import { supabase, supabaseAdmin } from "@/lib/supabase";

// Mock Supabase
jest.mock("@/lib/supabase", () => {
  const mockSupabaseAdmin = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
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

describe("Admin Users API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).Request = class {
      url: string;
      headers: Map<string, string>;
      method: string;
      body: any;
      constructor(url: string, init?: any) {
        this.url = url;
        this.headers = new Map(Object.entries(init?.headers || {}));
        this.method = init?.method || 'GET';
        this.body = init?.body;
      }
      async json() {
        return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
      }
    };
  });

  describe("GET", () => {
    it("should return 403 if not authorized", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { user_metadata: { role: "customer" } } },
      });

      const req = new Request("http://localhost/api/admin/users", {
        headers: { Authorization: "Bearer token" },
      });
      const res = await GET(req as any);
      expect(res.status).toBe(403);
    });

    it("should return users for admin", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { user_metadata: { role: "admin" } } },
      });

      const mockUsers = [
        { id: "1", email: "user@example.com", role: "customer", orders: [], b2b_quotes: [] },
      ];

      (supabaseAdmin!.range as jest.Mock).mockResolvedValue({
        data: mockUsers,
        count: 1,
        error: null,
      });

      const req = new Request("http://localhost/api/admin/users?page=1&limit=10", {
        headers: { Authorization: "Bearer token" },
      });
      const res = await GET(req as any);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.users).toHaveLength(1);
      expect(data.users[0].email).toBe("user@example.com");
    });
  });

  describe("PATCH", () => {
    it("should update user role", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { user_metadata: { role: "admin" } } },
      });

      (supabaseAdmin!.single as jest.Mock).mockResolvedValue({
        data: { id: "1", role: "staff" },
        error: null,
      });

      const req = new Request("http://localhost/api/admin/users", {
        method: "PATCH",
        headers: { Authorization: "Bearer token" },
        body: JSON.stringify({ userId: "1", role: "staff" }),
      });
      const res = await PATCH(req as any);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.role).toBe("staff");
    });
  });
});