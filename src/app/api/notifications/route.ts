// Notifications API routes for KN Biosciences E-commerce Platform

// Order confirmation notification
import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNumber, customerName, customerEmail, items, totalAmount, shippingAddress, orderDate } = body;

    await emailService.sendOrderConfirmation({
      orderNumber,
      customerName,
      customerEmail,
      items,
      totalAmount,
      shippingAddress,
      orderDate,
    });

    console.log(`Order confirmation email sent to ${customerEmail} for order ${orderNumber}`);

    return NextResponse.json({
      success: true,
      message: 'Order confirmation email sent successfully',
    });
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to send order confirmation email',
      error: error?.message || 'Unknown error occurred'
    }, { status: 500 }
    };
  }
}

// Password reset notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerEmail } = body;

    await emailService.sendPasswordReset({
      customerName,
      customerEmail,
    });

    console.log(`Password reset email sent to ${customerEmail}`);

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent successfully',
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to send password reset email',
      error: error?.message || 'Unknown error occurred'
    }, { status: 500 }
    };
  }
}

// B2B quote notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quoteNumber, customerName, customerEmail, companyName, totalAmount, status, validUntil } = body;

    await emailService.sendB2BQuoteNotification({
      quoteNumber,
      customerName,
      customerEmail,
      companyName,
      totalAmount,
      status,
      validUntil,
    });

    console.log(`B2B quote notification sent to ${customerEmail} for quote ${quoteNumber}`);

    return NextResponse.json({
      success: true,
      message: 'B2B quote notification sent successfully',
    });
  } catch (error) {
    console.error('Failed to send B2B quote notification:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to send B2B quote notification',
      error: error?.message || 'Unknown error occurred'
    }, { status: 500 }
    };
  }
}

// Shipping notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNumber, customerName, customerEmail, trackingNumber, carrier, estimatedDelivery, status } = body;

    await emailService.sendShippingNotification({
      orderNumber,
      customerName,
      customerEmail,
      trackingNumber,
      carrier,
      estimatedDelivery,
      status,
    });

    console.log(`Shipping notification sent to ${customerEmail} for order ${orderNumber}`);

    return NextResponse.json({
      success: true,
      message: 'Shipping notification sent successfully',
    });
  } catch (error) {
    console.error('Failed to send shipping notification:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to send shipping notification',
      error: error?.message || 'Unknown error occurred'
    }, { status: 500 }
    };
  }
}

// Welcome email for new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerEmail } = body;

    await emailService.sendWelcomeEmail(customerName, customerEmail);

    console.log(`Welcome email sent to ${customerEmail}`);

    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully',
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to send welcome email',
      error: error?.message || 'Unknown error occurred'
    }, { status: 500 }
    };
  }
}

// Contact form notification to admin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    await emailService.sendContactNotification({
      name,
      email,
      phone,
      subject,
      message,
    });

    console.log(`Contact notification sent to admin for: ${subject}`);

    return NextResponse.json({
      success: true,
      message: 'Contact notification sent to admin successfully',
    });
  } catch (error) {
    console.error('Failed to send contact notification:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to send contact notification',
      error: error?.message || 'Unknown error occurred'
    }, { status: 500 }
    };
  }
}

// Test email service connection
export async function GET(request: NextRequest) {
  try {
    const success = await emailService.testConnection();
    
    return NextResponse.json({
      success: true,
      message: 'Email service is working properly',
      connectionTest: success,
    });
  } catch (error) {
    console.error('Email service test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to test email service',
      error: error?.message || 'Unknown error occurred'
    }, { status: 500 }
    };
  }
}