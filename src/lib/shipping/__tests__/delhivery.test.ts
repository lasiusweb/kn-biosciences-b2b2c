import { calculateShippingOptions, DelhiveryClient } from "../delhivery";

describe("calculateShippingOptions", () => {
  let mockClient: Partial<DelhiveryClient>;

  beforeEach(() => {
    mockClient = {
      calculateRate: jest.fn(),
    };
  });

  it("returns only courier option when serviceable and weight < 5kg", async () => {
    (mockClient.calculateRate as jest.Mock).mockResolvedValue({
      type: "COURIER",
      carrier_name: "Delhivery",
      cost: 150,
      handling_fee: 0,
      is_serviceable: true,
    });

    const options = await calculateShippingOptions("500001", 2000, mockClient as DelhiveryClient);

    expect(options).toHaveLength(1);
    expect(options[0].type).toBe("COURIER");
    expect(options[0].cost).toBe(150);
  });

  it("returns both courier and transport options when serviceable and weight >= 5kg", async () => {
    (mockClient.calculateRate as jest.Mock).mockResolvedValue({
      type: "COURIER",
      carrier_name: "Delhivery",
      cost: 400,
      handling_fee: 0,
      is_serviceable: true,
    });

    const options = await calculateShippingOptions("500001", 6000, mockClient as DelhiveryClient);

    expect(options).toHaveLength(2);
    expect(options.some(o => o.type === "COURIER")).toBe(true);
    expect(options.some(o => o.type === "TRANSPORT")).toBe(true);
    
    const transport = options.find(o => o.type === "TRANSPORT");
    expect(transport?.handling_fee).toBe(150);
    expect(transport?.cost).toBe(0);
  });

  it("returns only transport option when courier is unserviceable", async () => {
    (mockClient.calculateRate as jest.Mock).mockResolvedValue(null);

    const options = await calculateShippingOptions("999999", 1000, mockClient as DelhiveryClient);

    expect(options).toHaveLength(1);
    expect(options[0].type).toBe("TRANSPORT");
    expect(options[0].carrier_name).toContain("Transport");
  });
});
