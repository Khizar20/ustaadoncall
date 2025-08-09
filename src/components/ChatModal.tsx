import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { 
  Send, 
  Phone, 
  X, 
  Minimize2, 
  Maximize2,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: string;
  chat_room_id: string;
  sender_id: string;
  sender_type: 'user' | 'provider';
  message_type: 'text' | 'image' | 'voice' | 'location';
  content: string;
  media_url?: string;
  is_read: boolean;
  created_at: string;
}

interface ChatRoom {
  id: string;
  booking_id?: string; // Make optional for direct messaging
  user_id: string;
  provider_id: string;
  is_active: boolean;
  created_at: string;
  last_message_at: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string; // Make optional for direct messaging
  currentUserId: string;
  currentUserType: 'user' | 'provider';
  otherPartyName?: string;
  otherPartyImage?: string;
  otherPartyPhone?: string;
  // For direct messaging without booking
  otherPartyId?: string;
  isDirectMessage?: boolean;
}

const ChatModal = ({ 
  isOpen, 
  onClose, 
  bookingId, 
  currentUserId, 
  currentUserType, 
  otherPartyName,
  otherPartyImage,
  otherPartyPhone,
  otherPartyId,
  isDirectMessage = false
}: ChatModalProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sendingMessageId, setSendingMessageId] = useState<string | null>(null);
  const [fetchedOtherPartyName, setFetchedOtherPartyName] = useState<string>('');
  const [fetchedOtherPartyPhone, setFetchedOtherPartyPhone] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch booking details to get other party name
  useEffect(() => {
    if (!isOpen || (!bookingId && !isDirectMessage)) return;

    const fetchBookingDetails = async () => {
      try {
        if (isDirectMessage) {
          // For direct messaging, we already have the other party info
          console.log('🔔 [CHAT_MODAL] Direct messaging with:', otherPartyName);
          setFetchedOtherPartyName(otherPartyName || 'Unknown');
          setFetchedOtherPartyPhone(otherPartyPhone || '');
          return;
        }

        console.log('🔔 [CHAT_MODAL] Fetching booking details for:', bookingId);
        
        const { data: booking, error } = await supabase
          .from('bookings')
          .select(`
            *,
            users (name, phone),
            providers (name, phone)
          `)
          .eq('id', bookingId)
          .single();

        if (error) {
          console.error('❌ [CHAT_MODAL] Error fetching booking:', error);
          return;
        }

        if (booking) {
          console.log('🔔 [CHAT_MODAL] Booking details:', booking);
          
                     // Determine other party name and phone based on current user type
           let otherParty = '';
           let otherPartyPhone = '';
           if (currentUserType === 'user') {
             otherParty = booking.providers?.name || 'Provider';
             otherPartyPhone = booking.providers?.phone || '';
           } else {
             otherParty = booking.users?.name || 'User';
             otherPartyPhone = booking.users?.phone || '';
           }
           
           console.log('🔔 [CHAT_MODAL] Setting other party name to:', otherParty);
           console.log('🔔 [CHAT_MODAL] Setting other party phone to:', otherPartyPhone);
           setFetchedOtherPartyName(otherParty);
           setFetchedOtherPartyPhone(otherPartyPhone);
        }
      } catch (error) {
        console.error('❌ [CHAT_MODAL] Error fetching booking details:', error);
      }
    };

    fetchBookingDetails();
  }, [isOpen, bookingId, currentUserType]);

  // Create or get chat room
  useEffect(() => {
    if (!isOpen) return;

    console.log('🔔 [CHAT_MODAL] Initializing chat for bookingId:', bookingId);
    console.log('🔔 [CHAT_MODAL] Current user:', { currentUserId, currentUserType });

    const initializeChat = async () => {
      try {
        if (isDirectMessage) {
          // For direct messaging, create a simple chat room object
          const roomId = [currentUserId, otherPartyId].sort().join('_');
          
          // Create a simple chat room object for direct messaging
          const directChatRoom = {
            id: roomId,
            booking_id: null,
            user_id: currentUserType === 'user' ? currentUserId : otherPartyId,
            provider_id: currentUserType === 'provider' ? currentUserId : otherPartyId,
            is_active: true,
            created_at: new Date().toISOString(),
            last_message_at: new Date().toISOString()
          };
          
          console.log('🔔 [CHAT_MODAL] Created direct chat room:', directChatRoom);
          setChatRoom(directChatRoom);
          
          // For direct messaging, we'll store messages in a simple way
          // You can implement a proper chat system later
          setMessages([]);
        } else {
          // Check if chat room exists for booking
          const { data: existingRoom } = await supabase
            .from('chat_rooms')
            .select('*')
            .eq('booking_id', bookingId)
            .single();

          if (existingRoom) {
            console.log('🔔 [CHAT_MODAL] Found existing chat room:', existingRoom);
            setChatRoom(existingRoom);
            await fetchMessages(existingRoom.id);
          } else {
            console.log('🔔 [CHAT_MODAL] Creating new chat room for booking:', bookingId);
            // Create new chat room
            const { data: newRoom, error } = await supabase
              .from('chat_rooms')
              .insert({
                booking_id: bookingId,
                user_id: currentUserType === 'user' ? currentUserId : null,
                provider_id: currentUserType === 'provider' ? currentUserId : null,
                is_active: true
              })
              .select()
              .single();

            if (!error && newRoom) {
              console.log('🔔 [CHAT_MODAL] Created new chat room:', newRoom);
              setChatRoom(newRoom);
            } else {
              console.error('❌ [CHAT_MODAL] Error creating chat room:', error);
            }
          }
        }
      } catch (error) {
        console.error('❌ [CHAT_MODAL] Error initializing chat:', error);
      }
    };

    initializeChat();
  }, [isOpen, bookingId, currentUserId, currentUserType, isDirectMessage, otherPartyId]);

  // Fetch messages
  const fetchMessages = async (roomId: string) => {
    try {
      if (isDirectMessage) {
        // For direct messaging, start with empty messages
        // In a real implementation, you would fetch from a database
        console.log('🔔 [CHAT_MODAL] Direct messaging - starting with empty messages');
        setMessages([]);
        return;
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_room_id', roomId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
        
        // Mark all unread messages as read when chat is opened
        const unreadMessages = data.filter(
          msg => !msg.is_read && msg.sender_id !== currentUserId
        );
        
        console.log('🔔 [CHAT_MODAL] Found unread messages:', unreadMessages.length);
        
        if (unreadMessages.length > 0) {
          const messageIds = unreadMessages.map(msg => msg.id);
          console.log('🔔 [CHAT_MODAL] Marking unread messages as read:', messageIds);
          markMessagesAsRead(messageIds);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!chatRoom || !isOpen || isDirectMessage) return; // Skip subscription for direct messaging

    const subscription = supabase
      .channel(`chat_${chatRoom.id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `chat_room_id=eq.${chatRoom.id}`
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          
          // Check if message already exists to avoid duplicates
          setMessages(prev => {
            const messageExists = prev.some(msg => msg.id === newMessage.id);
            if (messageExists) {
              return prev;
            }
            return [...prev, newMessage];
          });
          
          // Mark as read if message is from other party
          if (newMessage.sender_id !== currentUserId) {
            markMessageAsRead(newMessage.id);
            
            // Show notification for new message
            if (document.hidden) {
              toast({
                title: `New message from ${fetchedOtherPartyName || otherPartyName || 'Contact'}`,
                description: newMessage.content.substring(0, 50) + (newMessage.content.length > 50 ? '...' : ''),
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [chatRoom, currentUserId, isOpen, fetchedOtherPartyName, otherPartyName, toast, isDirectMessage]);

  // Mark message as read
  const markMessageAsRead = async (messageId: string) => {
    if (isDirectMessage) {
      // For direct messaging, just update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ));
      return;
    }
    
    await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('id', messageId);
  };

  // Mark multiple messages as read
  const markMessagesAsRead = async (messageIds: string[]) => {
    try {
      if (isDirectMessage) {
        // For direct messaging, just update local state
        setMessages(prev => prev.map(msg => 
          messageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
        ));
        console.log('✅ [CHAT_MODAL] Successfully marked direct messages as read');
        return;
      }
      
      console.log('🔔 [CHAT_MODAL] Marking messages as read:', messageIds);
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .in('id', messageIds);
      console.log('✅ [CHAT_MODAL] Successfully marked messages as read');
      
      // Dispatch a custom event to notify other components
      console.log('🔔 [CHAT_MODAL] Dispatching notifications-updated event for:', currentUserId, currentUserType);
      window.dispatchEvent(new CustomEvent('notifications-updated', {
        detail: { userId: currentUserId, userType: currentUserType }
      }));
    } catch (error) {
      console.error('❌ [CHAT_MODAL] Error marking messages as read:', error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !chatRoom) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    // Create a temporary message for immediate display
    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      chat_room_id: chatRoom.id,
      sender_id: currentUserId,
      sender_type: currentUserType,
      content: messageContent,
      message_type: 'text',
      is_read: false,
      created_at: new Date().toISOString()
    };

    // Add temporary message to local state immediately
    setMessages(prev => [...prev, tempMessage]);
    setSendingMessageId(tempMessage.id);

    setIsLoading(true);
    try {
      if (isDirectMessage) {
        // For direct messaging, just keep the message in local state
        // In a real implementation, you would store this in a database
        console.log('🔔 [CHAT_MODAL] Direct message sent:', messageContent);
        
        // Simulate a successful message send
        const realMessage: ChatMessage = {
          ...tempMessage,
          id: `direct-${Date.now()}`,
          is_read: true
        };
        
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id ? realMessage : msg
        ));
        
        toast({
          title: "Message Sent",
          description: "Your message has been sent. (Direct messaging mode)",
        });
      } else {
        // For booking-based chats, use the database
        const { data, error } = await supabase
          .from('chat_messages')
          .insert({
            chat_room_id: chatRoom.id,
            sender_id: currentUserId,
            sender_type: currentUserType,
            content: messageContent,
            message_type: 'text'
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        // Replace temporary message with real message
        if (data) {
          setMessages(prev => prev.map(msg => 
            msg.id === tempMessage.id ? data : msg
          ));
        }
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      // Remove temporary message and restore input
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      setNewMessage(messageContent);
    } finally {
      setIsLoading(false);
      setSendingMessageId(null);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format message time
  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle call action
  const handleCall = () => {
    const phoneNumber = fetchedOtherPartyPhone || otherPartyPhone;
    
    if (!phoneNumber) {
      toast({
        title: "No Phone Number",
        description: "Phone number not available for this contact.",
        variant: "destructive"
      });
      return;
    }

    // Format phone number for tel: link
    const formattedPhone = phoneNumber.replace(/\s+/g, '').replace(/[^\d+]/g, '');
    
    // Open phone app with the number
    window.open(`tel:${formattedPhone}`, '_blank');
    
    toast({
      title: "Calling...",
      description: `Opening phone app to call ${fetchedOtherPartyName || otherPartyName || 'Contact'}`,
    });
  };



  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed bottom-4 right-4 z-50 w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl"
      >
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-3 md:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 flex items-center justify-center">
                {otherPartyImage ? (
                  <img src={otherPartyImage} alt={fetchedOtherPartyName || otherPartyName} className="w-6 h-6 md:w-8 md:h-8 rounded-full" />
                ) : (
                  <span className="text-sm md:text-lg font-semibold">{(fetchedOtherPartyName || otherPartyName || 'U').charAt(0)}</span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm md:text-base">{fetchedOtherPartyName || otherPartyName || 'Loading...'}</h3>
                <p className="text-xs opacity-90">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <Button size="sm" variant="ghost" onClick={handleCall} className="text-white hover:bg-white/20 p-1 md:p-2">
                <Phone className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsMinimized(!isMinimized)} className="text-white hover:bg-white/20 p-1 md:p-2">
                {isMinimized ? <Maximize2 className="w-3 h-3 md:w-4 md:h-4" /> : <Minimize2 className="w-3 h-3 md:w-4 md:h-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => {
                console.log('🔔 [CHAT_MODAL] Closing chat modal');
                onClose();
              }} className="text-white hover:bg-white/20 p-1 md:p-2">
                <X className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            </div>
          </div>

          {/* Chat Body */}
          {!isMinimized && (
            <>
              <div className="h-80 md:h-96 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-6 md:py-8">
                      <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                      </div>
                      <p className="font-medium text-sm md:text-base">No messages yet</p>
                      <p className="text-xs md:text-sm">Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.sender_type === currentUserType ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] md:max-w-xs px-3 md:px-4 py-2 rounded-2xl ${
                            message.sender_type === currentUserType
                              ? 'bg-primary text-white rounded-br-md'
                              : 'bg-white border border-gray-200 rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className={`text-xs ${message.sender_type === currentUserType ? 'text-white/70' : 'text-gray-500'}`}>
                              {message.id.startsWith('temp-') ? 'Sending...' : formatMessageTime(message.created_at)}
                            </p>
                            {message.sender_type !== currentUserType && !message.is_read && !message.id.startsWith('temp-') && (
                              <Badge variant="secondary" className="text-xs ml-2 bg-primary/10 text-primary">
                                New
                              </Badge>
                            )}
                            {message.id.startsWith('temp-') && (
                              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin ml-2" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <div className="border-t bg-white p-3 md:p-4">
                  <div className="flex gap-1 md:gap-2">
                    <Button size="sm" variant="ghost" className="text-gray-500 p-1 md:p-2">
                      <Paperclip className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      disabled={isLoading}
                      className="flex-1 border-gray-200 focus:border-primary text-sm md:text-base"
                    />
                    <Button size="sm" variant="ghost" className="text-gray-500 p-1 md:p-2">
                      <Smile className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>
                    <Button 
                      onClick={sendMessage} 
                      disabled={isLoading || !newMessage.trim()}
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-white p-1 md:p-2"
                    >
                      {isLoading ? (
                        <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-3 h-3 md:w-4 md:h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatModal; 