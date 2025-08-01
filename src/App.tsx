import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import MessageNotification from "@/components/MessageNotification";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />

      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
