import { Link } from "react-router-dom";
import { Star, ArrowRight, Users, Shield, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { AnimatedBackground, MouseFollower } from "@/components/ui/animated-background";
import { ScrollReveal, StaggeredReveal } from "@/components/ui/scroll-reveal";
import { ParallaxSection, BackgroundParallax } from "@/components/ui/parallax-section";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
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
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const titleVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <AnimatedBackground />
      <Navigation />
      
      {/* Hero Section */}
      <BackgroundParallax
        imageSrc={heroImage}
        speed={0.3}
        className="pt-16 min-h-screen flex items-center"
      >
        <motion.div 
          ref={heroRef}
          style={{ y: heroY, opacity: heroOpacity }}
          className="container mx-auto px-6 lg:px-8 relative z-10"
        >
          <MouseFollower>
            <div className="max-w-4xl">
              <div className="overflow-hidden">
                {["TRUSTED.", "LOCAL.", "EXPERTS."].map((word, i) => (
                  <motion.h1
                    key={word}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.3 + i * 0.2,
                      duration: 0.8,
                      ease: "easeOut"
                    }}
                    className="font-heading font-black text-hero text-foreground leading-none"
                  >
                    {word}
                    {i < 2 && <br />}
                  </motion.h1>
                ))}
              </div>
              
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mt-6"
              >
                Book verified professionals for all your service needs. Premium quality delivered to your doorstep.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button variant="hero" size="lg" asChild>
                    <Link to="/services">
                      Book a Trusted Expert
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </motion.div>
                    </Link>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/become-provider">Become a Provider</Link>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </MouseFollower>
        </motion.div>
      </BackgroundParallax>

      {/* Services Grid */}
      <section className="py-20 bg-card relative">
        <div className="container mx-auto px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-heading font-bold text-display text-foreground mb-4">
                Premium Services
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                From home repairs to personal care, our vetted professionals deliver excellence every time.
              </p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ScrollReveal key={service.name} delay={index * 0.1}>
                <motion.div
                  whileHover={{ 
                    y: -8, 
                    scale: 1.02,
                    rotateY: 5,
                    rotateX: 5
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="p-6 border-border bg-background group cursor-pointer transform-gpu hover:shadow-elegant transition-shadow duration-300 h-full">
                    <div className="text-center">
                      <motion.h3 
                        className="font-semibold text-xl text-foreground mb-2 group-hover:text-primary transition-colors"
                        whileHover={{ scale: 1.05 }}
                      >
                        {service.name}
                      </motion.h3>
                      <p className="text-muted-foreground mb-4">{service.description}</p>
                      <motion.div 
                        className="text-sm text-primary font-medium"
                        whileHover={{ scale: 1.1 }}
                      >
                        {service.bookings} bookings
                      </motion.div>
                    </div>
                  </Card>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <ParallaxSection speed={0.2} className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-heading font-bold text-display text-foreground mb-4">
                How It Works
              </h2>
              <p className="text-xl text-muted-foreground">Three simple steps to premium service</p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: "1", title: "Choose Your Service", desc: "Browse our categories and select the service you need" },
              { step: "2", title: "Book Your Expert", desc: "Select from verified professionals and schedule your appointment" },
              { step: "3", title: "Enjoy Premium Service", desc: "Relax while our experts deliver exceptional results" }
            ].map((item, index) => (
              <ScrollReveal key={item.step} delay={index * 0.2}>
                <motion.div 
                  className="text-center"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div 
                    className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 relative overflow-hidden"
                    whileHover={{ 
                      scale: 1.1,
                      boxShadow: "0 0 30px rgba(255, 138, 122, 0.4)"
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-primary/20 rounded-full"
                      animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                    />
                    <span className="text-2xl font-bold text-primary-foreground relative z-10">{item.step}</span>
                  </motion.div>
                  <h3 className="font-semibold text-xl text-foreground mb-4">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </ParallaxSection>

      {/* Trust Indicators */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Users, value: "5000+", label: "Verified Professionals" },
              { icon: Shield, value: "100%", label: "Background Checked" },
              { icon: Clock, value: "24/7", label: "Customer Support" }
            ].map((item, index) => (
              <ScrollReveal key={item.label} delay={index * 0.2}>
                <motion.div 
                  className="space-y-4"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    whileHover={{ 
                      scale: 1.2, 
                      rotate: 10,
                      color: "rgb(255, 138, 122)"
                    }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <item.icon className="h-12 w-12 text-primary mx-auto" />
                  </motion.div>
                  <motion.h3 
                    className="font-semibold text-2xl text-foreground"
                    whileHover={{ scale: 1.1 }}
                  >
                    {item.value}
                  </motion.h3>
                  <p className="text-muted-foreground">{item.label}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-heading font-bold text-display text-foreground mb-4">
                What Our Customers Say
              </h2>
              <p className="text-xl text-muted-foreground">Real experiences from real customers</p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <ScrollReveal key={index} delay={index * 0.15}>
                <motion.div
                  whileHover={{ 
                    y: -8, 
                    scale: 1.03,
                    rotateY: 3 
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="p-6 border-border bg-card h-full transform-gpu hover:shadow-elegant transition-shadow duration-300">
                    <div className="mb-4">
                      <motion.div 
                        className="flex space-x-1 mb-2"
                        whileHover={{ scale: 1.1 }}
                      >
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ rotate: 0 }}
                            whileHover={{ rotate: 180 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <Star className="h-4 w-4 fill-primary text-primary" />
                          </motion.div>
                        ))}
                      </motion.div>
                      <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <motion.p 
                        className="text-sm text-primary"
                        whileHover={{ scale: 1.05 }}
                      >
                        {testimonial.service}
                      </motion.p>
                    </div>
                  </Card>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 opacity-10"
          animate={{ 
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px"
          }}
        />
        <div className="container mx-auto px-6 lg:px-8 text-center relative z-10">
          <ScrollReveal>
            <motion.h2 
              className="font-heading font-bold text-display text-primary-foreground mb-6"
              whileHover={{ scale: 1.05 }}
            >
              Ready to Experience Premium Service?
            </motion.h2>
            <motion.p 
              className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto"
              whileHover={{ scale: 1.02 }}
            >
              Join thousands of satisfied customers who trust UstaadOnCall for their service needs.
            </motion.p>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button variant="secondary" size="lg" asChild>
                <Link to="/services">
                  Get Started Today
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </motion.div>
                </Link>
              </Button>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
