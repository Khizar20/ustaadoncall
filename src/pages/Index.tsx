import { Link } from "react-router-dom";
import { Star, ArrowRight, Users, Shield, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import heroImage from "@/assets/hero-services.jpg";

const services = [
  { name: "Plumbing", description: "Professional plumbing services", bookings: "1200+" },
  { name: "Electrical", description: "Licensed electricians", bookings: "800+" },
  { name: "Beauty & Wellness", description: "Premium beauty services", bookings: "2000+" },
  { name: "Car Wash", description: "Mobile car care", bookings: "500+" },
  { name: "Home Cleaning", description: "Deep cleaning experts", bookings: "1500+" },
  { name: "Appliance Repair", description: "Fix any appliance", bookings: "600+" },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    rating: 5,
    text: "Exceptional service! The plumber arrived on time and fixed my issue perfectly. Will definitely use again.",
    service: "Plumbing"
  },
  {
    name: "Michael Chen",
    rating: 5,
    text: "Professional, reliable, and affordable. The beauty service at home was exactly what I needed.",
    service: "Beauty & Wellness"
  },
  {
    name: "Emily Rodriguez",
    rating: 5,
    text: "Amazing experience! The car wash service was thorough and convenient. Highly recommend.",
    service: "Car Wash"
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-16 min-h-screen flex items-center">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(38, 56, 46, 0.8), rgba(38, 56, 46, 0.8)), url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            <h1 className="font-heading font-black text-hero text-foreground mb-6 animate-fade-up">
              TRUSTED.<br />
              LOCAL.<br />
              EXPERTS.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl animate-fade-up">
              Book verified professionals for all your service needs. Premium quality delivered to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up">
              <Button variant="hero" size="lg" asChild>
                <Link to="/services">
                  Book a Trusted Expert
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/become-provider">Become a Provider</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-display text-foreground mb-4">
              Premium Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From home repairs to personal care, our vetted professionals deliver excellence every time.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card 
                key={service.name} 
                className="p-6 hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 border-border bg-background group cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-center">
                  <h3 className="font-semibold text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <div className="text-sm text-primary font-medium">{service.bookings} bookings</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-display text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground">Three simple steps to premium service</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-4">Choose Your Service</h3>
              <p className="text-muted-foreground">Browse our categories and select the service you need</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">2</span>
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-4">Book Your Expert</h3>
              <p className="text-muted-foreground">Select from verified professionals and schedule your appointment</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">3</span>
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-4">Enjoy Premium Service</h3>
              <p className="text-muted-foreground">Relax while our experts deliver exceptional results</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4">
              <Users className="h-12 w-12 text-primary mx-auto" />
              <h3 className="font-semibold text-2xl text-foreground">5000+</h3>
              <p className="text-muted-foreground">Verified Professionals</p>
            </div>
            
            <div className="space-y-4">
              <Shield className="h-12 w-12 text-primary mx-auto" />
              <h3 className="font-semibold text-2xl text-foreground">100%</h3>
              <p className="text-muted-foreground">Background Checked</p>
            </div>
            
            <div className="space-y-4">
              <Clock className="h-12 w-12 text-primary mx-auto" />
              <h3 className="font-semibold text-2xl text-foreground">24/7</h3>
              <p className="text-muted-foreground">Customer Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-display text-foreground mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-muted-foreground">Real experiences from real customers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 border-border bg-card">
                <div className="mb-4">
                  <div className="flex space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-primary">{testimonial.service}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-display text-primary-foreground mb-6">
            Ready to Experience Premium Service?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust UstaadOnCall for their service needs.
          </p>
          <Button variant="secondary" size="lg" asChild>
            <Link to="/services">
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
