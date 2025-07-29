import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface NotificationBadgeProps {
  currentUserId: string;
  currentUserType: 'user' | 'provider';
  className?: string;
}

const NotificationBadge = ({ currentUserId, currentUserType, className = "" }: NotificationBadgeProps) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  // Fetch initial unread count
  useEffect(() => {
    if (!currentUserId) return;

    const fetchUnreadCount = async () => {
      try {
        // Get all bookings for this user/provider
        let bookingsQuery;
        if (currentUserType === 'user') {
          bookingsQuery = supabase
            .from('bookings')
            .select('id')
            .eq('user_id', currentUserId);
        } else {
          bookingsQuery = supabase
            .from('bookings')
            .select('id')
            .eq('provider_id', currentUserId);
        }

        const { data: bookings } = await bookingsQuery;

        if (bookings && bookings.length > 0) {
          const bookingIds = bookings.map(booking => booking.id);
          
          // Get chat rooms for these bookings
          const { data: chatRooms } = await supabase
            .from('chat_rooms')
            .select('id')
            .in('booking_id', bookingIds);

          if (chatRooms && chatRooms.length > 0) {
            const roomIds = chatRooms.map(room => room.id);
            
            // Count unread messages
            const { data: unreadMessages } = await supabase
              .from('chat_messages')
              .select('id')
              .in('chat_room_id', roomIds)
              .eq('is_read', false)
              .neq('sender_id', currentUserId);

            setUnreadCount(unreadMessages?.length || 0);
            setHasNewMessages((unreadMessages?.length || 0) > 0);
          }
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
  }, [currentUserId, currentUserType]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!currentUserId) return;

    const subscription = supabase
      .channel(`notifications_${currentUserId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `sender_id=neq.${currentUserId}`
        },
        async (payload) => {
          const newMessage = payload.new as any;
          
          // Check if this message is for this user
          const { data: chatRoom } = await supabase
            .from('chat_rooms')
            .select('*')
            .eq('id', newMessage.chat_room_id)
            .single();

          if (chatRoom) {
            const isForThisUser = currentUserType === 'user' 
              ? chatRoom.user_id === currentUserId 
              : chatRoom.provider_id === currentUserId;

            if (isForThisUser) {
              setUnreadCount(prev => prev + 1);
              setHasNewMessages(true);
              
              // Add visual feedback
              const badge = document.getElementById('notification-badge');
              if (badge) {
                badge.classList.add('animate-pulse');
                setTimeout(() => {
                  badge.classList.remove('animate-pulse');
                }, 2000);
              }
            }
          }
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `sender_id=neq.${currentUserId}`
        },
        async (payload) => {
          const updatedMessage = payload.new as any;
          
          // If message was marked as read, update count
          if (updatedMessage.is_read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
            if (unreadCount <= 1) {
              setHasNewMessages(false);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUserId, currentUserType, unreadCount]);

  // Refetch unread count when component mounts or user changes
  useEffect(() => {
    if (!currentUserId) return;

    const fetchUnreadCount = async () => {
      try {
        // Get all chat rooms for this user
        const { data: chatRooms } = await supabase
          .from('chat_rooms')
          .select('id')
          .eq(currentUserType === 'user' ? 'user_id' : 'provider_id', currentUserId);

        if (chatRooms && chatRooms.length > 0) {
          const roomIds = chatRooms.map(room => room.id);
          
          // Count unread messages
          const { data: unreadMessages } = await supabase
            .from('chat_messages')
            .select('id')
            .in('chat_room_id', roomIds)
            .eq('is_read', false)
            .neq('sender_id', currentUserId);

          setUnreadCount(unreadMessages?.length || 0);
          setHasNewMessages((unreadMessages?.length || 0) > 0);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    // Fetch immediately
    fetchUnreadCount();

    // Set up interval to refetch every 5 seconds
    const interval = setInterval(fetchUnreadCount, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [currentUserId, currentUserType]);

  return (
    <div className={`relative ${className}`}>
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <Badge 
          id="notification-badge"
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white border-2 border-white"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </div>
  );
};

export default NotificationBadge; 