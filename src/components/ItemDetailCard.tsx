
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { Calendar as CalendarIcon, Clock, Heart, Shield, MapPin } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ItemDetailCardProps {
  item: any;
  owner: any;
}

const ItemDetailCard: React.FC<ItemDetailCardProps> = ({ item, owner }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [totalDays, setTotalDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [distance, setDistance] = useState<number | null>(null);

  // Calculate distance if user location is available
  useEffect(() => {
    if (navigator.geolocation && item.latitude && item.longitude) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Calculate distance using Haversine formula
          const R = 3958.8; // Earth's radius in miles
          const dLat = (item.latitude - position.coords.latitude) * Math.PI / 180;
          const dLon = (item.longitude - position.coords.longitude) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(position.coords.latitude * Math.PI / 180) * Math.cos(item.latitude * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
          const distance = R * c;
          
          setDistance(distance);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, [item]);

  // Check if item is in user's wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      if (!user) return;
  
      try {
        const { data, error } = await supabase
          .from("wishlists")
          .select("id")
          .eq("user_id", user.id)
          .eq("item_id", item.id)
          .single();
  
        if (data) {
          setIsInWishlist(true);
        }
      } catch (error) {
        console.error("Error checking wishlist:", error);
      }
    };

    checkWishlist();
  }, [user, item.id]);

  // Calculate total days and price when date range changes
  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setTotalDays(diffDays);

      // For hourly items/services with time slots, calculate differently
      if (item.price_unit === 'hour' && timeSlot) {
        // Assuming time slot format like "2 hours"
        const hours = parseInt(timeSlot.split(' ')[0]);
        setTotalPrice(Number(item.price) * hours);
      } else {
        setTotalPrice(Number(item.price) * diffDays);
      }
    } else {
      setTotalDays(0);
      setTotalPrice(0);
    }
  }, [dateRange, timeSlot, item.price, item.price_unit]);

  const handleRentNow = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to rent this item",
      });
      navigate("/auth");
      return;
    }

    if (!dateRange.from) {
      toast({
        title: "Date selection required",
        description: "Please select a rental period",
        variant: "destructive",
      });
      return;
    }

    // For hourly rentals, require time slot selection
    if (item.price_unit === 'hour' && !timeSlot) {
      toast({
        title: "Time selection required",
        description: "Please select a time slot",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create booking
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          item_id: item.id,
          renter_id: user.id,
          owner_id: item.user_id,
          start_date: dateRange.from.toISOString(),
          end_date: dateRange.to ? dateRange.to.toISOString() : dateRange.from.toISOString(),
          total_price: totalPrice,
          status: "pending",
          time_slot: timeSlot || null,
        })
        .select();

      if (error) throw error;

      toast({
        title: "Request submitted",
        description: item.is_service 
          ? "Your service booking request has been sent" 
          : "Your rental request has been sent to the owner",
      });

      // Redirect to bookings page
      navigate("/dashboard/rentals");

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit rental request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add items to your wishlist",
      });
      navigate("/auth");
      return;
    }

    setIsAddingToWishlist(true);

    if (isInWishlist) {
      // Remove from wishlist
      try {
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("item_id", item.id);

        if (error) throw error;

        setIsInWishlist(false);
        toast({
          title: "Removed from wishlist",
          description: "Item has been removed from your wishlist",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to remove from wishlist",
          variant: "destructive",
        });
      } finally {
        setIsAddingToWishlist(false);
      }
    } else {
      // Add to wishlist
      try {
        const { error } = await supabase
          .from("wishlists")
          .insert({
            user_id: user.id,
            item_id: item.id,
          });

        if (error) throw error;

        setIsInWishlist(true);
        toast({
          title: "Added to wishlist",
          description: "Item has been added to your wishlist",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to add to wishlist",
          variant: "destructive",
        });
      } finally {
        setIsAddingToWishlist(false);
      }
    }
  };

  const getTimeSlotOptions = () => {
    // Generate time slot options based on price unit
    if (item.price_unit === 'hour') {
      return [
        { value: '1 hour', label: '1 hour' },
        { value: '2 hours', label: '2 hours' },
        { value: '3 hours', label: '3 hours' },
        { value: '4 hours', label: '4 hours' },
        { value: 'half day (6 hours)', label: 'Half day (6 hours)' },
        { value: 'full day (12 hours)', label: 'Full day (12 hours)' }
      ];
    }
    return [];
  };

  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-brand-600">
                ${item.price}/{item.price_unit}
              </p>
              {item.security_deposit > 0 && (
                <p className="text-sm text-gray-500">
                  Security deposit: ${item.security_deposit}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              className={isInWishlist ? "text-red-500" : "text-gray-400"}
              onClick={handleAddToWishlist}
              disabled={isAddingToWishlist}
            >
              <Heart className={isInWishlist ? "fill-red-500" : ""} size={20} />
            </Button>
          </div>

          {distance !== null && (
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              <span>Approximately {distance.toFixed(1)} miles away</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                {item.is_service ? "Booking Date" : "Rental Period"}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to && !item.is_service ? (
                        <>
                          {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                          {format(dateRange.to, "MMM dd, yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM dd, yyyy")
                      )
                    ) : (
                      <span>Select date{item.is_service ? "" : " range"}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode={item.is_service ? "single" : "range"}
                    defaultMonth={new Date()}
                    selected={dateRange}
                    onSelect={(range: any) => {
                      setDateRange(range);
                      // For services, make sure end date equals start date
                      if (range?.from && item.is_service) {
                        range.to = range.from;
                      }
                      
                      if (range?.from && range?.to) {
                        const diffTime = Math.abs(range.to.getTime() - range.from.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                        setTotalDays(diffDays);
                        
                        // Only calculate based on days if not hourly
                        if (item.price_unit !== 'hour') {
                          setTotalPrice(Number(item.price) * diffDays);
                        }
                      }
                    }}
                    numberOfMonths={2}
                    disabled={{ before: new Date() }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {item.price_unit === 'hour' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium">Duration</label>
                <Select
                  value={timeSlot}
                  onValueChange={setTimeSlot}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {getTimeSlotOptions().map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {item.availability_schedule && (
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                <p className="font-medium mb-1">Availability:</p>
                <p>{item.availability_schedule}</p>
              </div>
            )}
          </div>

          {totalDays > 0 && (
            <div className="border-t border-b py-4 space-y-2">
              <div className="flex justify-between">
                <span>
                  ${item.price} × {
                    item.price_unit === 'hour' && timeSlot 
                      ? timeSlot 
                      : `${totalDays} ${totalDays === 1 ? 
                          (item.is_service ? "session" : "day") : 
                          (item.is_service ? "sessions" : "days")}`
                  }
                </span>
                <span>${totalPrice}</span>
              </div>
              {!item.is_service && item.security_deposit > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Security deposit (refundable)</span>
                  <span>${item.security_deposit}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>Service fee</span>
                <span>${(totalPrice * 0.05).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>
                  ${item.is_service 
                    ? (totalPrice + totalPrice * 0.05).toFixed(2)
                    : (totalPrice + totalPrice * 0.05 + (item.security_deposit || 0)).toFixed(2)
                  }
                </span>
              </div>
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handleRentNow}
            disabled={!dateRange.from || (item.price_unit === 'hour' && !timeSlot) || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : (
              item.is_service ? "Book Now" : "Request to Rent"
            )}
          </Button>

          {item.cancellation_policy && (
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Shield className="h-4 w-4 mr-2" />
              <span>Cancellation policy: {item.cancellation_policy}</span>
            </div>
          )}
          
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-2" />
            <span>Usually responds within 12 hours</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemDetailCard;
