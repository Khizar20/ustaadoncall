import { useState, useEffect } from "react";
import { Search, Filter, Star, MapPin, Loader2, Navigation, User, Heart } from "lucide-react";
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
import { motion } from "framer-motion";
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set());
  const [currentAccountType, setCurrentAccountType] = useState<string | null>(null);
  const { toast } = useToast();

  // Check user authentication and load favorites
  useEffect(() => {
    const checkAuth = () => {
      const storedUserInfo = localStorage.getItem('user_info');
      const currentAccountType = localStorage.getItem('current_account_type');
      
      if (storedUserInfo) {
        const userData = JSON.parse(storedUserInfo);
        setCurrentUser(userData);
      }
      
      setCurrentAccountType(currentAccountType);
    };

    checkAuth();
  }, []);

  // Load user's favorites
  useEffect(() => {
    const loadFavorites = async () => {
      if (!currentUser?.id) return;

      try {
        const { data, error } = await supabase
          .from('user_favorites')
          .select('provider_id')
          .eq('user_id', currentUser.id);

        if (error) throw error;

        const favoriteIds = new Set(data?.map(fav => fav.provider_id) || []);
        setUserFavorites(favoriteIds);
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };

    loadFavorites();
  }, [currentUser?.id]);

  // Toggle favorite function
  const toggleFavorite = async (providerId: string, providerName: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!currentUser?.id) {
      toast({
        title: "Login Required",
        description: "Please log in to add providers to your favorites.",
        variant: "destructive"
      });
      return;
    }

    // Check if current user is logged in as a provider
    if (currentAccountType === 'provider') {
      toast({
        title: "Access Restricted",
        description: "Service providers cannot add favorites. Please switch to your user account.",
        variant: "destructive"
      });
      return;
    }

    try {
      const isFavorited = userFavorites.has(providerId);

      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('provider_id', providerId);

        if (error) throw error;

        setUserFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(providerId);
          return newSet;
        });
        
        toast({
          title: "Removed from Favorites",
          description: `${providerName} has been removed from your favorites.`,
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: currentUser.id,
            provider_id: providerId
          });

        if (error) throw error;

        setUserFavorites(prev => new Set([...prev, providerId]));
        
        toast({
          title: "Added to Favorites",
          description: `${providerName} has been added to your favorites.`,
        });
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update favorites.",
        variant: "destructive"
      });
    }
  };

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

      // Add coordinates to providers that don't have them
      const providersWithCoords = await Promise.all(
        (data || []).map(async (provider) => {
          if (provider.latitude && provider.longitude) {
            return provider;
          }
          
          // Try to geocode the location if coordinates are missing
          if (provider.location) {
            try {
              const geocodedLocation = await geocodeAddress(provider.location);
              if (geocodedLocation) {
                return {
                  ...provider,
                  latitude: geocodedLocation.latitude,
                  longitude: geocodedLocation.longitude
                };
              }
            } catch (error) {
              console.warn(`Failed to geocode location for ${provider.name}:`, error);
            }
          }
          
          return provider;
        })
      );

      setProviders(providersWithCoords);
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
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/providers/nearby`, {
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

  const getFormattedExperience = (provider: Provider) => {
    if (!provider.experience) return "Experience: Not specified";
    
    const serviceCategories = getServiceCategories(provider);
    const experienceValues = provider.experience.split(',').map(exp => exp.trim());
    
    // If we have the same number of categories and experience values, map them
    if (serviceCategories.length === experienceValues.length) {
      const experienceMap = serviceCategories.map((category, index) => ({
        category: category.trim(),
        experience: experienceValues[index] || "Not specified"
      }));
      
      return experienceMap.map(item => 
        `${item.category} experience: ${item.experience} years`
      ).join(', ');
    }
    
    // Fallback: if we can't map properly, show the raw experience
    return `Experience: ${provider.experience}`;
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
        <div className="pt-32">
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
              <div className="pt-32">
        <div className="container mx-auto px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
              Find Local Service Providers
            </h1>
            <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Connect with verified professionals in your area for all your service needs
            </p>
          </div>

          {/* Provider Notice */}
          {currentAccountType === 'provider' && (
            <div className="mb-6 md:mb-8">
              <div className="bg-secondary border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground font-medium text-sm md:text-base">
                      You're browsing as a Service Provider
                    </p>
                    <p className="text-muted-foreground text-xs md:text-sm">
                      To book services, please switch to your user account in the navigation menu.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
          <div className="mb-6 md:mb-8 space-y-3 md:space-y-4">
            <div className="flex flex-col gap-3 md:gap-4">
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
              
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
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
                    className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <MapErrorBoundary onRetry={handleRefreshLocation}>
                <InteractiveGoogleMap
                  userLocation={userLocation}
                  providers={filteredProviders}
                  onRefreshLocation={handleRefreshLocation}
                  isLoading={isLoadingNearby}
                  selectedServiceType={selectedCategory}
                  searchRadius={searchRadius}
                  onProviderSelect={(provider) => {
                    console.log('Selected provider:', provider);
                  }}
                />
              </MapErrorBoundary>
            </motion.div>
          </div>
          

          


          {/* All Providers Section */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                {locationPermissionGranted ? t("All Providers") : t("Service Provider")}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">
                {filteredProviders.length} {t("Provider")}{filteredProviders.length !== 1 ? 's' : ''} {t("found")}
              </p>
            </div>

            {paginatedProviders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {paginatedProviders.map((provider, idx) => (
                  <motion.div key={provider.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                    <div className="relative group">
                      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-[hsl(22_65%_60%)] via-[hsl(22_65%_50%)] to-[hsl(22_65%_45%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                      <Card
                        className="relative group bg-background hover:shadow-elegant card-hover cursor-pointer"
                      >
                    {/* Heart Icon for Favorites */}
                    {currentUser && currentAccountType !== 'provider' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`absolute top-2 right-2 z-10 h-8 w-8 p-0 rounded-full transition-all duration-200 ${
                          userFavorites.has(provider.id)
                            ? 'text-red-500 hover:text-red-600 bg-white hover:bg-red-50'
                            : 'text-gray-400 hover:text-red-500 bg-white hover:bg-red-50'
                        } shadow-sm`}
                        onClick={(e) => toggleFavorite(provider.id, provider.name, e)}
                      >
                        <Heart 
                          className={`w-4 h-4 ${
                            userFavorites.has(provider.id) ? 'fill-current' : ''
                          }`} 
                        />
                      </Button>
                    )}
                    
                    <Link to={`/provider/${provider.id}`}>
                      <div className="p-4 md:p-6">
                        <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {provider.profile_image ? (
                              <img
                                src={provider.profile_image}
                                alt={provider.name}
                                className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-lg md:text-2xl font-bold text-primary">
                                  {provider.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base md:text-lg text-foreground group-hover:text-primary transition-colors truncate">
                              {provider.name}
                            </h3>
                            <p className="text-primary font-medium text-sm md:text-base truncate">{getServiceCategories(provider).join(', ')}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 md:h-4 md:w-4 fill-primary text-primary" />
                                <span className="text-xs md:text-sm font-medium text-foreground">
                                  {(provider.rating || 0).toFixed(1)}
                                </span>
                              </div>
                              <span className="text-xs md:text-sm text-muted-foreground">
                                ({provider.reviews_count || 0} reviews)
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-3 md:mb-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                            <span className="text-xs md:text-sm text-muted-foreground truncate">
                              {provider.location || "Location not specified"}
                            </span>
                          </div>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            {getFormattedExperience(provider)}
                          </p>
                          <p className="font-semibold text-foreground text-sm md:text-base">
                            {getStartingPrice(provider)}
                          </p>
                          {provider.bio && (
                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                              {provider.bio}
                            </p>
                          )}
                        </div>
                        
                        <Button variant="default" className="w-full text-sm">
                          View Profile
                        </Button>
                      </div>
                        </Link>
                      </Card>
                    </div>
                  </motion.div>
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
                  total={filteredProviders.length}
                  perPage={providersPerPage}
                  current={currentPage - 1}
                  onChange={(pageIdx) => setCurrentPage(pageIdx + 1)}
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