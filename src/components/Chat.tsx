import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Send, Phone, Video, MapPin, Image, Paperclip } from "lucide-react";

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

interface ChatProps {
  bookingId: string;
  currentUserId: string;
  currentUserType: 'user' | 'provider';
  otherPartyName: string;
}

const Chat = ({ bookingId, currentUserId, currentUserType, otherPartyName }: ChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
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
  }, [bookingId, currentUserId, currentUserType]);

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
    if (!chatRoom) return;

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
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [chatRoom, currentUserId]);

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
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
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

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Chat with {otherPartyName}</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleCall}>
              <Phone className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleVideoCall}>
              <Video className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_type === currentUserType ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.sender_type === currentUserType
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs opacity-70">
                      {formatMessageTime(message.created_at)}
                    </p>
                    {message.sender_type !== currentUserType && !message.is_read && (
                      <Badge variant="secondary" className="text-xs ml-2">
                        New
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={isLoading || !newMessage.trim()}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Chat; 