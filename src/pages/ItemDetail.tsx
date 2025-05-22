
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Star, MapPin, Heart, Share, Shield, User, MessageCircle, UserCheck } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { DateRange } from "react-day-picker";
import ReviewsList from "@/components/ReviewsList";
import ReviewForm from "@/components/ReviewForm";
import VerifiedBadge from "@/components/VerifiedBadge";

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [userReview, setUserReview] = useState<any>(null);
  const [userCanReview, setUserCanReview] = useState(false);
  const [userCompletedBooking, setUserCompletedBooking] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data: itemData, error: itemError } = await supabase
          .from('items')
          .select(`
            *,
            categories:category_id(name)
          `)
          .eq('id', id)
          .single();

        if (itemError) throw itemError;

        setItem(itemData);

        // Fetch owner profile
        if (itemData.user_id) {
          const { data: ownerData, error: ownerError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', itemData.user_id)
            .single();

          if (ownerError) throw ownerError;
          setOwner(ownerData);
        }

        // Check if logged-in user can review
        if (user) {
          // Check if user has a completed booking
          const { data: bookingData } = await supabase
            .from('bookings')
            .select('id')
            .eq('item_id', id)
            .eq('renter_id', user.id)
            .eq('status', 'completed')
            .order('end_date', { ascending: false })
            .limit(1);

          const canReview = bookingData && bookingData.length > 0;
          setUserCanReview(canReview);
          
          if (canReview) {
            setUserCompletedBooking(bookingData[0].id);
            
            // Check if user already left a review
            const { data: reviewData } = await supabase
              .from('reviews')
              .select('*')
              .eq('item_id', id)
              .eq('reviewer_id', user.id)
              .eq('booking_id', bookingData[0].id)
              .maybeSingle();
              
            setUserReview(reviewData);
          }
        }
      } catch (error) {
        console.error("Error fetching item:", error);
        toast({
          title: "Error",
          description: "Failed to load item details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id, user]);

  useEffect(() => {
    // Calculate price based on selected dates
    if (item && selectedDates.from && selectedDates.to) {
      const diffTime = Math.abs(selectedDates.to.getTime() - selectedDates.from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const price = diffDays * item.price;
      setTotalPrice(price);
    } else {
      setTotalPrice(0);
    }
  }, [selectedDates, item]);

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book this item",
      });
      navigate("/auth");
      return;
    }

    if (!selectedDates.from || !selectedDates.to) {
      toast({
        title: "Please select dates",
        description: "You need to select start and end dates for your booking",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          item_id: id,
          renter_id: user.id,
          owner_id: item.user_id,
          start_date: selectedDates.from.toISOString(),
          end_date: selectedDates.to.toISOString(),
          total_price: totalPrice,
          status: 'pending',
        })
        .select();

      if (error) throw error;

      toast({
        title: "Booking requested",
        description: "The owner will review your booking request soon",
      });

      // Navigate to dashboard
      navigate("/dashboard/bookings");
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleReviewSubmit = async ({ rating, comment }: { rating: number; comment: string }) => {
    if (!user || !id || !userCompletedBooking) return;
    
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          item_id: id,
          reviewer_id: user.id,
          reviewee_id: item.user_id,
          booking_id: userCompletedBooking,
          rating,
          comment,
        });
        
      if (error) throw error;
      
      // Refresh the review status
      const { data: reviewData } = await supabase
        .from('reviews')
        .select('*')
        .eq('item_id', id)
        .eq('reviewer_id', user.id)
        .eq('booking_id', userCompletedBooking)
        .single();
        
      setUserReview(reviewData);
      setUserCanReview(false);
      
      // Refresh the page to show the new review
      window.location.reload();
    } catch (error) {
      console.error("Error submitting review:", error);
      throw error;
    }
  };

  const addToWishlist = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add items to your wishlist",
      });
      navigate("/auth");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          item_id: id,
        });

      if (error) throw error;

      toast({
        title: "Added to wishlist",
        description: "This item has been added to your wishlist",
      });
    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: "Already in wishlist",
          description: "This item is already in your wishlist",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-96">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
            <span className="ml-2">Loading item details...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-2">Item Not Found</h2>
            <p className="text-gray-600 mb-8">The item you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/")}>Return to Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
                <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {item.location}
                  </div>
                  <span>•</span>
                  <Badge variant="secondary">{item.categories?.name}</Badge>
                  {item.is_verified && (
                    <>
                      <span>•</span>
                      <Badge className="bg-green-500 hover:bg-green-600 gap-1">
                        <UserCheck className="h-3 w-3" />
                        Verified
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              <div className="rounded-lg overflow-hidden mb-8">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-96 object-cover"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-200 flex items-center justify-center text-gray-400">
                    No image available
                  </div>
                )}
              </div>

              <Tabs defaultValue="description" className="mb-8">
                <TabsList>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="condition">Condition</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                <TabsContent value="description">
                  <div className="bg-white p-6 rounded-lg border">
                    <p className="whitespace-pre-wrap">{item.description}</p>
                  </div>
                </TabsContent>
                <TabsContent value="condition">
                  <div className="bg-white p-6 rounded-lg border">
                    <p>{item.condition}</p>
                  </div>
                </TabsContent>
                <TabsContent value="reviews">
                  <div className="bg-white p-6 rounded-lg border">
                    {userCanReview && !userReview && (
                      <div className="mb-6">
                        <h3 className="text-xl font-medium mb-4">Write a Review</h3>
                        <ReviewForm
                          itemId={id!}
                          bookingId={userCompletedBooking!}
                          revieweeId={item.user_id}
                          onReviewSubmit={handleReviewSubmit}
                        />
                        <Separator className="my-6" />
                      </div>
                    )}
                    <h3 className="text-xl font-medium mb-4">Customer Reviews</h3>
                    <ReviewsList itemId={id} />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-4 mb-8">
                <Button variant="outline" onClick={addToWishlist}>
                  <Heart className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border p-6 sticky top-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-2xl font-bold">${item.price} <span className="text-sm text-gray-500 font-normal">/{item.price_unit}</span></div>
                    {item.security_deposit > 0 && (
                      <div className="text-sm text-gray-600">
                        <span className="flex items-center">
                          <Shield className="h-4 w-4 mr-1" /> ${item.security_deposit} security deposit
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1 font-medium">4.9</span>
                    <span className="ml-1 text-gray-500">(18)</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Select Dates</label>
                  <div className="border rounded-lg p-3">
                    <Calendar
                      mode="range"
                      selected={selectedDates}
                      onSelect={(range) => setSelectedDates(range || { from: undefined, to: undefined })}
                      className="border-0 pointer-events-auto"
                      disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                      initialFocus
                    />
                  </div>
                </div>

                {totalPrice > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span>Subtotal</span>
                      <span>${totalPrice}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Service fee</span>
                      <span>${(totalPrice * 0.1).toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>${(totalPrice + totalPrice * 0.1).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <Button className="w-full" onClick={handleBooking}>
                  Book Now
                </Button>

                {owner && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <div className="text-sm font-medium mb-2">Owner</div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {owner.avatar_url ? (
                            <img
                              src={owner.avatar_url}
                              alt={owner.full_name || owner.username}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                          <div className="ml-3">
                            <div className="font-medium flex items-center">
                              {owner.full_name || owner.username}
                              {owner.is_verified && <VerifiedBadge size="sm" className="ml-1" />}
                            </div>
                            <div className="text-sm text-gray-500">
                              <div className="flex items-center">
                                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                <span className="ml-1">{owner.rating?.toFixed(1) || "New"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => {
                          if (!user) {
                            toast({
                              title: "Authentication required",
                              description: "Please sign in to message the owner",
                            });
                            navigate("/auth");
                            return;
                          }
                          // Navigate to messages component (will be implemented)
                          toast({
                            title: "Coming Soon",
                            description: "Messaging functionality will be available soon",
                          });
                        }}>
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ItemDetail;
