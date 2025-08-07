import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Star, Users, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import Select from "react-select";
import { geocodeAddress } from "@/lib/locationUtils";
import GoogleMapsAutocomplete from "@/components/GoogleMapsAutocomplete";
import { AlertCircle, Upload, Trash2, Plus } from "lucide-react";
import { useLanguageContext } from "@/contexts/LanguageContext";

const benefits = [
  {
    icon: TrendingUp,
    title: "Grow Your Business",
    description: "Access thousands of customers and increase your revenue with our platform"
  },
  {
    icon: Shield,
    title: "Trust & Safety",
    description: "We handle background checks, insurance verification, and customer vetting"
  },
  {
    icon: Users,
    title: "Marketing Support",
    description: "Professional photos, marketing materials, and customer acquisition included"
  },
  {
    icon: Star,
    title: "Build Your Reputation",
    description: "Customer reviews and ratings help build your professional reputation"
  }
];

const requirements = [
  "Professional experience in your service area",
  "Valid business license and insurance",
  "Background check clearance",
  "Professional tools and equipment",
  "Commitment to quality service",
  "Reliable transportation"
];

const SERVICE_CATEGORIES = [
  {
    key: "plumbing",
    label: "Plumbing",
    jobs: [
      "Pipe Installation",
      "Leak Repair",
      "Drain Cleaning",
      "Water Heater Repair",
      "Faucet Replacement"
    ]
  },
  {
    key: "electrical",
    label: "Electrical",
    jobs: [
      "Wiring Installation",
      "Light Fixture Repair",
      "Circuit Breaker Replacement",
      "Outlet Installation",
      "Fan Installation"
    ]
  },
  {
    key: "beauty",
    label: "Beauty & Wellness",
    jobs: [
      "Haircut",
      "Facial",
      "Manicure",
      "Pedicure",
      "Makeup"
    ]
  },
  {
    key: "carwash",
    label: "Car Wash",
    jobs: [
      "Exterior Wash",
      "Interior Cleaning",
      "Waxing",
      "Engine Cleaning"
    ]
  },
  {
    key: "cleaning",
    label: "Home Cleaning",
    jobs: [
      "Room Cleaning",
      "Bathroom Cleaning",
      "Kitchen Cleaning",
      "Sofa Cleaning",
      "Carpet Cleaning"
    ]
  },
  {
    key: "other",
    label: "Other Services",
    jobs: []
  }
];

const BecomeProvider = () => {
  const { t } = useLanguageContext();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    experience: "",
    location: "",
    about: ""
  });
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [jobsPricing, setJobsPricing] = useState<Record<string, Record<string, string>>>({});
  const [priceErrors, setPriceErrors] = useState<Record<string, Record<string, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationCoordinates, setLocationCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [finalLocationCoordinates, setFinalLocationCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [cnicFront, setCnicFront] = useState<File | null>(null);
  const [cnicBack, setCnicBack] = useState<File | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsAuthenticated(true);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        // Redirect to login if not authenticated
        toast({
          title: t("Authentication Required"),
          description: t("Please log in to submit your provider application."),
          variant: "destructive",
        });
        navigate('/user-login');
      }
    };
    checkAuth();
  }, [navigate, toast, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle location selection from Google Maps autocomplete
  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setLocationCoordinates({ lat: location.lat, lng: location.lng });
    setFinalLocationCoordinates({ lat: location.lat, lng: location.lng });
    setFormData(prev => ({ ...prev, location: location.address }));
  };

  // Handle manual location input
  const handleLocationChange = (value: string) => {
    setFormData(prev => ({ ...prev, location: value }));
    // Clear coordinates when user manually types
    if (locationCoordinates) {
      setLocationCoordinates(null);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedServices((prev) =>
      prev.some(s => s.value === category)
        ? prev.filter((s) => s.value !== category)
        : [...prev, { value: category, label: SERVICE_CATEGORIES.find(c => c.key === category)?.label || category }]
    );
  };

  const handleJobPriceChange = (category: string, job: string, value: string) => {
    const price = Number(value);
    setJobsPricing((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [job]: value
      }
    }));
            setPriceErrors((prev: any) => ({
          ...prev,
          [category]: {
            ...prev[category],
            [job]: price < 100 ? t("Price must be at least 100 PKR") : undefined
          }
        }));
  };

  const handleCustomJobChange = (category: string, idx: number, field: string, value: string) => {
    setJobsPricing((prev: any) => {
      const customJobs = prev[category]?.customJobs || [];
      const updated = [...customJobs];
      updated[idx] = { ...updated[idx], [field]: value };
      return {
        ...prev,
        [category]: {
          ...prev[category],
          customJobs: updated
        }
      };
    });
            if (field === "price") {
          const price = Number(value);
          setPriceErrors((prev: any) => {
            const catErrors = prev[category]?.customJobs || [];
            const updatedErrors = [...catErrors];
            updatedErrors[idx] = price < 100 ? t("Price must be at least 100 PKR") : undefined;
            return {
              ...prev,
              [category]: {
                ...prev[category],
                customJobs: updatedErrors
              }
            };
          });
        }
  };

  const addCustomJob = (category: string) => {
    setJobsPricing((prev: any) => {
      const customJobs = prev[category]?.customJobs || [];
      return {
        ...prev,
        [category]: {
          ...prev[category],
          customJobs: [...customJobs, { job: "", price: "" }]
        }
      };
    });
  };

  const deleteCustomJob = (category: string, idx: number) => {
    setJobsPricing((prev: any) => {
      const customJobs = prev[category]?.customJobs || [];
      const updated = customJobs.filter((_: any, i: number) => i !== idx);
      return {
        ...prev,
        [category]: {
          ...prev[category],
          customJobs: updated
        }
      };
    });
  };

  const handleCnicFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCnicFront(e.target.files[0]);
    }
  };

  const handleCnicBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCnicBack(e.target.files[0]);
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.location) {
        toast({
          title: t("Missing Information"),
          description: t("Please fill in all required fields."),
          variant: "destructive",
        });
        return;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          title: t("Invalid Email"),
          description: t("Please enter a valid email address."),
          variant: "destructive",
        });
        return;
      }

      // Validate phone number (Pakistani format)
      const phoneRegex = /^(\+92|0)?[0-9]{10}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        toast({
          title: t("Invalid Phone Number"),
          description: t("Please enter a valid Pakistani phone number."),
          variant: "destructive",
        });
        return;
      }



      // Geocode the location if not already done by autocomplete
      let coordinates = locationCoordinates;
      if (formData.location && !locationCoordinates) {
        try {
          const coords = await geocodeAddress(formData.location);
          if (coords) {
            coordinates = { lat: coords.latitude, lng: coords.longitude };
            console.log("Geocoded location:", coords);
          }
        } catch (error) {
          console.error("Geocoding error:", error);
        }
      }
      
      setFinalLocationCoordinates(coordinates);

      setStep(2);
      return;
    }

    if (step === 2) {
      if (selectedServices.length === 0) {
        toast({
          title: t("No Services Selected"),
          description: t("Please select at least one service you offer."),
          variant: "destructive",
        });
        return;
      }

      // Validate pricing
      let hasErrors = false;
      const newPriceErrors: Record<string, Record<string, string>> = {};

      selectedServices.forEach((service: any) => {
        const cat = SERVICE_CATEGORIES.find(c => c.key === service.value);
        if (!cat) return;

        newPriceErrors[cat.key] = {};
        cat.jobs.forEach((job) => {
          const price = jobsPricing[cat.key]?.[job];
          if (!price || parseFloat(price) < 100) {
            newPriceErrors[cat.key][job] = t("Price must be at least 100 PKR");
            hasErrors = true;
          }
        });

        // Check custom jobs
        (jobsPricing[cat.key]?.customJobs || []).forEach((custom: any, idx: number) => {
          if (!custom.job.trim()) {
            newPriceErrors[cat.key][`custom_${idx}`] = t("Job name is required");
            hasErrors = true;
          }
          if (!custom.price || parseFloat(custom.price) < 100) {
            newPriceErrors[cat.key][`custom_price_${idx}`] = t("Price must be at least 100 PKR");
            hasErrors = true;
          }
        });
      });

      if (hasErrors) {
        setPriceErrors(newPriceErrors);
        toast({
          title: t("Pricing Errors"),
          description: t("Please fix the pricing errors before continuing."),
          variant: "destructive",
        });
        return;
      }

      setStep(3);
      return;
    }

    if (step === 3) {
      if (!cnicFront || !cnicBack || !profileImage) {
        toast({
          title: t("Missing Documents"),
          description: t("Please upload all required documents."),
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);

      try {
        console.log("=== PROVIDER APPLICATION SUBMISSION START ===");
        
        // Upload images
        console.log("🔄 Uploading images...");
        const cnicFrontUrl = await uploadImage(cnicFront, `cnic-front/${Date.now()}`);
        console.log("✅ CNIC Front URL:", cnicFrontUrl);
        
        const cnicBackUrl = await uploadImage(cnicBack, `cnic-back/${Date.now()}`);
        console.log("✅ CNIC Back URL:", cnicBackUrl);
        
        const profileImageUrl = await uploadImage(profileImage, `profile-images/${Date.now()}`);
        console.log("✅ Profile Image URL:", profileImageUrl);

        // Get current user
        console.log("🔄 Getting current user...");
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }
        console.log("✅ User authenticated:", user.id);

        // Prepare service category array (PostgreSQL array format)
        const serviceCategoryArray = selectedServices.map(service => service.value);
        
        // Prepare pending request data
        const pendingRequestData = {
          user_id: user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          experience: formData.experience,
          location: formData.location,
          latitude: finalLocationCoordinates?.lat || null,
          longitude: finalLocationCoordinates?.lng || null,
          bio: formData.about,
          service_category: serviceCategoryArray,
          cnic_front_url: cnicFrontUrl,
          cnic_back_url: cnicBackUrl,
          profile_image_url: profileImageUrl,
          status: 'pending'
        };
        
        console.log("📋 Pending request data to insert:", pendingRequestData);
        console.log("📍 Location coordinates:", finalLocationCoordinates);

        // Create pending request
        console.log("🔄 Creating pending request...");
        const { data: pendingRequest, error: pendingRequestError } = await supabase
          .from('pending_requests')
          .insert(pendingRequestData)
          .select()
          .single();

        console.log("Pending request insert response:", { pendingRequest, pendingRequestError });

        if (pendingRequestError) {
          console.error("❌ Pending request insert error:", pendingRequestError);
          console.error("Error details:", {
            message: pendingRequestError.message,
            details: pendingRequestError.details,
            hint: pendingRequestError.hint,
            code: pendingRequestError.code
          });
          throw pendingRequestError;
        }

        console.log("✅ Pending request created successfully:", pendingRequest);

        // Update pending request with service offerings and pricing
        console.log("🔄 Updating pending request with service offerings...");
        const jobsPricingData = {};
        
        for (const service of selectedServices) {
          const cat = SERVICE_CATEGORIES.find(c => c.key === service.value);
          if (!cat) {
            console.warn("⚠️ Service category not found:", service.value);
            continue;
          }
          
          jobsPricingData[cat.key] = jobsPricing[cat.key] || {};
          console.log("📋 Service pricing for category:", cat.key, jobsPricingData[cat.key]);
        }
        
        console.log("📋 All jobs pricing data:", jobsPricingData);

        const { error: updateError } = await supabase
          .from('pending_requests')
          .update({ 
            jobs_pricing: jobsPricingData 
          })
          .eq('id', pendingRequest.id);

        if (updateError) {
          console.error('❌ Error updating pending request with pricing:', updateError);
        } else {
          console.log("✅ Pending request updated with service offerings successfully");
        }

        console.log("=== PENDING REQUEST SUBMISSION SUCCESS ===");

        toast({
          title: t("Application Submitted!"),
          description: t("Your provider application has been submitted successfully and is pending review. We'll review it and get back to you soon."),
        });

        // Navigate to user dashboard after a delay (since they're not a provider yet)
        setTimeout(() => {
          navigate('/user-dashboard');
        }, 2000);

      } catch (error) {
        console.error('❌ Error submitting application:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        
        // Provide more specific error messages
        let errorMessage = t("Failed to submit application. Please try again.");
        
        if (error instanceof Error) {
          if (error.message === "User not authenticated") {
            errorMessage = t("Please log in to submit your application.");
            // Redirect to login
            setTimeout(() => {
              navigate('/user-login');
            }, 2000);
          } else if (error.message.includes("duplicate key")) {
            errorMessage = t("You have already submitted an application. Please contact support if you need to make changes.");
          } else if (error.message.includes("network") || error.message.includes("fetch")) {
            errorMessage = t("Network error. Please check your internet connection and try again.");
          } else if (error.message.includes("400")) {
            errorMessage = t("Invalid data provided. Please check your information and try again.");
          }
        }
        
        toast({
          title: t("Error"),
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const hasPriceErrors = Object.values(priceErrors).some((cat: any) => {
    if (!cat) return false;
    if (Array.isArray(cat.customJobs)) {
      if (cat.customJobs.some((err: any) => err)) return true;
    }
    return Object.values(cat).some((err: any) => err && err !== cat.customJobs);
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-hero-gradient">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-heading font-bold text-hero text-foreground mb-6">
              {t("JOIN OUR EXPERT NETWORK").split(' ').map((word, index) => (
                <span key={index}>
                  {word}
                  {index < 2 && <br />}
                </span>
              ))}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
              {t("Turn your skills into a thriving business")}. {t("Join thousands of professionals who've grown their income with UstaadOnCall")}.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" onClick={() => document.getElementById('application')?.scrollIntoView({ behavior: 'smooth' })}>
                {t("Start Your Application")}
              </Button>
              <Button variant="outline" size="lg" onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}>
                {t("Learn More")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-display text-foreground mb-4">
              {t("Why Choose UstaadOnCall?")}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t("We provide everything you need to succeed as a service professional")}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card 
                key={benefit.title} 
                className="p-6 text-center border-border bg-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-3">{t(benefit.title)}</h3>
                <p className="text-muted-foreground">{t(benefit.description)}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-display text-foreground mb-4">
              {t("Success by the Numbers")}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t("See how our providers are thriving")}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="font-heading font-bold text-5xl md:text-6xl text-primary mb-2">
                $2,500
              </div>
              <p className="text-lg text-muted-foreground font-medium">{t("Average Monthly Earnings")}</p>
            </div>
            
            <div>
              <div className="font-heading font-bold text-5xl md:text-6xl text-primary mb-2">
                15+
              </div>
              <p className="text-lg text-muted-foreground font-medium">{t("Jobs Per Week")}</p>
            </div>
            
            <div>
              <div className="font-heading font-bold text-5xl md:text-6xl text-primary mb-2">
                4.8★
              </div>
              <p className="text-lg text-muted-foreground font-medium">{t("Average Provider Rating")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-display text-foreground mb-4">
              {t("Requirements")}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t("What you need to get started")}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requirements.map((requirement, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-foreground">{t(requirement)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Section */}
      <section id="application" className="py-20 bg-card">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-display text-foreground mb-4">
              {t("Ready to Get Started?")}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t("Complete your application in just a few steps")}
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 border-border bg-background">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">{t("Checking authentication...")}</p>
                  </div>
                </div>
              ) : !isAuthenticated ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{t("Please log in to access the application form.")}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 && (
                  <>
                    <h3 className="text-xl font-bold mb-4">{t("Personal Information")}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                          {t("First Name")} *
                        </label>
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={handleChange}
                          className="bg-card border-border"
                          placeholder={t("Your first name")}
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                          {t("Last Name")} *
                        </label>
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={handleChange}
                          className="bg-card border-border"
                          placeholder={t("Your last name")}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                          {t("Email Address")} *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="bg-card border-border"
                          placeholder={t("your.email@example.com")}
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                          {t("Phone Number")} *
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          className="bg-card border-border"
                          placeholder={t("(555) 123-4567")}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="experience" className="block text-sm font-medium text-foreground mb-2">
                          {t("Years of Experience")} *
                        </label>
                        <select
                          id="experience"
                          name="experience"
                          required
                          value={formData.experience}
                          onChange={handleChange}
                          className="w-full h-10 px-3 bg-card border border-border rounded-md text-foreground"
                        >
                          <option value="">{t("Select experience")}</option>
                          <option value="1-2">{t("1-2 years")}</option>
                          <option value="3-5">{t("3-5 years")}</option>
                          <option value="6-10">{t("6-10 years")}</option>
                          <option value="10+">{t("10+ years")}</option>
                        </select>
                      </div>

                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                          {t("Service Area")} *
                        </label>
                        <GoogleMapsAutocomplete
                          value={formData.location}
                          onChange={handleLocationChange}
                          onLocationSelect={handleLocationSelect}
                          placeholder={t("City, State or ZIP code")}
                          label=""
                          required={true}
                          className=""
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="about" className="block text-sm font-medium text-foreground mb-2">
                        {t("Tell Us About Yourself")} *
                      </label>
                      <Textarea
                        id="about"
                        name="about"
                        required
                        value={formData.about}
                        onChange={handleChange}
                        className="bg-card border-border min-h-[120px]"
                        placeholder={t("Describe your experience, specialties, and what makes you a great service provider...")}
                      />
                    </div>
                  </>
                )}
                
                {step === 2 && (
                  <>
                    <h3 className="text-xl font-bold mb-4">{t("Services & Pricing")}</h3>
                    <div>
                      <label htmlFor="services" className="block text-sm font-medium text-foreground mb-2">
                        {t("Select Service(s) You Offer")} *
                      </label>
                      <Select
                        id="services"
                        isMulti
                        name="services"
                        options={SERVICE_CATEGORIES.filter(cat => cat.key !== "other").map(cat => ({ value: cat.key, label: t(cat.label) }))}
                        value={selectedServices}
                        onChange={(newValue) => setSelectedServices(newValue as any[])}
                        classNamePrefix="react-select"
                        placeholder={t("Select one or more services")}
                      />          
                    </div>
                    <div className="space-y-4">
                      {selectedServices.map((service: any) => {
                        const cat = SERVICE_CATEGORIES.find(c => c.key === service.value);
                        if (!cat) return null;
                        return (
                          <div key={cat.key} className="border p-4 rounded-md mb-4 mt-4">
                            <div className="font-semibold mb-2">{t(cat.label)} {t("Jobs & Pricing")}</div>
                            {cat.jobs.map((job) => (
                              <div key={job} className="flex items-center space-x-2">
                                <span className="w-48">{t(job)}</span>
                                <Input
                                  type="number"
                                  min="100"
                                  placeholder={t("Price (PKR)")}
                                  value={jobsPricing[cat.key]?.[job] || ""}
                                  onChange={e => handleJobPriceChange(cat.key, job, e.target.value)}
                                  className="w-32"
                                />
                                {priceErrors[cat.key]?.[job] && (
                                  <span className="text-red-500 text-xs ml-2">{t(priceErrors[cat.key][job])}</span>
                                )}
                              </div>
                            ))}
                            {/* Custom jobs */}
                            <div className="mt-2">
                              <Button type="button" size="sm" onClick={() => addCustomJob(cat.key)}>
                                + {t("Add Other Job")}
                              </Button>
                              {(jobsPricing[cat.key]?.customJobs || []).map((custom: any, idx: number) => (
                                <div key={idx} className="flex items-center space-x-2 mt-2">
                                  <Input
                                    type="text"
                                    placeholder={t("Job Name")}
                                    value={custom.job}
                                    onChange={e => handleCustomJobChange(cat.key, idx, "job", e.target.value)}
                                    className="w-48"
                                  />
                                  <Input
                                    type="number"
                                    min="100"
                                    placeholder={t("Price (PKR)")}
                                    value={custom.price}
                                    onChange={e => handleCustomJobChange(cat.key, idx, "price", e.target.value)}
                                    className="w-32"
                                  />
                                  <Button type="button" size="icon" variant="destructive" onClick={() => deleteCustomJob(cat.key, idx)}>
                                    ×
                                  </Button>
                                  {priceErrors[cat.key]?.customJobs?.[idx] && (
                                    <span className="text-red-500 text-xs ml-2">{t(priceErrors[cat.key].customJobs[idx])}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
                
                {step === 3 && (
                  <>
                    <h3 className="text-xl font-bold mb-4">{t("Identity Verification")}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">{t("CNIC Front Image")} *</label>
                        <input type="file" accept="image/*" required onChange={handleCnicFrontChange} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">{t("CNIC Back Image")} *</label>
                        <input type="file" accept="image/*" required onChange={handleCnicBackChange} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">{t("Profile Image")} *</label>
                        <input type="file" accept="image/*" required onChange={handleProfileImageChange} />
                      </div>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between mt-8">
                  {step > 1 && (
                    <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                      {t("Back")}
                    </Button>
                  )}
                  {step < 3 && (
                    <Button type="button" variant="default" onClick={() => setStep(step + 1)}>
                      {t("Next")}
                    </Button>
                  )}
                  {step === 3 && (
                    <Button type="submit" variant="default" size="lg" className="px-8" disabled={isSubmitting || hasPriceErrors}>
                      {isSubmitting ? t("Submitting...") : t("Submit")}
                    </Button>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground text-center">
                  {t("By submitting this application, you agree to our terms of service and privacy policy. We'll review your application within 48 hours.")}
                </p>
              </form>
            )}
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

async function uploadImage(file: File, path: string): Promise<string> {
  // Upload the file to the 'provider-uploads' bucket
  const { data, error } = await supabase.storage
    .from('provider-uploads')
    .upload(path, file, { upsert: true });

  if (error) throw error;

  // Get the public URL for the uploaded file
  const { publicUrl } = supabase
    .storage
    .from('provider-uploads')
    .getPublicUrl(path).data;

  return publicUrl || '';
}

export default BecomeProvider;