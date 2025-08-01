import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LiveRequest, getUrgencyColor, getTimeRemaining } from "@/lib/liveRequestService";
import { formatDistance } from "@/lib/locationUtils";
import { 
  Clock, 
  MapPin, 
  DollarSign, 
  Users, 
  AlertCircle, 
  Eye,
  MessageSquare,
  Star
} from "lucide-react";

interface RequestCardProps {
  request: LiveRequest;
  onViewDetails?: (requestId: string) => void;
  onBid?: (requestId: string) => void;
  showBidButton?: boolean;
  showDistance?: boolean;
}

const RequestCard = ({ 
  request, 
  onViewDetails, 
  onBid, 
  showBidButton = false,
  showDistance = false 
}: RequestCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const urgencyColor = getUrgencyColor(request.urgency_level);
  const timeRemaining = request.expires_at ? getTimeRemaining(request.expires_at) : null;
  const isExpired = timeRemaining === 'Expired';

  const getServiceIcon = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('plumbing')) return '🔧';
    if (categoryLower.includes('electrical')) return '⚡';
    if (categoryLower.includes('cleaning')) return '🧹';
    if (categoryLower.includes('carpentry')) return '🔨';
    if (categoryLower.includes('painting')) return '🎨';
    if (categoryLower.includes('car wash')) return '🚗';
    if (categoryLower.includes('beauty')) return '💄';
    if (categoryLower.includes('catering')) return '🍽️';
    if (categoryLower.includes('photography')) return '📸';
    if (categoryLower.includes('tutoring')) return '📚';
    return '🛠️';
  };

  return (
    <Card className={`transition-all hover:shadow-md ${
      isExpired ? 'opacity-60' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {getServiceIcon(request.service_category)}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold line-clamp-1">
                {request.job_title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                {request.service_category}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={`${urgencyColor} text-xs font-medium`}
            >
              {request.urgency_level}
            </Badge>
            {request.bid_count && request.bid_count > 0 && (
              <Badge variant="outline" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {request.bid_count} bids
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Description */}
        <div className="mb-4">
          <p className={`text-sm text-gray-700 ${!isExpanded ? 'line-clamp-2' : ''}`}>
            {request.job_description}
          </p>
          {request.job_description.length > 100 && (
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

        {/* Key Details */}
        <div className="space-y-2 mb-4">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{request.preferred_location}</span>
            {showDistance && request.distance && (
              <Badge variant="outline" className="text-xs ml-auto">
                {formatDistance(request.distance)}
              </Badge>
            )}
          </div>

          {/* Budget */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="h-4 w-4" />
            <span>
              PKR {request.budget_range_min.toLocaleString()} - {request.budget_range_max.toLocaleString()}
            </span>
          </div>

          {/* Time Remaining */}
          {timeRemaining && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span className={isExpired ? 'text-red-600 font-medium' : 'text-gray-600'}>
                {timeRemaining}
              </span>
              {isExpired && (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          )}

          {/* Bid Range */}
          {request.lowest_bid && request.highest_bid && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span>
                Bids: PKR {request.lowest_bid.toLocaleString()} - {request.highest_bid.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(request.id)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          )}
          
          {showBidButton && onBid && !isExpired && (
            <Button
              size="sm"
              onClick={() => onBid(request.id)}
              className="flex-1"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Place Bid
            </Button>
          )}

          {isExpired && (
            <Badge variant="secondary" className="text-red-600 bg-red-50">
              Expired
            </Badge>
          )}
        </div>

        {/* Status Badge */}
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Status: {request.status}</span>
            <span>
              Posted {new Date(request.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RequestCard; 