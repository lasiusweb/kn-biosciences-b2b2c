/**
 * @jest-environment node
 */
import { POST } from "../route";
import { supabase } from "@/lib/supabase";
import { easebuzzService } from "@/lib/payments/easebuzz";

// Mock Supabase
jest.mock("@/lib/supabase", () => {
  const chain: any = {
    from: jest.fn(() => chain),
    select: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    single: jest.fn(() => chain),
    update: jest.fn(() => chain),
    then: jest.fn((onFulfilled: any) => {
      return Promise.resolve(onFulfilled({ data: null, error: null }));
    }),
  };
  return {
    supabase: chain,
  };
});

// Mock Easebuzz Service
jest.mock("@/lib/payments/easebuzz", () => ({
  easebuzzService: {
    generateHash: jest.fn(() => "mock_hash"),
    getPaymentUrl: jest.fn(() => "http://mock-easebuzz.com"),
  },
}));

// Mock next/server
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      status: init?.status || 200,
      json: async () => data,
    })),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe("POST /api/payments/easebuzz/initiate", () => {
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
    
    // Default implementation for then
    (supabase.then as jest.Mock).mockImplementation((onFulfilled: any) => {
      return Promise.resolve(onFulfilled({ data: null, error: null }));
    });
  });

  it("should return 400 if required fields are missing", async () => {
    const req = new Request("http://localhost/api/payments/easebuzz/initiate", {
      method: "POST",
      body: JSON.stringify({ amount: 100 }), 
    });

    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it("should return initiation payload if successful", async () => {
    const mockOrder = { id: "order-123", order_number: "ORD-123" };
    
    (supabase.then as jest.Mock)
      .mockImplementationOnce((onFulfilled: any) => Promise.resolve(onFulfilled({ data: mockOrder, error: null }))) // select
      .mockImplementationOnce((onFulfilled: any) => Promise.resolve(onFulfilled({ data: null, error: null }))); // update

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ status: 1, data: "mock_access_key" }),
    });

    const req = new Request("http://localhost/api/payments/easebuzz/initiate", {
      method: "POST",
      body: JSON.stringify({
        amount: 100,
        orderId: "order-123",
        customerInfo: { name: "John", email: "john@example.com", phone: "1234567890" }
      }),
    });

    const res = await POST(req as any);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.access_key).toBe("mock_access_key");
  });

  it("should return 500 if Easebuzz initiation fails", async () => {
    const mockOrder = { id: "order-123", order_number: "ORD-123" };
    (supabase.then as jest.Mock).mockImplementationOnce((onFulfilled: any) => 
      Promise.resolve(onFulfilled({ data: mockOrder, error: null }))
    );

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ status: 0, data: "Invalid Key" }),
    });

    const req = new Request("http://localhost/api/payments/easebuzz/initiate", {
      method: "POST",
      body: JSON.stringify({
        amount: 100,
        orderId: "order-123",
        customerInfo: { name: "John", email: "john@example.com" }
      }),
    });

    const res = await POST(req as any);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Invalid Key");
  });

  it("should return 404 if order not found", async () => {
    (supabase.then as jest.Mock).mockImplementationOnce((onFulfilled: any) => 
      Promise.resolve(onFulfilled({ data: null, error: { message: "Not found" } }))
    );

    const req = new Request("http://localhost/api/payments/easebuzz/initiate", {
      method: "POST",
      body: JSON.stringify({
        amount: 100,
        orderId: "non-existent",
        customerInfo: { name: "John", email: "john@example.com" }
      }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(404);
  });
});
