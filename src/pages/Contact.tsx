import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden" style={{ backgroundColor: '#FCFAF8' }}>
        <div className="container mx-auto px-6 lg:px-8 relative">
          {/* Decorative animated shapes */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -z-10 inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Subtle animated SVG grid */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="gridContact" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#gridContact)" />
            </svg>
            <motion.div
              className="absolute right-10 top-10 w-40 h-40 rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle at 30% 30%, hsla(22,65%,45%,0.35), transparent 60%)' }}
              animate={{ y: [0, -10, 0], x: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 12 }}
            />
            <motion.div
              className="absolute left-0 bottom-10 w-56 h-56 rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle at 70% 70%, hsla(22,65%,45%,0.25), transparent 60%)' }}
              animate={{ y: [0, 12, 0], x: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 14 }}
            />
          </motion.div>
          <div className="text-center">
            <h1 className="font-heading font-light text-display text-foreground mb-4">
              Get In Touch
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're here to help. Reach out to us for support, partnerships, or any questions about our services.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="relative group">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-[hsl(22_65%_60%)] via-[hsl(22_65%_50%)] to-[hsl(22_65%_45%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
              <Card className="relative p-8 border-border bg-card hover:shadow-elegant transition-shadow">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-6">
                Send us a Message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-background border-border"
                      placeholder="Your full name"
                    />
                  </div>
                  
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
                      className="bg-background border-border"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                    Subject *
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="bg-background border-border"
                    placeholder="What's this about?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="bg-background border-border min-h-[120px]"
                    placeholder="Tell us how we can help..."
                  />
                </div>
                
                <Button type="submit" variant="default" size="lg" className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
                </form>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="font-heading font-bold text-2xl text-foreground mb-6">
                  Contact Information
                </h2>
                <p className="text-muted-foreground mb-8">
                  Choose the most convenient way to reach us. Our team is ready to assist you with any inquiries.
                </p>
              </div>

              <div className="space-y-6">
                <div className="relative group">
                  <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-[hsl(22_65%_60%)] via-[hsl(22_65%_50%)] to-[hsl(22_65%_45%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                  <Card className="relative p-6 border-border bg-card hover:shadow-elegant transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Phone Support</h3>
                      <p className="text-muted-foreground mb-2">Speak directly with our support team</p>
                      <p className="font-medium text-primary">+92 3180542026</p>
                    </div>
                  </div>
                  </Card>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-[hsl(22_65%_60%)] via-[hsl(22_65%_50%)] to-[hsl(22_65%_45%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                  <Card className="relative p-6 border-border bg-card hover:shadow-elegant transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Email Support</h3>
                      <p className="text-muted-foreground mb-2">Send us detailed inquiries</p>
                      <p className="font-medium text-primary">hello@ustaadonca­ll.com</p>
                    </div>
                  </div>
                  </Card>
                </div>



                <div className="relative group">
                  <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-[hsl(22_65%_60%)] via-[hsl(22_65%_50%)] to-[hsl(22_65%_45%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                  <Card className="relative p-6 border-border bg-card hover:shadow-elegant transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Business Hours</h3>
                      <p className="text-muted-foreground mb-2">When we're available</p>
                      <div className="font-medium text-foreground">
                        <p>Monday - Friday: 8:00 AM - 8:00 PM</p>
                        <p>Saturday: 9:00 AM - 6:00 PM</p>
                        <p>Sunday: 10:00 AM - 4:00 PM</p>
                      </div>
                    </div>
                  </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-light text-display text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Quick answers to common questions
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">How are providers verified?</h3>
                <p className="text-muted-foreground">
                  All providers undergo background checks, skills assessment, and insurance verification before joining our platform.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">What's included in the service fee?</h3>
                <p className="text-muted-foreground">
                  Our transparent pricing includes all labor, basic materials, and a satisfaction guarantee. Additional materials are quoted separately.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Can I reschedule my appointment?</h3>
                <p className="text-muted-foreground">
                  Yes, you can reschedule up to 4 hours before your appointment through your account dashboard or by calling our support team.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">What if I'm not satisfied?</h3>
                <p className="text-muted-foreground">
                  We offer a 100% satisfaction guarantee. If you're not happy with the service, we'll make it right or provide a full refund.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">How do I become a provider?</h3>
                <p className="text-muted-foreground">
                  Visit our "Become a Provider" page to start the application process. We'll guide you through verification and onboarding.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Do you offer emergency services?</h3>
                <p className="text-muted-foreground">
                  Yes, we have 24/7 emergency services available for plumbing, electrical, and other urgent repairs. Additional fees may apply.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;