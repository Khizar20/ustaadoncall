import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface NotificationState {
  unreadCount: number;
  lastUpdated: number;
}

export const useNotifications = (currentUserId: string, currentUserType: 'user' | 'provider') => {
  const [notificationState, setNotificationState] = useState<NotificationState>({
    unreadCount: 0,
    lastUpdated: Date.now()
  });

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

            const count = unreadMessages?.length || 0;
            setNotificationState({
              unreadCount: count,
              lastUpdated: Date.now()
            });
            console.log(`useNotifications: Found ${count} unread messages for ${currentUserType} ${currentUserId}`);
          }
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
  }, [currentUserId, currentUserType]);

  // Real-time subscription for new messages and updates
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
          
          // Check if this message is for this user by checking the booking
          const { data: chatRoom } = await supabase
            .from('chat_rooms')
            .select('booking_id')
            .eq('id', newMessage.chat_room_id)
            .single();

          if (chatRoom) {
            // Check if this booking belongs to the current user
            let bookingQuery;
            if (currentUserType === 'user') {
              bookingQuery = supabase
                .from('bookings')
                .select('id')
                .eq('id', chatRoom.booking_id)
                .eq('user_id', currentUserId);
            } else {
              bookingQuery = supabase
                .from('bookings')
                .select('id')
                .eq('id', chatRoom.booking_id)
                .eq('provider_id', currentUserId);
            }

            const { data: booking } = await bookingQuery;

            if (booking) {
              setNotificationState(prev => ({
                unreadCount: prev.unreadCount + 1,
                lastUpdated: Date.now()
              }));
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
            setNotificationState(prev => ({
              unreadCount: Math.max(0, prev.unreadCount - 1),
              lastUpdated: Date.now()
            }));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUserId, currentUserType]);

  // Function to force refresh notifications
  const refreshNotifications = async () => {
    console.log('🔔 [useNotifications] Refreshing notifications for:', currentUserId, currentUserType);
    
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

          const count = unreadMessages?.length || 0;
          console.log('🔔 [useNotifications] Refreshed unread count:', count);
          
          setNotificationState({
            unreadCount: count,
            lastUpdated: Date.now()
          });
        } else {
          setNotificationState({
            unreadCount: 0,
            lastUpdated: Date.now()
          });
        }
      } else {
        setNotificationState({
          unreadCount: 0,
          lastUpdated: Date.now()
        });
      }
    } catch (error) {
      console.error('❌ [useNotifications] Error refreshing notifications:', error);
    }
  };

  // Listen for notification updates from other components
  useEffect(() => {
    const handleNotificationUpdate = (event: CustomEvent) => {
      const { userId, userType } = event.detail;
      if (userId === currentUserId && userType === currentUserType) {
        console.log('🔔 [useNotifications] Received notification update event');
        refreshNotifications().catch(error => {
          console.error('❌ [useNotifications] Error in refreshNotifications:', error);
        });
      }
    };

    window.addEventListener('notifications-updated', handleNotificationUpdate as EventListener);
    
    return () => {
      window.removeEventListener('notifications-updated', handleNotificationUpdate as EventListener);
    };
  }, [currentUserId, currentUserType]);

  return {
    unreadCount: notificationState.unreadCount,
    lastUpdated: notificationState.lastUpdated,
    refreshNotifications
  };
}; 