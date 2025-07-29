import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { 
  Send, 
  Phone, 
  Video, 
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
  booking_id: string;
  user_id: string;
  provider_id: string;
  is_active: boolean;
  created_at: string;
  last_message_at: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  currentUserId: string;
  currentUserType: 'user' | 'provider';
  otherPartyName: string;
  otherPartyImage?: string;
}

const ChatModal = ({ 
  isOpen, 
  onClose, 
  bookingId, 
  currentUserId, 
  currentUserType, 
  otherPartyName,
  otherPartyImage 
}: ChatModalProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Create or get chat room
  useEffect(() => {
    if (!isOpen) return;

    const initializeChat = async () => {
      try {
        // Check if chat room exists
        const { data: existingRoom } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('booking_id', bookingId)
          .single();

        if (existingRoom) {
          setChatRoom(existingRoom);
          await fetchMessages(existingRoom.id);
        } else {
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
            setChatRoom(newRoom);
          }
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    initializeChat();
  }, [isOpen, bookingId, currentUserId, currentUserType]);

  // Fetch messages
  const fetchMessages = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_room_id', roomId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!chatRoom || !isOpen) return;

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
          setMessages(prev => [...prev, newMessage]);
          
          // Mark as read if message is from other party
          if (newMessage.sender_id !== currentUserId) {
            markMessageAsRead(newMessage.id);
            
            // Show notification for new message
            if (document.hidden) {
              toast({
                title: `New message from ${otherPartyName}`,
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
  }, [chatRoom, currentUserId, isOpen, otherPartyName, toast]);

  // Mark message as read
  const markMessageAsRead = async (messageId: string) => {
    await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('id', messageId);
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !chatRoom) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          chat_room_id: chatRoom.id,
          sender_id: currentUserId,
          sender_type: currentUserType,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) {
        throw error;
      }

      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
    toast({
      title: "Call Feature",
      description: "Call feature will be implemented in the next phase.",
    });
  };

  // Handle video call action
  const handleVideoCall = () => {
    toast({
      title: "Video Call Feature",
      description: "Video call feature will be implemented in the next phase.",
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                {otherPartyImage ? (
                  <img src={otherPartyImage} alt={otherPartyName} className="w-8 h-8 rounded-full" />
                ) : (
                  <span className="text-lg font-semibold">{otherPartyName.charAt(0)}</span>
                )}
              </div>
              <div>
                <h3 className="font-semibold">{otherPartyName}</h3>
                <p className="text-xs opacity-90">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={handleCall} className="text-white hover:bg-white/20">
                <Phone className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleVideoCall} className="text-white hover:bg-white/20">
                <Video className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsMinimized(!isMinimized)} className="text-white hover:bg-white/20">
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={onClose} className="text-white hover:bg-white/20">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Chat Body */}
          {!isMinimized && (
            <>
              <div className="h-96 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                        <MessageSquare className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="font-medium">No messages yet</p>
                      <p className="text-sm">Start the conversation!</p>
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
                          className={`max-w-xs px-4 py-2 rounded-2xl ${
                            message.sender_type === currentUserType
                              ? 'bg-primary text-white rounded-br-md'
                              : 'bg-white border border-gray-200 rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className={`text-xs ${message.sender_type === currentUserType ? 'text-white/70' : 'text-gray-500'}`}>
                              {formatMessageTime(message.created_at)}
                            </p>
                            {message.sender_type !== currentUserType && !message.is_read && (
                              <Badge variant="secondary" className="text-xs ml-2 bg-blue-100 text-blue-600">
                                New
                              </Badge>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <div className="border-t bg-white p-4">
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="text-gray-500">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      disabled={isLoading}
                      className="flex-1 border-gray-200 focus:border-primary"
                    />
                    <Button size="sm" variant="ghost" className="text-gray-500">
                      <Smile className="w-4 h-4" />
                    </Button>
                    <Button 
                      onClick={sendMessage} 
                      disabled={isLoading || !newMessage.trim()}
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-white"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
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