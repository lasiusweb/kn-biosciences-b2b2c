describe("Easebuzz Service", () => {
  const mockMerchantKey = "TEST_KEY";
  const mockSalt = "TEST_SALT";
  let easebuzzService: any;

  beforeAll(() => {
    jest.resetModules();
    process.env.EASEBUZZ_MERCHANT_KEY = mockMerchantKey;
    process.env.EASEBUZZ_SALT = mockSalt;
    easebuzzService = require("../easebuzz").easebuzzService;
  });

  describe("generateHash", () => {
    it("should generate a valid SHA-512 hash for initiation", () => {
      const txnid = "TXN123";
      const amount = "100.00";
      const productinfo = "Test Product";
      const firstname = "John";
      const email = "john@example.com";
      const udfs = { udf1: "val1" };

      const hash = easebuzzService.generateHash(txnid, amount, productinfo, firstname, email, udfs);
      
      expect(hash).toBeDefined();
      expect(hash.length).toBe(128); // SHA-512 hex length
    });
  });

  describe("verifyResponseHash", () => {
    it("should return true for a valid response hash", () => {
      const response: any = {
        key: mockMerchantKey,
        txnid: "TXN123",
        amount: "100.00",
        productinfo: "Test Product",
        firstname: "John",
        email: "john@example.com",
        status: "success",
        udf1: "val1",
        hash: "" 
      };

      const hashString = `${mockSalt}|success|John|john@example.com||||||||||val1|Test Product|100.00|TXN123|${mockMerchantKey}`;
      const crypto = require("crypto");
      const expectedHash = crypto.createHash("sha512").update(hashString).digest("hex");
      
      response.hash = expectedHash;

      const isValid = easebuzzService.verifyResponseHash(response);
      expect(isValid).toBe(true);
    });

    it("should return false for an invalid response hash", () => {
      const response: any = {
        key: mockMerchantKey,
        txnid: "TXN123",
        amount: "100.00",
        productinfo: "Test Product",
        firstname: "John",
        email: "john@example.com",
        status: "success",
        hash: "wrong_hash"
      };

      const isValid = easebuzzService.verifyResponseHash(response);
      expect(isValid).toBe(false);
    });
  });

  describe("getPaymentUrl", () => {
    it("should return the test URL when in test mode", () => {
      process.env.EASEBUZZ_TEST_MODE = "true";
      jest.resetModules();
      const service = require("../easebuzz").easebuzzService;
      expect(service.getPaymentUrl()).toBe("https://testpay.easebuzz.in/payment/initiateLink");
    });

    it("should return the production URL when not in test mode", () => {
      process.env.EASEBUZZ_TEST_MODE = "false";
      jest.resetModules();
      const service = require("../easebuzz").easebuzzService;
      expect(service.getPaymentUrl()).toBe("https://pay.easebuzz.in/payment/initiateLink");
    });
  });
});