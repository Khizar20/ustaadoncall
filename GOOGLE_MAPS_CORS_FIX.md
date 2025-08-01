# Google Maps CORS Issue Fix

## Problem
You're experiencing a CORS (Cross-Origin Resource Sharing) error when trying to use Google Maps API from your localhost development server. The error message is:
```
Access to fetch at 'https://maps.googleapis.com/maps/api/place/autocomplete/json?...' from origin 'http://localhost:8080' has been blocked by CORS policy
```

## Root Cause
The Google Maps API server is not configured to allow requests from `http://localhost:8080`. This is a security feature that prevents unauthorized domains from accessing the API.

## Solution Steps

### 1. Configure Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Select Your Project**
   - Make sure you're in the correct project that contains your Google Maps API key

3. **Navigate to APIs & Services**
   - Go to "APIs & Services" > "Credentials"

4. **Find Your API Key**
   - Look for the API key that matches `VITE_GOOGLE_MAPS_API_KEY` in your `.env` file
   - Click on the API key to edit it

5. **Configure Application Restrictions**
   - In the "Application restrictions" section, select "HTTP referrers (web sites)"
   - Add the following referrers:
     ```
     http://localhost:8080/*
     http://localhost:3000/*
     http://localhost:5173/*
     https://your-production-domain.com/*
     ```
   - Replace `your-production-domain.com` with your actual production domain

6. **Configure API Restrictions**
   - In the "API restrictions" section, make sure these APIs are enabled:
     - Places API
     - Geocoding API
     - Maps JavaScript API

7. **Save Changes**
   - Click "Save" to apply the changes

### 2. Alternative: Use a CORS Proxy (Temporary Solution)

If you can't immediately configure the Google Cloud Console, you can use a CORS proxy as a temporary workaround. However, this is not recommended for production.

### 3. Test the Fix

1. **Restart your development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. **Clear browser cache**
   - Open Developer Tools (F12)
   - Right-click the refresh button
   - Select "Empty Cache and Hard Reload"

3. **Test the location search**
   - Go to your urgent request form
   - Try typing in the location field
   - You should now see location suggestions

## Important Notes

- **API Key Security**: Never expose your API key in client-side code for production. Consider using a backend proxy for production applications.
- **Rate Limits**: Google Maps API has usage limits. Monitor your usage in the Google Cloud Console.
- **Billing**: Make sure billing is enabled for your Google Cloud project to use the APIs.

## Troubleshooting

If you still experience issues:

1. **Check API Key**: Verify your API key is correct in the `.env` file
2. **Check API Status**: Visit https://status.cloud.google.com/ to check if Google Maps APIs are experiencing issues
3. **Check Console Logs**: Look for more specific error messages in the browser console
4. **Test API Directly**: Try the API URL directly in a browser to see if it returns data

## Production Considerations

For production deployment:

1. **Use Environment Variables**: Make sure your API key is properly configured for your production domain
2. **Implement Rate Limiting**: Add rate limiting to prevent abuse
3. **Add Error Handling**: The code has been updated to show user-friendly error messages when the API is unavailable
4. **Consider Backend Proxy**: For better security, consider proxying Google Maps API calls through your backend

## Updated Code Features

The code has been updated with:

- Better error handling for CORS issues
- User-friendly error messages when location search is unavailable
- Graceful fallback to manual location entry
- Improved fetch requests with proper headers and CORS mode 