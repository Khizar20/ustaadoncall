import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-xl text-foreground">UstaadOnCall</h3>
            <p className="text-muted-foreground">
              Premium local services delivered by trusted professionals. Your convenience, our priority.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
              <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
              <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <nav className="flex flex-col space-y-2">
              <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">
                Our Services
              </Link>
              <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                About Us
              </Link>
              <Link to="/become-provider" className="text-muted-foreground hover:text-primary transition-colors">
                Become a Provider
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </nav>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Popular Services</h4>
            <nav className="flex flex-col space-y-2">
              <span className="text-muted-foreground">Plumbing</span>
              <span className="text-muted-foreground">Electrical</span>
              <span className="text-muted-foreground">Beauty & Wellness</span>
              <span className="text-muted-foreground">Car Wash</span>
              <span className="text-muted-foreground">Home Cleaning</span>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">hello@ustaadonca­ll.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Your City, Your State</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            © 2024 UstaadOnCall. All rights reserved. Premium local services platform.
          </p>
        </div>
      </div>
    </footer>
  );
}