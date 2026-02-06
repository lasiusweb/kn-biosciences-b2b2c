import nodemailer from 'nodemailer';

// Email service configuration
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email template types
interface EmailTemplate {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

// Order confirmation email template
interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  shippingAddress: any;
  orderDate: string;
}

// Password reset email template
interface PasswordResetData {
  customerName: string;
  customerEmail: string;
  resetLink: string;
}

// B2B Quote notification template
interface B2BQuoteData {
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  companyName: string;
  totalAmount: number;
  validUntil: string;
  status: string;
}

// Shipping notification template
interface ShippingNotificationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  status: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private config: EmailConfig;

  constructor() {
    // Initialize email configuration from environment variables
    this.config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    // Create transporter
    this.transporter = nodemailer.createTransporter({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: this.config.auth,
    });
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(data: OrderConfirmationData): Promise<boolean> {
    try {
      const emailTemplate = this.generateOrderConfirmationTemplate(data);
      await this.transporter.sendMail(emailTemplate);
      console.log(`Order confirmation email sent to ${data.customerEmail}`);
      return true;
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(data: PasswordResetData): Promise<boolean> {
    try {
      const emailTemplate = this.generatePasswordResetTemplate(data);
      await this.transporter.sendMail(emailTemplate);
      console.log(`Password reset email sent to ${data.customerEmail}`);
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }

  /**
   * Send B2B quote notification
   */
  async sendB2BQuoteNotification(data: B2BQuoteData): Promise<boolean> {
    try {
      const emailTemplate = this.generateB2BQuoteTemplate(data);
      await this.transporter.sendMail(emailTemplate);
      console.log(`B2B quote notification sent to ${data.customerEmail}`);
      return true;
    } catch (error) {
      console.error('Failed to send B2B quote notification:', error);
      return false;
    }
  }

  /**
   * Send shipping notification
   */
  async sendShippingNotification(data: ShippingNotificationData): Promise<boolean> {
    try {
      const emailTemplate = this.generateShippingNotificationTemplate(data);
      await this.transporter.sendMail(emailTemplate);
      console.log(`Shipping notification sent to ${data.customerEmail}`);
      return true;
    } catch (error) {
      console.error('Failed to send shipping notification:', error);
      return false;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(customerName: string, customerEmail: string): Promise<boolean> {
    try {
      const emailTemplate = this.generateWelcomeTemplate(customerName, customerEmail);
      await this.transporter.sendMail(emailTemplate);
      console.log(`Welcome email sent to ${customerEmail}`);
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }

  /**
   * Send contact form notification to admin
   */
  async sendContactNotification(data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }): Promise<boolean> {
    try {
      const emailTemplate = this.generateContactNotificationTemplate(data);
      await this.transporter.sendMail(emailTemplate);
      console.log(`Contact notification sent to admin`);
      return true;
    } catch (error) {
      console.error('Failed to send contact notification:', error);
      return false;
    }
  }

  /**
   * Generate order confirmation email template
   */
  private generateOrderConfirmationTemplate(data: OrderConfirmationData): EmailTemplate {
    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.productName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price.toFixed(2)}</td>
      </tr>
    `).join('');

    return {
      to: data.customerEmail,
      subject: `Order Confirmation - ${data.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #8BC34A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">KN Biosciences</h1>
              <p style="margin: 5px 0 0 0; font-size: 16px;">Order Confirmation</p>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
              <h2 style="color: #333; margin-top: 0;">Thank You for Your Order!</h2>
              <p>Dear ${data.customerName},</p>
              <p>We're pleased to confirm your order. Here are the details:</p>
              
              <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Order Number:</strong> ${data.orderNumber}</p>
                <p><strong>Order Date:</strong> ${data.orderDate}</p>
                <p><strong>Total Amount:</strong> ₹${data.totalAmount.toFixed(2)}</p>
              </div>
              
              <h3 style="color: #333;">Order Items:</h3>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                  <tr style="background: #8BC34A; color: white;">
                    <th style="padding: 10px; text-align: left;">Product</th>
                    <th style="padding: 10px; text-align: center;">Quantity</th>
                    <th style="padding: 10px; text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              
              <h3 style="color: #333;">Shipping Address:</h3>
              <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p>${data.shippingAddress.address_line1}</p>
                ${data.shippingAddress.address_line2 ? `<p>${data.shippingAddress.address_line2}</p>` : ''}
                <p>${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postal_code}</p>
                <p>${data.shippingAddress.country}</p>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                  If you have any questions about your order, please don't hesitate to contact us at 
                  <a href="mailto:support@knbiosciences.com" style="color: #8BC34A;">support@knbiosciences.com</a> 
                  or call us at +91-80-1234-5678.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Order Confirmation - ${data.orderNumber}
        
        Thank you for your order, ${data.customerName}!
        
        Order Number: ${data.orderNumber}
        Order Date: ${data.orderDate}
        Total Amount: ₹${data.totalAmount.toFixed(2)}
        
        Order Items:
        ${data.items.map(item => `- ${item.productName} (Qty: ${item.quantity}) - ₹${item.price.toFixed(2)}`).join('\n')}
        
        Shipping Address:
        ${data.shippingAddress.address_line1}
        ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postal_code}
        ${data.shippingAddress.country}
        
        For any questions, contact us at support@knbiosciences.com or call +91-80-1234-5678.
      `,
    };
  }

  /**
   * Generate password reset email template
   */
  private generatePasswordResetTemplate(data: PasswordResetData): EmailTemplate {
    return {
      to: data.customerEmail,
      subject: 'Password Reset Request - KN Biosciences',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #8BC34A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">KN Biosciences</h1>
              <p style="margin: 5px 0 0 0; font-size: 16px;">Password Reset</p>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
              <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
              <p>Hi ${data.customerName},</p>
              <p>We received a request to reset your password for your KN Biosciences account.</p>
              
              <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
                <p style="margin: 0;">Click the button below to reset your password:</p>
                <a href="${data.resetLink}" style="display: inline-block; background: #8BC34A; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 15px;">
                  Reset Password
                </a>
                <p style="margin: 15px 0 0 0; font-size: 12px; color: #666;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <a href="${data.resetLink}" style="color: #8BC34A;">${data.resetLink}</a>
                </p>
              </div>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;">
                  <strong>Security Notice:</strong> This link will expire in 24 hours. If you didn't request this password reset, please ignore this email.
                </p>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                  If you have any questions, please contact us at 
                  <a href="mailto:support@knbiosciences.com" style="color: #8BC34A;">support@knbiosciences.com</a>
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request - KN Biosciences
        
        Hi ${data.customerName},
        
        We received a request to reset your password for your KN Biosciences account.
        
        Click this link to reset your password: ${data.resetLink}
        
        This link will expire in 24 hours. If you didn't request this password reset, please ignore this email.
        
        For any questions, contact us at support@knbiosciences.com.
      `,
    };
  }

  /**
   * Generate B2B quote notification template
   */
  private generateB2BQuoteTemplate(data: B2BQuoteData): EmailTemplate {
    const statusColor = data.status === 'approved' ? '#28a745' : data.status === 'rejected' ? '#dc3545' : '#ffc107';
    const statusText = data.status.charAt(0).toUpperCase() + data.status.slice(1);

    return {
      to: data.customerEmail,
      subject: `B2B Quote ${statusText} - ${data.quoteNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>B2B Quote ${statusText}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #8BC34A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">KN Biosciences</h1>
              <p style="margin: 5px 0 0 0; font-size: 16px;">B2B Quote ${statusText}</p>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
              <h2 style="color: #333; margin-top: 0;">Your B2B Quote Has Been ${statusText}</h2>
              <p>Dear ${data.customerName},</p>
              
              <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${statusColor};">
                <p style="margin: 0;"><strong>Quote Number:</strong> ${data.quoteNumber}</p>
                <p style="margin: 5px 0;"><strong>Company:</strong> ${data.companyName}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>
                <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${data.totalAmount.toFixed(2)}</p>
                <p style="margin: 5px 0;"><strong>Valid Until:</strong> ${data.validUntil}</p>
              </div>
              
              ${data.status === 'approved' ? `
                <p>Congratulations! Your B2B quote has been approved. You can now proceed with placing your order.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_BASE_URL}/b2b/quotes/${data.quoteNumber}" style="display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    View Quote Details
                  </a>
                </div>
              ` : data.status === 'rejected' ? `
                <p>We regret to inform you that your B2B quote has been rejected. Our team will contact you shortly to discuss alternative options.</p>
              ` : `
                <p>Your B2B quote is currently under review. Our team will evaluate your requirements and get back to you soon.</p>
              `}
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                  For any questions about your quote, please contact our B2B team at 
                  <a href="mailto:b2b@knbiosciences.com" style="color: #8BC34A;">b2b@knbiosciences.com</a> 
                  or call us at +91-80-1234-5679.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        B2B Quote ${statusText} - ${data.quoteNumber}
        
        Dear ${data.customerName},
        
        Your B2B quote has been ${statusText}.
        
        Quote Number: ${data.quoteNumber}
        Company: ${data.companyName}
        Status: ${statusText}
        Total Amount: ₹${data.totalAmount.toFixed(2)}
        Valid Until: ${data.validUntil}
        
        For any questions about your quote, contact our B2B team at b2b@knbiosciences.com or call +91-80-1234-5679.
      `,
    };
  }

  /**
   * Generate shipping notification template
   */
  private generateShippingNotificationTemplate(data: ShippingNotificationData): EmailTemplate {
    const statusMessages = {
      'shipped': 'Your order has been shipped!',
      'in_transit': 'Your order is in transit!',
      'out_for_delivery': 'Your order is out for delivery!',
      'delivered': 'Your order has been delivered!',
    };

    return {
      to: data.customerEmail,
      subject: `Shipping Update - ${data.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Shipping Update</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #8BC34A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">KN Biosciences</h1>
              <p style="margin: 5px 0 0 0; font-size: 16px;">Shipping Update</p>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
              <h2 style="color: #333; margin-top: 0;">${statusMessages[data.status] || 'Shipping Update'}</h2>
              <p>Dear ${data.customerName},</p>
              
              <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Order Number:</strong> ${data.orderNumber}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> ${data.status}</p>
                ${data.trackingNumber ? `<p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${data.trackingNumber}</p>` : ''}
                ${data.carrier ? `<p style="margin: 5px 0;"><strong>Carrier:</strong> ${data.carrier}</p>` : ''}
                ${data.estimatedDelivery ? `<p style="margin: 5px 0;"><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>` : ''}
              </div>
              
              ${data.trackingNumber ? `
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://www.google.com/search?q=${data.trackingNumber}" style="display: inline-block; background: #8BC34A; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Track Package
                  </a>
                </div>
              ` : ''}
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                  For any questions about your shipment, please contact us at 
                  <a href="mailto:support@knbiosciences.com" style="color: #8BC34A;">support@knbiosciences.com</a> 
                  or call us at +91-80-1234-5678.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Shipping Update - ${data.orderNumber}
        
        Dear ${data.customerName},
        
        ${statusMessages[data.status] || 'Shipping Update'}
        
        Order Number: ${data.orderNumber}
        Status: ${data.status}
        ${data.trackingNumber ? `Tracking Number: ${data.trackingNumber}` : ''}
        ${data.carrier ? `Carrier: ${data.carrier}` : ''}
        ${data.estimatedDelivery ? `Estimated Delivery: ${data.estimatedDelivery}` : ''}
        
        For any questions about your shipment, contact us at support@knbiosciences.com or call +91-80-1234-5678.
      `,
    };
  }

  /**
   * Generate welcome email template
   */
  private generateWelcomeTemplate(customerName: string, customerEmail: string): EmailTemplate {
    return {
      to: customerEmail,
      subject: 'Welcome to KN Biosciences!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to KN Biosciences</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #8BC34A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">KN Biosciences</h1>
              <p style="margin: 5px 0 0 0; font-size: 16px;">Welcome to Our Community!</p>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
              <h2 style="color: #333; margin-top: 0;">Welcome, ${customerName}!</h2>
              <p>Thank you for joining KN Biosciences! We're excited to have you as part of our community.</p>
              
              <p>At KN Biosciences, we're committed to providing sustainable agricultural solutions that help farmers and businesses thrive. Whether you're looking for organic farming products, aquaculture solutions, or innovative bioremediation technologies, we have something for you.</p>
              
              <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #333;">What's Next?</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>Browse our extensive product catalog</li>
                  <li>Create your personalized wishlist</li>
                  <li>Get expert advice from our team</li>
                  <li>Enjoy exclusive member benefits</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/shop" style="display: inline-block; background: #8BC34A; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Start Shopping
                </a>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                  If you have any questions or need assistance, please don't hesitate to contact us at 
                  <a href="mailto:support@knbiosciences.com" style="color: #8BC34A;">support@knbiosciences.com</a> 
                  or call us at +91-80-1234-5678.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to KN Biosciences!
        
        Dear ${customerName},
        
        Thank you for joining KN Biosciences! We're excited to have you as part of our community.
        
        At KN Biosciences, we're committed to providing sustainable agricultural solutions that help farmers and businesses thrive.
        
        What's Next?
        - Browse our extensive product catalog
        - Create your personalized wishlist
        - Get expert advice from our team
        - Enjoy exclusive member benefits
        
        Start shopping at ${process.env.NEXT_PUBLIC_BASE_URL}/shop
        
        For any questions or assistance, contact us at support@knbiosciences.com or call +91-80-1234-5678.
      `,
    };
  }

  /**
   * Generate contact notification template
   */
  private generateContactNotificationTemplate(data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }): EmailTemplate {
    return {
      to: process.env.ADMIN_EMAIL || 'admin@knbiosciences.com',
      subject: `New Contact Form Submission: ${data.subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #8BC34A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">KN Biosciences</h1>
              <p style="margin: 5px 0 0 0; font-size: 16px;">New Contact Form Submission</p>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
              <h2 style="color: #333; margin-top: 0;">New Contact Form Submission</h2>
              
              <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Name:</strong> ${data.name}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${data.email}</p>
                ${data.phone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${data.phone}</p>` : ''}
                <p style="margin: 5px 0;"><strong>Subject:</strong> ${data.subject}</p>
              </div>
              
              <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #333;">Message:</h3>
                <p style="margin: 0; white-space: pre-wrap;">${data.message}</p>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                  This message was sent from the contact form on the KN Biosciences website.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        New Contact Form Submission
        
        Name: ${data.name}
        Email: ${data.email}
        ${data.phone ? `Phone: ${data.phone}` : ''}
        Subject: ${data.subject}
        
        Message:
        ${data.message}
        
        This message was sent from the contact form on the KN Biosciences website.
      `,
    };
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email service connection test successful');
      return true;
    } catch (error) {
      console.error('Email service connection test failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const emailService = new EmailService();

export default emailService;