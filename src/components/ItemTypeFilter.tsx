
import { Checkbox } from "@/components/ui/checkbox";

interface ItemTypeFilterProps {
  showOnlyItems: boolean;
  setShowOnlyItems: (value: boolean) => void;
  showOnlyServices: boolean;
  setShowOnlyServices: (value: boolean) => void;
}

const ItemTypeFilter = ({
  showOnlyItems,
  setShowOnlyItems,
  showOnlyServices,
  setShowOnlyServices
}: ItemTypeFilterProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Listing Type</h3>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-items"
            checked={showOnlyItems} 
            onCheckedChange={(checked) => {
              setShowOnlyItems(checked as boolean);
              if (checked) setShowOnlyServices(false);
            }}
          />
          <label htmlFor="show-items" className="text-sm">Items only</label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-services"
            checked={showOnlyServices} 
            onCheckedChange={(checked) => {
              setShowOnlyServices(checked as boolean);
              if (checked) setShowOnlyItems(false);
            }}
          />
          <label htmlFor="show-services" className="text-sm">Services only</label>
        </div>
      </div>
    </div>
  );
};

export default ItemTypeFilter;
