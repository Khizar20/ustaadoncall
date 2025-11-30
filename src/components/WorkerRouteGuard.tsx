import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

interface WorkerRouteGuardProps {
  children: React.ReactNode;
}

const WorkerRouteGuard = ({ children }: WorkerRouteGuardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      // Check if worker is logged in (using provider token system for MVP)
      const providerToken = localStorage.getItem('provider_token');
      const tokenData = localStorage.getItem('provider_token_data');
      const storedProviderInfo = localStorage.getItem('provider_info');

      // Allow access if worker/provider is logged in
      if (!providerToken || !tokenData || !storedProviderInfo) {
        navigate('/provider-login');
        return;
      }

      // Check if this is the hardcoded worker account
      try {
        const providerInfo = JSON.parse(storedProviderInfo);
        if (providerInfo.email === "khizarahmed3@gmail.com" || providerInfo.id === "worker-001") {
          // This is the hardcoded worker account, allow access
          setIsAuthenticated(true);
          return;
        }
      } catch (e) {
        // If parsing fails, continue with regular check
      }

      // For regular providers, verify session with Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        // If session check fails but we have hardcoded worker token, allow access
        if (providerToken.startsWith('mock-worker-token-')) {
          setIsAuthenticated(true);
          return;
        }
        handleLogout();
        return;
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error('Authentication check failed:', error);
      // For hardcoded worker, still allow access if token exists
      const providerToken = localStorage.getItem('provider_token');
      if (providerToken && providerToken.startsWith('mock-worker-token-')) {
        setIsAuthenticated(true);
        return;
      }
      handleLogout();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('provider_token');
    localStorage.removeItem('provider_token_data');
    localStorage.removeItem('provider_info');
    setIsAuthenticated(false);
    navigate('/provider-login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Verifying authentication...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
};

export default WorkerRouteGuard;

