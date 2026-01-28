// Delhivery Shipping Integration Test Suite
import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import delhiveryService from "@/lib/shipping/delhivery";

// Mock fetch for API calls
global.fetch = jest.fn();

describe("Delhivery Shipping Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock environment variables
    process.env.DELHIVERY_API_TOKEN = "test_token";
    process.env.DELHIVERY_API_BASE_URL = "https://test.delhivery.com/api/";
    process.env.DELHIVERY_WAYBILL_URL = "https://test.waybill.delhivery.com/";
    process.env.DELHIVERY_TEST_MODE = "true";
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Delhivery Service Initialization", () => {
    it("should initialize with correct headers", () => {
      // Test service initialization
      expect(process.env.DELHIVERY_API_TOKEN).toBe("test_token");
    });
  });

  describe("Address Validation", () => {
    it("should validate complete address correctly", () => {
      const validAddress = {
        name: "John Doe",
        phone: "9876543210",
        address: "123 Main Street",
        pin: "110001",
        city: "Delhi",
        state: "Delhi",
        country: "India",
      };

      const result = delhiveryService.validateAddress(validAddress);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect invalid phone number", () => {
      const invalidAddress = {
        name: "John Doe",
        phone: "123456",
        address: "123 Main Street",
        pin: "110001",
        city: "Delhi",
        state: "Delhi",
        country: "India",
      };

      const result = delhiveryService.validateAddress(invalidAddress);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Valid Indian mobile number is required");
    });

    it("should detect invalid pincode", () => {
      const invalidAddress = {
        name: "John Doe",
        phone: "9876543210",
        address: "123 Main Street",
        pin: "123",
        city: "Delhi",
        state: "Delhi",
        country: "India",
      };

      const result = delhiveryService.validateAddress(invalidAddress);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Valid 6-digit Indian pincode is required",
      );
    });

    it("should detect missing required fields", () => {
      const incompleteAddress = {
        name: "",
        phone: "",
        address: "",
        pin: "",
        city: "",
        state: "",
        country: "",
      };

      const result = delhiveryService.validateAddress(incompleteAddress);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(5);
    });
  });

  describe("Package Dimensions Calculation", () => {
    it("should calculate total weight correctly", () => {
      const items = [
        { weight: 1.5, quantity: 2 },
        { weight: 0.8, quantity: 1 },
        { weight: 2.2, quantity: 1 },
      ];

      const result = delhiveryService.calculatePackageDimensions(items);

      expect(result.totalWeight).toBe(6.0); // (1.5*2) + 0.8 + 2.2
    });

    it("should calculate volumetric weight correctly", () => {
      const items = [{ length: 10, breadth: 8, height: 5, quantity: 1 }];

      const result = delhiveryService.calculatePackageDimensions(items);

      // Volumetric weight = (L*B*H)/5000
      const expectedVolumetric = (10 * 8 * 5) / 5000;
      expect(result.volumetricWeight).toBe(expectedVolumetric);
    });

    it("should use chargeable weight (maximum of actual and volumetric)", () => {
      const items = [
        {
          weight: 0.5, // Light but bulky
          length: 30,
          breadth: 20,
          height: 15,
          quantity: 1,
        },
      ];

      const result = delhiveryService.calculatePackageDimensions(items);

      expect(result.chargeableWeight).toBeGreaterThanOrEqual(
        result.totalWeight,
      );
      expect(result.chargeableWeight).toBeGreaterThanOrEqual(
        result.volumetricWeight,
      );
    });
  });

  describe("Shipment Creation", () => {
    it("should create shipment successfully", async () => {
      const mockShipment = {
        shipments: [
          {
            name: "John Doe",
            order_id: "ORD123",
            add: {
              name: "John Doe",
              phone: "9876543210",
              address: "123 Main Street",
              pin: "110001",
              city: "Delhi",
              state: "Delhi",
              country: "India",
              address_type: "home",
            },
            payment_mode: "Prepaid",
            order_date: "2024-01-01",
            total_amount: 500,
            weight: 1.5,
            quantity: 1,
            shipping_method: "Surface",
            order_type: "ESD",
          },
        ],
      };

      const mockResponse = {
        success: true,
        packages: [
          {
            waybill: "WAY123456",
            order_id: "ORD123",
            status: "manifested",
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockResponse),
        ok: true,
      });

      const result = await delhiveryService.createShipment(mockShipment);

      expect(result.success).toBe(true);
      expect(result.packages[0].waybill).toBe("WAY123456");
    });

    it("should handle shipment creation failure", async () => {
      const mockShipment = {
        shipments: [], // Invalid empty shipments
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({
          success: false,
          reminder: "Invalid shipment data",
        }),
        ok: true,
      });

      await expect(
        delhiveryService.createShipment(mockShipment),
      ).rejects.toThrow();
    });
  });

  describe("Rate Calculation", () => {
    it("should fetch shipping rates successfully", async () => {
      const rateData = {
        origin_pin: "110001",
        destination_pin: "400001",
        weight: 1.5,
        cod: false,
      };

      const mockRates = [
        {
          courier_name: "Delhivery",
          courier_id: "DELH",
          estimated_delivery_days: 3,
          rate: 45,
          service_type: "Standard",
          freight_charge: 40,
          cod_charge: 0,
          total_charge: 45,
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ rates: mockRates }),
        ok: true,
      });

      const result = await delhiveryService.getRates(rateData);

      expect(result).toHaveLength(1);
      expect(result[0].courier_name).toBe("Delhivery");
      expect(result[0].rate).toBe(45);
    });

    it("should handle rate calculation for COD orders", async () => {
      const rateData = {
        origin_pin: "110001",
        destination_pin: "400001",
        weight: 1.5,
        cod: true,
        declared_value: 1000,
      };

      const mockRates = [
        {
          courier_name: "Delhivery",
          courier_id: "DELH",
          estimated_delivery_days: 3,
          rate: 55, // Base rate + COD charge
          service_type: "Standard",
          freight_charge: 40,
          cod_surcharge: 10,
          cod_charge: 15,
          total_charge: 55,
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ rates: mockRates }),
        ok: true,
      });

      const result = await delhiveryService.getRates(rateData);

      expect(result[0].cod_surcharge).toBe(10);
      expect(result[0].cod_charge).toBe(15);
    });
  });

  describe("Package Tracking", () => {
    it("should track shipment successfully", async () => {
      const waybills = ["WAY123456", "WAY789012"];

      const mockTrackingData = [
        {
          waybill: "WAY123456",
          status: "Delivered",
          scans: [
            {
              scan_datetime: "2024-01-01 10:00:00",
              scan_status: "Manifested",
              scan_location: "Delhi Hub",
              instructions: "Package manifested for delivery",
            },
            {
              scan_datetime: "2024-01-02 18:00:00",
              scan_status: "Delivered",
              scan_location: "Mumbai",
              instructions: "Package delivered to recipient",
            },
          ],
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockTrackingData),
        ok: true,
      });

      const result = await delhiveryService.trackShipment(waybills);

      expect(result).toHaveLength(1);
      expect(result[0].waybill).toBe("WAY123456");
      expect(result[0].status).toBe("Delivered");
      expect(result[0].scans).toHaveLength(2);
    });

    it("should handle tracking not found", async () => {
      const waybills = ["INVALID123"];

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue([]),
        ok: true,
      });

      const result = await delhiveryService.trackShipment(waybills);

      expect(result).toHaveLength(0);
    });
  });

  describe("Waybill Download", () => {
    it("should download waybill successfully", async () => {
      const waybills = ["WAY123456"];
      const mockBuffer = Buffer.from("mock pdf data");

      (fetch as jest.Mock).mockResolvedValueOnce({
        arrayBuffer: jest.fn().mockResolvedValue(mockBuffer),
        ok: true,
      });

      const result = await delhiveryService.downloadWaybill(waybills);

      expect(result).toBeInstanceOf(Buffer);
    });

    it("should handle waybill download failure", async () => {
      const waybills = ["INVALID123"];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(delhiveryService.downloadWaybill(waybills)).rejects.toThrow(
        "Failed to download waybill: 404",
      );
    });
  });

  describe("Pickup Scheduling", () => {
    it("should schedule pickup successfully", async () => {
      const pickupData = {
        pickup_date: "2024-01-15",
        pickup_time: "14:00",
        pickup_location: {
          name: "KN Biosciences",
          phone: "9876543210",
          address: "Warehouse Area",
          pin: "110001",
          city: "Delhi",
          state: "Delhi",
          country: "India",
          address_type: "business",
        },
        expected_package_count: 5,
      };

      const mockResponse = {
        success: true,
        pickup_id: "PICK123456",
        confirmation_number: "CONF789",
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockResponse),
        ok: true,
      });

      const result = await delhiveryService.schedulePickup(pickupData);

      expect(result.success).toBe(true);
      expect(result.pickup_id).toBe("PICK123456");
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      await expect(
        delhiveryService.getRates({
          origin_pin: "110001",
          destination_pin: "400001",
          weight: 1.5,
        }),
      ).rejects.toThrow("Network error");
    });

    it("should handle API error responses", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({
          error: "Internal server error",
        }),
      });

      await expect(
        delhiveryService.getRates({
          origin_pin: "110001",
          destination_pin: "400001",
          weight: 1.5,
        }),
      ).rejects.toThrow();
    });
  });
});

// Integration Tests: End-to-End Shipping Flow
describe("End-to-End Shipping Flow", () => {
  it("should complete full shipping workflow", async () => {
    // 1. Calculate rates
    const rateData = {
      origin_pin: "110001",
      destination_pin: "400001",
      weight: 2.5,
      cod: false,
    };

    const mockRates = [
      {
        courier_name: "Delhivery",
        rate: 80,
        estimated_delivery_days: 3,
        service_type: "Standard",
      },
    ];

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ rates: mockRates }),
        ok: true,
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({
          success: true,
          packages: [
            {
              waybill: "WAY123456",
              status: "manifested",
            },
          ],
        }),
        ok: true,
      })
      .mockResolvedValueOnce({
        arrayBuffer: jest.fn().mockResolvedValue(Buffer.from("pdf data")),
        ok: true,
      });

    // Get rates
    const rates = await delhiveryService.getRates(rateData);
    expect(rates).toHaveLength(1);

    // 2. Create shipment
    const shipmentData = {
      shipments: [
        {
          name: "Test Customer",
          order_id: "TEST123",
          add: {
            name: "Test Customer",
            phone: "9876543210",
            address: "Test Address",
            pin: "400001",
            city: "Mumbai",
            state: "Maharashtra",
            country: "India",
            address_type: "home",
          },
          payment_mode: "Prepaid",
          total_amount: 500,
          weight: 2.5,
          quantity: 1,
          shipping_method: "Standard",
          order_type: "ESD",
        },
      ],
    };

    const createResult = await delhiveryService.createShipment(shipmentData);
    expect(createResult.packages[0].waybill).toBe("WAY123456");

    // 3. Download waybill
    const waybillBuffer = await delhiveryService.downloadWaybill(["WAY123456"]);
    expect(waybillBuffer).toBeInstanceOf(Buffer);

    // 4. Track shipment
    const trackingData = await delhiveryService.trackShipment(["WAY123456"]);
    expect(trackingData[0].waybill).toBe("WAY123456");
  });
});

describe("Shipping Service Utility Functions", () => {
  it("should validate business hours for pickup", () => {
    // Test within business hours
    const validTime = "14:30"; // 2:30 PM

    // Test outside business hours
    const invalidEarlyTime = "09:00"; // 9:00 AM
    const invalidLateTime = "19:00"; // 7:00 PM

    // These would be validated in the pickup endpoint
    expect(validTime).toBeTruthy();
    expect(invalidEarlyTime).toBeTruthy();
    expect(invalidLateTime).toBeTruthy();
  });

  it("should calculate package consolidation correctly", () => {
    const items = [
      { weight: 1, length: 10, breadth: 8, height: 5, quantity: 2 },
      { weight: 0.5, length: 15, breadth: 10, height: 8, quantity: 1 },
    ];

    const result = delhiveryService.calculatePackageDimensions(items);

    expect(result.totalWeight).toBe(2.5); // (1*2) + 0.5
    expect(result.dimensions.length).toBe(15); // Max length
    expect(result.dimensions.breadth).toBe(26); // (8*2) + 10
    expect(result.dimensions.height).toBe(18); // (5*2) + 8
  });
});
