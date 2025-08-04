import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Star, MapPin, Clock, Shield, Phone, Calendar, ChevronLeft, ChevronRight, Loader2, CheckCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import ChatModal from "@/components/ChatModal";
import InteractiveGoogleMap from "@/components/InteractiveGoogleMap";
import MapErrorBoundary from "@/components/MapErrorBoundary";
import { type Location, type ProviderWithLocation, getUserLocation, calculateDistance } from "@/lib/locationUtils";

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
  jobs_pricing: Record<string, Record<string, string | number>>;
  created_at: string;
  latitude?: number;
  longitude?: number;
}

interface SelectedJob {
  category: string;
  job: string;
  price: number;
}

const ProviderProfile = () => {
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<SelectedJob[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasBooked, setHasBooked] = useState(false);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const { toast } = useToast();

  // Get user location
  useEffect(() => {
    const getLocation = async () => {
      try {
        const location = await getUserLocation();
        if (location) {
          setUserLocation(location);
          setLocationPermissionGranted(true);
          
          // Calculate distance if provider has coordinates
          if (provider?.latitude && provider?.longitude) {
            const calculatedDistance = calculateDistance(
              location.latitude,
              location.longitude,
              provider.latitude,
              provider.longitude
            );
            setDistance(calculatedDistance);
          }
        }
      } catch (error) {
        console.log('Location permission denied or error:', error);
        setLocationPermissionGranted(false);
      }
    };

    getLocation();
  }, [provider]);

  // Get current user and check if they have booked this provider
  useEffect(() => {
    const userData = localStorage.getItem('user_info');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser(user);
      
      // Check if user has booked this provider
      const checkBooking = async () => {
        if (!user || !provider) return;
        
        try {
          const { data, error } = await supabase
            .from('bookings')
            .select('id')
            .eq('user_id', user.id)
            .eq('provider_id', provider.id)
            .limit(1);
          
          if (!error && data && data.length > 0) {
            setHasBooked(true);
          }
        } catch (error) {
          console.error('Error checking booking:', error);
        }
      };
      
      checkBooking();
    }
  }, [provider]);

  // Fetch provider data from Supabase
  useEffect(() => {
    const fetchProvider = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('providers')
          .select('*')
          .eq('id', id)
          .eq('is_verified', true)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error('Provider not found');
        }

        // Parse jobs_pricing if it's a string
        let parsedJobsPricing = data.jobs_pricing;
        if (typeof data.jobs_pricing === 'string') {
          try {
            parsedJobsPricing = JSON.parse(data.jobs_pricing);
          } catch (error) {
            console.error('❌ Error parsing jobs_pricing string:', error);
            parsedJobsPricing = null;
          }
        }

        // Update the data with parsed jobs_pricing
        const processedData = {
          ...data,
          jobs_pricing: parsedJobsPricing
        };

        setProvider(processedData);
      } catch (error: any) {
        console.error('Error fetching provider:', error);
        setError(error.message || 'Failed to load provider');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProvider();
  }, [id]);

  const getServiceCategories = (provider: Provider) => {
    if (typeof provider.service_category === 'string') {
      return provider.service_category.split(',').map(cat => cat.trim()).join(', ');
    }
    return provider.service_category || 'General Services';
  };

  const getStartingPrice = (provider: Provider) => {
    if (!provider.jobs_pricing) return "Contact for pricing";
    
    let minPrice = Infinity;
    Object.values(provider.jobs_pricing).forEach((services: any) => {
      if (typeof services === 'object' && services !== null && !Array.isArray(services)) {
        Object.values(services).forEach((price: any) => {
          const numPrice = Number(price);
          if (!isNaN(numPrice) && numPrice < minPrice) {
            minPrice = numPrice;
          }
        });
      }
    });
    
    return minPrice === Infinity ? "Contact for pricing" : `Starting from Rs. ${minPrice.toLocaleString()}`;
  };

  const calculateTotalPrice = () => {
    return selectedJobs.reduce((total, job) => total + job.price, 0);
  };

  const handleJobSelection = (category: string, job: any) => {
    setSelectedJobs(prev => {
      const isSelected = prev.some(j => j.category === category && j.job === job.job);
      
      if (isSelected) {
        return prev.filter(j => !(j.category === category && j.job === job.job));
      } else {
        return [...prev, { category, job: job.job, price: job.price }];
      }
    });
  };

  const isJobSelected = (category: string, job: any) => {
    return selectedJobs.some(j => j.category === category && j.job === job.job);
  };

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  const handleRefreshLocation = async () => {
    try {
      const location = await getUserLocation();
      if (location) {
        setUserLocation(location);
        setLocationPermissionGranted(true);
        
        if (provider?.latitude && provider?.longitude) {
          const calculatedDistance = calculateDistance(
            location.latitude,
            location.longitude,
            provider.latitude,
            provider.longitude
          );
          setDistance(calculatedDistance);
        }
      }
    } catch (error) {
      console.error('Error refreshing location:', error);
      toast({
        title: "Location Error",
        description: "Failed to get your location. Please check your browser settings.",
        variant: "destructive"
      });
    }
  };

  const handleBooking = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book this service.",
        variant: "destructive"
      });
      return;
    }

    if (!provider) {
      toast({
        title: "Error",
        description: "Provider information not available.",
        variant: "destructive"
      });
      return;
    }

    if (selectedJobs.length === 0) {
      toast({
        title: "No Services Selected",
        description: "Please select at least one service to book.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast({
        title: "Schedule Required",
        description: "Please select a date and time for your appointment.",
        variant: "destructive"
      });
      return;
    }

    try {
      const bookingData = {
        user_id: currentUser.id,
        provider_id: provider.id,
        selected_services: selectedJobs,
        total_amount: calculateTotalPrice(),
        booking_date: selectedDate,
        booking_time: selectedTime,
        status: 'pending'
      };

      const { error } = await supabase
        .from('bookings')
        .insert([bookingData]);

      if (error) {
        throw error;
      }

      toast({
        title: "Booking Successful",
        description: "Your booking has been submitted. The provider will contact you soon.",
      });

      setHasBooked(true);
      setSelectedJobs([]);
      setSelectedDate("");
      setSelectedTime("");
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24">
          <div className="container mx-auto px-6 lg:px-8 py-12">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-lg">Loading provider profile...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24">
          <div className="container mx-auto px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">Provider Not Found</h1>
              <p className="text-muted-foreground mb-6">{error || "The provider you're looking for doesn't exist or is not available."}</p>
              <Button onClick={() => window.history.back()}>Go Back</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Provider Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Header */}
              <Card className="p-8 border-border bg-card">
                <div className="flex flex-col md:flex-row gap-6">
                  <img
                    src={provider.profile_image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"}
                    alt={provider.name}
                    className="w-32 h-32 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face";
                    }}
                  />
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground mb-2">{provider.name}</h1>
                    <p className="text-primary font-medium text-lg mb-3">{getServiceCategories(provider)}</p>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-primary text-primary" />
                        <span className="font-semibold text-foreground">{provider.rating || 0}</span>
                        <span className="text-muted-foreground">({provider.reviews_count || 0} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{provider.location || "Location not specified"}</span>
                        {distance !== null && (
                          <span className="text-sm text-primary font-medium">
                            • {distance.toFixed(1)} km away
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">
                      Experience: {provider.experience || "Not specified"}
                    </p>
                    
                    <p className="font-semibold text-foreground text-lg">
                      {getStartingPrice(provider)}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Interactive Location Map */}
              {provider.latitude && provider.longitude && (
                <Card className="p-8 border-border bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-foreground">Location</h2>
                    {distance !== null && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Distance: <span className="font-medium text-primary">{distance.toFixed(1)} km</span></span>
                      </div>
                    )}
                  </div>
                  
                  <MapErrorBoundary onRetry={handleRefreshLocation}>
                    <InteractiveGoogleMap
                      userLocation={userLocation}
                      providers={[{
                        ...provider,
                        latitude: provider.latitude!,
                        longitude: provider.longitude!
                      }]}
                      onRefreshLocation={handleRefreshLocation}
                      isLoading={false}
                      selectedServiceType="All Services"
                      searchRadius={50}
                      onProviderSelect={() => {}}
                    />
                  </MapErrorBoundary>
                  
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{provider.location}</span>
                      {distance !== null && (
                        <>
                          <span>•</span>
                          <span>Distance from you: <span className="font-medium text-primary">{distance.toFixed(1)} km</span></span>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* About Section */}
              {provider.bio && (
                <Card className="p-8 border-border bg-card">
                  <h2 className="text-2xl font-bold text-foreground mb-4">About</h2>
                  <p className="text-muted-foreground leading-relaxed">{provider.bio}</p>
                </Card>
              )}

              {/* Services & Pricing */}
              {!provider.jobs_pricing || Object.keys(provider.jobs_pricing).length === 0 ? (
                <Card className="p-8 border-border bg-card">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Services & Pricing</h2>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No services and pricing information available.</p>
                    <p className="text-sm text-muted-foreground mt-2">This provider hasn't set up their services yet.</p>
                  </div>
                </Card>
              ) : (
                <Card className="p-8 border-border bg-card">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Services & Pricing</h2>
                  <div className="space-y-6">
                    {Object.entries(provider.jobs_pricing).map(([category, services]) => (
                      <div key={category} className="border-b border-border pb-6 last:border-b-0">
                        <h3 className="text-lg font-semibold text-foreground mb-3">{category}</h3>
                        <div className="space-y-3">
                          {typeof services === 'object' && services !== null && !Array.isArray(services) && 
                            Object.entries(services).map(([jobName, price], index: number) => {
                              const service = { job: jobName, price: Number(price) };
                              return (
                                <div 
                                  key={index} 
                                  className={`flex justify-between items-center p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent ${
                                    isJobSelected(category, service) 
                                      ? 'border-primary bg-primary/10' 
                                      : 'border-border bg-background'
                                  }`}
                                  onClick={() => handleJobSelection(category, service)}
                                >
                                  <div className="flex items-center gap-3">
                                    <CheckCircle 
                                      className={`h-5 w-5 ${
                                        isJobSelected(category, service) 
                                          ? 'text-primary' 
                                          : 'text-muted-foreground'
                                      }`}
                                    />
                                    <span className="font-medium text-foreground">{jobName}</span>
                                  </div>
                                  <span className="font-semibold text-primary">{formatPrice(Number(price))}</span>
                                </div>
                              );
                            })
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Booking Section */}
              {!hasBooked && (
                <Card className="p-8 border-border bg-card">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Book Appointment</h2>
                  
                  {/* Date and Time Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Time</label>
                      <input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                      />
                    </div>
                  </div>

                  {/* Selected Services Summary */}
                  {selectedJobs.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-foreground mb-3">Selected Services</h3>
                      <div className="space-y-2">
                        {selectedJobs.map((job, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                            <span className="text-foreground">{job.job}</span>
                            <span className="font-semibold text-primary">{formatPrice(job.price)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary">
                          <span className="font-semibold text-foreground">Total</span>
                          <span className="font-bold text-primary">{formatPrice(calculateTotalPrice())}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleBooking}
                    disabled={selectedJobs.length === 0 || !selectedDate || !selectedTime}
                    className="w-full"
                  >
                    Book Appointment
                  </Button>
                </Card>
              )}

              {/* Already Booked Message */}
              {hasBooked && (
                <Card className="p-8 border-border bg-card">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Already Booked</h3>
                    <p className="text-muted-foreground">You have already booked this provider.</p>
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <Card className="p-6 border-border bg-card">
                <h3 className="text-lg font-semibold text-foreground mb-4">Contact</h3>
                
                {hasBooked ? (
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowChat(true)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Provider
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/30">
                      <div className="flex items-center gap-3 mb-3">
                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium text-foreground">Send Message</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Text the provider after booking an appointment
                      </p>
                    </div>
                    
                    <div className="p-4 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/30">
                      <div className="flex items-center gap-3 mb-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium text-foreground">Call Provider</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Call the provider after hiring them
                      </p>
                    </div>
                    
                    <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-sm text-primary font-medium">
                        Book an appointment to unlock contact features
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Verification Badge */}
              {provider.is_verified && (
                <Card className="p-6 border-border bg-card">
                  <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-primary" />
                    <div>
                      <h4 className="font-semibold text-foreground">Verified Provider</h4>
                      <p className="text-sm text-muted-foreground">This provider has been verified by our team</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Quick Stats */}
              <Card className="p-6 border-border bg-card">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <span className="font-semibold text-foreground">{provider.rating || 0}/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reviews</span>
                    <span className="font-semibold text-foreground">{provider.reviews_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Experience</span>
                    <span className="font-semibold text-foreground">{provider.experience || "N/A"}</span>
                  </div>
                  {distance !== null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Distance</span>
                      <span className="font-semibold text-primary">{distance.toFixed(1)} km</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {showChat && currentUser && (
        <ChatModal
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          bookingId={provider.id} // Using provider ID as booking ID for now
          currentUserId={currentUser.id}
          currentUserType="user"
          otherPartyName={provider.name}
          otherPartyImage={provider.profile_image}
        />
      )}

      <Footer />
    </div>
  );
};

export default ProviderProfile;