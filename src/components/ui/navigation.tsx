import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, FileText, ChevronDown, Sparkles, Home, Settings, Shield, AlertCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/ui/language-toggle";
import NotificationDropdown from "@/components/NotificationDropdown";

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

interface ProviderInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  service_category: string;
  bio: string;
  experience: string;
  rating: number;
  reviews_count: number;
  is_verified: boolean;
  profile_image: string;
  jobs_pricing: any;
  created_at: string;
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [providerInfo, setProviderInfo] = useState<ProviderInfo | null>(null);
  const [currentAccountType, setCurrentAccountType] = useState<'user' | 'provider' | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguageContext();

  useEffect(() => {
    const checkAuth = () => {
      // Check user authentication
      const storedUserInfo = localStorage.getItem('user_info');
      const storedUserToken = localStorage.getItem('user_token');
      const userTokenData = localStorage.getItem('user_token_data');

      // Check provider authentication
      const storedProviderInfo = localStorage.getItem('provider_info');
      const storedProviderToken = localStorage.getItem('provider_token');
      const providerTokenData = localStorage.getItem('provider_token_data');

      let isUserLoggedIn = false;
      let isProviderLoggedIn = false;

      // Check user auth
      if (storedUserInfo && storedUserToken && userTokenData) {
        try {
          const userData = JSON.parse(storedUserInfo);
          setUserInfo(userData);
          isUserLoggedIn = true;
        } catch (error) {
          console.error('Error parsing user token data:', error);
        }
      }

      // Check provider auth
      if (storedProviderInfo && storedProviderToken && providerTokenData) {
        try {
          const providerData = JSON.parse(storedProviderInfo);
          setProviderInfo(providerData);
          isProviderLoggedIn = true;
        } catch (error) {
          console.error('Error parsing provider token data:', error);
        }
      }

      // Determine current account type - preserve existing choice when both are logged in
      if (isUserLoggedIn && isProviderLoggedIn) {
        // Both logged in - preserve current account type, only set if null
        if (currentAccountType === null) {
          // Default to user account type if not set
          setCurrentAccountType('user');
        }
        // If currentAccountType is already set, don't change it
      } else if (isUserLoggedIn && currentAccountType !== 'user') {
        setCurrentAccountType('user');
      } else if (isProviderLoggedIn && currentAccountType !== 'provider') {
        setCurrentAccountType('provider');
      } else if (!isUserLoggedIn && !isProviderLoggedIn) {
        setCurrentAccountType(null);
        setUserInfo(null);
        setProviderInfo(null);
      }
    };

    checkAuth();

    // Listen for authentication state changes
    const handleAuthChange = () => {
      checkAuth();
    };

    // Listen for storage events (when localStorage changes in other tabs)
    window.addEventListener('storage', handleAuthChange);
    
    // Listen for custom auth events
    window.addEventListener('auth-state-changed', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('auth-state-changed', handleAuthChange);
    };
  }, []); // No dependencies to prevent re-running on navigation

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
      
      // Clear all authentication data
      localStorage.removeItem('user_token');
      localStorage.removeItem('user_token_data');
      localStorage.removeItem('user_info');
      localStorage.removeItem('provider_token');
      localStorage.removeItem('provider_token_data');
      localStorage.removeItem('provider_info');
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('auth-state-changed'));
      
      setUserInfo(null);
      setProviderInfo(null);
      setCurrentAccountType(null);
      setShowUserMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSwitchAccount = (accountType: 'user' | 'provider') => {
    setCurrentAccountType(accountType);
    setShowUserMenu(false);
    
    if (accountType === 'user') {
      navigate('/user-dashboard');
    } else {
      navigate('/provider-dashboard');
    }
  };

  const getCurrentUserInfo = () => {
    if (currentAccountType === 'user' && userInfo) {
      return { id: userInfo.id, name: userInfo.name, email: userInfo.email, type: 'user' as const };
    } else if (currentAccountType === 'provider' && providerInfo) {
      return { id: providerInfo.id, name: providerInfo.name, email: providerInfo.email, type: 'provider' as const };
    }
    return null;
  };

  const isLoggedInAsBoth = () => {
    return userInfo && providerInfo;
  };

  const handleOpenChat = (bookingId: string) => {
    console.log('🔔 [NAVIGATION] handleOpenChat called with bookingId:', bookingId);
    console.log('🔔 [NAVIGATION] Current account type:', currentAccountType);
    
    // Navigate to the appropriate chat page based on current account type
    if (currentAccountType === 'user') {
      console.log('🔔 [NAVIGATION] Navigating to user dashboard with booking:', bookingId);
      navigate(`/user-dashboard?booking=${bookingId}`);
    } else if (currentAccountType === 'provider') {
      console.log('🔔 [NAVIGATION] Navigating to provider dashboard with booking:', bookingId);
      navigate(`/provider-dashboard?booking=${bookingId}`);
    } else {
      console.error('❌ [NAVIGATION] Unknown account type:', currentAccountType);
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
                    {t(item.name)}
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

          {/* Desktop User Menu and Login Buttons */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="hidden lg:flex items-center gap-3"
          >
            <LanguageToggle />
            
            {/* Notification Button - Show when logged in */}
            {currentAccountType && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.75, duration: 0.3 }}
              >
                <NotificationDropdown 
                  currentUserId={getCurrentUserInfo()?.id || ''} 
                  currentUserType={currentAccountType}
                  onOpenChat={handleOpenChat}
                />
              </motion.div>
            )}
            
            {/* Conditionally show login buttons based on authentication status */}
            <div className="flex items-center gap-3">
              {/* Show User Login only if not logged in as user AND not logged in as both */}
              {currentAccountType !== 'user' && !isLoggedInAsBoth() && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="outline" size="sm" asChild className="rounded-xl border-green-300 hover:border-green-500 text-green-600 hover:text-green-700 hover:bg-green-50">
                    <Link to="/user-login">{t("User Login")}</Link>
                  </Button>
                </motion.div>
              )}
              
              {/* Show Provider Login only if not logged in as provider AND not logged in as both */}
              {currentAccountType !== 'provider' && !isLoggedInAsBoth() && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.85, duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="outline" size="sm" asChild className="rounded-xl border-green-300 hover:border-green-500 text-green-600 hover:text-green-700 hover:bg-green-50">
                    <Link to="/provider-login">{t("Provider Login")}</Link>
                  </Button>
                </motion.div>
              )}
              
              {/* Show Become Provider only if not logged in as provider AND not logged in as both */}
              {currentAccountType !== 'provider' && !isLoggedInAsBoth() && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9, duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="sm" asChild className="rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg text-white">
                    <Link to="/become-provider">{t("Become Provider")}</Link>
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Show user menu if logged in */}
            {currentAccountType && (
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
                      {getCurrentUserInfo()?.name}
                    </span>
                    <span className="text-xs text-green-600 font-medium">
                      {getCurrentUserInfo()?.type === 'provider' ? t("Provider") : t("User")}
                      {isLoggedInAsBoth() && (
                        <span className="ml-1 text-xs text-blue-600">
                          (Switch)
                        </span>
                      )}
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
                            <p className="font-semibold text-slate-800">{getCurrentUserInfo()?.name}</p>
                            <p className="text-sm text-green-600">{getCurrentUserInfo()?.email}</p>
                            <p className="text-xs text-blue-600">
                              {getCurrentUserInfo()?.type === 'provider' ? 'Provider Account' : 'User Account'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        {/* Account switching options when logged in as both */}
                        {isLoggedInAsBoth() && (
                          <>
                            <div className="px-3 py-2 text-xs font-medium text-slate-500 border-b border-green-100">
                              Switch Account
                            </div>
                            <Button
                              variant="ghost"
                              className="w-full justify-start gap-3 p-3 rounded-xl hover:bg-green-50 text-slate-700"
                              onClick={() => handleSwitchAccount('user')}
                            >
                              <User className="w-4 h-4" />
                              <span>Switch to User Account</span>
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start gap-3 p-3 rounded-xl hover:bg-green-50 text-slate-700"
                              onClick={() => handleSwitchAccount('provider')}
                            >
                              <FileText className="w-4 h-4" />
                              <span>Switch to Provider Account</span>
                            </Button>
                            <div className="border-t border-green-100 my-2"></div>
                          </>
                        )}

                        {/* User-specific menu items */}
                        {currentAccountType === 'user' && (
                          <>
                            <Button
                              variant="ghost"
                              className="w-full justify-start gap-3 p-3 rounded-xl hover:bg-green-50 text-slate-700"
                              onClick={() => {
                                navigate('/user-dashboard');
                                setShowUserMenu(false);
                              }}
                            >
                              <User className="w-4 h-4" />
                              <span>{t("Dashboard")}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start gap-3 p-3 rounded-xl hover:bg-green-50 text-slate-700"
                              onClick={() => {
                                navigate('/user-urgent-requests');
                                setShowUserMenu(false);
                              }}
                            >
                              <AlertCircle className="w-4 h-4" />
                              <span>{t("My Requests")}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start gap-3 p-3 rounded-xl hover:bg-green-50 text-slate-700"
                              onClick={() => {
                                navigate('/create-live-request');
                                setShowUserMenu(false);
                              }}
                            >
                              <AlertCircle className="w-4 h-4" />
                              <span>{t("Urgent Request")}</span>
                            </Button>
                          </>
                        )}

                        {/* Provider-specific menu items */}
                        {currentAccountType === 'provider' && (
                          <>
                            <Button
                              variant="ghost"
                              className="w-full justify-start gap-3 p-3 rounded-xl hover:bg-green-50 text-slate-700"
                              onClick={() => {
                                navigate('/provider-dashboard');
                                setShowUserMenu(false);
                              }}
                            >
                              <FileText className="w-4 h-4" />
                              <span>{t("Dashboard")}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start gap-3 p-3 rounded-xl hover:bg-green-50 text-slate-700"
                              onClick={() => {
                                navigate('/provider-notifications');
                                setShowUserMenu(false);
                              }}
                            >
                              <AlertCircle className="w-4 h-4" />
                              <span>Urgent Requests</span>
                            </Button>
                          </>
                        )}
                        <div className="border-t border-green-100 my-2"></div>
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-3 p-3 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t("Logout")}</span>
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                        {t(item.name)}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Mobile Language Toggle - Always Visible */}
                <div className="border-t border-green-200 pt-6 mt-6">
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Language</span>
                      <LanguageToggle />
                    </div>
                  </div>
                </div>

                {/* Mobile Login Buttons - Conditionally Visible */}
                <div className="border-t border-green-200 pt-6 mt-6 space-y-3 px-4">
                  {/* Show User Login only if not logged in as user AND not logged in as both */}
                  {currentAccountType !== 'user' && !isLoggedInAsBoth() && (
                    <Button variant="outline" size="sm" asChild className="w-full rounded-xl border-green-300 hover:border-green-500 text-green-600 hover:text-green-700 hover:bg-green-50">
                      <Link to="/user-login" onClick={() => setIsOpen(false)}>
                        {t("User Login")}
                      </Link>
                    </Button>
                  )}
                  
                  {/* Show Provider Login only if not logged in as provider AND not logged in as both */}
                  {currentAccountType !== 'provider' && !isLoggedInAsBoth() && (
                    <Button variant="outline" size="sm" asChild className="w-full rounded-xl border-green-300 hover:border-green-500 text-green-600 hover:text-green-700 hover:bg-green-50">
                      <Link to="/provider-login" onClick={() => setIsOpen(false)}>
                        {t("Provider Login")}
                      </Link>
                    </Button>
                  )}
                  
                  {/* Show Become Provider only if not logged in as provider AND not logged in as both */}
                  {currentAccountType !== 'provider' && !isLoggedInAsBoth() && (
                    <Button size="sm" asChild className="w-full rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg text-white">
                      <Link to="/become-provider" onClick={() => setIsOpen(false)}>
                        {t("Become Provider")}
                      </Link>
                    </Button>
                  )}
                </div>

                {/* Mobile User Menu - Show if logged in */}
                {currentAccountType && (
                  <div className="border-t border-green-200 pt-6 mt-6">
                    <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-green-100/50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{getCurrentUserInfo()?.name}</p>
                          <p className="text-sm text-green-600">{getCurrentUserInfo()?.email}</p>
                          <p className="text-xs text-blue-600">
                            {getCurrentUserInfo()?.type === 'provider' ? 'Provider Account' : 'User Account'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 px-4">
                      {/* Account switching options when logged in as both */}
                      {isLoggedInAsBoth() && (
                        <>
                          <div className="px-3 py-2 text-xs font-medium text-slate-500 border-b border-green-100">
                            Switch Account
                          </div>
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 p-4 rounded-xl hover:bg-green-50 text-slate-700"
                            onClick={() => {
                              handleSwitchAccount('user');
                              setIsOpen(false);
                            }}
                          >
                            <User className="w-4 h-4" />
                            <span>Switch to User Account</span>
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 p-4 rounded-xl hover:bg-green-50 text-slate-700"
                            onClick={() => {
                              handleSwitchAccount('provider');
                              setIsOpen(false);
                            }}
                          >
                            <FileText className="w-4 h-4" />
                            <span>Switch to Provider Account</span>
                          </Button>
                          <div className="border-t border-green-100 my-2"></div>
                        </>
                      )}

                      {/* Notification Button */}
                      <div className="px-4 py-2">
                        <NotificationDropdown 
                          currentUserId={getCurrentUserInfo()?.id || ''} 
                          currentUserType={currentAccountType}
                          onOpenChat={handleOpenChat}
                        />
                      </div>

                      {/* User-specific menu items */}
                      {currentAccountType === 'user' && (
                        <>
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 p-4 rounded-xl hover:bg-green-50 text-slate-700"
                            onClick={() => {
                              navigate('/user-dashboard');
                              setIsOpen(false);
                            }}
                          >
                            <User className="w-4 h-4" />
                            {t("Dashboard")}
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 p-4 rounded-xl hover:bg-green-50 text-slate-700"
                            onClick={() => {
                              navigate('/user-urgent-requests');
                              setIsOpen(false);
                            }}
                          >
                            <AlertCircle className="w-4 h-4" />
                            {t("My Requests")}
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 p-4 rounded-xl hover:bg-green-50 text-slate-700"
                            onClick={() => {
                              navigate('/create-live-request');
                              setIsOpen(false);
                            }}
                          >
                            <AlertCircle className="w-4 h-4" />
                            {t("Urgent Request")}
                          </Button>
                        </>
                      )}

                      {/* Provider-specific menu items */}
                      {currentAccountType === 'provider' && (
                        <>
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 p-4 rounded-xl hover:bg-green-50 text-slate-700"
                            onClick={() => {
                              navigate('/provider-dashboard');
                              setIsOpen(false);
                            }}
                          >
                            <FileText className="w-4 h-4" />
                            {t("Dashboard")}
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 p-4 rounded-xl hover:bg-green-50 text-slate-700"
                            onClick={() => {
                              navigate('/provider-notifications');
                              setIsOpen(false);
                            }}
                          >
                            <AlertCircle className="w-4 h-4" />
                            {t("Urgent Requests")}
                          </Button>
                        </>
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
                        {t("Logout")}
                      </Button>
                    </div>
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