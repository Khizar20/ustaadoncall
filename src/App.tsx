import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import MessageNotification from "@/components/MessageNotification";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Index from "./pages/Index";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import BecomeProvider from "./pages/BecomeProvider";
import ProviderProfile from "./pages/ProviderProfile";
import AdminPanel from "./pages/AdminPanel";
import AdminLogin from "./pages/AdminLogin";
import ProviderLogin from "./pages/ProviderLogin";
import ProviderDashboard from "./pages/ProviderDashboard";
import ProviderProfileUpdate from "./pages/ProviderProfileUpdate";
import ProviderRouteGuard from "./components/ProviderRouteGuard";
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";
import UserDashboard from "./pages/UserDashboard";
import UserRouteGuard from "./components/UserRouteGuard";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import CreateLiveRequest from "./pages/CreateLiveRequest";
import UserUrgentRequests from "./pages/UserUrgentRequests";
import ProviderNotifications from "./pages/ProviderNotifications";
import TestLocationAutocomplete from "./pages/TestLocationAutocomplete";

const queryClient = new QueryClient();

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

function AnimatedRoutes() {
  const location = useLocation();
  
  // Handle email verification redirects
  useEffect(() => {
    const handleEmailVerification = async () => {
      // Check for email confirmation parameters in URL
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');
      const type = urlParams.get('type') || hashParams.get('type');
      
      if (accessToken && refreshToken && type === 'signup') {
        try {
          // Set the session with the tokens from email verification
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('Error setting session:', error);
            // Redirect to login page even if there's an error
            window.location.href = '/user-login';
            return;
          }
          
          if (data.session) {
            // Update the user's email_confirmed_at in the database
            const { error: updateError } = await supabase
              .from('users')
              .update({ 
                email_confirmed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', data.session.user.id);
            
            if (updateError) {
              console.error('Error updating email confirmation:', updateError);
            }
            
            // Redirect to login page with success message
            window.location.href = '/user-login?verified=true';
          }
        } catch (error) {
          console.error('Error handling email verification:', error);
          // Redirect to login page even if there's an error
          window.location.href = '/user-login';
        }
      }
    };
    
    handleEmailVerification();
  }, [location]);
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/become-provider" element={<BecomeProvider />} />
          <Route path="/provider/:id" element={<ProviderProfile />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/provider-login" element={<ProviderLogin />} />
          <Route 
            path="/provider-dashboard" 
            element={
              <ProviderRouteGuard>
                <ProviderDashboard />
              </ProviderRouteGuard>
            } 
          />
          <Route 
            path="/provider-profile-update" 
            element={
              <ProviderRouteGuard>
                <ProviderProfileUpdate />
              </ProviderRouteGuard>
            } 
          />
          <Route path="/user-login" element={<UserLogin />} />
          <Route path="/user-register" element={<UserRegister />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route 
            path="/user-dashboard" 
            element={
              <UserRouteGuard>
                <UserDashboard />
              </UserRouteGuard>
            } 
          />
          <Route 
            path="/create-live-request" 
            element={
              <UserRouteGuard>
                <CreateLiveRequest />
              </UserRouteGuard>
            } 
          />
          <Route 
            path="/user-urgent-requests" 
            element={
              <UserRouteGuard>
                <UserUrgentRequests />
              </UserRouteGuard>
            } 
          />
          <Route 
            path="/provider-notifications" 
            element={
              <ProviderRouteGuard>
                <ProviderNotifications />
              </ProviderRouteGuard>
            } 
          />
          <Route path="/test-location-autocomplete" element={<TestLocationAutocomplete />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
