import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import {
  User,
  Settings,
  LogOut,
  Calendar,
  Star,
  Heart,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Edit,
  Eye,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Save,
  X,
  Search,
  Filter,
  ArrowRight
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

interface Booking {
  id: string;
  provider_name: string;
  service_category: string;
  booking_date: string;
  status: string;
  total_amount: number;
}

interface FavoriteProvider {
  id: string;
  name: string;
  service_category: string;
  rating: number;
  location: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  expiry: string;
  is_default: boolean;
}

interface Address {
  id: string;
  label: string;
  address: string;
  is_default: boolean;
}

const UserDashboard = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isProvider, setIsProvider] = useState(false);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<FavoriteProvider[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Token management
  const TOKEN_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds

  useEffect(() => {
    const checkAuth = () => {
      const storedUserInfo = localStorage.getItem('user_info');
      const storedToken = localStorage.getItem('user_token');
      const storedTokenData = localStorage.getItem('user_token_data');

      if (!storedUserInfo || !storedToken || !storedTokenData) {
        console.log("❌ No user session found");
        navigate('/user-login');
        return;
      }

      try {
        const userInfo = JSON.parse(storedUserInfo);
        const tokenData = JSON.parse(storedTokenData);

        // Check if token is expired
        const expiresAt = new Date(tokenData.expires_at);
        const now = new Date();

        if (now > expiresAt) {
          console.log("❌ Token expired");
          localStorage.removeItem('user_info');
          localStorage.removeItem('user_token');
          localStorage.removeItem('user_token_data');
          navigate('/user-login');
          return;
        }

        // Check if user is also a provider
        if (userInfo.isProvider && userInfo.providerId) {
          setIsProvider(true);
          setProviderId(userInfo.providerId);
          console.log("✅ User is also a provider:", userInfo.providerId);
        }

        setUserInfo(userInfo);
        console.log("✅ User session validated:", userInfo);
      } catch (error) {
        console.error("❌ Error parsing user session:", error);
        navigate('/user-login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Set up token expiry check
    const tokenCheckInterval = setInterval(() => {
      const storedTokenData = localStorage.getItem('user_token_data');
      if (storedTokenData) {
        const tokenData = JSON.parse(storedTokenData);
        const expiresAt = new Date(tokenData.expires_at);
        const now = new Date();

        if (now > expiresAt) {
          console.log("❌ Token expired during session");
          localStorage.removeItem('user_info');
          localStorage.removeItem('user_token');
          localStorage.removeItem('user_token_data');
          navigate('/user-login');
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(tokenCheckInterval);
  }, [navigate]);

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

  const handleProfileUpdate = async (updatedData: Partial<UserInfo>) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(updatedData)
        .eq('id', userInfo?.id);

      if (error) throw error;

      setUserInfo(prev => prev ? { ...prev, ...updatedData } : null);
      setIsEditingProfile(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'upcoming': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">User Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {userInfo.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('dashboard')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant={activeTab === 'profile' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('profile')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <Button
                  variant={activeTab === 'bookings' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('bookings')}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Bookings
                </Button>
                <Button
                  variant={activeTab === 'favorites' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('favorites')}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Favorites
                </Button>
                <Button
                  variant={activeTab === 'payments' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('payments')}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payment Methods
                </Button>
                <Button
                  variant={activeTab === 'addresses' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('addresses')}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Address Book
                </Button>
                <Button
                  variant={activeTab === 'settings' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('settings')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                
                {/* Provider Dashboard Access - Only show if user is also a provider */}
                {isProvider && (
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                    onClick={() => navigate('/provider-dashboard')}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Provider Dashboard
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-bold mb-2">Dashboard Overview</h2>
                  <p className="text-muted-foreground">Track your service bookings and activity</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                          <p className="text-2xl font-bold">{bookings.length}</p>
                        </div>
                        <Calendar className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Favorite Providers</p>
                          <p className="text-2xl font-bold">{favorites.length}</p>
                        </div>
                        <Heart className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                          <p className="text-2xl font-bold">Rs. {bookings.reduce((sum, booking) => sum + booking.total_amount, 0)}</p>
                        </div>
                        <CreditCard className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Saved Addresses</p>
                          <p className="text-2xl font-bold">{addresses.length}</p>
                        </div>
                        <MapPin className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Provider Status Card - Only show if user is also a provider */}
                  {isProvider && (
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-700">Provider Status</p>
                            <p className="text-2xl font-bold text-green-700">Active</p>
                          </div>
                          <User className="h-8 w-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full justify-start" onClick={() => navigate('/services')}>
                        <Search className="w-4 h-4 mr-2" />
                        Find Services
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('bookings')}>
                        <Calendar className="w-4 h-4 mr-2" />
                        View Bookings
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('favorites')}>
                        <Heart className="w-4 h-4 mr-2" />
                        Manage Favorites
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {bookings.length > 0 ? (
                        <div className="space-y-3">
                          {bookings.slice(0, 3).map((booking) => (
                            <div key={booking.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                              <div>
                                <p className="font-medium text-sm">{booking.provider_name}</p>
                                <p className="text-xs text-muted-foreground">{booking.service_category}</p>
                              </div>
                              <Badge variant={getStatusColor(booking.status) as any}>
                                {booking.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No recent activity</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Profile Information</h2>
                    <p className="text-muted-foreground">Manage your personal information</p>
                  </div>
                  <Button onClick={() => setIsEditingProfile(!isEditingProfile)}>
                    <Edit className="w-4 h-4 mr-2" />
                    {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditingProfile ? (
                      <ProfileEditForm 
                        userInfo={userInfo} 
                        onSave={handleProfileUpdate}
                        onCancel={() => setIsEditingProfile(false)}
                      />
                    ) : (
                      <ProfileView userInfo={userInfo} />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'bookings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-bold mb-2">Booking History</h2>
                  <p className="text-muted-foreground">View and manage your service bookings</p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>All Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bookings.length > 0 ? (
                      <div className="space-y-4">
                        {bookings.map((booking) => (
                          <div key={booking.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold">{booking.provider_name}</h3>
                                <p className="text-sm text-muted-foreground">{booking.service_category}</p>
                                <p className="text-xs text-muted-foreground">
                                  Booked for {formatDate(booking.booking_date)}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge variant={getStatusColor(booking.status) as any}>
                                  {booking.status}
                                </Badge>
                                <p className="font-semibold mt-1">Rs. {booking.total_amount}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                        <p className="text-muted-foreground">
                          Start booking services to see your history here.
                        </p>
                        <Button className="mt-4" onClick={() => navigate('/services')}>
                          <Search className="w-4 h-4 mr-2" />
                          Find Services
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'favorites' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-bold mb-2">Favorite Providers</h2>
                  <p className="text-muted-foreground">Quick access to your preferred service providers</p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Saved Providers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {favorites.length > 0 ? (
                      <div className="space-y-4">
                        {favorites.map((provider) => (
                          <div key={provider.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold">{provider.name}</h3>
                                <p className="text-sm text-muted-foreground">{provider.service_category}</p>
                                <p className="text-xs text-muted-foreground">{provider.location}</p>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  <span className="text-sm">{provider.rating}</span>
                                </div>
                                <Button size="sm" className="mt-2">
                                  Book Now
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
                        <p className="text-muted-foreground">
                          Save your favorite providers for quick access.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'payments' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Payment Methods</h2>
                    <p className="text-muted-foreground">Manage your saved payment methods</p>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Saved Cards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {paymentMethods.length > 0 ? (
                      <div className="space-y-4">
                        {paymentMethods.map((method) => (
                          <div key={method.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <CreditCard className="w-6 h-6 text-primary" />
                                <div>
                                  <p className="font-medium">{method.type} •••• {method.last4}</p>
                                  <p className="text-sm text-muted-foreground">Expires {method.expiry}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {method.is_default && (
                                  <Badge variant="secondary">Default</Badge>
                                )}
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No payment methods</h3>
                        <p className="text-muted-foreground">
                          Add a payment method for faster checkout.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'addresses' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Address Book</h2>
                    <p className="text-muted-foreground">Manage your saved addresses</p>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Address
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Saved Addresses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {addresses.length > 0 ? (
                      <div className="space-y-4">
                        {addresses.map((address) => (
                          <div key={address.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <MapPin className="w-6 h-6 text-primary" />
                                <div>
                                  <p className="font-medium">{address.label}</p>
                                  <p className="text-sm text-muted-foreground">{address.address}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {address.is_default && (
                                  <Badge variant="secondary">Default</Badge>
                                )}
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No addresses saved</h3>
                        <p className="text-muted-foreground">
                          Add addresses for faster booking.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-bold mb-2">Settings</h2>
                  <p className="text-muted-foreground">Manage your account preferences</p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Session Timeout</h4>
                        <p className="text-sm text-muted-foreground">Your session expires after 30 minutes of inactivity</p>
                      </div>
                      <Badge variant="outline">30 minutes</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-muted-foreground">Receive booking updates via email</p>
                      </div>
                      <Badge variant="default">Enabled</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">SMS Notifications</h4>
                        <p className="text-sm text-muted-foreground">Receive booking updates via SMS</p>
                      </div>
                      <Badge variant="secondary">Disabled</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile View Component
const ProfileView = ({ userInfo }: { userInfo: UserInfo }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
      <p className="text-lg">{userInfo.name}</p>
    </div>
    <div>
      <label className="text-sm font-medium text-muted-foreground">Email</label>
      <p className="text-lg">{userInfo.email}</p>
    </div>
    <div>
      <label className="text-sm font-medium text-muted-foreground">Phone</label>
      <p className="text-lg">{userInfo.phone}</p>
    </div>
    <div>
      <label className="text-sm font-medium text-muted-foreground">Address</label>
      <p className="text-lg">{userInfo.address}</p>
    </div>
  </div>
);

// Profile Edit Form Component
const ProfileEditForm = ({ 
  userInfo, 
  onSave, 
  onCancel 
}: { 
  userInfo: UserInfo; 
  onSave: (data: Partial<UserInfo>) => void; 
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: userInfo.name,
    phone: userInfo.phone,
    address: userInfo.address
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          rows={3}
          required
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default UserDashboard; 