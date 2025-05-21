
import { Slider } from "@/components/ui/slider";

interface PriceFilterProps {
  priceRange: number[];
  setPriceRange: (value: number[]) => void;
}

const PriceFilter = ({ priceRange, setPriceRange }: PriceFilterProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-sm font-medium">Price Range</h3>
        <span className="text-sm text-gray-500">${priceRange[0]} - ${priceRange[1]}</span>
      </div>
      <Slider
        defaultValue={priceRange}
        min={0}
        max={1000}
        step={10}
        onValueChange={(value) => setPriceRange(value)}
      />
    </div>
  );
};

export default PriceFilter;
