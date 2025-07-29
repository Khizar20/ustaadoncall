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
  const { toast } = useToast();

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

        setProvider(data);
      } catch (err: any) {
        console.error('Error fetching provider:', err);
        setError(err.message || 'Failed to fetch provider');
        toast({
          title: "Error",
          description: "Failed to load provider details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProvider();
  }, [id, toast]);

  const getServiceCategories = (provider: Provider) => {
    if (!provider.service_category) return "General Services";
    return provider.service_category.split(',').map(cat => cat.trim()).join(', ');
  };

  const getStartingPrice = (provider: Provider) => {
    if (!provider.jobs_pricing || typeof provider.jobs_pricing !== 'object') {
      return "Contact for pricing";
    }

    let minPrice = Infinity;
    Object.values(provider.jobs_pricing).forEach((services: any[]) => {
      if (Array.isArray(services)) {
        services.forEach((service: any) => {
          if (service.price && typeof service.price === 'number' && service.price < minPrice) {
            minPrice = service.price;
          }
        });
      }
    });

    return minPrice === Infinity ? "Contact for pricing" : `Starting at Rs. ${minPrice.toLocaleString()}`;
  };

  const calculateTotalPrice = () => {
    return selectedJobs.reduce((total, job) => total + job.price, 0);
  };

  const handleJobSelection = (category: string, job: any) => {
    const jobKey = `${category}-${job.job}`;
    const isSelected = selectedJobs.some(selected => 
      selected.category === category && selected.job === job.job
    );

    if (isSelected) {
      setSelectedJobs(selectedJobs.filter(selected => 
        !(selected.category === category && selected.job === job.job)
      ));
    } else {
      setSelectedJobs([...selectedJobs, {
        category,
        job: job.job,
        price: job.price
      }]);
    }
  };

  const isJobSelected = (category: string, job: any) => {
    return selectedJobs.some(selected => 
      selected.category === category && selected.job === job.job
    );
  };

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  const getMapUrl = (location: string) => {
    const encodedLocation = encodeURIComponent(location);
    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedLocation}`;
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
                <span className="text-lg">Loading provider details...</span>
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
              <h1 className="text-2xl font-bold text-foreground mb-4">Provider not found</h1>
              <p className="text-muted-foreground mb-6">
                {error || "The provider you're looking for doesn't exist or is not available."}
              </p>
              <Button onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Please select date and time",
        description: "Choose your preferred appointment slot to continue.",
        variant: "destructive"
      });
      return;
    }

    if (selectedJobs.length === 0) {
      toast({
        title: "Please select services",
        description: "Choose at least one service to book.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get current user from localStorage
      const userData = localStorage.getItem('user_info');
      if (!userData) {
        toast({
          title: "Please login",
          description: "You need to be logged in to make a booking.",
          variant: "destructive"
        });
        return;
      }

      const user = JSON.parse(userData);
      const totalPrice = calculateTotalPrice();
      const selectedServices = selectedJobs.map(job => job.job).join(', ');

      // Insert booking into Supabase
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          provider_id: provider!.id,
          booking_date: selectedDate,
          booking_time: selectedTime,
          selected_services: selectedJobs,
          total_amount: totalPrice,
          service_location: user.address || "Location to be confirmed",
          contact_phone: user.phone,
          special_instructions: "", // Can be enhanced later with a textarea
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Booking Confirmed!",
        description: `Your appointment with ${provider!.name} is scheduled for ${selectedDate} at ${selectedTime}. Services: ${selectedServices}. Total: ${formatPrice(totalPrice)}`,
      });

      // Reset form
      setSelectedDate("");
      setSelectedTime("");
      setSelectedJobs([]);

    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive"
      });
    }
  };

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ];

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

              {/* Location Map */}
              {provider.location && (
                <Card className="p-8 border-border bg-card">
                  <h2 className="text-2xl font-bold text-foreground mb-4">Location</h2>
                  <div className="h-64 rounded-lg overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={getMapUrl(provider.location)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    {provider.location}
                  </p>
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
              {provider.jobs_pricing && Object.keys(provider.jobs_pricing).length > 0 && (
                <Card className="p-8 border-border bg-card">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Services & Pricing</h2>
                  <div className="space-y-6">
                    {Object.entries(provider.jobs_pricing).map(([category, services]) => (
                      <div key={category} className="border-b border-border pb-6 last:border-b-0">
                        <h3 className="text-lg font-semibold text-foreground mb-3">{category}</h3>
                        <div className="space-y-3">
                          {Array.isArray(services) && services.map((service: any, index: number) => (
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
                                <span className="text-foreground">{service.job}</span>
                              </div>
                              <span className="font-semibold text-primary">
                                {formatPrice(service.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

                          {/* Reviews Section */}
            <Card className="p-8 border-border bg-card">
              <h2 className="text-2xl font-bold text-foreground mb-6">Reviews</h2>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{provider.rating || 0}</p>
                  <p className="text-muted-foreground">Based on {provider.reviews_count || 0} reviews</p>
                </div>
                <p className="text-center text-muted-foreground">
                  No reviews yet. Be the first to review this provider!
                </p>
              </div>
            </Card>

            {/* Chat Modal */}
            <ChatModal
              isOpen={showChat}
              onClose={() => setShowChat(false)}
              bookingId={id || ''}
              currentUserId={currentUser?.id || ''}
              currentUserType="user"
              otherPartyName={provider.name}
              otherPartyImage={provider.profile_image}
            />
          </div>

            {/* Booking Sidebar */}
            <div className="space-y-6">
              <Card className="p-6 border-border bg-card">
                <h3 className="text-xl font-bold text-foreground mb-4">Book Appointment</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Time</label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                    >
                      <option value="">Select time</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>

                  {/* Selected Services Summary */}
                  {selectedJobs.length > 0 && (
                    <div className="border border-border rounded-lg p-4 bg-muted">
                      <h4 className="font-semibold text-foreground mb-3">Selected Services</h4>
                      <div className="space-y-2">
                        {selectedJobs.map((job, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-foreground">{job.job}</span>
                            <span className="font-semibold text-primary">{formatPrice(job.price)}</span>
                          </div>
                        ))}
                        <div className="border-t border-border pt-2 mt-3">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-foreground">Total</span>
                            <span className="text-primary text-lg">{formatPrice(calculateTotalPrice())}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleBooking}
                    className="w-full"
                    disabled={!selectedDate || !selectedTime || selectedJobs.length === 0}
                  >
                    Book Appointment
                  </Button>
                </div>
              </Card>

              {/* Contact Info */}
              <Card className="p-6 border-border bg-card">
                <h3 className="text-xl font-bold text-foreground mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Verified Provider</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Available for bookings</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="text-sm text-muted-foreground">{provider.location || "Location not specified"}</span>
                  </div>
                  
                  {/* Chat Button - Only show after booking */}
                  {currentUser && hasBooked && (
                    <div className="pt-3 border-t">
                      <Button 
                        onClick={() => setShowChat(!showChat)}
                        className="w-full"
                        variant="outline"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {showChat ? 'Hide Chat' : 'Chat with Provider'}
                      </Button>
                    </div>
                  )}
                  
                  {/* Booking Required Message */}
                  {currentUser && !hasBooked && (
                    <div className="pt-3 border-t">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <MessageSquare className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Book an appointment to start chatting
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProviderProfile;