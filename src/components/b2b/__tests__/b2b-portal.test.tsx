// B2B Portal Component Test Suite
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { B2BPortal } from "@/components/b2b/b2b-portal";
import { B2BQuote, ProductVariant } from "@/types";

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock PDF generation
jest.mock("@/lib/quote-pdf", () => ({
  downloadQuotePDF: jest.fn(),
}));

describe("B2B Portal Component", () => {
  const mockQuotes: B2BQuote[] = [
    {
      id: "quote-1",
      user_id: "user-1",
      status: "submitted",
      valid_until: "2024-02-01",
      subtotal: 10000,
      tax_amount: 1800,
      total_amount: 11800,
      notes: "Test quote",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    },
  ];

  const mockProducts: ProductVariant[] = [
    {
      id: "variant-1",
      product_id: "product-1",
      sku: "BIO-001",
      weight: 1,
      weight_unit: "kg",
      packing_type: "bag",
      form: "powder",
      price: 500,
      cost_price: 300,
      stock_quantity: 100,
      low_stock_threshold: 10,
      track_inventory: true,
      image_urls: [],
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock API responses
    (fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes("/api/b2b/quotes")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockQuotes),
        });
      }
      if (url.includes("/api/b2b/products")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProducts),
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should render B2B portal header correctly", () => {
    render(<B2BPortal />);

    expect(screen.getByText("B2B Portal")).toBeInTheDocument();
    expect(
      screen.getByText("Manage bulk orders and get wholesale pricing"),
    ).toBeInTheDocument();
  });

  it("should display quotes list tab by default", async () => {
    render(<B2BPortal />);

    await waitFor(() => {
      expect(screen.getByText("Recent Quotes")).toBeInTheDocument();
    });
  });

  it("should display quotes in table format", async () => {
    render(<B2BPortal />);

    await waitFor(() => {
      expect(screen.getByText("QUOTE-1")).toBeInTheDocument();
      expect(screen.getByText("Submitted")).toBeInTheDocument();
      expect(screen.getByText("₹11,800")).toBeInTheDocument();
    });
  });

  it("should show no quotes message when quotes list is empty", async () => {
    (fetch as jest.Mock).mockImplementationOnce(() => ({
      ok: true,
      json: () => Promise.resolve([]),
    }));

    render(<B2BPortal />);

    await waitFor(() => {
      expect(
        screen.getByText(
          "No quotes found. Create your first quote to get started.",
        ),
      ).toBeInTheDocument();
    });
  });

  it("should switch to new quote tab when clicked", async () => {
    render(<B2BPortal />);

    const newQuoteTab = screen.getByText("Create Quote");
    fireEvent.click(newQuoteTab);

    await waitFor(() => {
      expect(screen.getByText("Create New Quote Request")).toBeInTheDocument();
    });
  });

  it("should display wholesale pricing tab content", async () => {
    render(<B2BPortal />);

    const pricingTab = screen.getByText("Wholesale Pricing");
    fireEvent.click(pricingTab);

    await waitFor(() => {
      expect(screen.getByText("Wholesale Pricing Tiers")).toBeInTheDocument();
      expect(screen.getByText("Bronze Tier")).toBeInTheDocument();
      expect(screen.getByText("Silver Tier")).toBeInTheDocument();
      expect(screen.getByText("Gold Tier")).toBeInTheDocument();
    });
  });

  it("should add product to quote when form is filled and add button clicked", async () => {
    render(<B2BPortal />);

    // Switch to new quote tab
    const newQuoteTab = screen.getByText("Create Quote");
    fireEvent.click(newQuoteTab);

    await waitFor(() => {
      expect(screen.getByText("Add Products")).toBeInTheDocument();
    });

    // Fill in product selection
    const productSelect = screen.getByText("Select product");
    fireEvent.click(productSelect);

    await waitFor(() => {
      const productOption = screen.getByText("BIO-001");
      fireEvent.click(productOption);
    });

    // Fill in quantity
    const quantityInput = screen.getByPlaceholderText("0");
    fireEvent.change(quantityInput, { target: { value: "5" } });

    // Fill in unit price
    const priceInput = screen.getByPlaceholderText("0.00");
    fireEvent.change(priceInput, { target: { value: "450" } });

    // Click add button
    const addButton = screen.getByText("Add");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("Quote Items")).toBeInTheDocument();
    });
  });

  it("should calculate quote totals correctly when items are added", async () => {
    render(<B2BPortal />);

    // Switch to new quote tab
    const newQuoteTab = screen.getByText("Create Quote");
    fireEvent.click(newQuoteTab);

    await waitFor(() => {
      expect(screen.getByText("Add Products")).toBeInTheDocument();
    });

    // Add an item
    const productSelect = screen.getByText("Select product");
    fireEvent.click(productSelect);

    await waitFor(() => {
      const productOption = screen.getByText("BIO-001");
      fireEvent.click(productOption);
    });

    const quantityInput = screen.getByPlaceholderText("0");
    fireEvent.change(quantityInput, { target: { value: "10" } });

    const priceInput = screen.getByPlaceholderText("0.00");
    fireEvent.change(priceInput, { target: { value: "400" } });

    const addButton = screen.getByText("Add");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("Quote Summary")).toBeInTheDocument();
      expect(screen.getByText("Subtotal:")).toBeInTheDocument();
      expect(screen.getByText("₹4,000")).toBeInTheDocument();
    });
  });

  it("should submit quote when submit button is clicked", async () => {
    const mockResponse = { ...mockQuotes[0], id: "new-quote" };

    (fetch as jest.Mock).mockImplementation((url) => {
      if (
        url.includes("/api/b2b/quotes") &&
        !url.includes("/api/b2b/quotes/")
      ) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQuotes),
      });
    });

    render(<B2BPortal />);

    // Switch to new quote tab
    const newQuoteTab = screen.getByText("Create Quote");
    fireEvent.click(newQuoteTab);

    await waitFor(() => {
      expect(screen.getByText("Add Products")).toBeInTheDocument();
    });

    // Add an item
    const productSelect = screen.getByText("Select product");
    fireEvent.click(productSelect);

    await waitFor(() => {
      const productOption = screen.getByText("BIO-001");
      fireEvent.click(productOption);
    });

    const quantityInput = screen.getByPlaceholderText("0");
    fireEvent.change(quantityInput, { target: { value: "5" } });

    const priceInput = screen.getByPlaceholderText("0.00");
    fireEvent.change(priceInput, { target: { value: "400" } });

    const addButton = screen.getByText("Add");
    fireEvent.click(addButton);

    // Submit quote
    const submitButton = screen.getByText("Submit Quote Request");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/b2b/quotes",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      );
    });
  });

  it("should show validation error when trying to submit empty quote", async () => {
    // Mock alert
    const mockAlert = jest.fn();
    global.alert = mockAlert;

    render(<B2BPortal />);

    // Switch to new quote tab
    const newQuoteTab = screen.getByText("Create Quote");
    fireEvent.click(newQuoteTab);

    await waitFor(() => {
      expect(screen.getByText("Create New Quote Request")).toBeInTheDocument();
    });

    // Try to submit without items
    const submitButton = screen.getByText("Submit Quote Request");
    fireEvent.click(submitButton);

    expect(mockAlert).toHaveBeenCalledWith(
      "Please add at least one product to the quote",
    );
  });

  it("should download PDF when download button is clicked", async () => {
    const { downloadQuotePDF } = require("@/lib/quote-pdf");

    render(<B2BPortal />);

    await waitFor(() => {
      expect(screen.getByText("Recent Quotes")).toBeInTheDocument();
    });

    // Click download PDF button
    const downloadButton = screen.getByText("PDF");
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/b2b/quotes/quote-1");
    });

    // Mock the detailed quote response
    (fetch as jest.Mock).mockImplementationOnce(() => ({
      ok: true,
      json: () =>
        Promise.resolve({
          ...mockQuotes[0],
          user: {
            company_name: "Test Company",
            email: "test@example.com",
            first_name: "John",
            last_name: "Doe",
          },
          b2b_quote_items: [],
        }),
    }));

    // Click download again
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(downloadQuotePDF).toHaveBeenCalled();
    });
  });

  it("should display wholesale pricing tiers correctly", async () => {
    render(<B2BPortal />);

    const pricingTab = screen.getByText("Wholesale Pricing");
    fireEvent.click(pricingTab);

    await waitFor(() => {
      expect(screen.getByText("5% Off")).toBeInTheDocument();
      expect(screen.getByText("10% Off")).toBeInTheDocument();
      expect(screen.getByText("15% Off")).toBeInTheDocument();
    });
  });

  it("should show bulk order benefits", async () => {
    render(<B2BPortal />);

    const pricingTab = screen.getByText("Wholesale Pricing");
    fireEvent.click(pricingTab);

    await waitFor(() => {
      expect(screen.getByText("Bulk Order Benefits")).toBeInTheDocument();
      expect(screen.getByText("Free Shipping")).toBeInTheDocument();
      expect(screen.getByText("Priority Processing")).toBeInTheDocument();
      expect(screen.getByText("Dedicated Support")).toBeInTheDocument();
      expect(screen.getByText("Flexible Payment Terms")).toBeInTheDocument();
    });
  });
});

describe("B2B Portal Integration Tests", () => {
  it("should complete full quote creation workflow", async () => {
    const mockNewQuote = {
      id: "new-quote-id",
      user_id: "user-1",
      status: "submitted",
      valid_until: "2024-02-01",
      subtotal: 5000,
      tax_amount: 900,
      total_amount: 5900,
      notes: "Test integration quote",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    (fetch as jest.Mock).mockImplementation((url) => {
      if (
        url.includes("/api/b2b/quotes") &&
        !url.includes("/api/b2b/quotes/")
      ) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockNewQuote),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });

    render(<B2BPortal />);

    // Navigate to new quote
    const newQuoteTab = screen.getByText("Create Quote");
    fireEvent.click(newQuoteTab);

    await waitFor(() => {
      expect(screen.getByText("Create New Quote Request")).toBeInTheDocument();
    });

    // Add product
    const productSelect = screen.getByText("Select product");
    fireEvent.click(productSelect);

    // Wait for products to load and select first product
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/b2b/products");
    });

    // Mock products response
    (fetch as jest.Mock).mockImplementationOnce(() => ({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: "variant-1",
            sku: "BIO-001",
            wholesale_pricing: { bronze: 475, silver: 450, gold: 425 },
          },
        ]),
    }));

    fireEvent.click(productSelect);

    await waitFor(() => {
      const productOption = screen.getByText("BIO-001");
      fireEvent.click(productOption);
    });

    // Fill form
    const quantityInput = screen.getByPlaceholderText("0");
    fireEvent.change(quantityInput, { target: { value: "10" } });

    const priceInput = screen.getByPlaceholderText("0.00");
    fireEvent.change(priceInput, { target: { value: "500" } });

    // Add item
    const addButton = screen.getByText("Add");
    fireEvent.click(addButton);

    // Submit quote
    const submitButton = screen.getByText("Submit Quote Request");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/b2b/quotes",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("10"),
        }),
      );
    });
  });
});
