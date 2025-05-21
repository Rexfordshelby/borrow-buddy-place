
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { MapPin } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface DistanceFilterProps {
  maxDistance: number;
  setMaxDistance: (value: number) => void;
  userLocation: { latitude: number; longitude: number } | null;
  setUserLocation: (location: { latitude: number; longitude: number } | null) => void;
}

const DistanceFilter = ({ 
  maxDistance, 
  setMaxDistance, 
  userLocation, 
  setUserLocation 
}: DistanceFilterProps) => {
  const [locationEnabled, setLocationEnabled] = useState(!!userLocation);
  
  useEffect(() => {
    if (locationEnabled && !userLocation) {
      getUserLocation();
    } else if (!locationEnabled && userLocation) {
      setUserLocation(null);
    }
  }, [locationEnabled]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          toast({
            title: "Location enabled",
            description: "We can now show you items near you",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location error",
            description: "Could not get your location. Please check browser permissions.",
            variant: "destructive"
          });
          setLocationEnabled(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive"
      });
      setLocationEnabled(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-brand-500" />
          <h3 className="text-sm font-medium">Use my location</h3>
        </div>
        <Switch
          checked={locationEnabled}
          onCheckedChange={setLocationEnabled}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <h3 className="text-sm font-medium">Distance (miles)</h3>
          <span className="text-sm text-gray-500">{maxDistance} miles</span>
        </div>
        <Slider
          defaultValue={[maxDistance]}
          max={100}
          step={5}
          onValueChange={(value) => setMaxDistance(value[0])}
          disabled={!userLocation}
        />
      </div>

      {!userLocation && locationEnabled && (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-xs" 
          onClick={getUserLocation}
        >
          <MapPin className="h-3 w-3 mr-1" />
          Enable location
        </Button>
      )}
    </div>
  );
};

export default DistanceFilter;
