import { useState, useEffect } from "react";
import { Search, Filter, Star, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { Link } from "react-router-dom";
import { AnimatedPagination } from "@/components/ui/AnimatedPagination";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

const serviceCategories = [
  "All Services",
  "Plumbing",
  "Electrical", 
  "Beauty & Wellness",
  "Car Wash",
  "Home Cleaning",
  "Appliance Repair",
  "Gardening",
  "Painting"
];

interface Provider {
  id: string;
  user_id: string;
  name: string;
  service_category: string;
  bio: string;
  experience: string;
  location: string;
  profile_image: string;
  is_verified: boolean;
  rating: number;
  reviews_count: number;
  jobs_pricing: Record<string, any[]>;
  created_at: string;
}

const Services = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Services");
  const [page, setPage] = useState(0);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const perPage = 12;
  const { toast } = useToast();

  // Fetch providers from Supabase
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch only verified providers
        const { data, error } = await supabase
          .from('providers')
          .select('*')
          .eq('is_verified', true)
          .order('rating', { ascending: false });

        if (error) {
          throw error;
        }

        setProviders(data || []);
      } catch (err: any) {
        console.error('Error fetching providers:', err);
        setError(err.message || 'Failed to fetch providers');
        toast({
          title: "Error",
          description: "Failed to load providers. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, [toast]);

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.service_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.bio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All Services" || 
                          provider.service_category.toLowerCase().includes(selectedCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  const paginatedProviders = filteredProviders.slice(page * perPage, (page + 1) * perPage);

  const getStartingPrice = (provider: Provider) => {
    if (!provider.jobs_pricing || typeof provider.jobs_pricing !== 'object') {
      return "Contact for pricing";
    }

    let minPrice = Infinity;
    Object.values(provider.jobs_pricing).forEach((services: any[]) => {
      if (Array.isArray(services)) {
        services.forEach((service: any) => {
          if (service.price && typeof service.price === 'number' && service.price < minPrice) {
            minPrice = service.price;
          }
        });
      }
    });

    return minPrice === Infinity ? "Contact for pricing" : `Starting at $${minPrice}`;
  };

  const getServiceCategories = (provider: Provider) => {
    if (!provider.service_category) return "General Services";
    return provider.service_category.split(',').map(cat => cat.trim()).join(', ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24">
          <div className="container mx-auto px-6 lg:px-8 py-12">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-lg">Loading providers...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24">
          <div className="container mx-auto px-6 lg:px-8 py-12">
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-hero-gradient">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="font-heading font-bold text-display text-foreground mb-4">
              Find Your Perfect Service Provider
            </h1>
            <p className="text-xl text-muted-foreground">
              Browse verified professionals in your area
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search for services or providers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg bg-card border-border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-card border-b border-border">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-4 overflow-x-auto">
            <Filter className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div className="flex gap-2">
              {serviceCategories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Providers Grid */}
      <section className="py-12">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedProviders.map((provider) => (
              <Card 
                key={provider.id} 
                className="overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 border-border bg-card group"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={provider.profile_image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"}
                      alt={provider.name}
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face";
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                        {provider.name}
                      </h3>
                      <p className="text-primary font-medium">{getServiceCategories(provider)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="text-sm font-medium text-foreground">
                            {provider.rating || 0}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({provider.reviews_count || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {provider.location || "Location not specified"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Experience: {provider.experience || "Not specified"}
                    </p>
                    <p className="font-semibold text-foreground">
                      {getStartingPrice(provider)}
                    </p>
                    {provider.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {provider.bio}
                      </p>
                    )}
                  </div>
                  
                  <Button variant="default" className="w-full" asChild>
                    <Link to={`/provider/${provider.id}`}>View Profile & Book</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          
          {filteredProviders.length > perPage && (
            <AnimatedPagination
              total={filteredProviders.length}
              perPage={perPage}
              current={page}
              onChange={setPage}
            />
          )}
          {filteredProviders.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">No providers found matching your search.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All Services");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;