import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { MessageSquare } from "lucide-react";

interface MessageNotificationProps {
  currentUserId: string;
  currentUserType: 'user' | 'provider';
}

const MessageNotification = ({ currentUserId, currentUserType }: MessageNotificationProps) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUserId) return;

    // Subscribe to new messages for this user
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
          
          // Get chat room details to find the other party
          const { data: chatRoom } = await supabase
            .from('chat_rooms')
            .select('*')
            .eq('id', newMessage.chat_room_id)
            .single();

          if (chatRoom) {
            let otherPartyName = 'Someone';
            
            // Get the other party's name
            if (currentUserType === 'user') {
              // User is chatting with provider
              const { data: provider } = await supabase
                .from('providers')
                .select('name')
                .eq('id', chatRoom.provider_id)
                .single();
              
              if (provider) {
                otherPartyName = provider.name;
              }
            } else {
              // Provider is chatting with user
              const { data: user } = await supabase
                .from('users')
                .select('name')
                .eq('id', chatRoom.user_id)
                .single();
              
              if (user) {
                otherPartyName = user.name;
              }
            }

            // Show notification
            toast({
              title: `New message from ${otherPartyName}`,
              description: newMessage.content.substring(0, 50) + (newMessage.content.length > 50 ? '...' : ''),
              action: (
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-xs">Click to view</span>
                </div>
              ),
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUserId, currentUserType, toast]);

  return null; // This component doesn't render anything
};

export default MessageNotification; 