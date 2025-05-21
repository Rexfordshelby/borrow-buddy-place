
import { Slider } from "@/components/ui/slider";

interface PriceFilterProps {
  priceRange: number[];
  setPriceRange: (value: number[]) => void;
  maxPrice?: number;
}

const PriceFilter = ({ 
  priceRange, 
  setPriceRange, 
  maxPrice = 1000 
}: PriceFilterProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-sm font-medium">Price Range</h3>
        <span className="text-sm text-gray-500">${priceRange[0]} - ${priceRange[1]}</span>
      </div>
      <Slider
        defaultValue={priceRange}
        min={0}
        max={maxPrice}
        step={10}
        onValueChange={(value) => setPriceRange(value)}
      />
    </div>
  );
};

export default PriceFilter;
