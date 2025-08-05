import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Brand */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="font-heading font-bold text-lg md:text-xl text-foreground">UstaadOnCall</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Premium local services delivered by trusted professionals. Your convenience, our priority.
            </p>
            <div className="flex space-x-3 md:space-x-4">
              <Facebook className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
              <Instagram className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
              <Twitter className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="font-semibold text-foreground text-sm md:text-base">Quick Links</h4>
            <nav className="flex flex-col space-y-1 md:space-y-2">
              <Link to="/services" className="text-sm md:text-base text-muted-foreground hover:text-primary transition-colors">
                Our Services
              </Link>
              <Link to="/about" className="text-sm md:text-base text-muted-foreground hover:text-primary transition-colors">
                About Us
              </Link>
              <Link to="/become-provider" className="text-sm md:text-base text-muted-foreground hover:text-primary transition-colors">
                Become a Provider
              </Link>
              <Link to="/contact" className="text-sm md:text-base text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </nav>
          </div>

          {/* Services */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="font-semibold text-foreground text-sm md:text-base">Popular Services</h4>
            <nav className="flex flex-col space-y-1 md:space-y-2">
              <span className="text-sm md:text-base text-muted-foreground">Plumbing</span>
              <span className="text-sm md:text-base text-muted-foreground">Electrical</span>
              <span className="text-sm md:text-base text-muted-foreground">Beauty & Wellness</span>
              <span className="text-sm md:text-base text-muted-foreground">Car Wash</span>
              <span className="text-sm md:text-base text-muted-foreground">Home Cleaning</span>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="font-semibold text-foreground text-sm md:text-base">Contact Info</h4>
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                <span className="text-sm md:text-base text-muted-foreground">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                <span className="text-sm md:text-base text-muted-foreground">hello@ustaadonca­ll.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                <span className="text-sm md:text-base text-muted-foreground">Your City, Your State</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-6 md:mt-8 pt-6 md:pt-8 text-center">
          <p className="text-xs md:text-sm text-muted-foreground">
            © 2024 UstaadOnCall. All rights reserved. Premium local services platform.
          </p>
        </div>
      </div>
    </footer>
  );
}