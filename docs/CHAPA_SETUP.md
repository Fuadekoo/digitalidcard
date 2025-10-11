# Chapa Payment Integration Setup

## Environment Variables Required

Add these environment variables to your `.env.local` file:

```bash
# Chapa Payment Integration
CHAPA_API="https://api.chapa.co/v1"
CHAPA_TOKEN="your_chapa_secret_key_here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## How to Get Chapa Credentials

1. **Sign up for Chapa**: Visit [https://chapa.co](https://chapa.co) and create an account
2. **Get API Key**: In your Chapa dashboard, go to API settings and copy your secret key
3. **Set up Webhook**: Configure your webhook URL to point to: `{NEXT_PUBLIC_APP_URL}/api/verify-payment/{tx_ref}`

## Payment Flow

1. **Order Creation**: User creates an order with "PENDING" status
2. **Payment Initialization**: System calls Chapa API to initialize payment
3. **User Payment**: User completes payment on Chapa's secure checkout page
4. **Webhook Verification**: Chapa calls back to verify payment
5. **Status Update**: Order status changes from "PENDING" to "APPROVED"

## Features Implemented

- ✅ **Payment Initialization**: Creates Chapa payment session
- ✅ **Payment Verification**: Verifies payment with Chapa API
- ✅ **Order Status Updates**: Automatically updates order status
- ✅ **Webhook Handling**: Handles Chapa callback verification
- ✅ **Payment Status Page**: Shows payment verification status
- ✅ **Error Handling**: Comprehensive error handling and user feedback

## Testing

1. **Test Mode**: Use Chapa's test credentials for development
2. **Test Cards**: Use Chapa's test card numbers for testing
3. **Webhook Testing**: Use tools like ngrok to test webhooks locally

## Security Notes

- Never expose your Chapa secret key in client-side code
- Always verify payments server-side
- Use HTTPS in production
- Validate all webhook data from Chapa

## Troubleshooting

- **Payment Not Initializing**: Check CHAPA_TOKEN and CHAPA_API variables
- **Webhook Not Working**: Verify NEXT_PUBLIC_APP_URL is correct
- **Verification Failing**: Check Chapa API response format
- **Order Not Updating**: Verify database connection and order ID
