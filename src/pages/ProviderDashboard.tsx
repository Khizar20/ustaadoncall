import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { getServiceCategoryNames, getServiceCategoryByName } from "@/lib/serviceCategories";
import ChatModal from "@/components/ChatModal";
import MessageNotification from "@/components/MessageNotification";
import NotificationBadge from "@/components/NotificationBadge";
import NotificationDropdown from "@/components/NotificationDropdown";
import {
  User,
  Settings,
  LogOut,
  Calendar,
  Star,
  DollarSign,
  FileText,
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
  MessageSquare,
  Check
} from "lucide-react";

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

interface ServiceJob {
  job: string;
  price: number;
}

interface ServiceCategory {
  category: string;
  experience: string;
  jobs: ServiceJob[];
}

interface Booking {
  id: string;
  user_name: string;
  user_phone: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_amount: number;
  selected_services: any[];
  service_location: string;
  special_instructions: string;
  created_at: string;
  user_id: string;
}

const ProviderDashboard = () => {
  const [providerInfo, setProviderInfo] = useState<ProviderInfo | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingServices, setIsEditingServices] = useState(false);
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showChatForBooking, setShowChatForBooking] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Token management
  const TOKEN_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds

  useEffect(() => {
    checkAuthAndLoadData();
    // Set up token expiry check
    const tokenCheckInterval = setInterval(checkTokenExpiry, 60000); // Check every minute
    return () => clearInterval(tokenCheckInterval);
  }, []);

  const checkTokenExpiry = () => {
    const tokenData = localStorage.getItem('provider_token_data');
    if (tokenData) {
      const { timestamp } = JSON.parse(tokenData);
      const now = Date.now();
      if (now - timestamp > TOKEN_EXPIRY) {
        handleLogout();
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive"
        });
      }
    }
  };

  const checkAuthAndLoadData = async () => {
    try {
      // Check if provider is logged in with valid token
      const providerToken = localStorage.getItem('provider_token');
      const tokenData = localStorage.getItem('provider_token_data');
      const storedProviderInfo = localStorage.getItem('provider_info');

      if (!providerToken || !tokenData || !storedProviderInfo) {
        navigate('/provider-login');
        return;
      }

      // Check token expiry
      const { timestamp } = JSON.parse(tokenData);
      const now = Date.now();
      if (now - timestamp > TOKEN_EXPIRY) {
        handleLogout();
        return;
      }

      // Verify session with Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        handleLogout();
        return;
      }

      // Load provider data
      const providerData = JSON.parse(storedProviderInfo);
      setProviderInfo(providerData);
      
      // Initialize services from jobs_pricing
      if (providerData.jobs_pricing) {
        const servicesData = Object.entries(providerData.jobs_pricing).map(([category, jobs]) => ({
          category,
          experience: "1-2", // Default experience
          jobs: Array.isArray(jobs) ? jobs : []
        }));
        setServices(servicesData);
      }

      // Fetch provider's bookings
      await fetchBookings(providerData.id);
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/provider-login');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookings = async (providerId: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          users (
            name,
            phone
          )
        `)
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform the data to match our interface
      const transformedBookings = data?.map(booking => ({
        id: booking.id,
        user_name: booking.users?.name || 'Unknown User',
        user_phone: booking.users?.phone || 'No phone',
        booking_date: booking.booking_date,
        booking_time: booking.booking_time,
        status: booking.status,
        total_amount: booking.total_amount,
        selected_services: booking.selected_services || [],
        service_location: booking.service_location,
        special_instructions: booking.special_instructions,
        created_at: booking.created_at,
        user_id: booking.user_id
      })) || [];

      setBookings(transformedBookings);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load your bookings.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('provider_token');
      localStorage.removeItem('provider_token_data');
      localStorage.removeItem('provider_info');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate('/provider-login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const addService = () => {
    setServices([...services, {
      category: '',
      experience: '1-2',
      jobs: []
    }]);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: keyof ServiceCategory, value: any) => {
    const updatedServices = [...services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    
    // If category changed, pre-populate with default jobs
    if (field === 'category' && value) {
      const serviceCategory = getServiceCategoryByName(value);
      if (serviceCategory) {
        updatedServices[index].jobs = [...serviceCategory.jobs];
      }
    }
    
    setServices(updatedServices);
  };

  const addJob = (serviceIndex: number) => {
    const updatedServices = [...services];
    updatedServices[serviceIndex].jobs.push({ job: '', price: 0 });
    setServices(updatedServices);
  };

  const removeJob = (serviceIndex: number, jobIndex: number) => {
    const updatedServices = [...services];
    updatedServices[serviceIndex].jobs.splice(jobIndex, 1);
    setServices(updatedServices);
  };

  const updateJob = (serviceIndex: number, jobIndex: number, field: keyof ServiceJob, value: any) => {
    const updatedServices = [...services];
    updatedServices[serviceIndex].jobs[jobIndex] = { 
      ...updatedServices[serviceIndex].jobs[jobIndex], 
      [field]: value 
    };
    setServices(updatedServices);
  };

  const saveServices = async () => {
    try {
      const jobsPricing: any = {};
      const serviceCategories: string[] = [];
      const experiences: string[] = [];
      
      services.forEach(service => {
        if (service.category && service.jobs.length > 0) {
          jobsPricing[service.category] = service.jobs;
          serviceCategories.push(service.category);
          experiences.push(service.experience);
        }
      });

      // Update providers table with service_category, experience, and jobs_pricing
      const { error } = await supabase
        .from('providers')
        .update({ 
          jobs_pricing: jobsPricing,
          service_category: serviceCategories.join(','), // Store as comma-separated string
          experience: experiences.join(',') // Store as comma-separated string
        })
        .eq('id', providerInfo?.id);

      if (error) throw error;

      // Update local state
      if (providerInfo) {
        setProviderInfo({ 
          ...providerInfo, 
          jobs_pricing: jobsPricing,
          service_category: serviceCategories.join(','),
          experience: experiences.join(',')
        });
      }

      // Update localStorage
      const updatedProviderInfo = {
        ...providerInfo,
        jobs_pricing: jobsPricing,
        service_category: serviceCategories.join(','),
        experience: experiences.join(',')
      };
      localStorage.setItem('provider_info', JSON.stringify(updatedProviderInfo));

      setIsEditingServices(false);
      toast({
        title: "Services Updated",
        description: "Your services and pricing have been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving services:', error);
      toast({
        title: "Error",
        description: "Failed to save services. Please try again.",
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
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: newStatus,
          confirmed_at: newStatus === 'confirmed' ? new Date().toISOString() : null
        })
        .eq('id', bookingId);

      if (error) {
        throw error;
      }

      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus }
            : booking
        )
      );

      toast({
        title: "Status Updated",
        description: `Booking status updated to ${newStatus}.`,
      });
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update booking status.",
        variant: "destructive"
      });
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

  if (!providerInfo) {
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
                <h1 className="text-xl font-semibold">Provider Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {providerInfo.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationDropdown 
                currentUserId={providerInfo?.id || ''} 
                currentUserType="provider"
              />
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
                  variant={activeTab === 'services' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('services')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Services
                </Button>
                <Button
                  variant={activeTab === 'orders' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('orders')}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Orders
                  <NotificationBadge 
                    currentUserId={providerInfo?.id || ''} 
                    currentUserType="provider"
                    className="ml-auto"
                  />
                </Button>
                <Button
                  variant={activeTab === 'earnings' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('earnings')}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Earnings
                </Button>
                <Button
                  variant={activeTab === 'reviews' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('reviews')}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Reviews
                </Button>
                <Button
                  variant={activeTab === 'settings' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('settings')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
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
                  <p className="text-muted-foreground">Monitor your business performance</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
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
                          <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                          <p className="text-2xl font-bold">
                            Rs. {bookings.reduce((total, booking) => total + booking.total_amount, 0).toLocaleString()}
                          </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Rating</p>
                          <p className="text-2xl font-bold">{providerInfo.rating || 0}</p>
                        </div>
                        <Star className="h-8 w-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Reviews</p>
                          <p className="text-2xl font-bold">{providerInfo.reviews_count || 0}</p>
                        </div>
                        <FileText className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                    <CardDescription>Your latest booking requests from customers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {bookings.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                        <p className="text-muted-foreground">
                          You'll see booking requests here once customers start booking your services.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bookings.slice(0, 3).map((booking) => (
                          <div key={booking.id}>
                            <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground">{booking.user_name}</h4>
                                <p className="text-sm text-muted-foreground">{booking.user_phone}</p>
                              </div>
                              <div className="text-right">
                                <Badge className={`mb-2 ${getStatusColor(booking.status)}`}>
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </Badge>
                                <p className="text-sm font-bold text-primary">
                                  Rs. {booking.total_amount.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(booking.booking_date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {booking.booking_time}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {booking.service_location}
                              </span>
                            </div>

                            {/* Selected Services */}
                            {booking.selected_services && booking.selected_services.length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Services:</p>
                                <div className="flex flex-wrap gap-1">
                                  {booking.selected_services.map((service: any, index: number) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {service.job}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Special Instructions */}
                            {booking.special_instructions && (
                              <div className="mb-3">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Special Instructions:</p>
                                <p className="text-xs text-muted-foreground">{booking.special_instructions}</p>
                              </div>
                            )}

                            {/* Action Buttons */}
                            {booking.status === 'pending' && (
                              <div className="flex gap-2 pt-3 border-t">
                                <Button 
                                  size="sm" 
                                  onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                  className="flex-1"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Confirm
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateBookingStatus(booking.id, 'rejected')}
                                  className="flex-1"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}

                            {booking.status === 'confirmed' && (
                              <div className="flex gap-2 pt-3 border-t">
                                <Button 
                                  size="sm" 
                                  onClick={() => updateBookingStatus(booking.id, 'completed')}
                                  className="flex-1"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Mark Complete
                                </Button>
                              </div>
                            )}

                            {/* Chat Button */}
                            <div className="flex gap-2 pt-3 border-t">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setShowChatForBooking(showChatForBooking === booking.id ? null : booking.id)}
                                className="flex-1"
                              >
                                <MessageSquare className="w-4 h-4 mr-1" />
                                {showChatForBooking === booking.id ? 'Hide Chat' : 'Chat'}
                                <NotificationBadge 
                                  currentUserId={providerInfo?.id || ''} 
                                  currentUserType="provider"
                                  className="ml-1"
                                />
                              </Button>
                            </div>

                            <div className="text-xs text-muted-foreground mt-2">
                              Requested on {formatDate(booking.created_at)}
                            </div>
                          </div>
                          
                                                  {/* Chat Modal for this booking */}
                        <ChatModal
                          isOpen={showChatForBooking === booking.id}
                          onClose={() => setShowChatForBooking(null)}
                          bookingId={booking.id}
                          currentUserId={providerInfo?.id || ''}
                          currentUserType="provider"
                          otherPartyName={booking.user_name}
                        />
                          </div>
                        ))}
                      
                      {bookings.length > 3 && (
                        <div className="text-center pt-4">
                          <Button 
                            variant="outline" 
                            onClick={() => setActiveTab('orders')}
                            className="w-full"
                          >
                            View All {bookings.length} Orders
                          </Button>
                        </div>
                      )}
                      </div>
                    )}
                  </CardContent>
                </Card>
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
                    <p className="text-muted-foreground">Manage your personal and business information</p>
                  </div>
                  <Button onClick={() => navigate('/provider-profile-update')}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                        <p className="text-lg">{providerInfo.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-lg">{providerInfo.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <p className="text-lg">{providerInfo.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Location</label>
                        <p className="text-lg">{providerInfo.location}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Bio</label>
                      <p className="text-lg">{providerInfo.bio || "No bio provided"}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={providerInfo.is_verified ? "default" : "secondary"}>
                        {providerInfo.is_verified ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Pending Verification
                          </>
                        )}
                      </Badge>
                      <Badge variant="outline">
                        Member since {formatDate(providerInfo.created_at)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'services' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Service Management</h2>
                    <p className="text-muted-foreground">Manage your service offerings, experience, and pricing</p>
                  </div>
                  <div className="flex gap-2">
                    {isEditingServices ? (
                      <>
                        <Button onClick={saveServices} size="sm">
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditingServices(false)} size="sm">
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditingServices(true)} size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Services
                      </Button>
                    )}
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Service Categories & Pricing</span>
                      {isEditingServices && (
                        <Button size="sm" onClick={addService}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Service
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {services.map((service, serviceIndex) => (
                        <div key={serviceIndex} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex gap-4 flex-1">
                              {isEditingServices ? (
                                <>
                                  <div className="flex-1">
                                    <Label>Service Category</Label>
                                    <Select
                                      value={service.category}
                                      onValueChange={(value) => updateService(serviceIndex, 'category', value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {getServiceCategoryNames().map((category) => (
                                          <SelectItem key={category.value} value={category.value}>
                                            {category.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="w-32">
                                    <Label>Experience</Label>
                                    <Select
                                      value={service.experience}
                                      onValueChange={(value) => updateService(serviceIndex, 'experience', value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="0-1">0-1 years</SelectItem>
                                        <SelectItem value="1-2">1-2 years</SelectItem>
                                        <SelectItem value="3-5">3-5 years</SelectItem>
                                        <SelectItem value="6-10">6-10 years</SelectItem>
                                        <SelectItem value="10+">10+ years</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div>
                                    <h4 className="font-medium capitalize">{service.category}</h4>
                                    <p className="text-sm text-muted-foreground">{service.experience} years experience</p>
                                  </div>
                                </>
                              )}
                            </div>
                            {isEditingServices && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeService(serviceIndex)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium">Jobs & Pricing</h5>
                              {isEditingServices && (
                                <Button size="sm" onClick={() => addJob(serviceIndex)}>
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Job
                                </Button>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              {service.jobs.map((job, jobIndex) => (
                                <div key={jobIndex} className="flex items-center gap-2">
                                  {isEditingServices ? (
                                    <>
                                      <Input
                                        placeholder="Job name"
                                        value={job.job}
                                        onChange={(e) => updateJob(serviceIndex, jobIndex, 'job', e.target.value)}
                                        className="flex-1"
                                      />
                                      <Input
                                        type="number"
                                        placeholder="Price"
                                        value={job.price}
                                        onChange={(e) => updateJob(serviceIndex, jobIndex, 'price', parseInt(e.target.value) || 0)}
                                        className="w-24"
                                      />
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeJob(serviceIndex, jobIndex)}
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <span className="flex-1">{job.job}</span>
                                      <span className="font-medium">Rs. {job.price}</span>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {services.length === 0 && !isEditingServices && (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No services configured</h3>
                          <p className="text-muted-foreground">
                            Add your services and pricing to start receiving bookings.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-bold mb-2">Orders</h2>
                  <p className="text-muted-foreground">Manage your service requests and bookings</p>
                </div>

                {bookings.length === 0 ? (
                  <Card>
                    <CardContent className="p-8">
                      <div className="text-center">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                        <p className="text-muted-foreground">
                          You'll see your service requests and bookings here once customers start booking your services.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{booking.user_name}</CardTitle>
                              <CardDescription>
                                {formatDate(booking.booking_date)} at {booking.booking_time}
                              </CardDescription>
                            </div>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2">Customer Details</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Name:</span> {booking.user_name}</p>
                                <p><span className="font-medium">Phone:</span> {booking.user_phone}</p>
                                <p><span className="font-medium">Location:</span> {booking.service_location}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Service Details</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Total Amount:</span> Rs. {booking.total_amount.toLocaleString()}</p>
                                <p><span className="font-medium">Services:</span></p>
                                <div className="flex flex-wrap gap-1">
                                  {booking.selected_services.map((service: any, index: number) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {service.job} - Rs. {service.price}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {booking.special_instructions && (
                            <div>
                              <h4 className="font-medium mb-2">Special Instructions</h4>
                              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                                {booking.special_instructions}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-4 border-t">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setShowChatForBooking(showChatForBooking === booking.id ? null : booking.id)}
                              className="flex-1"
                            >
                              <MessageSquare className="w-4 h-4 mr-1" />
                              {showChatForBooking === booking.id ? 'Hide Chat' : 'Chat'}
                              <NotificationBadge 
                                currentUserId={providerInfo?.id || ''} 
                                currentUserType="provider"
                                className="ml-1"
                              />
                            </Button>
                            
                            {booking.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Confirm
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => updateBookingStatus(booking.id, 'rejected')}
                                  className="flex-1"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            
                            {booking.status === 'confirmed' && (
                              <Button 
                                size="sm" 
                                onClick={() => updateBookingStatus(booking.id, 'completed')}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Mark Complete
                              </Button>
                            )}
                          </div>

                          {/* Chat Modal */}
                          {showChatForBooking === booking.id && (
                            <ChatModal
                              isOpen={showChatForBooking === booking.id}
                              onClose={() => setShowChatForBooking(null)}
                              bookingId={booking.id}
                              currentUserId={providerInfo?.id || ''}
                              currentUserType="provider"
                              otherPartyName={booking.user_name}
                            />
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'earnings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-bold mb-2">Earnings</h2>
                  <p className="text-muted-foreground">Track your income and financial performance</p>
                </div>

                <Card>
                  <CardContent className="p-8">
                    <div className="text-center">
                      <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No earnings yet</h3>
                      <p className="text-muted-foreground">
                        Your earnings and financial data will appear here once you start completing orders.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-bold mb-2">Reviews</h2>
                  <p className="text-muted-foreground">View customer feedback and ratings</p>
                </div>

                <Card>
                  <CardContent className="p-8">
                    <div className="text-center">
                      <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                      <p className="text-muted-foreground">
                        Customer reviews and ratings will appear here once you start receiving feedback.
                      </p>
                    </div>
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
                        <h4 className="font-medium">Account Status</h4>
                        <p className="text-sm text-muted-foreground">Your account verification status</p>
                      </div>
                      <Badge variant={providerInfo.is_verified ? "default" : "secondary"}>
                        {providerInfo.is_verified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Message Notifications */}
      {providerInfo && (
        <MessageNotification 
          currentUserId={providerInfo.id} 
          currentUserType="provider" 
        />
      )}
    </div>
  );
};

export default ProviderDashboard; 