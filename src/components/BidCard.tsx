import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RequestBid } from "@/lib/liveRequestService";
import { Star, Clock, MessageSquare, CheckCircle, XCircle, DollarSign } from "lucide-react";

interface BidCardProps {
  bid: RequestBid;
  onAccept?: (bidId: string) => void;
  onReject?: (bidId: string) => void;
  onWithdraw?: (bidId: string) => void;
  isUserRequest?: boolean; // If true, user can accept/reject. If false, provider can withdraw
}

const BidCard = ({ 
  bid, 
  onAccept, 
  onReject, 
  onWithdraw, 
  isUserRequest = true 
}: BidCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'withdrawn':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-primary bg-primary/10 border-primary/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-primary" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card className={`transition-all hover:shadow-md ${
      bid.status !== 'pending' ? 'opacity-75' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={bid.provider_profile_image} />
              <AvatarFallback>
                {bid.provider_name?.charAt(0).toUpperCase() || 'P'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold">
                {bid.provider_name || 'Provider'}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                {bid.estimated_time}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {bid.provider_rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{bid.provider_rating}</span>
              </div>
            )}
            <Badge 
              variant="secondary" 
              className={`${getStatusColor(bid.status)} text-xs font-medium`}
            >
              {getStatusIcon(bid.status)}
              <span className="ml-1">{bid.status}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Bid Amount */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-2xl font-bold text-green-600">
              PKR {bid.bid_amount.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Estimated completion time: {bid.estimated_time}
          </p>
        </div>

        {/* Provider Message */}
        {bid.message && (
          <div className="mb-4">
            <p className={`text-sm text-gray-700 ${!isExpanded ? 'line-clamp-2' : ''}`}>
              "{bid.message}"
            </p>
            {bid.message.length > 100 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs p-0 h-auto mt-1"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </Button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {bid.status === 'pending' && (
          <div className="flex gap-2 pt-2">
            {isUserRequest ? (
              // User can accept/reject
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReject?.(bid.id)}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => onAccept?.(bid.id)}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept
                </Button>
              </>
            ) : (
              // Provider can withdraw
              <Button
                variant="outline"
                size="sm"
                onClick={() => onWithdraw?.(bid.id)}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Withdraw Bid
              </Button>
            )}
          </div>
        )}

        {/* Status Info */}
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Bid submitted {formatTime(bid.created_at)}</span>
            {bid.status === 'accepted' && (
              <Badge variant="secondary" className="text-green-600 bg-green-50">
                Accepted
              </Badge>
            )}
            {bid.status === 'rejected' && (
              <Badge variant="secondary" className="text-red-600 bg-red-50">
                Rejected
              </Badge>
            )}
            {bid.status === 'withdrawn' && (
              <Badge variant="secondary" className="text-gray-600 bg-gray-50">
                Withdrawn
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BidCard; 