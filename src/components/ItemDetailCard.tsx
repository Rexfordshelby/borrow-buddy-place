
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { Calendar as CalendarIcon, Clock, Heart } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [totalDays, setTotalDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Check if item is in user's wishlist
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

  // Call checkWishlist when component mounts
  useState(() => {
    checkWishlist();
  });

  // Calculate total days and price when date range changes
  useState(() => {
    if (dateRange.from && dateRange.to) {
      const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setTotalDays(diffDays);
      setTotalPrice(Number(item.price) * diffDays);
    } else {
      setTotalDays(0);
      setTotalPrice(0);
    }
  });

  const handleRentNow = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to rent this item",
      });
      navigate("/auth");
      return;
    }

    if (!dateRange.from || !dateRange.to) {
      toast({
        title: "Date selection required",
        description: "Please select a rental period",
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
          end_date: dateRange.to.toISOString(),
          total_price: totalPrice,
          status: "pending",
        })
        .select();

      if (error) throw error;

      toast({
        title: "Request submitted",
        description: "Your rental request has been sent to the owner",
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

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Rental Period</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                          {format(dateRange.to, "MMM dd, yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM dd, yyyy")
                      )
                    ) : (
                      <span>Select date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={new Date()}
                    selected={dateRange}
                    onSelect={(range: any) => {
                      setDateRange(range);
                      if (range.from && range.to) {
                        const diffTime = Math.abs(range.to.getTime() - range.from.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                        setTotalDays(diffDays);
                        setTotalPrice(Number(item.price) * diffDays);
                      }
                    }}
                    numberOfMonths={2}
                    disabled={{ before: new Date() }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {totalDays > 0 && (
            <div className="border-t border-b py-4 space-y-2">
              <div className="flex justify-between">
                <span>
                  ${item.price} × {totalDays} {totalDays === 1 ? "day" : "days"}
                </span>
                <span>${totalPrice}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${totalPrice}</span>
              </div>
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handleRentNow}
            disabled={!dateRange.from || !dateRange.to || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Request to Rent"}
          </Button>

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
