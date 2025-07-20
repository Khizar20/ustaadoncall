import { useState } from "react";
import { useParams } from "react-router-dom";
import { Star, MapPin, Clock, Shield, Phone, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { useToast } from "@/hooks/use-toast";

// Mock provider data - in real app this would come from API
const providerData = {
  1: {
    id: 1,
    name: "Ahmed Hassan",
    service: "Plumbing",
    rating: 4.9,
    reviews: 127,
    price: "Starting at $80",
    location: "Downtown",
    experience: "8 years",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    about: "Experienced plumber specializing in residential and commercial repairs. Licensed and insured with a commitment to quality workmanship and customer satisfaction.",
    specialties: ["Emergency Repairs", "Pipe Installation", "Drain Cleaning", "Water Heater Service"],
    availability: "Monday - Saturday, 7 AM - 7 PM",
    insurance: "Fully Insured & Bonded",
    customerReviews: [
      {
        name: "Sarah Johnson",
        rating: 5,
        date: "2 weeks ago",
        text: "Ahmed was punctual, professional, and fixed my kitchen sink leak quickly. Great communication throughout the process."
      },
      {
        name: "Mike Davis", 
        rating: 5,
        date: "1 month ago",
        text: "Excellent work on our bathroom renovation. Ahmed went above and beyond to ensure everything was perfect."
      },
      {
        name: "Lisa Chen",
        rating: 4,
        date: "2 months ago", 
        text: "Quick response for emergency repair. Fair pricing and quality work. Would definitely recommend."
      }
    ]
  }
};

const ProviderProfile = () => {
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const { toast } = useToast();
  
  const provider = providerData[Number(id) as keyof typeof providerData];
  
  if (!provider) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 text-center">
          <h1 className="text-2xl font-bold text-foreground">Provider not found</h1>
        </div>
      </div>
    );
  }

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Please select date and time",
        description: "Choose your preferred appointment slot to continue.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Booking Confirmed!",
      description: `Your appointment with ${provider.name} is scheduled for ${selectedDate} at ${selectedTime}.`,
    });
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
                    src={provider.image}
                    alt={provider.name}
                    className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0"
                  />
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
                      {provider.name}
                    </h1>
                    <p className="text-xl text-primary font-semibold mb-3">{provider.service}</p>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 fill-primary text-primary" />
                          <span className="font-semibold text-foreground">{provider.rating}</span>
                        </div>
                        <span className="text-muted-foreground">({provider.reviews} reviews)</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{provider.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{provider.experience} experience</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                      <Shield className="h-5 w-5 text-primary" />
                      <span className="text-foreground font-medium">{provider.insurance}</span>
                    </div>
                    
                    <p className="text-2xl font-bold text-foreground">{provider.price}</p>
                  </div>
                </div>
              </Card>

              {/* About */}
              <Card className="p-6 border-border bg-card">
                <h2 className="font-semibold text-xl text-foreground mb-4">About</h2>
                <p className="text-muted-foreground mb-6">{provider.about}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Specialties</h3>
                    <ul className="space-y-2">
                      {provider.specialties.map((specialty, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <span className="text-muted-foreground">{specialty}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Availability</h3>
                    <p className="text-muted-foreground">{provider.availability}</p>
                  </div>
                </div>
              </Card>

              {/* Reviews */}
              <Card className="p-6 border-border bg-card">
                <h2 className="font-semibold text-xl text-foreground mb-6">Customer Reviews</h2>
                <div className="space-y-6">
                  {provider.customerReviews.map((review, index) => (
                    <div key={index} className="border-b border-border last:border-b-0 pb-6 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-foreground">{review.name}</h4>
                          <div className="flex items-center gap-2">
                            <div className="flex space-x-1">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.text}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-6 border-border bg-card sticky top-24">
                <h2 className="font-semibold text-xl text-foreground mb-6">Book Appointment</h2>
                
                <div className="space-y-6">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Select Date
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[...Array(7)].map((_, index) => {
                        const date = new Date();
                        date.setDate(date.getDate() + index);
                        const dateStr = date.toLocaleDateString();
                        const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
                        
                        return (
                          <button
                            key={index}
                            onClick={() => setSelectedDate(dateStr)}
                            className={`p-3 rounded-lg border text-center transition-all ${
                              selectedDate === dateStr
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background hover:border-primary'
                            }`}
                          >
                            <div className="text-xs">{dayStr}</div>
                            <div className="text-sm font-semibold">{date.getDate()}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Select Time
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-2 rounded-lg border text-sm transition-all ${
                            selectedTime === time
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-background hover:border-primary'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Booking Summary */}
                  {selectedDate && selectedTime && (
                    <div className="p-4 bg-accent rounded-lg">
                      <h3 className="font-semibold text-foreground mb-2">Booking Summary</h3>
                      <p className="text-sm text-muted-foreground">
                        <strong>Service:</strong> {provider.service}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Date:</strong> {selectedDate}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Time:</strong> {selectedTime}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Price:</strong> {provider.price}
                      </p>
                    </div>
                  )}

                  {/* Booking Buttons */}
                  <div className="space-y-3">
                    <Button 
                      onClick={handleBooking} 
                      variant="default" 
                      size="lg" 
                      className="w-full"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Appointment
                    </Button>
                    
                    <Button variant="outline" size="lg" className="w-full">
                      <Phone className="mr-2 h-4 w-4" />
                      Call Provider
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    You can cancel or reschedule up to 4 hours before your appointment
                  </p>
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