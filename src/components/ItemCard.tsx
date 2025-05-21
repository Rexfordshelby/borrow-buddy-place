
import { Link } from "react-router-dom";
import { Star, MapPin, Calendar, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ItemCardProps {
  id: string;
  title: string;
  price: number;
  priceUnit: string;
  imageUrl: string;
  location: string;
  rating: number;
  reviewCount: number;
  category: string;
  isVerified?: boolean;
  isService?: boolean;
  distance?: number;
}

const ItemCard = ({
  id,
  title,
  price,
  priceUnit,
  imageUrl,
  location,
  rating,
  reviewCount,
  category,
  isVerified = false,
  isService = false,
  distance,
}: ItemCardProps) => {
  return (
    <Link to={`/item/${id}`} className="group">
      <div className="bg-white rounded-xl border overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="aspect-square relative overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          {isVerified && (
            <Badge className="absolute top-3 left-3 bg-green-500 hover:bg-green-600">
              Verified
            </Badge>
          )}
          <Badge
            variant="secondary"
            className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm"
          >
            {category}
          </Badge>
          {isService && (
            <Badge className="absolute bottom-3 left-3 bg-blue-500 hover:bg-blue-600">
              Service
            </Badge>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="font-medium line-clamp-1">{title}</h3>
            <div className="text-right">
              <div className="font-bold text-brand-600">
                ${price}{" "}
                <span className="text-sm font-normal text-gray-500">
                  /{priceUnit}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
            {distance && (
              <span className="text-xs text-gray-500">{distance.toFixed(1)} mi away</span>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="ml-1 text-sm font-medium">{rating}</span>
              <span className="mx-1 text-sm text-gray-500">·</span>
              <span className="text-sm text-gray-500">{reviewCount} reviews</span>
            </div>
            <div className="flex items-center text-xs">
              {isService ? (
                <Calendar className="h-3 w-3 mr-1 text-blue-500" />
              ) : (
                <Package className="h-3 w-3 mr-1 text-brand-600" />
              )}
              <span className="text-gray-500">{isService ? "Service" : "Item"}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
