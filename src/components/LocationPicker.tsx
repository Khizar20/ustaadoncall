import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Search, 
  Crosshair,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { geocodeAddress, type Location } from "@/lib/locationUtils";

interface LocationPickerProps {
  value: string;
  onChange: (location: string, coordinates?: Location) => void;
  placeholder?: string;
  required?: boolean;
}

export default function LocationPicker({ 
  value, 
  onChange, 
  placeholder = "Enter your location",
  required = false 
}: LocationPickerProps) {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [coordinates, setCoordinates] = useState<Location | null>(null);
  const [showMap, setShowMap] = useState(false);
  const { toast } = useToast();

  // Auto-geocode when location changes
  useEffect(() => {
    if (value && value.length > 5) {
      handleGeocode();
    }
  }, [value]);

  const handleGeocode = async () => {
    if (!value.trim()) return;
    
    setIsGeocoding(true);
    try {
      const coords = await geocodeAddress(value);
      if (coords) {
        setCoordinates(coords);
        onChange(value, coords);
        toast({
          title: "Location Found",
          description: `Coordinates: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`,
        });
      } else {
        setCoordinates(null);
        onChange(value);
        toast({
          title: "Location Not Found",
          description: "Could not find exact coordinates. You can still proceed.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setCoordinates(null);
      onChange(value);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleManualCoordinates = () => {
    const lat = prompt("Enter latitude (e.g., 33.6844):");
    const lng = prompt("Enter longitude (e.g., 73.0479):");
    
    if (lat && lng) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        const manualCoords: Location = {
          latitude: latNum,
          longitude: lngNum,
          address: value
        };
        setCoordinates(manualCoords);
        onChange(value, manualCoords);
        toast({
          title: "Coordinates Set",
          description: `Manual coordinates: ${latNum.toFixed(4)}, ${lngNum.toFixed(4)}`,
        });
      } else {
        toast({
          title: "Invalid Coordinates",
          description: "Please enter valid numbers for latitude and longitude.",
          variant: "destructive"
        });
      }
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="location"
            value={value}
            onChange={handleLocationChange}
            placeholder={placeholder}
            className="pl-10"
            required={required}
          />
          {isGeocoding && (
            <div className="absolute right-3 top-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      </div>

      {/* Location Status */}
      {coordinates && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div className="text-sm">
                <p className="font-medium text-green-800">Location Found</p>
                <p className="text-green-600 text-xs">
                  {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {value && !coordinates && !isGeocoding && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Location Not Found</p>
                <p className="text-yellow-600 text-xs">
                  Could not find exact coordinates for this address
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGeocode}
          disabled={isGeocoding || !value.trim()}
        >
          <Search className="h-4 w-4 mr-2" />
          {isGeocoding ? "Finding..." : "Find Coordinates"}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleManualCoordinates}
        >
          <Crosshair className="h-4 w-4 mr-2" />
          Manual Coordinates
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-xs text-muted-foreground">
        <p>• Enter your full address for automatic geocoding</p>
        <p>• Use "Manual Coordinates" if automatic geocoding fails</p>
        <p>• You can proceed without coordinates - they can be added later</p>
      </div>
    </div>
  );
} 