
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
    if (navigator.geolocation && item?.latitude && item?.longitude) {
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
      if (!user || !item?.id) return;
  
      try {
        const { data, error } = await supabase
          .from("wishlists")
          .select("id")
          .eq("user_id", user.id)
          .eq("item_id", item.id)
          .maybeSingle();
  
        if (error) {
          console.error("Error checking wishlist:", error);
        } else if (data) {
          setIsInWishlist(true);
        }
      } catch (error) {
        console.error("Error checking wishlist:", error);
      }
    };

    checkWishlist();
  }, [user, item?.id]);

  // Calculate total days and price when date range changes
  useEffect(() => {
    if (!item) return;

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
    } else if (dateRange.from && item.is_service) {
      // For services, single date selection
      setTotalDays(1);
      setTotalPrice(Number(item.price));
    } else {
      setTotalDays(0);
      setTotalPrice(0);
    }
  }, [dateRange, timeSlot, item]);

  const handleRentNow = async () => {
    console.log('Booking attempt started for item:', item?.id);
    
    if (!item) {
      console.error('No item data available');
      toast({
        title: "Error",
        description: "Item data not available",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      console.log('User not authenticated, redirecting to auth');
      toast({
        title: "Authentication required",
        description: "Please sign in to book this " + (item.is_service ? "service" : "item"),
      });
      navigate("/auth");
      return;
    }

    // Check if item is available
    if (!item.is_available) {
      toast({
        title: "Item not available",
        description: "This item is currently not available for booking",
        variant: "destructive",
      });
      return;
    }

    if (!dateRange.from) {
      toast({
        title: "Date selection required",
        description: "Please select a " + (item.is_service ? "booking date" : "rental period"),
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

    // Check if user is trying to book their own item
    if (user.id === item.user_id) {
      toast({
        title: "Cannot book own item",
        description: "You cannot book your own item",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Processing booking for item:', item.id);
      
      // Handle mock items or demo items
      if (item.id.includes('mock') || item.user_id.includes('mock') || !item.user_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.log('Demo item detected, creating demo booking');
        
        // Simulate a successful booking for demo purposes
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
          title: "Demo booking created!",
          description: "This is a demonstration booking. In a real scenario, the owner would be notified.",
        });

        // Redirect to dashboard
        navigate("/dashboard");
        return;
      }

      // For real items, proceed with database booking
      console.log('Creating real booking in database');
      
      // Double-check item availability
      const { data: currentItem, error: checkError } = await supabase
        .from("items")
        .select("is_available, user_id")
        .eq("id", item.id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking item availability:", checkError);
        // Don't fail completely, continue with booking
      } else if (currentItem && !currentItem.is_available) {
        toast({
          title: "Item no longer available",
          description: "This item has been made unavailable since you loaded the page",
          variant: "destructive",
        });
        return;
      }

      // Create booking
      const bookingData = {
        item_id: item.id,
        renter_id: user.id,
        owner_id: item.user_id,
        start_date: dateRange.from.toISOString(),
        end_date: dateRange.to ? dateRange.to.toISOString() : dateRange.from.toISOString(),
        total_price: totalPrice,
        status: "pending",
        time_slot: timeSlot || null,
      };

      console.log('Creating booking with data:', bookingData);

      const { data, error } = await supabase
        .from("bookings")
        .insert(bookingData)
        .select();

      if (error) {
        console.error("Booking creation error:", error);
        throw error;
      }

      console.log('Booking created successfully:', data);

      toast({
        title: "Request submitted!",
        description: item.is_service 
          ? "Your service booking request has been sent to the provider" 
          : "Your rental request has been sent to the owner",
      });

      // Redirect to bookings page
      navigate("/dashboard");

    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "Booking failed",
        description: error.message || "There was an error processing your booking request. Please try again.",
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

    if (!item?.id) {
      console.error('No item ID available');
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
        console.error("Error removing from wishlist:", error);
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
        console.error("Error adding to wishlist:", error);
        if (error.code === '23505') {
          // Already exists
          setIsInWishlist(true);
          toast({
            title: "Already in wishlist",
            description: "This item is already in your wishlist",
          });
        } else {
          toast({
            title: "Error",
            description: error.message || "Failed to add to wishlist",
            variant: "destructive",
          });
        }
      } finally {
        setIsAddingToWishlist(false);
      }
    }
  };

  const getTimeSlotOptions = () => {
    // Generate time slot options based on price unit
    if (item?.price_unit === 'hour') {
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

  // Early return if no item data
  if (!item) {
    return (
      <Card className="shadow-lg border-0 sticky top-6">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            Loading item details...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 sticky top-6">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-green-600">
                ${item.price || 0}
                <span className="text-lg text-gray-500 font-normal">/{item.price_unit || 'day'}</span>
              </p>
              {item.security_deposit && item.security_deposit > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  + ${item.security_deposit} security deposit
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              className={isInWishlist ? "text-red-500 border-red-200" : "text-gray-400"}
              onClick={handleAddToWishlist}
              disabled={isAddingToWishlist}
            >
              <Heart className={isInWishlist ? "fill-red-500" : ""} size={20} />
            </Button>
          </div>

          {/* Availability indicator */}
          {!item.is_available ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">This item is currently not available for booking.</p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">✅ Available for booking!</p>
            </div>
          )}

          {distance !== null && (
            <div className="flex items-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              <MapPin className="h-4 w-4 mr-2" />
              <span>Approximately {distance.toFixed(1)} miles away</span>
            </div>
          )}

          {item.is_available && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  {item.is_service ? "Select Date" : "Rental Period"}
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal h-12"
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
                    {item.is_service ? (
                      <Calendar
                        initialFocus
                        mode="single"
                        defaultMonth={new Date()}
                        selected={dateRange.from}
                        onSelect={(date) => {
                          setDateRange({
                            from: date,
                            to: date,
                          });
                        }}
                        disabled={{ before: new Date() }}
                      />
                    ) : (
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={new Date()}
                        selected={dateRange}
                        onSelect={(range: any) => {
                          setDateRange(range || { from: undefined, to: undefined });
                        }}
                        numberOfMonths={2}
                        disabled={{ before: new Date() }}
                      />
                    )}
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
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 hour">1 hour</SelectItem>
                      <SelectItem value="2 hours">2 hours</SelectItem>
                      <SelectItem value="3 hours">3 hours</SelectItem>
                      <SelectItem value="4 hours">4 hours</SelectItem>
                      <SelectItem value="half day (6 hours)">Half day (6 hours)</SelectItem>
                      <SelectItem value="full day (12 hours)">Full day (12 hours)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {item.availability_schedule && (
                <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="font-medium mb-1 text-blue-800">📅 Availability:</p>
                  <p className="text-blue-700">{item.availability_schedule}</p>
                </div>
              )}
            </div>
          )}

          {totalDays > 0 && totalPrice > 0 && (
            <div className="border-t border-b py-4 space-y-3 bg-gray-50 -mx-6 px-6">
              <div className="flex justify-between">
                <span className="text-gray-700">
                  ${item.price || 0} × {
                    item.price_unit === 'hour' && timeSlot 
                      ? timeSlot 
                      : `${totalDays} ${totalDays === 1 ? 
                          (item.is_service ? "session" : "day") : 
                          (item.is_service ? "sessions" : "days")}`
                  }
                </span>
                <span className="font-medium">${totalPrice}</span>
              </div>
              {!item.is_service && item.security_deposit && item.security_deposit > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Security deposit (refundable)</span>
                  <span>${item.security_deposit}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Service fee (5%)</span>
                <span>${(totalPrice * 0.05).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-3">
                <span>Total</span>
                <span className="text-green-600">
                  ${item.is_service 
                    ? (totalPrice + totalPrice * 0.05).toFixed(2)
                    : (totalPrice + totalPrice * 0.05 + (item.security_deposit || 0)).toFixed(2)
                  }
                </span>
              </div>
            </div>
          )}

          <Button
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="lg"
            onClick={handleRentNow}
            disabled={!item.is_available || !dateRange.from || (item.price_unit === 'hour' && !timeSlot) || isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                Processing...
              </div>
            ) : (
              item.is_service ? "Book Service" : "Request Rental"
            )}
          </Button>

          <div className="space-y-3 text-center">
            {item.cancellation_policy && (
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Shield className="h-4 w-4 mr-2" />
                <span>{item.cancellation_policy}</span>
              </div>
            )}
            
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-2" />
              <span>Usually responds within 12 hours</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemDetailCard;
