import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Navigation, 
  Star, 
  User, 
  ExternalLink,
  RefreshCw,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { 
  type Location, 
  type ProviderWithLocation, 
  calculateDistance, 
  formatDistance,
  getMapWithMarkersUrl,
  getDirectionsUrl
} from "@/lib/locationUtils";

interface ProvidersMapProps {
  userLocation: Location;
  providers: ProviderWithLocation[];
  onRefreshLocation?: () => void;
  isLoading?: boolean;
}

export default function ProvidersMap({ 
  userLocation, 
  providers, 
  onRefreshLocation,
  isLoading = false 
}: ProvidersMapProps) {
  const [mapUrl, setMapUrl] = useState<string>("");
  const [providersWithDistance, setProvidersWithDistance] = useState<ProviderWithLocation[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (userLocation && providers.length > 0) {
      // Calculate distances and sort providers
      const providersWithDist = providers
        .map(provider => {
          if (provider.latitude && provider.longitude) {
            const distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              provider.latitude,
              provider.longitude
            );
            return { ...provider, distance };
          }
          return provider;
        })
        .filter(provider => provider.distance !== undefined)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));

      setProvidersWithDistance(providersWithDist);
      
      // Generate map URL with markers
      const mapUrl = getMapWithMarkersUrl(userLocation, providersWithDist);
      setMapUrl(mapUrl);
    }
  }, [userLocation, providers]);

  const handleGetDirections = (provider: ProviderWithLocation) => {
    if (provider.latitude && provider.longitude) {
      const directionsUrl = getDirectionsUrl(
        userLocation.latitude,
        userLocation.longitude,
        provider.latitude,
        provider.longitude
      );
      window.open(directionsUrl, '_blank');
    }
  };

  const handleRefreshLocation = () => {
    if (onRefreshLocation) {
      onRefreshLocation();
    }
  };

  const getServiceCategories = (provider: ProviderWithLocation) => {
    if (typeof provider.service_category === 'string') {
      return provider.service_category.split(',').map(cat => cat.trim());
    }
    return [];
  };

  const getStartingPrice = (provider: ProviderWithLocation) => {
    if (!provider.jobs_pricing) return "Contact for pricing";
    
    let minPrice = Infinity;
    Object.values(provider.jobs_pricing).forEach((services: any) => {
      if (Array.isArray(services)) {
        services.forEach((service: any) => {
          if (service.price && service.price < minPrice) {
            minPrice = service.price;
          }
        });
      }
    });
    
    return minPrice === Infinity ? "Contact for pricing" : `Starting from Rs. ${minPrice.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-lg">Loading nearby providers...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Map Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Nearby Service Providers
            </CardTitle>
            {onRefreshLocation && (
              <Button 
                onClick={handleRefreshLocation} 
                variant="outline" 
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {mapUrl && (
            <div className="space-y-4">
              <div className="h-64 rounded-lg overflow-hidden border">
                <img
                  src={mapUrl}
                  alt="Map showing nearby providers"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-[hsl(22_65%_45%)] rounded-full"></div>
                  <span>You</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Providers</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Providers List */}
      {providersWithDistance.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Found {providersWithDistance.length} provider{providersWithDistance.length !== 1 ? 's' : ''} near you
          </h3>
          
          {providersWithDistance.map((provider, index) => (
            <div key={provider.id} className="relative group">
              <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-[hsl(22_65%_60%)] via-[hsl(22_65%_50%)] to-[hsl(22_65%_45%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
              <Card className="relative hover:shadow-elegant transition-shadow">
                <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Provider Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      {provider.profile_image ? (
                        <img
                          src={provider.profile_image}
                          alt={provider.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-primary" />
                      )}
                    </div>
                  </div>

                  {/* Provider Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">{provider.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-primary text-primary" />
                            <span className="text-sm font-medium">
                              {(provider.rating || 0).toFixed(1)}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            ({provider.reviews_count || 0} reviews)
                          </span>
                          {provider.is_verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Distance Badge */}
                      {provider.distance !== undefined && (
                        <Badge variant="outline" className="text-xs">
                          {formatDistance(provider.distance)}
                        </Badge>
                      )}
                    </div>

                    {/* Service Categories */}
                    <div className="mb-2">
                      <div className="flex flex-wrap gap-1">
                        {getServiceCategories(provider).map((category, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Location and Price */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{provider.location}</span>
                      </div>
                      <p className="text-sm font-medium text-primary">
                        {getStartingPrice(provider)}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-3">
                      <Link to={`/provider/${provider.id}`}>
                        <Button size="sm" variant="default">
                          View Profile
                        </Button>
                      </Link>
                      
                      {provider.latitude && provider.longitude && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleGetDirections(provider)}
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          Directions
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No providers found nearby</h3>
            <p className="text-muted-foreground">
              Try expanding your search area or check back later for new providers in your area.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 