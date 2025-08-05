import { Users, Shield, Award, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import aboutBg from "@/assets/about-bg.jpg";

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
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(29, 191, 115, 0.85), rgba(25, 163, 102, 0.85)), url(${aboutBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading font-bold text-hero text-foreground mb-6">
              BUILDING.<br />
              TRUST.<br />
              TOGETHER.
            </h1>
            <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto font-medium">
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
              <Card 
                key={value.title} 
                className="p-6 text-center border-border bg-background hover:shadow-elegant transition-all duration-300 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </Card>
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