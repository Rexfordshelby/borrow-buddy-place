
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ItemDetailCard from "@/components/ItemDetailCard";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, MapPin, UserCheck, Share, Heart } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ReviewsList from "@/components/ReviewsList";
import ReviewForm from "@/components/ReviewForm";

// Define the item type with categories
interface ItemWithCategory {
  id: string;
  title: string;
  description: string;
  price: number;
  price_unit: string;
  condition: string;
  location: string;
  image_url?: string;
  is_available: boolean;
  is_verified: boolean;
  is_service: boolean;
  user_id: string;
  category_id?: string;
  security_deposit?: number;
  availability_schedule?: string;
  cancellation_policy?: string;
  view_count?: number;
  created_at: string;
  updated_at: string;
  categories?: {
    name: string;
  };
}

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<ItemWithCategory | null>(null);
  const [owner, setOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState<any>(null);
  const [userCanReview, setUserCanReview] = useState(false);
  const [userCompletedBooking, setUserCompletedBooking] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) {
        console.log('No ID provided');
        setLoading(false);
        return;
      }

      console.log('Fetching item with ID:', id);

      try {
        // Fetch item with category information using a separate query for category
        const { data: itemData, error: itemError } = await supabase
          .from('items')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (itemError) {
          console.error("Item fetch error:", itemError);
          throw itemError;
        }

        if (!itemData) {
          console.log('Item not found in database');
          throw new Error("Item not found");
        }

        console.log('Item fetched from database:', itemData);

        // Fetch category separately if category_id exists
        let categoryData = null;
        if (itemData.category_id) {
          const { data: catData, error: catError } = await supabase
            .from('categories')
            .select('name')
            .eq('id', itemData.category_id)
            .maybeSingle();
          
          if (!catError && catData) {
            categoryData = catData;
          }
        }

        // Combine item data with category
        const itemWithCategory = {
          ...itemData,
          categories: categoryData
        } as ItemWithCategory;

        setItem(itemWithCategory);

        // Fetch owner profile separately
        if (itemData.user_id) {
          const { data: ownerData, error: ownerError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', itemData.user_id)
            .maybeSingle();

          if (ownerError) {
            console.error("Owner fetch error:", ownerError);
          }

          if (ownerData) {
            setOwner(ownerData);
          } else {
            // Create a basic owner object if profile doesn't exist
            setOwner({
              id: itemData.user_id,
              full_name: 'Item Owner',
              username: 'owner',
              rating: 0,
              review_count: 0
            });
          }
        }

        // Update view count
        try {
          await supabase
            .from('items')
            .update({ view_count: (itemData.view_count || 0) + 1 })
            .eq('id', itemData.id);
        } catch (viewError) {
          console.error('Error updating view count:', viewError);
        }

        // Check review eligibility if user is logged in
        if (user && itemData.id) {
          try {
            const { data: bookingData, error: bookingError } = await supabase
              .from('bookings')
              .select('id')
              .eq('item_id', itemData.id)
              .eq('renter_id', user.id)
              .eq('status', 'completed')
              .order('end_date', { ascending: false })
              .limit(1);

            if (!bookingError && bookingData && bookingData.length > 0) {
              setUserCanReview(true);
              setUserCompletedBooking(bookingData[0].id);
              
              const { data: reviewData, error: reviewError } = await supabase
                .from('reviews')
                .select('*')
                .eq('item_id', itemData.id)
                .eq('reviewer_id', user.id)
                .eq('booking_id', bookingData[0].id)
                .maybeSingle();

              if (!reviewError && reviewData) {
                setUserReview(reviewData);
              }
            }
          } catch (reviewCheckError) {
            console.error('Error checking review eligibility:', reviewCheckError);
          }
        }

      } catch (error) {
        console.error("Error in fetchItem:", error);
        toast({
          title: "Error",
          description: "Unable to load item details",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, user, navigate]);

  const handleReviewSubmit = async ({ rating, comment }: { rating: number; comment: string }) => {
    if (!user || !id || !userCompletedBooking) return;
    
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          item_id: id,
          reviewer_id: user.id,
          reviewee_id: item!.user_id,
          booking_id: userCompletedBooking,
          rating,
          comment,
        });
        
      if (error) throw error;
      
      const { data: reviewData } = await supabase
        .from('reviews')
        .select('*')
        .eq('item_id', id)
        .eq('reviewer_id', user.id)
        .eq('booking_id', userCompletedBooking)
        .single();
        
      setUserReview(reviewData);
      setUserCanReview(false);
      
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      throw error;
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
            <p className="text-gray-600 mb-8">The item you're looking for doesn't exist.</p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
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
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to results
          </Button>

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
                  <Badge variant="secondary">{item.categories?.name || 'General'}</Badge>
                  {item.is_verified && (
                    <>
                      <span>•</span>
                      <Badge className="bg-green-500 hover:bg-green-600 gap-1">
                        <UserCheck className="h-3 w-3" />
                        Verified
                      </Badge>
                    </>
                  )}
                  <span>•</span>
                  <Badge className={item.is_available ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}>
                    {item.is_available ? "Available" : "Not Available"}
                  </Badge>
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
                  <TabsTrigger value="condition">Details</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                <TabsContent value="description">
                  <div className="bg-white p-6 rounded-lg border">
                    <p className="whitespace-pre-wrap">{item.description}</p>
                  </div>
                </TabsContent>
                <TabsContent value="condition">
                  <div className="bg-white p-6 rounded-lg border space-y-4">
                    {!item.is_service && (
                      <div>
                        <span className="font-medium">Condition:</span>
                        <span className="ml-2 text-gray-700">{item.condition}</span>
                      </div>
                    )}
                    {item.availability_schedule && (
                      <div>
                        <span className="font-medium">Availability:</span>
                        <span className="ml-2 text-gray-700">{item.availability_schedule}</span>
                      </div>
                    )}
                    {item.cancellation_policy && (
                      <div>
                        <span className="font-medium">Cancellation Policy:</span>
                        <span className="ml-2 text-gray-700">{item.cancellation_policy}</span>
                      </div>
                    )}
                    {item.security_deposit && item.security_deposit > 0 && (
                      <div>
                        <span className="font-medium">Security Deposit:</span>
                        <span className="ml-2 text-gray-700">${item.security_deposit}</span>
                      </div>
                    )}
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
                <Button variant="outline">
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
              <ItemDetailCard item={item} owner={owner} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ItemDetail;
