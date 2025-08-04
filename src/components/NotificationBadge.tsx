import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useNotifications } from "@/hooks/use-notifications";

interface NotificationBadgeProps {
  currentUserId: string;
  currentUserType: 'user' | 'provider';
  className?: string;
}

const NotificationBadge = ({ currentUserId, currentUserType, className = "" }: NotificationBadgeProps) => {
  const { unreadCount, lastUpdated } = useNotifications(currentUserId, currentUserType);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log(`🔔 [NotificationBadge] ${currentUserType} ${currentUserId}: unreadCount = ${unreadCount}, lastUpdated = ${lastUpdated}`);
  }, [unreadCount, lastUpdated, currentUserId, currentUserType]);

  // Update hasNewMessages when unreadCount changes
  useEffect(() => {
    setHasNewMessages(unreadCount > 0);
  }, [unreadCount]);

  // Add visual feedback for new messages
  useEffect(() => {
    if (hasNewMessages) {
      const badge = document.getElementById('notification-badge');
      if (badge) {
        badge.classList.add('animate-pulse');
        setTimeout(() => {
          badge.classList.remove('animate-pulse');
        }, 2000);
      }
    }
  }, [hasNewMessages, lastUpdated]);

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