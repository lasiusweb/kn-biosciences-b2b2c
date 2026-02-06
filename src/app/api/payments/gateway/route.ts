// API routes for Payment Gateway Management
import { NextRequest, NextResponse } from 'next/server';
import { paymentGatewayManager } from '@/lib/payments/gateway-manager';

// GET /api/payments/gateways - Get all payment gateways and their status
export async function GET(request: NextRequest) {
  try {
    const gateways = paymentGatewayManager.getAvailableGateways();
    
    return NextResponse.json({
      success: true,
      data: {
        gateways,
        count: gateways.length,
        configured: gateways.filter(gw => gw.isConfigured).length,
      },
    });
  } catch (error) {
    console.error('Error fetching payment gateways:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment gateways' },
      { status: 500 }
    );
  }
}

// POST /api/payments/gateways/test - Test all payment gateways
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gatewayIds } = body;

    if (!gatewayIds || !Array.isArray(gatewayIds) || gatewayIds.length === 0) {
      return NextResponse.json({
        error: 'Gateway IDs array is required',
      }, { status: 400 });
    }

    const results = await paymentGatewayManager.testAllGateways();
    
    return NextResponse.json({
      success: true,
      data: {
        tests: results,
        total: results.length,
        successful: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'error').length,
        warnings: results.filter(r => r.status === 'warning').length,
      },
    });
  } catch (error) {
    console.error('Error testing payment gateways:', error);
    return NextResponse.json(
      { error: 'Failed to test payment gateways' },
      { status: 500 }
    );
  }
}

// GET /api/payments/gateways/test/[gatewayId] - Test specific gateway
export async function GET(
  request: NextRequest,
  { params }: { params: { gatewayId: string } }
) {
  try {
    const { gatewayId } = params;
    let result;

    switch (gatewayId) {
      case 'razorpay':
        result = await paymentGatewayManager.testRazorpay();
        break;
      case 'payu':
        result = await paymentGatewayManager.testPayU();
        break;
      case 'easebuzz':
        result = await paymentGatewayManager.testEasebuzz();
        break;
      default:
        return NextResponse.json(
          { error: `Unknown gateway: ${gatewayId}` },
          { status: 404 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(`Error testing ${gatewayId}:`, error);
    return NextResponse.json(
      { error: `Failed to test ${gatewayId}` },
      { status: 500 }
    );
  }
}

// GET /api/payments/health - Payment gateway health check
export async function GET() {
  try {
    const health = await paymentGatewayManager.healthCheck();
    
    return NextResponse.json({
      success: true,
      data: health,
    });
  } catch (error) {
    console.error('Payment gateway health check failed:', error);
    return NextResponse.json(
      { error: 'Failed to check payment gateway health' },
      { status: 500 }
    );
  }
}

// GET /api/payments/config - Get current payment gateway configuration
export async function GET(request: NextRequest) {
  try {
    const gateways = paymentGatewayManager.getAvailableGateways();
    const config = {
      razorpay: paymentGatewayManager.getGatewayConfig('razorpay'),
      payu: paymentGatewayManager.getGatewayConfig('payu'),
      easebuzz: paymentGatewayManager.getGatewayConfig('easebuzz'),
    };

    // Mask sensitive information
    const maskedConfig = {
      razorpay: config.razorpay.isConfigured ? {
        keyId: config.razorpay.keyId ? `${config.razorpay.keyId.slice(0, 4)}...${config.razorpay.keyId.slice(-4)}` : null,
        keySecret: config.razorpay.isConfigured ? '***configured***' : null,
        isConfigured: config.razorpay.isConfigured,
      } : null,
      payu: config.payu.isConfigured ? {
        merchantKey: config.payu.merchantKey ? `${config.payu.merchantKey.slice(0, 4)}...${config.payu.merchantKey.slice(-4)}` : null,
        salt: config.payu.isConfigured ? `${config.payu.salt.slice(0, 3)}...${config.payu.salt.slice(-3)}` : null,
        isConfigured: config.payu.isConfigured,
      } : null,
      easebuzz: config.easebuzz.isConfigured ? {
        merchantKey: config.easebuzz.merchantKey ? `${config.easebuzz.merchantKey.slice(0, 4)}...${config.easebuzz.merchantKey.slice(-4)}` : null,
        salt: config.easebuzz.isConfigured ? `${config.easebuzz.salt.slice(0, 3)}...${config.easebuzz.salt.slice(-3)}` : null,
        isConfigured: config.easebuzz.isConfigured,
      } : null,
    };

    return NextResponse.json({
      success: true,
      data: {
        gateways,
        config: maskedConfig,
        environment: process.env.NODE_ENV || 'development',
      },
    });
  } catch (error) {
    console.error('Error fetching payment gateway config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment gateway configuration' },
      { status: 500 }
    );
  }
}

// POST /api/payments/config/update - Update payment gateway configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gatewayId, config } = body;

    if (!gatewayId || !config) {
      return NextResponse.json({
        error: 'Gateway ID and config are required',
      }, { status: 400 });
    }

    // In production, validate configuration before updating
    if (process.env.NODE_ENV === 'production') {
      // Validate required fields based on gateway type
      const validation = this.validateGatewayConfig(gatewayId, config);
      if (!validation.isValid) {
        return NextResponse.json({
          error: 'Invalid configuration',
          details: validation.errors,
        }, { status: 400 });
      }
    }

    // Store in environment variables (in a real implementation, this would update .env or database)
    console.log(`Payment gateway configuration updated for ${gatewayId}:`, config);

    return NextResponse.json({
      success: true,
      message: 'Configuration updated successfully',
      note: 'This is a demo implementation - in production, this would persist to secure storage',
    });
  } catch (error) {
    console.error('Error updating payment gateway config:', error);
    return NextResponse.json(
      { error: 'Failed to update payment gateway configuration' },
      { status: 500 }
    );
  }
}

/**
 * Validate payment gateway configuration
 */
function validateGatewayConfig(gatewayId: string, config: any) {
  const errors: string[] = [];

  switch (gatewayId) {
    case 'razorpay':
      if (!config.keyId || !config.keySecret) {
        errors.push('Razorpay requires keyId and keySecret');
      }
      break;
    case 'payu':
      if (!config.merchantKey || !config.salt) {
        errors.push('PayU requires merchantKey and salt');
      }
      break;
    case 'easebuzz':
      if (!config.merchantKey || !config.salt) {
        errors.push('Easebuzz requires merchantKey and salt');
      }
      break;
    default:
      errors.push(`Unknown gateway: ${gatewayId}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}