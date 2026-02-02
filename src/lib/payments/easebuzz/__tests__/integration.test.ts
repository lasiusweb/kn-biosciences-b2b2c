/**
 * @jest-environment node
 */
import { POST } from "@/app/api/payments/easebuzz/webhook/route";
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
    verifyResponseHash: jest.fn(() => true),
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

describe("Fulfillment Integration", () => {
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
  });

  it("should trigger fulfillment RPC when webhook receives success", async () => {
    (supabase.then as jest.Mock)
      .mockImplementationOnce((onFulfilled: any) => Promise.resolve(onFulfilled({ data: { status: "pending" }, error: null }))) // select order
      .mockImplementationOnce((onFulfilled: any) => Promise.resolve(onFulfilled({ error: null }))); // rpc

    const req = new Request("http://localhost/api/payments/easebuzz/webhook", {
      method: "POST",
      body: "status=success&txnid=ORD123&easepayid=EP123&udf1=order-uuid&hash=mock_hash",
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);
    
    // Verify that the atomic RPC was called - this covers inventory, cart, and order status
    expect(supabase.rpc).toHaveBeenCalledWith("confirm_order_and_deduct_inventory", {
      p_order_id: "order-uuid",
      p_payment_id: "EP123",
      p_payment_method: "easebuzz"
    });
  });

  it("should not clear cart if payment failed", async () => {
    const req = new Request("http://localhost/api/payments/easebuzz/webhook", {
      method: "POST",
      body: "status=failure&txnid=ORD123&udf1=order-uuid&hash=mock_hash",
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(supabase.rpc).not.toHaveBeenCalledWith("confirm_order_and_deduct_inventory", expect.any(Object));
    expect(supabase.from).toHaveBeenCalledWith("orders");
    expect(supabase.update).toHaveBeenCalledWith(expect.objectContaining({ payment_status: "failed" }));
  });
});
