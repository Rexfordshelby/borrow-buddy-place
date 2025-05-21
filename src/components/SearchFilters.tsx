
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ItemTypeFilter from "./ItemTypeFilter";
import DistanceFilter from "./DistanceFilter";
import PriceFilter from "./PriceFilter";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFiltersProps {
  selectedCategory: string;
  showOnlyItems: boolean;
  setShowOnlyItems: (value: boolean) => void;
  showOnlyServices: boolean;
  setShowOnlyServices: (value: boolean) => void;
  maxDistance: number;
  setMaxDistance: (value: number) => void;
  priceRange: number[];
  setPriceRange: (value: number[]) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  userLocation: { latitude: number; longitude: number } | null;
  handleFilterReset: () => void;
  handleSearch: (e: React.FormEvent) => void;
  setShowFilters: (value: boolean) => void;
  categories: any[];
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  selectedCategory,
  showOnlyItems,
  setShowOnlyItems,
  showOnlyServices,
  setShowOnlyServices,
  maxDistance,
  setMaxDistance,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  userLocation,
  handleFilterReset,
  handleSearch,
  setShowFilters,
  categories
}) => {
  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory) count++;
    if (showOnlyServices || showOnlyItems) count++;
    if (maxDistance !== 25) count++;
    if (priceRange[0] > 0 || priceRange[1] < 1000) count++;
    if (sortBy !== "newest") count++;
    return count;
  };

  return (
    <div className="py-4 space-y-6">
      <ItemTypeFilter 
        showOnlyItems={showOnlyItems}
        setShowOnlyItems={setShowOnlyItems}
        showOnlyServices={showOnlyServices}
        setShowOnlyServices={setShowOnlyServices}
      />
      
      <DistanceFilter 
        maxDistance={maxDistance}
        setMaxDistance={setMaxDistance}
        userLocation={userLocation}
      />
      
      <PriceFilter 
        priceRange={priceRange}
        setPriceRange={setPriceRange}
      />

      <div className="space-y-2">
        <Label htmlFor="sort">Sort By</Label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger id="sort">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
            <SelectItem value="proximity" disabled={!userLocation}>Nearest to Me</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={handleFilterReset}
          className="flex items-center"
        >
          <X className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button onClick={() => {
          handleSearch({ preventDefault: () => {} } as any);
          setShowFilters(false);
        }}>
          Apply Filters
        </Button>
      </div>

      {getActiveFiltersCount() > 0 && (
        <div className="border-t pt-4 mt-4">
          <p className="text-sm font-medium mb-2">Active filters:</p>
          <div className="flex flex-wrap gap-2">
            {selectedCategory && (
              <Badge variant="outline" className="flex items-center gap-1">
                Category: {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                <X className="h-3 w-3 ml-1 cursor-pointer" />
              </Badge>
            )}
            {showOnlyServices && (
              <Badge variant="outline" className="flex items-center gap-1">
                Services only
                <X className="h-3 w-3 ml-1 cursor-pointer" />
              </Badge>
            )}
            {showOnlyItems && (
              <Badge variant="outline" className="flex items-center gap-1">
                Items only
                <X className="h-3 w-3 ml-1 cursor-pointer" />
              </Badge>
            )}
            {(priceRange[0] > 0 || priceRange[1] < 1000) && (
              <Badge variant="outline" className="flex items-center gap-1">
                Price: ${priceRange[0]} - ${priceRange[1]}
                <X className="h-3 w-3 ml-1 cursor-pointer" />
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
