# Quick Chapa Setup Guide

## 🚨 Current Issue: 401 Unauthorized Error

The error you're seeing indicates that Chapa API credentials are not properly configured.

## 🔧 Immediate Fix Steps:

### 1. Create/Update `.env.local` file in your project root:

```bash
# Chapa Payment Integration
CHAPA_API="https://api.chapa.co/v1"
CHAPA_TOKEN="CHASECK_TEST-tlwSXblBmeL9Da8degDKrKRELPL7G3cr"
CHAPA_ENCRYPTION_KEY="0j0zpUghilZZW4E0mP3xVlBx"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. ✅ Your Chapa Credentials Are Already Configured:

- **Test API Key**: `CHASECK_TEST-tlwSXblBmeL9Da8degDKrKRELPL7G3cr`
- **Encryption Key**: `0j0zpUghilZZW4E0mP3xVlBx`
- **Environment file**: `.env.local` has been created with your credentials

### 3. ✅ Test Your Setup:

Visit: `http://localhost:3000/api/test-chapa`

This will show you:

- ✅ All environment variables are set
- ✅ Chapa API connection status
- ✅ Configuration verification

### 4. ✅ Development Server:

The server has been restarted with your new credentials!

## 🧪 Test Mode (Recommended for Development):

Use Chapa's test credentials:

- **Test API URL**: `https://api.chapa.co/v1`
- **Test Secret Key**: Get from Chapa dashboard (test mode)
- **Test Phone**: Use any valid Ethiopian phone number format

## 🔍 Debug Information:

The system will now log:

- Chapa API URL being used
- Whether token exists
- App URL configuration

Check your terminal/console for these logs when testing payments.

## ✅ Success Indicators:

When properly configured, you should see:

- No 401 errors in terminal
- Successful API connection in test endpoint
- Payment initialization working

## 🆘 Still Having Issues?

1. **Check `.env.local` file exists** in project root
2. **Verify no spaces** around the `=` in environment variables
3. **Restart development server** after changes
4. **Check Chapa dashboard** for correct API key
5. **Use test credentials** first before production keys

## 📞 Need Help?

- Check Chapa documentation: https://chapa.co/docs
- Verify your account status in Chapa dashboard
- Test with Chapa's test credentials first
