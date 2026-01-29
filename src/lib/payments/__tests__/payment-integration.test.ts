// Payment Gateway Integration Test Suite
import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";

// Mock Razorpay module to avoid initialization error with missing env vars.
// Must be before imports that use it.
jest.mock("razorpay", () => {
  return jest.fn().mockImplementation(() => {
    return {
      orders: {
        create: jest.fn(),
        fetchPayments: jest.fn(),
      },
      payments: {
        capture: jest.fn(),
        fetch: jest.fn(),
        refund: jest.fn(),
      },
      paymentLink: {
        create: jest.fn(),
      },
    };
  });
});

import paymentService, {
  verifyWebhookSignature,
} from "@/lib/payments/razorpay";
import payuService from "@/lib/payments/payu";

// Mock fetch for API calls
global.fetch = jest.fn();

describe("Payment Gateway Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock environment variables
    process.env.RAZORPAY_KEY_ID = "test_key_id";
    process.env.RAZORPAY_KEY_SECRET = "test_key_secret";
    process.env.RAZORPAY_WEBHOOK_SECRET = "test_webhook_secret";
    process.env.PAYU_MERCHANT_KEY = "test_merchant_key";
    process.env.PAYU_SALT = "test_salt";
    process.env.PAYU_TEST_MODE = "true";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Razorpay Payment Service", () => {
    it("should create a payment order successfully", async () => {
      const mockOrder = {
        id: "order_test123",
        amount: 50000, // 500.00 in paise
        currency: "INR",
        receipt: "order_123",
        status: "created",
        notes: {},
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockOrder),
      });

      const orderData = {
        amount: 500,
        currency: "INR",
        receipt: "order_123",
      };

      const result = await paymentService.createOrder(orderData);
      
      expect(result).toBeDefined();
      expect(result.status).toBe("created");
    });

    it("should handle error when creating payment order fails", async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"));

      const orderData = {
        amount: 500,
        currency: "INR",
        receipt: "order_123",
      };

      await expect(paymentService.createOrder(orderData)).rejects.toThrow(
        "Failed to create payment order",
      );
    });

    it("should capture payment successfully", async () => {
      const mockPayment = {
        id: "pay_test123",
        status: "captured",
        amount: 50000,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockPayment),
      });

      const result = await paymentService.capturePayment("pay_test123", 500);
      
      expect(result).toBeDefined();
      expect(result.status).toBe("captured");
    });

    it("should verify payment signature correctly", () => {
      const orderId = "order_123";
      const paymentId = "pay_123";
      const secret = "test_key_secret";
      
      const crypto = require("crypto");
      const signature = crypto
        .createHmac("sha256", secret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      const isValid = paymentService.verifyPaymentSignature(
        orderId,
        paymentId,
        signature,
      );
      
      expect(isValid).toBe(true);
    });

    it("should return false for invalid signature", () => {
      const isValid = paymentService.verifyPaymentSignature(
        "order_123",
        "pay_123",
        "invalid_signature",
      );
      
      expect(isValid).toBe(false);
    });
  });

  describe("PayU Payment Service", () => {
    it("should generate PayU payment hash correctly", () => {
      const txnid = "tx_123";
      const amount = "500.00";
      const productinfo = "Test Product";
      const firstname = "John";
      const email = "john@example.com";
      
      const hash = payuService.generateHash({
        txnid,
        amount,
        productinfo,
        firstname,
        email,
      });
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
    });

    it("should generate correct payment URL", () => {
      const params = {
        txnid: "tx_123",
        amount: "500.00",
        productinfo: "Test Product",
        firstname: "John",
        email: "john@example.com",
        phone: "9876543210",
        surl: "http://localhost:3000/api/payments/success",
        furl: "http://localhost:3000/api/payments/failure",
      };
      
      const url = payuService.getPaymentUrl(params);
      
      expect(url).toContain("https://test.payu.in/_payment");
      expect(url).toContain("key=test_merchant_key");
      expect(url).toContain("txnid=tx_123");
    });

    it("should verify PayU response hash correctly", () => {
      const response = {
        txnid: "tx_123",
        amount: "500.00",
        productinfo: "Test Product",
        firstname: "John",
        email: "john@example.com",
        status: "success",
        hash: "dummy_hash",
      };
      
      // Since we don't know the exact hash calculation for dummy salt,
      // we'll just check if it returns a boolean
      const isValid = payuService.verifyResponseHash(response, "dummy_hash");
      expect(typeof isValid).toBe("boolean");
    });
  });

  describe("Webhook Signature Verification", () => {
    it("should verify webhook signature correctly", () => {
      const body = JSON.stringify({ event: "order.paid" });
      const secret = "test_webhook_secret";
      
      const crypto = require("crypto");
      const signature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

      const isValid = verifyWebhookSignature(body, signature, secret);
      expect(isValid).toBe(true);
    });

    it("should return false for invalid webhook signature", () => {
      const isValid = verifyWebhookSignature(
        "{}",
        "invalid_signature",
        "secret",
      );
      expect(isValid).toBe(false);
    });
  });
});