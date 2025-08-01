import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import GoogleMapsAutocomplete from "@/components/GoogleMapsAutocomplete";
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

  // Auto-geocode when location changes (fallback for manual entry)
  useEffect(() => {
    if (value && value.length > 5 && !coordinates) {
      handleGeocode();
    }
  }, [value, coordinates]);

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

  // Handle location selection from Google Maps autocomplete
  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    const coords: Location = {
      latitude: location.lat,
      longitude: location.lng,
      address: location.address
    };
    setCoordinates(coords);
    onChange(location.address, coords);
  };

  // Handle manual location input
  const handleLocationChange = (newValue: string) => {
    onChange(newValue);
    // Clear coordinates when user manually types
    if (coordinates) {
      setCoordinates(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        
        {/* Use Google Maps Autocomplete */}
        <GoogleMapsAutocomplete
          value={value}
          onChange={handleLocationChange}
          onLocationSelect={handleLocationSelect}
          placeholder={placeholder}
          label=""
          required={required}
          className=""
        />
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
        <p>• Start typing to see location suggestions from Google Maps</p>
        <p>• Select a suggestion for automatic coordinate detection</p>
        <p>• Use "Find Coordinates" for manual geocoding</p>
        <p>• Use "Manual Coordinates" if automatic methods fail</p>
      </div>
    </div>
  );
} 