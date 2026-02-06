# Payment Gateway Setup Guide

This guide provides step-by-step instructions for configuring payment gateways for the KN Biosciences e-commerce platform.

## Supported Payment Gateways

The platform supports the following payment gateways:

1. **Razorpay** - Recommended for Indian market
2. **PayU** - Alternative option for Indian market  
3. **Easebuzz** - Another Indian payment gateway option

## Quick Setup

### 1. Environment Configuration

Copy the `.env.example` file to `.env.local` and fill in your payment gateway credentials:

```bash
cp .env.example .env.local
```

### 2. Razorpay Setup (Recommended)

#### Step 1: Create Razorpay Account
1. Visit [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up or log in to your account
3. Navigate to Settings → API Keys

#### Step 2: Get API Keys
1. Copy the **Key ID** and **Key Secret**
2. Add them to your `.env.local`:

```env
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

#### Step 3: Test Configuration
```bash
# Test Razorpay gateway
curl -X GET http://localhost:3000/api/payments/gateways/test/razorpay
```

### 3. PayU Setup

#### Step 1: Create PayU Account
1. Visit [PayU Business](https://www.payu.in/)
2. Register for a business account
3. Complete KYC verification

#### Step 2: Get Merchant Credentials
1. Log in to PayU Dashboard
2. Navigate to Settings → Merchant Key
3. Copy your **Merchant Key** and **Salt**

#### Step 3: Configure Environment
```env
PAYU_MERCHANT_KEY=XXXXXXXXXXXXXXXX
PAYU_SALT=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
PAYU_TEST_MODE=true  # Set to false for production
```

#### Step 4: Test Configuration
```bash
# Test PayU gateway
curl -X GET http://localhost:3000/api/payments/gateways/test/payu
```

### 4. Easebuzz Setup

#### Step 1: Create Easebuzz Account
1. Visit [Easebuzz](https://easebuzz.in/)
2. Register for a merchant account
3. Complete verification process

#### Step 2: Get Merchant Credentials
1. Log in to Easebuzz Dashboard
2. Navigate to Settings → API Keys
3. Copy your **Merchant Key** and **Salt**

#### Step 3: Configure Environment
```env
EASEBUZZ_KEY=XXXXXXXXXXXXXXXX
EASEBUZZ_SALT=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EASEBUZZ_TEST_MODE=true  # Set to false for production
```

#### Step 4: Test Configuration
```bash
# Test Easebuzz gateway
curl -X GET http://localhost:3000/api/payments/gateways/test/easebuzz
```

## Advanced Configuration

### Webhook Setup

Each payment gateway requires webhook configuration for real-time payment status updates:

#### Razorpay Webhooks
1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/payments/webhook/razorpay`
3. Select events: `payment.captured`, `payment.failed`, `refund.processed`

#### PayU Webhooks
1. Go to PayU Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/payments/webhook/payu`
3. Configure response handling

#### Easebuzz Webhooks
1. Go to Easebuzz Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/payments/webhook/easebuzz`
3. Configure callback URLs

### Payment Method Configuration

Configure which payment methods to accept:

```typescript
// In your payment configuration
const paymentMethods = {
  razorpay: {
    enabled: true,
    methods: ['card', 'upi', 'netbanking', 'wallet'],
  },
  payu: {
    enabled: true,
    methods: ['card', 'netbanking', 'upi'],
  },
  easebuzz: {
    enabled: false, // Enable when configured
    methods: ['card', 'upi', 'netbanking'],
  },
};
```

## Testing Your Setup

### 1. Gateway Health Check
```bash
curl -X GET http://localhost:3000/api/payments/health
```

### 2. Individual Gateway Tests
```bash
# Test all gateways
curl -X POST http://localhost:3000/api/payments/gateways/test \
  -H "Content-Type: application/json" \
  -d '{"gatewayIds": ["razorpay", "payu", "easebuzz"]}'
```

### 3. Frontend Testing
1. Navigate to Admin Dashboard → Payment Gateway Manager
2. Test each configured gateway
3. Verify webhook endpoints are accessible

### 4. End-to-End Testing
1. Add a product to cart
2. Proceed to checkout
3. Select payment method
4. Complete test payment (use test amounts: ₹1, ₹2, ₹5)

## Production Deployment

### 1. Environment Variables
Update your production environment variables:

```env
# Production Razorpay
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Production PayU
PAYU_MERCHANT_KEY=XXXXXXXXXXXXXXXX
PAYU_SALT=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
PAYU_TEST_MODE=false

# Production Easebuzz
EASEBUZZ_KEY=XXXXXXXXXXXXXXXX
EASEBUZZ_SALT=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EASEBUZZ_TEST_MODE=false
```

### 2. Security Considerations
- Never commit API keys to version control
- Use environment-specific configurations
- Implement IP whitelisting for webhooks
- Enable SSL for all webhook endpoints
- Monitor payment gateway logs regularly

### 3. Rate Limiting
Configure rate limiting for payment endpoints:

```typescript
// Example rate limiting configuration
const rateLimits = {
  '/api/payments/checkout': '10 per minute',
  '/api/payments/webhook': '100 per minute',
};
```

## Troubleshooting

### Common Issues

#### 1. Gateway Not Configured
**Error**: "Payment gateway is not configured properly"
**Solution**: Verify API keys are correctly set in environment variables

#### 2. Webhook Verification Failed
**Error**: "Webhook signature verification failed"
**Solution**: Check webhook secret configuration and URL accessibility

#### 3. Test Mode Issues
**Error**: "Payment failed in test mode"
**Solution**: Ensure test credentials are being used, not production keys

#### 4. CORS Issues
**Error**: "CORS policy error"
**Solution**: Add your domain to payment gateway's allowed origins

### Debug Mode

Enable debug logging for payment gateways:

```env
DEBUG=payments:*
NODE_ENV=development
```

### Support Contacts

- **Razorpay**: support@razorpay.com | +91-22-6130-7777
- **PayU**: support@payu.in | +91-120-6170-333
- **Easebuzz**: support@easebuzz.in | +91-22-6130-7777

## Best Practices

1. **Multiple Gateways**: Configure at least 2 payment gateways for redundancy
2. **Test Regularly**: Schedule weekly payment gateway tests
3. **Monitor Webhooks**: Set up alerts for webhook failures
4. **Keep Updated**: Regularly update payment gateway SDKs
5. **Backup Plans**: Have manual payment processing as backup

## Integration Examples

### Razorpay Integration
```javascript
import { paymentService } from '@/lib/payments/razorpay';

// Create order
const order = await paymentService.createOrder({
  amount: 1000,
  currency: 'INR',
  receipt: 'order_123',
});
```

### PayU Integration
```javascript
import { payuService } from '@/lib/payments/payu';

// Create order
const order = payuService.createOrder({
  txnid: 'txn_123',
  amount: 1000,
  productinfo: 'KN Biosciences Order',
  firstname: 'John',
  email: 'john@example.com',
});
```

### Easebuzz Integration
```javascript
import { easebuzzService } from '@/lib/payments/easebuzz';

// Generate hash
const hash = easebuzzService.generateHash(
  'txn_123',
  '1000',
  'KN Biosciences Order',
  'John',
  'john@example.com'
);
```

## Next Steps

After completing payment gateway setup:

1. Test all payment flows thoroughly
2. Configure webhooks for real-time updates
3. Set up monitoring and alerts
4. Train your team on payment gateway management
5. Document your specific configuration for future reference

For additional support, refer to the individual payment gateway documentation or contact our technical support team.