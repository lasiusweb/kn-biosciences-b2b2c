/**
 * @jest-environment node
 */
import { POST } from "../route";
import { supabaseAdmin } from "@/lib/supabase";
import { zohoCRMService } from "@/lib/microservices/zoho-service";

// Mock Supabase
jest.mock("@/lib/supabase", () => {
  const chain: any = {
    from: jest.fn(() => chain),
    insert: jest.fn(() => chain),
    then: jest.fn((onFulfilled: any) => Promise.resolve(onFulfilled({ data: null, error: null }))),
  };
  return {
    supabaseAdmin: chain,
  };
});

// Mock Zoho
jest.mock("@/lib/microservices/zoho-service", () => ({
  zohoCRMService: {
    createLead: jest.fn().mockResolvedValue({ success: true }),
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

describe("POST /api/contact/submit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).Request = class {
      body: any;
      constructor(url: string, init?: any) {
        this.body = init?.body;
      }
      async json() {
        return JSON.parse(this.body);
      }
    };
  });

  it("should return 400 if required fields are missing", async () => {
    const req = new Request("http://localhost/api/contact/submit", {
      method: "POST",
      body: JSON.stringify({ name: "John" }), // Missing email, subject, message
    });

    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it("should return 200, store in DB, and sync to Zoho if data is valid", async () => {
    const mockSubmission = {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      subject: "Test Subject",
      message: "Test message content",
    };

    (supabaseAdmin!.then as jest.Mock).mockImplementation((onFulfilled: any) => {
      return Promise.resolve(onFulfilled({ error: null }));
    });

    const req = new Request("http://localhost/api/contact/submit", {
      method: "POST",
      body: JSON.stringify(mockSubmission),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(supabaseAdmin!.from).toHaveBeenCalledWith("contact_submissions");
    expect(zohoCRMService.createLead).toHaveBeenCalledWith(expect.objectContaining({
      Email: "john@example.com",
      Last_Name: "Doe",
    }));
  });

  it("should return 500 if database insert fails", async () => {
    (supabaseAdmin!.then as jest.Mock).mockImplementation((onFulfilled: any) => {
      return Promise.resolve(onFulfilled({ error: { message: "DB Error" } }));
    });

    const req = new Request("http://localhost/api/contact/submit", {
      method: "POST",
      body: JSON.stringify({
        name: "John Doe",
        email: "john@example.com",
        subject: "Test",
        message: "Msg",
      }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(500);
    expect(zohoCRMService.createLead).not.toHaveBeenCalled();
  });
});
