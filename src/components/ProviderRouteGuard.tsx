import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

interface ProviderRouteGuardProps {
  children: React.ReactNode;
}

const ProviderRouteGuard = ({ children }: ProviderRouteGuardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      // Check if provider is logged in with valid token
      const providerToken = localStorage.getItem('provider_token');
      const tokenData = localStorage.getItem('provider_token_data');
      const storedProviderInfo = localStorage.getItem('provider_info');

      if (!providerToken || !tokenData || !storedProviderInfo) {
        navigate('/provider-login');
        return;
      }



      // Verify session with Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        handleLogout();
        return;
      }

      // Verify provider exists
      const providerInfo = JSON.parse(storedProviderInfo);
      const { data: profileData, error: profileError } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (profileError || !profileData) {
        handleLogout();
        return;
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error('Authentication check failed:', error);
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

export default ProviderRouteGuard; 