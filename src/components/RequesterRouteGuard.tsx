import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

interface RequesterRouteGuardProps {
  children: React.ReactNode;
}

const RequesterRouteGuard = ({ children }: RequesterRouteGuardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      // Check if requester/user is logged in
      const userToken = localStorage.getItem('user_token');
      const tokenData = localStorage.getItem('user_token_data');
      const storedUserInfo = localStorage.getItem('user_info');

      // Allow access if user is logged in
      if (!userToken || !tokenData || !storedUserInfo) {
        navigate('/user-login');
        return;
      }

      // Check if this is the hardcoded requester account
      try {
        const userInfo = JSON.parse(storedUserInfo);
        if (userInfo.email === "khizarahmed3@gmail.com" || userInfo.id === "requester-001") {
          // This is the hardcoded requester account, allow access
          setIsAuthenticated(true);
          return;
        }
      } catch (e) {
        // If parsing fails, continue with regular check
      }

      // For regular users, verify session with Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        // If session check fails but we have hardcoded requester token, allow access
        if (userToken.startsWith('mock-requester-token-')) {
          setIsAuthenticated(true);
          return;
        }
        handleLogout();
        return;
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error('Authentication check failed:', error);
      // For hardcoded requester, still allow access if token exists
      const userToken = localStorage.getItem('user_token');
      if (userToken && userToken.startsWith('mock-requester-token-')) {
        setIsAuthenticated(true);
        return;
      }
      handleLogout();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_token_data');
    localStorage.removeItem('user_info');
    setIsAuthenticated(false);
    navigate('/user-login');
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

export default RequesterRouteGuard;

