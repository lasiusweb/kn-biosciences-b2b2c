// Notifications API routes for KN Biosciences E-commerce Platform
import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    switch (type) {
      case 'order_confirmation':
        await emailService.sendOrderConfirmation({
          orderNumber: data.orderNumber,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          items: data.items,
          totalAmount: data.totalAmount,
          shippingAddress: data.shippingAddress,
          orderDate: data.orderDate,
        });
        console.log(`Order confirmation email sent to ${data.customerEmail} for order ${data.orderNumber}`);
        break;

      case 'password_reset':
        await emailService.sendPasswordReset({
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          resetLink: data.resetLink || `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=dummy`,
        });
        console.log(`Password reset email sent to ${data.customerEmail}`);
        break;

      case 'b2b_quote':
        await emailService.sendB2BQuoteNotification({
          quoteNumber: data.quoteNumber,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          companyName: data.companyName,
          totalAmount: data.totalAmount,
          status: data.status,
          validUntil: data.validUntil,
        });
        console.log(`B2B quote notification sent to ${data.customerEmail} for quote ${data.quoteNumber}`);
        break;

      case 'shipping_notification':
        await emailService.sendShippingNotification({
          orderNumber: data.orderNumber,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          trackingNumber: data.trackingNumber,
          carrier: data.carrier,
          estimatedDelivery: data.estimatedDelivery,
          status: data.status,
        });
        console.log(`Shipping notification sent to ${data.customerEmail} for order ${data.orderNumber}`);
        break;

      case 'welcome':
        await emailService.sendWelcomeEmail(data.customerName, data.customerEmail);
        console.log(`Welcome email sent to ${data.customerEmail}`);
        break;

      case 'contact_form':
        await emailService.sendContactNotification({
          name: data.name,
          email: data.email,
          phone: data.phone,
          subject: data.subject,
          message: data.message,
        });
        console.log(`Contact notification sent to admin for: ${data.subject}`);
        break;

      default:
        return NextResponse.json({
          success: false,
          message: `Unknown notification type: ${type}`,
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `${type} notification sent successfully`,
    });
  } catch (error: any) {
    console.error('Failed to send notification:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to send notification',
      error: error?.message || 'Unknown error occurred'
    }, { status: 500 });
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
  } catch (error: any) {
    console.error('Email service test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to test email service',
      error: error?.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}
