import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Crosshair, MapPin, Star, Phone, Mail, User, Wrench, Zap, Car, Sparkles, Home, Palette, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { type Location, type ProviderWithLocation, calculateDistance } from '@/lib/locationUtils';

interface InteractiveGoogleMapProps {
  userLocation: Location | null;
  providers: ProviderWithLocation[];
  onRefreshLocation?: () => void;
  isLoading?: boolean;
  selectedServiceType?: string;
  searchRadius?: number;
  onProviderSelect?: (provider: ProviderWithLocation) => void;
}

// Service category to icon mapping
const getServiceIcon = (serviceCategory: string): string => {
  const category = serviceCategory.toLowerCase();
  
  if (category.includes('plumbing') || category.includes('plumber')) {
    return '/plumber.png';
  } else if (category.includes('electrical') || category.includes('electrician')) {
    return '/electrician.png';
  } else if (category.includes('car wash') || category.includes('carwasher')) {
    return '/carwasher.png';
  } else if (category.includes('gardening') || category.includes('gardener')) {
    return '/gardener.png';
  } else if (category.includes('home cleaning') || category.includes('house cleaner') || category.includes('cleaning')) {
    return '/housecleaner.png';
  } else if (category.includes('makeup') || category.includes('makeup artist')) {
    return '/makeup-artist.png';
  } else if (category.includes('barber') || category.includes('haircut')) {
    return '/barber.png';
  } else if (category.includes('beauty') || category.includes('wellness')) {
    return '/makeup-artist.png'; // Default for beauty services
  } else if (category.includes('painting')) {
    return '/painter.png'; // Assuming you have a painter.png
  } else if (category.includes('appliance repair')) {
    return '/appliance-repair.png'; // Assuming you have this icon
  } else {
    return '/plumber.png'; // Default fallback
  }
};

const InteractiveGoogleMap: React.FC<InteractiveGoogleMapProps> = ({
  userLocation,
  providers,
  onRefreshLocation,
  isLoading = false,
  selectedServiceType = 'All Services',
  searchRadius = 10,
  onProviderSelect
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMapsAPI = () => {
      if (window.google && window.google.maps) {
        setMapLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=geometry,places&loading=async`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setMapLoaded(true);
      };
      
      script.onerror = () => {
        setMapError('Failed to load Google Maps API');
        toast({
          title: "Map Error",
          description: "Failed to load Google Maps. Please check your internet connection.",
          variant: "destructive"
        });
      };

      document.head.appendChild(script);
    };

    loadGoogleMapsAPI();
  }, [toast]);

  // Clear existing map and markers safely
  const clearMap = useCallback(() => {
    try {
      // Clear existing markers
      if (markersRef.current.length > 0) {
        markersRef.current.forEach(marker => {
          if (marker && typeof marker.setMap === 'function') {
            marker.setMap(null);
          }
        });
        markersRef.current = [];
      }

      // Clear existing map
      if (mapInstanceRef.current && typeof mapInstanceRef.current.setMap === 'function') {
        mapInstanceRef.current.setMap(null);
        mapInstanceRef.current = null;
      }
    } catch (error) {
      console.warn('Error clearing map:', error);
    }
  }, []);

  // Create marker with fallback
  const createMarker = useCallback((position: google.maps.LatLngLiteral, options: any) => {
    try {
      // Try to use AdvancedMarkerElement if available
      if (window.google?.maps?.marker?.AdvancedMarkerElement) {
        const markerElement = document.createElement('div');
        markerElement.innerHTML = options.content || '';
        
        return new window.google.maps.marker.AdvancedMarkerElement({
          position,
          map: options.map,
          title: options.title,
          content: markerElement
        });
      } else {
        // Fallback to regular Marker
        return new window.google.maps.Marker({
          position,
          map: options.map,
          title: options.title,
          icon: options.icon
        });
      }
    } catch (error) {
      console.warn('Error creating marker, using fallback:', error);
      // Final fallback to regular Marker
      return new window.google.maps.Marker({
        position,
        map: options.map,
        title: options.title,
        icon: options.icon
      });
    }
  }, []);

  // Initialize map
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google || !window.google.maps || !userLocation) {
      return;
    }

    try {
      // Clear existing map and markers
      clearMap();

      // Create map
      const mapOptions: google.maps.MapOptions = {
        center: { lat: userLocation.latitude, lng: userLocation.longitude },
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        scrollwheel: true,
        gestureHandling: 'cooperative'
      };

      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      // Create info window
      infoWindowRef.current = new window.google.maps.InfoWindow();

      // Create user location marker with boy.png
      const userMarkerContent = `
        <div style="
          width: 48px; 
          height: 48px; 
          background: white;
          border: 3px solid #3B82F6;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          overflow: hidden;
        ">
          <img src="/boy.png" alt="User" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />
          <div style="
            position: absolute;
            top: -2px;
            right: -2px;
            width: 12px;
            height: 12px;
            background: #10B981;
            border: 2px solid white;
            border-radius: 50%;
          "></div>
        </div>
      `;

      const userMarkerIcon = {
        url: '/boy.png',
        scaledSize: new window.google.maps.Size(48, 48),
        anchor: new window.google.maps.Point(24, 24)
      };

      const userMarker = createMarker(
        { lat: userLocation.latitude, lng: userLocation.longitude },
        {
          map: map,
          title: 'Your Location',
          content: userMarkerContent,
          icon: userMarkerIcon
        }
      );

      // Add accuracy circle
      new window.google.maps.Circle({
        strokeColor: '#3B82F6',
        strokeOpacity: 0.3,
        strokeWeight: 1,
        fillColor: '#3B82F6',
        fillOpacity: 0.1,
        map: map,
        center: { lat: userLocation.latitude, lng: userLocation.longitude },
        radius: 100 // 100 meters accuracy circle
      });

      // Add search radius circle
      new window.google.maps.Circle({
        strokeColor: '#10B981',
        strokeOpacity: 0.5,
        strokeWeight: 2,
        fillColor: '#10B981',
        fillOpacity: 0.1,
        map: map,
        center: { lat: userLocation.latitude, lng: userLocation.longitude },
        radius: searchRadius * 1000 // Convert km to meters
      });

      // Add provider markers
      providers.forEach(provider => {
        if (!provider.latitude || !provider.longitude) return;

        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          provider.latitude,
          provider.longitude
        );

        // Filter by service type if not "All Services"
        if (selectedServiceType !== 'All Services' && provider.service_category !== selectedServiceType) {
          return;
        }

        // Filter by distance
        if (distance > searchRadius) {
          return;
        }

        // Get the appropriate icon based on service category
        const serviceIcon = getServiceIcon(provider.service_category);

        // Create provider marker with dynamic icon
        const providerMarkerContent = `
          <div style="
            width: 48px; 
            height: 48px; 
            background: white;
            border: 3px solid #EF4444;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            overflow: hidden;
          ">
            <img src="${serviceIcon}" alt="${provider.service_category}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />
            <div style="
              position: absolute;
              top: -2px;
              right: -2px;
              width: 16px;
              height: 16px;
              background: #FBBF24;
              border: 2px solid white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              font-weight: bold;
              color: #92400E;
            ">★</div>
          </div>
        `;

        const providerMarkerIcon = {
          url: serviceIcon,
          scaledSize: new window.google.maps.Size(48, 48),
          anchor: new window.google.maps.Point(24, 24)
        };

        const marker = createMarker(
          { lat: provider.latitude, lng: provider.longitude },
          {
            map: map,
            title: provider.name,
            content: providerMarkerContent,
            icon: providerMarkerIcon
          }
        );

        // Add click listener
        marker.addListener('click', () => {
          if (!infoWindowRef.current) return;

          const content = `
            <div style="padding: 16px; max-width: 300px;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">
                  ${provider.name.charAt(0)}
                </div>
                <div>
                  <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">${provider.name}</h3>
                  <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">${provider.service_category}</p>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="color: #fbbf24;">★</span>
                <span style="font-size: 14px; color: #374151;">${provider.rating || 0} (${provider.reviews_count || 0} reviews)</span>
              </div>
              <div style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">
                <div>📍 ${distance.toFixed(1)} km away</div>
                <div>💰 Starting from $${provider.jobs_pricing ? Object.values(provider.jobs_pricing)[0]?.[0]?.price || 'N/A' : 'N/A'}</div>
              </div>
              <div style="display: flex; gap: 8px;">
                <button onclick="window.providerSelect && window.providerSelect('${provider.id}')" style="flex: 1; padding: 8px 12px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer;">View Details</button>
                <button onclick="window.providerBook && window.providerBook('${provider.id}')" style="flex: 1; padding: 8px 12px; background: #10b981; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer;">Book Now</button>
              </div>
            </div>
          `;

          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(map, marker);

          // Add global functions for button clicks
          (window as any).providerSelect = (providerId: string) => {
            const provider = providers.find(p => p.id === providerId);
            if (provider && onProviderSelect) {
              onProviderSelect(provider);
            }
            infoWindowRef.current?.close();
          };

          (window as any).providerBook = (providerId: string) => {
            // Handle booking logic
            toast({
              title: "Booking",
              description: "Booking feature coming soon!",
            });
            infoWindowRef.current?.close();
          };
        });

        markersRef.current.push(marker);
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map');
      toast({
        title: "Map Error",
        description: "Failed to initialize the map. Please try refreshing the page.",
        variant: "destructive"
      });
    }
  }, [userLocation, providers, searchRadius, selectedServiceType, onProviderSelect, toast, clearMap, createMarker]);

  // Initialize map when dependencies change
  useEffect(() => {
    if (mapLoaded && userLocation) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(initializeMap, 100);
      return () => clearTimeout(timer);
    }
  }, [mapLoaded, userLocation, providers, searchRadius, selectedServiceType, initializeMap]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearMap();
    };
  }, [clearMap]);

  const handleRefreshLocation = () => {
    if (onRefreshLocation) {
      onRefreshLocation();
    }
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.setCenter({ lat: userLocation.latitude, lng: userLocation.longitude });
      mapInstanceRef.current.setZoom(13);
    }
  };

  if (mapError) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Map Error</h3>
          <p className="text-muted-foreground mb-4">{mapError}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </Card>
    );
  }

  if (!userLocation) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Location Required</h3>
          <p className="text-muted-foreground mb-4">
            Please enable location access to view the interactive map.
          </p>
          <Button onClick={handleRefreshLocation}>
            <Crosshair className="h-4 w-4 mr-2" />
            Enable Location
          </Button>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Loading Map</h3>
          <p className="text-muted-foreground">Initializing interactive map...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        {/* Map Container */}
        <div
          ref={mapRef}
          className="w-full h-[50vh] min-h-[400px]"
          style={{ position: 'relative' }}
        />
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleRecenter}
            className="shadow-lg"
          >
            <Crosshair className="h-4 w-4" />
          </Button>
        </div>

        {/* Map Info */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="text-sm">
            <div className="font-medium">Your Location</div>
            <div className="text-muted-foreground">
              {providers.length} providers within {searchRadius}km
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InteractiveGoogleMap; 