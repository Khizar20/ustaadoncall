import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, MessageSquare, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  chat_room_id?: string;
  booking_id?: string;
  sender_name?: string;
  content?: string;
  created_at: string;
  is_read: boolean;
  unread_count?: number; // Number of unread messages in this chat room
  // For booking notifications
  notification_type?: string;
  title?: string;
  message?: string;
  request_id?: string;
  type: 'chat' | 'booking'; // To distinguish between chat and booking notifications
}

interface NotificationDropdownProps {
  currentUserId: string;
  currentUserType: 'user' | 'provider';
  onOpenChat?: (bookingId: string) => void;
}

const NotificationDropdown = ({ currentUserId, currentUserType, onOpenChat }: NotificationDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch recent notifications
  useEffect(() => {
    if (!currentUserId) return;

    const fetchNotifications = async () => {
      try {
        console.log('🔔 [NOTIFICATIONS] Fetching notifications for:', { currentUserId, currentUserType });
        
        const allNotifications: Notification[] = [];
        
        // 1. Fetch chat notifications
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
        console.log('🔔 [NOTIFICATIONS] Found bookings:', bookings);

        if (bookings && bookings.length > 0) {
          const bookingIds = bookings.map(booking => booking.id);
          
          // Get chat rooms for these bookings
          const { data: chatRooms } = await supabase
            .from('chat_rooms')
            .select('id, booking_id')
            .in('booking_id', bookingIds);

          console.log('🔔 [NOTIFICATIONS] Found chat rooms:', chatRooms);

          if (chatRooms && chatRooms.length > 0) {
            const roomIds = chatRooms.map(room => room.id);
          
            // Get recent unread messages
            const { data: messages } = await supabase
              .from('chat_messages')
              .select(`
                id,
                content,
                created_at,
                is_read,
                chat_room_id,
                sender_id,
                sender_type
              `)
              .in('chat_room_id', roomIds)
              .eq('is_read', false)
              .neq('sender_id', currentUserId)
              .order('created_at', { ascending: false })
              .limit(5);

            console.log('🔔 [NOTIFICATIONS] Found unread messages:', messages);

            if (messages) {
              // Group messages by chat room
              const groupedMessages = messages.reduce((acc, message) => {
                if (!acc[message.chat_room_id]) {
                  acc[message.chat_room_id] = [];
                }
                acc[message.chat_room_id].push(message);
                return acc;
              }, {} as Record<string, any[]>);

              console.log('🔔 [NOTIFICATIONS] Grouped messages by chat room:', groupedMessages);

              // Create one notification per chat room
              const chatNotifications = await Promise.all(
                Object.entries(groupedMessages).map(async ([chatRoomId, roomMessages]) => {
                  const latestMessage = roomMessages[0]; // Messages are ordered by created_at desc
                  
                  let senderName = 'Unknown';
                  
                  if (latestMessage.sender_type === 'provider') {
                    const { data: provider } = await supabase
                      .from('providers')
                      .select('name')
                      .eq('id', latestMessage.sender_id)
                      .single();
                    senderName = provider?.name || 'Provider';
                  } else {
                    const { data: user } = await supabase
                      .from('users')
                      .select('name')
                      .eq('id', latestMessage.sender_id)
                      .single();
                    senderName = user?.name || 'User';
                  }

                  // Find the chat room for this message to get booking_id
                  const chatRoom = chatRooms.find(room => room.id === chatRoomId);
                  
                  return {
                    id: `chat-${chatRoomId}-${latestMessage.id}`, // Unique ID for the notification
                    chat_room_id: chatRoomId,
                    booking_id: chatRoom?.booking_id || '',
                    sender_name: senderName,
                    content: latestMessage.content,
                    created_at: latestMessage.created_at,
                    is_read: false,
                    unread_count: roomMessages.length,
                    type: 'chat' as const
                  };
                })
              );

              allNotifications.push(...chatNotifications);
            }
          }
        }

        // 2. Fetch booking notifications from user_notifications table
        if (currentUserType === 'user') {
          console.log('🔔 [NOTIFICATIONS] Fetching booking notifications for user:', currentUserId);
          
          const { data: bookingNotifications, error: bookingError } = await supabase
            .from('user_notifications')
            .select('*')
            .eq('user_id', currentUserId)
            .not('notification_type', 'is', null) // Only get notifications with notification_type
            .order('created_at', { ascending: false })
            .limit(10);

          if (bookingError) {
            console.error('❌ [NOTIFICATIONS] Error fetching booking notifications:', bookingError);
          } else if (bookingNotifications) {
            console.log('🔔 [NOTIFICATIONS] Found booking notifications:', bookingNotifications);
            
            const formattedBookingNotifications = bookingNotifications.map(notification => ({
              id: `booking-${notification.id}`,
              title: notification.title,
              message: notification.message,
              notification_type: notification.notification_type,
              created_at: notification.created_at,
              is_read: notification.is_read,
              type: 'booking' as const
            }));

            console.log('🔔 [NOTIFICATIONS] Formatted booking notifications:', formattedBookingNotifications);
            allNotifications.push(...formattedBookingNotifications);
          } else {
            console.log('🔔 [NOTIFICATIONS] No booking notifications found for user:', currentUserId);
          }
        }

        // Sort all notifications by created_at (newest first)
        allNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        console.log('🔔 [NOTIFICATIONS] All processed notifications:', allNotifications);
        setNotifications(allNotifications);
        setUnreadCount(allNotifications.filter(n => !n.is_read).length);
        
        // Debug: Log the final state
        console.log('🔔 [NOTIFICATIONS] Final notification count:', allNotifications.length);
        console.log('🔔 [NOTIFICATIONS] Final unread count:', allNotifications.filter(n => !n.is_read).length);
      } catch (error) {
        console.error('❌ [NOTIFICATIONS] Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [currentUserId, currentUserType]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!currentUserId) return;

    console.log('🔔 [NOTIFICATIONS] Setting up real-time subscription for:', currentUserId);

    const subscription = supabase
      .channel(`notifications_dropdown_${currentUserId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `sender_id=neq.${currentUserId}`
        },
        async (payload) => {
          console.log('🔔 [NOTIFICATIONS] New message received:', payload);
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
              console.log('🔔 [NOTIFICATIONS] New message belongs to current user');
              
              // Get sender name first
              let senderName = 'Unknown';
              if (newMessage.sender_type === 'provider') {
                const { data: provider } = await supabase
                  .from('providers')
                  .select('name')
                  .eq('id', newMessage.sender_id)
                  .single();
                senderName = provider?.name || 'Provider';
              } else {
                const { data: user } = await supabase
                  .from('users')
                  .select('name')
                  .eq('id', newMessage.sender_id)
                  .single();
                senderName = user?.name || 'User';
              }

              // Check if we already have a notification for this chat room
              setNotifications(prev => {
                const existingNotificationIndex = prev.findIndex(n => n.chat_room_id === newMessage.chat_room_id);
                
                if (existingNotificationIndex !== -1) {
                  // Update existing notification with new message content and increment unread count
                  const updatedNotifications = [...prev];
                  updatedNotifications[existingNotificationIndex] = {
                    ...updatedNotifications[existingNotificationIndex],
                    content: newMessage.content,
                    created_at: newMessage.created_at,
                    unread_count: (updatedNotifications[existingNotificationIndex].unread_count || 0) + 1,
                    type: 'chat' as const
                  };
                  console.log('🔔 [NOTIFICATIONS] Updated existing notification for chat room:', newMessage.chat_room_id);
                  return updatedNotifications;
                } else {
                  // Create new notification for this chat room
                  const newNotification: Notification = {
                    id: `chat-${newMessage.chat_room_id}-${newMessage.id}`,
                    chat_room_id: newMessage.chat_room_id,
                    booking_id: chatRoom.booking_id,
                    sender_name: senderName,
                    content: newMessage.content,
                    created_at: newMessage.created_at,
                    is_read: false,
                    unread_count: 1,
                    type: 'chat' as const
                  };

                  console.log('🔔 [NOTIFICATIONS] Adding new notification for chat room:', newMessage.chat_room_id);
                  return [newNotification, ...prev.slice(0, 4)];
                }
              });
              
              setUnreadCount(prev => {
                const existingNotification = notifications.find(n => n.chat_room_id === newMessage.chat_room_id);
                return existingNotification ? prev : prev + 1;
              });
            }
          }
        }
      )
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${currentUserId}`
        },
        (payload) => {
          console.log('🔔 [NOTIFICATIONS] New booking notification received:', payload);
          const newNotification = payload.new as any;
          
          if (newNotification.notification_type) {
            console.log('🔔 [NOTIFICATIONS] Processing booking notification:', newNotification);
            
            const bookingNotification: Notification = {
              id: `booking-${newNotification.id}`,
              title: newNotification.title,
              message: newNotification.message,
              notification_type: newNotification.notification_type,
              created_at: newNotification.created_at,
              is_read: newNotification.is_read,
              type: 'booking' as const
            };

            console.log('🔔 [NOTIFICATIONS] Adding booking notification to state:', bookingNotification);
            setNotifications(prev => [bookingNotification, ...prev.slice(0, 4)]);
            setUnreadCount(prev => prev + 1);
          } else {
            console.log('🔔 [NOTIFICATIONS] Ignoring notification without notification_type:', newNotification);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔔 [NOTIFICATIONS] Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, [currentUserId, currentUserType]);

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return messageTime.toLocaleDateString();
  };

  const markAsRead = async (notificationId: string) => {
    try {
      console.log('🔔 [NOTIFICATIONS] Marking notification as read:', notificationId);
      
      // Find the notification to get the details
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) {
        console.error('❌ [NOTIFICATIONS] Notification not found:', notificationId);
        return;
      }

      if (notification.type === 'chat' && notification.chat_room_id) {
        // Mark all unread messages in this chat room as read
        const { error } = await supabase
          .from('chat_messages')
          .update({ is_read: true })
          .eq('chat_room_id', notification.chat_room_id)
          .eq('is_read', false)
          .neq('sender_id', currentUserId);

        if (error) {
          console.error('❌ [NOTIFICATIONS] Error marking messages as read:', error);
          return;
        }
        
        console.log('✅ [NOTIFICATIONS] Successfully marked all messages in chat room as read');
      } else if (notification.type === 'booking') {
        // Mark booking notification as read
        const bookingNotificationId = notificationId.replace('booking-', '');
        const { error } = await supabase
          .from('user_notifications')
          .update({ is_read: true })
          .eq('id', bookingNotificationId);

        if (error) {
          console.error('❌ [NOTIFICATIONS] Error marking booking notification as read:', error);
          return;
        }
        
        console.log('✅ [NOTIFICATIONS] Successfully marked booking notification as read');
      }
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Dispatch a custom event to notify other components
      console.log('🔔 [NOTIFICATIONS] Dispatching notifications-updated event for:', currentUserId, currentUserType);
      window.dispatchEvent(new CustomEvent('notifications-updated', {
        detail: { userId: currentUserId, userType: currentUserType }
      }));
    } catch (error) {
      console.error('❌ [NOTIFICATIONS] Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read when dropdown is opened
  const markAllAsRead = async () => {
    if (notifications.length === 0) return;
    
    try {
      console.log('🔔 [NOTIFICATIONS] Marking all notifications as read');
      
      // Separate chat and booking notifications
      const chatNotifications = notifications.filter(n => n.type === 'chat');
      const bookingNotifications = notifications.filter(n => n.type === 'booking');
      
      // Mark all unread messages from all chat rooms as read
      const chatRoomIds = chatNotifications.map(n => n.chat_room_id).filter(Boolean);
      
      if (chatRoomIds.length > 0) {
        await supabase
          .from('chat_messages')
          .update({ is_read: true })
          .in('chat_room_id', chatRoomIds)
          .eq('is_read', false)
          .neq('sender_id', currentUserId);
      }
      
      // Mark all booking notifications as read
      if (bookingNotifications.length > 0 && currentUserType === 'user') {
        const bookingNotificationIds = bookingNotifications.map(n => n.id.replace('booking-', ''));
        await supabase
          .from('user_notifications')
          .update({ is_read: true })
          .in('id', bookingNotificationIds);
      }
      
      setNotifications([]);
      setUnreadCount(0);
      
      // Dispatch a custom event to notify other components
      console.log('🔔 [NOTIFICATIONS] Dispatching notifications-updated event for markAllAsRead:', currentUserId, currentUserType);
      window.dispatchEvent(new CustomEvent('notifications-updated', {
        detail: { userId: currentUserId, userType: currentUserType }
      }));
    } catch (error) {
      console.error('❌ [NOTIFICATIONS] Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    console.log('🔔 [NOTIFICATIONS] Notification clicked:', notification);
    
    if (notification.type === 'chat' && onOpenChat && notification.booking_id) {
      console.log('🔔 [NOTIFICATIONS] Opening chat for booking:', notification.booking_id);
      
      // Mark this specific message as read
      markAsRead(notification.id);
      
      // Open the chat
      onOpenChat(notification.booking_id);
      setIsOpen(false);
    } else if (notification.type === 'booking') {
      console.log('🔔 [NOTIFICATIONS] Booking notification clicked:', notification.title);
      
      // Mark this booking notification as read
      markAsRead(notification.id);
      setIsOpen(false);
    } else {
      console.error('❌ [NOTIFICATIONS] onOpenChat not provided or booking_id missing for chat notification');
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log('🔔 [NOTIFICATIONS] Toggle dropdown, current state:', isOpen);
          setIsOpen(!isOpen);
        }}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Notifications</h3>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      Mark All Read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No new messages</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleNotificationClick(notification)}
                    title={notification.type === 'chat' ? "Click to open chat" : "Click to mark as read"}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        {notification.type === 'chat' ? (
                          <MessageSquare className="w-4 h-4 text-primary" />
                        ) : (
                          <Bell className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">
                              {notification.type === 'chat' 
                                ? notification.sender_name 
                                : notification.title
                              }
                            </p>
                            {notification.type === 'chat' && notification.unread_count > 1 && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-600">
                                {notification.unread_count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(notification.created_at)}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {notification.type === 'chat' 
                            ? notification.content 
                            : notification.message
                          }
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                >
                  View All Messages
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown; 