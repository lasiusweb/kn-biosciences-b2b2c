// Payment Gateway Integration - PayU
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export interface PayUOrder {
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
}

export interface PayUResponse {
  mihpayid: string;
  mode: string;
  status: string;
  unmappedstatus: string;
  key: string;
  txnid: string;
  amount: string;
  addedon: string;
  productinfo: string;
  firstname: string;
  lastname: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  email: string;
  phone: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  hash: string;
  field1?: string;
  field2?: string;
  field3?: string;
  field4?: string;
  field5?: string;
  field6?: string;
  field7?: string;
  field8?: string;
  field9?: string;
  PG_TYPE?: string;
  bank_ref_num?: string;
  bankcode?: string;
  name_on_card?: string;
  cardnum?: string;
  cardexp?: string;
  ipaddress?: string;
  requestid?: string;
  error_Message?: string;
  discount?: string;
  offer?: string;
  card_bin?: string;
  card_type?: string;
  offer_availed?: string;
}

class PayUService {
  private merchantKey: string;
  private salt: string;
  private isTestMode: boolean;

  constructor() {
    this.merchantKey = process.env.PAYU_MERCHANT_KEY || "";
    this.salt = process.env.PAYU_SALT || "";
    this.isTestMode = process.env.PAYU_TEST_MODE === "true";
  }

  // Generate hash for PayU
  generateHash(
    txnid: string,
    amount: string,
    productinfo: string,
    firstname: string,
    email: string,
    additionalFields?: Record<string, string>,
  ): string {
    const hashString = `${this.merchantKey}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${additionalFields?.udf1 || ""}|${additionalFields?.udf2 || ""}|${additionalFields?.udf3 || ""}|${additionalFields?.udf4 || ""}|${additionalFields?.udf5 || ""}|${this.salt}`;

    return crypto.createHash("sha512").update(hashString).digest("hex");
  }

  // Verify PayU response hash
  verifyResponseHash(response: PayUResponse): boolean {
    const hashString = `${this.salt}|${response.status}|||||||||||${response.email}|${response.firstname}|${response.productinfo}|${response.amount}|${response.txnid}|${response.key}`;

    const expectedHash = crypto
      .createHash("sha512")
      .update(hashString)
      .digest("hex");

    return response.hash === expectedHash;
  }

  // Create PayU order
  createOrder(orderData: {
    txnid: string;
    amount: number;
    productinfo: string;
    firstname: string;
    email: string;
    phone?: string;
    udf1?: string;
    udf2?: string;
    udf3?: string;
    udf4?: string;
    udf5?: string;
  }): PayUOrder {
    const amountStr = orderData.amount.toString();
    const hash = this.generateHash(
      orderData.txnid,
      amountStr,
      orderData.productinfo,
      orderData.firstname,
      orderData.email,
      {
        udf1: orderData.udf1 || "",
        udf2: orderData.udf2 || "",
        udf3: orderData.udf3 || "",
        udf4: orderData.udf4 || "",
        udf5: orderData.udf5 || "",
      },
    );

    return {
      key: this.merchantKey,
      txnid: orderData.txnid,
      amount: amountStr,
      productinfo: orderData.productinfo,
      firstname: orderData.firstname,
      email: orderData.email,
      phone: orderData.phone || "",
      surl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/payu/success`,
      furl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/payu/failure`,
      hash,
      udf1: orderData.udf1 || "",
      udf2: orderData.udf2 || "",
      udf3: orderData.udf3 || "",
      udf4: orderData.udf4 || "",
      udf5: orderData.udf5 || "",
    } as unknown as PayUOrder;
  }

  // Get PayU payment URL
  getPaymentUrl(): string {
    return this.isTestMode
      ? "https://test.payu.in/_payment"
      : "https://secure.payu.in/_payment";
  }

  // Process PayU response
  processResponse(response: PayUResponse): {
    success: boolean;
    data: PayUResponse;
  } {
    const isValidHash = this.verifyResponseHash(response);
    const isSuccess = response.status === "success";

    return {
      success: isValidHash && isSuccess,
      data: response,
    };
  }

  // Get payment status by transaction ID
  async getTransactionStatus(txnid: string): Promise<PayUResponse | null> {
    try {
      const command = "verify_payment";
      const hashString = `${this.merchantKey}|command=${command}|var1=${txnid}|${this.salt}`;
      const hash = crypto.createHash("sha512").update(hashString).digest("hex");

      const formData = new URLSearchParams();
      formData.append("key", this.merchantKey);
      formData.append("command", command);
      formData.append("var1", txnid);
      formData.append("hash", hash);

      const response = await fetch(
        this.isTestMode
          ? "https://test.payu.in/merchant/postservice.php?form=2"
          : "https://info.payu.in/merchant/postservice.php?form=2",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        },
      );

      const result = await response.json();
      return result.transaction_details?.[txnid] || null;
    } catch (error) {
      console.error("Error fetching transaction status:", error);
      return null;
    }
  }

  // Process refund
  async processRefund(txnid: string, amount?: number): Promise<any> {
    try {
      const command = "cancel_refund_transaction";
      const hashString = `${this.merchantKey}|command=${command}|var1=${txnid}|${amount ? `var2=${amount}` : ""}|${this.salt}`;
      const hash = crypto.createHash("sha512").update(hashString).digest("hex");

      const formData = new URLSearchParams();
      formData.append("key", this.merchantKey);
      formData.append("command", command);
      formData.append("var1", txnid);
      if (amount) {
        formData.append("var2", amount.toString());
      }
      formData.append("hash", hash);

      const response = await fetch(
        this.isTestMode
          ? "https://test.payu.in/merchant/postservice.php?form=2"
          : "https://info.payu.in/merchant/postservice.php?form=2",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        },
      );

      return await response.json();
    } catch (error) {
      console.error("Error processing refund:", error);
      throw new Error("Failed to process refund");
    }
  }
}

export const payuService = new PayUService();
export default PayUService;
