# Interactive Google Maps Component

## Overview

The `InteractiveGoogleMap` component is a comprehensive, feature-rich Google Maps implementation for the UstaadOnCall service marketplace. It provides an interactive map interface that displays user location and nearby service providers with advanced filtering, clustering, and user interaction capabilities.

## Features

### 🗺️ Map Layout
- **Full-width responsive design** that adapts to mobile and desktop
- **50% viewport height** with minimum 400px height
- **Modern card-based layout** with proper spacing and shadows
- **Responsive controls** positioned for optimal user experience

### 📍 User Location Features
- **Automatic geolocation detection** on component mount
- **Custom blue avatar marker** with concentric circles design
- **Accuracy circle** showing GPS precision (100m radius)
- **Search radius visualization** with green circle overlay
- **"My Location" button** to recenter map on user position

### 🎯 Service Provider Markers
- **Custom SVG markers** with service-specific colors and icons
- **Color-coded by service category**:
  - 🔧 Plumbing: Blue (#3B82F6)
  - ⚡ Electrical: Yellow (#F59E0B)
  - 🧹 Cleaning: Green (#10B981)
  - 🔨 Carpentry: Purple (#8B5CF6)
  - 🎨 Painting: Red (#EF4444)
  - 🚗 Car Wash: Cyan (#06B6D4)
  - 💄 Beauty: Pink (#EC4899)
  - 🍽️ Catering: Orange (#F97316)
  - 📸 Photography: Lime (#84CC16)
  - 📚 Tutoring: Indigo (#6366F1)

### 🎮 Interactive Features
- **Click markers** to show detailed info window
- **Hover effects** with z-index elevation
- **Zoom controls** (+/- buttons)
- **Map type selector** (Roadmap, Satellite, Hybrid, Terrain)
- **Auto-fit bounds** to show all markers
- **Minimum zoom enforcement** (max 15x zoom)

### 📊 Info Window Content
- **Provider profile image** or fallback avatar
- **Name and rating** with star display
- **Service categories** as badges
- **Distance from user** with formatted display
- **Starting price** information
- **Action buttons**: "View Profile" and "Get Directions"

### 🔍 Data Integration
- **Real-time distance calculation** using Haversine formula
- **Service type filtering** based on selected category
- **Radius-based filtering** (5km, 10km, 20km, 50km)
- **Provider selection callback** for external handling
- **Distance sorting** (closest providers first)

### 🛡️ Error Handling
- **Graceful geolocation permission handling**
- **Google Maps API error recovery**
- **Loading states** with skeleton components
- **Error boundaries** with retry functionality
- **Fallback location selector** (if GPS unavailable)

## Technical Implementation

### Dependencies
```json
{
  "google-maps-api": "Dynamic loading",
  "react": "^18.3.1",
  "typescript": "^5.5.3",
  "tailwindcss": "^3.4.17"
}
```

### API Requirements
- **Google Maps JavaScript API** with the following libraries:
  - `geometry` - For distance calculations
  - `places` - For geocoding and place details

### Environment Variables
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Component Usage

### Basic Implementation
```tsx
import InteractiveGoogleMap from '@/components/InteractiveGoogleMap';

<InteractiveGoogleMap
  userLocation={userLocation}
  providers={nearbyProviders}
  onRefreshLocation={handleRefreshLocation}
  isLoading={isLoadingNearby}
  selectedServiceType={selectedCategory}
  searchRadius={searchRadius}
  onProviderSelect={(provider) => {
    console.log('Selected provider:', provider);
  }}
/>
```

### With Error Boundary
```tsx
import MapErrorBoundary from '@/components/MapErrorBoundary';

<MapErrorBoundary onRetry={handleRefreshLocation}>
  <InteractiveGoogleMap
    userLocation={userLocation}
    providers={nearbyProviders}
    onRefreshLocation={handleRefreshLocation}
    isLoading={isLoadingNearby}
    selectedServiceType={selectedCategory}
    searchRadius={searchRadius}
  />
</MapErrorBoundary>
```

## Props Interface

```typescript
interface InteractiveGoogleMapProps {
  userLocation: Location;                    // User's current location
  providers: ProviderWithLocation[];        // Array of service providers
  onRefreshLocation?: () => void;           // Callback for refresh button
  isLoading?: boolean;                      // Loading state
  selectedServiceType?: string;             // Filter by service type
  searchRadius?: number;                    // Search radius in km
  onProviderSelect?: (provider: ProviderWithLocation) => void; // Provider selection callback
}
```

## Data Models

### Location Interface
```typescript
interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}
```

### Provider Interface
```typescript
interface ProviderWithLocation {
  id: string;
  name: string;
  service_category: string;
  bio: string;
  experience: string;
  location: string;
  profile_image: string;
  is_verified: boolean;
  rating: number;
  reviews_count: number;
  jobs_pricing: Record<string, any[]>;
  created_at: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
}
```

## Performance Optimizations

### Marker Management
- **Efficient marker cleanup** on component updates
- **Conditional rendering** based on service type filters
- **Z-index management** for proper layering
- **Event listener cleanup** to prevent memory leaks

### Map Performance
- **Lazy Google Maps API loading** with error handling
- **Bounds calculation** for optimal viewport fitting
- **Minimum zoom enforcement** to prevent excessive detail
- **Smooth animations** with proper transition timing

### Memory Management
- **Ref-based instance management** for Google Maps objects
- **Proper cleanup** in useEffect hooks
- **Event listener removal** on component unmount
- **Marker array management** to prevent duplicates

## Styling & Design

### Color Scheme
- **Primary**: Blue (#3B82F6) for user location
- **Secondary**: Service-specific colors for provider markers
- **Background**: Clean white with subtle shadows
- **Text**: High contrast for readability

### Responsive Design
- **Mobile-first approach** with touch-friendly controls
- **Flexible height** (50vh with 400px minimum)
- **Adaptive controls** positioned for thumb reach
- **Scalable markers** that work on all screen sizes

### Accessibility
- **ARIA labels** for interactive elements
- **Keyboard navigation** support
- **High contrast** color combinations
- **Screen reader** friendly information windows

## Error Scenarios & Solutions

### Geolocation Permission Denied
- **Graceful fallback** to manual location input
- **Clear error messaging** with actionable steps
- **Alternative location selection** interface

### Google Maps API Failures
- **Error boundary** with retry functionality
- **Fallback static map** if interactive map fails
- **Detailed error logging** for debugging

### Network Issues
- **Loading states** with skeleton components
- **Retry mechanisms** with exponential backoff
- **Offline detection** with appropriate messaging

## Browser Compatibility

### Supported Browsers
- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

### Required Features
- **Geolocation API** support
- **ES6+** JavaScript features
- **CSS Grid/Flexbox** support
- **Google Maps JavaScript API** access

## Security Considerations

### API Key Management
- **Environment variable** storage
- **Domain restrictions** on Google Cloud Console
- **Usage monitoring** and alerts
- **Key rotation** procedures

### Data Privacy
- **User consent** for location access
- **Minimal data collection** principles
- **Secure transmission** of coordinates
- **GDPR compliance** considerations

## Testing Strategy

### Unit Tests
- **Component rendering** with different prop combinations
- **Event handling** for user interactions
- **Error boundary** functionality
- **Loading state** transitions

### Integration Tests
- **Google Maps API** integration
- **Geolocation** permission flows
- **Provider data** filtering and display
- **Map controls** functionality

### E2E Tests
- **Complete user journey** from location permission to provider selection
- **Cross-browser** compatibility testing
- **Mobile responsiveness** validation
- **Performance** under load

## Future Enhancements

### Planned Features
- **Marker clustering** for dense areas
- **Advanced filtering** by rating, price, availability
- **Real-time updates** for provider status
- **Offline map** caching
- **Voice navigation** integration
- **AR view** for provider locations

### Performance Improvements
- **Virtual scrolling** for large provider lists
- **WebGL rendering** for smooth animations
- **Service worker** for offline functionality
- **CDN optimization** for map tiles

## Troubleshooting

### Common Issues

#### Map Not Loading
1. Check Google Maps API key configuration
2. Verify domain restrictions in Google Cloud Console
3. Check network connectivity
4. Review browser console for errors

#### Location Not Detected
1. Ensure HTTPS protocol (required for geolocation)
2. Check browser permissions
3. Verify device GPS is enabled
4. Test with different browsers

#### Markers Not Displaying
1. Verify provider data has valid coordinates
2. Check service category filtering logic
3. Review marker creation code
4. Validate SVG icon generation

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('mapDebug', 'true');
```

This will log detailed information about:
- API loading status
- Marker creation
- User interaction events
- Error conditions

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start development server: `npm run dev`

### Code Style
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for formatting
- **Component testing** with React Testing Library

### Pull Request Guidelines
- **Feature branches** from main
- **Comprehensive testing** before submission
- **Documentation updates** for new features
- **Performance impact** assessment

## License

This component is part of the UstaadOnCall project and follows the same licensing terms as the main application. 