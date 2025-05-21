
import { Slider } from "@/components/ui/slider";
import { MapPin } from "lucide-react";

interface DistanceFilterProps {
  maxDistance: number;
  setMaxDistance: (value: number) => void;
  userLocation: { latitude: number; longitude: number } | null;
}

const DistanceFilter = ({ maxDistance, setMaxDistance, userLocation }: DistanceFilterProps) => {
  return (
    <div className="space-y-4">
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
      {!userLocation && (
        <p className="text-xs text-amber-600 flex items-center">
          <MapPin className="h-3 w-3 mr-1" />
          Enable location to use distance filter
        </p>
      )}
    </div>
  );
};

export default DistanceFilter;
