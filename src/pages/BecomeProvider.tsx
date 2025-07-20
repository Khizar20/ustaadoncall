import { useState } from "react";
import { CheckCircle, Star, Users, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { useToast } from "@/hooks/use-toast";

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

const BecomeProvider = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    service: "",
    experience: "",
    location: "",
    about: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Application Submitted!",
      description: "We'll review your application and get back to you within 48 hours.",
    });
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      service: "",
      experience: "",
      location: "",
      about: ""
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-hero-gradient">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-heading font-bold text-hero text-foreground mb-6">
              JOIN OUR<br />
              EXPERT<br />
              NETWORK
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Turn your skills into a thriving business. Join thousands of professionals who've grown their income with UstaadOnCall.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" onClick={() => document.getElementById('application')?.scrollIntoView({ behavior: 'smooth' })}>
                Start Your Application
              </Button>
              <Button variant="outline" size="lg" onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}>
                Learn More
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
              Why Choose UstaadOnCall?
            </h2>
            <p className="text-xl text-muted-foreground">
              We provide everything you need to succeed as a service professional
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
                <h3 className="font-semibold text-lg text-foreground mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
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
              Success by the Numbers
            </h2>
            <p className="text-xl text-muted-foreground">
              See how our providers are thriving
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="font-heading font-bold text-5xl md:text-6xl text-primary mb-2">
                $2,500
              </div>
              <p className="text-lg text-muted-foreground font-medium">Average Monthly Earnings</p>
            </div>
            
            <div>
              <div className="font-heading font-bold text-5xl md:text-6xl text-primary mb-2">
                15+
              </div>
              <p className="text-lg text-muted-foreground font-medium">Jobs Per Week</p>
            </div>
            
            <div>
              <div className="font-heading font-bold text-5xl md:text-6xl text-primary mb-2">
                4.8★
              </div>
              <p className="text-lg text-muted-foreground font-medium">Average Provider Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-heading font-bold text-display text-foreground mb-4">
                What We're Looking For
              </h2>
              <p className="text-xl text-muted-foreground">
                Our requirements ensure quality and safety for all customers
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requirements.map((requirement, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                  <span className="text-foreground">{requirement}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="application" className="py-20 bg-card">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading font-bold text-display text-foreground mb-4">
                Start Your Application
              </h2>
              <p className="text-xl text-muted-foreground">
                Take the first step towards growing your business with us
              </p>
            </div>
            
            <Card className="p-8 border-border bg-background">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                      First Name *
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="bg-card border-border"
                      placeholder="Your first name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                      Last Name *
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="bg-card border-border"
                      placeholder="Your last name"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-card border-border"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                      Phone Number *
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="bg-card border-border"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="service" className="block text-sm font-medium text-foreground mb-2">
                      Primary Service *
                    </label>
                    <select
                      id="service"
                      name="service"
                      required
                      value={formData.service}
                      onChange={handleChange}
                      className="w-full h-10 px-3 bg-card border border-border rounded-md text-foreground"
                    >
                      <option value="">Select a service</option>
                      <option value="plumbing">Plumbing</option>
                      <option value="electrical">Electrical</option>
                      <option value="beauty">Beauty & Wellness</option>
                      <option value="carwash">Car Wash</option>
                      <option value="cleaning">Home Cleaning</option>
                      <option value="appliance">Appliance Repair</option>
                      <option value="gardening">Gardening</option>
                      <option value="painting">Painting</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-foreground mb-2">
                      Years of Experience *
                    </label>
                    <select
                      id="experience"
                      name="experience"
                      required
                      value={formData.experience}
                      onChange={handleChange}
                      className="w-full h-10 px-3 bg-card border border-border rounded-md text-foreground"
                    >
                      <option value="">Select experience</option>
                      <option value="1-2">1-2 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="6-10">6-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                    Service Area *
                  </label>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    className="bg-card border-border"
                    placeholder="City, State or ZIP code"
                  />
                </div>
                
                <div>
                  <label htmlFor="about" className="block text-sm font-medium text-foreground mb-2">
                    Tell Us About Yourself *
                  </label>
                  <Textarea
                    id="about"
                    name="about"
                    required
                    value={formData.about}
                    onChange={handleChange}
                    className="bg-card border-border min-h-[120px]"
                    placeholder="Describe your experience, specialties, and what makes you a great service provider..."
                  />
                </div>
                
                <Button type="submit" variant="default" size="lg" className="w-full">
                  Submit Application
                </Button>
                
                <p className="text-sm text-muted-foreground text-center">
                  By submitting this application, you agree to our terms of service and privacy policy.
                  We'll review your application within 48 hours.
                </p>
              </form>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BecomeProvider;