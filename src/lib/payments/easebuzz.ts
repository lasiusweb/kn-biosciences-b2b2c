// Payment Gateway Integration - Easebuzz
import crypto from "crypto";

export interface EasebuzzOrder {
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone?: string;
  surl: string; // Success URL
  furl: string; // Failure URL
  hash: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  udf6?: string;
  udf7?: string;
  udf8?: string;
  udf9?: string;
  udf10?: string;
}

export interface EasebuzzResponse {
  txnid: string;
  firstname: string;
  email: string;
  amount: string;
  status: string;
  unmappedstatus: string;
  key: string;
  productinfo: string;
  hash: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  udf6?: string;
  udf7?: string;
  udf8?: string;
  udf9?: string;
  udf10?: string;
}

class EasebuzzService {
  private merchantKey: string;
  private salt: string;
  private isTestMode: boolean;

  constructor() {
    this.merchantKey = process.env.EASEBUZZ_MERCHANT_KEY || "";
    this.salt = process.env.EASEBUZZ_SALT || "";
    this.isTestMode = process.env.EASEBUZZ_TEST_MODE === "true";
  }

  // Generate hash for Easebuzz initiation
  generateHash(
    txnid: string,
    amount: string,
    productinfo: string,
    firstname: string,
    email: string,
    udfs?: Record<string, string>,
  ): string {
    const hashString = `${this.merchantKey}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udfs?.udf1 || ""}|${udfs?.udf2 || ""}|${udfs?.udf3 || ""}|${udfs?.udf4 || ""}|${udfs?.udf5 || ""}|${udfs?.udf6 || ""}|${udfs?.udf7 || ""}|${udfs?.udf8 || ""}|${udfs?.udf9 || ""}|${udfs?.udf10 || ""}|${this.salt}`;

    return crypto.createHash("sha512").update(hashString).digest("hex");
  }

  // Verify Easebuzz response hash
  verifyResponseHash(response: EasebuzzResponse): boolean {
    const hashString = `${this.salt}|${response.status}|${response.firstname}|${response.email}|${response.udf10 || ""}|${response.udf9 || ""}|${response.udf8 || ""}|${response.udf7 || ""}|${response.udf6 || ""}|${response.udf5 || ""}|${response.udf4 || ""}|${response.udf3 || ""}|${response.udf2 || ""}|${response.udf1 || ""}|${response.productinfo}|${response.amount}|${response.txnid}|${response.key}`;

    const expectedHash = crypto
      .createHash("sha512")
      .update(hashString)
      .digest("hex");

    return response.hash === expectedHash;
  }

  // Get Easebuzz payment URL
  getPaymentUrl(): string {
    return this.isTestMode
      ? "https://testpay.easebuzz.in/payment/initiateLink"
      : "https://pay.easebuzz.in/payment/initiateLink";
  }
}

export const easebuzzService = new EasebuzzService();
export default easebuzzService;
