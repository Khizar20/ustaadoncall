import { useState } from "react";
import { Search, Filter, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { Link } from "react-router-dom";
import { AnimatedPagination } from "@/components/ui/AnimatedPagination";

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

const providers = [
  {
    id: 1,
    name: "Ahmed Hassan",
    service: "Plumbing",
    rating: 4.9,
    reviews: 127,
    price: "Starting at $80",
    location: "Downtown",
    experience: "8 years",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "Maria Rodriguez", 
    service: "Beauty & Wellness",
    rating: 5.0,
    reviews: 89,
    price: "Starting at $60",
    location: "Midtown",
    experience: "5 years",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 3,
    name: "James Wilson",
    service: "Electrical",
    rating: 4.8,
    reviews: 156,
    price: "Starting at $100",
    location: "Uptown",
    experience: "12 years",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 4,
    name: "Sofia Chen",
    service: "Home Cleaning",
    rating: 4.9,
    reviews: 203,
    price: "Starting at $50",
    location: "Westside",
    experience: "6 years",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 5,
    name: "Carlos Mendez",
    service: "Car Wash",
    rating: 4.7,
    reviews: 74,
    price: "Starting at $30",
    location: "Eastside",
    experience: "4 years",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 6,
    name: "Lisa Thompson",
    service: "Appliance Repair",
    rating: 4.8,
    reviews: 98,
    price: "Starting at $90",
    location: "Central",
    experience: "7 years",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
  },
  // Additional providers for pagination demo
  {
    id: 7,
    name: "Bilal Khan",
    service: "Plumbing",
    rating: 4.6,
    reviews: 65,
    price: "Starting at $70",
    location: "Northside",
    experience: "3 years",
    image: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    id: 8,
    name: "Fatima Noor",
    service: "Beauty & Wellness",
    rating: 4.9,
    reviews: 120,
    price: "Starting at $55",
    location: "Southside",
    experience: "6 years",
    image: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    id: 9,
    name: "John Smith",
    service: "Electrical",
    rating: 4.7,
    reviews: 110,
    price: "Starting at $95",
    location: "Downtown",
    experience: "10 years",
    image: "https://randomuser.me/api/portraits/men/45.jpg"
  },
  {
    id: 10,
    name: "Ayesha Malik",
    service: "Home Cleaning",
    rating: 5.0,
    reviews: 140,
    price: "Starting at $60",
    location: "Midtown",
    experience: "8 years",
    image: "https://randomuser.me/api/portraits/women/65.jpg"
  },
  {
    id: 11,
    name: "Imran Qureshi",
    service: "Car Wash",
    rating: 4.8,
    reviews: 90,
    price: "Starting at $35",
    location: "Uptown",
    experience: "5 years",
    image: "https://randomuser.me/api/portraits/men/77.jpg"
  },
  {
    id: 12,
    name: "Sara Lee",
    service: "Appliance Repair",
    rating: 4.9,
    reviews: 105,
    price: "Starting at $85",
    location: "Central",
    experience: "9 years",
    image: "https://randomuser.me/api/portraits/women/12.jpg"
  },
  {
    id: 13,
    name: "Ali Raza",
    service: "Plumbing",
    rating: 4.5,
    reviews: 50,
    price: "Starting at $65",
    location: "Westside",
    experience: "2 years",
    image: "https://randomuser.me/api/portraits/men/13.jpg"
  },
  {
    id: 14,
    name: "Mehwish Tariq",
    service: "Beauty & Wellness",
    rating: 5.0,
    reviews: 130,
    price: "Starting at $70",
    location: "Eastside",
    experience: "7 years",
    image: "https://randomuser.me/api/portraits/women/22.jpg"
  }
];

const Services = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Services");
  const [page, setPage] = useState(0);
  const perPage = 12;

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All Services" || provider.service === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const paginatedProviders = filteredProviders.slice(page * perPage, (page + 1) * perPage);

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
                      src={provider.image}
                      alt={provider.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                        {provider.name}
                      </h3>
                      <p className="text-primary font-medium">{provider.service}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="text-sm font-medium text-foreground">{provider.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">({provider.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{provider.location}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Experience: {provider.experience}</p>
                    <p className="font-semibold text-foreground">{provider.price}</p>
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