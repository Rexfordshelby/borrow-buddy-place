
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { MapPin, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LocationSearchFilterProps {
  onLocationSearch: (location: string, radius: number) => void;
  className?: string;
}

const LocationSearchFilter: React.FC<LocationSearchFilterProps> = ({
  onLocationSearch,
  className,
}) => {
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState([10]);

  const handleSearch = () => {
    if (location.trim()) {
      onLocationSearch(location.trim(), radius[0]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <MapPin className="h-5 w-5 mr-2" />
          Location Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              placeholder="Enter city, address, or ZIP code"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <Button onClick={handleSearch} size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Search radius: {radius[0]} km
          </label>
          <Slider
            value={radius}
            onValueChange={setRadius}
            max={100}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1 km</span>
            <span>100 km</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationSearchFilter;
