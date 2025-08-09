import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, MapPin, DollarSign, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { markNotificationAsRead } from "@/lib/liveRequestService";

interface ProviderNotification {
  id: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  live_requests: {
    job_title: string;
    job_description: string;
    urgency_level: string;
    budget_range_min: number;
    budget_range_max: number;
    preferred_location: string;
  };
}

interface ProviderNotificationCardProps {
  notification: ProviderNotification;
  onMarkAsRead: (notificationId: string) => void;
  onBidOnRequest: (requestId: string) => void;
}

const ProviderNotificationCard = ({ 
  notification, 
  onMarkAsRead, 
  onBidOnRequest 
}: ProviderNotificationCardProps) => {
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  const { toast } = useToast();

  const handleMarkAsRead = async () => {
    try {
      setIsMarkingAsRead(true);
      await markNotificationAsRead(notification.id);
      onMarkAsRead(notification.id);
      toast({
        title: "Notification marked as read",
        description: "This notification has been marked as read.",
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read.",
        variant: "destructive",
      });
    } finally {
      setIsMarkingAsRead(false);
    }
  };

  const formatTimeAgo = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ago`;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className={`w-full transition-all ${notification.is_read ? 'opacity-60' : 'hover:shadow-md'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{notification.message}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="secondary"
                  className={getUrgencyColor(notification.live_requests.urgency_level)}
                >
                  {notification.live_requests.urgency_level}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatTimeAgo(notification.created_at)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAsRead}
              disabled={isMarkingAsRead || notification.is_read}
            >
              {isMarkingAsRead ? (
                "Marking..."
              ) : notification.is_read ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Read
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Mark Read
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Request Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">{notification.live_requests.job_title}</h4>
          <p className="text-sm text-gray-600 mb-3">{notification.live_requests.job_description}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-gray-600">Location:</span>
              <span className="font-medium">{notification.live_requests.preferred_location}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-gray-600">Budget:</span>
              <span className="font-medium">₨{notification.live_requests.budget_range_min}</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => onBidOnRequest(notification.id)}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Bid on Request
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderNotificationCard; 