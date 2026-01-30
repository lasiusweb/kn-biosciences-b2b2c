import { handleRedirects } from "../lib/middleware-logic";
import { RedirectService } from "../lib/redirect-service";

jest.mock("../lib/redirect-service", () => ({
  RedirectService: {
    getRedirect: jest.fn(),
  },
}));

// Mock Next.js server objects
const mockRedirect = jest.fn();
jest.mock("next/server", () => ({
  NextResponse: {
    redirect: (url: any, status: number) => ({
      status,
      headers: { get: (key: string) => key === "location" ? url.toString() : null },
      url: url.toString()
    }),
    next: () => ({ headers: { get: () => "1" } })
  }
}));

describe("Middleware Logic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a redirect response if a mapping exists", async () => {
    const redirectData = {
      source_url: "/old-path",
      target_url: "/new-path",
      status_code: 301,
    };
    (RedirectService.getRedirect as jest.Mock).mockResolvedValue(redirectData);

    const mockReq = {
      nextUrl: {
        pathname: "/old-path",
        clone: () => new URL("http://localhost:3000/old-path")
      }
    };

    const res = await handleRedirects(mockReq as any);

    expect(res?.status).toBe(301);
    expect(res?.url).toBe("http://localhost:3000/new-path");
  });

  it("should return null if no redirect mapping exists", async () => {
    (RedirectService.getRedirect as jest.Mock).mockResolvedValue(null);

    const mockReq = {
      nextUrl: {
        pathname: "/valid-path",
        clone: () => new URL("http://localhost:3000/valid-path")
      }
    };

    const res = await handleRedirects(mockReq as any);
    expect(res).toBeNull();
  });

  it("should skip internal and static paths", async () => {
    const mockReq = {
      nextUrl: {
        pathname: "/_next/static/test.js"
      }
    };

    const res = await handleRedirects(mockReq as any);
    expect(res).toBeNull();
    expect(RedirectService.getRedirect).not.toHaveBeenCalled();
  });
});