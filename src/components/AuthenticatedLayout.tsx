import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  User,
  Settings,
  LogOut,
  Home,
  FileText,
  Bell,
  ChevronDown,
  Menu,
  X as CloseIcon
} from "lucide-react";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  isProvider?: boolean;
  providerId?: string;
}

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isProvider, setIsProvider] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Token management
  const TOKEN_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds

  useEffect(() => {
    const checkAuth = () => {
      const storedUserInfo = localStorage.getItem('user_info');
      const storedToken = localStorage.getItem('user_token');
      const tokenData = localStorage.getItem('user_token_data');

      if (!storedUserInfo || !storedToken || !tokenData) {
        // Only redirect to login if not already on login/register pages
        if (!location.pathname.includes('/user-login') && 
            !location.pathname.includes('/user-register') &&
            !location.pathname.includes('/reset-password')) {
          navigate('/user-login');
        }
        setIsLoading(false);
        return;
      }

      // Check token expiry
      const { timestamp } = JSON.parse(tokenData);
      const now = Date.now();
      if (now - timestamp > TOKEN_EXPIRY) {
        handleLogout();
        return;
      }

      const userData = JSON.parse(storedUserInfo);
      setUserInfo(userData);
      
      // Check if user is also a provider
      if (userData.isProvider && userData.providerId) {
        setIsProvider(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate, location.pathname]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Close user menu if clicking outside
      if (showUserMenu && !target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
      
      // Close mobile menu if clicking outside
      if (showMobileMenu && !target.closest('.mobile-menu')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu, showMobileMenu]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('user_token');
      localStorage.removeItem('user_token_data');
      localStorage.removeItem('user_info');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate('/user-login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Don't show header on login/register pages
  const shouldShowHeader = !location.pathname.includes('/user-login') && 
                          !location.pathname.includes('/user-register') &&
                          !location.pathname.includes('/reset-password');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation Bar - Only show if user is authenticated and not on auth pages */}
      {shouldShowHeader && userInfo && (
        <header className="border-b bg-card shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo and Main Navigation */}
              <div className="flex items-center gap-8">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-xl">UstaadOnCall</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                  <Link 
                    to="/" 
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === '/' 
                        ? 'text-primary' 
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/services" 
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === '/services' 
                        ? 'text-primary' 
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    Services
                  </Link>
                  <Link 
                    to="/about" 
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === '/about' 
                        ? 'text-primary' 
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    About
                  </Link>
                  <Link 
                    to="/contact" 
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === '/contact' 
                        ? 'text-primary' 
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    Contact
                  </Link>
                </nav>
              </div>

              {/* User Menu and Actions */}
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">3</Badge>
                </Button>

                {/* User Menu */}
                <div className="relative user-menu">
                  <Button
                    variant="ghost"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium">
                      {userInfo.name}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-card border rounded-lg shadow-lg z-50"
                    >
                      <div className="p-4 border-b">
                        <p className="font-medium">{userInfo.name}</p>
                        <p className="text-sm text-muted-foreground">{userInfo.email}</p>
                      </div>
                      <div className="p-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            navigate('/user-dashboard');
                            setShowUserMenu(false);
                          }}
                        >
                          <User className="w-4 h-4 mr-2" />
                          Dashboard
                        </Button>
                        {isProvider && (
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => navigate('/provider-dashboard')}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Provider Dashboard
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-red-600 hover:text-red-700"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden mobile-menu"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                >
                  {showMobileMenu ? <CloseIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {showMobileMenu && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t py-4 mobile-menu"
              >
                <nav className="flex flex-col gap-2">
                  <Link 
                    to="/" 
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      location.pathname === '/' 
                        ? 'text-primary' 
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/services" 
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      location.pathname === '/services' 
                        ? 'text-primary' 
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Services
                  </Link>
                  <Link 
                    to="/about" 
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      location.pathname === '/about' 
                        ? 'text-primary' 
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    About
                  </Link>
                  <Link 
                    to="/contact" 
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      location.pathname === '/contact' 
                        ? 'text-primary' 
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Contact
                  </Link>
                </nav>
              </motion.div>
            )}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
};

export default AuthenticatedLayout; 