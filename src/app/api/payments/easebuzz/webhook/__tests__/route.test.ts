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
    rpc: jest.fn(() => chain),
    then: jest.fn((onFulfilled: any) => Promise.resolve(onFulfilled({ data: null, error: null }))),
  };
  return {
    supabase: chain,
  };
});

// Mock Easebuzz Service
jest.mock("@/lib/payments/easebuzz", () => ({
  easebuzzService: {
    verifyResponseHash: jest.fn(),
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

describe("POST /api/payments/easebuzz/webhook", () => {
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
      async formData() {
        return new URLSearchParams(this.body);
      }
    };
    
    // Default implementation for then
    (supabase.then as jest.Mock).mockImplementation((onFulfilled: any) => {
      return Promise.resolve(onFulfilled({ data: null, error: null }));
    });
  });

  it("should return 400 if hash is invalid", async () => {
    (easebuzzService.verifyResponseHash as jest.Mock).mockReturnValue(false);

    const req = new Request("http://localhost/api/payments/easebuzz/webhook", {
      method: "POST",
      body: "status=success&hash=invalid",
    });

    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it("should process successful payment webhook", async () => {
    (easebuzzService.verifyResponseHash as jest.Mock).mockReturnValue(true);
    
    (supabase.then as jest.Mock)
      .mockImplementationOnce((onFulfilled: any) => Promise.resolve(onFulfilled({ data: { status: "pending" }, error: null }))) // select order
      .mockImplementationOnce((onFulfilled: any) => Promise.resolve(onFulfilled({ error: null }))); // rpc

    const req = new Request("http://localhost/api/payments/easebuzz/webhook", {
      method: "POST",
      body: "status=success&txnid=ORD123&easepayid=EP123&udf1=order-uuid",
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(supabase.rpc).toHaveBeenCalledWith("confirm_order_and_deduct_inventory", expect.any(Object));
  });

  it("should return 200 and skip if order already confirmed (idempotency)", async () => {
    (easebuzzService.verifyResponseHash as jest.Mock).mockReturnValue(true);
    
    (supabase.then as jest.Mock)
      .mockImplementationOnce((onFulfilled: any) => Promise.resolve(onFulfilled({ data: { status: "confirmed" }, error: null })));

    const req = new Request("http://localhost/api/payments/easebuzz/webhook", {
      method: "POST",
      body: "status=success&txnid=ORD123&udf1=order-uuid",
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});