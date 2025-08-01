import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { createLiveRequest } from "@/lib/liveRequestService";
import { getServiceCategoryNames } from "@/lib/serviceCategories";
import GoogleMapsAutocomplete from "@/components/GoogleMapsAutocomplete";
import { AlertCircle, MapPin, DollarSign, Search, Navigation, Loader2 } from "lucide-react";

const formSchema = z.object({
  service_category: z.string().min(1, "Service category is required"),
  job_description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().min(1, "Location is required"),
  price: z.number().min(100, "Price must be at least 100 PKR"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface LiveRequestFormProps {
  onSuccess?: (requestId: string) => void;
  onCancel?: () => void;
}

const LiveRequestForm = ({ onSuccess, onCancel }: LiveRequestFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: 500,
    },
  });

  const serviceCategories = getServiceCategoryNames();
  const locationValue = watch("location");

  // Handle location selection from autocomplete
  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation({ lat: location.lat, lng: location.lng });
    setValue("latitude", location.lat);
    setValue("longitude", location.lng);
  };

  // Handle map location selection
  const handleMapLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setValue("latitude", lat);
    setValue("longitude", lng);
    // Reverse geocode to get address
    reverseGeocode(lat, lng);
  };

  // Reverse geocode using Google Maps API
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8';
      const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
      
      let response;
      let data;

      try {
        // First attempt: Direct request
        response = await fetch(googleUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        data = await response.json();
      } catch (directError) {
        console.log('Direct request failed, trying CORS proxy...');
        
        // Second attempt: CORS proxy
        const proxyUrl = `https://cors-anywhere.herokuapp.com/${googleUrl}`;
        response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Origin': window.location.origin,
          },
        });

        if (!response.ok) {
          throw new Error(`Proxy HTTP error! status: ${response.status}`);
        }

        data = await response.json();
      }

      if (data.results && data.results.length > 0) {
        const address = data.results[0].formatted_address;
        setValue("location", address);
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      toast({
        title: "Location Error",
        description: "Could not get address from coordinates. Please enter location manually.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Set urgency to urgent and calculate expiry (2 hours)
      const expiryTime = new Date(Date.now() + 2 * 60 * 60 * 1000);

      const request = await createLiveRequest({
        service_category: data.service_category,
        job_title: "Urgent Service Request", // Default title
        job_description: data.job_description,
        urgency_level: "urgent",
        preferred_location: data.location,
        budget_range_min: data.price,
        budget_range_max: data.price,
        expires_at: expiryTime.toISOString(),
        latitude: data.latitude,
        longitude: data.longitude,
      });

      toast({
        title: "Urgent Request Created!",
        description: "Providers in your area will be notified immediately.",
      });

      onSuccess?.(request.id);
    } catch (error) {
      console.error("Error creating live request:", error);
      toast({
        title: "Error",
        description: "Failed to create live request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          Create Urgent Service Request
        </CardTitle>
        <CardDescription>
          Post an urgent service request. Providers will be notified immediately and can bid on your job.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Service Category */}
          <div className="space-y-2">
            <Label htmlFor="service_category">Service Category *</Label>
            <Select
              onValueChange={(value) => setValue("service_category", value)}
              defaultValue=""
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a service category" />
              </SelectTrigger>
              <SelectContent>
                {serviceCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.service_category && (
              <p className="text-sm text-red-500">{errors.service_category.message}</p>
            )}
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <Label htmlFor="job_description">Job Description *</Label>
            <Textarea
              id="job_description"
              placeholder="Describe what you need done urgently..."
              rows={4}
              {...register("job_description")}
            />
            {errors.job_description && (
              <p className="text-sm text-red-500">{errors.job_description.message}</p>
            )}
          </div>

          {/* Location with Google Maps Autocomplete */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="location">Location *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowMap(!showMap)}
              >
                <Navigation className="h-4 w-4 mr-2" />
                {showMap ? 'Hide Map' : 'Show Map'}
              </Button>
            </div>
            
            <GoogleMapsAutocomplete
              value={locationValue || ""}
              onChange={(value) => setValue("location", value)}
              onLocationSelect={handleLocationSelect}
              placeholder="Search for your location..."
              label=""
              required={true}
              error={errors.location?.message}
            />
          </div>

          {/* Map */}
          {showMap && (
            <div className="space-y-2">
              <Label>Select Location on Map</Label>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Map integration coming soon</p>
                  <p className="text-xs text-gray-500">For now, use the search above</p>
                </div>
              </div>
            </div>
          )}

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Your Budget (PKR) *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="price"
                type="number"
                placeholder="500"
                className="pl-10"
                {...register("price", { valueAsNumber: true })}
              />
            </div>
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price.message}</p>
            )}
          </div>

          {/* Urgency Info */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Urgent Request</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              This request will expire in 2 hours. Providers will be notified immediately.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Creating Request..." : "Create Urgent Request"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LiveRequestForm; 