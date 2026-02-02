/**
 * @jest-environment node
 */
import { POST } from "../route";
import { supabase, supabaseAdmin } from "@/lib/supabase";

// Mock Supabase
jest.mock("@/lib/supabase", () => {
  const chain: any = {
    from: jest.fn(() => chain),
    select: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    single: jest.fn(() => chain),
    insert: jest.fn(() => chain),
    update: jest.fn(() => chain),
    rpc: jest.fn(() => chain),
    delete: jest.fn(() => chain),
    order: jest.fn(() => chain),
    range: jest.fn(() => chain),
  };
  
  // Terminal methods return promises via .then()
  chain.then = jest.fn((resolve: any) => resolve({ data: null, error: null }));

  return {
    supabase: {
      auth: {
        getUser: jest.fn(),
      },
    },
    supabaseAdmin: chain,
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

describe("POST /api/admin/quotes/approve", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).Request = class {
      url: string;
      headers: Map<string, string>;
      body: any;
      constructor(url: string, init?: any) {
        this.url = url;
        this.headers = new Map(Object.entries(init?.headers || {}));
        this.body = init?.body;
      }
      async json() {
        return JSON.parse(this.body);
      }
    };
  });

  it("should return 401 if not authenticated", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const req = new Request("http://localhost/api/admin/quotes/approve", {
      method: "POST",
      body: JSON.stringify({ quoteId: "quote-123" }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });

  it("should return 403 if not admin or sales_manager", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { user_metadata: { role: "customer" } } },
      error: null,
    });

    const req = new Request("http://localhost/api/admin/quotes/approve", {
      method: "POST",
      body: JSON.stringify({ quoteId: "quote-123" }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(403);
  });

  it("should approve quote and create order", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { user_metadata: { role: "sales_manager" } } },
      error: null,
    });

    const mockQuote = {
      id: "quote-123",
      user_id: "user-456",
      subtotal: 1000,
      tax_amount: 180,
      total_amount: 1180,
      status: "submitted",
      b2b_quote_items: [
        { variant_id: "var-1", quantity: 10, unit_price: 100, total_price: 1000 }
      ]
    };

    const mockOrder = { id: "order-789", order_number: "ORD-123" };

    // Setup sequence of terminal responses via .then
    (supabaseAdmin!.then as unknown as jest.Mock)
      .mockImplementationOnce((resolve: any) => resolve({ data: mockQuote, error: null })) // Get quote
      .mockImplementationOnce((resolve: any) => resolve({ data: [], error: null }))        // Get addresses
      .mockImplementationOnce((resolve: any) => resolve({ data: mockOrder, error: null })) // Create order
      .mockImplementationOnce((resolve: any) => resolve({ data: [], error: null }))        // Create order items
      .mockImplementationOnce((resolve: any) => resolve({ data: { status: "approved" }, error: null })); // Update quote

    const req = new Request("http://localhost/api/admin/quotes/approve", {
      method: "POST",
      body: JSON.stringify({ quoteId: "quote-123" }),
    });

    const res = await POST(req as any);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.orderId).toBe("order-789");
  });

  it("should return 400 if quote is already approved", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { user_metadata: { role: "admin" } } },
      error: null,
    });

    (supabaseAdmin!.then as unknown as jest.Mock).mockImplementationOnce((resolve: any) => 
      resolve({ data: { id: "quote-123", status: "approved" }, error: null })
    );

    const req = new Request("http://localhost/api/admin/quotes/approve", {
      method: "POST",
      body: JSON.stringify({ quoteId: "quote-123" }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("already approved");
  });

  it("should return 404 if quote not found", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { user_metadata: { role: "admin" } } },
      error: null,
    });

    (supabaseAdmin!.then as unknown as jest.Mock).mockImplementationOnce((resolve: any) => 
      resolve({ data: null, error: { message: "Not found" } })
    );

    const req = new Request("http://localhost/api/admin/quotes/approve", {
      method: "POST",
      body: JSON.stringify({ quoteId: "non-existent" }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(404);
  });

  it("should return 400 if quoteId is missing", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { user_metadata: { role: "admin" } } },
      error: null,
    });

    const req = new Request("http://localhost/api/admin/quotes/approve", {
      method: "POST",
      body: JSON.stringify({ }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it("should return 500 if order creation fails", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { user_metadata: { role: "admin" } } },
      error: null,
    });

    const mockQuote = { id: "quote-123", b2b_quote_items: [] };

    (supabaseAdmin!.then as unknown as jest.Mock)
      .mockImplementationOnce((resolve: any) => resolve({ data: mockQuote, error: null })) // Get quote
      .mockImplementationOnce((resolve: any) => resolve({ data: [], error: null }))        // Get addresses
      .mockImplementationOnce((resolve: any) => resolve({ data: null, error: { message: "DB Error" } })); // Create order

    const req = new Request("http://localhost/api/admin/quotes/approve", {
      method: "POST",
      body: JSON.stringify({ quoteId: "quote-123" }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(500);
  });
});