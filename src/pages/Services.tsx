import { useState, useEffect } from "react";
import { Search, Filter, Star, MapPin, Loader2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Navigation as NavComponent } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { Link } from "react-router-dom";
import { AnimatedPagination } from "@/components/ui/AnimatedPagination";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import LocationPermission from "@/components/LocationPermission";
import InteractiveGoogleMap from "@/components/InteractiveGoogleMap";
import MapErrorBoundary from "@/components/MapErrorBoundary";
import { useLanguageContext } from "@/contexts/LanguageContext";

import { 
  type Location, 
  type ProviderWithLocation,
  getUserLocation,
  geocodeAddress
} from "@/lib/locationUtils";

const serviceCategories = [
  "All Services",
  "Plumbing",
  "Electrical", 
  "Beauty & Wellness",
  "Car Wash",
  "Home Cleaning",
  "Appliance Repair",
  "Gardening",
  "Painting"
];

interface Provider {
  id: string;
  user_id: string;
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

const Services = () => {
  const { t } = useLanguageContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Services");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [providersPerPage] = useState(6);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [showLocationPermission, setShowLocationPermission] = useState(true);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [nearbyProviders, setNearbyProviders] = useState<ProviderWithLocation[]>([]);
  const [searchRadius, setSearchRadius] = useState(10); // km
  const { toast } = useToast();

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    filterProviders();
  }, [providers, searchTerm, selectedCategory]);

  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('is_verified', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProviders(data || []);
    } catch (error: any) {
      console.error('Error fetching providers:', error);
      toast({
        title: "Error",
        description: "Failed to load service providers.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterProviders = () => {
    let filtered = providers;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(provider =>
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.service_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "All Services") {
      filtered = filtered.filter(provider =>
        provider.service_category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    setFilteredProviders(filtered);
    setCurrentPage(1);
  };

  const handleLocationGranted = async (location: Location) => {
    setUserLocation(location);
    setLocationPermissionGranted(true);
    setShowLocationPermission(false);
    
    // Fetch nearby providers
    await fetchNearbyProviders(location);
  };

  const handleLocationDenied = () => {
    setLocationPermissionGranted(false);
    setShowLocationPermission(false);
    toast({
      title: "Location Access Denied",
      description: "You can still browse all providers, but location-based features won't be available.",
    });
  };

  const fetchNearbyProviders = async (location: Location) => {
    try {
      setIsLoadingNearby(true);
      
      const response = await fetch("http://localhost:8000/providers/nearby", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          radius_km: searchRadius,
          service_category: selectedCategory !== "All Services" ? selectedCategory : null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const nearbyData = await response.json();
      setNearbyProviders(nearbyData);
      
      if (nearbyData.length > 0) {
        toast({
          title: "Nearby Providers Found",
          description: `Found ${nearbyData.length} provider${nearbyData.length !== 1 ? 's' : ''} within ${searchRadius}km of your location.`,
        });
      } else {
        toast({
          title: "No Nearby Providers",
          description: `No providers found within ${searchRadius}km. Try increasing the search radius.`,
        });
      }
    } catch (error: any) {
      console.error('Error fetching nearby providers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch nearby providers. Showing all providers instead.",
        variant: "destructive"
      });
      // Fallback to showing all providers
      setNearbyProviders([]);
    } finally {
      setIsLoadingNearby(false);
    }
  };

  const handleRefreshLocation = async () => {
    if (userLocation) {
      try {
        const newLocation = await getUserLocation();
        setUserLocation(newLocation);
        await fetchNearbyProviders(newLocation);
        toast({
          title: "Location Updated",
          description: "Your location has been refreshed and nearby providers updated.",
        });
      } catch (error) {
        toast({
          title: "Location Update Failed",
          description: "Could not update your location. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleRadiusChange = (newRadius: number) => {
    setSearchRadius(newRadius);
    if (userLocation) {
      fetchNearbyProviders(userLocation);
    }
  };

  const getServiceCategories = (provider: Provider) => {
    if (typeof provider.service_category === 'string') {
      return provider.service_category.split(',').map(cat => cat.trim());
    }
    return [];
  };

  const getStartingPrice = (provider: Provider) => {
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

  // Calculate pagination
  const indexOfLastProvider = currentPage * providersPerPage;
  const indexOfFirstProvider = indexOfLastProvider - providersPerPage;
  const paginatedProviders = filteredProviders.slice(indexOfFirstProvider, indexOfLastProvider);
  const totalPages = Math.ceil(filteredProviders.length / providersPerPage);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavComponent />
        <div className="pt-24">
          <div className="container mx-auto px-6 lg:px-8 py-12">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-lg">Loading service providers...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavComponent />
      <div className="pt-24">
        <div className="container mx-auto px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Find Local Service Providers
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with verified professionals in your area for all your service needs
            </p>
          </div>

          {/* Location Permission */}
          {showLocationPermission && (
            <div className="mb-8">
              <LocationPermission
                onLocationGranted={handleLocationGranted}
                onLocationDenied={handleLocationDenied}
                showMap={true}
              />
            </div>
          )}

          {/* Search and Filter Controls */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("Search providers, services, or locations...")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  {serviceCategories.map((category) => (
                    <option key={category} value={category}>
                      {t(category)}
                    </option>
                  ))}
                </select>
                
                {locationPermissionGranted && (
                  <select
                    value={searchRadius}
                    onChange={(e) => handleRadiusChange(Number(e.target.value))}
                    className="px-4 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value={5}>5km</option>
                    <option value={10}>10km</option>
                    <option value={20}>20km</option>
                    <option value={50}>50km</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="mb-8">
            <MapErrorBoundary onRetry={handleRefreshLocation}>
              <InteractiveGoogleMap
                userLocation={userLocation}
                providers={nearbyProviders}
                onRefreshLocation={handleRefreshLocation}
                isLoading={isLoadingNearby}
                selectedServiceType={selectedCategory}
                searchRadius={searchRadius}
                onProviderSelect={(provider) => {
                  // Optional: Handle provider selection
                  console.log('Selected provider:', provider);
                }}
              />
            </MapErrorBoundary>
          </div>
          

          


          {/* All Providers Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {locationPermissionGranted ? t("All Providers") : t("Service Provider")}
              </h2>
              <p className="text-muted-foreground">
                {filteredProviders.length} {t("Provider")}{filteredProviders.length !== 1 ? 's' : ''} {t("found")}
              </p>
            </div>

            {paginatedProviders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProviders.map((provider) => (
                  <Card
                    key={provider.id}
                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <Link to={`/provider/${provider.id}`}>
                      <div className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {provider.profile_image ? (
                              <img
                                src={provider.profile_image}
                                alt={provider.name}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-2xl font-bold text-primary">
                                  {provider.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                              {provider.name}
                            </h3>
                            <p className="text-primary font-medium">{getServiceCategories(provider).join(', ')}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-primary text-primary" />
                                <span className="text-sm font-medium text-foreground">
                                  {provider.rating || 0}
                                </span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                ({provider.reviews_count || 0} reviews)
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {provider.location || "Location not specified"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Experience: {provider.experience || "Not specified"}
                          </p>
                          <p className="font-semibold text-foreground">
                            {getStartingPrice(provider)}
                          </p>
                          {provider.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {provider.bio}
                            </p>
                          )}
                        </div>
                        
                        <Button variant="default" className="w-full">
                          View Profile
                        </Button>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No providers found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or check back later for new providers.
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <AnimatedPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Services;