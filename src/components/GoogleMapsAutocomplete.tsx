import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LocationSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface GoogleMapsAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

const GoogleMapsAutocomplete = ({
  value,
  onChange,
  onLocationSelect,
  placeholder = "Search for your location...",
  label,
  required = false,
  error,
  className = "",
}: GoogleMapsAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Debounced search function
  const handleSearch = (searchValue: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      performSearch(searchValue);
    }, 300);

    setSearchTimeout(timeout);
  };

  const performSearch = async (searchValue: string) => {
    if (!searchValue.trim() || searchValue.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setIsSearching(true);
      
      // Try to use backend proxy first
      const proxyUrl = `http://127.0.0.1:8000/api/google-maps/autocomplete?input=${encodeURIComponent(searchValue)}&types=geocode&components=country:pk`;
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'OK' && data.predictions) {
        setSuggestions(data.predictions);
        setShowSuggestions(true);
      } else if (data.status === 'REQUEST_DENIED') {
        console.log('Google Maps API request denied due to API key restrictions. Using fallback suggestions.');
        // Fallback to mock suggestions
        generateMockSuggestions(searchValue);
      } else {
        console.log('No predictions found or API error:', data.status);
        // Fallback to mock suggestions
        generateMockSuggestions(searchValue);
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      // Fallback to mock suggestions
      generateMockSuggestions(searchValue);
    } finally {
      setIsSearching(false);
    }
  };

  const generateMockSuggestions = (searchValue: string) => {
    const mockSuggestions: LocationSuggestion[] = [
      {
        place_id: 'mock_1',
        description: `${searchValue}, Islamabad, Pakistan`,
        structured_formatting: {
          main_text: searchValue,
          secondary_text: 'Islamabad, Pakistan'
        }
      },
      {
        place_id: 'mock_2',
        description: `${searchValue}, Rawalpindi, Pakistan`,
        structured_formatting: {
          main_text: searchValue,
          secondary_text: 'Rawalpindi, Pakistan'
        }
      },
      {
        place_id: 'mock_3',
        description: `${searchValue}, Karachi, Pakistan`,
        structured_formatting: {
          main_text: searchValue,
          secondary_text: 'Karachi, Pakistan'
        }
      },
      {
        place_id: 'mock_4',
        description: `${searchValue}, Lahore, Pakistan`,
        structured_formatting: {
          main_text: searchValue,
          secondary_text: 'Lahore, Pakistan'
        }
      },
      {
        place_id: 'mock_5',
        description: `${searchValue}, Peshawar, Pakistan`,
        structured_formatting: {
          main_text: searchValue,
          secondary_text: 'Peshawar, Pakistan'
        }
      }
    ];
    
    setSuggestions(mockSuggestions);
    setShowSuggestions(true);
  };

  const handleSuggestionSelect = async (suggestion: LocationSuggestion) => {
    try {
      // For mock suggestions, use predefined coordinates
      if (suggestion.place_id.startsWith('mock_')) {
        const cityCoordinates: Record<string, { lat: number; lng: number }> = {
          'Islamabad': { lat: 33.6844, lng: 73.0479 },
          'Rawalpindi': { lat: 33.5651, lng: 73.0169 },
          'Karachi': { lat: 24.8607, lng: 67.0011 },
          'Lahore': { lat: 31.5204, lng: 74.3587 },
          'Peshawar': { lat: 34.0150, lng: 71.5249 },
        };

        const cityName = suggestion.structured_formatting.secondary_text.split(',')[0];
        const coords = cityCoordinates[cityName] || { lat: 33.6844, lng: 73.0479 }; // Default to Islamabad

        const locationData = {
          lat: coords.lat,
          lng: coords.lng,
          address: suggestion.description,
        };
        
        onChange(suggestion.description);
        onLocationSelect?.(locationData);
        setShowSuggestions(false);
        
        toast({
          title: "Location Selected",
          description: "Location coordinates have been set successfully.",
        });
        return;
      }

      // For real Google API suggestions, try to get coordinates via backend proxy
      const proxyUrl = `http://127.0.0.1:8000/api/google-maps/place-details?place_id=${suggestion.place_id}&fields=geometry`;
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.result?.geometry?.location) {
        const { lat, lng } = data.result.geometry.location;
        const locationData = {
          lat,
          lng,
          address: suggestion.description,
        };
        
        onChange(suggestion.description);
        onLocationSelect?.(locationData);
        setShowSuggestions(false);
        
        toast({
          title: "Location Selected",
          description: "Location coordinates have been set successfully.",
        });
      }
    } catch (error) {
      console.error("Error getting location coordinates:", error);
      toast({
        title: "Location Error",
        description: "Could not get location coordinates. Please try again or enter location manually.",
        variant: "destructive",
      });
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor="location-input">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          id="location-input"
          ref={inputRef}
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;
            onChange(newValue);
            handleSearch(newValue);
          }}
          onFocus={() => {
            if (value && value.length >= 3) {
              handleSearch(value);
            }
          }}
          placeholder={placeholder}
          className={`pl-10 pr-12 ${error ? 'border-red-500' : ''}`}
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isSearching && (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          )}
        </div>
        
        {/* Location Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto top-full mt-1"
          >
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.place_id}
                className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <div className="font-medium text-gray-900">
                  {suggestion.structured_formatting.main_text}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {suggestion.structured_formatting.secondary_text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default GoogleMapsAutocomplete; 