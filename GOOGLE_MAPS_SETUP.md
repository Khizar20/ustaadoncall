# Google Maps API Setup Guide

## **Step 1: Get Your Free API Key**

### **Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Name your project (e.g., "UstaadOnCall")

### **Enable Required APIs**
1. Go to "APIs & Services" > "Library"
2. Search for and enable these APIs:
   - **Geocoding API** - Convert addresses to coordinates
   - **Maps JavaScript API** - Interactive maps
   - **Places API** - Location search and autocomplete
   - **Static Maps API** - Static map images

### **Create API Key**
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy your new API key

### **Restrict API Key (Important!)**
1. Click on your API key to edit it
2. Under "Application restrictions":
   - Choose "HTTP referrers (websites)"
   - Add: `localhost:5173/*` (for development)
   - Add your production domain when ready
3. Under "API restrictions":
   - Select "Restrict key"
   - Choose the APIs you enabled above
4. Click "Save"

## **Step 2: Configure Your Environment**

### **Create .env file in your project root:**
```env
# Google Maps API Configuration
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend Configuration (for backend/.env)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### **Update backend/.env file:**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## **Step 3: Test Your Setup**

### **Test Geocoding:**
```javascript
// In browser console
const coords = await geocodeAddress("Rawalpindi, Gulshan Abad");
console.log(coords);
```

### **Test Static Map:**
```javascript
// Check if map loads
const mapUrl = getStaticMapUrl(33.5651, 73.0169);
console.log(mapUrl);
```

## **Free Tier Limits**

Google Maps API has generous free limits:
- **Geocoding API**: 2,500 requests per day
- **Static Maps API**: 100,000 requests per day
- **Maps JavaScript API**: 28,500 requests per day
- **Places API**: 1,000 requests per day

This should be more than enough for development and small to medium applications.

## **Benefits of Using Google Maps API**

✅ **Better Geocoding Accuracy** - Much more reliable than free alternatives  
✅ **Comprehensive Coverage** - Works with Pakistani addresses  
✅ **Multiple APIs** - Geocoding, Maps, Places, Directions  
✅ **Free Tier** - Generous limits for development  
✅ **Professional Quality** - Google's mapping data is the best  

## **Troubleshooting**

### **If geocoding still fails:**
1. Check your API key is correct
2. Verify the APIs are enabled
3. Check the API restrictions aren't too restrictive
4. Try with a simple address first: "Islamabad, Pakistan"

### **If maps don't load:**
1. Check the API key in your .env file
2. Verify Static Maps API is enabled
3. Check browser console for errors

## **Security Best Practices**

1. **Always restrict your API key** to your domain
2. **Use environment variables** - never hardcode API keys
3. **Monitor usage** in Google Cloud Console
4. **Set up billing alerts** to avoid unexpected charges
5. **Use different keys** for development and production

## **Next Steps**

1. Get your API key from Google Cloud Console
2. Add it to your .env file
3. Restart your development server
4. Test the geocoding functionality
5. Enjoy much better location services! 🎉 