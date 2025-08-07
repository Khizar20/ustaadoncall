import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import ChatModal from "@/components/ChatModal";
import MessageNotification from "@/components/MessageNotification";
import NotificationBadge from "@/components/NotificationBadge";
import ReviewModal from "@/components/ReviewModal";
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
  ArrowRight,
  Home,
  FileText,
  Info,
  MessageSquare,
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

interface Booking {
  id: string;
  provider_name: string;
  service_category: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_amount: number;
  selected_services: any[];
  service_location: string;
  contact_phone: string;
  special_instructions: string;
  created_at: string;
  provider_id: string;
  payment_method?: string;
  payment_method_name?: string;
  payment_status?: string;
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
  const [showChatForBooking, setShowChatForBooking] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<{
    isOpen: boolean;
    bookingId: string;
    providerId: string;
    providerName: string;
  } | null>(null);
  const [reviewedBookings, setReviewedBookings] = useState<Set<string>>(new Set());
  
  // Track reviewedBookings state changes
  useEffect(() => {
    console.log('🔍 [USER_DASHBOARD] 📊 reviewedBookings state changed - size:', reviewedBookings.size, 'content:', Array.from(reviewedBookings));
    currentReviewedBookingsRef.current = new Set(reviewedBookings);
  }, [reviewedBookings]);
  const [reviewModalShown, setReviewModalShown] = useState<Set<string>>(new Set());
  
  // Track reviewModalShown state changes
  useEffect(() => {
    currentReviewModalShownRef.current = new Set(reviewModalShown);
  }, [reviewModalShown]);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    bookingId: string | null;
    action: string | null;
    title: string;
    description: string;
  }>({
    isOpen: false,
    bookingId: null,
    action: null,
    title: '',
    description: ''
  });
  
  // Ref to track if we've already checked for reviews to prevent multiple calls
  const hasCheckedReviews = useRef(false);
  const currentReviewedBookingsRef = useRef<Set<string>>(new Set());
  const currentReviewModalShownRef = useRef<Set<string>>(new Set());
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkAuth = () => {
      const storedUserInfo = localStorage.getItem('user_info');
      const storedToken = localStorage.getItem('user_token');
      const tokenData = localStorage.getItem('user_token_data');

      if (!storedUserInfo || !storedToken || !tokenData) {
        navigate('/user-login');
        return;
      }

      const userData = JSON.parse(storedUserInfo);
      setUserInfo(userData);
      
      // Check if user is also a provider
      if (userData.isProvider && userData.providerId) {
        setIsProvider(true);
        setProviderId(userData.providerId);
      }
    };

    checkAuth();
    setIsLoading(false);
  }, [navigate]);

  // Handle booking parameter from URL to open chat
  useEffect(() => {
    const bookingId = searchParams.get('booking');
    console.log('🔔 [USER_DASHBOARD] URL search params:', searchParams.toString());
    console.log('🔔 [USER_DASHBOARD] Booking ID from URL:', bookingId);
    
    if (bookingId) {
      console.log('🔔 [USER_DASHBOARD] Setting showChatForBooking to:', bookingId);
      setShowChatForBooking(bookingId);
      // Clear the URL parameter after setting the chat
      console.log('🔔 [USER_DASHBOARD] Clearing URL parameter');
      navigate('/user-dashboard', { replace: true });
    }
  }, [searchParams, navigate]);

  // Function to check for completed bookings that need reviews
  const checkForCompletedBookings = useCallback(async (bookings: Booking[]) => {
    if (!userInfo?.id || hasCheckedReviews.current) {
      console.log('🔍 [USER_DASHBOARD] Skipping review check - already checked or no user');
      return;
    }

    console.log('🔍 [USER_DASHBOARD] Starting review check for completed bookings');
    hasCheckedReviews.current = true;

    // Get the current reviewedBookings and reviewModalShown from refs
    // This ensures we get the latest state values, not the stale closure values
    const currentReviewedBookings = currentReviewedBookingsRef.current;
    const currentReviewModalShown = currentReviewModalShownRef.current;
    console.log('🔍 [USER_DASHBOARD] 📊 Current state from refs - reviewedBookings:', Array.from(currentReviewedBookings), 'reviewModalShown:', Array.from(currentReviewModalShown));

    // Only check bookings completed in the last 30 days to avoid old bookings
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentCompletedBookings = bookings.filter(booking => 
      booking.status === 'completed' && 
      new Date(booking.created_at) >= thirtyDaysAgo
    );
    
    console.log('🔍 [USER_DASHBOARD] Recent completed bookings found:', recentCompletedBookings.length);
    console.log('🔍 [USER_DASHBOARD] ReviewModalShown set:', Array.from(currentReviewModalShown));
    console.log('🔍 [USER_DASHBOARD] ReviewedBookings set:', Array.from(currentReviewedBookings));
    
    for (const booking of recentCompletedBookings) {
      console.log('🔍 [USER_DASHBOARD] Processing booking:', booking.id, 'Status:', booking.status, 'Created:', booking.created_at);
      
      // Skip if we've already shown the review modal for this booking
      if (currentReviewModalShown.has(booking.id)) {
        console.log('🔍 [USER_DASHBOARD] Skipping booking', booking.id, '- modal already shown');
        continue;
      }

      // Skip if this booking has already been reviewed
      if (currentReviewedBookings.has(booking.id)) {
        console.log('🔍 [USER_DASHBOARD] Skipping booking', booking.id, '- already reviewed');
        continue;
      }

      // Check if user has already reviewed this booking
      try {
        const { data: existingReview } = await supabase
          .from('reviews')
          .select('id')
          .eq('booking_id', booking.id)
          .eq('customer_id', userInfo.id)
          .single();

        if (!existingReview) {
          console.log('🔍 [USER_DASHBOARD] Showing review modal for booking:', booking.id);
          // Show review modal for this booking
          setShowReviewModal({
            isOpen: true,
            bookingId: booking.id,
            providerId: booking.provider_id,
            providerName: booking.provider_name
          });
          // Mark this booking as having the review modal shown
          setReviewModalShown(prev => new Set([...prev, booking.id]));
          break; // Only show one review modal at a time
        } else {
          console.log('🔍 [USER_DASHBOARD] Booking', booking.id, 'already has review in database');
          // Mark this booking as reviewed
          setReviewedBookings(prev => new Set([...prev, booking.id]));
        }
      } catch (error) {
        console.log('🔍 [USER_DASHBOARD] Error checking review for booking', booking.id, ':', error);
        // If there's an error, assume no review exists and show the modal
        console.log('🔍 [USER_DASHBOARD] Showing review modal for booking due to error:', booking.id);
        setShowReviewModal({
          isOpen: true,
          bookingId: booking.id,
          providerId: booking.provider_id,
          providerName: booking.provider_name
        });
        setReviewModalShown(prev => new Set([...prev, booking.id]));
        break;
      }
    }
  }, [userInfo?.id]); // Remove reviewedBookings and reviewModalShown from dependencies

  // Fetch user's bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!userInfo?.id) return;

      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            providers (
              name,
              service_category
            )
          `)
          .eq('user_id', userInfo.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        // Transform the data to match our interface and fetch provider phone numbers
        const transformedBookings = await Promise.all(
          (data || []).map(async (booking) => {
            // Fetch provider's phone number directly from providers table
            let providerPhone = booking.contact_phone; // Use existing contact_phone as fallback
            try {
              const { data: providerData, error: providerError } = await supabase
                .from('providers')
                .select('phone')
                .eq('id', booking.provider_id)
                .single();
              
              if (!providerError && providerData && providerData.phone) {
                providerPhone = providerData.phone;
              }
            } catch (error) {
              console.log('Could not fetch provider phone number:', error);
            }

            return {
              id: booking.id,
              provider_name: booking.providers?.name || 'Unknown Provider',
              service_category: booking.providers?.service_category || 'General',
              booking_date: booking.booking_date,
              booking_time: booking.booking_time,
              status: booking.status,
              total_amount: booking.total_amount,
              selected_services: booking.selected_services || [],
              service_location: booking.service_location,
              contact_phone: providerPhone,
              special_instructions: booking.special_instructions,
              created_at: booking.created_at,
              provider_id: booking.provider_id,
              payment_method: booking.payment_method,
              payment_method_name: booking.payment_method_name,
              payment_status: booking.payment_status
            };
          })
        );

        setBookings(transformedBookings);

        // Check for completed bookings that need reviews
        checkForCompletedBookings(transformedBookings);
      } catch (error: any) {
        console.error('Error fetching bookings:', error);
        toast({
          title: "Error",
          description: "Failed to load your bookings.",
          variant: "destructive"
        });
      }
    };

    fetchBookings();
  }, [userInfo?.id, toast, checkForCompletedBookings]);

  // Fetch user's favorite providers
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userInfo?.id) return;

      try {
        const { data, error } = await supabase
          .from('user_favorites')
          .select(`
            *,
            providers (
              id,
              name,
              service_category,
              location,
              rating,
              profile_image,
              is_verified
            )
          `)
          .eq('user_id', userInfo.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        // Transform the data to match our FavoriteProvider interface
        const transformedFavorites = (data || []).map((fav: any) => ({
          id: fav.providers.id,
          name: fav.providers.name,
          service_category: fav.providers.service_category,
          rating: fav.providers.rating || 0,
          location: fav.providers.location,
          profile_image: fav.providers.profile_image,
          is_verified: fav.providers.is_verified,
          favorited_at: fav.created_at
        }));

        setFavorites(transformedFavorites);
      } catch (error: any) {
        console.error('Error fetching favorites:', error);
        toast({
          title: "Error",
          description: "Failed to load your favorite providers.",
          variant: "destructive"
        });
      }
    };

    fetchFavorites();
  }, [userInfo?.id, toast]);

  // Fetch existing reviews to initialize reviewedBookings state
  useEffect(() => {
    const fetchExistingReviews = async () => {
      if (!userInfo?.id) return;

      try {
        console.log('🔍 [USER_DASHBOARD] Fetching existing reviews for user:', userInfo.id);
        const { data: reviews, error } = await supabase
          .from('reviews')
          .select('booking_id')
          .eq('customer_id', userInfo.id);

        if (!error && reviews) {
          const reviewedBookingIds = new Set(reviews.map(review => review.booking_id));
          console.log('🔍 [USER_DASHBOARD] Found existing reviews for bookings:', reviews);
          console.log('🔍 [USER_DASHBOARD] Setting reviewedBookings to booking IDs:', Array.from(reviewedBookingIds));
          setReviewedBookings(reviewedBookingIds);
          console.log('🔍 [USER_DASHBOARD] ✅ State update triggered for reviewedBookings');
        } else {
          console.log('🔍 [USER_DASHBOARD] No existing reviews found or error:', error);
          setReviewedBookings(new Set());
        }
      } catch (error) {
        console.error('Error fetching existing reviews:', error);
      }
    };

    // Reset the ref when user changes
    hasCheckedReviews.current = false;
    fetchExistingReviews();
  }, [userInfo?.id]);

  // Check for completed bookings that need reviews after reviews are loaded
  useEffect(() => {
    console.log('🔍 [USER_DASHBOARD] useEffect triggered - bookings:', bookings.length, 'reviewedBookings size:', reviewedBookings.size, 'hasCheckedReviews:', hasCheckedReviews.current);
    
    if (bookings.length > 0 && reviewedBookings.size > 0 && !hasCheckedReviews.current) {
      console.log('🔍 [USER_DASHBOARD] ✅ All conditions met - Reviews loaded, checking for completed bookings');
      console.log('🔍 [USER_DASHBOARD] Current reviewedBookings size:', reviewedBookings.size);
      console.log('🔍 [USER_DASHBOARD] Current reviewedBookings content:', Array.from(reviewedBookings));
      
      checkForCompletedBookings(bookings);
    } else {
      console.log('🔍 [USER_DASHBOARD] ❌ Conditions not met - bookings:', bookings.length, 'reviewedBookings.size:', reviewedBookings.size, 'hasCheckedReviews:', hasCheckedReviews.current);
    }
  }, [bookings, reviewedBookings, checkForCompletedBookings]);

  // Clean up old entries from review tracking Sets (keep only last 30 days)
  // This runs after reviews are loaded to avoid clearing the reviewedBookings Set
  useEffect(() => {
    const cleanupOldEntries = () => {
      console.log('🔍 [USER_DASHBOARD] Running cleanup of review tracking Sets');
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Clean up reviewModalShown Set
      setReviewModalShown(prev => {
        const cleaned = new Set<string>();
        // We can't check booking dates here, so we'll keep the Set size manageable
        // by only keeping the most recent 50 entries
        const entries = Array.from(prev);
        if (entries.length > 50) {
          entries.slice(-50).forEach(id => cleaned.add(id));
        } else {
          entries.forEach(id => cleaned.add(id));
        }
        console.log('🔍 [USER_DASHBOARD] Cleaned reviewModalShown:', Array.from(cleaned));
        return cleaned;
      });
      
      // Only clean up reviewedBookings if it has more than 50 entries
      // This prevents clearing the Set when it's just been populated with existing reviews
      setReviewedBookings(prev => {
        const entries = Array.from(prev);
        console.log('🔍 [USER_DASHBOARD] Current reviewedBookings entries:', entries.length);
        if (entries.length > 50) {
          const cleaned = new Set<string>();
          entries.slice(-50).forEach(id => cleaned.add(id));
          console.log('🔍 [USER_DASHBOARD] Cleaned reviewedBookings:', Array.from(cleaned));
          return cleaned;
        }
        console.log('🔍 [USER_DASHBOARD] Keeping existing reviewedBookings:', entries);
        return prev; // Keep the existing Set if it's not too large
      });
    };

    // Only run cleanup after a delay to ensure reviews are loaded first
    const timer = setTimeout(cleanupOldEntries, 1000);
    return () => clearTimeout(timer);
  }, [userInfo?.id]); // Add dependency to run after user info is loaded

  // Real-time subscription for booking status changes
  useEffect(() => {
    if (!userInfo?.id) return;

    const subscription = supabase
      .channel(`user_bookings_${userInfo.id}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'bookings',
          filter: `user_id=eq.${userInfo.id}`
        },
        async (payload) => {
          const updatedBooking = payload.new as any;
          console.log('🔍 [USER_DASHBOARD] Real-time booking update:', updatedBooking.id, 'Status:', updatedBooking.status);
          
          // If booking status changed to completed, check if review is needed
          if (updatedBooking.status === 'completed') {
            console.log('🔍 [USER_DASHBOARD] Booking completed, checking for review need');
            
            // Only check for recent bookings (last 30 days)
            const bookingDate = new Date(updatedBooking.created_at);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            if (bookingDate < thirtyDaysAgo) {
              console.log('🔍 [USER_DASHBOARD] Skipping old booking for review:', updatedBooking.id);
              return;
            }
            
            // Skip if we've already shown the review modal for this booking
            if (reviewModalShown.has(updatedBooking.id)) {
              console.log('🔍 [USER_DASHBOARD] Skipping real-time review modal - already shown for booking:', updatedBooking.id);
              return;
            }

            // Check if user has already reviewed this booking
            const { data: existingReview } = await supabase
              .from('reviews')
              .select('id')
              .eq('booking_id', updatedBooking.id)
              .eq('customer_id', userInfo.id)
              .single();

            if (!existingReview) {
              console.log('🔍 [USER_DASHBOARD] Showing real-time review modal for booking:', updatedBooking.id);
              // Get provider name for the review modal
              const { data: booking } = await supabase
                .from('bookings')
                .select(`
                  *,
                  providers (name)
                `)
                .eq('id', updatedBooking.id)
                .single();

              if (booking) {
                setShowReviewModal({
                  isOpen: true,
                  bookingId: updatedBooking.id,
                  providerId: updatedBooking.provider_id,
                  providerName: booking.providers?.name || 'Unknown Provider'
                });
                // Mark this booking as having the review modal shown
                setReviewModalShown(prev => new Set([...prev, updatedBooking.id]));
              }
            } else {
              console.log('🔍 [USER_DASHBOARD] Booking already reviewed in real-time:', updatedBooking.id);
              // Mark this booking as reviewed
              setReviewedBookings(prev => new Set([...prev, updatedBooking.id]));
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userInfo?.id]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('user_token');
      localStorage.removeItem('user_token_data');
      localStorage.removeItem('user_info');
      
      // Dispatch custom event to notify Navigation component
      window.dispatchEvent(new CustomEvent('auth-state-changed'));
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate('/user-login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileUpdate = async (updatedData: Partial<UserInfo> & { newPassword?: string; currentPassword?: string }) => {
    try {
      const { newPassword, currentPassword, ...profileData } = updatedData;
      
      // Update profile information
      const { error: profileError } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', userInfo?.id);

      if (profileError) throw profileError;

      // Handle password change if provided
      if (newPassword && currentPassword) {
        try {
          const { error: passwordError } = await supabase.auth.updateUser({
            password: newPassword
          });

          if (passwordError) {
            // If password update fails, still show success for profile update but warn about password
            toast({
              title: "Profile Updated",
              description: "Profile updated successfully, but password change failed. Please try changing your password again.",
              variant: "default"
            });
          } else {
            toast({
              title: "Profile & Password Updated",
              description: "Your profile and password have been updated successfully.",
            });
          }
        } catch (passwordError: any) {
          toast({
            title: "Profile Updated",
            description: "Profile updated successfully, but password change failed. Please try changing your password again.",
            variant: "default"
          });
        }
      } else {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
      }

      // Update local state
      setUserInfo(prev => prev ? { ...prev, ...profileData } : null);
      setIsEditingProfile(false);
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive"
      });
    }
  };

  // Handle adding/removing favorites
  const toggleFavorite = async (providerId: string, providerName: string) => {
    if (!userInfo?.id) return;

    try {
      // Check if provider is already favorited
      const isFavorited = favorites.some(fav => fav.id === providerId);

      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', userInfo.id)
          .eq('provider_id', providerId);

        if (error) throw error;

        // Update local state
        setFavorites(prev => prev.filter(fav => fav.id !== providerId));
        
        toast({
          title: "Removed from Favorites",
          description: `${providerName} has been removed from your favorites.`,
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: userInfo.id,
            provider_id: providerId
          });

        if (error) throw error;

        // Fetch provider details to add to local state
        const { data: providerData, error: providerError } = await supabase
          .from('providers')
          .select('id, name, service_category, location, rating, profile_image, is_verified')
          .eq('id', providerId)
          .single();

        if (providerError) throw providerError;

        const newFavorite = {
          id: providerData.id,
          name: providerData.name,
          service_category: providerData.service_category,
          rating: providerData.rating || 0,
          location: providerData.location,
          profile_image: providerData.profile_image,
          is_verified: providerData.is_verified,
          favorited_at: new Date().toISOString()
        };

        // Update local state
        setFavorites(prev => [newFavorite, ...prev]);
        
        toast({
          title: "Added to Favorites",
          description: `${providerName} has been added to your favorites.`,
        });
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update favorites.",
        variant: "destructive"
      });
    }
  };

  // Check if a provider is favorited
  const isProviderFavorited = (providerId: string) => {
    return favorites.some(fav => fav.id === providerId);
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleOpenChat = (bookingId: string) => {
    console.log('🔔 [USER_DASHBOARD] handleOpenChat called with bookingId:', bookingId);
    // Navigate to chat view for this booking
    navigate(`/user-dashboard?booking=${bookingId}`);
  };

  const handleCallProvider = (contactPhone: string) => {
    if (!contactPhone) {
      toast({
        title: "Phone Number Not Available",
        description: "This provider's phone number is not available.",
        variant: "destructive"
      });
      return;
    }
    
    // Open phone app with provider's number
    window.open(`tel:${contactPhone}`, '_self');
  };

  const showConfirmationDialog = (bookingId: string, action: string, title: string, description: string) => {
    setConfirmationDialog({
      isOpen: true,
      bookingId,
      action,
      title,
      description
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmationDialog.bookingId || !confirmationDialog.action) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: confirmationDialog.action
        })
        .eq('id', confirmationDialog.bookingId);

      if (error) {
        throw error;
      }

      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === confirmationDialog.bookingId 
            ? { ...booking, status: confirmationDialog.action }
            : booking
        )
      );

      toast({
        title: "Booking Updated",
        description: `Booking has been ${confirmationDialog.action}.`,
      });
    } catch (error: any) {
      console.error('Error updating booking:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update booking.",
        variant: "destructive"
      });
    } finally {
      setConfirmationDialog({
        isOpen: false,
        bookingId: null,
        action: null,
        title: '',
        description: ''
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

  if (!userInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 pt-32">
        {/* Mobile Navigation Tabs */}
        <div className="lg:hidden mb-6">
          <div className="flex overflow-x-auto space-x-2 pb-2">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('dashboard')}
              className="whitespace-nowrap"
            >
              <Home className="w-4 h-4 mr-1" />
              Overview
            </Button>
            <Button
              variant={activeTab === 'bookings' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('bookings')}
              className="whitespace-nowrap"
            >
              <Calendar className="w-4 h-4 mr-1" />
              Bookings
              <NotificationBadge 
                currentUserId={userInfo?.id || ''} 
                currentUserType="user"
                className="ml-1"
              />
            </Button>
            <Button
              variant={activeTab === 'favorites' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('favorites')}
              className="whitespace-nowrap"
            >
              <Heart className="w-4 h-4 mr-1" />
              Favorites
            </Button>
            <Button
              variant={activeTab === 'profile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('profile')}
              className="whitespace-nowrap"
            >
              <User className="w-4 h-4 mr-1" />
              Profile
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('dashboard')}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Overview
                </Button>
                <Button
                  variant={activeTab === 'bookings' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('bookings')}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  My Bookings
                  <NotificationBadge 
                    currentUserId={userInfo?.id || ''} 
                    currentUserType="user"
                    className="ml-auto"
                  />
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
                  Payments
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

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {activeTab === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-bold mb-2">Welcome back, {userInfo.name}!</h2>
                  <p className="text-muted-foreground">Here's what's happening with your account</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <Card>
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs md:text-sm font-medium text-muted-foreground">Total Bookings</p>
                          <p className="text-lg md:text-2xl font-bold">{bookings.length}</p>
                        </div>
                        <Calendar className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs md:text-sm font-medium text-muted-foreground">Favorite Providers</p>
                          <p className="text-lg md:text-2xl font-bold">{favorites.length}</p>
                        </div>
                        <Heart className="h-6 w-6 md:h-8 md:w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs md:text-sm font-medium text-muted-foreground">Payment Methods</p>
                          <p className="text-lg md:text-2xl font-bold">{paymentMethods.length}</p>
                        </div>
                        <CreditCard className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs md:text-sm font-medium text-muted-foreground">Saved Addresses</p>
                          <p className="text-lg md:text-2xl font-bold">{addresses.length}</p>
                        </div>
                        <MapPin className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest bookings and updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {bookings.length > 0 ? (
                      <div className="space-y-4">
                        {bookings.slice(0, 3).map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <p className="font-medium">{booking.provider_name}</p>
                              <p className="text-sm text-muted-foreground">{booking.service_category}</p>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                              <p className="text-sm text-muted-foreground mt-1">
                                {formatDate(booking.booking_date)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No recent activity</h3>
                        <p className="text-muted-foreground">
                          Start booking services to see your activity here.
                        </p>
                        <Button className="mt-4" onClick={() => navigate('/services')}>
                          Browse Services
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Other tabs will be implemented similarly */}
            {activeTab === 'bookings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-bold mb-2">My Bookings</h2>
                  <p className="text-muted-foreground">Manage your service bookings</p>
                </div>
                
                {bookings.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Bookings Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        You haven't made any bookings yet. Start by exploring our services!
                      </p>
                      <Button asChild>
                        <Link to="/services">Browse Services</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-1">{booking.provider_name}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{booking.service_category}</p>
                              <div className="flex items-center gap-4 text-sm">
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
                            </div>
                            <div className="text-right">
                              <Badge className={`mb-2 ${getStatusColor(booking.status)}`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </Badge>
                              <p className="text-lg font-bold text-primary">
                                Rs. {booking.total_amount.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          {/* Selected Services */}
                          {booking.selected_services && booking.selected_services.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">Selected Services:</h4>
                              <div className="flex flex-wrap gap-2">
                                {booking.selected_services.map((service: any, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {service.job} - Rs. {service.price.toLocaleString()}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Special Instructions */}
                          {booking.special_instructions && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Special Instructions:</h4>
                              <p className="text-sm text-muted-foreground">{booking.special_instructions}</p>
                            </div>
                          )}

                          {/* Payment Information */}
                          {booking.payment_method && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Payment Information:</h4>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={booking.payment_status === 'paid' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {booking.payment_status === 'paid' ? 'Paid' : 
                                   booking.payment_status === 'pending' ? 'Pending' : 
                                   booking.payment_status === 'failed' ? 'Failed' : 'Unknown'}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {booking.payment_method_name || 'Cash on Delivery'}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t gap-3">
                            <span className="text-xs text-muted-foreground">
                              Booked on {formatDate(booking.created_at)}
                            </span>
                            <div className="flex flex-wrap gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setShowChatForBooking(showChatForBooking === booking.id ? null : booking.id)}
                                className="flex-1 sm:flex-none"
                              >
                                <MessageSquare className="w-4 h-4 mr-1" />
                                {showChatForBooking === booking.id ? 'Hide Chat' : 'Chat'}
                                <NotificationBadge 
                                  currentUserId={userInfo?.id || ''} 
                                  currentUserType="user"
                                  className="ml-1"
                                />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleCallProvider(booking.contact_phone)}
                                className="flex-1 sm:flex-none"
                              >
                                <Phone className="w-4 h-4 mr-1" />
                                Call
                              </Button>
                              {booking.status === 'pending' && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                                  onClick={() => showConfirmationDialog(booking.id, 'cancelled', 'Cancel Booking', 'Are you sure you want to cancel this booking? This action cannot be undone.')}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                        
                      </Card>
                     ))}
                   </div>
                 )}
              </motion.div>
            )}

            {activeTab === 'favorites' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Favorite Providers</h2>
                  <p className="text-muted-foreground">Your saved service providers</p>
                </div>

                {favorites.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Favorites Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start adding service providers to your favorites by clicking the heart icon on their cards!
                      </p>
                      <Button asChild>
                        <Link to="/services">Browse Services</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {favorites.map((favorite) => (
                      <Card key={favorite.id} className="group hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-4 md:p-6">
                          <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              {favorite.profile_image ? (
                                <img
                                  src={favorite.profile_image}
                                  alt={favorite.name}
                                  className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-lg md:text-2xl font-bold text-primary">
                                    {favorite.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <h3 className="font-semibold text-sm md:text-base truncate pr-2">
                                  {favorite.name}
                                  {favorite.is_verified && (
                                    <span className="ml-1 text-blue-500">✓</span>
                                  )}
                                </h3>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleFavorite(favorite.id, favorite.name);
                                  }}
                                >
                                  <Heart className="w-4 h-4 fill-current" />
                                </Button>
                              </div>
                              <p className="text-xs md:text-sm text-muted-foreground mb-2">
                                {favorite.service_category}
                              </p>
                              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-2">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                                  <span>{favorite.rating.toFixed(1)}</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1 truncate">
                                  <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                  <span className="truncate">{favorite.location}</span>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Added on {new Date(favorite.favorited_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button asChild size="sm" className="flex-1">
                              <Link to={`/provider/${favorite.id}`}>
                                <Eye className="w-4 h-4 mr-1" />
                                View Profile
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'payments' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-bold mb-2">Payment Methods</h2>
                  <p className="text-muted-foreground">Manage your payment options</p>
                </div>
                {/* Payments content */}
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">Profile</h2>
                    <p className="text-muted-foreground">Manage your personal information</p>
                  </div>
                  <Button onClick={() => setIsEditingProfile(!isEditingProfile)} className="w-full sm:w-auto">
                    <Edit className="w-4 h-4 mr-2" />
                    {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      {isEditingProfile 
                        ? "Update your personal details below. Email cannot be changed." 
                        : "Your current personal information"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
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
                {/* Settings content */}
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Message Notifications */}
      {userInfo && (
        <MessageNotification 
          currentUserId={userInfo.id} 
          currentUserType="user" 
        />
      )}

      {/* Chat Modal - rendered outside tab content so it's always available */}
      {showChatForBooking && userInfo && (
        <ChatModal
          isOpen={!!showChatForBooking}
          onClose={() => setShowChatForBooking(null)}
          bookingId={showChatForBooking}
          currentUserId={userInfo.id}
          currentUserType="user"
        />
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmationDialog.isOpen} onOpenChange={(open) => {
        if (!open) {
          setConfirmationDialog({
            isOpen: false,
            bookingId: null,
            action: null,
            title: '',
            description: ''
          });
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmationDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Review Modal */}
      {showReviewModal && userInfo && (
        <ReviewModal
          isOpen={showReviewModal.isOpen}
          onClose={() => {
            // Mark this booking as having the review modal shown (user closed without submitting)
            if (showReviewModal) {
              setReviewModalShown(prev => new Set([...prev, showReviewModal.bookingId]));
            }
            setShowReviewModal(null);
          }}
          bookingId={showReviewModal.bookingId}
          providerId={showReviewModal.providerId}
          providerName={showReviewModal.providerName}
          userId={userInfo.id}
          onReviewSubmitted={() => {
            // Mark this booking as reviewed to prevent showing the modal again
            if (showReviewModal) {
              setReviewedBookings(prev => new Set([...prev, showReviewModal.bookingId]));
              setReviewModalShown(prev => new Set([...prev, showReviewModal.bookingId]));
            }
            
            // Close the review modal
            setShowReviewModal(null);
            
            // Show success message
            toast({
              title: "Review Submitted",
              description: "Thank you for your review!",
            });
          }}
        />
      )}
    </div>
  );
};

// Profile View Component
const ProfileView = ({ userInfo }: { userInfo: UserInfo }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
        <p className="text-base md:text-lg font-medium">{userInfo.name}</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Email</label>
        <div className="flex items-center gap-2">
          <p className="text-base md:text-lg">{userInfo.email}</p>
          <Badge variant="secondary" className="text-xs">Cannot be changed</Badge>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Phone</label>
        <p className="text-base md:text-lg">{userInfo.phone}</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Member Since</label>
        <p className="text-base md:text-lg">{new Date(userInfo.created_at).toLocaleDateString()}</p>
      </div>
    </div>
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">Address</label>
      <p className="text-base md:text-lg">{userInfo.address}</p>
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
  onSave: (data: Partial<UserInfo> & { newPassword?: string; currentPassword?: string }) => void; 
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: userInfo.name,
    phone: userInfo.phone,
    address: userInfo.address
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    return errors;
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'newPassword') {
      setPasswordErrors(validatePassword(value));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password if changing
    if (showPasswordSection && passwordData.newPassword) {
      if (passwordErrors.length > 0) {
        toast({
          title: "Password Error",
          description: "Please fix password requirements before saving.",
          variant: "destructive"
        });
        return;
      }
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "New password and confirmation don't match.",
          variant: "destructive"
        });
        return;
      }
      
      if (!passwordData.currentPassword) {
        toast({
          title: "Current Password Required",
          description: "Please enter your current password to change it.",
          variant: "destructive"
        });
        return;
      }
    }

    // Include password data if changing password
    const updateData = {
      ...formData,
      ...(showPasswordSection && passwordData.newPassword ? {
        newPassword: passwordData.newPassword,
        currentPassword: passwordData.currentPassword
      } : {})
    };
    
    onSave(updateData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={userInfo.email}
              disabled
              className="w-full bg-muted"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            className="w-full"
            placeholder="e.g., +92 300 1234567"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address *</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={3}
            required
            className="w-full resize-none"
            placeholder="Enter your complete address..."
          />
        </div>
      </div>

      {/* Password Section */}
      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Password</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setShowPasswordSection(!showPasswordSection);
              if (!showPasswordSection) {
                setPasswordData({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                });
                setPasswordErrors([]);
              }
            }}
          >
            {showPasswordSection ? 'Cancel Password Change' : 'Change Password'}
          </Button>
        </div>
        
        {showPasswordSection && (
          <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password *</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                required
                className="w-full"
                placeholder="Enter your current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password *</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                required
                className="w-full"
                placeholder="Enter your new password"
              />
              {passwordErrors.length > 0 && (
                <div className="text-sm text-red-600 space-y-1">
                  {passwordErrors.map((error, index) => (
                    <p key={index}>• {error}</p>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                required
                className="w-full"
                placeholder="Confirm your new password"
              />
              {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-sm text-red-600">Passwords don't match</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
        <Button type="submit" className="flex-1 sm:flex-none">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 sm:flex-none">
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default UserDashboard; 