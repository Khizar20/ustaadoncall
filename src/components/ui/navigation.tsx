import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, FileText, ChevronDown, Sparkles, Home, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

const navigationItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Services", href: "/services", icon: Sparkles },
  { name: "About", href: "/about", icon: Shield },
  { name: "Contact", href: "/contact", icon: Settings },
];

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

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isProvider, setIsProvider] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Token management
  const TOKEN_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds

  useEffect(() => {
    const checkAuth = () => {
      const storedUserInfo = localStorage.getItem('user_info');
      const storedToken = localStorage.getItem('user_token');
      const tokenData = localStorage.getItem('user_token_data');

      if (!storedUserInfo || !storedToken || !tokenData) {
        setUserInfo(null);
        setIsProvider(false);
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
    };

    checkAuth();
  }, [location.pathname]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showUserMenu && !target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('user_token');
      localStorage.removeItem('user_token_data');
      localStorage.removeItem('user_info');
      setUserInfo(null);
      setIsProvider(false);
      setShowUserMenu(false);
      navigate('/user-login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled 
          ? "bg-white/95 backdrop-blur-xl border-b border-green-200 shadow-xl" 
          : "bg-white/90 backdrop-blur-lg border-b border-green-100"
      )}
    >
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center"
          >
            <Link 
              to="/" 
              className="flex items-center gap-3 group"
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400/30 to-green-500/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-2xl bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                  UstaadOnCall
                </span>
                <span className="text-xs text-green-600 font-medium -mt-1">Premium Services</span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="hidden lg:flex items-center space-x-1"
          >
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                  className="relative group"
                >
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden",
                      location.pathname === item.href
                        ? "text-green-600 bg-green-50 shadow-md border border-green-200" 
                        : "text-slate-800 hover:text-green-600 hover:bg-green-50"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-green-100 to-green-50 rounded-xl"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Desktop User Menu or Login Buttons */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="hidden lg:flex items-center gap-3"
          >
            {userInfo ? (
              // User is logged in - show user menu
              <div className="relative user-menu">
                <Button
                  variant="ghost"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-green-50 transition-all duration-300 border border-transparent hover:border-green-200"
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-400/30 to-green-500/30 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold text-slate-800">
                      {userInfo.name}
                    </span>
                    <span className="text-xs text-green-600 font-medium">
                      {isProvider ? "Provider" : "User"}
                    </span>
                  </div>
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-transform duration-200 text-slate-600",
                    showUserMenu ? "rotate-180" : ""
                  )} />
                </Button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-72 bg-white border border-green-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-6 border-b border-green-100 bg-gradient-to-r from-green-50 to-green-100/50">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{userInfo.name}</p>
                            <p className="text-sm text-green-600">{userInfo.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-3 p-3 rounded-xl hover:bg-green-50 text-slate-700"
                          onClick={() => {
                            navigate('/user-dashboard');
                            setShowUserMenu(false);
                          }}
                        >
                          <User className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Button>
                        {isProvider && (
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 p-3 rounded-xl hover:bg-green-50 text-slate-700"
                            onClick={() => {
                              navigate('/provider-dashboard');
                              setShowUserMenu(false);
                            }}
                          >
                            <FileText className="w-4 h-4" />
                            <span>Provider Dashboard</span>
                          </Button>
                        )}
                        <div className="border-t border-green-100 my-2"></div>
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-3 p-3 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // User is not logged in - show login buttons
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="outline" size="sm" asChild className="rounded-xl border-green-300 hover:border-green-500 text-green-600 hover:text-green-700 hover:bg-green-50">
                    <Link to="/user-login">User Login</Link>
                  </Button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.85, duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="outline" size="sm" asChild className="rounded-xl border-green-300 hover:border-green-500 text-green-600 hover:text-green-700 hover:bg-green-50">
                    <Link to="/provider-login">Provider Login</Link>
                  </Button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9, duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="sm" asChild className="rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg text-white">
                    <Link to="/become-provider">Become Provider</Link>
                  </Button>
                </motion.div>
              </div>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="lg:hidden"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-3 rounded-xl hover:bg-green-50 text-slate-700"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </motion.div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden border-t border-green-200 bg-white"
            >
              <div className="py-6 space-y-2">
                {navigationItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all duration-300 rounded-xl mx-4",
                          location.pathname === item.href
                            ? "text-green-600 bg-green-50 shadow-md border border-green-200"
                            : "text-slate-800 hover:text-green-600 hover:bg-green-50"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="w-4 h-4" />
                        {item.name}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Mobile User Menu or Login Buttons */}
                {userInfo ? (
                  // User is logged in - show user menu
                  <div className="border-t border-green-200 pt-6 mt-6">
                    <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-green-100/50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{userInfo.name}</p>
                          <p className="text-sm text-green-600">{userInfo.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 px-4">
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 p-4 rounded-xl hover:bg-green-50 text-slate-700"
                        onClick={() => {
                          navigate('/user-dashboard');
                          setIsOpen(false);
                        }}
                      >
                        <User className="w-4 h-4" />
                        Dashboard
                      </Button>
                      {isProvider && (
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-3 p-4 rounded-xl hover:bg-green-50 text-slate-700"
                          onClick={() => {
                            navigate('/provider-dashboard');
                            setIsOpen(false);
                          }}
                        >
                          <FileText className="w-4 h-4" />
                          Provider Dashboard
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 p-4 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </Button>
                    </div>
                  </div>
                ) : (
                  // User is not logged in - show login buttons
                  <div className="border-t border-green-200 pt-6 mt-6 space-y-3 px-4">
                    <Button variant="outline" size="sm" asChild className="w-full rounded-xl border-green-300 hover:border-green-500 text-green-600 hover:text-green-700 hover:bg-green-50">
                      <Link to="/user-login" onClick={() => setIsOpen(false)}>
                        User Login
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="w-full rounded-xl border-green-300 hover:border-green-500 text-green-600 hover:text-green-700 hover:bg-green-50">
                      <Link to="/provider-login" onClick={() => setIsOpen(false)}>
                        Provider Login
                      </Link>
                    </Button>
                    <Button size="sm" asChild className="w-full rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg text-white">
                      <Link to="/become-provider" onClick={() => setIsOpen(false)}>
                        Become Provider
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}