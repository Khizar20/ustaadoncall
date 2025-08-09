import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Clock, MapPin, Phone, MessageCircle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { acceptBid } from "@/lib/liveRequestService";

interface ProviderBid {
  id: string;
  bid_amount: number;
  estimated_time: string;
  message?: string;
  created_at: string;
  provider_name?: string;
  provider_rating?: number;
  provider_profile_image?: string;
  provider_phone?: string;
  provider_location?: string;
}

interface ProviderBidCardProps {
  bid: ProviderBid;
  requestId: string;
  onBidAccepted: () => void;
  onBidRejected: () => void;
}

const ProviderBidCard = ({ bid, requestId, onBidAccepted, onBidRejected }: ProviderBidCardProps) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const { toast } = useToast();

  const handleAcceptBid = async () => {
    try {
      setIsAccepting(true);
      await acceptBid(bid.id, requestId);
      
      toast({
        title: "Bid Accepted!",
        description: "Provider has been notified. They will contact you soon.",
      });
      
      onBidAccepted();
    } catch (error) {
      console.error("Error accepting bid:", error);
      toast({
        title: "Error",
        description: "Failed to accept bid. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRejectBid = () => {
    setIsRejecting(true);
    // In a real implementation, you might want to update the bid status to rejected
    setTimeout(() => {
      onBidRejected();
      setIsRejecting(false);
    }, 500);
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

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={bid.provider_profile_image} />
              <AvatarFallback className="bg-green-100 text-green-600">
                {bid.provider_name?.charAt(0) || "P"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{bid.provider_name || "Provider"}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">
                    {bid.provider_rating || 4.5}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Verified
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              ₨{bid.bid_amount.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatTimeAgo(bid.created_at)}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Provider Message */}
        {bid.message && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">{bid.message}</p>
          </div>
        )}
        
        {/* Provider Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
            <span className="text-gray-600">Estimated time:</span>
            <span className="font-medium">{bid.estimated_time}</span>
          </div>
          {bid.provider_location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-500" />
              <span className="text-gray-600">Location:</span>
              <span className="font-medium">{bid.provider_location}</span>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleAcceptBid}
            disabled={isAccepting || isRejecting}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isAccepting ? (
              "Accepting..."
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept Bid
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleRejectBid}
            disabled={isAccepting || isRejecting}
          >
            {isRejecting ? (
              "Rejecting..."
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </>
            )}
          </Button>
        </div>
        
        {/* Contact Options */}
        {bid.provider_phone && (
          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" className="flex-1">
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProviderBidCard; 