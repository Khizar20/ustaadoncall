import { Users, Shield, Award, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
// about hero uses solid brand-aligned background, no image overlay

const values = [
  {
    icon: Shield,
    title: "Trust & Safety",
    description: "Every provider is thoroughly vetted, background-checked, and insured for your peace of mind."
  },
  {
    icon: Award,
    title: "Quality Excellence", 
    description: "We maintain the highest standards through continuous training and customer feedback."
  },
  {
    icon: Heart,
    title: "Customer First",
    description: "Your satisfaction is our priority. We're here to ensure every experience exceeds expectations."
  },
  {
    icon: Users,
    title: "Community Impact",
    description: "Supporting local professionals while delivering exceptional service to our communities."
  }
];

const stats = [
  { number: "50,000+", label: "Happy Customers" },
  { number: "5,000+", label: "Verified Providers" },
  { number: "25+", label: "Service Categories" },
  { number: "4.9", label: "Average Rating" }
];

const About = () => {
  // Removed page-specific cursor follower; replaced by global cursor component

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundColor: '#FCFAF8'
          }}
        />
        {/* Decorative animated shapes */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -z-0 inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Subtle animated SVG grid */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#CC6E37" strokeOpacity="0.15" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <motion.div
            className="absolute right-10 top-10 w-40 h-40 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle at 30% 30%, rgba(204,110,55,0.10), transparent 60%)' }}
            animate={{ y: [0, -10, 0], x: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 12 }}
          />
          <motion.div
            className="absolute left-0 bottom-10 w-56 h-56 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle at 70% 70%, rgba(204,110,55,0.08), transparent 60%)' }}
            animate={{ y: [0, 12, 0], x: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 14 }}
          />
          {/* Global cursor handles page-wide cursor effects */}
        </motion.div>
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading font-light text-hero text-foreground mb-6">
              BUILDING.<br />
              TRUST.<br />
              TOGETHER.
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're revolutionizing local services by connecting communities with verified, premium professionals who care about quality as much as you do.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading font-bold text-display text-foreground mb-8 text-center">
              Our Story
            </h2>
            
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
              <p className="text-xl leading-relaxed">
                UstaadOnCall was born from a simple frustration: finding reliable, quality service providers shouldn't be a gamble. Too many people have experienced the disappointment of poor service, unreliable providers, or unexpected costs.
              </p>
              
              <p className="text-xl leading-relaxed">
                Founded in 2023, we set out to create a platform where trust comes first. Every provider on our platform undergoes rigorous verification, background checks, and skills assessment. We don't just connect you with service providers – we connect you with professionals who take pride in their craft.
              </p>
              
              <p className="text-xl leading-relaxed">
                Today, we're proud to serve thousands of customers across multiple cities, supporting local businesses while delivering the premium service experience our customers deserve. Our mission remains unchanged: to make quality local services accessible, reliable, and trustworthy for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-display text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={value.title} className="relative group" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-[hsl(22_65%_45%/0.35)] via-[hsl(22_65%_52%/0.35)] to-[hsl(22_65%_45%/0.35)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                <Card 
                  className="relative p-6 text-center border-border bg-background hover:shadow-elegant transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-display text-foreground mb-4">
              Growing Together
            </h2>
            <p className="text-xl text-muted-foreground">
              Numbers that reflect our commitment to excellence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="font-heading font-bold text-5xl md:text-6xl text-primary mb-2">
                  {stat.number}
                </div>
                <p className="text-lg text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-heading font-bold text-display text-primary-foreground mb-6">
              Our Mission
            </h2>
            <p className="text-xl md:text-2xl text-primary-foreground/90 leading-relaxed">
              To democratize access to premium local services by building a trusted ecosystem where skilled professionals and discerning customers can connect with confidence, creating lasting value for communities everywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-display text-foreground mb-4">
              Leadership Team
            </h2>
            <p className="text-xl text-muted-foreground">
              Meet the people building the future of local services
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary/70 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">KA</span>
              </div>
              <h3 className="font-semibold text-lg text-foreground">Khizar Ahmed</h3>
              <p className="text-primary">CEO & Founder</p>
              <p className="text-sm text-muted-foreground mt-2">
                Visionary leader driving innovation in local services platform
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary/70 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">UI</span>
              </div>
              <h3 className="font-semibold text-lg text-foreground">Umer Imran</h3>
              <p className="text-primary">CTO</p>
              <p className="text-sm text-muted-foreground mt-2">
                Tech expert with deep expertise in marketplace platforms and mobile applications
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary/70 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">AH</span>
              </div>
              <h3 className="font-semibold text-lg text-foreground">Ayesha Hissam</h3>
              <p className="text-primary">Head of Operations</p>
              <p className="text-sm text-muted-foreground mt-2">
                Operations specialist ensuring quality and efficiency across all services
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;