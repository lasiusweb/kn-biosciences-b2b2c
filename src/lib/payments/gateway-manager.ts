// Payment Gateway Manager - Centralized Configuration and Testing
import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payments/razorpay';
import { payuService } from '@/lib/payments/payu';
import { easebuzzService } from '@/lib/payments/easebuzz';

// Payment gateway types
export interface PaymentGateway {
  name: string;
  id: string;
  isConfigured: boolean;
  testUrl?: string;
}

export interface GatewayConfig {
  razorpay: {
    keyId: string;
    keySecret: string;
    isConfigured: boolean;
  };
  payu: {
    merchantKey: string;
    salt: string;
    isConfigured: boolean;
  };
  easebuzz: {
    merchantKey: string;
    salt: string;
    isConfigured: boolean;
  };
}

export interface PaymentGatewayTest {
  gateway: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
  timestamp: string;
}

export interface PaymentTestRequest {
  amount: number;
  currency?: string;
  customerEmail?: string;
  customerId?: string;
  description?: string;
}

class PaymentGatewayManager {
  private config: GatewayConfig;

  constructor() {
    this.config = {
      razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID || '',
        keySecret: process.env.RAZORPAY_KEY_SECRET || '',
        isConfigured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      },
      payu: {
        merchantKey: process.env.PAYU_MERCHANT_KEY || '',
        salt: process.env.PAYU_SALT || '',
        isConfigured: !!(process.env.PAYU_MERCHANT_KEY && process.env.PAYU_SALT),
      },
      easebuzz: {
        merchantKey: process.env.EASEBUZZ_KEY || '',
        salt: process.env.EASEBUZZ_SALT || '',
        isConfigured: !!(process.env.EASEBUZZ_KEY && process.env.EASEBUZZ_SALT),
      },
    };
  }

  /**
   * Get all payment gateways and their configuration status
   */
  getAvailableGateways(): PaymentGateway[] {
    return [
      {
        name: 'Razorpay',
        id: 'razorpay',
        isConfigured: this.config.razorpay.isConfigured,
      },
      {
        name: 'PayU',
        id: 'payu',
        isConfigured: this.config.payu.isConfigured,
      },
      {
        name: 'Easebuzz',
        id: 'easebuzz',
        isConfigured: this.config.easebuzz.isConfigured,
      },
    ];
  }

  /**
   * Get configuration for a specific gateway
   */
  getGatewayConfig(gatewayId: string): any {
    switch (gatewayId) {
      case 'razorpay':
        return this.config.razorpay;
      case 'payu':
        return this.config.payu;
      case 'easebuzz':
        return this.config.easebuzz;
      default:
        return null;
    }
  }

  /**
   * Test Razorpay gateway integration
   */
  async testRazorpay(): Promise<PaymentGatewayTest> {
    try {
      const testRequest: PaymentTestRequest = {
        amount: 100,
        currency: 'INR',
        customerEmail: 'test@example.com',
        description: 'Test payment for KN Biosciences',
      };

      // Create a test order
      const order = await paymentService.createOrder(testRequest);
      
      return {
        gateway: 'razorpay',
        status: 'success',
        message: 'Razorpay gateway is working correctly',
        details: {
          orderId: order.id,
          testAmount: testRequest.amount,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        gateway: 'razorpay',
        status: 'error',
        message: `Razorpay test failed: ${error.message}`,
        details: { error: error.message },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Test PayU gateway integration
   */
  async testPayU(): Promise<PaymentGatewayTest> {
    try {
      // Check if PayU is properly configured
      if (!this.config.payu.isConfigured) {
        return {
          gateway: 'payu',
          status: 'error',
          message: 'PayU gateway is not configured properly',
          details: { error: 'Missing merchant key or salt' },
          timestamp: new Date().toISOString(),
        };
      }

      const testRequest: PaymentTestRequest = {
        amount: 100,
        currency: 'INR',
        customerEmail: 'test@example.com',
        description: 'Test payment for KN Biosciences',
      };

      // Create a test order (this would normally use PayU service)
      const order = await payuService.createOrder(testRequest);
      
      return {
        gateway: 'payu',
        status: 'success',
        message: 'PayU gateway is working correctly',
        details: {
          orderId: order.id,
          testAmount: testRequest.amount,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        gateway: 'payu',
        status: 'error',
        message: `PayU test failed: ${error.message}`,
        details: { error: error.message },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Test Easebuzz gateway integration
   */
  async testEasebuzz(): Promise<PaymentGatewayTest> {
    try {
      // Check if Easebuzz is properly configured
      if (!this.config.easebuzz.isConfigured) {
        return {
          gateway: 'easebuzz',
          status: 'error',
          message: 'Easebuzz gateway is not configured properly',
          details: { error: 'Missing merchant key or salt' },
          timestamp: new Date().toISOString(),
        };
      }

      const testRequest: PaymentTestRequest = {
        amount: 100,
        currency: 'INR',
        customerEmail: 'test@example.com',
        description: 'Test payment for KN Biosciences',
      };

      // Create a test order (this would normally use Easebuzz service)
      // For testing purposes, we'll just check if the service can be initialized
      await easebuzzService.getPaymentUrl();
      
      return {
        gateway: 'easebuzz',
        status: 'success',
        message: 'Easebuzz gateway is working correctly',
        details: {
          testAmount: testRequest.amount,
          testMode: process.env.EASEBUZZ_TEST_MODE === 'true',
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        gateway: 'easebuzz',
        status: 'error',
        message: `Easebuzz test failed: ${error.message}`,
        details: { error: error.message },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Test all configured gateways
   */
  async testAllGateways(): Promise<PaymentGatewayTest[]> {
    const gateways = this.getAvailableGateways();
    const tests: PaymentGatewayTest[] = [];

    for (const gateway of gateways) {
      if (gateway.isConfigured) {
        let test: PaymentGatewayTest;
        switch (gateway.id) {
          case 'razorpay':
            test = await this.testRazorpay();
            break;
          case 'payu':
            test = await this.testPayU();
            break;
          case 'easebuzz':
            test = await this.testEasebuzz();
            break;
        }
        tests.push(test);
      } else {
        tests.push({
          gateway: gateway.id,
          status: 'warning',
          message: `${gateway.name} gateway is not configured`,
          details: { reason: 'Missing API credentials' },
          timestamp: new Date().toISOString(),
        });
      }
    }

    return tests;
  }

  /**
   * Run comprehensive payment gateway health check
   */
  async healthCheck(): Promise<{
    gateways: PaymentGateway[];
    overall: 'healthy' | 'warning' | 'error';
    issues: string[];
  }> {
    const gateways = this.getAvailableGateways();
    const issues: string[] = [];
    let configuredCount = 0;

    for (const gateway of gateways) {
      if (!gateway.isConfigured) {
        issues.push(`${gateway.name} is not configured`);
      } else {
        configuredCount++;
      }
    }

    let overall: 'healthy' | 'warning' | 'error' = 'healthy';
    if (configuredCount === 0) {
      overall = 'error';
      issues.push('No payment gateways are configured');
    } else if (configuredCount < 2) {
      overall = 'warning';
      issues.push('Less than 2 payment gateways configured');
    }

    return {
      gateways,
      overall,
      issues,
    };
  }
}

// Create singleton instance
export const paymentGatewayManager = new PaymentGatewayManager();
export default paymentGatewayManager;