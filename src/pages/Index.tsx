import { Link } from "react-router-dom";
import { ArrowRight, Users, Shield, Clock, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { motion, animate, useInView } from "framer-motion";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { useRef, useEffect, useState } from "react";
import { useLanguageContext } from "@/contexts/LanguageContext";

const services = [
  { name: "Plumbing", description: "Professional plumbing services", bookings: "1200+" },
  { name: "Electrical", description: "Licensed electricians", bookings: "800+" },
  { name: "Beauty & Wellness", description: "Premium beauty services", bookings: "2000+" },
  { name: "Car Wash", description: "Mobile car care", bookings: "500+" },
  { name: "Home Cleaning", description: "Deep cleaning experts", bookings: "1500+" },
  { name: "Appliance Repair", description: "Fix any appliance", bookings: "600+" },
];

// Testimonials content
const testimonials = [
  {
    name: "Sarah Johnson",
    rating: 5,
    text:
      "Exceptional service! The plumber arrived on time and fixed my issue perfectly. Will definitely use again.",
    service: "Plumbing",
  },
  {
    name: "Michael Chen",
    rating: 5,
    text:
      "Professional, reliable, and affordable. The beauty service at home was exactly what I needed.",
    service: "Beauty & Wellness",
  },
  {
    name: "Emily Rodriguez",
    rating: 5,
    text:
      "Amazing experience! The car wash service was thorough and convenient. Highly recommend.",
    service: "Car Wash",
  },
];

// Animated number ticker for counters (starts when in view)
const NumberTicker = ({ from = 0, to = 1000, duration = 1.2 }: { from?: number; to: number; duration?: number }) => {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(from, to, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setValue(Math.floor(v)),
    });
    return () => controls.stop();
  }, [isInView, from, to, duration]);

  return (
    <span ref={ref} aria-label={`${to}`} role="text">
      {value.toLocaleString()}
    </span>
  );
};

const Index = () => {
  const { t } = useLanguageContext();

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <Navigation />
      
      {/* Minimal Hero */}
      <section className="pt-24 md:pt-28 pb-16">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur text-[10px] md:text-xs font-medium border border-white/40">
                <span className="w-2 h-2 rounded-full bg-[hsl(22_65%_45%)]"></span>
              {t("Trusted Ustaads Near You")}
              </div>
            <h1 className="mt-5 font-heading font-light text-4xl md:text-6xl leading-[1.05] tracking-tight">
              {t("Trusted local experts, on demand")}.
                </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                  {t("Book verified professionals for home repairs, grooming, cleaning, and more — delivered to your doorstep.")}
                </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-full bg-[hsl(22_65%_45%)] hover:bg-[hsl(22_65%_40%)]">
                    <Link to="/services">
                  {t("Book a Service")} <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full">
                    <Link to="/become-provider">{t("Become a Provider")}</Link>
                  </Button>
                </div>

            {/* Mini-stats */}
            <div className="mt-8 grid grid-cols-3 gap-2 max-w-md mx-auto text-center">
                {[
                  { label: t("Bookings"), value: 12000 },
                  { label: t("Providers"), value: 5000 },
                  { label: t("Satisfaction"), value: 100, suffix: '%' },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border bg-white/60 backdrop-blur p-3">
                  <div className="text-xl font-semibold"><NumberTicker to={item.value} />{item.suffix || '+'}</div>
                  <div className="text-[10px] text-muted-foreground">{item.label}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Simple benefits */}
      <section className="py-10">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[{icon:Shield,label:t("Background Checked")},{icon:Clock,label:t("24/7")},{icon:Users,label:t("Verified Professionals")}].map((b, i) => (
              <Card key={i} className="p-5 text-center">
                <b.icon className="h-6 w-6 text-primary mx-auto" />
                <div className="mt-2 text-sm text-foreground">{b.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services (minimal grid) */}
      <section className="py-14 bg-card">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-heading font-light text-3xl">{t("Trusted Ustaads Near You")}</h2>
            <p className="text-muted-foreground mt-2">{t("From home repairs to personal care, our vetted professionals deliver excellence every time.")}</p>
            </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.slice(0,6).map((service) => (
              <Card key={service.name} className="p-6 hover:shadow-elegant transition-shadow">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">{service.name}</h3>
                  <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>
                <div className="mt-4 text-xs text-primary">{service.bookings} {t("Bookings")}</div>
                  </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="ghost" className="rounded-full">
              <Link to="/services">{t("View All")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works (minimal) */}
      <section className="py-14">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: t("Choose Your Service"), desc: t("Browse our categories and select the service you need") },
              { title: t("Book Your Expert"), desc: t("Select from verified professionals and schedule your appointment") },
              { title: t("Enjoy Premium Service"), desc: t("Relax while our experts deliver exceptional results") }
            ].map((item, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-[hsl(22_65%_45%/0.12)] flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-[hsl(22_65%_45%)]" />
          </div>
                <h3 className="text-lg font-medium">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-14">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-heading font-light text-3xl">What Our Customers Say</h2>
            <p className="text-muted-foreground mt-2">Real experiences from real customers</p>
            </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((tItem, index) => (
              <ScrollReveal key={tItem.name} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 250, damping: 20 }}
                >
                  <Card className="p-6 h-full">
                    <div className="flex items-center gap-1 mb-3 text-primary">
                      {[...Array(tItem.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm text-foreground italic">“{tItem.text}”</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-medium">{tItem.name}</span>
                      <span className="text-xs text-primary">{tItem.service}</span>
                    </div>
                  </Card>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Removed multi-card testimonials for minimal look */}

      {/* CTA (refined) */}
      <section className="py-16">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border bg-white/70 backdrop-blur p-8 md:p-12">
            {/* soft brand ribbon */}
            <div className="pointer-events-none absolute -top-20 -right-24 -left-24 h-48 rotate-[-3deg]"
                 style={{
                   background: "linear-gradient(90deg, rgba(204,110,55,0.08) 0%, rgba(204,110,55,0.18) 50%, rgba(204,110,55,0.08) 100%)"
                 }}
            />

            <div className="relative text-center">
              <h2 className="font-heading font-light text-3xl md:text-4xl tracking-tight">
                {t("Ready to book?")}
              </h2>
              <p className="mt-2 text-base md:text-lg text-muted-foreground">
                {t("It only takes a minute to schedule a pro.")}
              </p>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild size="lg" className="rounded-full bg-[#CC6E37] hover:bg-[#b96030]">
                  <Link to="/services" className="inline-flex items-center">
                    {t("Book a Service")}
                    <motion.span
                      className="ml-2"
                      animate={{ x: [0, 6, 0] }}
                      transition={{ repeat: Infinity, duration: 1.6 }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.span>
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="rounded-full">
                  <Link to="/services">{t("Browse Services")}</Link>
                </Button>
              </div>

              {/* trust notes */}
              <div className="mt-5 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="inline-flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  {t("Background Checked")}
                </div>
                <div className="hidden sm:inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  {t("24/7")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
