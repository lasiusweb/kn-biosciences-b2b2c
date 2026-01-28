# Delhivery Shipping Integration - Environment Setup

## Environment Variables

Add these to your `.env.local` file:

```env
# Delhivery API Configuration
DELHIVERY_API_TOKEN=your_delhivery_api_token_here
DELHIVERY_API_BASE_URL=https://track.delhivery.com/api/
DELHIVERY_WAYBILL_URL=https://waybill.delhivery.com/
DELHIVERY_TEST_MODE=true

# Development Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Delhivery Account Setup

1. **Create Delhivery Account**
   - Visit [Delhivery Developer Portal](https://one.delhivery.com/developer-portal/)
   - Register for B2C and/or B2B services based on your business needs
   - Complete KYC and documentation verification

2. **Generate API Token**
   - Go to API credentials section
   - Generate your API token
   - Keep it secure and never commit to version control

3. **Configure Webhooks**
   - Set webhook URL: `https://yourdomain.com/api/shipping/webhook/delhivery`
   - Enable tracking status updates
   - Configure retry settings

## Testing Configuration

For development/testing:

- Set `DELHIVERY_TEST_MODE=true`
- Use test endpoints provided by Delhivery
- Test with sample waybills before going live

## Production Deployment

For production:

- Set `DELHIVERY_TEST_MODE=false`
- Use production Delhivery endpoints
- Enable proper logging and monitoring
- Set up proper error handling and fallbacks

## API Endpoints Implemented

### Shipping Rates

- `POST /api/shipping/rates` - Calculate shipping rates
- `GET /api/shipping/rates` - Get rates with query parameters
- Supports COD, prepaid, weight-based calculations

### Tracking

- `GET /api/shipping/track` - Track single or multiple waybills
- `POST /api/shipping/track` - Bulk tracking
- Real-time webhook support for tracking updates

### Labels & Waybills

- `POST /api/shipping/labels` - Generate shipping label
- `PUT /api/shipping/labels` - Bulk label generation
- `GET /api/shipping/labels` - Label preview and status

### Pickup Management

- `POST /api/shipping/pickup` - Schedule pickup
- `GET /api/shipping/pickup` - List pickups
- `PUT /api/shipping/pickup` - Update pickup status
- `DELETE /api/shipping/pickup` - Cancel pickup

## Features Implemented

✅ **Complete Delhivery Integration**

- Shipment creation and management
- Rate calculation with COD support
- Real-time tracking
- Waybill/label generation
- Pickup scheduling

✅ **Advanced Features**

- Address validation for Indian addresses
- Package dimension calculations
- Bulk operations support
- Error handling and retry logic
- Webhook integration

✅ **Business Logic**

- KN Biosciences specific discounts
- Volume weight calculations
- Multi-courier rate comparison
- Business hours validation

✅ **Testing Suite**

- Comprehensive unit tests
- Integration tests
- End-to-end workflow testing
- Error scenario coverage

## Usage Examples

### Calculate Shipping Rates

```javascript
const response = await fetch("/api/shipping/rates", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    origin_pin: "110001",
    destination_pin: "400001",
    weight: 2.5,
    cod: false,
  }),
});
```

### Track Shipment

```javascript
const response = await fetch("/api/shipping/track?waybill=WAY123456");
const tracking = await response.json();
```

### Generate Shipping Label

```javascript
const response = await fetch("/api/shipping/labels", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    order_id: "ORD123456",
    waybill_format: "pdf",
  }),
});
```

### Schedule Pickup

```javascript
const response = await fetch("/api/shipping/pickup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    pickup_date: "2024-01-15",
    pickup_time: "14:00",
    pickup_location: {
      name: "KN Biosciences",
      phone: "9876543210",
      address: "Warehouse Street",
      pin: "110001",
      city: "Delhi",
      state: "Delhi",
    },
    expected_package_count: 5,
  }),
});
```

## Monitoring & Debugging

### Logging

All API calls are logged with:

- Request/response data
- Error messages
- Performance metrics
- Status codes

### Error Handling

- Network retry logic
- Graceful degradation
- User-friendly error messages
- Proper HTTP status codes

### Webhook Processing

- Signature verification
- Idempotency handling
- Retry mechanisms
- Database synchronization

## Rate Limits & Best Practices

1. **Rate Limits**: Respect Delhivery API rate limits
2. **Caching**: Cache rate calculations and tracking data
3. **Bulk Operations**: Use bulk endpoints for multiple items
4. **Error Handling**: Implement proper retry logic
5. **Monitoring**: Track API performance and errors

## Security Considerations

- API tokens stored in environment variables
- Input validation and sanitization
- HTTPS for all API communications
- Webhook signature verification
- Rate limiting and abuse prevention

## Testing Commands

```bash
# Run shipping integration tests
npm test -- --testPathPattern=shipping

# Run specific test suite
npm test -- --testPathPattern=delhivery

# Run tests with coverage
npm test -- --coverage --testPathPattern=shipping
```

The Delhivery shipping integration is now fully implemented and ready for production use! 🚚
