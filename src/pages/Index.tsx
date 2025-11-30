import { Link } from "react-router-dom";
import { ArrowRight, Users, Shield, Clock, CheckCircle, Star, Lock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { motion, animate, useInView } from "framer-motion";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { useRef, useEffect, useState } from "react";
import { useLanguageContext } from "@/contexts/LanguageContext";

// Real-world task examples for ThoseJobs.com
const taskExamples = [
  { name: "Property Walkthroughs", description: "Verify property condition and take photos", bookings: "450+" },
  { name: "Local Pickups/Dropoffs", description: "Pick up or deliver items locally", bookings: "320+" },
  { name: "Site Verification", description: "Verify business locations and signage", bookings: "280+" },
  { name: "Lightbulb Changes", description: "Replace hard-to-reach lightbulbs", bookings: "190+" },
  { name: "Package Receiving", description: "Receive and secure packages at your location", bookings: "150+" },
  { name: "Document Delivery", description: "Hand-deliver important documents", bookings: "220+" },
];

// Testimonials content - Real-world task experiences
const testimonials = [
  {
    name: "David Martinez",
    rating: 5,
    text:
      "Needed a property walkthrough while I was out of town. The Gig Doer was thorough, sent detailed photos, and completed everything exactly as requested. Perfect for remote property management!",
    service: "Property Walkthrough",
  },
  {
    name: "Jennifer Kim",
    rating: 5,
    text:
      "Had an urgent document that needed to be hand-delivered across Houston. The worker picked it up within an hour and delivered it safely. Fast, reliable, and affordable!",
    service: "Document Delivery",
  },
  {
    name: "Robert Thompson",
    rating: 5,
    text:
      "Used ThoseJobs for a site verification task. The Gig Doer arrived on time, verified the business location, took all required photos, and submitted proof within the hour. Escrow payment made it worry-free!",
    service: "Site Verification",
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tj-cream/70 backdrop-blur text-[10px] md:text-xs font-medium border border-tj-cream/40">
                <span className="w-2 h-2 rounded-full bg-tj-blue"></span>
              Houston Area Only. Small Tasks, Local Hands.
              </div>
            <h1 className="mt-5 font-heading font-bold text-4xl md:text-6xl leading-[1.05] tracking-tight">
              Need THAT Job Done? Get Real-World Tasks Completed Today.
                </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                  The gig marketplace for physical, real-world tasks like property verifications, lightbulb changes, and local pickups. Completed by vetted Gig Doers in the Houston area.
                </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-full bg-tj-blue hover:bg-[#073a9e] text-white">
                    <Link to="/signup?role=worker">
                  I Want to DO Jobs <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full border-tj-cream text-foreground hover:bg-tj-cream/20" style={{ borderColor: '#F4E4C2' }}>
                    <Link to="/signup?role=client">I Need a Job DONE</Link>
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
            {[
              {icon:Shield,label:"Verified Gig Doers"},
              {icon:Clock,label:"On-Demand Scheduling"},
              {icon:Lock,label:"Secure, Escrow Payments"}
            ].map((b, i) => (
              <Card key={i} className="p-5 text-center">
                <b.icon className="h-6 w-6 text-tj-blue mx-auto" />
                <div className="mt-2 text-sm text-foreground font-medium">{b.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Examples of Real-World Tasks */}
      <section className="py-14 bg-card">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-heading font-bold text-3xl">Examples of Real-World Tasks</h2>
            <p className="text-muted-foreground mt-2">Physical tasks completed by verified Gig Doers in the Houston area</p>
            </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {taskExamples.map((task) => (
              <Card key={task.name} className="p-6 hover:shadow-elegant transition-shadow">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{task.name}</h3>
                  <CheckCircle className="h-5 w-5 text-tj-blue" />
                    </div>
                <p className="mt-2 text-sm text-muted-foreground">{task.description}</p>
                <div className="mt-4 text-xs text-tj-blue font-medium">{task.bookings} Completed</div>
                  </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="ghost" className="rounded-full border-tj-cream text-foreground hover:bg-tj-cream/20" style={{ borderColor: '#F4E4C2' }}>
              <Link to="/services">View All Tasks</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-14">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                title: "Post Your Job & Budget", 
                desc: "Create your task listing and set your budget. Funds are held securely in escrow until completion.",
                icon: DollarSign
              },
              { 
                title: "Worker Accepts & Completes", 
                desc: "A verified Gig Doer accepts your job, completes the task, and submits proof of completion.",
                icon: CheckCircle
              },
              { 
                title: "Approve & Payout", 
                desc: "Review the completed work. Once approved, payment is automatically split: 70% to Worker, 30% to Platform.",
                icon: Shield
              }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
              <Card key={index} className="p-6 text-center">
                <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-tj-blue/12 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-tj-blue" />
          </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
              </Card>
            )})}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-14">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-heading font-bold text-3xl">What Our Clients Say</h2>
            <p className="text-muted-foreground mt-2">Real experiences from Houston area clients who got their tasks done</p>
            </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((tItem, index) => (
              <ScrollReveal key={tItem.name} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 250, damping: 20 }}
                >
                  <Card className="p-6 h-full">
                    <div className="flex items-center gap-1 mb-3 text-tj-blue">
                      {[...Array(tItem.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-tj-blue text-tj-blue" />
                      ))}
                    </div>
                    <p className="text-sm text-foreground italic">“{tItem.text}”</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-medium">{tItem.name}</span>
                      <span className="text-xs text-tj-blue font-medium">{tItem.service}</span>
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
                   background: "linear-gradient(90deg, rgba(8,70,188,0.08) 0%, rgba(8,70,188,0.18) 50%, rgba(8,70,188,0.08) 100%)"
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
                <Button asChild size="lg" className="rounded-full bg-tj-blue hover:bg-[#073a9e] text-white">
                  <Link to="/signup?role=worker" className="inline-flex items-center">
                    I want to DO jobs
                    <motion.span
                      className="ml-2"
                      animate={{ x: [0, 6, 0] }}
                      transition={{ repeat: Infinity, duration: 1.6 }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.span>
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="rounded-full border-tj-cream text-foreground hover:bg-tj-cream/20" style={{ borderColor: '#F4E4C2' }}>
                  <Link to="/services">Browse Tasks</Link>
                </Button>
              </div>

              {/* trust notes */}
              <div className="mt-5 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="inline-flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-tj-blue" />
                  Verified Gig Doers
                </div>
                <div className="hidden sm:inline-flex items-center gap-2">
                  <Lock className="h-4 w-4 text-tj-blue" />
                  Escrow Payments
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
