import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, MessageSquare, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  chat_room_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface NotificationDropdownProps {
  currentUserId: string;
  currentUserType: 'user' | 'provider';
}

const NotificationDropdown = ({ currentUserId, currentUserType }: NotificationDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch recent notifications
  useEffect(() => {
    if (!currentUserId) return;

    const fetchNotifications = async () => {
      try {
        // Get chat rooms for this user
        const { data: chatRooms } = await supabase
          .from('chat_rooms')
          .select('id')
          .eq(currentUserType === 'user' ? 'user_id' : 'provider_id', currentUserId);

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

          if (messages) {
            // Get sender names
            const notificationsWithNames = await Promise.all(
              messages.map(async (message) => {
                let senderName = 'Unknown';
                
                if (message.sender_type === 'provider') {
                  const { data: provider } = await supabase
                    .from('providers')
                    .select('name')
                    .eq('id', message.sender_id)
                    .single();
                  senderName = provider?.name || 'Provider';
                } else {
                  const { data: user } = await supabase
                    .from('users')
                    .select('name')
                    .eq('id', message.sender_id)
                    .single();
                  senderName = user?.name || 'User';
                }

                return {
                  id: message.id,
                  chat_room_id: message.chat_room_id,
                  sender_name: senderName,
                  content: message.content,
                  created_at: message.created_at,
                  is_read: message.is_read
                };
              })
            );

            setNotifications(notificationsWithNames);
            setUnreadCount(notificationsWithNames.length);
          }
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [currentUserId, currentUserType]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!currentUserId) return;

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
              // Get sender name
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

              const newNotification: Notification = {
                id: newMessage.id,
                chat_room_id: newMessage.chat_room_id,
                sender_name: senderName,
                content: newMessage.content,
                created_at: newMessage.created_at,
                is_read: false
              };

              setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
              setUnreadCount(prev => prev + 1);
            }
          }
        }
      )
      .subscribe();

    return () => {
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
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read when dropdown is opened
  const markAllAsRead = async () => {
    if (notifications.length === 0) return;
    
    try {
      const messageIds = notifications.map(n => n.id);
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .in('id', messageIds);
      
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && notifications.length > 0) {
            markAllAsRead();
          }
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
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
                    className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">
                            {notification.sender_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(notification.created_at)}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {notification.content}
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